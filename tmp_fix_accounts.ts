import { db } from "./server/db";
import { glCodeCombinations } from "./shared/schema/finance";
import { like } from "drizzle-orm";

async function run() {
    try {
        await db.update(glCodeCombinations).set({ accountType: "Liability" }).where(like(glCodeCombinations.code, "%2000%"));
        await db.update(glCodeCombinations).set({ accountType: "Asset" }).where(like(glCodeCombinations.code, "%1110%"));
        console.log("Account categories fixed for Liability and Asset");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
