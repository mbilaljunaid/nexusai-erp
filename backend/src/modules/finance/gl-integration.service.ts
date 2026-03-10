import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

export interface JournalEntryParams {
    journalDate: Date;
    description: string;
    debitAccount: string;
    debitAmount: number;
    creditAccount: string;
    creditAmount: number;
    referenceId?: string;
    sourceModule: 'COST' | 'INV' | 'AP' | 'AR' | 'EX';
}

@Injectable()
export class FinanceGlIntegrationService {
    private readonly logger = new Logger(FinanceGlIntegrationService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    /**
     * Creates a GL Journal Entry.
     * Supports transactional execution if tx is provided.
     */
    async createJournal(entry: JournalEntryParams, tx?: any): Promise<any> {
        const executor = tx || this.db;

        const [glEntry] = await executor.insert(schema.glEntries).values({
            journalDate: entry.journalDate,
            description: `[${entry.sourceModule}] ${entry.description}`,
            debitAccount: entry.debitAccount,
            debitAmount: entry.debitAmount.toString(),
            creditAccount: entry.creditAccount,
            creditAmount: entry.creditAmount.toString(),
            status: 'posted'
        }).returning();

        return glEntry;
    }

    /**
     * Batch create journals for high volume SLA
     */
    async createBatchJournals(entries: JournalEntryParams[], tx?: any): Promise<any[]> {
        if (entries.length === 0) return [];

        const executor = tx || this.db;

        const values = entries.map(entry => ({
            journalDate: entry.journalDate,
            description: `[${entry.sourceModule}] ${entry.description}`,
            debitAccount: entry.debitAccount,
            debitAmount: entry.debitAmount.toString(),
            creditAccount: entry.creditAccount,
            creditAmount: entry.creditAmount.toString(),
            status: 'posted'
        }));

        const glEntries = await executor.insert(schema.glEntries).values(values).returning();
        return glEntries;
    }
}
