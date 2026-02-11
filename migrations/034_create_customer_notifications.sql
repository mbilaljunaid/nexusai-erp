-- Create Customer Notifications Table
CREATE TABLE IF NOT EXISTS customer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES ar_customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_invoice', 'payment_received', 'dispute_update', 'statement_ready', 'overdue_reminder')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    reference_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_notifications_customer ON customer_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_read ON customer_notifications(read);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_created ON customer_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_type ON customer_notifications(type);
