
import { RecruitmentConfigService } from "../server/services/RecruitmentConfigService";
import { db } from "../server/db";

async function verifyRecruitingConfig() {
    console.log("🚀 Starting Recruitment Config Verification...");
    const tenantId = "test_tenant_config";

    // 1. Create Pipeline
    console.log("1. Creating Pipeline Template...");
    const pipeline = await RecruitmentConfigService.createPipelineTemplate({
        tenantId,
        name: "Verification Pipeline",
        description: "Automated Test"
    });
    console.log(`✅ Pipeline Created: ${pipeline.id}`);

    // 2. Add Stages
    console.log("2. Adding Stages...");
    await RecruitmentConfigService.createPipelineStage({ templateId: pipeline.id, tenantId, name: "Screening", order: 1, type: "SCREENING" });
    await RecruitmentConfigService.createPipelineStage({ templateId: pipeline.id, tenantId, name: "Technical Interview", order: 2, type: "INTERVIEW" });
    await RecruitmentConfigService.createPipelineStage({ templateId: pipeline.id, tenantId, name: "Offer", order: 3, type: "OFFER" });

    // 3. Verify Stages
    const stages = await RecruitmentConfigService.getPipelineStages(pipeline.id);
    if (stages.length !== 3) throw new Error(`Expected 3 stages, got ${stages.length}`);
    if (stages[0].name !== "Screening") throw new Error("Order mismatch");
    console.log("✅ Stages Verified (Order Correct)");

    // 4. Create Email Template
    console.log("3. Creating Email Template...");
    const email = await RecruitmentConfigService.createEmailTemplate({
        tenantId,
        name: "Test Offer",
        subject: "Contract Enclosed",
        body: "Congrats!",
        type: "OFFER"
    });
    console.log(`✅ Email Template Created: ${email.id}`);

    console.log("🎉 Configuration Verification Successful!");
    process.exit(0);
}

verifyRecruitingConfig().catch(console.error);
