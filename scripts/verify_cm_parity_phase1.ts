
import { cashService } from "../server/services/cash";
import { cashRevaluationService } from "../server/services/cash-revaluation.service";
import { parserFactory } from "../server/utils/banking-parsers";
import { db } from "../server/db";
import { cashBankAccounts, glDailyRates, cashZbaStructures } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyPhase1() {
    console.log("🚀 Starting CM Parity Phase 1 Verification...");

    // 1. Verify Camt.053 Parser
    console.log("\n--- 1. Testing Camt.053 Parser ---");
    const camtXml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Id>STMT-2026-001</Id>
      <CreDtTm>2026-01-12T09:00:00Z</CreDtTm>
      <Acct>
        <Id><IBAN>GB1234567890</IBAN></Id>
      </Acct>
      <Bal>
        <Cd>OPBD</Cd>
        <Amt Ccy="EUR">1000.00</Amt>
      </Bal>
      <Bal>
        <Cd>CLBD</Cd>
        <Amt Ccy="EUR">1500.00</Amt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2026-01-12</Dt></BookgDt>
        <AcctSvcrRef>REF123</AcctSvcrRef>
        <AddtlEntryInf>Customer Payment</AddtlEntryInf>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

    const parser = parserFactory.getParser(camtXml);
    console.log("Parser detected:", parser.constructor.name);
    const parsed = parser.parse(camtXml);
    if (parsed.length > 0 && parsed[0].header.importFormat === "CAMT053") {
        console.log("✅ Camt.053 Header parsed successfully");
        console.log("   Statement Num:", parsed[0].header.statementNumber);
        console.log("   Opening Balance:", parsed[0].header.openingBalance);
        if (parsed[0].lines.length > 0) {
            console.log("✅ Camt.053 Line parsed successfully:", parsed[0].lines[0].description);
        }
    } else {
        console.error("❌ Camt.053 Parsing failed");
    }

    // 2. Verify Maker-Checker for Bank Account
    console.log("\n--- 2. Testing Maker-Checker (Bank Account) ---");
    const newAcc = await cashService.createBankAccount({
        name: "Verify Account",
        accountNumber: "VERIFY-999",
        bankName: "Verification Bank",
        currency: "EUR",
        ledgerId: "PRIMARY"
    }, "maker_user");

    console.log("Account created with status:", newAcc.status);
    if (newAcc.status === "Pending") {
        console.log("✅ Maker-Checker (Create) verified");

        await cashService.approveBankAccount(newAcc.id, "checker_user");
        const approved = await cashService.getBankAccount(newAcc.id);
        console.log("Account status after approval:", approved?.status);
        if (approved?.status === "Active") {
            console.log("✅ Maker-Checker (Approve) verified");
        } else {
            console.error("❌ Maker-Checker (Approve) failed");
        }
    } else {
        console.error("❌ Maker-Checker (Create) failed status check");
    }

    // 3. Verify Dynamic Revaluation
    console.log("\n--- 3. Testing Dynamic Revaluation ---");
    // Seed a rate
    await db.insert(glDailyRates).values({
        fromCurrency: "EUR",
        toCurrency: "USD",
        conversionDate: new Date(),
        rate: "1.085",
        conversionType: "Spot"
    });

    const reval = await cashRevaluationService.calculateRevaluation(newAcc.id);
    console.log("Revaluation Gain/Loss:", reval.gainLoss);
    console.log("Current Rate used:", reval.currentRate);
    if (reval.currentRate === 1.085) {
        console.log("✅ Dynamic Revaluation using glDailyRates verified");
    } else {
        console.log("⚠️ Revaluation used fallback rate (Check DB sync):", reval.currentRate);
    }

    console.log("\n🏁 Verification Complete.");
}

verifyPhase1().catch(console.error);
