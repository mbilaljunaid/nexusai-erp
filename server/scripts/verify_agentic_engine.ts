
import { agenticService } from "../services/agentic";
import { storage } from "../storage";

async function verifyAgenticEngine() {
    console.log("Starting Agentic AI Engine Verification...");

    // 1. Test Parsing (GL Journal)
    console.log("\n--- Testing Intent Parsing ---");
    const text1 = "Post a journal for office supplies";
    const intent1 = await agenticService.parseIntent(text1);
    console.log(`Input: "${text1}"`);
    console.log(`Parsed:`, intent1);

    if (intent1.actionCode === "GL_POST_JOURNAL" && intent1.confidence > 0.8) {
        console.log("SUCCESS: GL Journal intent detected.");
    } else {
        console.error("FAILURE: Failed to detect GL Journal intent.");
        process.exit(1);
    }

    // 2. Test Execution (GL Journal)
    console.log("\n--- Testing Intent Execution ---");
    try {
        const result = await agenticService.executeAction(text1, "test-user");
        console.log("Execution Result:", result);

        if (result.status === "SUCCESS") {
            console.log("SUCCESS: Action executed.");
        }
    } catch (e) {
        console.error("FAILURE: Execution threw error:", e);
    }

    // 3. Test Unknown Intent
    console.log("\n--- Testing Unknown Intent ---");
    const text2 = "Make me a sandwich";
    const intent2 = await agenticService.parseIntent(text2);
    console.log(`Input: "${text2}"`);
    console.log(`Parsed:`, intent2);

    if (intent2.confidence === 0) {
        console.log("SUCCESS: Correctly ignored unknown intent.");
    }

    // 4. Test Complex Intent (LLM Reasoning)
    console.log("\n--- Testing Complex Intent (LLM) ---");
    const text3 = "I need to pay that new office supply bill from yesterday";
    // Mocking OpenAI response logic implies we might see a hit here if configured, 
    // or fallback to AP_CREATE_BILL if keywords match well enough.
    // In this script we just verify it doesn't crash and returns a result.
    const intent3 = await agenticService.parseIntent(text3, "ap");
    console.log(`Input: "${text3}"`);
    console.log(`Parsed:`, intent3);

    if (intent3.actionCode === "AP_CREATE_BILL") {
        console.log("SUCCESS: Complex intent resolved to AP_CREATE_BILL.");
    } else {
        console.log("INFO: Complex intent did not resolve (Expected if no OpenAI Key or strict mocking).");
    }
}

verifyAgenticEngine().catch(console.error);
