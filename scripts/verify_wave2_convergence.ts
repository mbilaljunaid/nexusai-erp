
import { executeTool } from "../server/services/nexus-tool-executor";

async function verifyWave2() {
    console.log("🚀 Starting Wave 2 AI Convergence Verification...");

    const userContext = { userRole: "admin", userId: "test-user" };

    // 1. Billing Scan
    console.log("\n📦 Testing tool: scan_billing_anomalies...");
    const billingResult = await executeTool({
        toolName: "scan_billing_anomalies",
        parameters: {},
        ...userContext
    });
    console.log("Response:", JSON.stringify(billingResult, null, 2));
    if (billingResult && billingResult.success) {
        console.log("✅ scan_billing_anomalies success");
    } else {
        console.error("❌ scan_billing_anomalies failed");
    }

    // 2. Revenue Forecast
    console.log("\n📦 Testing tool: generate_revenue_forecast...");
    const forecastResult = await executeTool({
        toolName: "generate_revenue_forecast",
        parameters: { period: "Q3 2026", baseline: 5000000 },
        ...userContext
    });
    console.log("Response:", JSON.stringify(forecastResult, null, 2));
    if (forecastResult && forecastResult.success) {
        console.log("✅ generate_revenue_forecast success");
    } else {
        console.error("❌ generate_revenue_forecast failed");
    }

    // 3. Churn Prediction
    console.log("\n📦 Testing tool: predict_churn...");
    const churnResult = await executeTool({
        toolName: "predict_churn",
        parameters: { customerId: "CUST-999" },
        ...userContext
    });
    console.log("Response:", JSON.stringify(churnResult, null, 2));
    if (churnResult && churnResult.success) {
        console.log("✅ predict_churn success");
    } else {
        console.error("❌ predict_churn failed");
    }

    // 4. Payment Prediction
    console.log("\n📦 Testing tool: predict_payment_dates...");
    const paymentResult = await executeTool({
        toolName: "predict_payment_dates",
        parameters: { invoiceIds: ["INV-101"] },
        ...userContext
    });
    console.log("Response:", JSON.stringify(paymentResult, null, 2));
    if (paymentResult && paymentResult.success) {
        console.log("✅ predict_payment_dates success");
    } else {
        console.error("❌ predict_payment_dates failed");
    }

    // 5. Collection Email
    console.log("\n📦 Testing tool: generate_collection_email...");
    const emailResult = await executeTool({
        toolName: "generate_collection_email",
        parameters: { customerName: "Acme Corp" },
        ...userContext
    });
    console.log("Response:", JSON.stringify(emailResult, null, 2));
    if (emailResult && emailResult.success) {
        console.log("✅ generate_collection_email success");
    } else {
        console.error("❌ generate_collection_email failed");
    }

    console.log("\n🏁 Wave 2 Verification Complete.");
}

verifyWave2().catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
});
