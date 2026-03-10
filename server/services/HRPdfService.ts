import PDFDocument from "pdfkit";
import { Readable } from "stream";

export class HRPdfService {
    /**
     * Generate a standardized payslip PDF
     */
    async generatePayslipPdf(data: {
        employeeName: string;
        employeeNumber: string;
        periodName: string;
        payDate: string;
        earnings: { name: string; amount: number }[];
        deductions: { name: string; amount: number }[];
        netPay: number;
    }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            const doc = new PDFDocument({ margin: 50 });

            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            // Header
            doc.fontSize(20).text("NexusAI ERP - Payslip", { align: "center" });
            doc.moveDown();
            doc.fontSize(12).text(`Employee: ${data.employeeName} (${data.employeeNumber})`);
            doc.text(`Period: ${data.periodName}`);
            doc.text(`Pay Date: ${data.payDate}`);
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Earnings
            doc.fontSize(14).text("Earnings", { underline: true });
            data.earnings.forEach(e => {
                doc.fontSize(10).text(`${e.name.padEnd(40)} ${e.amount.toFixed(2)}`);
            });
            doc.moveDown();

            // Deductions
            doc.fontSize(14).text("Deductions", { underline: true });
            data.deductions.forEach(d => {
                doc.fontSize(10).text(`${d.name.padEnd(40)} ${d.amount.toFixed(2)}`);
            });
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Total
            doc.fontSize(16).text(`Net Pay: ${data.netPay.toFixed(2)}`, { align: "right" });

            doc.end();
        });
    }

    /**
     * Generate an employment verification letter
     */
    async generateEmploymentVerification(data: {
        employeeName: string;
        jobTitle: string;
        startDate: string;
        currentSalary?: string;
    }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            const doc = new PDFDocument({ margin: 70 });

            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            const today = new Date().toLocaleDateString();

            doc.fontSize(12).text(today, { align: "right" });
            doc.moveDown(2);

            doc.fontSize(16).text("To Whom It May Concern,", { underline: true });
            doc.moveDown();

            doc.fontSize(12).text(
                `This letter is to formally verify that ${data.employeeName} is currently employed by NexusAI ERP.`
            );
            doc.moveDown();
            doc.text(`Title: ${data.jobTitle}`);
            doc.text(`Start Date: ${data.startDate}`);
            if (data.currentSalary) {
                doc.text(`Annual Salary: ${data.currentSalary}`);
            }
            doc.moveDown(2);

            doc.text("If you require any further information, please contact our HR department.");
            doc.moveDown(3);
            doc.text("Sincerely,");
            doc.moveDown();
            doc.text("Human Resources Department");
            doc.text("NexusAI ERP");

            doc.end();
        });
    }
}

export const hrPdfService = new HRPdfService();
