
import { db } from "../server/db";
import { hrPersons } from "@shared/schema/hr_worker";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Seeding Diversity Data (Gender)...");

    const tenantId = "default";

    const allPersons = await db.select().from(hrPersons).where(eq(hrPersons.tenantId, tenantId));
    console.log(`Found ${allPersons.length} persons to update.`);

    let maleCount = 0;
    let femaleCount = 0;

    for (const person of allPersons) {
        // Simple random assignment for demo data
        // 60% Female for a diverse tech company :)
        const isFemale = Math.random() > 0.4;
        const gender = isFemale ? 'F' : 'M';

        await db.update(hrPersons)
            .set({ gender })
            .where(eq(hrPersons.id, person.id));

        if (isFemale) femaleCount++; else maleCount++;
    }

    console.log(`Diversity Seed Complete.`);
    console.log(`Assigned Female: ${femaleCount}, Male: ${maleCount}`);
}

main().catch(console.error);
