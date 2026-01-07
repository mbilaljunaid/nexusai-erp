import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum AccountType {
    CHECKING = 'CHECKING',
    SAVINGS = 'SAVINGS',
    LOAN = 'LOAN',
    BROKERAGE = 'BROKERAGE',
}

export const AccountSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    customerId: z.string().uuid(), // Link to common.customers
    accountNumber: z.string().min(10),
    type: z.nativeEnum(AccountType),
    currency: z.string().length(3).default('USD'),
    balance: z.number(), // Ledger Balance
    availableBalance: z.number(),
    status: z.enum(['ACTIVE', 'FROZEN', 'CLOSED']),
    interestRate: z.number().min(0).default(0),
});

export type Account = z.infer<typeof AccountSchema>;

export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    TRANSFER_IN = 'TRANSFER_IN',
    TRANSFER_OUT = 'TRANSFER_OUT',
    FEE = 'FEE',
    INTEREST = 'INTEREST',
}

export const TransactionSchema = z.object({
    id: z.string().uuid(),
    accountId: z.string().uuid(),
    type: z.nativeEnum(TransactionType),
    amount: z.number().positive(),
    description: z.string(),
    date: z.string().datetime(),
    counterpartyAccount: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const LoanApplicationSchema = z.object({
    id: z.string().uuid(),
    customerId: z.string().uuid(),
    amountRequested: z.number().positive(),
    purpose: z.string(),
    termMonths: z.number().int().positive(),
    status: z.enum(['SUBMITTED', 'UNDERWRITING', 'APPROVED', 'REJECTED', 'FUNDED']),
    creditScore: z.number().int().min(300).max(850).optional(),
});

export type LoanApplication = z.infer<typeof LoanApplicationSchema>;

// --- AI ACTION SCHEMAS ---

// Action: DETECT_FRAUD
export const DetectFraudSchema = z.object({
    action: z.literal('DETECT_FRAUD'),
    entity: z.literal('Transaction'),
    params: z.object({
        transactionId: z.string(),
        riskScore: z.number().min(0).max(100),
        reasonCodes: z.array(z.string()),
    }),
    preconditions: z.array(z.string()).default(['transaction_pending']),
    requiresApproval: z.literal(true), // Block requires confirmation or auto-block with notification
    auditLog: z.literal(true),
});

export type DetectFraudAction = z.infer<typeof DetectFraudSchema>;

// Action: CALCULATE_CREDIT_RISK
export const CalculateCreditRiskSchema = z.object({
    action: z.literal('CALCULATE_CREDIT_RISK'),
    entity: z.literal('LoanApplication'),
    params: z.object({
        applicationId: z.string(),
        bureauDataSource: z.string(),
    }),
    preconditions: z.array(z.string()).default(['application_submitted']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
});

export type CalculateCreditRiskAction = z.infer<typeof CalculateCreditRiskSchema>;
