const fetch = require('node-fetch');

const run = async () => {
    try {
        const batchData = {
            batchDate: new Date().toISOString(),
            bankAccountId: "019488e0-6a0b-71ff-80c1-be5617a23c34", // Using a dummy UUID for the test
            currencyCode: "USD",
            totalAmount: "15500"
        };
        const itemsData = [
            {
                checkNumber: "CHK101",
                remittanceRef: "INV-GLO-001",
                payerName: "Globex Corporation",
                amount: "2500",
                itemDate: new Date().toISOString()
            },
            {
                checkNumber: "CHK102",
                remittanceRef: "INV-INI-002",
                payerName: "Initech LLC",
                amount: "13000",
                itemDate: new Date().toISOString()
            }
        ];

        console.log("Sending lockbox payload...");
        const response = await fetch('http://0.0.0.0:5003/api/ar/lockbox/batches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchData, itemsData })
        });

        const data = await response.json();
        console.log("Response:", data);

        const summaryResponse = await fetch('http://0.0.0.0:5003/api/ar/lockbox/summary');
        const summaryData = await summaryResponse.json();
        console.log("Summary Response:", summaryData);

    } catch (e) {
        console.error("Test error:", e);
    }
}
run();
