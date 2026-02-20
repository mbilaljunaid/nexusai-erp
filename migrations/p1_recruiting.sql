-- P1-K: Recruiting Migration
-- Gaps: REC-OG-01 (EEO Compliance), REC-OG-02 (E-Signature), REC-OG-03 (Background Checks)

-- ─── EEO Compliance ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS eeo_applicant_data (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    applicant_id        TEXT NOT NULL,
    job_requisition_id  TEXT,
    gender              TEXT,        -- 'M'|'F'|'X'|'DECLINED'
    race_ethnicity      TEXT,        -- 'WHITE'|'BLACK'|'HISPANIC'|'ASIAN'|'NATIVE'|'TWO_MORE'|'DECLINED'
    veteran_status      TEXT,        -- 'VETERAN'|'NON_VETERAN'|'DECLINED'
    disability_status   TEXT,        -- 'YES'|'NO'|'DECLINED'
    age_band            TEXT,        -- '18-24'|'25-34'|'35-44'|'45-54'|'55+'|'DECLINED'
    application_stage   TEXT NOT NULL DEFAULT 'Applied',
    -- Applied→Screened→Interview→Offer→Hired→Rejected
    outcome             TEXT,        -- 'Hired'|'Rejected'|'Withdrawn'|null (still active)
    self_reported       BOOLEAN DEFAULT TRUE,
    report_period       TEXT,        -- e.g. '2025-Q1'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eeo_tenant ON eeo_applicant_data(tenant_id, job_requisition_id);
CREATE INDEX IF NOT EXISTS idx_eeo_period ON eeo_applicant_data(tenant_id, report_period);

-- ─── E-Signature ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS esignature_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    document_type       TEXT NOT NULL DEFAULT 'OFFER_LETTER',
    -- 'OFFER_LETTER'|'NDA'|'EMPLOYMENT_AGREEMENT'|'POLICY_ACK'|'BACKGROUND_CONSENT'
    applicant_id        TEXT NOT NULL,
    candidate_name      TEXT,
    candidate_email     TEXT,
    document_url        TEXT,       -- URL to PDF
    html_content        TEXT,       -- Rich-text version for inline signing
    status              TEXT NOT NULL DEFAULT 'Pending',
    -- 'Pending'|'Sent'|'Opened'|'Signed'|'Declined'|'Expired'
    sent_at             TIMESTAMPTZ,
    opened_at           TIMESTAMPTZ,
    signed_at           TIMESTAMPTZ,
    declined_at         TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    signature_data      TEXT,       -- base64 SVG/PNG of captured signature
    ip_address          TEXT,
    user_agent          TEXT,
    audit_trail         JSONB DEFAULT '[]',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esig_tenant ON esignature_documents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_esig_applicant ON esignature_documents(tenant_id, applicant_id);

-- ─── Background Checks ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS background_check_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    applicant_id        TEXT NOT NULL,
    candidate_name      TEXT,
    candidate_email     TEXT,
    package_type        TEXT NOT NULL DEFAULT 'STANDARD',
    -- 'BASIC'|'STANDARD'|'COMPREHENSIVE'|'EXECUTIVE'|'INTERNATIONAL'
    status              TEXT NOT NULL DEFAULT 'Initiated',
    -- 'Initiated'|'Consent_Pending'|'In_Progress'|'Complete'|'Adverse_Action'|'Cancelled'
    consent_signed_at   TIMESTAMPTZ,
    ordered_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    report_url          TEXT,
    adjudication        TEXT,       -- 'Clear'|'Consider'|'Adverse' — from provider
    adjudication_notes  TEXT,
    provider            TEXT DEFAULT 'Internal',
    provider_reference  TEXT,
    hold_start_date     DATE,       -- for adverse action: pre-adverse hold period
    final_decision      TEXT,       -- 'Proceed'|'Withdraw'|'Conditional'
    decided_by          TEXT,
    decided_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS background_check_components (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES background_check_orders(id),
    component_type      TEXT NOT NULL,
    -- 'CRIMINAL'|'EMPLOYMENT'|'EDUCATION'|'CREDIT'|'MVR'|'DRUG'|'SANCTIONS'|'SOCIAL_MEDIA'
    status              TEXT NOT NULL DEFAULT 'Pending',
    result              TEXT,       -- 'Clear'|'Hit'|'Unable_To_Verify'|'N/A'
    details             TEXT,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bgc_tenant ON background_check_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_bgc_applicant ON background_check_orders(tenant_id, applicant_id);
