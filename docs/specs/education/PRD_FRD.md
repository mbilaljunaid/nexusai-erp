# EDUCATION INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" K-12, Higher Ed, Corporate Training

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
A holistic Student Information System (SIS) and Learning Management System (LMS) that tracks the entire learner lifecycle from admission to alumni, integrated with financial aid and AI tutoring.

### 1.2 Scope
*   **Segments:** Universities, Colleges, K-12 Districts, Professional Certification Bodies.
*   **Key Modules:**
    *   **Admissions:** CRM for recruitment, Applications, Enrollment.
    *   **Academics:** Course Catalog, Scheduling, Grading, Transcripts.
    *   **Finance:** Tuition billing, Financial Aid/Scholarships, Grants.
    *   **LMS Integration:** Content delivery, Assignments, Quizzes (LTI Standard).
    *   **Campus:** Housing, Dining plans, Library.

### 1.3 User Personas
*   **Registrar:** Manages records and course data.
*   **Faculty:** Teaches courses and grades students.
*   **Student:** Enrolls in classes, views grades, pays bills.
*   **Advisor:** Guides student success.

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Student
*   **Profile:** Demographics, Emergency Contacts, Health Records (compliance).
*   **Status:** `APPLICANT` -> `ACTIVE` -> `PROBATION` -> `GRADUATED` -> `WITHDRAWN`.

#### 2.1.2 Course & Section
*   **Course:** Catalog definition (e.g., CS101).
*   **Section:** specific instance (CS101-Fall2025-SectionA, Room 302, Mon/Wed).

#### 2.1.3 Enrollment
*   **Process:** Cart -> Validate Prerequisites -> Check Capacity -> Register.
*   **Waitlist:** Auto-promote when seat opens.

### 2.2 Workflows

#### 2.2.1 Registration
1.  **Planning:** Student adds courses to cart.
2.  **Audit:** System checks Degree Audit (Major requirements).
3.  **Registration:** Window opens. Student clicks "Enroll".
4.  **Billing:** Tuitions fees posted to Student Account.

#### 2.2.2 AI Action: Predict Dropout Risk
*   **Trigger:** Mid-term grades posted OR attendance drops < 70%.
*   **Input:** LMS Login frequency, Assignment scores, Financial holds.
*   **Output:** Risk Alert to Advisor.

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `PREDICT_DROPOUT_RISK`
*   **Description:** Identify at-risk students for early intervention.
*   **Action:** `EDUCATION.ADVISING.FLAG_STUDENT`
*   **Safety:** Privacy controls (FERPA) apply.

### 3.2 `OPTIMIZE_COURSE_SCHEDULE`
*   **Description:** Assign rooms and times to minimize conflicts and maximize seat utilization.
*   **Action:** `EDUCATION.REGISTRAR.PUBLISH_SCHEDULE`
*   **Constraint:** Faculty availability + Room Capacity.

### 3.3 `SUGGEST_LEARNING_PATH`
*   **Description:** Recommend electives based on career goals.
*   **Action:** `EDUCATION.DEGREE.UPDATE_PLAN`

---

## 4. REPORTING & ANALYTICS
*   **Retention Rate:** % of students returning next semester.
*   **Full-Time Equivalent (FTE):** Standardized enrollment count.
*   **Graduation Rate:** % graduating within N years.
*   **Faculty Load:** Credit hours taught per semester.
