# Global HR Compliance & Governance - Gap Analysis & Feature Parity Heatmap

## [2026-02-03] - Level-15 CANONICAL AUDIT & TARGET ARCHITECTURE (RECONCILIATION)

### 1. Merged Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion HR Compliance Pattern | Current Status | Gap / UX Issues | Remediation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Legislative Engine** | Dynamic rules based on Legal Employer / Country legislation. | 🟡 Partial | `ComplianceEngineService` exists but rules are hardcoded-switch logic. Missing localization data. | Move to metadata-driven rule evaluator with `legislation_code` context. |
| **Data Privacy (GDPR)** | Automated PII masking, Right to Erasure, and AOR-based visibility. | 🔴 Missing | UI exists but logic is static mock. No linkage to `hr_persons` sensitive fields. | Implement AOR-based field-level visibility in `PersonService`. |
| **Audit & History** | 100% record of "Before/After" for every worker transaction. | 🟡 Partial | `hr_audit.ts` exists. `ComplianceAuditDetail` uses it, but no "Timeline" or "Diff" view. | Implement `StandardTable` with `SideSheet` diff-viewer for all HR mutations. |
| **AOR Security** | Security profiles derived from Org, Dept, Job, or Location. | 🟡 Partial | `hr_aor` schema exists but is not leveraged by compliance reporting or data access filters. | Wire `AORProvider` in frontend and `SecurityEnforcer` in backend controllers. |
| **Risk Prediction** | AI heuristics for candidate/employee risk scoring. | ✅ Done | `ComplianceRiskService` implemented with tenure, timing, and role risk scoring. | Integrated into Hire/Transfer wizards. Premium UX parity achieved. |
| **Exceptions** | Workflow-driven overrides for compliance violations. | 🟡 Partial | `ComplianceExceptions.tsx` is mock/basic. No integration with `hrAuditApprovals`. | Link `hrComplianceViolations` to `hrApprovals` engine with remediation tracking. |
| **Premium UX** | KPI dashboards, server-side grids, and side-sheet drill-downs. | 🔴 Missing | Most pages (`DataGovernance`, `Exceptions`) are mock cards. Missing SideSheets and Breadcrumbs. | Full refactor to `StandardTable` + `Sheet` pattern as per Tier-1 guidelines. |

---

### 2. Level-15 Canonical Decomposition (Master Model)

#### Dimension 1: End-to-End Compliance Lifecycle (Hire-to-Retire)
- **Level 1 (Module Domain)**: Global HR Compliance & Governance
- **Level 2 (Sub-Domain)**: Regulatory Compliance
- **Level 3 (Functional Capability)**: Transactional Compliance Validation
- **Level 4 (Business Use Case)**: Real-time risk scoring and legal validation during worker hiring and transfers.
- **Level 5 (User Personas)**: HR Administrator, Compliance Officer
- **Level 6 (UI Surfaces)**: Hire Worker Wizard, Transfer Worker Dialog, Compliance Monitoring Dashboard
- **Level 7 (UI Components)**: `RiskIndicator`, `StandardTable` (Violation Grid), `Badge` (Risk Level)
- **Level 8 (Configuration)**: Compliance Risk Heuristic thresholds (e.g., tenure < 6 months = high risk).
- **Level 9 (Master Data)**: Organizations, Legal Employers, Jurisdictions, Job Roles
- **Level 10 (Transactional Objects)**: Compliance Events (Evaluations), Violations, Risk Analysis Records
- **Level 11 (Workflow & Controls)**: Pre-submission risk preview, required justification for high-risk flags.
- **Level 12 (Rules / Derivation)**: Risk score calculation logic (Tenure, Timing, Role Criticality).
- **Level 13 (AI/Automation)**: `ComplianceRiskService.predictRisk` (Heuristic scoring); Automated violation creation.
- **Level 14 (Security/Compliance)**: AOR-based violation visibility; Audit log of risk assessments.
- **Level 15 (Performance/Scalability)**: Efficient rule evaluation during txn; Server-side pagination for voluminous violation logs.

#### Dimension 2: Security & Data Governance (AOR/GDPR)
- **Level 1 (Module Domain)**: Global HR Compliance & Governance
- **Level 2 (Sub-Domain)**: Security Governance
- **Level 3 (Functional Capability)**: Area of Responsibility (AOR) Enforcement
- **Level 4 (Business Use Case)**: Restricting compliance visibility and data access to users within their assigned AOR.
- **Level 5 (User Personas)**: Regional HR Director, Data Privacy Officer
- **Level 6 (UI Surfaces)**: AOR Workspace, Security Profile Dashboard
- **Level 7 (UI Components)**: `StandardTable` (AOR assignments), `SideSheet` (Record Access History)
- **Level 8 (Configuration)**: AOR Security Profiles (Department-based, Location-based).
- **Level 9 (Master Data)**: Users (HR Staff), Departments, Business Units, Legislative Data Groups
- **Level 10 (Transactional Objects)**: Access Audit Logs, AOR Assignment Records
- **Level 11 (Workflow & Controls)**: Approval for AOR escalation, Periodic security access review.
- **Level 12 (Rules / Derivation)**: Hierarchical access inheritance (e.g., Org Level 1 access allows Level 2 visibility).
- **Level 13 (AI/Automation)**: Anomaly detection for unusual bulk data exports or unauthorized cross-AOR access.
- **Level 14 (Security/Compliance)**: Field-level invisibility for non-AOR users; PII Masking.
- **Level 15 (Performance/Scalability)**: Optimized RLS (Row Level Security) filters for high-concurrency txn.

---

### 3. Build-Ready Task List & Phased Execution

#### Phase 1: UX Standardization & Core Wiring (Premium Parity)
1. **Frontend**: Refactor `ComplianceDashboardNew` to `ComplianceDashboard` using `MetricCard` and `ComplianceAnalytics`.
2. **Frontend**: Re-wire `client/src/pages/ComplianceGovernance.tsx` (the orphaned high-quality page) into the main `ComplianceRoutes`.
3. **Frontend**: Replace mock `DataGovernancePage` and `ComplianceExceptions` with `StandardTable` + `SideSheet` implementations.
4. **Backend**: Integrate `AORSecurity` filter into `ComplianceService.listViolations` and `listRules`.

#### Phase 2: Metadata-Driven Compliance Engine
1. **Schema**: Extend `hrComplianceRules` to support flexible JSON-based logic for localization (e.g., Working Hours laws).
2. **Backend**: Refactor `ComplianceEngineService` to use a strategy pattern for evaluating different rule types (Age, Visa, Certification).
3. **Integration**: Hook into `PersonService` and `AssignmentService` to trigger validation on every Save/Update.

#### Phase 3: Advanced Auditing & Remediation
1. **UI**: Implement `AuditDiffViewer` component for "Before/After" audit comparison.
2. **Workflow**: Connect `hrComplianceViolations` to the `hrApprovals` workflow for formal resolution tracking.
3. **AI**: Implement pattern recognition for "Ghost Employee" detection in `ComplianceRiskService`.

---

### 4. Explicit Stop
❌ **DO NOT BUILD YET.** Awaiting user review of the target architecture and phased roadmap.

---


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
