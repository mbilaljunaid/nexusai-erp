-- P1-I: Supplier Portal Migration
-- Gaps: SUP-OG-01 (Contract Obligations), SUP-OG-02 (Supplier Certification), SUP-OG-03 (Supplier Qualification)

-- ─── Contract Obligations ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_obligations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    contract_id         TEXT NOT NULL,            -- reference to CLM contract
    supplier_id         TEXT NOT NULL,
    obligation_type     TEXT NOT NULL DEFAULT 'DELIVERY',
    -- 'DELIVERY'|'REPORTING'|'COMPLIANCE'|'INSURANCE'|'PAYMENT'|'SLA'|'AUDIT'
    title               TEXT NOT NULL,
    description         TEXT,
    due_date            DATE,
    recurrence          TEXT,                     -- 'NONE'|'MONTHLY'|'QUARTERLY'|'ANNUAL'
    status              TEXT NOT NULL DEFAULT 'Pending',
    -- 'Pending'|'InReview'|'Met'|'Overdue'|'Waived'
    evidence_url        TEXT,
    reviewed_by         TEXT,
    reviewed_at         TIMESTAMPTZ,
    escalation_level    INTEGER DEFAULT 0,        -- 0=none,1=warn,2=manager,3=legal
    penalty_amount      NUMERIC(18,4),
    currency_code       TEXT DEFAULT 'USD',
    notes               TEXT,
    tenant_visible      BOOLEAN DEFAULT TRUE,     -- visible to supplier portal
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_co_supplier ON contract_obligations(tenant_id, supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_co_due ON contract_obligations(tenant_id, due_date) WHERE status NOT IN ('Met','Waived');

-- ─── Supplier Certifications ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_certifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    supplier_id         TEXT NOT NULL,
    cert_type           TEXT NOT NULL,
    -- 'ISO9001'|'ISO14001'|'ISO27001'|'SOC2'|'GDPR'|'SMETA'|'FSSC22000'|'CUSTOM'
    cert_number         TEXT,
    issuing_body        TEXT,
    issue_date          DATE,
    expiry_date         DATE,
    status              TEXT NOT NULL DEFAULT 'Active',
    -- 'Active'|'Expired'|'Revoked'|'Pending'
    document_url        TEXT,
    verified_by         TEXT,
    verified_at         TIMESTAMPTZ,
    auto_renew_alert    BOOLEAN DEFAULT TRUE,
    alert_days_before   INTEGER DEFAULT 30,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_supplier ON supplier_certifications(tenant_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_cert_expiry ON supplier_certifications(tenant_id, expiry_date) WHERE status = 'Active';

-- ─── Supplier Qualification ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_qualification_templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    template_name       TEXT NOT NULL,
    category            TEXT,                     -- 'GOODS'|'SERVICES'|'CONSTRUCTION'|'IT'
    sections            JSONB NOT NULL DEFAULT '[]',
    -- [{ sectionTitle, weight, questions: [{q, type, required}] }]
    passing_score       NUMERIC(5,2) DEFAULT 70,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_qualifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    supplier_id         TEXT NOT NULL,
    template_id         UUID NOT NULL REFERENCES supplier_qualification_templates(id),
    status              TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Submitted'|'UnderReview'|'Approved'|'Rejected'|'Expired'
    submitted_at        TIMESTAMPTZ,
    reviewed_at         TIMESTAMPTZ,
    reviewer_id         TEXT,
    score               NUMERIC(5,2),
    risk_tier           TEXT,                     -- 'Low'|'Medium'|'High'|'Critical'
    responses           JSONB NOT NULL DEFAULT '{}',
    reviewer_notes      TEXT,
    valid_until         DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qualification_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qualification_id    UUID NOT NULL REFERENCES supplier_qualifications(id) ON DELETE CASCADE,
    document_name       TEXT NOT NULL,
    document_type       TEXT,
    document_url        TEXT NOT NULL,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qual_supplier ON supplier_qualifications(tenant_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_qual_status ON supplier_qualifications(tenant_id, status);
