import { db } from "../server/db";
import { employees } from "../shared/schema/hr";
import { hrPersons, hrWorkRelationships, hrAssignments } from "../shared/schema/hr_worker";
import { hrOrganizations, hrJobs } from "../shared/schema/hr_structures";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting Core HR Migration...");

    const legacyEmployees = await db.select().from(employees);
    console.log(`Found ${legacyEmployees.length} legacy employees to migrate.`);

    for (const emp of legacyEmployees) {
        console.log(`Migrating: ${emp.firstName} ${emp.lastName}`);

        await db.transaction(async (tx) => {
            const [person] = await tx.insert(hrPersons).values({
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                personNumber: emp.email || `PER-${emp.id.substring(0, 8)}`,
                tenantId: "default",
            }).returning();

            // Placeholder for Work Relationship and Assignment creation
            // Requires a Legal Employer org to exist first
        });
    }

    console.log("Migration completed.");
}

main().catch(console.error);
