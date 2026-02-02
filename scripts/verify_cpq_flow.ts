
import { db } from "../server/db";
import {
    products, priceBooks, priceBookEntries, opportunities, opportunityLineItems, quotes, quoteLineItems,
    insertProductSchema, insertPriceBookSchema, insertPriceBookEntrySchema, insertOpportunitySchema
} from "../shared/schema/crm";
import { eq } from "drizzle-orm";

async function verifyCPQFlow() {
    console.log("🚀 Starting CPQ Verification Flow...");

    try {
        // 1. Setup Master Data (Product + Price Book)
        console.log("\n1️⃣  Setting up Master Data...");

        // Create Product
        const productCode = `TEST-PROD-${Date.now()}`;
        const [product] = await db.insert(products).values({
            name: "CPQ Test Widget",
            description: "A widget for testing CPQ",
            productCode: productCode,
            isActive: 1,
            unitPrice: "100.00" // Standard Price
        }).returning();
        console.log(`   ✅ Created Product: ${product.name} (Std Price: $100)`);

        // Create Price Book
        const [priceBook] = await db.insert(priceBooks).values({
            name: "VIP Customer Prices",
            description: "Special pricing for VIPs",
            isActive: 1,
            isStandard: 0
        }).returning();
        console.log(`   ✅ Created Price Book: ${priceBook.name}`);

        // Create Price Book Entry (Discounted Price)
        const [entry] = await db.insert(priceBookEntries).values({
            priceBookId: priceBook.id,
            productId: product.id,
            unitPrice: "85.00", // VIP Price
            isActive: 1
        }).returning();
        console.log(`   ✅ Created Price Book Entry: $85.00`);


        // 2. Opportunity Flow
        console.log("\n2️⃣  Testing Opportunity Flow...");

        // Create Opportunity
        const [opp] = await db.insert(opportunities).values({
            name: "CPQ Test Deal",
            stage: "qualification", // Use exact enum value from schema if needed, checking schema... assumes string
            amount: "0",
            closeDate: new Date(),
            accountId: null, // Optional for test
            ownerId: null,
            probability: 10
        }).returning();
        console.log(`   ✅ Created Opportunity: ${opp.name}`);

        // Update Opportunity with Price Book
        await db.update(opportunities)
            .set({ priceBookId: priceBook.id })
            .where(eq(opportunities.id, opp.id));
        console.log(`   ✅ Associated Price Book to Opportunity`);

        // Add Line Item (Simulate logic: typically UI does the lookup, but here we insert explicitly to verify DB constraints/types)
        // In the real app, the UI looks up the price. We will simulate that "intelligence" here.
        const [lineItem] = await db.insert(opportunityLineItems).values({
            opportunityId: opp.id,
            productId: product.id,
            priceBookEntryId: entry.id, // Link to the entry
            quantity: 2,
            unitPrice: "85.00", // Should match entry
            totalPrice: "170.00"
        }).returning();
        console.log(`   ✅ Added Line Item: Qty 2 @ $85.00 = $${lineItem.totalPrice}`);


        // 3. Quote Flow
        console.log("\n3️⃣  Testing Quote Sync Flow...");

        // Create Quote
        const [quote] = await db.insert(quotes).values({
            opportunityId: opp.id,
            quoteNumber: `Q-${Date.now()}`,
            name: "Final Proposal",
            status: "draft",
            totalAmount: "0",
            expirationDate: new Date()
        }).returning();
        console.log(`   ✅ Created Quote: ${quote.quoteNumber}`);

        // --- SIMULATE THE SYNC LOGIC (Server Route Logic) ---
        // (We are replicating the route logic here to verify it works against the DB)

        // Step A: Sync PriceBook ID
        const [refreshedOpp] = await db.select().from(opportunities).where(eq(opportunities.id, opp.id));
        if (refreshedOpp.priceBookId) {
            await db.update(quotes).set({ priceBookId: refreshedOpp.priceBookId }).where(eq(quotes.id, quote.id));
            console.log(`   ✅ Synced PriceBook ID to Quote`);
        } else {
            console.error(`   ❌ Failed to find PriceBook ID on Opportunity!`);
        }

        // Step B: Sync Line Items
        const oppItems = await db.select().from(opportunityLineItems).where(eq(opportunityLineItems.opportunityId, opp.id));
        for (const item of oppItems) {
            await db.insert(quoteLineItems).values({
                quoteId: quote.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                priceBookEntryId: item.priceBookEntryId
            });
        }
        console.log(`   ✅ Synced ${oppItems.length} line items to Quote`);


        // 4. Verification
        console.log("\n4️⃣  Final Verification...");
        const [finalQuote] = await db.select().from(quotes).where(eq(quotes.id, quote.id));
        const quoteItems = await db.select().from(quoteLineItems).where(eq(quoteLineItems.quoteId, quote.id));

        const check1 = finalQuote.priceBookId === priceBook.id;
        const check2 = quoteItems.length === 1;
        const check3 = quoteItems[0].priceBookEntryId === entry.id;
        const check4 = Number(quoteItems[0].unitPrice) === 85.00;

        console.log(`   Checking Quote PriceBook ID: ${check1 ? "PASS" : "FAIL"} (${finalQuote.priceBookId})`);
        console.log(`   Checking Item Count: ${check2 ? "PASS" : "FAIL"} (${quoteItems.length})`);
        console.log(`   Checking Entry Link: ${check3 ? "PASS" : "FAIL"} (${quoteItems[0].priceBookEntryId})`);
        console.log(`   Checking Price Accuracy: ${check4 ? "PASS" : "FAIL"} ($${quoteItems[0].unitPrice})`);

        if (check1 && check2 && check3 && check4) {
            console.log("\n🎉 CPQ FLOW VERIFICATION SUCCESSFUL 🎉");
        } else {
            console.error("\n❌ CPQ FLOW VERIFICATION FAILED");
            process.exit(1);
        }

    } catch (error) {
        console.error("Verification Error:", error);
        process.exit(1);
    } finally {
        // Cleanup (optional, keeping data for inspection usually better)
        process.exit(0);
    }
}

verifyCPQFlow();
