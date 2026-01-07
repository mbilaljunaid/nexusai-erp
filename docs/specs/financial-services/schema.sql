-- FINANCIAL SERVICES SCHEMA (Postgres)
-- Multi-tenant with RLS

CREATE SCHEMA IF NOT EXISTS financial_services;

-- CUSTOMERS (KYC Extended)
CREATE TABLE financial_services.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Ref to common.users
    kyc_status VARCHAR(20) DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    risk_score VARCHAR(10) CHECK (risk_score IN ('LOW', 'MEDIUM', 'HIGH')),
    pep_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACCOUNTS
CREATE TABLE financial_services.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES financial_services.customers(id),
    account_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) CHECK (type IN ('CHECKING', 'SAVINGS', 'LOAN', 'BROKERAGE')),
    currency CHAR(3) DEFAULT 'USD',
    balance DECIMAL(18, 4) DEFAULT 0, -- Ledger Balance
    available_balance DECIMAL(18, 4) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
    interest_rate DECIMAL(5, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS (Ledger)
CREATE TABLE financial_services.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES financial_services.accounts(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'FEE', 'INTEREST')),
    amount DECIMAL(18, 4) NOT NULL, -- Always positive, type determines sign
    balance_after DECIMAL(18, 4) NOT NULL,
    description VARCHAR(255),
    counterparty_account VARCHAR(50),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    metadata_json JSONB
);

-- LOANS
CREATE TABLE financial_services.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES financial_services.customers(id),
    account_id UUID NOT NULL REFERENCES financial_services.accounts(id), -- Linked account
    principal_amount DECIMAL(18, 2) NOT NULL,
    interest_rate DECIMAL(5, 4) NOT NULL,
    term_months INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDERWRITING', 'APPROVED', 'REJECTED', 'FUNDED', 'PAID_OFF', 'DEFAULT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE financial_services.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_accounts ON financial_services.accounts
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
