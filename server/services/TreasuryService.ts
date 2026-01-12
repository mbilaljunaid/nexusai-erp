
import { db } from "../db";
import { apPayments, apPaymentBatches, apInvoices, apSupplierSites, apSuppliers, apInvoicePayments, cashBankAccounts } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class TreasuryService {
  /**
   * Generates a simplified ISO20022 pain.001.001.03 XML for a confirmation batch.
   */
  async generateISO20022(batchId: number): Promise<string> {
    const [batch] = await db.select()
      .from(apPaymentBatches)
      .where(eq(apPaymentBatches.id, batchId))
      .limit(1);

    if (!batch) throw new Error("Batch not found");

    const payments = await db.select({
      id: apPayments.id,
      amount: apPayments.amount,
      currencyCode: apPayments.currencyCode,
      invoiceNumber: apInvoices.invoiceNumber,
      swiftCode: apSupplierSites.swiftCode,
      iban: apSupplierSites.iban,
      supplierName: apSuppliers.name
    })
      .from(apPayments)
      .innerJoin(apInvoicePayments, eq(apPayments.id, apInvoicePayments.paymentId))
      .innerJoin(apInvoices, eq(apInvoicePayments.invoiceId, apInvoices.id))
      .innerJoin(apSupplierSites, eq(apInvoices.supplierSiteId, apSupplierSites.id))
      .innerJoin(apSuppliers, eq(apInvoices.supplierId, apSuppliers.id))
      .where(eq(apPayments.batchId, batchId));

    if (payments.length === 0) throw new Error("No payments found for batch");

    // Fetch Internal Bank Account for Disbursement
    // Strategy: Match payment currency to bank account currency
    const paymentCurrency = payments[0].currencyCode;
    const [internalBank] = await db.select()
      .from(cashBankAccounts)
      .where(and(
        eq(cashBankAccounts.currency, paymentCurrency),
        eq(cashBankAccounts.active, true)
      ))
      .limit(1);

    // Fallbacks if no bank account is configured (Parity: Do not crash, use config placeholder)
    const debtorIban = internalBank?.accountNumber || "US12345678901234567890"; // Using Account Number as IBAN proxy
    const debtorBic = internalBank?.swiftCode || "NEXUSUS33";
    const debtorName = internalBank?.bankName || "NEXUS AI OPERATING UNIT";

    const msgId = `BCH-${batchId}-${Date.now()}`;
    const creationDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDate}</CreDtTm>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${payments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>NEXUS AI ENTERPRISE</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-INF-${batchId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>${batch.checkDate ? new Date(batch.checkDate).toISOString().split('T')[0] : creationDate.split('T')[0]}</ReqdExctnDt>
      <Dbtr>
        <Nm>${debtorName}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>${debtorIban}</IBAN>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BIC>${debtorBic}</BIC>
        </FinInstnId>
      </DbtrAgt>`;

    for (const p of payments) {
      xml += `
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>PAY-${p.id}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="${p.currencyCode}">${Number(p.amount).toFixed(2)}</InstdAmt>
        </Amt>
        <CdtrAgt>
          <FinInstnId>
            <BIC>${p.swiftCode || 'GENERICBIC'}</BIC>
          </FinInstnId>
        </CdtrAgt>
        <Cdtr>
          <Nm>${p.supplierName}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>${p.iban || 'NOIBAN'}</IBAN>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>Payment for Invoice ${p.invoiceNumber}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`;
    }

    xml += `
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

    return xml;
  }
}

export const treasuryService = new TreasuryService();
