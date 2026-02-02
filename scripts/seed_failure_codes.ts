
import { db } from "../server/db";
import { maintFailureCodes } from "../shared/schema/index";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Seeding Failure Codes...");

    // 1. Problems
    const [p1] = await db.insert(maintFailureCodes).values({
        code: "OVERHEAT",
        name: "Abnormal Temp / Overheating",
        type: "PROBLEM"
    }).onConflictDoNothing().returning();

    const [p2] = await db.insert(maintFailureCodes).values({
        code: "VIBRATION",
        name: "Excessive Vibration",
        type: "PROBLEM"
    }).onConflictDoNothing().returning();

    console.log("✅ Problems Seeded");

    // 2. Causes
    const prob1 = p1 || (await db.select().from(maintFailureCodes).where(eq(maintFailureCodes.code, "OVERHEAT")))[0];

    const [c1] = await db.insert(maintFailureCodes).values({
        code: "BEARING_WEAR",
        name: "Bearing Wear / Fatigue",
        type: "CAUSE",
        parentId: prob1.id
    }).onConflictDoNothing().returning();

    const [c2] = await db.insert(maintFailureCodes).values({
        code: "LUBE_LEAK",
        name: "Lubricant Leakage",
        type: "CAUSE",
        parentId: prob1.id
    }).onConflictDoNothing().returning();

    console.log("✅ Causes Seeded");

    // 3. Remedies
    const cause1 = c1 || (await db.select().from(maintFailureCodes).where(eq(maintFailureCodes.code, "BEARING_WEAR")))[0];

    await db.insert(maintFailureCodes).values({
        code: "REPLACE_BEARING",
        name: "Replace Bearing Assembly",
        type: "REMEDY",
        parentId: cause1.id
    }).onConflictDoNothing();

    console.log("✅ Remedies Seeded");
    console.log("✨ Failure Code Seeding Complete.");
    process.exit(0);
}

seed();
