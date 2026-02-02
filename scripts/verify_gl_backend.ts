
const API_BASE = "http://localhost:5001/api";

async function verifyGlRoutes() {
    console.log("🔍 Starting GL Route Verification...");

    // 1. Get a Ledger ID via API
    console.log("  Fetching Ledgers...");
    let ledgerId;
    try {
        const res = await fetch(`${API_BASE}/gl/ledgers`);
        if (res.status === 200) {
            const ledgers = await res.json();
            if (ledgers.length > 0) {
                ledgerId = ledgers[0].id;
                console.log(`  ✅ Found Ledger: ${ledgers[0].name} (${ledgerId})`);
            } else {
                console.error("❌ No ledgers found via API.");
                process.exit(1);
            }
        } else {
            console.error(`❌ Failed to list ledgers: ${res.status}`);
            process.exit(1);
        }
    } catch (e) {
        console.error("❌ Failed to connect to API to list ledgers", e);
        process.exit(1);
    }

    // 2. Test Posting Rules
    console.log("\n  🧪 Testing Posting Rules (/api/gl/posting-rules)...");
    try {
        const res = await fetch(`${API_BASE}/gl/posting-rules?ledgerId=${ledgerId}`);
        if (res.status === 200) {
            console.log("  ✅ GET /gl/posting-rules: 200 OK");
            const rules = await res.json();
            console.log(`     Found ${rules.length} posting rules.`);
        } else {
            console.error(`  ❌ GET /gl/posting-rules failed: ${res.status} ${res.statusText}`);
        }
    } catch (error) {
        console.error("  ❌ GET /gl/posting-rules connection failed:", error);
    }

    // 3. Test Data Access Sets
    console.log("\n  🧪 Testing Data Access Sets (/api/gl/access-sets)...");
    try {
        const res = await fetch(`${API_BASE}/gl/access-sets`);
        if (res.status === 200) {
            console.log("  ✅ GET /gl/access-sets: 200 OK");
            const sets = await res.json();
            console.log(`     Found ${sets.length} data access sets.`);
        } else {
            console.error(`  ❌ GET /gl/access-sets failed: ${res.status} ${res.statusText}`);
        }
    } catch (error) {
        console.error("  ❌ GET /gl/access-sets connection failed:", error);
    }

    // 4. Test CVR Alias
    console.log("\n  🧪 Testing CVR Alias (/api/gl/cvr)...");
    try {
        const res = await fetch(`${API_BASE}/gl/cvr`);
        if (res.status === 200) {
            console.log("  ✅ GET /gl/cvr: 200 OK");
        } else {
            console.error(`  ❌ GET /gl/cvr failed: ${res.status} ${res.statusText}`);
        }
    } catch (error) {
        console.error("  ❌ GET /gl/cvr connection failed:", error);
    }

    console.log("\n🏁 Verification Complete.");
}

verifyGlRoutes().catch(console.error);
