import { db } from "../server/db";
import { hrAuditLogs } from "../shared/schema/hr_audit";
import { hrPersons, hrAssignments, hrOrganizations, hrAor, hrWorkRelationships } from "../shared/schema";
import { AuditLogService } from "../server/modules/hr/services/AuditLogService";
import { eq, and } from "drizzle-orm";

async function verify() {
    console.log("🚀 Starting Phase 7 Verification: Advanced Auditing...");
    const tenantId = "test-tenant-v7";

    try {
        // 1. Cleanup
        await db.delete(hrAuditLogs).where(eq(hrAuditLogs.tenantId, tenantId));
        await db.delete(hrAor).where(eq(hrAor.tenantId, tenantId));
        await db.delete(hrAssignments).where(eq(hrAssignments.tenantId, tenantId));
        await db.delete(hrPersons).where(eq(hrPersons.tenantId, tenantId));
        await db.delete(hrOrganizations).where(eq(hrOrganizations.tenantId, tenantId));

        // 2. Setup Data
        const [leUS] = await db.insert(hrOrganizations).values({
            tenantId, name: "US Legal Employer", classificationCode: "LEGAL_EMPLOYER"
        }).returning();

        const [deptUS] = await db.insert(hrOrganizations).values({
            tenantId, name: "US Dept", classificationCode: "DEPARTMENT"
        }).returning();

        const [person] = await db.insert(hrPersons).values({
            tenantId, firstName: "Audit", lastName: "Test", personNumber: "AUDIT001", email: "audit@test.com"
        }).returning();

        const [rel] = await db.insert(hrWorkRelationships).values({
            tenantId, personId: person.id, legalEmployerId: leUS.id, dateStart: new Date(), primaryFlag: true
        }).returning();

        await db.insert(hrAssignments).values({
            tenantId, personId: person.id, departmentId: deptUS.id, primaryAssignmentFlag: true,
            assignmentStatus: "ACTIVE", effectiveStartDate: new Date(), assignmentNumber: "E-AUDIT001",
            workRelationshipId: rel.id
        });

        // 3. Test Deep Diffing
        console.log("📝 Testing Field-Level Diffing...");
        const oldData = { firstName: "Audit", lastName: "Test", email: "audit@test.com", salary: 5000 };
        const newData = { firstName: "Audited", lastName: "Test", email: "audit@new.com", salary: 6000 };

        const log = await AuditLogService.logUpdate({
            tenantId,
            actorId: "admin-v7",
            entityType: "PERSON",
            entityId: person.id,
            oldData,
            newData
        });

        if (!log) throw new Error("Log update failed to produce a record.");

        const changes = log.changes as any;
        if (changes.firstName.old !== "Audit" || changes.firstName.new !== "Audited") throw new Error("Diff failed for firstName");
        if (changes.salary.new !== 6000) throw new Error("Diff failed for salary");

        console.log("✅ Field-level diffing verified.");

        // 4. Test AOR Filtering
        console.log("🔐 Testing AOR Security for Logs...");
        const regionalHrId = "hr-us-v7";
        await db.insert(hrAor).values({
            tenantId, personId: regionalHrId, scopeType: "DEPARTMENT", scopeValueId: deptUS.id, responsibilityType: "HR_REP"
        });

        const logsForHr = await AuditLogService.listLogs(tenantId, regionalHrId);
        if (logsForHr.length === 0) throw new Error("HR Representative should see logs for their department.");

        console.log("✅ AOR-based log visibility verified.");

        console.log("\n🎊 Phase 7 Auditing SUCCESS: Field-level diffing & AOR security verified.");

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verify();
