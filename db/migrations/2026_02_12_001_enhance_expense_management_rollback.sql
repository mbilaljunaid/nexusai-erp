-- Rollback Migration: Enhance Expense Management Schema
-- Description: Rollback script for expense management schema enhancements
-- Version: 2026.02.12.001
-- Date: 2026-02-12

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- This script reverses all changes made by migration 2026_02_12_001
-- Execute only if migration needs to be rolled back
-- WARNING: This will drop tables and remove data - use with caution

-- ============================================================================
-- 1. Drop views
-- ============================================================================

DROP VIEW IF EXISTS v_expense_reimbursement_queue;
DROP VIEW IF EXISTS v_pending_expense_approvals;

-- ============================================================================
-- 2. Drop foreign key constraints
-- ============================================================================

ALTER TABLE expense_lines DROP CONSTRAINT IF EXISTS fk_expense_lines_receipt;
ALTER TABLE expense_lines DROP CONSTRAINT IF EXISTS fk_expense_lines_policy;

-- ============================================================================
-- 3. Drop new tables
-- ============================================================================

DROP TABLE IF EXISTS expense_approval_history CASCADE;
DROP TABLE IF EXISTS expense_receipts CASCADE;

-- ============================================================================
-- 4. Remove indexes from expense_lines
-- ============================================================================

DROP INDEX IF EXISTS idx_expense_lines_policy_violation;
DROP INDEX IF EXISTS idx_expense_lines_expense_date;
DROP INDEX IF EXISTS idx_expense_lines_category;
DROP INDEX IF EXISTS idx_expense_lines_report_id;

-- ============================================================================
-- 5. Remove indexes from expense_reports
-- ============================================================================

DROP INDEX IF EXISTS idx_expense_reports_ap_invoice_id;
DROP INDEX IF EXISTS idx_expense_reports_reimbursement_status;
DROP INDEX IF EXISTS idx_expense_reports_approved_at;
DROP INDEX IF EXISTS idx_expense_reports_created_at;
DROP INDEX IF EXISTS idx_expense_reports_employee_id;
DROP INDEX IF EXISTS idx_expense_reports_tenant_status;

-- ============================================================================
-- 6. Remove columns from expense_lines
-- ============================================================================

ALTER TABLE expense_lines DROP COLUMN IF EXISTS violation_reason;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS policy_violation;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS policy_id;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS receipt_required;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS receipt_id;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS mileage_destination;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS mileage_origin;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS mileage_rate;
ALTER TABLE expense_lines DROP COLUMN IF EXISTS mileage_distance;

-- ============================================================================
-- 7. Remove columns from expense_reports
-- ============================================================================

ALTER TABLE expense_reports DROP COLUMN IF EXISTS employee_name;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS report_number;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS reimbursement_date;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS ap_invoice_id;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS reimbursement_status;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS rejection_reason;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS rejected_by;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS rejected_at;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS approver_comments;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS approved_by;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS approved_at;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS submitted_by;
ALTER TABLE expense_reports DROP COLUMN IF EXISTS submitted_at;

-- ============================================================================
-- 8. Remove migration record
-- ============================================================================

DELETE FROM schema_migrations WHERE version = '2026.02.12.001';

-- ============================================================================
-- Rollback Complete
-- ============================================================================
