# Deep Parity Audit: Learning Management

This report provides a granular codebase parity analysis of the Nexus Learning module against Oracle Learning Cloud.

---

## 1. Database Schema Parity (`talent_learning.ts`)

**Current Implementation:**
Incredibly detailed structure matching the Oracle Catalog setup: Communities -> Curricula -> Courses -> Offerings (Classes) -> Content Items. Includes Assessments, Enrollments, Audit Logs, and compliance Certifications.

**Oracle Gaps (Required Upgrades):**
*   **Learning Initiatives / Campaigns**: Oracle can push mandatory learning to specific organizational slices (e.g. "All Sales Reps hired after X"). Nexus lacks the Initiative distribution schema.
*   **SCORM / xAPI Tracking Data**: While Nexus links to content items, it lacks the massive blob-storage tables needed to record granular frame-by-frame SCORM/xAPI player interactions.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Compliance Renewal Engine**: Certifications need a continually running background job that checks `validityPeriodDays` and automatically re-enrolls workers into expired courses.
*   **SCORM Player Wrapper**: A backend API is required to act as the SCORM Rustici engine, receiving JavaScript pings from the module and updating the `progressPercent` safely.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Learning Content Player**: A specialized modal UI configured to safely iframe SCORM, Video, and PDF content while intercepting progress calls.

---
**Upgrade Priority**: **HIGH**. The catalog structure is flawless for an enterprise system, but it cannot function without the SCORM Player wrapper and background Compliance Renewal engines.
