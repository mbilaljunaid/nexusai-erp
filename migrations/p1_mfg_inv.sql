-- P1-M: Manufacturing & Inventory Migration
-- MFG-OG-01: Engineering Change Orders (ECO)
-- MFG-OG-02: Outside Processing
-- MFG-OG-03: Capacity Planning
-- MFG-OG-04: WIP Costing
-- MFG-OG-05: Lot Genealogy
-- MFG-OG-06: Quality Hold
-- MFG-OG-07: Physical Inventory
-- MFG-OG-08: Consignment

-- ─── ECO: Engineering Change Orders ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS eco_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    eco_number          TEXT NOT NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    change_type         TEXT NOT NULL DEFAULT 'DESIGN',
    -- 'DESIGN'|'PROCESS'|'MATERIAL'|'TOOLING'|'SOFTWARE'|'SAFETY'
    priority            TEXT NOT NULL DEFAULT 'MEDIUM',
    -- 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'
    status              TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Under_Review'|'Approved'|'Released'|'Implemented'|'Cancelled'
    requested_by        TEXT,
    reviewed_by         TEXT,
    approved_by         TEXT,
    released_by         TEXT,
    effective_date      DATE,
    affected_items      JSONB DEFAULT '[]',  -- [{ itemNumber, revision }]
    affected_boms       JSONB DEFAULT '[]',  -- [{ bomId, revision }]
    approval_comments   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_eco_tenant ON eco_orders(tenant_id, status);

-- ─── Outside Processing ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outside_processing_ops (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    work_order_id       TEXT NOT NULL,
    operation_sequence  INTEGER NOT NULL DEFAULT 10,
    operation_name      TEXT NOT NULL,
    supplier_id         TEXT,
    supplier_name       TEXT,
    service_type        TEXT,    -- 'PLATING'|'HEAT_TREAT'|'COATING'|'TESTING'|'ASSEMBLY'|'OTHER'
    qty_sent            NUMERIC(18,4),
    qty_received        NUMERIC(18,4) DEFAULT 0,
    unit_of_measure     TEXT DEFAULT 'EA',
    planned_cost        NUMERIC(18,2),
    actual_cost         NUMERIC(18,2),
    sent_date           DATE,
    expected_return     DATE,
    actual_return       DATE,
    status              TEXT NOT NULL DEFAULT 'Pending',
    -- 'Pending'|'Sent'|'In_Process'|'Returned'|'Inspected'|'Closed'
    quality_result      TEXT,   -- 'Pass'|'Fail'|'Partial'
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_osp_tenant ON outside_processing_ops(tenant_id, status);

-- ─── Capacity Planning ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS work_center_capacity (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    work_center_id      TEXT NOT NULL,
    work_center_name    TEXT,
    capacity_date       DATE NOT NULL,
    shift               TEXT DEFAULT 'DAY',       -- 'DAY'|'NIGHT'|'SWING'|'ALL'
    available_hours     NUMERIC(8,2) NOT NULL,
    planned_hours       NUMERIC(8,2) DEFAULT 0,
    actual_hours        NUMERIC(8,2) DEFAULT 0,
    efficiency_pct      NUMERIC(5,2) DEFAULT 100,
    -- Derived: utilization = actual/available
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, work_center_id, capacity_date, shift)
);
CREATE INDEX IF NOT EXISTS idx_capacity_tenant ON work_center_capacity(tenant_id, capacity_date);

-- ─── WIP Costing ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wip_cost_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    work_order_id       TEXT NOT NULL,
    transaction_type    TEXT NOT NULL,
    -- 'MATERIAL_ISSUE'|'LABOR_CHARGE'|'OVERHEAD'|'OUTSIDE_PROC'|'SCRAP'|'REVERSAL'
    cost_element        TEXT,    -- 'DIRECT_MATERIAL'|'DIRECT_LABOR'|'FIXED_OVERHEAD'|'VARIABLE_OVERHEAD'
    quantity            NUMERIC(18,4),
    unit_cost           NUMERIC(18,6),
    total_cost          NUMERIC(18,2) NOT NULL,
    gl_account          TEXT,
    reference           TEXT,
    posted_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reversed            BOOLEAN DEFAULT FALSE,
    reversal_of         UUID REFERENCES wip_cost_transactions(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wip_tenant ON wip_cost_transactions(tenant_id, work_order_id);

-- ─── Lot Genealogy ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lot_genealogy (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    lot_number          TEXT NOT NULL,
    item_number         TEXT NOT NULL,
    item_description    TEXT,
    lot_type            TEXT NOT NULL DEFAULT 'PRODUCTION',
    -- 'PRODUCTION'|'PURCHASED'|'REWORK'|'CONSIGNMENT'
    quantity            NUMERIC(18,4) NOT NULL,
    unit_of_measure     TEXT DEFAULT 'EA',
    status              TEXT NOT NULL DEFAULT 'Active',
    -- 'Active'|'Consumed'|'Quarantine'|'Scrapped'|'Expired'
    expiry_date         DATE,
    supplier_lot        TEXT,           -- original supplier lot
    work_order_id       TEXT,           -- production work order
    parent_lots         JSONB DEFAULT '[]',   -- [{ lotNumber, itemNumber }]
    child_lots          JSONB DEFAULT '[]',   -- [{ lotNumber, itemNumber }]
    trace_events        JSONB DEFAULT '[]',   -- [{event, at, by, qty, location}]
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lot_tenant ON lot_genealogy(tenant_id, lot_number);
CREATE INDEX IF NOT EXISTS idx_lot_item   ON lot_genealogy(tenant_id, item_number);

-- ─── Quality Hold ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quality_holds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hold_number         TEXT NOT NULL,
    hold_type           TEXT NOT NULL DEFAULT 'MATERIAL',
    -- 'MATERIAL'|'LOT'|'SUPPLIER'|'PROCESS'|'EQUIPMENT'|'CUSTOMER_COMPLAINT'
    status              TEXT NOT NULL DEFAULT 'Active',
    -- 'Active'|'Under_Disposition'|'Released'|'Scrapped'|'Rework'
    severity            TEXT NOT NULL DEFAULT 'MINOR',
    -- 'CRITICAL'|'MAJOR'|'MINOR'
    affected_items      JSONB DEFAULT '[]',   -- [{itemNumber, lot, qty, location}]
    root_cause          TEXT,
    disposition         TEXT,    -- 'USE_AS_IS'|'REWORK'|'SCRAP'|'RETURN_TO_SUPPLIER'|'CONCESSION'
    initiated_by        TEXT,
    reviewed_by         TEXT,
    approved_by         TEXT,
    initiated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ,
    disposition_at      TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qhold_tenant ON quality_holds(tenant_id, status, severity);

-- ─── Physical Inventory ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS physical_inventory_cycles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    cycle_name          TEXT NOT NULL,
    cycle_type          TEXT NOT NULL DEFAULT 'CYCLE_COUNT',
    -- 'CYCLE_COUNT'|'FULL_WALL_TO_WALL'|'ABC_CYCLE'
    status              TEXT NOT NULL DEFAULT 'Planned',
    -- 'Planned'|'Counting'|'Under_Review'|'Approved'|'Posted'|'Cancelled'
    count_date          DATE NOT NULL,
    location_filter     TEXT,
    item_filter         TEXT,
    approved_by         TEXT,
    approved_at         TIMESTAMPTZ,
    posted_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS physical_inventory_lines (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id            UUID NOT NULL REFERENCES physical_inventory_cycles(id),
    tenant_id           UUID NOT NULL,
    item_number         TEXT NOT NULL,
    location            TEXT,
    lot_number          TEXT,
    book_quantity       NUMERIC(18,4) NOT NULL DEFAULT 0,
    count_quantity      NUMERIC(18,4),
    variance_quantity   NUMERIC(18,4) GENERATED ALWAYS AS (count_quantity - book_quantity) STORED,
    unit_cost           NUMERIC(18,6),
    variance_value      NUMERIC(18,2),
    count_status        TEXT DEFAULT 'Pending',  -- 'Pending'|'Counted'|'Recounted'|'Approved'|'Posted'
    counted_by          TEXT,
    counted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_piline_cycle ON physical_inventory_lines(cycle_id, count_status);
CREATE INDEX IF NOT EXISTS idx_piline_tenant ON physical_inventory_lines(tenant_id, item_number);

-- ─── Consignment ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consignment_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    consignment_type    TEXT NOT NULL DEFAULT 'CUSTOMER',  -- 'CUSTOMER'|'SUPPLIER'
    partner_id          TEXT NOT NULL,
    partner_name        TEXT,
    item_number         TEXT NOT NULL,
    item_description    TEXT,
    location            TEXT,
    consigned_qty       NUMERIC(18,4) NOT NULL DEFAULT 0,
    consumed_qty        NUMERIC(18,4) NOT NULL DEFAULT 0,
    on_hand_qty         NUMERIC(18,4) GENERATED ALWAYS AS (consigned_qty - consumed_qty) STORED,
    unit_cost           NUMERIC(18,6),
    replenishment_point NUMERIC(18,4),
    max_qty             NUMERIC(18,4),
    status              TEXT NOT NULL DEFAULT 'Active',
    -- 'Active'|'Replenishment_Needed'|'Suspended'|'Closed'
    last_activity_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consign_tenant ON consignment_records(tenant_id, consignment_type, status);
