const pool = require('../db');
const Voyage = require('../models/Voyage');
const Waybill = require('../models/Waybill');
const WaybillStatusLog = require('../models/WaybillStatusLog');

// Orchestrates waybill booking + capacity deduction as ONE atomic transaction.
// The domain behavior lives in Voyage/Waybill; this engine composes it.
class AutoDeductionEngine {
  constructor(pool) {
    this.pool = pool;
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

      const voyage = await Voyage.find(waybillData.voyage_id);
      if (!voyage) {
        throw Object.assign(new Error('Voyage not found'), { statusCode: 404 });
      }

      // Domain rule: compute freight when not provided (Waybill.computeFreight)
      const freightCharge = waybillData.freight_charge ?? new Waybill({
        cargo_type: waybillData.cargo_type,
        cargo_sqft: waybillData.cargo_sqft,
        booked_rooms: waybillData.booked_rooms || 0,
        quantity: waybillData.quantity || 1
      }).computeFreight();

      // 1. Insert the waybill (Waybill.create accepts the transaction client)
      const newWaybill = await Waybill.create(client, {
        ...waybillData,
        freight_charge: freightCharge,
        current_status_id: bookedStatus.rows[0].status_id,
        payment_status_id: paymentStatus.rows[0].payment_id
      });

      // 2. Deduct voyage capacity atomically (Voyage.deductCapacity; row-locked, serializes bookings)
      const deduction = await voyage.deductCapacity(
        client,
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
      await WaybillStatusLog.create(client, {
        waybill_id: newWaybill.waybill_id,
        updated_by_user: waybillData.created_by_user,
        new_status_id: bookedStatus.rows[0].status_id,
        location_name: waybillData.location_name || 'Booking Desk',
        remarks: 'Waybill generated; capacity auto-deducted'
      });

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
  async cancelWaybill(waybillId) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const waybill = await Waybill.findWithStatus(waybillId);
      if (!waybill) {
        throw Object.assign(new Error('Waybill not found'), { statusCode: 404 });
      }
      if (waybill.status_code !== 'BOOKED') {
        throw Object.assign(
          new Error(`Cannot cancel waybill in status ${waybill.status_code}. Only BOOKED waybills can be cancelled.`),
          { statusCode: 409 }
        );
      }

      const voyage = await Voyage.find(waybill.voyage_id);

      // Restore capacity first, then delete (waybill_status_log & truck_arrivals cascade)
      const restored = await voyage.restoreCapacity(
        client, waybill.cargo_sqft, waybill.booked_rooms
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
