# Global HR Compliance & Governance - Gap Analysis & Feature Parity Heatmap

## [2026-02-04] - Level-15 CANONICAL AUDIT & RECONCILIATION

### 1. Merged Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion HR Compliance Pattern | Current Status | Gap / UX Issues | Remediation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Audit & Traceability** | 100% "Before/After" field-level snapshots. | ✅ Parity | `AuditLogService` implemented with deep-diffing. | Oracle-aligned pattern confirmed. |
| **Legislative Engine** | Dynamic rules based on `legislation_code`. | ✅ Parity | `RuleBuilder` supports US/UK/EU templates & recurring logic. | **Phase 3 Complete**. |
| **Reporting & Analytics** | "Compliance Velocity" & Risk Heatmaps. | ✅ Parity | `ComplianceAnalytics` with Velocity Chart. | **Phase 3 Complete**. |
| **Data Handling** | Server-side paging for >50k violations. | ✅ Parity | `listViolations` supports SQL offset/limit. | **Phase 3 Complete**. |
| **Risk Scoring** | Weighted risk scoring (Tenure, Location). | ✅ Parity | `ComplianceRiskService` uses `hr_risk_weights`. | **Phase 4 Complete**. |
| **Remediation Workflow** | Multi-step approval chains (Manager -> HR). | ✅ Parity | `ComplianceApprovalService` supports escalation. | **Phase 4 Complete**. |
| **Data Privacy (GDPR)** | AOR-based PII masking. | ✅ Parity | `@MaskPII` decorator implemented. Confidential Badges in UI. | **Phase 5 Complete**. |
| **Security (AOR)** | Multi-dimensional security profiles. | ✅ Parity | `AorService` implemented with Coverage Counts. | **Phase 5 Complete**. |
| **Consent Management** | Employee policy acknowledgement tracking. | ✅ Parity | `PolicyAcknowledgementService` + ESS `MyConsents` UI. | **Phase 6 Complete**. |
| **Right to Erasure** | GDPR "Forget Me" cascading delete. | ✅ Parity | `AnonymizationService` scrubs PII (Name/NID/DOB). | **Phase 6 Complete**. |
| **SoD Controls** | Segregation of Duties conflict detection. | ✅ Parity | `SoDService` implemented with Matrix UI & API. | **Phase 7 Complete**. |

---

### 2. Level-15 Canonical Decomposition (18 Dimensions)

#### Dimension 1: End-to-End Compliance Lifecycle
*   **Level 1-5**: Global HR Domain, Regulatory Sub-domain.
*   **Level 6 (UI Surfaces)**: `ComplianceGovernance.tsx`, `SecurityProfiles.tsx`, `EmploymentProfile.tsx`, `MyConsents.tsx`.
*   **Level 7 (Components)**: `StandardTable`, `MyConsents` (Sidebar Widget).
*   **Level 11 (Workflow)**: `ComplianceApprovalService`, `AnonymizationService` (Erasure Workflow).
*   **Level 12 (Rules)**: `RuleBuilder` with MODULO operators (Verified).
*   **Level 13 (AI)**: `ComplianceRiskService` with DB-driven Weighted Scoring (Verified).
*   **Level 14 (Security)**: `AorService` enforces Row-Level Security & PII Masking (Verified).
*   **Level 15 (Scalability)**: Server-side pagination verified for large datasets.

#### Dimension 2: Security & Privacy ("The Vault")
*   **Level 6**: `SecurityProfiles` UI shows AOR Coverage (Done). `MyConsents` shows pending policies.
*   **Level 10**: `hr_aor`, `hr_policy_acknowledgements`.
*   **Level 14**: `@MaskPII` decorator (Redaction), `AnonymizationService` (Erasure).

---
---

### 3. Business Impact & Adoption Risk
1.  **Compliance Risk (Low)**: PII masking and AORs are now enforced, significantly reducing data leak risks.
2.  **Workflow Efficiency (High)**: Multi-step approvals ensure proper governance without manual email chains.
3.  **Adoption Advantage**: "Confidential" badges and Coverage metrics build trust with HR Admins.

---

### 4. Ordered, Build-Ready Task List & Remediation Plan

#### Phase 6: GDPR & Employee Rights (New Priority)
1.  **Consent Management**: Create `hr_policy_acknowledgements` to track employee sign-offs (Level-10).
2.  **Right to Erasure**: Implement `AnonymizationService` to scrub PII across `hr_persons` and `hr_audit_logs` (Level-14).
3.  **UI**: Add "My Privacy" section to ESS (Employee Self-Service).

#### Phase 7: Advanced Governance (SoD) (Completed)
1.  **SoD Engine**: Implement `SoDService` to detect conflicting roles (e.g., Payroll Admin + Payment Approver). ✅
2.  **Reporting**: Add "SoD Conflicts" widget to `ComplianceGovernance`. ✅ (Admin UI `/admin/sod`)

---

### 🛑 EXPLICIT STOP
❌ **DO NOT BUILD YET.** Awaiting technical review of the Phase 6 remediation plan.
---
