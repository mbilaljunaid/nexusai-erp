
import { InsertCashStatementLine, InsertCashStatementHeader } from "@shared/schema";
import { randomUUID } from "crypto";

export interface ParsedStatement {
    header: Omit<InsertCashStatementHeader, "id" | "createdAt" | "status">;
    lines: Omit<InsertCashStatementLine, "id" | "createdAt" | "headerId" | "reconciled" | "matchingGroupId">[];
}

export interface BankStatementParser {
    canParse(content: string): boolean;
    parse(content: string): ParsedStatement[]; // Returns array because file might contain multiple statements
}

export class MT940Parser implements BankStatementParser {
    canParse(content: string): boolean {
        return content.includes(":20:") && content.includes(":25:");
    }

    parse(content: string): ParsedStatement[] {
        const statements: ParsedStatement[] = [];
        const blocks = content.split(":20:"); // Split by Transaction Ref Number (Start of block usually)

        // Skip empty first split if file starts with :20:
        if (blocks[0].trim() === "") blocks.shift();

        for (const block of blocks) {
            const raw = ":20:" + block; // Re-add tag
            const lines = raw.split(/\r?\n/);

            let statementNumber = "";
            let accountId = "";
            let openingBalance = "0";
            let closingBalance = "0";
            let statementDate = new Date();
            const statementLines: any[] = [];

            let currentLine: any = null;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                if (line.startsWith(":20:")) statementNumber = line.substring(4);
                if (line.startsWith(":25:")) accountId = line.substring(4);
                if (line.startsWith(":60F:")) {
                    // :60F:C131003EUR100,50 -> Credit, Date, Currency, Amount
                    // Basic parsing for now
                    openingBalance = this.parseBalance(line.substring(5));
                }
                if (line.startsWith(":62F:")) {
                    closingBalance = this.parseBalance(line.substring(5));
                    // Date usually here too
                }
                if (line.startsWith(":61:")) {
                    // :61:2305100510C123,45NMSCNONREF
                    // Date(YYMMDD) EntryDate(MMDD) D/C Amount type ref
                    currentLine = this.parseTransactionLine(line.substring(4), accountId);
                    statementLines.push(currentLine);
                }
                if (line.startsWith(":86:") && currentLine) {
                    currentLine.description = line.substring(4);
                }
            }

            statements.push({
                header: {
                    bankAccountId: accountId, // Needs lookup in real app
                    statementNumber: statementNumber,
                    statementDate: statementDate,
                    openingBalance: openingBalance,
                    closingBalance: closingBalance,
                    importFormat: "MT940"
                },
                lines: statementLines
            });
        }
        return statements;
    }

    private parseBalance(val: string): string {
        // Simple regex to extract numbers. Real MT940 is complex (C/D indicator, Date, Currency, Amount)
        // Ex: C131003EUR100,50
        const match = val.match(/[CD]\d{6}[A-Z]{3}([\d,]+)/);
        if (match) return match[1].replace(",", ".");
        return "0";
    }

    private parseTransactionLine(val: string, accountId: string) {
        // Ex: 2305100510C123,45NMSC
        // YYMMDD (6) MMDD (4 optional) D/C (1) Amount (variable) Type (4)

        // Find the D/C marker. It's usually after the date (6 or 10 digits)
        const markerMatch = val.match(/^\d{6}(\d{4})?([CD])/);
        const sign = markerMatch ? markerMatch[2] : 'C'; // Default to Credit if fail (bad assumption but keeps it moving)
        const isCredit = sign === 'C';

        const amountMatch = val.match(/[CD]([\d,]+)N/); // Look for Amount before 'N' (common)
        const amount = amountMatch ? amountMatch[1].replace(",", ".") : "0";

        return {
            bankAccountId: accountId,
            transactionDate: new Date(), // Should parse YYMMDD
            amount: isCredit ? amount : `-${amount}`,
            description: "MT940 Import",
            referenceNumber: "REF-" + Math.floor(Math.random() * 10000)
        };
    }
}

export class BAI2Parser implements BankStatementParser {
    canParse(content: string): boolean {
        return content.startsWith("01,") || content.includes("\n01,");
    }

    parse(content: string): ParsedStatement[] {
        // Placeholder for BAI2 implementation
        return [];
    }
}

export const parserFactory = {
    getParser(content: string): BankStatementParser {
        if (new MT940Parser().canParse(content)) return new MT940Parser();
        if (new BAI2Parser().canParse(content)) return new BAI2Parser();
        throw new Error("Unknown statement format");
    }
};
