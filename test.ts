import { apService } from "./server/services/ap";
import { db } from "./server/db";

async function run() {
    const result = await apService.listInvoices();
    // process.stdout.write(JSON.stringify(result[0], null, 2));
    console.dir(result[0], { depth: null });
    process.exit(0);
}
run();
