
import { closeEngine } from "../server/services/period-close/CloseEngine";
import { db } from "../server/db";
import { glPeriods } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting Close Engine Verification...");

    const ledgerId = "PRIMARY";

    // 1. Get a period to test
    const [period] = await db.select().from(glPeriods).limit(1);
    if (!period) {
        console.error("No periods found in DB. Run seed script first.");
        process.exit(1);
    }
    const periodName = period.periodName;
    console.log(`Testing with Period: ${periodName}`);

    // 2. Test Get Status
    const status = await closeEngine.getCloseStatus(ledgerId);
    console.log("Current Statuses:", status);

    // 3. Test Open Period (GL)
    console.log(`Opening GL Period ${periodName}...`);
    const openRes = await closeEngine.openPeriod(ledgerId, periodName, "GL");
    console.log("Open Result:", openRes);

    // 4. Test Open Period (AP - Subledger)
    console.log(`Opening AP Period ${periodName}...`);
    const openApRes = await closeEngine.openPeriod(ledgerId, periodName, "AP");
    console.log("Open AP Result:", openApRes);

    // 5. Test Close Period (Should fail if subledgers are open? No, closeEngine checks subledgers only if closing GL)
    // Let's try to close GL while AP is Open (Should Fail)
    console.log(`Attempting to Close GL Period ${periodName} (Expect Failure due to Open AP)...`);
    try {
        await closeEngine.closePeriod(ledgerId, periodName, "GL");
    } catch (e: any) {
        console.log("Caught Expected Error:", e.message);
    }

    // 6. Close AP
    console.log(`Closing AP Period ${periodName}...`);
    await closeEngine.closePeriod(ledgerId, periodName, "AP");
    console.log("AP Closed.");

    // 7. Close GL (Should Succeed now)
    console.log(`Closing GL Period ${periodName}...`);
    const closeRes = await closeEngine.closePeriod(ledgerId, periodName, "GL");
    console.log("Close Result:", closeRes);

    console.log("Verification Complete!");
    process.exit(0);
}

main().catch(console.error);
