
import "dotenv/config";
import { db } from "../server/db";
import { hrSodRules } from "@shared/schema";
import { SoDService } from "../server/modules/hr/services/SoDService";
import { eq } from "drizzle-orm";

async function verifySodConflict() {
    console.log("🔍 Verifying Segregation of Duties (SoD) Engine...");
    const tenantId = "tenant-1";
    const ROLE_PAYER = "PAYROLL_INITIATE";
    const ROLE_APPROVER = "PAYROLL_APPROVE";

    try {
        // 1. Setup Rule
        console.log("   - Setting up 'Toxic' Role Pair...");
        await db.delete(hrSodRules).where(eq(hrSodRules.tenantId, tenantId)); // Clean start
        await db.insert(hrSodRules).values({
            tenantId,
            roleCodeA: ROLE_PAYER,
            roleCodeB: ROLE_APPROVER,
            riskLevel: "CRITICAL",
            description: "Cannot initiate and verify payroll."
        });

        // 2. Test Safe Assignment
        console.log("🧪 Test 1: Assign Single Role (Safe)");
        const currentRoles = ["EMPLOYEE"];
        await SoDService.validateAssignment(currentRoles, ROLE_PAYER, tenantId);
        console.log("   ✅ Success: Allowed assignment of one half of the pair.");

        // 3. Test Conflict Assignment
        console.log("🧪 Test 2: Assign Conflicting Role (Should Fail)");
        const rolesWithPayer = [...currentRoles, ROLE_PAYER];
        try {
            await SoDService.validateAssignment(rolesWithPayer, ROLE_APPROVER, tenantId);
            console.error("   ❌ Failed: Should have thrown an error but didn't.");
            process.exit(1);
        } catch (e: any) {
            if (e.message.includes("SoD Violation")) {
                console.log(`   ✅ Success: Blocked assignment. Error: ${e.message}`);
            } else {
                console.error("   ❌ Failed: Wrong error thrown.", e);
                process.exit(1);
            }
        }

    } catch (error) {
        console.error("   ❌ Unexpected Error:", error);
        process.exit(1);
    }
    process.exit(0);
}

verifySodConflict();
