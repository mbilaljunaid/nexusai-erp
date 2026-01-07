-- EDUCATION SCHEMA (Postgres)
-- Multi-tenant with RLS

CREATE SCHEMA IF NOT EXISTS education;

-- STUDENTS
CREATE TABLE education.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    dob DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('APPLICANT', 'ACTIVE', 'PROBATION', 'GRADUATED', 'WITHDRAWN')),
    major VARCHAR(100),
    gpa DECIMAL(3, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COURSES (Catalog)
CREATE TABLE education.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(20) NOT NULL, -- CS101
    name VARCHAR(255) NOT NULL,
    credits DECIMAL(3, 1) DEFAULT 3.0,
    department_id UUID,
    description TEXT
);

-- SECTIONS (Offerings)
CREATE TABLE education.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES education.courses(id),
    term_id UUID NOT NULL, -- e.g. Fall 2025 ID
    faculty_id UUID NOT NULL, -- Ref to common.users or faculty table
    schedule_json JSONB, -- { days: ['Mon', 'Wed'], start: '10:00', end: '11:30' }
    room_id UUID,
    capacity INT NOT NULL,
    enrolled_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENROLLMENTS
CREATE TABLE education.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES education.students(id),
    section_id UUID NOT NULL REFERENCES education.sections(id),
    status VARCHAR(20) DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'WAITLISTED', 'DROPPED', 'COMPLETED')),
    grade VARCHAR(5), -- A, B+, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, section_id)
);

-- RLS
ALTER TABLE education.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_students ON education.students
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
