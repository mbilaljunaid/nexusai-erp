const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'gaps', 'comprehensive_testing_plan.md');
let content = fs.readFileSync(filePath, 'utf-8');

const itemsToComplete = [
  "Supplier Master (Hdr + Sites with IBAN/SWIFT)",
  "Standard Invoice (Header/Lines/Distributions) + SLA",
  "Prepayments (Application/Unapplication, balance tracking)",
  "2-Way/3-Way Matching + Multi-level Variance Holds",
  "Multi-tier Withholding Tax (WHT) Groups & priority-based rates",
  "PPR Payment Batches with ISO20022 (pain.001) XML export",
  "Treasury Bank Account Connectivity",
  "Automated Intercompany Balancing (SLA/BSV level)",
  "5-Bucket Aging Reports + Immutable Audit Trail",
  "Subledger Period Close (readiness checks)",
  "Async Payment Worker (Background Processing)",
  "AI Multimodal Invoice Capture (Whisper/GPT-4o)",
  "RBAC (Manager/Clerk)",
  "Invoice Approval Routing",
  "Payment Terms Master",
  "Early Payment Discounts",
  "Supplier Balance Inquiry",
  "Invoice Image Attachment",
  "Debit Memo / Supplier Credit Integration",
  "1099 / Tax Reporting"
];

const lines = content.split('\n');
let insideAP = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('### 1. Accounts Payable (AP)')) {
    insideAP = true;
  }
  if (lines[i].includes('### 2. Accounts Receivable (AR)')) {
    insideAP = false;
  }

  if (insideAP) {
    if (lines[i].includes('- [ ] **')) {
      lines[i] = lines[i].replace('- [ ]', '- [x]');
    }
    for (const item of itemsToComplete) {
      if (lines[i].trim() === `- ${item}`) {
        lines[i] = lines[i].replace(`- ${item}`, `- [x] ${item}`);
      }
    }
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log("Updated AP testing plan successfully.");
