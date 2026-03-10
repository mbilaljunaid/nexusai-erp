-- P1-H: WMS Core Migration
-- Gaps: WMS-OG-01 (Directed Putaway), WMS-OG-02 (Yard Management), WMS-OG-03 (Carrier Manifest / ZPL Labels)

-- ─── Warehouse Zones & Bin Locations ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wh_zones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    warehouse_id    TEXT NOT NULL,
    zone_code       TEXT NOT NULL,
    zone_name       TEXT NOT NULL,
    zone_type       TEXT NOT NULL DEFAULT 'BULK',
    -- 'BULK'|'PICK'|'RESERVE'|'QUALITY'|'STAGING'|'DOCK'|'COLD'|'HAZMAT'
    temp_min_c      NUMERIC(5,2),
    temp_max_c      NUMERIC(5,2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, warehouse_id, zone_code)
);

CREATE TABLE IF NOT EXISTS wh_bin_locations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    warehouse_id    TEXT NOT NULL,
    zone_id         UUID NOT NULL REFERENCES wh_zones(id),
    bin_code        TEXT NOT NULL,      -- e.g. "A-01-03-B" (aisle-row-col-level)
    bin_type        TEXT NOT NULL DEFAULT 'STANDARD', -- 'STANDARD'|'BULK'|'FLOW'|'PALLET'|'MEZZANINE'
    max_weight_kg   NUMERIC(10,2),
    max_volume_m3   NUMERIC(10,4),
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    lpn_count       INTEGER DEFAULT 0,  -- license-plate count currently occupying
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, warehouse_id, bin_code)
);

-- ─── Putaway Rules ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS putaway_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    warehouse_id    TEXT NOT NULL,
    priority        INTEGER NOT NULL DEFAULT 50,
    rule_name       TEXT NOT NULL,
    match_item_category TEXT,          -- item family/class to match
    match_temp_class TEXT,             -- 'AMBIENT'|'COLD'|'FROZEN'
    match_hazmat    BOOLEAN,
    preferred_zone_id UUID REFERENCES wh_zones(id),
    preferred_bin_type TEXT,
    overflow_zone_id  UUID REFERENCES wh_zones(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS putaway_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    warehouse_id    TEXT NOT NULL,
    receipt_id      TEXT,
    lpn             TEXT NOT NULL,             -- license-plate number
    item_id         TEXT NOT NULL,
    qty             NUMERIC(14,4) NOT NULL,
    temp_class      TEXT DEFAULT 'AMBIENT',
    is_hazmat       BOOLEAN DEFAULT FALSE,
    item_category   TEXT,
    rule_id         UUID REFERENCES putaway_rules(id),
    assigned_bin_id UUID REFERENCES wh_bin_locations(id),
    status          TEXT NOT NULL DEFAULT 'Pending',
    -- 'Pending'|'Assigned'|'InProgress'|'Complete'|'Exception'
    operator_id     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- ─── Yard Management ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS yard_docks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    warehouse_id    TEXT NOT NULL,
    dock_number     TEXT NOT NULL,
    dock_type       TEXT NOT NULL DEFAULT 'INBOUND', -- 'INBOUND'|'OUTBOUND'|'BOTH'
    is_occupied     BOOLEAN NOT NULL DEFAULT FALSE,
    current_carrier TEXT,
    current_trailer TEXT,
    appointment_start TIMESTAMPTZ,
    appointment_end   TIMESTAMPTZ,
    notes           TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, warehouse_id, dock_number)
);

CREATE TABLE IF NOT EXISTS yard_appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    warehouse_id    TEXT NOT NULL,
    dock_id         UUID NOT NULL REFERENCES yard_docks(id),
    carrier_scac    TEXT NOT NULL,
    trailer_number  TEXT,
    direction       TEXT NOT NULL DEFAULT 'INBOUND', -- 'INBOUND'|'OUTBOUND'
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end   TIMESTAMPTZ NOT NULL,
    actual_arrival  TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'Scheduled',
    -- 'Scheduled'|'CheckedIn'|'Loading'|'Unloading'|'Departed'|'NoShow'
    purchase_order_ref TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yard_appt_dock ON yard_appointments(dock_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_putaway_status ON putaway_tasks(tenant_id, status);

-- ─── Carrier Manifest & ZPL Labels ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carrier_manifests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    manifest_number TEXT NOT NULL,
    carrier_scac    TEXT NOT NULL,
    ship_date       DATE NOT NULL,
    origin_warehouse TEXT NOT NULL,
    total_packages  INTEGER DEFAULT 0,
    total_weight_kg NUMERIC(10,2),
    status          TEXT NOT NULL DEFAULT 'Open', -- 'Open'|'Closed'|'Tendered'|'InTransit'
    closed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, manifest_number)
);

CREATE TABLE IF NOT EXISTS manifest_packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id     UUID NOT NULL REFERENCES carrier_manifests(id) ON DELETE CASCADE,
    tracking_number TEXT NOT NULL,
    lpn             TEXT,
    order_id        TEXT,
    customer_name   TEXT,
    ship_to_address TEXT,
    ship_to_city    TEXT,
    ship_to_state   TEXT,
    ship_to_zip     TEXT,
    ship_to_country TEXT DEFAULT 'US',
    weight_kg       NUMERIC(8,4),
    dims_l_cm       NUMERIC(8,2),
    dims_w_cm       NUMERIC(8,2),
    dims_h_cm       NUMERIC(8,2),
    service_code    TEXT DEFAULT 'GROUND', -- 'GROUND'|'EXPRESS'|'OVERNIGHT'|'LTL'
    label_zpl       TEXT,       -- ZPL label payload
    label_printed   BOOLEAN DEFAULT FALSE,
    label_printed_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manifest_pkg ON manifest_packages(manifest_id);
