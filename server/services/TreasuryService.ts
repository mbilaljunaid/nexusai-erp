
import { db } from "../db";
import {
  apPayments, apPaymentBatches, apInvoices, apSupplierSites, apSuppliers, apInvoicePayments, cashBankAccounts,
  treasuryCounterparties, treasuryDeals, treasuryInstallments, treasuryFxDeals, treasuryMarketRates, treasuryRiskLimits,
  type InsertTreasuryCounterparty, type InsertTreasuryDeal, type TreasuryDeal, type TreasuryCounterparty,
  type InsertTreasuryFxDeal, type TreasuryFxDeal, type InsertTreasuryMarketRate, type InsertTreasuryRiskLimit
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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

  // --- Counterparty Management ---

  async listCounterparties(): Promise<TreasuryCounterparty[]> {
    return await db.select()
      .from(treasuryCounterparties)
      .where(eq(treasuryCounterparties.active, true))
      .orderBy(desc(treasuryCounterparties.createdAt));
  }

  async createCounterparty(data: InsertTreasuryCounterparty): Promise<TreasuryCounterparty> {
    const [counterparty] = await db.insert(treasuryCounterparties)
      .values(data)
      .returning();
    return counterparty;
  }

  // --- Deal Management ---

  async listDeals(filters?: { type?: string, status?: string }): Promise<TreasuryDeal[]> {
    let query = db.select().from(treasuryDeals);

    const conditions = [];
    if (filters?.type) conditions.push(eq(treasuryDeals.type, filters.type));
    if (filters?.status) conditions.push(eq(treasuryDeals.status, filters.status));

    if (conditions.length > 0) {
      // @ts-ignore - Dynamic and/eq type issues with Drizzle
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(treasuryDeals.createdAt));
  }

  async getDeal(id: string): Promise<any> {
    const [deal] = await db.select()
      .from(treasuryDeals)
      .where(eq(treasuryDeals.id, id))
      .limit(1);

    if (!deal) throw new Error("Deal not found");

    const installments = await db.select()
      .from(treasuryInstallments)
      .where(eq(treasuryInstallments.dealId, id))
      .orderBy(treasuryInstallments.sequenceNumber);

    return { ...deal, installments };
  }

  async createDeal(data: InsertTreasuryDeal): Promise<TreasuryDeal> {
    const [deal] = await db.insert(treasuryDeals)
      .values({
        ...data,
        status: data.status || 'DRAFT'
      })
      .returning();

    // If it's a DEBT deal with terms, generate installments
    if (deal.type === 'DEBT' && deal.termMonths && deal.interestRate) {
      await this.generateInstallments(deal);
    }

    return deal;
  }

  async updateDealStatus(id: string, status: string): Promise<TreasuryDeal> {
    const [deal] = await db.update(treasuryDeals)
      .set({ status, updatedAt: new Date() })
      .where(eq(treasuryDeals.id, id))
      .returning();
    return deal;
  }

  private async generateInstallments(deal: TreasuryDeal) {
    const termMonths = deal.termMonths!;
    const principal = Number(deal.principalAmount);
    const yearlyRate = Number(deal.interestRate) / 100;
    const monthlyRate = yearlyRate / 12;

    // Simple fixed monthly payment calculation (Amortization)
    // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    let monthlyPayment = principal * monthlyRate;
    if (denominator !== 0) {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / denominator;
    } else {
      monthlyPayment = principal / termMonths; // No interest case
    }

    let remainingPrincipal = principal;
    const installments = [];

    for (let i = 1; i <= termMonths; i++) {
      const interestAmount = remainingPrincipal * monthlyRate;
      const principalAmount = monthlyPayment - interestAmount;
      remainingPrincipal -= principalAmount;

      const dueDate = new Date(deal.startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        dealId: deal.id,
        sequenceNumber: i,
        dueDate,
        principalAmount: principalAmount.toFixed(2),
        interestAmount: interestAmount.toFixed(2),
        totalAmount: monthlyPayment.toFixed(2),
        remainingPrincipal: Math.max(0, remainingPrincipal).toFixed(2),
        status: 'PENDING'
      });
    }

    await db.insert(treasuryInstallments).values(installments);
  }

  // --- FX & Risk Management ---

  async createFxDeal(data: InsertTreasuryFxDeal): Promise<TreasuryFxDeal> {
    // 1. Check Risk Limits
    await this.checkLimitBreach(data.counterpartyId, Number(data.buyAmount), data.buyCurrency);

    // 2. Create Deal
    const [deal] = await db.insert(treasuryFxDeals)
      .values({
        ...data,
        status: data.status || 'DRAFT',
        tradeDate: data.tradeDate ? new Date(data.tradeDate) : new Date()
      })
      .returning();

    return deal;
  }

  async listFxDeals(): Promise<TreasuryFxDeal[]> {
    return await db.select()
      .from(treasuryFxDeals)
      .orderBy(desc(treasuryFxDeals.tradeDate));
  }

  async updateMarketRates(rates: InsertTreasuryMarketRate[]): Promise<void> {
    if (rates.length === 0) return;
    await db.insert(treasuryMarketRates).values(rates);
  }

  async calculateMarkToMarket(dealId: string): Promise<number> {
    const [deal] = await db.select().from(treasuryFxDeals).where(eq(treasuryFxDeals.id, dealId));
    if (!deal) throw new Error("Fx Deal not found");

    // simplified MtM: (Current Spot - Agreed Rate) * Amount
    // Ideally we need Forward Points interpolation based on valueDate

    // Find latest rate
    const [latestRate] = await db.select()
      .from(treasuryMarketRates)
      // Approximate pairing check
      .where(eq(treasuryMarketRates.currencyPair, `${deal.buyCurrency}/${deal.sellCurrency}`))
      .orderBy(desc(treasuryMarketRates.date))
      .limit(1);

    if (!latestRate) return 0; // No rate, no revaluation

    const currentRate = Number(latestRate.rate);
    const contractRate = Number(deal.exchangeRate);
    const amount = Number(deal.buyAmount);

    // Logic: If I bought EUR at 1.10 and now it's 1.12, I made profit.
    const mtm = (currentRate - contractRate) * amount;

    // Update DB
    await db.update(treasuryFxDeals)
      .set({
        markToMarket: mtm.toFixed(2),
        lastRevaluationDate: new Date()
      })
      .where(eq(treasuryFxDeals.id, dealId));

    return mtm;
  }

  private async checkLimitBreach(counterpartyId: string, amount: number, currency: string) {
    const [limit] = await db.select()
      .from(treasuryRiskLimits)
      .where(and(
        eq(treasuryRiskLimits.counterpartyId, counterpartyId),
        eq(treasuryRiskLimits.active, true)
      ))
      .limit(1);

    if (!limit) return; // No limit defined = Allowed (or blocked based on policy, assuming allowed for now)

    // Calculate current exposure (Sum of all active deals principal)
    // simplified: just summing buyAmounts for now. Real world needs converting to base currency.
    const deals = await db.select({ amount: treasuryFxDeals.buyAmount })
      .from(treasuryFxDeals)
      .where(and(
        eq(treasuryFxDeals.counterpartyId, counterpartyId),
        eq(treasuryFxDeals.status, 'CONFIRMED')
      ));

    const currentExposure = deals.reduce((sum, d) => sum + Number(d.amount), 0);
    const newExposure = currentExposure + amount;

    if (newExposure > Number(limit.maxAmount)) {
      throw new Error(`Risk Limit Breached! Counterparty Limit: ${limit.maxAmount}, New Exposure: ${newExposure}`);
    }
  }

  async createRiskLimit(data: InsertTreasuryRiskLimit): Promise<any> {
    return await db.insert(treasuryRiskLimits).values(data).returning();
  }

  async listRiskLimits(): Promise<TreasuryRiskLimit[]> {
    return await db.select().from(treasuryRiskLimits).where(eq(treasuryRiskLimits.active, true));
  }
}

export const treasuryService = new TreasuryService();
