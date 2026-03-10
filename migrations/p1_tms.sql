-- P1-G: Transportation / TMS Migration
-- Gaps: TMS-OG-01 (EDI 204/990 load tender), TMS-OG-02 (EDI 214 carrier tracking), TMS-OG-03 (mode optimizer)

-- ─── Load Tenders ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS load_tenders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    tender_number   TEXT NOT NULL,
    reference_number TEXT,
    carrier_scac    TEXT NOT NULL,         -- Standard Carrier Alpha Code
    shipper_id      TEXT,
    origin_city     TEXT NOT NULL,
    origin_state    TEXT NOT NULL,
    origin_zip      TEXT,
    origin_country  TEXT DEFAULT 'US',
    dest_city       TEXT NOT NULL,
    dest_state      TEXT NOT NULL,
    dest_zip        TEXT,
    dest_country    TEXT DEFAULT 'US',
    pickup_date     DATE NOT NULL,
    delivery_date   DATE,
    equipment_type  TEXT NOT NULL DEFAULT 'TL',  -- 'TL'|'LTL'|'INTERMODAL'|'AIR'
    weight_lbs      NUMERIC(10,2),
    pallet_count    INTEGER,
    commodity       TEXT,
    freight_charge  NUMERIC(14,4),
    currency_code   TEXT DEFAULT 'USD',
    edi_204_sent    BOOLEAN DEFAULT FALSE,
    edi_990_received BOOLEAN DEFAULT FALSE,
    carrier_response TEXT,   -- 'Accept'|'Decline'|'Conditional'
    status          TEXT NOT NULL DEFAULT 'Draft',  -- 'Draft'|'Sent'|'Accepted'|'Declined'|'Conditional'|'Cancelled'
    sent_at         TIMESTAMPTZ,
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, tender_number)
);

CREATE TABLE IF NOT EXISTS tender_stops (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id       UUID NOT NULL REFERENCES load_tenders(id) ON DELETE CASCADE,
    stop_sequence   INTEGER NOT NULL,
    stop_type       TEXT NOT NULL DEFAULT 'PU',   -- 'PU'|'SO'|'D'
    location_name   TEXT,
    address1        TEXT,
    city            TEXT NOT NULL,
    state           TEXT NOT NULL,
    zip             TEXT,
    scheduled_date  DATE,
    scheduled_time  TIME,
    reference_id    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Carrier Shipment Tracking (EDI 214) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS shipment_trackings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    tender_id       UUID REFERENCES load_tenders(id),
    pro_number      TEXT,                  -- Carrier PRO#
    tracking_number TEXT,
    carrier_scac    TEXT NOT NULL,
    current_status  TEXT NOT NULL DEFAULT 'Tendered',
    -- 'Tendered'|'PickedUp'|'InTransit'|'OutForDelivery'|'Delivered'|'Exception'
    current_city    TEXT,
    current_state   TEXT,
    current_lat     NUMERIC(10,7),
    current_lng     NUMERIC(10,7),
    eta             TIMESTAMPTZ,
    origin_city     TEXT,
    dest_city       TEXT,
    last_event_at   TIMESTAMPTZ,
    edi_214_count   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracking_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id     UUID NOT NULL REFERENCES shipment_trackings(id) ON DELETE CASCADE,
    event_code      TEXT NOT NULL,    -- X3=PickedUp, X6=OutDelivery, D1=Delivered, AF=Exception
    event_description TEXT,
    event_city      TEXT,
    event_state     TEXT,
    event_time      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_status ON shipment_trackings(tenant_id, current_status);
CREATE INDEX IF NOT EXISTS idx_events_shipment ON tracking_events(shipment_id, event_time DESC);

-- ─── Mode Optimization ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mode_optimization_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    origin_zip      TEXT NOT NULL,
    dest_zip        TEXT NOT NULL,
    weight_lbs      NUMERIC(10,2),
    pallet_count    INTEGER,
    pickup_date     DATE,
    required_transit_days INTEGER,
    options_evaluated INTEGER DEFAULT 0,
    recommended_mode TEXT,   -- 'TL'|'LTL'|'PARCEL'|'INTERMODAL'|'AIR'
    recommended_carrier TEXT,
    estimated_cost  NUMERIC(14,4),
    estimated_transit_days INTEGER,
    run_by          TEXT DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS mode_options (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL REFERENCES mode_optimization_runs(id) ON DELETE CASCADE,
    mode            TEXT NOT NULL,
    carrier_scac    TEXT,
    estimated_cost  NUMERIC(14,4),
    transit_days    INTEGER,
    co2_kg          NUMERIC(10,2),
    score           NUMERIC(6,4),    -- composite score (cost * transit * carbon)
    recommended     BOOLEAN DEFAULT FALSE
);
