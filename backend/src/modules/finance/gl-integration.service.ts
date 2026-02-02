import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { GLEntry } from '../erp/entities/gl-entry.entity';

export interface JournalEntryParams {
    journalDate: Date;
    description: string;
    debitAccount: string;
    debitAmount: number;
    creditAccount: string;
    creditAmount: number;
    referenceId?: string;
    sourceModule: 'COST' | 'INV' | 'AP' | 'AR';
}

@Injectable()
export class GlIntegrationService {
    private readonly logger = new Logger(GlIntegrationService.name);

    constructor(
        @InjectRepository(GLEntry)
        private readonly glRepo: Repository<GLEntry>,
    ) { }

    /**
     * Creates a GL Journal Entry.
     * Supports transactional execution if EntityManager is provided (SLA Batching).
     */
    async createJournal(entry: JournalEntryParams, manager?: EntityManager): Promise<GLEntry> {
        const glEntry = this.glRepo.create({
            journalDate: entry.journalDate,
            description: `[${entry.sourceModule}] ${entry.description}`,
            debitAccount: entry.debitAccount,
            debitAmount: entry.debitAmount,
            creditAccount: entry.creditAccount,
            creditAmount: entry.creditAmount,
            status: 'posted', // Auto-post for now, later 'draft'
            // referenceId: entry.referenceId // Add column if needed
        });

        if (manager) {
            return manager.save(glEntry);
        }
        return this.glRepo.save(glEntry);
    }

    /**
     * Batch create journals for high volume SLA
     */
    async createBatchJournals(entries: JournalEntryParams[], manager?: EntityManager): Promise<GLEntry[]> {
        const glEntries = entries.map(entry => this.glRepo.create({
            journalDate: entry.journalDate,
            description: `[${entry.sourceModule}] ${entry.description}`,
            debitAccount: entry.debitAccount,
            debitAmount: entry.debitAmount,
            creditAccount: entry.creditAccount,
            creditAmount: entry.creditAmount,
            status: 'posted'
        }));

        if (manager) {
            return manager.save(GLEntry, glEntries); // Bulk save
        }
        return this.glRepo.save(glEntries);
    }
}
