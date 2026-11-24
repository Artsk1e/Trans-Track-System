const pool = require('../db');

class AutoDeductionEngine {
  constructor(pool) {
    this.pool = pool;
  }

  // Deducts capacity from a voyage when a waybill is created or updated.
  // Runs inside a strict ACID transaction to prevent overbooking or race conditions.
  async deductCapacity(client, waybillId, voyageId, cargoSqft, bookedRooms) {
    const query = `
      UPDATE voyages 
      SET remaining_sqft = remaining_sqft - $1,
          remaining_rooms = remaining_rooms - $2
      WHERE voyage_id = $3 
        AND remaining_sqft >= $1 
        AND remaining_rooms >= $2
      RETURNING remaining_sqft, remaining_rooms
    `;
    const result = await client.query(query, [cargoSqft, bookedRooms, voyageId]);
    return result.rows[0];
  }

  // Restores capacity to a voyage if a waybill is cancelled or modified.
  async restoreCapacity(client, voyageId, cargoSqft, bookedRooms) {
    const query = `
      UPDATE voyages 
      SET remaining_sqft = remaining_sqft + $1,
          remaining_rooms = remaining_rooms + $2
      WHERE voyage_id = $3
      RETURNING remaining_sqft, remaining_rooms
    `;
    const result = await client.query(query, [cargoSqft, bookedRooms, voyageId]);
    return result.rows[0];
  }

  // Generates a sequential waybill ID: WB-YYYY-NNNNNN
  async generateWaybillId(client) {
    const year = new Date().getFullYear();
    const prefix = `WB-${year}-`;
    const res = await client.query(
      `SELECT COALESCE(MAX(waybill_id), $1) AS last FROM waybills WHERE waybill_id LIKE $2`,
      [prefix + '000000', prefix + '%']
    );
    const lastNum = parseInt(res.rows[0].last.slice(-6), 10) || 0;
    return prefix + String(lastNum + 1).padStart(6, '0');
  }

  // Orchestrates the booking of a waybill and automatic capacity deduction atomically.
  // Throws on failure; rolls back entirely (waybill insert + capacity deduction).
  async bookWaybill(waybillData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Resolve reference statuses
      const bookedStatus = await client.query(
        'SELECT status_id FROM waybill_statuses WHERE status_code = $1', ['BOOKED']
      );
      if (bookedStatus.rows.length === 0) {
        throw Object.assign(new Error('BOOKED status not found in reference data'), { statusCode: 500 });
      }
      const paymentStatus = await client.query(
        'SELECT payment_id FROM payment_statuses WHERE payment_code = $1',
        [waybillData.payment_status_code || 'UNPAID']
      );
      if (paymentStatus.rows.length === 0) {
        throw Object.assign(new Error('Invalid payment status code'), { statusCode: 400 });
      }

      const waybillId = await this.generateWaybillId(client);

      // 1. Insert the waybill
      const waybillQuery = `
        INSERT INTO waybills (
          waybill_id, voyage_id, shipper_id, consignee_id, current_status_id, 
          payment_status_id, cargo_description, quantity, total_weight_kg, 
          cargo_type, cargo_sqft, booked_rooms, freight_charge, vehicle_plate, 
          payment_mode, official_receipt_no
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;
      const waybillValues = [
        waybillId, waybillData.voyage_id, waybillData.shipper_id, 
        waybillData.consignee_id, bookedStatus.rows[0].status_id, paymentStatus.rows[0].payment_id,
        waybillData.cargo_description, waybillData.quantity || 1, waybillData.total_weight_kg,
        waybillData.cargo_type, waybillData.cargo_sqft, waybillData.booked_rooms || 0,
        waybillData.freight_charge, waybillData.vehicle_plate, waybillData.payment_mode,
        waybillData.official_receipt_no
      ];
      const waybillResult = await client.query(waybillQuery, waybillValues);
      const newWaybill = waybillResult.rows[0];

      // 2. Deduct voyage capacity atomically (row-locked by UPDATE, serializes concurrent bookings)
      const deduction = await this.deductCapacity(
        client,
        newWaybill.waybill_id,
        newWaybill.voyage_id,
        newWaybill.cargo_sqft,
        newWaybill.booked_rooms
      );

      if (!deduction) {
        throw Object.assign(
          new Error('Insufficient voyage capacity (sqft or rooms) for this booking.'),
          { statusCode: 409 }
        );
      }

      // 3. Log the initial BOOKED status
      await client.query(
        `INSERT INTO waybill_status_log (waybill_id, updated_by_user, new_status_id, location_name, remarks)
         VALUES ($1, $2, $3, $4, 'Waybill generated; capacity auto-deducted')`,
        [waybillId, waybillData.created_by_user, bookedStatus.rows[0].status_id, waybillData.location_name || 'Booking Desk']
      );

      await client.query('COMMIT');
      return {
        waybill: newWaybill,
        remaining_voyage_capacity: deduction
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Cancels a waybill: restores capacity + removes the record, atomically.
  // Only allowed while the waybill is still BOOKED (not yet gate-checked-in / loaded).
  async cancelWaybill(waybillId, userId) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const wb = await client.query(
        `SELECT w.waybill_id, w.voyage_id, w.cargo_sqft, w.booked_rooms, ws.status_code
         FROM waybills w
         JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
         WHERE w.waybill_id = $1
         FOR UPDATE`,
        [waybillId]
      );
      if (wb.rows.length === 0) {
        throw Object.assign(new Error('Waybill not found'), { statusCode: 404 });
      }
      const waybill = wb.rows[0];
      if (waybill.status_code !== 'BOOKED') {
        throw Object.assign(
          new Error(`Cannot cancel waybill in status ${waybill.status_code}. Only BOOKED waybills can be cancelled.`),
          { statusCode: 409 }
        );
      }

      // Restore capacity first, then delete (waybill_status_log & truck_arrivals cascade)
      const restored = await this.restoreCapacity(
        client, waybill.voyage_id, waybill.cargo_sqft, waybill.booked_rooms
      );

      await client.query('DELETE FROM waybills WHERE waybill_id = $1', [waybillId]);

      await client.query('COMMIT');
      return {
        cancelled: waybillId,
        remaining_voyage_capacity: restored
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new AutoDeductionEngine(pool);
