// pdf-report-generator.ts - Auditor-grade Bank Reconciliation PDF Report
import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";
import { resolve } from "path";

/**
 * Generates a Bank Reconciliation Report PDF
 * @param reportData The data object containing account details, summary, and variances
 * @param outputPath The file path to save the PDF
 */
export async function generatePdfReport(reportData: any, outputPath: string): Promise<void> {
    return new Promise((resolvePromise, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = createWriteStream(resolve(outputPath));

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text("Bank Reconciliation Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
        doc.moveDown();

        // Account Details
        doc.fontSize(12).font("Helvetica-Bold").text("Account Information");
        doc.font("Helvetica").fontSize(10);
        doc.text(`Account Name: ${reportData.account.name}`);
        doc.text(`Bank: ${reportData.account.bankName}`);
        doc.text(`Account Number: ****${reportData.account.accountNumber.slice(-4)}`);
        doc.text(`Currency: ${reportData.account.currency}`);
        doc.moveDown();

        // Summary Box
        doc.rect(50, doc.y, 510, 80).stroke();
        const startY = doc.y + 10;

        doc.text("Ledger Balance:", 60, startY);
        doc.text(Number(reportData.summary.ledgerBalance).toFixed(2), 200, startY, { align: "right", width: 100 });

        doc.text("Statement Balance:", 60, startY + 20);
        doc.text(Number(reportData.summary.statementBalance).toFixed(2), 200, startY + 20, { align: "right", width: 100 });

        doc.font("Helvetica-Bold");
        doc.text("Variance:", 60, startY + 40);
        const variance = Number(reportData.summary.variance);
        doc.fillColor(variance === 0 ? "black" : "red")
            .text(variance.toFixed(2), 200, startY + 40, { align: "right", width: 100 })
            .fillColor("black");

        doc.font("Helvetica");
        doc.moveDown(4);

        // Unreconciled Items
        doc.fontSize(12).font("Helvetica-Bold").text("Exceptions / Unreconciled Items");
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.fontSize(9).font("Helvetica-Bold");
        doc.text("Date", 50, tableTop);
        doc.text("Description", 150, tableTop);
        doc.text("Amount", 450, tableTop, { align: "right", width: 100 });
        doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();
        doc.font("Helvetica");

        let y = tableTop + 25;

        // Combine lines and transactions for list
        const allExceptions = [
            ...(reportData.details.unreconciledLines || []).map((l: any) => ({ ...l, type: "Bank Line" })),
            ...(reportData.details.unclearedTransactions || []).map((t: any) => ({ ...t, type: "Book Txn" }))
        ];

        if (allExceptions.length === 0) {
            doc.text("No exceptions found. Reconciliation is complete.", 50, y);
        } else {
            allExceptions.forEach((item) => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                const dateStr = new Date(item.date).toLocaleDateString();
                const desc = item.description || "N/A";
                const amount = Number(item.amount).toFixed(2);

                doc.text(dateStr, 50, y);
                doc.text(desc, 150, y, { width: 300, ellipsis: true });
                doc.text(amount, 450, y, { align: "right", width: 100 });
                y += 15;
            });
        }

        // Footer
        doc.end();

        stream.on("finish", () => resolvePromise());
        stream.on("error", (err) => reject(err));
    });
}
