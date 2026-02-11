-- Create AR Disputes Table
CREATE TABLE IF NOT EXISTS ar_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES ar_invoices(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES ar_customers(id) ON DELETE CASCADE,
    dispute_reason VARCHAR(255) NOT NULL,
    disputed_amount DECIMAL(15,2),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'Under Review', 'Resolved', 'Rejected')),
    admin_response TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create AR Dispute Attachments Table
CREATE TABLE IF NOT EXISTS ar_dispute_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID REFERENCES ar_disputes(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ar_disputes_customer ON ar_disputes(customer_id);
CREATE INDEX IF NOT EXISTS idx_ar_disputes_invoice ON ar_disputes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ar_disputes_status ON ar_disputes(status);
CREATE INDEX IF NOT EXISTS idx_ar_dispute_attachments_dispute ON ar_dispute_attachments(dispute_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ar_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ar_disputes_updated_at
    BEFORE UPDATE ON ar_disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_ar_disputes_updated_at();
