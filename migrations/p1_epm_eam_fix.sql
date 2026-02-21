-- P1-O: EPM+EAM supplemental — fix meter_readings collision
-- All prior tables in p1_epm_eam.sql were created successfully.
-- meter_readings already exists as a partitioned smart-meter table.
-- We rename our PM-specific reading/schedule tables.

CREATE TABLE IF NOT EXISTS pm_meter_readings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    meter_id        UUID NOT NULL REFERENCES meters(id),
    reading_value   NUMERIC(18,4) NOT NULL,
    delta           NUMERIC(18,4),
    read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by     TEXT
);
CREATE INDEX IF NOT EXISTS idx_pm_meter_readings ON pm_meter_readings(tenant_id, meter_id, read_at DESC);
