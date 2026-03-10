# Deep Parity Audit: Candidate Experience & Recruitment

This report provides a granular codebase parity analysis of the Nexus Recruitment module against Oracle Recruiting Cloud (ORC/Taleo).

---

## 1. Database Schema Parity (`talent_recruitment.ts`)

**Current Implementation:**
A surprisingly deep implementation featuring Requisitions, Candidates (internal and external), Applications, Offers (with base/bonus breakouts), Interviews, customizable Pipeline Stages, Email Templates, and Onboarding tasks.

**Oracle Gaps (Required Upgrades):**
*   **Candidate Pooling / CRM**: ORC relies heavily on Candidate Talent Communities (CRM) for proactive sourcing before a requisition exists. Nexus lacks a schema for CRM sourcing campaigns. 
*   **Background Checks (Screening)**: Missing integration tables for 3rd party background checks or assessments (e.g., HireRight).

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Offer Letter Generation Engine**: Oracle dynamically generates PDF offer letters by merging Candidate, Job, and Salary data into BI Publisher RTF templates. Nexus stores a `offerLetterUrl` but lacks the backend document generation engine.
*   **Resume Parsing (AI)**: Oracle parses uploaded PDFs to autofill candidate profiles. Nexus stores the URL but has no backend parser service connected.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Career Site Builder**: ORC provides a WYSIWYG editor for HR to build public career portals. Nexus would require hardcoded React portals.
*   **Interviewer Feedback Rubrics**: Missing dynamic scoring matrix UIs for interviewers.

---
**Upgrade Priority**: **MEDIUM-HIGH**. A very strong foundation, but requires AI parsing and Document Generation to rival ORC.
