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

  // Orchestrates the booking of a waybill and automatic capacity deduction atomically.
  async bookWaybill(waybillData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

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
        waybillData.waybill_id, waybillData.voyage_id, waybillData.shipper_id, 
        waybillData.consignee_id, waybillData.current_status_id, waybillData.payment_status_id,
        waybillData.cargo_description, waybillData.quantity, waybillData.total_weight_kg,
        waybillData.cargo_type, waybillData.cargo_sqft, waybillData.booked_rooms,
        waybillData.freight_charge, waybillData.vehicle_plate, waybillData.payment_mode,
        waybillData.official_receipt_no
      ];
      const waybillResult = await client.query(waybillQuery, waybillValues);
      const newWaybill = waybillResult.rows[0];

      // 2. Deduct voyage capacity atomically
      const deduction = await this.deductCapacity(
        client,
        newWaybill.waybill_id,
        newWaybill.voyage_id,
        newWaybill.cargo_sqft,
        newWaybill.booked_rooms
      );

      if (!deduction) {
        throw new Error('Insufficient voyage capacity (sqft or rooms) for this booking.');
      }

      await client.query('COMMIT');
      return {
        success: true,
        waybill: newWaybill,
        remaining_voyage_capacity: deduction
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Booking transaction failed:', err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      client.release();
    }
  }
}

module.exports = new AutoDeductionEngine(pool);