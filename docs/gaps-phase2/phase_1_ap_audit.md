# Deep Parity Audit: Accounts Payable (AP)

This report provides a granular, feature-by-feature codebase parity analysis of the Nexus AP module against Oracle Fusion Payables.

---

## 1. Database Schema Parity (`shared/schema/ap.ts`)

**Current Implementation:**
Nexus has implemented a highly commendable foundational schema including `ap_suppliers`, `ap_supplier_sites`, `ap_invoices`, `ap_invoice_lines`, `ap_invoice_distributions`, `ap_payment_schedules`, and `ap_payment_batches`. It currently supports Enterprise Scoping natively (Business Unit, Legal Entity).

**Oracle Gaps (Required Upgrades):**
*   **Supplier Tax & 1099 Setup**: While `ap_suppliers` has `tax_id` and `tax_organization_type`, it misses Oracle's granular Income Tax reporting flags (`federal_reportable_flag`, `state_reportable_flag`, `income_tax_type`). *Gap: Missing capability to natively generate US 1099 forms.*
*   **Payment Method Precedence**: Nexus assigns `default_payment_method` globally or via `apSystemParameters`. Oracle allows defining payment method precedence at the **Site level** (e.g., Site A prefers WIRE, Site B prefers CHECK) via a `ap_supplier_site_payment_methods` child table.
*   **PO Matching at Distribution Level**: `ap_invoice_lines` matches to `poHeaderId` and `poLineId`. However, Oracle's complex 3-way/4-way PO matching logic often requires matching against the `PO_DISTRIBUTIONS_ALL` table when a single PO line is split across multiple cost centers. *Gap: Nexus lacks `po_distribution_id` on the invoice line/distribution.*
*   **Granular Installment Dates**: `ap_payment_schedules` has `dueDate`. Oracle tracks `discount_date_1`, `discount_date_2`, etc., to allow sliding scale discounts (e.g., 2% Net 10, 1% Net 20). 

---

## 2. Backend API Parity (`server/routes/ap.ts`)

**Current Implementation:**
The backend offers robust endpoints: `/ai-invoice-capture` (multimodal extraction), `/invoices`, `/payment-batches`, and `/holds/:id/release`.

**Oracle Gaps (Required Upgrades):**
*   **Multi-Level Approval Workflows (AME/BPM)**: Nexus uses `/invoices/bulk-approve` via simple user ID. Oracle Payables integrates with a BPEL/Rule Engine to route approvals sequentially to Cost Center managers based on the amount threshold. *Gap: Missing rules-based routing engine integration.*
*   **Payables Open Interface (Import API)**: Oracle uses `AP_INVOICES_INTERFACE` alongside a concurrent program to bulk-validate and import invoices from EDI/legacy systems. *Gap: Nexus lacks a staging-table based import API to batch-process thousands of invoices asynchronously.*

---

## 3. Frontend UI/UX Parity (`APInvoiceEntry.tsx`)

**Current Implementation:**
A clean, modern React page featuring an Invoice Header (Supplier, BU, PO, Dates, Currency) and an Invoice Lines grid (Item, Type, Qty, Price, Tax).

**Oracle Gaps (Required Upgrades):**
*   **Match-to-PO Modal Interface**: Nexus has a single `<Select onValueChange={handlePOSelection}>` in the header to auto-populate lines from *one* PO. Oracle features a sophisticated "Match to PO" modal that allows a clerk to query multiple POs, select specific lines across them, and pull them into a single invoice. *Gap: Complex multi-PO matching UI is missing.*
*   **Installments / Payment Schedules Tab**: Once an invoice is entered, Oracle has an "Installments" tab to review and manually split the payment (e.g., $10k invoice split into two $5k payments on different due dates). *Gap: Nexus lacks an Installments UI for the end-user.*
*   **Withholding Tax UI**: Though `apWhtGroups` exists in the DB, the Invoice Entry UI completely lacks a tab or section to automatically calculate, review, and apply Withholding Tax to the invoice lines. *Gap: Withholding tax is invisible to the clerk entering the invoice.*
*   **Price/Quantity Variance Hold Indicators**: In Oracle, if you match a $10 PO line but enter $12 on the invoice, the line immediately throws a visible "Price Variance Hold" warning icon. *Gap: Real-time tolerance validation warnings on the grid are missing.*
