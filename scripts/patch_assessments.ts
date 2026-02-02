
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchAssessments() {
    console.log("🛠️  Patching Schema for Assessments (Quizzes)...");

    // 1. Assessments
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_assessments (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            description text,
            
            passing_score integer DEFAULT 80,
            max_attempts integer DEFAULT 3,
            time_limit_minutes integer,
            
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_assessments table");

    // 2. Questions
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_assessment_questions (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            assessment_id varchar NOT NULL REFERENCES hrm_learning_assessments(id),
            
            text text NOT NULL,
            type varchar DEFAULT 'MULTIPLE_CHOICE', -- MULTIPLE_CHOICE, TRUE_FALSE
            options jsonb, -- [{id: 1, text: "A"}, {id: 2, text: "B"}]
            correct_answer varchar, -- "1" or "true"
            points integer DEFAULT 10,
            
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_assessment_questions table");

    // 3. Attempts
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_assessment_attempts (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            
            enrollment_id varchar NOT NULL REFERENCES hrm_learning_enrollments(id),
            assessment_id varchar NOT NULL REFERENCES hrm_learning_assessments(id),
            
            score integer,
            passed boolean,
            answers jsonb, -- { questionId: answer }
            
            started_at timestamp DEFAULT now(),
            completed_at timestamp
        );
    `);
    console.log("- Created hrm_learning_assessment_attempts table");

    console.log("✅ Assessments Schema Patched Successfully.");
    process.exit(0);
}

patchAssessments().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
