# Accounts Payable (AP) Gap Analysis & Parity Roadmap

**Update – Jan 11, 2026**
**Post-Build Review – Chunks 3 through 12**

## 1. Executive Summary (UPDATED)
The AP module has transitioned from a POC to a **Structured Enterprise Subledger** (Level 4 implementation). We have successfully implemented a hierarchical **Supplier-Site architecture**, a rules-driven **Validation Engine**, a robust **Payment Process Request (PPR)** engine, and full **Subledger Accounting (SLA)** integration.

**Status Summary**:
- **Core Architecture**: Oracle-aligned (Suppliers -> Sites -> Invoices -> Lines -> Distributions).
- **Automation**: High (AI-Multimodal Capture, 2-Way Matching, Auto-Validation).
- **Controls**: Strong (Audit Trail, Period Close, Multi-level Holds).
- **Remaining Scope**: Advanced Treasury (Bank communication, ISO20022), Complex Tax (Withholding Tax / WHT), and Multi-Org Data Access Sets (Security).

## 2. Feature Parity Heatmap (UPDATED)

| Feature Area | Component | Current Status | Oracle Parity Gap | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Suppliers** | Supplier Hdr | 🟢 Fully Implemented | Supports tax org types, risk categories, parent-child links. | Low | CLOSED |
| | **Supplier Sites** | � Fully Implemented | **PARITY**: Constructs for Pay/Purchasing Sites exist. | Low | CLOSED |
| | Site Assignments | � Partial | Business Unit logic is simplified; needs hard partitioning. | Medium | In Progress |
| | Bank Accounts | 🟡 Partial | Basic bank reconciliation implemented; needs IBAN validation. | Medium | In Progress |
| **Invoices** | Standard Invoice | � Fully Implemented | Header/Lines/Distributions with SLA linkage. | Low | CLOSED |
| | Prepayments | 🔴 Missing | No mechanism to apply prepayments to invoices. | High | Open |
| | Matching | � Fully Implemented | **PARITY**: 2-Way matching to PO with price/qty tolerances. | Low | CLOSED |
| | Tolerances | � Fully Implemented | **PARITY**: Rules engine for Price/Qty/Tax variances. | Low | CLOSED |
| | Holds | � Fully Implemented | **PARITY**: Reason-based holds (Manual/System) & Release codes. | Low | CLOSED |
| **Payments** | Pmt Batches | 🟢 Fully Implemented | **PARITY**: Payment Process Requests (PPR) with Selection/Confirmation. | Low | CLOSED |
| | Void/Reissue | 🔴 Missing | Logic to void and reverse accounting is missing. | High | Open |
| **Accounting** | SLA Integration | � Fully Implemented | **PARITY**: Event Classes for Validation and Payment. | Low | CLOSED |
| **Setup** | System Options | � Fully Implemented | **PARITY**: Global tolerances, defaults, and accounting options. | Low | CLOSED |
| **Reporting** | Aging / Audit | 🟢 Fully Implemented | **PARITY**: 5-Bucket Aging and Immutable Audit Trail. | Low | CLOSED |
| **Closing** | Period Control | 🟢 Fully Implemented | **PARITY**: Subledger Period Close with readiness checks. | Low | CLOSED |

## 3. Data Model Analysis (UPDATED)

### 3.1 Realized Architecture
1.  **ap_suppliers / ap_supplier_sites**: Implemented. Sites now govern payment terms and tax IDs, enabling location-specific logic.
2.  **ap_invoice_lines / ap_invoice_distributions**: Fully implemented. Distributions now carry the `distCodeCombinationId` for GL posting.
3.  **ap_audit_logs**: Immutable history added to track field-level changes (Before/After state).
4.  **ap_period_statuses**: Tracks AP-specific subledger periods independent of the GL.

### 3.2 Subledger Accounting (SLA) Mapping
- **Event: AP_INVOICE_VALIDATED**: DR Liability, CR Expense (via Invoice Distributions).
- **Event: AP_PAYMENT_CREATED**: DR Liability, CR Cash (via Bank Account link).

## 4. Updated Remediation Roadmap

### 4.1 Remaining Gaps (High Priority)
1. **Gap**: Prepayments & Credits (Chunk 13)
   - **Business Impact**: Cannot handle vendor advances or returns.
   - **Status**: Open
2. **Gap**: Void & Stop Payments
   - **Business Impact**: Accounting drift if payments are cancelled outside the system.
   - **Status**: Open
3. **Gap**: Advanced Tax & WHT
   - **Business Impact**: Compliance risk in non-US jurisdictions.
   - **Status**: Open

### 4.2 Enhancements (Low Priority)
1. **Gap**: ISO20022 SEPA/Wire files
   - **Business Impact**: Manual entry into bank portals required.
2. **Gap**: Attachment Management
   - **Business Impact**: Invoice images not linked to permanent storage.

## 5. Security & AI Strategy Status
*   **RBAC**: Role-based access (Manager/Clerk) is architecturally present.
*   **Agentic AI**:
    - **Multimodal Capture**: PROCESSED. (Whisper/GPT-4o integration for Audio/Image/Excel).
    - **Verification UI**: PROCESSED. User-in-the-loop validation of AI extractions.
    - **Safety**: AI only suggests; SQL transactions ensure data integrity.

## 6. Enterprise Readiness Status
**Status: READY FOR UAT (User Acceptance Testing)**
The module is functionally stable for standard P2P flows. The addition of Aging, Audit, and Bank Reconciliation brings the system to "Production-Lite" status. 

**Next Steps**: Focus on Chunk 13 (Prepayments) and Chunk 14 (Treasury Controls).

---
*(Historical Baseline Jan 10, 2026 remains in commit history)*
