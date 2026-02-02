import { HRPdfService } from "../server/services/HRPdfService";
import fs from "fs";
import path from "path";

async function verifyPdfGeneration() {
    console.log("🚀 Starting HR PDF Service Verification...");
    const pdfService = new HRPdfService();
    const outputDir = path.join(process.cwd(), "attached_assets");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    try {
        console.log("📄 Generating Payslip PDF...");
        const payslipBuffer = await pdfService.generatePayslipPdf({
            employeeName: "John Doe",
            employeeNumber: "10425",
            periodName: "January 2026",
            payDate: "2026-01-31",
            earnings: [{ name: "Basic Salary", amount: 5000 }, { name: "Housing Allowance", amount: 2000 }],
            deductions: [{ name: "Income Tax", amount: 500 }, { name: "Pension", amount: 250 }],
            netPay: 6250
        });

        const payslipPath = path.join(outputDir, "verify_payslip_test.pdf");
        fs.writeFileSync(payslipPath, payslipBuffer);
        console.log(`✅ Payslip generated: ${payslipPath}`);

        console.log("📜 Generating Employment Verification PDF...");
        const verificationBuffer = await pdfService.generateEmploymentVerification({
            employeeName: "John Doe",
            jobTitle: "Senior Product Engineer",
            startDate: "2020-06-15",
            currentSalary: "$85,000"
        });

        const verificationPath = path.join(outputDir, "verify_employment_test.pdf");
        fs.writeFileSync(verificationPath, verificationBuffer);
        console.log(`✅ Employment Verification generated: ${verificationPath}`);

        console.log("🎉 SUCCESS: HRPdfService passed all generation tests.");
    } catch (error) {
        console.error("❌ PDF Generation failed:", error);
        process.exit(1);
    }
}

verifyPdfGeneration();
