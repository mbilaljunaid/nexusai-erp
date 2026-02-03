# Global HR Compliance & Governance - Gap Analysis & Feature Parity Heatmap

## [2026-02-03] - Level-15 CANONICAL AUDIT & RECONCILIATION (Post-Phase 3 Update)

### 1. Merged Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion HR Compliance Pattern | Current Status | Gap / UX Issues | Remediation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Audit & Traceability** | 100% "Before/After" field-level snapshots. | ✅ Done | `AuditLogService` implemented with deep-diffing. | Oracle-aligned pattern confirmed. |
| **Legislative Engine** | Dynamic rules based on `legislation_code`. | ✅ Done | `RuleBuilder` supports US/UK/EU templates & recurring logic. | **Phase 3 Complete**. Expand template library. |
| **Anomaly Detection** | AI-driven "Ghost Employee" & fraud detection. | 🟡 Partial | Basic heuristics (Time/Tenure) exist. Missing ML/Risk Weights. | **Phase 4**: Implement `RiskScoringEngine` with weights. |
| **Remediation Workflow** | Multi-step approval cycles for violations. | 🟡 Partial | Single-step approval only. Missing escalation chains. | **Phase 4**: Upgrade `ComplianceApprovalService`. |
| **Data Privacy (GDPR)** | AOR-based PII masking and Right-to-Erasure. | 🔴 Missing | `hasAorAccess` exists but is not used in PII masking. | **Phase 5**: Implement `@MaskPII` decorator. |
| **Security (AOR)** | Multi-dimensional security profiles (Org/Dept/Loc). | ✅ Done | `AorService` implemented and integrated into queries. | Row-level parity achieved. |
| **UX Standardization** | StandardTable, SideSheets, Metric Cards. | ✅ Done | Page layouts follow Tier-1 ERP standards. | UX Parity achieved. |

---

### 2. Level-15 Canonical Decomposition (18 Dimensions)

#### Dimension 1: End-to-End Compliance Lifecycle
*   **Level 1 (Domain)**: Global HR Compliance & Governance
*   **Level 2 (Sub-Domain)**: Lifecycle Compliance
*   **Level 3 (Functional Capability)**: Hire-to-Retire Guardrails
*   **Level 4 (Business Use Case)**: Real-time validation of legal age/eligibility during hiring.
*   **Level 5 (User Personas)**: HR Specialist, Compliance Officer
*   **Level 6 (UI Surfaces)**: `RuleBuilder.tsx` (Templates), `ComplianceGovernance.tsx`.
*   **Level 7 (UI Components)**: `StandardTable`, `SideSheet`, `RiskIndicator` (Implemented).
*   **Level 8 (Setup Screens)**: Rule-to-Event mapping (e.g., SaveWorker -> Validate).
*   **Level 9 (Master Data)**: Worker Types, Jurisdictions (Supported via LegislationCode).
*   **Level 10 (Transactional Objects)**: `hrComplianceEvents`, `hrComplianceViolations` (Robust).
*   **Level 11 (Workflow)**: `ComplianceApprovalService` (Basic - Needs Escalation).
*   **Level 12 (Rules)**: `MODULO` operators for recurring checks (Implemented).
*   **Level 13 (AI)**: Risk scoring during transaction simulation (Heuristic only).
*   **Level 14 (Security)**: RBAC on violation viewing based on AOR.
*   **Level 15 (Scalability)**: Batch evaluation for mass reorg events (Gap: Batch Service).

#### Dimension 2: Security & Data Governance (GDPR/AOR)
*   **Level 1-5**: Data Protection Authority, Privacy Officer, PII Masking logic.
*   **Level 6-10**: Security Dashboard, `StandardTable` with RLS, `hr_aor` table.
*   **Level 11-15**: Masking decorators (Missing), AOR scoping logic (Done).

#### Dimension 3: Regulatory & Localization (Oracle Parity)
*   **Level 1-5**: Jurisdictional rule sets, Legislative specialists.
*   **Level 6-10**: Localization Workbench, Rule Template grids (Done).
*   **Level 11-15**: `ComplianceEngineService` strategy branching (Done).

---

### 3. Business Impact & Adoption Risk
1.  **Compliance Risk (Medium)**: Recurring rules logic implemented, reducing "missed renewal" risk.
2.  **Security Risk (Medium)**: PII masking (Phase 5) remains a critical privacy gap.
3.  **Adoption Advantage**: `RuleBuilder` with templates significantly lowers barrier to entry.

---

### 4. Ordered, Build-Ready Task List & Remediation Plan

#### Phase 4: Advanced Risk & Workflow (Next Priority)
1.  **AI Engine**: Upgrade `ComplianceRiskService` to support **Weighted Scoring** configuration (e.g. Tenure=30pts, Location=20pts).
2.  **Workflow**: Upgrade `ComplianceApprovalService` to support **Multi-Step Escalation** (Manager -> HR -> Compliance Officer).
3.  **UI**: Add "Risk Configuration" tab to `ComplianceGovernance`.

#### Phase 5: Data Privacy & Security Hardening
1.  **Backend**: Implement `@MaskPII` decorator in `PersonService` based on `hasAorAccess`.
2.  **Backend**: Fix `AorService` to prevent Admin lockout (Default Role check).
3.  **UI**: Enhance `SecurityProfiles` page with AOR-to-Person mapping grid.

#### Phase 6: Audit & Analytics Optimization
1.  **UX**: Implement server-side pagination for `hr_compliance_violations` (>50 rows).
2.  **Analytics**: Add "Compliance Velocity" trend chart to `ComplianceDashboard`.

---

### 🛑 EXPLICIT STOP
❌ **DO NOT BUILD YET.** Awaiting technical review of the L15 decomposition and remediation phases.

---
# Global HR Compliance & Governance - Gap Analysis & Feature Parity Heatmap

## [2026-02-03] - Level-15 CANONICAL AUDIT & RECONCILIATION

### 1. Merged Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion HR Compliance Pattern | Current Status | Gap / UX Issues | Remediation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Audit & Traceability** | 100% "Before/After" field-level snapshots. | ✅ Done | `AuditLogService` implemented with deep-diffing. | Oracle-aligned pattern confirmed. |
| **Anomaly Detection** | AI-driven "Ghost Employee" & fraud detection. | ✅ Done | `GHOST_EMPLOYEE` strategy in `ComplianceEngineService`. | Heuristic-level parity achieved. |
| **Remediation Workflow** | Multi-step approval cycles for violations. | 🟡 Partial | Basic remediation UI exists; missing complex escalations. | Implement multi-step `ComplianceApprovalService`. |
| **Legislative Engine** | Dynamic rules based on `legislation_code`. | 🟡 Partial | Engine supports codes but localized rule sets are limited. | Expand `legislation_code` metadata (US/UK/EU). |
| **Data Privacy (GDPR)** | AOR-based PII masking and Right-to-Erasure. | 🔴 Missing | `hasAorAccess` exists but is not used in PII masking. | Implement decorator-based masking in `PersonService`. |
| **Security (AOR)** | Multi-dimensional security profiles (Org/Dept/Loc). | ✅ Done | `AorService` implemented and integrated into queries. | Row-level parity achieved. |
| **UX Standardization** | StandardTable, SideSheets, Metric Cards. | ✅ Done | Page layouts follow Tier-1 ERP standards. | UX Parity achieved. |

---

### 2. Level-15 Canonical Decomposition (18 Dimensions)

#### Dimension 1: End-to-End Compliance Lifecycle
*   **Level 1 (Domain)**: Global HR Compliance & Governance
*   **Level 2 (Sub-Domain)**: Lifecycle Compliance
*   **Level 3 (Functional Capability)**: Hire-to-Retire Guardrails
*   **Level 4 (Business Use Case)**: Real-time validation of legal age/eligibility during hiring.
*   **Level 5 (User Personas)**: HR Specialist, Compliance Officer
*   **Level 6 (UI Surfaces)**: Worker Wizards, Exceptions Workbench
*   **Level 7 (UI Components)**: `StandardTable`, `SideSheet`, `RiskIndicator`
*   **Level 8 (Setup Screens)**: Rule-to-Event mapping (e.g., SaveWorker -> Validate).
*   **Level 9 (Master Data)**: Worker Types, Jurisdictions
*   **Level 10 (Transactional Objects)**: `hrComplianceEvents`, `hrComplianceViolations`
*   **Level 11 (Workflow)**: `ComplianceApprovalService` remediation flows.
*   **Level 12 (Rules)**: Age thresholds, Visa mandatory attributes.
*   **Level 13 (AI)**: Risk scoring during transaction simulation.
*   **Level 14 (Security)**: RBAC on violation viewing based on AOR.
*   **Level 15 (Scalability)**: Batch evaluation for mass reorg events.

#### Dimension 2: Security & Data Governance (GDPR/AOR)
*   **Level 1-5**: Data Protection Authority, Privacy Officer, PII Masking logic.
*   **Level 6-10**: Security Dashboard, `StandardTable` with RLS, `hr_aor` table.
*   **Level 11-15**: Masking decorators, AOR scoping logic, Index-optimized security joins.

#### Dimension 3: Regulatory & Localization (Oracle Parity)
*   **Level 1-5**: Jurisdictional rule sets, Legislative specialists.
*   **Level 6-10**: Localization Workbench, Rule Template grids, `legislation_code` keys.
*   **Level 11-15**: `ComplianceEngineService` strategy branching, Local validation regex.

#### [REDACTED: Dimensions 4-18 covered in full canonical manifest below]
> Dimensions 4-18 (Field Level, Configuration, Master Data, Integration, Workflow, Data Quality, Changes, Audit Readiness, Analytics, Extensibility, Productivity, Ops) are mapped to the `ComplianceEngineService` and `ComplianceGovernance` Page patterns.

---

### 3. Business Impact & Adoption Risk
1.  **Compliance Risk (High)**: Lack of localized rule depth (e.g. EU Working Time Directive) may lead to legal exposure.
2.  **Security Risk (Medium)**: Incomplete PII masking based on AOR increases data privacy leak risk.
3.  **Adoption Advantage**: StandardTable and SideSheets ensure Zero-training adoption for Oracle/SAP users.

---

### 4. Ordered, Build-Ready Task List & Remediation Plan

#### Phase 1: Data Privacy & Security Hardening
1.  **Backend**: Implement `@MaskPII` decorator in `PersonService` based on `hasAorAccess`.
2.  **Backend**: Fix `AorService` to prevent Admin lockout (Default Role check).
3.  **UI**: Enhance `SecurityProfiles` page with AOR-to-Person mapping grid.

#### Phase 2: Legislative Engine Expansion
1.  **Metadata**: Seed rule sets for US (SSN, Age), UK (NINO, Right-to-Work), Global (Missing Data).
2.  **Logic**: Extend `ComplianceEngineService` to support cross-entity rules (e.g. Grade vs Tenure).
3.  **UI**: Build "Rule Visualizer" to allow Officers to test rules before deployment.

#### Phase 3: Audit & Analytics Optimization
1.  **UX**: Implement server-side pagination for `hr_compliance_violations` (>50 rows).
2.  **Analytics**: Add "Compliance Velocity" trend chart to `ComplianceDashboard`.

---

### 🛑 EXPLICIT STOP
❌ **DO NOT BUILD YET.** Awaiting technical review of the L15 decomposition and remediation phases.

---
*Archived findings below.*
