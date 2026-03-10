# Deep Parity Audit: HR Service Delivery (Journeys & Compliance)

This report provides a codebase parity analysis of the Nexus HR Checklists and Compliance modules against Oracle Journeys and EHS.

---

## 1. Database Schema Parity (`hr_checklists.ts`, `hr_compliance.ts`)

**Current Implementation:**
*   **Journeys (Checklists)**: Standard template schema (`hr_checklists`) mapped to runtime instances assigned to users (`hr_allocated_checklists`), detailing sequential line-item tasks.
*   **Compliance**: Phenomenal architectural setup for Regulatory Frameworks (GDPR/SOX), Segregation of Duties (SoD), Risk Weights, Policy Acknowledgements, and Violation remediation tracking.

**Oracle Gaps (Required Upgrades):**
*   **Help Desk / Ticketing**: Oracle HR Help Desk (HRHD) provides Service Request routing for employee inquiries. Nexus relies solely on the checklist mechanism, lacking an inbound HR ticketing system.
*   **Health and Safety (EHS)**: While `compliance.ts` handles regulations, Oracle Health & Safety records workplace Incidents, Near-Misses, and OSHA investigations, which require a specialized schema.

---

## 2. Backend API Parity

**Current Implementation:**
Likely standard REST handlers for compliance evaluation.

**Oracle Gaps (Required Upgrades):**
*   **Journey Trigger Engine**: Oracle automatically triggers Journeys based on Core HR events (e.g., if Action = 'Pregnancy', trigger 'Maternity Leave Journey'). Nexus lacks an Event-bus trigger mechanism linking Core HR to Checklists.
*   **Continuous Compliance Engine**: Missing a background cron job that continually evaluates Segregation of Duties conflicts.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Basic task UI.

**Oracle Gaps (Required Upgrades):**
*   **Employee Journey Portal**: Oracle has a consumer-grade 'Me' portal for a user to see pending tasks, compliance training, and policy sign-offs. 

---
**Upgrade Priority**: **MEDIUM**. The schema correctly models the Oracle Checklists layout, but needs event-based triggers to bring it to life.
