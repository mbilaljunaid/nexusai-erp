# Global HR Compliance & Governance - Gap Analysis & Feature Parity Heatmap

## [2026-02-03] - Level-15 Canonical Audit & Research Findings

### 1. Analysis Summary
The current Global HR Compliance & Governance module in NexusAI ERP is in an early "Mock/MVP" state. 
- **Backend**: `ComplianceService` handles simple hardcoded rules with manual severity scoring. No integration with `hr_worker` or `hr_structures`.
- **Frontend**: Pages like `Compliance.tsx` and `AuditLogs.tsx` rely on static mock data. `StandardTable` is missing from all compliance views.
- **Audit**: Schema for `hrAuditLogs` exists but isn't leveraged by the UI for deep change history or "Before/After" comparisons.
- **Security**: `hr_aor.ts` (Area of Responsibility) schema exists but is disconnected from the compliance engine.

### 2. Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion Parity | Status | Gap Description |
| :--- | :--- | :--- | :--- |
| **Legislative Compliance** | High | 🔴 Missing | No engine for localized labor law enforcement (e.g., maximum working hours, mandatory breaks). |
| **Data Privacy (GDPR/CCPA)** | High | 🟡 Partial | Basic placeholders for GDPR exist, but no automated PII discovery or automated consent fulfillment. |
| **Audit Management** | High | 🟡 Partial | `hr_audit.ts` exists, but `AuditLogs.tsx` renders static mock entries. Missing deep drill-downs. |
| **Policy Enforcement** | High | 🔴 Missing | No automated checks for HR policy adherence (e.g., certification expiry, visa status). |
| **AOR Security** | High | 🟡 Partial | `hr_aor` schema exists, but not integrated into the compliance filtering or reporting layer. |
| **Exception Handling** | Medium | 🟡 Partial | `hrAuditApprovals` exists but isn't triggered by automated compliance violations. |
| **AI Anomaly Detection** | High | 🔴 Missing | Backend has mock placeholders. No actual risk scoring or pattern recognition for "ghost employees." |
| **Premium UX** | High | 🔴 Missing | Compliance pages use simple cards. Missing `StandardTable`, `SideSheet`, and Breadcrumb hierarchy. |

---

### 3. Level-15 Canonical Decomposition

#### Dimension 1: Regulatory Compliance & Legislative Engine
- **Level 1 (Domain)**: Global HR Compliance & Governance
- **Level 2 (Sub-Domain)**: Regulatory Compliance
- **Level 3 (Functional)**: Legislative Rule Evaluation (Labor Law, Working Time)
- **Level 4 (Use Case)**: Automatically validate employee assignments against local labor laws and regional thresholds.
- **Level 5 (Personas)**: HR Compliance Officer, Auditor, Payroll Admin
- **Level 6 (UI Surfaces)**: Legislative Dashboard, Rule Configuration Page, Compliance Monitoring View
- **Level 7 (UI Components)**: `StandardTable` (Rule Grid), `SideSheet` (Rule Details), `MetricCard` (Compliance Rate)
- **Level 8 (Config)**: Legislative Rule Templates, Threshold Definitions, Effective Date Rules
- **Level 9 (Master Data)**: Legislation Codes, Jurisdictions, Legal Employers, Unions
- **Level 10 (Transactions)**: Compliance Evaluation Records (Events), Violation Logs, Exceptions
- **Level 11 (Workflows)**: Exception Approval Workflow, Notification Escalation to Manager
- **Level 12 (Rules)**: Regional labor law formulas (e.g., "Max 48h/week average over 17 weeks" for EU WTD).
- **Level 13 (AI/Automation)**: Predictive risk scoring for non-compliant hires; Automated "Ghost Employee" detection.
- **Level 14 (Security)**: RBAC (View Compliance by Country), PII Data Access Controls.
- **Level 15 (Performance)**: Server-side evaluation for 50k+ records; Background processing for scheduled re-validation.

#### Dimension 2: Security & Data Privacy (GDPR/AOR)
- **Level 1 (Domain)**: Global HR Compliance & Governance
- **Level 2 (Sub-Domain)**: Data Privacy & Security Governance
- **Level 3 (Functional)**: Area of Responsibility (AOR) Enforcement; PII Protection
- **Level 4 (Use Case)**: Restrict HR data access based on Department/Location/Legal Employer AOR.
- **Level 5 (Personas)**: HR Manager, IT Security Officer, Data Privacy Officer
- **Level 6 (UI Surfaces)**: AOR Workbench, Privacy Dashboard, Data Access Audit View
- **Level 7 (UI Components)**: `StandardTable` (AOR Assignments), `SideSheet` (Access Logs), `DrillDown` (Person Details)
- **Level 8 (Config)**: Responsibility Types (HR, Payroll), Security Profile Templates
- **Level 9 (Master Data)**: Employees (HR Users), Departments, Legal Entities, Locations
- **Level 10 (Transactions)**: Security Profile Assignments, Access Request Events
- **Level 11 (Workflows)**: AOR Provisioning Workflow, Security Audit Approvals
- **Level 12 (Rules)**: Hierarchical access logic (e.g., Department A access includes sub-departments).
- **Level 13 (AI/Automation)**: Anomaly detection for unusual bulk-data access by HR staff.
- **Level 14 (Security)**: Field-level Encryption (TDE), RBAC Integration.
- **Level 15 (Performance)**: Lazy loading for granular access logs; Optimized query filters for multi-tenant isolation.

#### Dimension 3: Audit & Traceability
- **Level 1 (Domain)**: Global HR Compliance & Governance
- **Level 2 (Sub-Domain)**: Audit Management
- **Level 3 (Functional)**: Deep Change Tracking (History), Workflow Traceability
- **Level 4 (Use Case)**: Reconstruct the state of an employee record at any historical point for audit purposes.
- **Level 5 (Personas)**: Internal/External Auditor, Compliance Officer
- **Level 6 (UI Surfaces)**: Audit Console, Record History Side-Panel, Workflow History Screen
- **Level 7 (UI Components)**: `StandardTable` (Audit Logs), `DiffView` (Old vs New value comparison), `SideSheet`
- **Level 8 (Config)**: Audit Level Settings (Metadata, All, None), Retention Timeframes
- **Level 9 (Master Data)**: Entity Definitions (Person, Assignment, Salary), Actor Metadata
- **Level 10 (Transactions)**: Audit Entries, Approval History Records, E-Signatures
- **Level 11 (Workflows)**: Post-audit Remediation Tracking, Signature Capture
- **Level 12 (Rules)**: Immutable record enforcement; Audit trigger derivation.
- **Level 13 (AI/Automation)**: Automated red-flagging of suspicious "back-dating" or "mass updates."
- **Level 14 (Security)**: Tamper-evident logs; SoD (Segregation of Duties) via AOR security.
- **Level 15 (Performance)**: Partitioned audit tables; Cold storage for logs > 2 years.

---

### 4. Oracle Fusion HR Compliance Reference
Oracle Fusion uses a centralized **Compliance Engine** (HRC) that integrates with **AOR (Area of Responsibility)** to restrict data access and **HCM Extract** for regulatory reporting. It also leverages **Global HR Legislations** for regional data validation. Our implementation must move from a "Simple Rule List" to a "Cross-Functional Event Engine."

### 5. Remediation Roadmap (Phased Execution)

#### Phase 1: Foundation & Premium UX (Standardization)
- [ ] **UI Refactor**: Migrate `ComplianceGovernance.tsx` and `AuditLogs.tsx` to use `StandardTable`.
- [ ] **Sidebar Integration**: Add dedicated navigations for Compliance/Audit under the HR main menu.
- [ ] **Schema Expansion**: Create `shared/schema/hr_compliance.ts` for Compliance Events and Violation Tracking.
- [ ] **Master Data**: Implement Jurisdictions and Regulatory Frameworks.

#### Phase 2: Engine Development & Real-Time Monitoring
- [ ] **Rule Engine**: Build a NestJS service to evaluate `hr_worker` data against configured policy rules.
- [ ] **AOR Integration**: Enforce `hr_aor` security in all compliance reporting controllers.
- [ ] **Automated Audit**: Wiring `hrAuditLogs` to application events across Core HR.

#### Phase 3: AI & Exception Intelligence (Tier-1 Optimization)
- [ ] **Anomaly Detection**: Implement deterministic AI logic for risk scoring (e.g., Duplicate IDs, Missing Certs).
- [ ] **Workflow Synergy**: Connect compliance violations directly to `hrAuditApprovals` for remediation.
- [ ] **Reporting**: Create Dashboard KPI cards for "Risk at Glance."

---

### 6. Build-Ready Task List
1.  **Back-end**: Create `hr_compliance` schema in `shared/schema/hr_compliance.ts`.
2.  **Back-end**: Implement `ComplianceEventService` for automated evaluation.
3.  **Front-end**: Create `ComplianceOperationsDashboard.tsx` using `StandardTable` and `MetricCard`.
4.  **Front-end**: Implement `AuditDetailsSideSheet.tsx` with Old/New value comparison.
5.  **Audit**: Ensure all `hr_worker` mutations are logged to `hrAuditLogs`.

### 7. Explicit Stop
❌ **DO NOT BUILD YET.** Awaiting user review and approval of the "Gap Analysis + Feature Parity Heatmap" and Phase 1-3 roadmap.
