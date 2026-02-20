/**
 * Revenue Cost Capitalization Service — P3.10 Gap Implementation
 *
 * Implements "Costs to Obtain/Fulfill a Contract" capitalization per ASC 340-40:
 *  - Commission capitalization (incremental costs to obtain a contract)
 *  - Amortization over expected benefit period
 *  - Impairment testing
 *  - Practical expedient for contracts ≤12 months
 *
 * Oracle Fusion Revenue Management equivalent: Contract Assets / Deferred Commission
 */
import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

export type AmortizationMethod = 'STRAIGHT_LINE' | 'REVENUE_PATTERN';

export interface DeferredCommission {
    id: string;
    contractId: string;
    employeeId: string;
    commissionType: 'NEW_CONTRACT' | 'RENEWAL' | 'UPSELL';
    commissionAmount: number;
    currencyCode: string;
    capitalizeFlag: boolean; // false = practical expedient (≤12 months)
    benefitPeriodMonths: number; // Amortization period per ASC 340-40-35-1
    startDate: string;
    amortizationMethod: AmortizationMethod;
    amortizedToDate: number; // Cumulative amortization posted
    unamortizedBalance: number;
    status: 'ACTIVE' | 'FULLY_AMORTIZED' | 'IMPAIRED' | 'WRITTEN_OFF';
    createdAt: Date;
    lastAmortizedDate?: Date;
}

export interface CommissionAmortizationEntry {
    commissionId: string;
    periodName: string;
    amortizationAmount: number;
    cumulativeAmortization: number;
    remainingBalance: number;
    glEntries: Array<{
        account: string;
        debit: number;
        credit: number;
        description: string;
    }>;
}

export interface ContractCostReport {
    asOfDate: string;
    totalCapitalized: number;
    totalAmortized: number;
    totalUnamortized: number;
    commissions: DeferredCommission[];
    upcomingAmortization12Months: number;
    practicalExpeditedCount: number;  // Contracts expensed immediately
    capitalizedCount: number;         // Contracts capitalized
}

@Injectable()
export class RevenueContractCostService {
    private readonly logger = new Logger(RevenueContractCostService.name);
    private commissions: Map<string, DeferredCommission> = new Map();

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    /**
     * Capitalizes a sales commission per ASC 340-40.
     * Practical expedient: contracts ≤12 months are expensed immediately.
     */
    capitalizeCommission(input: {
        contractId: string;
        employeeId: string;
        commissionType: 'NEW_CONTRACT' | 'RENEWAL' | 'UPSELL';
        commissionAmount: number;
        currencyCode: string;
        contractTermMonths: number;
        startDate: string;
        amortizationMethod?: AmortizationMethod;
    }): { commission: DeferredCommission; journalEntry: { account: string; debit: number; credit: number }[] } {
        // ASC 340-40-25-4: Practical expedient — expense if amortization period is ≤12 months
        const capitalizeFlag = input.contractTermMonths > 12;

        // Renewals use customer life estimate; new contracts use contract term
        const benefitPeriodMonths = input.commissionType === 'RENEWAL'
            ? Math.max(input.contractTermMonths, 36) // Typical customer life estimate
            : input.contractTermMonths;

        const id = `COMM-${Date.now()}`;
        const commission: DeferredCommission = {
            id,
            contractId: input.contractId,
            employeeId: input.employeeId,
            commissionType: input.commissionType,
            commissionAmount: input.commissionAmount,
            currencyCode: input.currencyCode,
            capitalizeFlag,
            benefitPeriodMonths,
            startDate: input.startDate,
            amortizationMethod: input.amortizationMethod || 'STRAIGHT_LINE',
            amortizedToDate: capitalizeFlag ? 0 : input.commissionAmount, // Practical expedient: fully "amortized" immediately
            unamortizedBalance: capitalizeFlag ? input.commissionAmount : 0,
            status: 'ACTIVE',
            createdAt: new Date(),
        };

        this.commissions.set(id, commission);

        // GL entry at recognition
        const journalEntry = capitalizeFlag ? [
            // DR Contract Asset (Deferred Commission) / CR Commissions Payable
            { account: 'DEFERRED_COMMISSION_ASSET', debit: input.commissionAmount, credit: 0, description: `Capitalize commission - Contract ${input.contractId}` },
            { account: 'COMMISSIONS_PAYABLE', debit: 0, credit: input.commissionAmount, description: 'Commission payable' },
        ] : [
            // Practical expedient: expense immediately
            { account: 'COMMISSION_EXPENSE', debit: input.commissionAmount, credit: 0, description: `Commission expense (practical expedient ≤12 months) - Contract ${input.contractId}` },
            { account: 'COMMISSIONS_PAYABLE', debit: 0, credit: input.commissionAmount, description: 'Commission payable' },
        ];

        this.logger.log(
            `Commission ${capitalizeFlag ? 'capitalized' : 'expensed (practical expedient)'}: ` +
            `contract=${input.contractId}, amount=${input.commissionAmount} ${input.currencyCode}, ` +
            `period=${benefitPeriodMonths}mo`
        );

        return { commission, journalEntry };
    }

    /**
     * Runs amortization for a given period. Applies straight-line amortization
     * to all active capitalized commissions.
     */
    runPeriodAmortization(periodName: string): CommissionAmortizationEntry[] {
        const entries: CommissionAmortizationEntry[] = [];

        for (const commission of this.commissions.values()) {
            if (!commission.capitalizeFlag || commission.status !== 'ACTIVE') continue;
            if (commission.unamortizedBalance <= 0) continue;

            const monthlyAmortization = commission.commissionAmount / commission.benefitPeriodMonths;
            const amortizationAmount = Math.min(monthlyAmortization, commission.unamortizedBalance);

            commission.amortizedToDate += amortizationAmount;
            commission.unamortizedBalance -= amortizationAmount;
            commission.lastAmortizedDate = new Date();

            if (commission.unamortizedBalance < 0.01) {
                commission.status = 'FULLY_AMORTIZED';
            }

            const entry: CommissionAmortizationEntry = {
                commissionId: commission.id,
                periodName,
                amortizationAmount: Number(amortizationAmount.toFixed(2)),
                cumulativeAmortization: Number(commission.amortizedToDate.toFixed(2)),
                remainingBalance: Number(commission.unamortizedBalance.toFixed(2)),
                glEntries: [
                    {
                        account: 'COMMISSION_AMORTIZATION_EXPENSE',
                        debit: Number(amortizationAmount.toFixed(2)),
                        credit: 0,
                        description: `Commission amortization - Period ${periodName}`,
                    },
                    {
                        account: 'DEFERRED_COMMISSION_ASSET',
                        debit: 0,
                        credit: Number(amortizationAmount.toFixed(2)),
                        description: `Reduce deferred commission asset`,
                    },
                ],
            };

            entries.push(entry);
        }

        this.logger.log(`Period ${periodName} commission amortization: ${entries.length} entries, total=${entries.reduce((s, e) => s + e.amortizationAmount, 0).toFixed(2)}`);
        return entries;
    }

    /**
     * Impairment test — write down commission if underlying contract is cancelled.
     */
    impairCommission(commissionId: string, impairmentAmount: number, reason: string): {
        commission: DeferredCommission;
        glEntry: { account: string; debit: number; credit: number; description?: string }[];
    } {
        const commission = this.commissions.get(commissionId);
        if (!commission) throw new NotFoundException(`Commission ${commissionId} not found`);

        const writeDown = Math.min(impairmentAmount, commission.unamortizedBalance);
        commission.unamortizedBalance -= writeDown;
        commission.amortizedToDate += writeDown;

        if (commission.unamortizedBalance < 0.01) {
            commission.status = 'IMPAIRED';
        }

        this.logger.warn(`Commission ${commissionId} impaired by ${writeDown}: ${reason}`);

        return {
            commission,
            glEntry: [
                { account: 'COMMISSION_IMPAIRMENT_LOSS', debit: writeDown, credit: 0, description: `Impairment: ${reason}` },
                { account: 'DEFERRED_COMMISSION_ASSET', debit: 0, credit: writeDown, description: `Write-down deferred commission asset` },
            ],
        };
    }

    /**
     * Generates a contract cost balance sheet report.
     */
    generateReport(asOfDate: string): ContractCostReport {
        const all = Array.from(this.commissions.values());
        const capitalized = all.filter(c => c.capitalizeFlag);

        const totalCapitalized = capitalized.reduce((s, c) => s + c.commissionAmount, 0);
        const totalAmortized = capitalized.reduce((s, c) => s + c.amortizedToDate, 0);
        const totalUnamortized = capitalized.reduce((s, c) => s + c.unamortizedBalance, 0);

        // Estimate next 12 months amortization for active commissions
        const upcomingAmortization12Months = capitalized
            .filter(c => c.status === 'ACTIVE')
            .reduce((s, c) => s + Math.min(c.commissionAmount / c.benefitPeriodMonths * 12, c.unamortizedBalance), 0);

        return {
            asOfDate,
            totalCapitalized: Number(totalCapitalized.toFixed(2)),
            totalAmortized: Number(totalAmortized.toFixed(2)),
            totalUnamortized: Number(totalUnamortized.toFixed(2)),
            commissions: all,
            upcomingAmortization12Months: Number(upcomingAmortization12Months.toFixed(2)),
            practicalExpeditedCount: all.filter(c => !c.capitalizeFlag).length,
            capitalizedCount: capitalized.length,
        };
    }
}
