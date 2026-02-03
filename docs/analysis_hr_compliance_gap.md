# Global HR Compliance & Governance - Gap Analysis & Feature Parity Heatmap

## [2026-02-03] - Level-15 CANONICAL AUDIT & RECONCILIATION

### 1. Merged Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion HR Compliance Pattern | Current Status | Gap / UX Issues | Remediation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Audit & Traceability** | 100% "Before/After" field-level snapshots for all transactions. | ✅ Done | `AuditLogService` with deep-diffing and `AuditDiffViewer` implemented. | Tier-1 parity achieved. |
| **Anomaly Detection** | AI-driven "Ghost Employee" and fraud pattern recognition. | ✅ Done | `GHOST_EMPLOYEE` strategy added to `ComplianceEngineService`. | Heuristic-level parity achieved. |
| **Remediation Workflow** | Integrated approval cycles for compliance exceptions. | ✅ Done | `ComplianceApprovalService` linked to `hrAuditApprovals` for remediation. | Workflow-level parity achieved. |
| **Legislative Engine** | Dynamic rules based on `legislation_code`. | 🟡 Partial | Engine supports legislation codes, but localized data sets are limited. | Expand `legislation_code` templates for Tier-1 countries (US, EU, UK). |
| **Data Privacy (GDPR)** | AOR-based field masking and Right-to-Erasure. | 🔴 Missing | AOR exists in Audit, but not in `PersonService` field-level visibility. | Implement `AORFieldMasking` decorator in `PersonService`. |
| **Security (AOR)** | Multi-dimensional security profiles (Org, Dept, Loc). | 🟡 Partial | `AORService` exists and is used in Audit. Missing in Monitoring/Analytics. | Universal integration of `AORService` in all Compliance controllers. |
| **UX Standardization** | StandardTable, SideSheets, and Breadcrumbs. | ✅ Done | Navigation config and breadcrumbs updated module-wide. | Tier-1 UX parity achieved. |

---

### 2. Level-15 Canonical Decomposition (18 Dimensions)

#### Dimension 1: End-to-End Compliance Lifecycle
- **Level 1 (Domain)**: Global HR Compliance & Governance
- **Level 2 (Sub-Domain)**: Lifecycle Compliance
- **Level 3 (Functional)**: Hire-to-Retire Regulatory Guardrails
- **Level 4 (Use Case)**: Validation of legal working age and eligibility during Hire/Transfer/Term.
- **Level 5 (Personas)**: HR Specialist, Compliance Manager
- **Level 6 (UI Surfaces)**: Worker Wizards, Compliance Exceptions Workbench
- **Level 7 (UI Components)**: `StandardTable`, `SideSheet`, `RiskIndicator`
- **Level 8 (Configuration)**: Lifecycle event trigger mapping (e.g., Save Worker -> Evaluate Rules).
- **Level 9 (Master Data)**: Worker Types, Legal Employers, Jurisdictions
- **Level 10 (Transactional Objects)**: `hrComplianceEvents`, `hrComplianceViolations`
- **Level 11 (Workflow)**: `ComplianceApprovalService` (Remediation)
- **Level 12 (Rules)**: Age thresholds, Visa requirements, Mandatory fields.
- **Level 13 (AI)**: Risk scoring during transaction simulation.
- **Level 14 (Security)**: RBAC on violation viewing.
- **Level 15 (Scalability)**: Batch evaluation for mass transfers/reorgs.

#### Dimension 2: Security & Data Governance (GDPR/AOR)
- **Level 1 (Domain)**: Global HR Compliance & Governance
- **Level 2 (Sub-Domain)**: Data Security Governance
- **Level 3 (Functional)**: Area of Responsibility (AOR) Enforcement
- **Level 4 (Use Case)**: Restrict access to worker PII and audit logs based on user's AOR (e.g. US HR only).
- **Level 5 (Personas)**: Data Privacy Officer, HR Manager
- **Level 6 (UI Surfaces)**: Security Dashboard, Audit Ledger
- **Level 7 (UI Components)**: `StandardTable` with RLS (Row Level Security) filters.
- **Level 8 (Configuration)**: AOR Scopes (Legal Employer, Dept, Location).
- **Level 9 (Master Data)**: HR Personnel, Security Profiles
- **Level 10 (Transactional Objects)**: `hrAor`, Access Logs
- **Level 11 (Workflow)**: AOR Provisioning/Revocation Approvals.
- **Level 12 (Rules)**: Hierarchical AOR inheritance.
- **Level 13 (AI)**: Anomaly detection for unusual cross-AOR data access.
- **Level 14 (Security)**: PII Masking and field-level encryption.
- **Level 15 (Scalability)**: Index-optimized AOR joins in Drizzle queries.

---

### 3. Oracle Fusion HR Compliance Reference
NexusAI now matches Oracle Fusion's **Audit & History** and **Heuristic Exception Management**. The remaining gap lies in **Field-Level Data Privacy** (PII masking based on security profiles) and **Localization Depth** (specific country legislation data).

### 4. Phased Remediation Roadmap

#### Phase 1: Security & Privacy (AOR Full Integration)
1. **Backend**: Implement AOR-based field-level visibility in `PersonService` (Masking DOB/NationalID for non-authorized users).
2. **Backend**: Universally apply `AORService.getAorForUser` in `ComplianceService` monitoring methods.
3. **UI**: Create a "Security Profile" view to manage `hrAor` assignments via `StandardTable`.

#### Phase 2: Localization & Metadata Expansion
1. **Metadata**: Define rule templates for US (EEO), UK (Right to Work), and EU (GDPR).
2. **Backend**: Extend `ComplianceEngineService` to support time-based rules (e.g. Probation end alerts).
3. **UI**: Implement a Rule Builder UI for non-technical Compliance Officers.

#### Phase 3: Reporting & Operational Readiness
1. **Analytics**: Add drill-down from Trend charts -> Violation Grid -> Violation Detail.
2. **Operations**: Create automated "Compliance Readiness" reports for internal/external audits.

---

### 5. Explicit Stop
❌ **DO NOT BUILD YET.** Awaiting user review of the updated gap analysis and remediation plan.

---

(Archived entries follow...)
