# Global HR Compliance & Governance - Gap Analysis & Feature Parity Heatmap

## [2026-02-04] - Level-15 CANONICAL AUDIT & RECONCILIATION (Post-Phase 3 Update)

### 1. Merged Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion HR Compliance Pattern | Current Status | Gap / UX Issues | Remediation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Audit & Traceability** | 100% "Before/After" field-level snapshots. | ✅ Done | `AuditLogService` implemented with deep-diffing. | Oracle-aligned pattern confirmed. |
| **Legislative Engine** | Dynamic rules based on `legislation_code`. | ✅ Done | `RuleBuilder` supports US/UK/EU templates & recurring logic. | **Phase 3 Complete**. Expand template library. |
| **Reporting & Analytics** | "Compliance Velocity" & Risk Heatmaps. | ✅ Done | `ComplianceAnalytics` now tracks Opened vs Resolved velocity. | **Phase 3 Complete**. |
| **Data Handling (Pagination)** | Server-side paging for >50k violations. | ✅ Done | `listViolations` supports SQL offset/limit. | **Phase 3 Complete**. UX Parity achieved. |
| **Anomaly Detection** | AI-driven "Ghost Employee" & fraud detection. | 🟡 Partial | Basic heuristics (Time/Tenure) exist. Missing ML/Risk Weights. | **Phase 4**: Implement `RiskScoringEngine` with weights. |
| **Remediation Workflow** | Multi-step approval cycles for violations. | 🟡 Partial | Single-step approval only. Missing escalation chains. | **Phase 4**: Upgrade `ComplianceApprovalService`. |
| **Data Privacy (GDPR)** | AOR-based PII masking and Right-to-Erasure. | 🔴 Missing | `hasAorAccess` exists but is not used in PII masking. | **Phase 5**: Implement `@MaskPII` decorator. |
| **Security (AOR)** | Multi-dimensional security profiles (Org/Dept/Loc). | ✅ Done | `AorService` implemented and integrated into queries. | Row-level parity achieved. |

---

### 2. Level-15 Canonical Decomposition (18 Dimensions)

#### Dimension 1: End-to-End Compliance Lifecycle
*   **Level 1-5**: Domain, Sub-domain, Capability, Use Case, Personas.
*   **Level 6-10**: UI Surfaces (`ComplianceGovernance`), Objects (`Violations`), Master Data.
*   **Level 11 (Workflow)**: `ComplianceApprovalService` (Gap: Single-step only).
*   **Level 12 (Rules)**: `MODULO` operators for recurring checks (Done).
*   **Level 13 (AI)**: Risk scoring during transaction simulation (Gap: Hardcoded weights).
*   **Level 14 (Security)**: `AorService` for Row-Level Security (Done).
*   **Level 15 (Scalability)**: Server-side pagination for Violations Grid (Done).

#### Dimension 2: Reporting & Analytics
*   **Level 1-10**: Dashboard, Metric Cards, Charts.
*   **Level 11-15**: `ComplianceVelocity` aggregation, Audit Engagement Summary (Done).

---

### 3. Business Impact & Adoption Risk
1.  **Workflow Risk (High)**: Lack of escalation means potential bottlenecks if primary approver is absent.
2.  **Compliance Risk (Medium)**: AI Risk Engine needs weighted scoring to reduce false positives.
3.  **Adoption Advantage**: Velocity Chart provides immediate visual ROI for executives.

---

### 4. Ordered, Build-Ready Task List & Remediation Plan

#### Phase 4: Advanced Risk & Workflow Intelligence (Next Priority)
1.  **AI Engine**: Upgrade `ComplianceRiskService` to support **Weighted Scoring** configuration (e.g. Tenure=30pts, Location=20pts).
2.  **Workflow**: Upgrade `ComplianceApprovalService` to support **Multi-Step Escalation** (Manager -> HR -> Compliance Officer).
3.  **UI**: Add "Risk Configuration" tab to `ComplianceGovernance`.

#### Phase 5: Data Privacy & Security Hardening
1.  **Backend**: Implement `@MaskPII` decorator in `PersonService` based on `hasAorAccess`.
2.  **Backend**: Fix `AorService` to prevent Admin lockout (Default Role check).
3.  **UI**: Enhance `SecurityProfiles` page with AOR-to-Person mapping grid.

---

### 🛑 EXPLICIT STOP
❌ **DO NOT BUILD YET.** Awaiting technical review of the Phase 4 remediation plan.

---
