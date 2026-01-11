
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
        // Placeholder for MT940 parsing logic (Chunk 5 advanced)
        // For now, return empty or error
        throw new Error("MT940 parsing not yet implemented");
    }
}

export class CashImportService {
    private parsers: Record<string, BankStatementParser> = {
        'CSV': new CsvStatementParser(),
        'MT940': new Mt940StatementParser()
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
            statementNumber: `STMT-${Date.now()}`, // Generate basic default
            statementDate: header.statementDate || new Date(),
            status: "Uploaded",
            importFormat: format,
            ...header as any
        });

        // Create Lines
        const createdLines = [];
        for (const line of lines) {
            createdLines.push(await storage.createCashStatementLine({
                bankAccountId,
                headerId: statementHeader.id,
                amount: line.amount as any,
                transactionDate: line.transactionDate || new Date(),
                description: line.description,
                referenceNumber: line.referenceNumber,
                reconciled: false,
                ...line as any
            }));
        }

        return { header: statementHeader, lines: createdLines };
    }
}

export const cashImportService = new CashImportService();
