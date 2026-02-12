-- Migration: Enhance Expense Management Schema
-- Description: Add workflow fields, receipt tracking, and performance indexes
-- Version: 2026.02.12.001
-- Author: System
-- Date: 2026-02-12

-- ============================================================================
-- 1. Enhance expense_reports table with workflow and reimbursement fields
-- ============================================================================

-- Add workflow tracking fields
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(255);
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS approver_comments TEXT;
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(255);
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add reimbursement tracking fields
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS reimbursement_status VARCHAR(50) DEFAULT 'NOT_INITIATED';
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS ap_invoice_id VARCHAR(255);
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS reimbursement_date TIMESTAMP;

-- Add metadata fields
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS report_number VARCHAR(100);
ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255);

-- Add CHECK constraint for reimbursement_status
ALTER TABLE expense_reports DROP CONSTRAINT IF EXISTS expense_reports_reimbursement_status_check;
ALTER TABLE expense_reports ADD CONSTRAINT expense_reports_reimbursement_status_check 
  CHECK (reimbursement_status IN ('NOT_INITIATED', 'PENDING', 'PAID', 'FAILED'));

COMMENT ON COLUMN expense_reports.submitted_at IS 'Timestamp when report was submitted for approval';
COMMENT ON COLUMN expense_reports.approved_at IS 'Timestamp when report was approved';
COMMENT ON COLUMN expense_reports.reimbursement_status IS 'Current reimbursement status: NOT_INITIATED, PENDING, PAID, FAILED';
COMMENT ON COLUMN expense_reports.ap_invoice_id IS 'Reference to AP invoice created for reimbursement';

-- ============================================================================
-- 2. Enhance expense_lines table with mileage and receipt fields
-- ============================================================================

-- Add mileage tracking fields
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS mileage_distance DECIMAL(10, 2);
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS mileage_rate DECIMAL(10, 4);
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS mileage_origin VARCHAR(255);
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS mileage_destination VARCHAR(255);

-- Add receipt tracking field
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS receipt_id VARCHAR(255);
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS receipt_required BOOLEAN DEFAULT FALSE;

-- Add policy validation fields
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS policy_id VARCHAR(255);
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS policy_violation BOOLEAN DEFAULT FALSE;
ALTER TABLE expense_lines ADD COLUMN IF NOT EXISTS violation_reason TEXT;

COMMENT ON COLUMN expense_lines.mileage_distance IS 'Distance traveled in miles (for mileage expenses)';
COMMENT ON COLUMN expense_lines.mileage_rate IS 'Reimbursement rate per mile';
COMMENT ON COLUMN expense_lines.receipt_id IS 'Foreign key to expense_receipts table';
COMMENT ON COLUMN expense_lines.policy_violation IS 'Flag indicating if line violates expense policy';

-- ============================================================================
-- 3. Create expense_receipts table (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expense_receipts (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  report_id VARCHAR(255) NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
  line_id VARCHAR(255),  -- Optional: link to specific expense line
  
  -- File metadata
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- OCR data
  ocr_status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, PROCESSING, COMPLETED, FAILED
  ocr_data JSONB,  -- Store extracted data (merchant, amount, date, category)
  ocr_confidence DECIMAL(5, 4),  -- 0.0000 to 1.0000
  ocr_processed_at TIMESTAMP,
  
  -- Audit fields
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,  -- Soft delete
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add CHECK constraint for ocr_status
ALTER TABLE expense_receipts ADD CONSTRAINT expense_receipts_ocr_status_check 
  CHECK (ocr_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'));

-- Add indexes for receipt queries
CREATE INDEX IF NOT EXISTS idx_expense_receipts_report_id ON expense_receipts(report_id);
CREATE INDEX IF NOT EXISTS idx_expense_receipts_tenant_id ON expense_receipts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expense_receipts_line_id ON expense_receipts(line_id) WHERE line_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expense_receipts_ocr_status ON expense_receipts(ocr_status);

COMMENT ON TABLE expense_receipts IS 'Storage for expense receipt files and OCR extraction data';
COMMENT ON COLUMN expense_receipts.ocr_data IS 'JSON containing extracted fields: merchant, amount, date, category, etc.';
COMMENT ON COLUMN expense_receipts.ocr_confidence IS 'OCR confidence score between 0 and 1';

-- ============================================================================
-- 4. Create expense_approval_history table (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expense_approval_history (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  report_id VARCHAR(255) NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
  
  -- Action details
  action VARCHAR(50) NOT NULL,  -- SUBMITTED, APPROVED, REJECTED, RECALLED, REIMBURSEMENT_INITIATED
  actor_id VARCHAR(255) NOT NULL,
  actor_name VARCHAR(255),
  
  -- Metadata
  comments TEXT,
  metadata JSONB,  -- Additional context (e.g., policy violations, AP invoice details)
  
  -- Timing
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add CHECK constraint for action
ALTER TABLE expense_approval_history ADD CONSTRAINT expense_approval_history_action_check 
  CHECK (action IN ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RECALLED', 'REIMBURSEMENT_INITIATED', 'REIMBURSEMENT_COMPLETED'));

-- Add indexes for history queries
CREATE INDEX IF NOT EXISTS idx_expense_approval_history_report_id ON expense_approval_history(report_id);
CREATE INDEX IF NOT EXISTS idx_expense_approval_history_tenant_id ON expense_approval_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expense_approval_history_timestamp ON expense_approval_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_expense_approval_history_action ON expense_approval_history(action);

COMMENT ON TABLE expense_approval_history IS 'Immutable audit trail of all expense report workflow actions';
COMMENT ON COLUMN expense_approval_history.action IS 'Workflow action type';
COMMENT ON COLUMN expense_approval_history.metadata IS 'Additional context specific to the action';

-- ============================================================================
-- 5. Add performance indexes to existing tables
-- ============================================================================

-- Expense Reports indexes
CREATE INDEX IF NOT EXISTS idx_expense_reports_tenant_status ON expense_reports(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_expense_reports_employee_id ON expense_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_reports_created_at ON expense_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expense_reports_approved_at ON expense_reports(approved_at DESC) WHERE approved_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expense_reports_reimbursement_status ON expense_reports(reimbursement_status) WHERE reimbursement_status != 'NOT_INITIATED';
CREATE INDEX IF NOT EXISTS idx_expense_reports_ap_invoice_id ON expense_reports(ap_invoice_id) WHERE ap_invoice_id IS NOT NULL;

-- Expense Lines indexes
CREATE INDEX IF NOT EXISTS idx_expense_lines_report_id ON expense_lines(report_id);
CREATE INDEX IF NOT EXISTS idx_expense_lines_category ON expense_lines(category);
CREATE INDEX IF NOT EXISTS idx_expense_lines_expense_date ON expense_lines(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_lines_policy_violation ON expense_lines(policy_violation) WHERE policy_violation = TRUE;

-- Expense Policies indexes (if not already present)
CREATE INDEX IF NOT EXISTS idx_expense_policies_tenant_status ON expense_policies(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_expense_policies_category ON expense_policies(category);
CREATE INDEX IF NOT EXISTS idx_expense_policies_effective_from ON expense_policies(effective_from);

-- ============================================================================
-- 6. Add foreign key constraints (if not already present)
-- ============================================================================

-- Link expense_lines to expense_policies
ALTER TABLE expense_lines DROP CONSTRAINT IF EXISTS fk_expense_lines_policy;
ALTER TABLE expense_lines ADD CONSTRAINT fk_expense_lines_policy 
  FOREIGN KEY (policy_id) REFERENCES expense_policies(id) ON DELETE SET NULL;

-- Link expense_lines to expense_receipts
ALTER TABLE expense_lines DROP CONSTRAINT IF EXISTS fk_expense_lines_receipt;
ALTER TABLE expense_lines ADD CONSTRAINT fk_expense_lines_receipt 
  FOREIGN KEY (receipt_id) REFERENCES expense_receipts(id) ON DELETE SET NULL;

-- ============================================================================
-- 7. Create views for common queries
-- ============================================================================

-- View: Pending Approvals (reports submitted but not yet approved/rejected)
CREATE OR REPLACE VIEW v_pending_expense_approvals AS
SELECT 
  er.id,
  er.tenant_id,
  er.report_number,
  er.title,
  er.employee_id,
  er.employee_name,
  er.total_amount,
  er.currency,
  er.submitted_at,
  er.submitted_by,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - er.submitted_at)) / 86400 AS days_pending,
  COUNT(el.id) AS line_count,
  BOOL_OR(el.policy_violation) AS has_violations
FROM expense_reports er
LEFT JOIN expense_lines el ON er.id = el.report_id
WHERE er.status = 'SUBMITTED'
GROUP BY er.id;

COMMENT ON VIEW v_pending_expense_approvals IS 'All submitted expense reports pending approval with violation flags';

-- View: Reimbursement Queue (approved but not yet paid)
CREATE OR REPLACE VIEW v_expense_reimbursement_queue AS
SELECT 
  er.id,
  er.tenant_id,
  er.report_number,
  er.employee_id,
  er.employee_name,
  er.total_amount,
  er.currency,
  er.approved_at,
  er.reimbursement_status,
  er.ap_invoice_id,
  er.reimbursement_date,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - er.approved_at)) / 86400 AS days_since_approval
FROM expense_reports er
WHERE er.status = 'APPROVED' 
  AND (er.reimbursement_status IN ('NOT_INITIATED', 'PENDING') OR er.reimbursement_status IS NULL)
ORDER BY er.approved_at ASC;

COMMENT ON VIEW v_expense_reimbursement_queue IS 'Approved expenses awaiting reimbursement processing';

-- ============================================================================
-- 8. Data Migration: Populate report numbers for existing records
-- ============================================================================

-- Generate report numbers for existing reports without one
UPDATE expense_reports
SET report_number = 'EXP-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE report_number IS NULL;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Record migration execution
INSERT INTO schema_migrations (version, name, executed_at)
VALUES ('2026.02.12.001', 'enhance_expense_management_schema', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;
