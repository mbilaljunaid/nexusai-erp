
import { db } from "../server/db";
import { db } from "../server/db";
import { suppliers, supplierUserIdentities, purchaseOrders, asnHeaders, asnLines } from "../shared/schema/scm";
import { apInvoices, apInvoiceLines } from "../shared/schema/ap";
import { eq } from "drizzle-orm";

const BASE_URL = `http://localhost:${process.env.PORT || 5001}`;

async function main() {
    console.log("🔍 Verifying iSupplier Portal Flow...");

    // 1. Setup Test Data
    console.log("\n1. Setting up Test Data...");
    const testEmail = `supplier_verify_${Date.now()}@test.com`;

    // Create Supplier
    const [supplier] = await db.insert(suppliers).values({
        name: "Verification Supplier Ltd",
        email: testEmail,
        status: "active"
    }).returning();
    console.log(`   - Created Supplier: ${supplier.id}`);

    // Create Identity (Token)
    const [identity] = await db.insert(supplierUserIdentities).values({
        supplierId: supplier.id,
        userId: "user_verify_1",
        portalToken: `verify_token_${Date.now()}`,
        status: "ACTIVE"
    }).returning();
    console.log(`   - Generated Token: ${identity.portalToken}`);

    // Create a Test PO
    const [po] = await db.insert(purchaseOrders).values({
        orderNumber: `PO-${Date.now()}`,
        supplierId: supplier.id,
        status: "SENT",
        totalAmount: "5000.00",
        orderDate: new Date()
    }).returning();
    console.log(`   - Created Test PO: ${po.orderNumber} (Status: ${po.status})`);

    // 2. Test Login (Token Validation)
    console.log("\n2. Testing External Login...");
    const loginRes = await fetch(`${BASE_URL}/api/portal/supplier/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: identity.portalToken })
    });

    if (loginRes.status !== 200) {
        throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    console.log("   - Login Successful");

    // 3. Test Dashboard (Get Orders)
    console.log("\n3. Testing Dashboard Data Access...");
    const ordersRes = await fetch(`${BASE_URL}/api/portal/supplier/orders`, {
        headers: { "x-portal-token": identity.portalToken }
    });

    if (ordersRes.status !== 200) throw new Error(`Fetch orders failed: ${ordersRes.status}`);
    const orders = await ordersRes.json();

    if (!orders.find((o: any) => o.id === po.id)) {
        throw new Error("   - FAILED: Created PO not found in portal list");
    }
    console.log(`   - Successfully fetched ${orders.length} orders`);

    // 4. Test PO Acknowledgment
    console.log("\n4. Testing PO Acknowledgment...");
    const ackRes = await fetch(`${BASE_URL}/api/portal/supplier/orders/${po.id}/acknowledge`, {
        method: "POST",
        headers: { "x-portal-token": identity.portalToken }
    });

    if (ackRes.status !== 200) throw new Error(`Acknowledgment failed: ${ackRes.status}`);
    console.log("   - Acknowledgment Endpoint returned Success");

    // Verify internal status updated
    const [updatedPo] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, po.id));
    if (updatedPo.status !== "OPEN") {
        throw new Error(`   - FAILED: PO Status did not change to OPEN. Current: ${updatedPo.status}`);
    }
    console.log(`   - Verified Internal Status: ${updatedPo.status} (OPEN)`);

    // 5. Test ASN Creation
    console.log("\n5. Testing ASN Creation...");
    const asnRes = await fetch(`${BASE_URL}/api/portal/supplier/asn`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-portal-token": identity.portalToken
        },
        body: JSON.stringify({
            poId: po.id,
            shipmentNumber: "SHIP-001",
            shippedDate: new Date().toISOString(),
            expectedArrivalDate: new Date().toISOString(),
            carrier: "FedEx",
            trackingNumber: "TRK123456789",
            lines: [{ poLineId: "line-1", itemId: "item-1", quantityShipped: 5 }]
        })
    });

    if (asnRes.status !== 200) {
        const err = await asnRes.json();
        throw new Error(`ASN Creation failed: ${JSON.stringify(err)}`);
    }
    const asnData = await asnRes.json();
    console.log(`   - ASN Created: ${asnData.asn.asnNumber} (ID: ${asnData.asn.id})`);

    // Verify ASN in DB
    const [dbAsn] = await db.select().from(asnHeaders).where(eq(asnHeaders.id, asnData.asn.id));
    if (!dbAsn) throw new Error("   - FAILED: ASN not found in database");
    console.log("   - ASN Verified in Database");


    // 6. Test Self-Service Invoice
    console.log("\n6. Testing PO to Invoice Conversion...");
    const invRes = await fetch(`${BASE_URL}/api/portal/supplier/orders/${po.id}/invoice`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-portal-token": identity.portalToken
        },
        body: JSON.stringify({
            invoiceNumber: `INV-${Date.now()}`,
            items: [{ poLineId: "line-1", quantity: 5, unitPrice: 100 }]
        })
    });

    if (invRes.status !== 200) {
        const err = await invRes.json();
        throw new Error(`Invoice Creation failed: ${JSON.stringify(err)}`);
    }
    const invData = await invRes.json();
    console.log(`   - Invoice Created: ${invData.invoiceId}`);

    // Verify Invoice in AP DB
    const [dbInv] = await db.select().from(apInvoices).where(eq(apInvoices.id, invData.invoiceId));
    if (!dbInv) throw new Error("   - FAILED: Invoice not found in AP database");
    console.log(`   - Invoice Verified in AP Database: ${dbInv.invoiceNumber} (Amount: ${dbInv.invoiceAmount})`);

    // 7. Test Supplier Scorecard
    console.log("\n7. Testing Supplier Scorecard...");
    const scoreRes = await fetch(`${BASE_URL}/api/portal/supplier/scorecard`, {
        headers: { "x-portal-token": identity.portalToken }
    });

    if (scoreRes.status !== 200) {
        const err = await scoreRes.json();
        throw new Error(`Scorecard Fetch failed: ${JSON.stringify(err)}`);
    }
    const scorecard = await scoreRes.json();
    console.log(`   - Scorecard Retrieved: Overall ${scorecard.overallScore}% (Delivery: ${scorecard.deliveryScore}%, Quality: ${scorecard.qualityScore}%)`);

    // Validate we got a result (even if 0/100 default)
    if (scorecard.supplierId !== supplier.id) {
        throw new Error("   - FAILED: Scorecard supplier ID mismatch");
    }

    console.log("\n✅ VERIFICATION COMPLETE: iSupplier Portal (ASN, Invoice, Scorecard) Logic is Sound.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ VERIFICATION FAILED:", err);
    process.exit(1);
});
