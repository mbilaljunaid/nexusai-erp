
import { db } from "@db";
import { sql, eq, and } from "drizzle-orm";
import { hrPersons, hrAssignments, hrWorkRelationships } from "@shared/schema/hr_worker";
import { hrOrganizations } from "@shared/schema/hr_structures";
import { hrmLearningEnrollments, hrmLearningOfferings, hrmLearningCourses } from "@shared/schema/talent_learning";
import { glJournals, glJournalLines, glAccounts } from "@shared/schema/finance";

async function verifyLmsIntegration() {
    console.log("🚦 Starting LMS Cross-Module Integration Testing...");
    const tenantId = "integration_test_" + Date.now();

    // ==========================================
    // 1. SETUP HR DATA (Manager/Worker)
    // ==========================================
    console.log("\n📦 Setting up HR Data...");

    // Create Org
    const [org] = await db.insert(hrOrganizations).values({
        tenantId,
        name: "Nexus University",
        classificationCode: "DEPT"
    }).returning();

    // Create Manager (Alice)
    const AliceId = "alice_" + Date.now();
    await db.insert(hrPersons).values({ id: AliceId, tenantId, personNumber: "MNGR-" + Date.now(), firstName: "Alice", lastName: "Manager", email: "alice@test.com" });

    // Create Worker (Bob)
    const BobId = "bob_" + Date.now();
    await db.insert(hrPersons).values({ id: BobId, tenantId, personNumber: "WRKR-" + Date.now(), firstName: "Bob", lastName: "Worker", email: "bob@test.com" });

    // Link in Assignments (Bob works for Alice)
    const [wr] = await db.insert(hrWorkRelationships).values({ tenantId, personId: BobId, legalEmployerId: org.id, dateStart: new Date().toISOString() }).returning();
    await db.insert(hrAssignments).values({
        tenantId,
        personId: BobId,
        workRelationshipId: wr.id,
        assignmentNumber: "E101",
        managerId: AliceId,
        effectiveStartDate: new Date().toISOString()
    });

    console.log("  - HR Setup Complete: Bob reports to Alice.");

    // ==========================================
    // 2. SETUP FINANCE DATA (Accounts)
    // ==========================================
    console.log("\n💰 Setting up Finance Data...");
    const [expAcc] = await db.insert(glAccounts).values({ accountCode: "EXP-6001-" + Date.now(), accountName: "Training Expense", accountType: "Expense" }).returning();
    const [liaAcc] = await db.insert(glAccounts).values({ accountCode: "LIA-2001-" + Date.now(), accountName: "Accounts Payable", accountType: "Liability" }).returning();
    console.log("  - Accounts Created: Expense and Liability.");

    // ==========================================
    // 3. PERFORM LMS ACTION (Paid Enrollment)
    // ==========================================
    console.log("\n🎓 Performing LMS Actions...");
    const [course] = await db.insert(hrmLearningCourses).values({ tenantId, title: "Adv Financial Modeling" }).returning();
    const [offering] = await db.insert(hrmLearningOfferings).values({
        tenantId,
        courseId: course.id,
        title: "Q1 Pro",
        price: "500.00",
        currency: "USD"
    }).returning();
    const [enrollment] = await db.insert(hrmLearningEnrollments).values({ tenantId, personId: BobId, offeringId: offering.id, status: "ENROLLED" }).returning();
    console.log(`  - Bob enrolled in Paid Course: ${course.title} ($500).`);

    // ==========================================
    // 4. TEST 1: HR INTEGRATION (Manager View)
    // ==========================================
    console.log("\n🔍 Verifying HR Integration (Manager Visibility)...");
    // Simulate Manager Query
    const teamLearning = await db.select({
        worker: hrPersons.firstName,
        course: hrmLearningCourses.title,
        status: hrmLearningEnrollments.status
    })
        .from(hrAssignments)
        .innerJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
        .innerJoin(hrmLearningEnrollments, eq(hrPersons.id, hrmLearningEnrollments.personId))
        .innerJoin(hrmLearningOfferings, eq(hrmLearningEnrollments.offeringId, hrmLearningOfferings.id))
        .innerJoin(hrmLearningCourses, eq(hrmLearningOfferings.courseId, hrmLearningCourses.id))
        .where(eq(hrAssignments.managerId, AliceId));

    if (teamLearning.length > 0 && teamLearning[0].worker === "Bob") {
        console.log("✅ Alice correctly sees Bob's enrollment in her dashboard.");
    } else {
        throw new Error("Manager visibility check failed!");
    }

    // ==========================================
    // 5. TEST 2: FINANCE INTEGRATION (GL Posting)
    // ==========================================
    console.log("\n🔍 Verifying Finance Integration (GL Posting)...");
    const { LearningFinancialBridge } = await import("../server/services/LearningFinancialBridge");

    const posting = await LearningFinancialBridge.interfaceToGL(tenantId, enrollment.id);
    console.log(`  - Financial Bridge Result: Journal ${posting.journalNumber} created.`);

    // Verify Lines
    const lines = await db.select().from(glJournalLines).where(eq(glJournalLines.journalId, posting.journalId!));
    if (lines.length === 2 && lines.some(l => l.enteredDebit === "500.00")) {
        console.log("✅ GL Journal entries created with correct amounts ($500 debit).");
    } else {
        throw new Error(`GL Verification failed! Expected 2 lines with $500, got ${lines.length} lines.`);
    }

    console.log("\n🎉 CROSS-MODULE INTEGRATION VERIFIED SUCCESSFULLY.");
    process.exit(0);
}

verifyLmsIntegration().catch((err) => {
    console.error("❌ Integration Error:", err);
    process.exit(1);
});
