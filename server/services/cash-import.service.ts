
import { storage } from "../storage";
import { InsertCashStatementHeader, InsertCashStatementLine } from "@shared/schema";
import Papa from "papaparse";

export interface BankStatementParser {
    parse(content: Buffer): Promise<{ header: Partial<InsertCashStatementHeader>, lines: Partial<InsertCashStatementLine>[] }>;
}

export class CsvStatementParser implements BankStatementParser {
    async parse(content: Buffer): Promise<{ header: Partial<InsertCashStatementHeader>, lines: Partial<InsertCashStatementLine>[] }> {
        const text = content.toString('utf-8');
        const { data: records, errors } = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false // Keep amounts as strings to be safe
        });

        if (errors.length > 0) {
            console.warn("CSV Parsing errors:", errors);
        }

        // Basic mapping logic - assumes standard columns: Date, Amount, Description, Reference
        // In a real system, this would be configurable per bank
        const lines: Partial<InsertCashStatementLine>[] = (records as any[])
            .filter(record => record.Date || record.date) // Basic filter
            .map((record: any) => ({
                transactionDate: new Date(record.Date || record.date),
                amount: record.Amount || record.amount, // string ok for numeric
                description: record.Description || record.description,
                referenceNumber: record.Reference || record.reference || `REF-${Date.now()}-${Math.random().toString(36).substring(7)}`
            }));

        // Calculate totals from lines if not provided
        // We'll trust the user has balanced file for now

        return {
            header: {
                importFormat: 'CSV',
                statementDate: lines.length > 0 ? new Date(lines[0].transactionDate!) : new Date()
            },
            lines
        };
    }
}

export class Mt940StatementParser implements BankStatementParser {
    async parse(content: Buffer): Promise<{ header: Partial<InsertCashStatementHeader>, lines: Partial<InsertCashStatementLine>[] }> {
        throw new Error("MT940 parsing not yet implemented");
    }
}

export class Camt053StatementParser implements BankStatementParser {
    async parse(content: Buffer): Promise<{ header: Partial<InsertCashStatementHeader>, lines: Partial<InsertCashStatementLine>[] }> {
        // Simplified ISO 20022 camt.053 parsing simulation
        const text = content.toString('utf-8');
        if (!text.includes('<camt.053')) {
            throw new Error("Invalid camt.053 file format");
        }

        const lines: Partial<InsertCashStatementLine>[] = [];

        // Mock extraction of entries from XML
        // In camt.053, we look for <Ntry> blocks
        // For simulation, we'll use regex to find potential entries
        const entries = text.split('<Ntry>');
        entries.shift(); // First part is header

        for (const entry of entries) {
            const amount = entry.match(/<Amt>([\d.]+)<\/Amt>/)?.[1];
            const date = entry.match(/<BookgDt>.*?<Dt>([\d-]+)<\/Dt>/)?.[1];
            const desc = entry.match(/<AddtlNtryInf>([^<]+)<\/AddtlNtryInf>/)?.[1] || "Bank Entry";
            const code = entry.match(/<Domn>.*?<Cd>([^<]+)<\/Cd>/)?.[1]; // Proprietary or ISO code

            if (amount && date) {
                lines.push({
                    transactionDate: new Date(date),
                    amount,
                    description: code === 'CHGS' ? `[BSG] ${desc}` : desc,
                    referenceNumber: `CAMT-${Date.now()}-${Math.random().toString(36).substring(7)}`
                });
            }
        }

        return {
            header: {
                importFormat: 'CAMT.053',
                statementDate: new Date()
            },
            lines
        };
    }
}

export class CashImportService {
    private parsers: Record<string, BankStatementParser> = {
        'CSV': new CsvStatementParser(),
        'MT940': new Mt940StatementParser(),
        'CAMT.053': new Camt053StatementParser()
    };

    async importBankStatement(
        bankAccountId: string,
        fileBuffer: Buffer,
        format: string = 'CSV',
        filename: string
    ) {
        const parser = this.parsers[format];
        if (!parser) {
            throw new Error(`Unsupported format: ${format}`);
        }

        const { header, lines } = await parser.parse(fileBuffer);

        // Create Header
        const statementHeader = await storage.createCashStatementHeader({
            bankAccountId,
            statementNumber: `STMT-${Date.now()}`,
            statementDate: header.statementDate || new Date(),
            status: "Uploaded",
            importFormat: format,
            ...header as any
        });

        // Create Lines
        const createdLines = [];
        for (const line of lines) {
            const createdLine = await storage.createCashStatementLine({
                bankAccountId,
                headerId: statementHeader.id,
                amount: line.amount as any,
                transactionDate: line.transactionDate || new Date(),
                description: line.description,
                referenceNumber: line.referenceNumber,
                reconciled: false,
                ...line as any
            });

            // BSG Automation: If description indicates a Bank Service Charge (BSG), auto-create GL transaction
            if (line.description?.includes('[BSG]')) {
                console.log(`[CASH] BSG Automation: Recording bank fee for line ${createdLine.id}`);
                await storage.createCashTransaction({
                    bankAccountId,
                    sourceModule: "GL",
                    sourceId: createdLine.id,
                    amount: line.amount as any,
                    description: `Bank Service Charge: ${line.description}`,
                    transactionDate: line.transactionDate || new Date(),
                    status: "Cleared", // Auto-cleared since it's from the bank
                    matchingGroupId: null
                });

                // Mark line as reconciled immediately
                await storage.updateCashStatementLine(createdLine.id, { reconciled: true });
            }

            createdLines.push(createdLine);
        }

        return { header: statementHeader, lines: createdLines };
    }
}

export const cashImportService = new CashImportService();
