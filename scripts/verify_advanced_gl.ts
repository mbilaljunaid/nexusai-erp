
import { db } from "../server/db";
import { glDailyRates, glCodeCombinations, glPeriods, apInvoices } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Configuration
const API_URL = "http://localhost:5001/api/finance";
const LEDGER_ID = "primary-ledger-001";
const PERIOD_NAME = "Jan-2026";
const CURRENCY = "GBP";

let sessionCookie = "";

// Helper for fetch
async function request(method: string, path: string, body?: any) {
    const url = path.startsWith("http") ? path : `${API_URL}${path}`;
    const headers: any = { "Content-Type": "application/json" };
    if (sessionCookie) headers["Cookie"] = sessionCookie;

    const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    };
    const res = await fetch(url, options);

    // Capture cookie
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
        sessionCookie = setCookie;
    }

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`Invalid JSON Response (${res.status}): ${text.substring(0, 100)}`);
    }

    if (!res.ok) throw new Error(JSON.stringify(data));
    return { data };
}

async function login() {
    try {
        console.log("Logging in...");
        await request("POST", "http://localhost:5001/api/auth/login", { email: "admin@nexusaifirst.cloud", password: "Admin@2025!" });
        console.log("Login successful.");
    } catch (e: any) {
        console.log("Login failed: " + e.message);
        throw e;
    }
}

async function verifyAdvancedGL() {
    console.log("🚀 Starting Advanced GL Verification...");

    try {
        await login();

        // 1. SEED DATA (Direct DB)
        // Ensure Period
        const [period] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, PERIOD_NAME));
        if (!period) throw new Error(`Period ${PERIOD_NAME} must be seeded manually or via startup.`);

        // Ensure Rate
        await db.insert(glDailyRates).values({
            fromCurrency: CURRENCY,
            toCurrency: "USD",
            conversionDate: new Date(),
            conversionType: "Spot",
            rate: "1.25" // 1 GBP = 1.25 USD
        }).onConflictDoNothing();
        console.log("✅ Seeded Daily Rate: GBP -> USD = 1.25");

        // 2. REVALUATION TEST
        console.log("\n🧪 Testing Revaluation...");
        // Create a Journal in GBP
        let journalId;
        try {
            const [ccid] = await db.select().from(glCodeCombinations).limit(1);
            const accountId = ccid.id;

            const journalRes = await request("POST", "/gl/journals", {
                journal: {
                    journalNumber: `J-GBP-${Date.now()}`,
                    description: "GBP Transaction",
                    ledgerId: LEDGER_ID,
                    periodId: period.id,
                    currencyCode: CURRENCY,
                    source: "Manual",
                    category: "Adjustment"
                },
                lines: [
                    { accountId, enteredDebit: "1000", enteredCredit: "0" },
                    { accountId, enteredDebit: "0", enteredCredit: "1000" }
                ]
            });
            journalId = journalRes.data.id;

            // Post it
            await request("POST", `/gl/journals/${journalId}/post`);
            console.log("   Posted GBP Journal.");
        } catch (e: any) { console.error("Reval Prep Failed:", e.message); throw e; }

        // Wait for worker
        await new Promise(r => setTimeout(r, 2000));

        // Run Revaluation
        const revalRes = await request("POST", "/gl/revaluations/run", {
            ledgerId: LEDGER_ID,
            periodName: PERIOD_NAME,
            currencyCode: CURRENCY
        });

        console.log("   Revaluation Result:", revalRes.data);
        if (revalRes.data.success) console.log("✅ Revaluation Success");
        else console.error("❌ Revaluation Failed");

        // 3. RECURRING JOURNALS TEST
        console.log("\n🧪 Testing Recurring Journals...");
        const ruleRes = await request("POST", "/gl/recurring-journals", {
            name: "Monthly Rent",
            ledgerId: LEDGER_ID,
            scheduleType: "Monthly",
            nextRunDate: new Date(Date.now() - 86400000), // Yesterday (Due)
            journalTemplate: {
                lines: [
                    { accountId: (await db.select().from(glCodeCombinations).limit(1))[0].id, debit: "500", credit: "0" },
                    { accountId: (await db.select().from(glCodeCombinations).limit(1))[0].id, debit: "0", credit: "500" }
                ]
            }
        });
        console.log("   Created Recurring Rule:", ruleRes.data.id);

        const processRes = await request("POST", "/gl/recurring-journals/process", { ledgerId: LEDGER_ID });
        console.log("   Process Result:", processRes.data);
        if (processRes.data.processed.length > 0) console.log("✅ Recurring Journal Generated");
        else console.error("❌ No Recurring Journal Generated");

        // 4. AUTO-REVERSE TEST
        console.log("\n🧪 Testing Auto-Reverse...");
        // Create Reversible Journal
        const [ccid2] = await db.select().from(glCodeCombinations).limit(1);

        const revJournalRes = await request("POST", "/gl/journals", {
            journal: {
                journalNumber: `J-REV-${Date.now()}`,
                ledgerId: LEDGER_ID,
                periodId: period.id,
                description: "Accrual to Reverse",
                currencyCode: "USD",
                autoReverse: false // Start false
            },
            lines: [
                { accountId: ccid2.id, enteredDebit: "100", enteredCredit: "0" },
                { accountId: ccid2.id, enteredDebit: "0", enteredCredit: "100" }
            ]
        });
        const revJId = revJournalRes.data.id;

        // Toggle flag
        const toggleRes = await request("POST", `/gl/journals/${revJId}/toggle-auto-reverse`);
        console.log(`   Toggled Auto-Reverse: ${toggleRes.data.autoReverse}`);
        if (toggleRes.data.autoReverse !== true) throw new Error("Toggle failed");

        // Post it
        await request("POST", `/gl/journals/${revJId}/post`);
        await new Promise(r => setTimeout(r, 1000));

        // Process Reversals
        const autoRevRes = await request("POST", "/gl/auto-reversals/process", { ledgerId: LEDGER_ID, periodName: PERIOD_NAME });
        console.log("   Auto-Reverse Result:", autoRevRes.data);
        if (autoRevRes.data.reversedJournalIds.length > 0) console.log("✅ Auto-Reverse Success");
        else console.error("❌ Auto-Reverse Failed");

        // 5. RECONCILIATION TEST
        console.log("\n🧪 Testing Reconciliation...");
        // Create AP Invoice (Unpaid)
        await db.insert(apInvoices).values({
            invoiceNumber: `INV-${Date.now()}`,
            supplierId: 1,
            invoiceAmount: "999.00",
            paymentStatus: "UNPAID",
            invoiceDate: new Date(),
            invoiceCurrencyCode: "USD",
            paymentCurrencyCode: "USD"
        }).onConflictDoNothing();

        const reconRes = await request("GET", `/gl/reconciliation/${LEDGER_ID}?periodName=${PERIOD_NAME}`);
        console.log("   Reconciliation Summary:", reconRes.data);
        if (reconRes.data.ap.subledgerBalance !== 0) console.log("✅ Reconciliation Data Found");
        else console.warn("⚠️ Reconciliation Data Empty (Check AP Invoice Seeding)");

    } catch (error: any) {
        console.error("❌ Verification Failed:", error.message || error);
        process.exit(1);
    }
}

verifyAdvancedGL();
