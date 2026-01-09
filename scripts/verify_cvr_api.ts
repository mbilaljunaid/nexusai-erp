
import { db } from "../server/db";

const BASE_URL = "http://localhost:5001";

async function runTests() {
    console.log("Starting CVR API Verification...");

    // 1. Login to get session cookie
    let cookie = "";
    try {
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin@nexusaifirst.cloud",
                password: "Admin@2025!"
            })
        });

        if (!loginRes.ok) throw new Error("Login failed");
        const setCookie = loginRes.headers.get("set-cookie");
        if (!setCookie) throw new Error("No cookie received");
        cookie = setCookie;
        console.log("✅ Logged in successfully");
    } catch (e: any) {
        console.error("❌ Login Failed", e.message);
        process.exit(1);
    }

    const AUTH_HEADERS = {
        "Content-Type": "application/json",
        "Cookie": cookie
    };

    const ledgerId = "primary-ledger-001";
    const testRule = {
        ruleName: `Test CVR ${Date.now()}`,
        description: "Verify API functionality",
        errorMessage: "This combination is prohibited",
        includeFilter: "Segment1=01",
        excludeFilter: "Segment3=5000",
        enabled: true,
        ledgerId
    };

    let ruleId = "";

    try {
        // 2. Create CVR
        const createRes = await fetch(`${BASE_URL}/api/gl/cross-validation-rules`, {
            method: "POST",
            headers: AUTH_HEADERS,
            body: JSON.stringify(testRule)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create CVR failed: ${err}`);
        }
        const createdRule = await createRes.json();
        ruleId = createdRule.id;
        console.log("✅ Created CVR Rule:", ruleId);

        // 3. List CVRs
        const listRes = await fetch(`${BASE_URL}/api/gl/cross-validation-rules?ledgerId=${ledgerId}`, {
            headers: AUTH_HEADERS
        });
        if (!listRes.ok) throw new Error("List CVRs failed");
        const rules = await listRes.json();
        console.log(`✅ Listed Rules: ${rules.length} found`);

        const found = rules.find((r: any) => r.id === ruleId);
        if (!found) throw new Error("Created rule not found in list");
        console.log("✅ Validated created rule in list");

        // 4. Update CVR
        const updateRes = await fetch(`${BASE_URL}/api/gl/cross-validation-rules/${ruleId}`, {
            method: "PATCH",
            headers: AUTH_HEADERS,
            body: JSON.stringify({ description: "Updated via script" })
        });
        if (!updateRes.ok) throw new Error("Update CVR failed");
        const updatedRule = await updateRes.json();
        if (updatedRule.description !== "Updated via script") throw new Error("Update verification failed");
        console.log("✅ Updated CVR Rule");

        // 5. Delete CVR
        const deleteRes = await fetch(`${BASE_URL}/api/gl/cross-validation-rules/${ruleId}`, {
            method: "DELETE",
            headers: AUTH_HEADERS
        });
        if (deleteRes.status !== 204) throw new Error(`Delete CVR failed with status ${deleteRes.status}`);
        console.log("✅ Deleted CVR Rule");

        console.log("🎉 All CVR API Tests Passed!");
        process.exit(0);
    } catch (e: any) {
        console.error("❌ CVR API Test Failed:", e.message);
        process.exit(1);
    }
}

runTests();
