async function test() {
    try {
        console.log("Fetching suppliers...");
        const resSup = await fetch('http://localhost:5002/api/ap/suppliers', {
            headers: { 'x-business-unit-id': 'BU_US' } // Testing with descriptive string as seen in UI
        });
        if (!resSup.ok) throw new Error("Failed to fetch suppliers");

        const suppliers = await resSup.json();
        const globalTech = suppliers.find(s => s.name === "Global Tech Supplies Inc.") || suppliers[0];
        if (!globalTech) {
            console.log("No suppliers found");
            return;
        }
        console.log("Using Supplier:", globalTech.id, globalTech.name);

        console.log("Fetching sites...");
        const resSites = await fetch(`http://localhost:5002/api/ap/suppliers/${globalTech.id}/sites`);
        if (!resSites.ok) throw new Error("Failed to fetch sites");

        const sites = await resSites.json();
        if (!sites || sites.length === 0) {
            console.log("No site found for supplier");
            return;
        }
        console.log("Using Site:", sites[0].id, sites[0].siteName);

        const invoiceDateNow = new Date().toISOString();

        const invoicePayload = {
            header: {
                supplierId: globalTech.id,
                supplierSiteId: sites[0].id,
                businessUnitId: "BU_US",
                entBusinessUnitId: "BU_US",
                invoiceNumber: "PREP-" + Date.now(),
                invoiceDate: invoiceDateNow,
                transactionDate: invoiceDateNow,
                termsDate: invoiceDateNow,
                invoiceType: "PREPAYMENT",
                invoiceAmount: "1000.00",
                description: "Test Prepayment API"
            },
            lines: [
                {
                    lineNumber: 1,
                    lineType: "ITEM",
                    amount: "1000.00",
                    description: "Prepayment Line"
                }
            ]
        };

        console.log("Creating Prepayment Invoice...");
        const resInv = await fetch('http://localhost:5002/api/ap/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-business-unit-id': 'BU_US' },
            body: JSON.stringify(invoicePayload)
        });
        if (!resInv.ok) {
            console.log("Failed to create prepayment:", await resInv.text());
            return;
        }

        const inv = await resInv.json();
        console.log("Prepayment Created successfully:", inv.id);

        console.log("Validating Prepayment...");
        const resVal = await fetch(`http://localhost:5002/api/ap/invoices/${inv.id}/validate`, {
            method: 'POST',
            headers: { 'x-business-unit-id': 'BU_US' }
        });
        const valJson = await resVal.json();
        console.log("Validation Result:", valJson);

    } catch (e) {
        console.error("Test Error:", e);
    }
}
test();
