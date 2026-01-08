const BASE_URL = "http://localhost:5001";

async function run() {
    try {
        console.log("1. Logging in...");
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@nexusaifirst.cloud", password: "Admin@2025!" })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);

        // Get cookie
        const cookies = loginRes.headers.get("set-cookie");
        if (!cookies) throw new Error("No cookie received");

        // Extract connect.sid
        const sid = cookies.split(';')[0];
        console.log("Logged in. SID:", sid);

        const headers = {
            "Content-Type": "application/json",
            "Cookie": sid
        };

        console.log("2. Creating Lead...");
        const leadPayload = {
            firstName: "Verify",
            lastName: "Script",
            name: "Verify Script",
            company: "Verification Corp",
            email: `verify_${Date.now()}@example.com`,
            status: "new",
            source: "web"
        };

        const createRes = await fetch(`${BASE_URL}/api/leads`, {
            method: "POST",
            headers,
            body: JSON.stringify(leadPayload)
        });

        if (!createRes.ok) throw new Error(`Create Lead failed: ${await createRes.text()}`);
        const lead = await createRes.json();
        console.log("Lead Created:", lead.id);

        console.log("3. Converting Lead...");
        const convertRes = await fetch(`${BASE_URL}/api/leads/${lead.id}/convert`, {
            method: "POST",
            headers
        });

        if (!convertRes.ok) throw new Error(`Convert Lead failed: ${await convertRes.text()}`);
        const result = await convertRes.json();
        console.log("Conversion Result:", result);

        if (!result.accountId || !result.contactId || !result.opportunityId) {
            throw new Error("Missing IDs in conversion result");
        }

        console.log("4. Verifying Entities...");

        // Check Account
        const accListRes = await fetch(`${BASE_URL}/api/crm/accounts`, { headers });
        const accounts = await accListRes.json();
        // @ts-ignore
        const account = accounts.find((a: any) => a.id === result.accountId);
        if (!account) throw new Error("Account not found");
        console.log("Account Verified:", account.name);

        // Check Contact
        const contListRes = await fetch(`${BASE_URL}/api/crm/contacts`, { headers });
        const contacts = await contListRes.json();
        // @ts-ignore
        const contact = contacts.find((c: any) => c.id === result.contactId);
        if (!contact) throw new Error("Contact not found");
        console.log("Contact Verified:", contact.firstName, contact.lastName);

        // Check Opportunity
        const oppListRes = await fetch(`${BASE_URL}/api/crm/opportunities`, { headers });
        const opportunities = await oppListRes.json();
        // @ts-ignore
        const opportunity = opportunities.find((o: any) => o.id === result.opportunityId);
        if (!opportunity) throw new Error("Opportunity not found");
        console.log("Opportunity Verified:", opportunity.name);

        console.log("SUCCESS: Lead Conversion Verification Passed!");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
