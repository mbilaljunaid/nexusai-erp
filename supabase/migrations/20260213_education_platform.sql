-- =====================================================
-- Education Platform - Complete Schema
-- Modules: 7.1-7.3 - Financial Aid, Admissions, SIS
-- =====================================================

-- =====================================================
-- FINANCIAL AID
-- =====================================================

CREATE TABLE financial_aid_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    application_number VARCHAR(100) UNIQUE NOT NULL,
    student_id UUID NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    efc DECIMAL(12,2), -- Expected Family Contribution
    total_need DECIMAL(12,2),
    total_awarded DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'pending',
    submitted_date DATE,
    reviewed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE aid_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES financial_aid_applications(id),
    aid_type VARCHAR(50) CHECK (aid_type IN ('grant', 'scholarship', 'loan', 'work_study')),
    amount DECIMAL(10,2),
    disbursement_schedule JSONB,
    accepted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADMISSIONS
-- =====================================================

CREATE TABLE admission_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    application_number VARCHAR(100) UNIQUE NOT NULL,
    applicant_id UUID NOT NULL,
    program_id UUID NOT NULL,
    entry_term VARCHAR(20), -- 'Fall 2026', 'Spring 2027'
    application_type VARCHAR(50) CHECK (application_type IN ('freshman', 'transfer', 'graduate', 'international')),
    gpa DECIMAL(3,2),
    test_scores JSONB, -- SAT, ACT, GRE, etc.
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
        'submitted',
        'under_review',
        'accepted',
        'waitlisted',
        'denied',
        'enrolled'
    )),
    decision_date DATE,
    enrollment_deposit_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    document_type VARCHAR(50), -- 'transcript', 'essay', 'recommendation'
    document_url VARCHAR(500),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STUDENT INFORMATION SYSTEM (SIS)
-- =====================================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    enrollment_status VARCHAR(50) CHECK (enrollment_status IN (
        'enrolled',
        'on_leave',
        'withdrawn',
        'graduated',
        'expelled'
    )),
    program_id UUID,
    entry_date DATE,
    expected_graduation_date DATE,
    cumulative_gpa DECIMAL(3,2),
    total_credits_earned INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id),
    course_id UUID NOT NULL,
    term VARCHAR(20),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    grade VARCHAR(5),
    credits INT,
    status VARCHAR(50) DEFAULT 'enrolled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE academic_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id),
    term VARCHAR(20),
    term_gpa DECIMAL(3,2),
    term_credits INT,
    cumulative_gpa DECIMAL(3,2),
    cumulative_credits INT,
    academic_standing VARCHAR(50), -- 'good_standing', 'probation', 'suspension'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_aid_apps_student ON financial_aid_applications(student_id);
CREATE INDEX idx_admissions_status ON admission_applications(status);
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_enrollments_student ON course_enrollments(student_id);
