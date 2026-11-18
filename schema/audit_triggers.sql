-- ============================================================================
-- Trans-Track System Audit Triggers Script
-- Description: Creates the audit log table and automated triggers for tracking
--              changes to critical operational tables (waybills, voyages, users).
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    record_id VARCHAR(50),          -- ID of the affected record
    old_data JSONB,                 -- Previous state (for UPDATE/DELETE)
    new_data JSONB,                 -- New state (for INSERT/UPDATE)
    changed_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(changed_at);

-- Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    rec_id VARCHAR(50);
    current_user_id INT;
BEGIN
    -- Determine record ID based on table
    IF (TG_OP = 'DELETE') THEN
        IF TG_TABLE_NAME = 'waybills' THEN
            rec_id := OLD.waybill_id;
        ELSIF TG_TABLE_NAME = 'voyages' THEN
            rec_id := OLD.voyage_id::TEXT;
        ELSIF TG_TABLE_NAME = 'users' THEN
            rec_id := OLD.user_id::TEXT;
        END IF;
        
        INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, rec_id, to_jsonb(OLD), NULL);
        RETURN OLD;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        IF TG_TABLE_NAME = 'waybills' THEN
            rec_id := NEW.waybill_id;
        ELSIF TG_TABLE_NAME = 'voyages' THEN
            rec_id := NEW.voyage_id::TEXT;
        ELSIF TG_TABLE_NAME = 'users' THEN
            rec_id := NEW.user_id::TEXT;
        END IF;
        
        INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, rec_id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
        
    ELSIF (TG_OP = 'INSERT') THEN
        IF TG_TABLE_NAME = 'waybills' THEN
            rec_id := NEW.waybill_id;
        ELSIF TG_TABLE_NAME = 'voyages' THEN
            rec_id := NEW.voyage_id::TEXT;
        ELSIF TG_TABLE_NAME = 'users' THEN
            rec_id := NEW.user_id::TEXT;
        END IF;
        
        INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, rec_id, NULL, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach Triggers
DROP TRIGGER IF EXISTS audit_waybills_trigger ON waybills;
CREATE TRIGGER audit_waybills_trigger
    AFTER INSERT OR UPDATE OR DELETE ON waybills
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_voyages_trigger ON voyages;
CREATE TRIGGER audit_voyages_trigger
    AFTER INSERT OR UPDATE OR DELETE ON voyages
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();
