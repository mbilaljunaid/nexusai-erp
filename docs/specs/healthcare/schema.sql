-- HEALTHCARE SCHEMA (Postgres)
-- Multi-tenant pattern with Row Level Security (RLS)
-- HIPAA Requirement: PHI (First/Last Name) typically encrypted at app layer, but stored here as ciphertext or separated.

CREATE SCHEMA IF NOT EXISTS healthcare;

-- PATIENTS
CREATE TABLE healthcare.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    mrn VARCHAR(50) NOT NULL, -- Internal Medical Record Number
    first_name_enc TEXT NOT NULL, -- Encrypted
    last_name_enc TEXT NOT NULL, -- Encrypted
    dob DATE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O', 'U')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_tenant_mrn ON healthcare.patients(tenant_id, mrn);

-- PROVIDERS
CREATE TABLE healthcare.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    npi VARCHAR(20) NOT NULL, -- National Provider Identifier
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    specialty VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENCOUNTERS
CREATE TABLE healthcare.encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES healthcare.patients(id),
    provider_id UUID NOT NULL REFERENCES healthcare.providers(id),
    scheduled_time TIMESTAMPTZ NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS', 'DISCHARGED', 'BILLED', 'CANCELLED')),
    primary_diagnosis_code VARCHAR(10), -- ICD-10
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLAIMS
CREATE TABLE healthcare.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    encounter_id UUID NOT NULL REFERENCES healthcare.encounters(id),
    payer_id UUID NOT NULL, -- Refers to common.payers table (if exists) or external ID
    total_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'PAID', 'DENIED')),
    denial_reason TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLAIM LINE ITEMS
CREATE TABLE healthcare.claim_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES healthcare.claims(id),
    cpt_code VARCHAR(10) NOT NULL,
    charge_amount DECIMAL(18, 2) NOT NULL,
    units INT NOT NULL DEFAULT 1,
    modifiers TEXT[] -- Array of modifier strings
);

-- RLS
ALTER TABLE healthcare.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_patients ON healthcare.patients
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
