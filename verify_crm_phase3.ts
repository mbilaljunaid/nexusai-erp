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

        const cookies = loginRes.headers.get("set-cookie");
        if (!cookies) throw new Error("No cookie received");
        const sid = cookies.split(';')[0];
        console.log("Logged in. SID:", sid);

        const headers = {
            "Content-Type": "application/json",
            "Cookie": sid
        };

        // 1. Create a Test Account
        console.log("2. Creating Test Account...");
        const accPayload = {
            name: "Phase 3 Test Corp",
            industry: "Technology",
            status: "active"
        };
        const accRes = await fetch(`${BASE_URL}/api/crm/accounts`, {
            method: "POST", headers, body: JSON.stringify(accPayload)
        });
        if (!accRes.ok) throw new Error(`Create Account failed: ${await accRes.text()}`);
        const account = await accRes.json();
        console.log("Account Created:", account.id, account.name);

        // 2. Create Opportunity
        console.log("3. Creating Opportunity...");
        const oppPayload = {
            name: "Big Software Deal",
            accountId: account.id,
            stage: "proposal",
            probability: 75,
            amount: 50000,
            closeDate: new Date().toISOString(),
            description: "Phase 3 Verification Deal"
        };
        const oppRes = await fetch(`${BASE_URL}/api/crm/opportunities`, {
            method: "POST", headers, body: JSON.stringify(oppPayload)
        });
        if (!oppRes.ok) throw new Error(`Create Opportunity failed: ${await oppRes.text()}`);
        const opportunity = await oppRes.json();
        console.log("Opportunity Created:", opportunity.id, opportunity.name);

        // 3. Log Interaction on Account
        console.log("4. Logging Call on Account...");
        const callPayload = {
            entityType: "account",
            entityId: account.id,
            type: "call",
            summary: "Intro Call",
            description: "Discussed requirements",
            performedAt: new Date().toISOString()
        };
        const callRes = await fetch(`${BASE_URL}/api/crm/interactions`, {
            method: "POST", headers, body: JSON.stringify(callPayload)
        });
        if (!callRes.ok) throw new Error(`Log Call failed: ${await callRes.text()}`);
        const call = await callRes.json();
        console.log("Call Logged:", call.id);

        // 4. Log Interaction on Opportunity
        console.log("5. Logging Note on Opportunity...");
        const notePayload = {
            entityType: "opportunity",
            entityId: opportunity.id,
            type: "note",
            summary: "Internal Review",
            description: "Probability increased to 75%",
            performedAt: new Date().toISOString()
        };
        const noteRes = await fetch(`${BASE_URL}/api/crm/interactions`, {
            method: "POST", headers, body: JSON.stringify(notePayload)
        });
        if (!noteRes.ok) throw new Error(`Log Note failed: ${await noteRes.text()}`);
        const note = await noteRes.json();
        console.log("Note Logged:", note.id);

        // 5. Verify Interactions List for Account
        console.log("6. Verifying Account Interactions...");
        const accIntRes = await fetch(`${BASE_URL}/api/crm/interactions?entityType=account&entityId=${account.id}`, { headers });
        const accInteractions = await accIntRes.json();
        if (!Array.isArray(accInteractions) || accInteractions.length === 0) throw new Error("No interactions found for account");
        console.log("Account Interactions Found:", accInteractions.length);

        // 6. Verify Interactions List for Opportunity
        console.log("7. Verifying Opportunity Interactions...");
        const oppIntRes = await fetch(`${BASE_URL}/api/crm/interactions?entityType=opportunity&entityId=${opportunity.id}`, { headers });
        const oppInteractions = await oppIntRes.json();
        if (!Array.isArray(oppInteractions) || oppInteractions.length === 0) throw new Error("No interactions found for opportunity");
        console.log("Opportunity Interactions Found:", oppInteractions.length);

        console.log("SUCCESS: Phase 3 Verification Passed!");

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
