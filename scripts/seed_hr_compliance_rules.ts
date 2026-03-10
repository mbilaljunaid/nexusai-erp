import * as dotenc from "dotenv";
dotenc.config(); // Load .env before db import

import { db } from "../server/db";
import { hrComplianceRules, hrComplianceFrameworks } from "../shared/schema/hr_compliance";
import { eq, and } from "drizzle-orm";

async function seedComplianceRules() {
    console.log("🌱 Seeding Legislative Compliance Rules...");

    const tenantId = "default"; // Target tenant

    // 1. Ensure Frameworks exist
    const frameworks = [
        { code: "GDPR", name: "General Data Protection Regulation", jurisdiction: "EU" },
        { code: "US_LABOR", name: "US Federal Labor Law", jurisdiction: "US" },
        { code: "UK_REG", name: "UK Employment Regulation", jurisdiction: "UK" },
    ];

    for (const f of frameworks) {
        const existing = await db.select().from(hrComplianceFrameworks).where(and(eq(hrComplianceFrameworks.code, f.code), eq(hrComplianceFrameworks.tenantId, tenantId)));
        if (existing.length === 0) {
            await db.insert(hrComplianceFrameworks).values({ ...f, tenantId });
        }
    }

    const gdpr = (await db.select().from(hrComplianceFrameworks).where(eq(hrComplianceFrameworks.code, "GDPR")))[0];
    const usLabor = (await db.select().from(hrComplianceFrameworks).where(eq(hrComplianceFrameworks.code, "US_LABOR")))[0];
    const ukReg = (await db.select().from(hrComplianceFrameworks).where(eq(hrComplianceFrameworks.code, "UK_REG")))[0];

    // 2. Seed Rules
    const rules = [
        // US Rules
        {
            tenantId,
            frameworkId: usLabor.id,
            code: "US-MIN-AGE",
            name: "US Minimum Working Age",
            severity: "critical",
            category: "REGULATORY",
            legislationCode: "US",
            automationLevel: "full",
            ruleLogic: { type: "MIN_AGE", threshold: 16 },
            effectiveDate: new Date("2020-01-01"),
        },
        {
            tenantId,
            frameworkId: usLabor.id,
            code: "US-SSN-REQ",
            name: "US SSN Requirement",
            severity: "high",
            category: "REGULATORY",
            legislationCode: "US",
            automationLevel: "full",
            ruleLogic: { type: "REQUIRED_FIELD", field: "nationalId" },
            effectiveDate: new Date("2020-01-01"),
        },
        // UK Rules
        {
            tenantId,
            frameworkId: ukReg.id,
            code: "UK-NINO-REQ",
            name: "UK National Insurance Number Requirement",
            severity: "high",
            category: "REGULATORY",
            legislationCode: "UK",
            automationLevel: "full",
            ruleLogic: { type: "REQUIRED_FIELD", field: "nationalId" },
            effectiveDate: new Date("2020-01-01"),
        },
        // EU / GDPR Rules
        {
            tenantId,
            frameworkId: gdpr.id,
            code: "EU-GDPR-DOB",
            name: "GDPR Date of Birth Protection",
            severity: "medium",
            category: "DATA_PRIVACY",
            legislationCode: "EU",
            automationLevel: "full",
            ruleLogic: { type: "REQUIRED_FIELD", field: "dateOfBirth" }, // In this context, verifying it exists for protection
            effectiveDate: new Date("2020-01-01"),
        },
        // Global / Ghost Employee
        {
            tenantId,
            code: "GLB-GHOST-DET",
            name: "Ghost Employee Detection",
            severity: "critical",
            category: "POLICY",
            legislationCode: "GLOBAL",
            automationLevel: "full",
            ruleLogic: { type: "GHOST_EMPLOYEE" },
            effectiveDate: new Date("2020-01-01"),
        }
    ];

    for (const r of rules) {
        const existing = await db.select().from(hrComplianceRules).where(and(eq(hrComplianceRules.code, r.code), eq(hrComplianceRules.tenantId, tenantId)));
        if (existing.length === 0) {
            await db.insert(hrComplianceRules).values(r as any);
            console.log(`✅ Seeded rule: ${r.code}`);
        } else {
            console.log(`ℹ️ Rule ${r.code} already exists.`);
        }
    }

    console.log("🏁 Compliance Seeding Finished.");
}

seedComplianceRules().catch(console.error).finally(() => process.exit());
