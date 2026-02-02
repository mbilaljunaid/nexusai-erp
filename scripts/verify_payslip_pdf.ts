
import { PdfService } from "../server/services/PdfService";
import fs from "fs";
import path from "path";

async function verifyPdf() {
    console.log("📄 Verifying Payslip PDF Generation...");

    // Mock Data
    const data = {
        employeeName: "John Doe",
        employeeId: "EMP-001",
        payPeriod: "Jan 2026",
        paymentDate: "2026-02-01",
        netPay: 4500.00,
        earnings: [
            { elementName: "Basic Salary", amount: 5000.00 },
            { elementName: "Retro Adjustment", amount: 200.00 }
        ],
        deductions: [
            { elementName: "Federal Tax", amount: -500.00 },
            { elementName: "Benefits", amount: -200.00 }
        ]
    };

    const outputPath = path.join(process.cwd(), "payslip_test.pdf");
    const stream = fs.createWriteStream(outputPath);

    await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
        PdfService.generatePayslip(stream, data);
    });

    // Check File
    if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`✅ PDF Generated Successfully: ${outputPath} (${stats.size} bytes)`);

        // Clean up
        fs.unlinkSync(outputPath);
    } else {
        console.error("❌ PDF Generation Failed (File not found)");
        process.exit(1);
    }
}

verifyPdf().catch(console.error);
