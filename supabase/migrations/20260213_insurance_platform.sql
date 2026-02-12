-- =====================================================
-- Insurance Platform - Complete Schema
-- Modules: 6.1-6.3 - Claims, Reinsurance, Underwriting
-- =====================================================

-- =====================================================
-- CLAIMS ADJUDICATION
-- =====================================================

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    policy_id UUID NOT NULL,
    policyholder_id UUID NOT NULL,
    claim_type VARCHAR(50) CHECK (claim_type IN ('auto', 'property', 'health', 'life', 'liability')),
    incident_date DATE NOT NULL,
    reported_date DATE DEFAULT CURRENT_DATE,
    claim_amount DECIMAL(15,2),
    approved_amount DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
        'submitted',
        'under_review',
        'approved',
        'denied',
        'paid',
        'closed'
    )),
    adjuster_id UUID,
    denial_reason TEXT,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE claim_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,
    document_type VARCHAR(50),
    document_url VARCHAR(500),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REINSURANCE
-- =====================================================

CREATE TABLE reinsurance_treaties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    treaty_number VARCHAR(100) UNIQUE NOT NULL,
    reinsurer_name VARCHAR(255) NOT NULL,
    treaty_type VARCHAR(50) CHECK (treaty_type IN ('quota_share', 'excess_of_loss', 'facultative')),
    coverage_limit DECIMAL(18,2),
    retention_amount DECIMAL(18,2),
    commission_rate DECIMAL(5,2),
    effective_date DATE,
    expiration_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ceded_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    claim_id UUID NOT NULL REFERENCES insurance_claims(id),
    treaty_id UUID NOT NULL REFERENCES reinsurance_treaties(id),
    ceded_amount DECIMAL(15,2),
    recovery_amount DECIMAL(15,2),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UNDERWRITING WORKBENCH
-- =====================================================

CREATE TABLE underwriting_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    submission_number VARCHAR(100) UNIQUE NOT NULL,
    applicant_id UUID NOT NULL,
    product_type VARCHAR(50),
    coverage_amount DECIMAL(15,2),
    risk_score INT, -- 0-100
    premium_quote DECIMAL(12,2),
    underwriter_id UUID,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'under_review',
        'approved',
        'declined',
        'bound'
    )),
    decision_date DATE,
    decision_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE risk_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES underwriting_submissions(id),
    factor_name VARCHAR(100),
    factor_value VARCHAR(255),
    impact_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_claims_tenant ON insurance_claims(tenant_id, reported_date DESC);
CREATE INDEX idx_claims_status ON insurance_claims(status);
CREATE INDEX idx_treaties_tenant ON reinsurance_treaties(tenant_id);
CREATE INDEX idx_submissions_status ON underwriting_submissions(status);
