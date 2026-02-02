// Banking statement parsers implementation
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
                    openingBalance = this.parseBalance(line.substring(5));
                }
                if (line.startsWith(":62F:")) {
                    closingBalance = this.parseBalance(line.substring(5));
                }
                if (line.startsWith(":61:")) {
                    currentLine = this.parseTransactionLine(line.substring(4), accountId);
                    statementLines.push(currentLine);
                }
                if (line.startsWith(":86:") && currentLine) {
                    currentLine.description = line.substring(4);
                }
            }
            statements.push({
                header: {
                    bankAccountId: accountId,
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
        const match = val.match(/[CD]\d{6}[A-Z]{3}([\d,]+)/);
        if (match) return match[1].replace(",", ".");
        return "0";
    }

    private parseTransactionLine(val: string, accountId: string) {
        const markerMatch = val.match(/^\d{6}(\d{4})?([CD])/);
        const sign = markerMatch ? markerMatch[2] : 'C';
        const isCredit = sign === 'C';
        const amountMatch = val.match(/[CD]([\d,]+)N/);
        const amount = amountMatch ? amountMatch[1].replace(",", ".") : "0";
        return {
            bankAccountId: accountId,
            transactionDate: new Date(), // Should parse YYMMDD properly
            amount: isCredit ? amount : `-${amount}`,
            description: "MT940 Import",
            referenceNumber: "REF-" + Math.floor(Math.random() * 10000)
        };
    }
}

export class Camt053Parser implements BankStatementParser {
    canParse(content: string): boolean {
        return content.includes("<camt.053") || (content.includes("<Document") && content.includes("BkToCstmrStmt"));
    }

    parse(content: string): ParsedStatement[] {
        const statements: ParsedStatement[] = [];
        const stmtBlocks = content.split("<Stmt>");
        stmtBlocks.shift(); // Remove content before first <Stmt>
        for (const block of stmtBlocks) {
            const statementNumber = this.getTagContent(block, "Id");
            const accountId = this.getTagContent(block, "IBAN") || this.getTagContent(block, "Othr");
            const openingBalance = this.getBalanceByCode(block, "OPBD");
            const closingBalance = this.getBalanceByCode(block, "CLBD");
            const statementDate = new Date(this.getTagContent(block, "CreDtTm") || new Date());
            const lines: any[] = [];
            const entryBlocks = block.split("<Ntry>");
            entryBlocks.shift();
            for (const entry of entryBlocks) {
                const amount = this.getTagContent(entry, "Amt");
                const creditDebit = this.getTagContent(entry, "CdtDbtInd");
                const isCredit = creditDebit === "CRDT";
                const transDate = new Date(this.getTagContent(entry, "BookgDt") || this.getTagContent(entry, "Dt") || new Date());
                const ref = this.getTagContent(entry, "AcctSvcrRef") || this.getTagContent(entry, "EndToEndId") || "ISO-" + Math.floor(Math.random() * 10000);
                const desc = this.getTagContent(entry, "AddtlEntryInf") || "ISO 20022 Import";
                lines.push({
                    bankAccountId: accountId,
                    transactionDate: transDate,
                    amount: isCredit ? amount : `-${amount}`,
                    description: desc,
                    referenceNumber: ref
                });
            }
            statements.push({
                header: {
                    bankAccountId: accountId,
                    statementNumber: statementNumber,
                    statementDate: statementDate,
                    openingBalance: openingBalance,
                    closingBalance: closingBalance,
                    importFormat: "CAMT053"
                },
                lines
            });
        }
        return statements;
    }

    private getTagContent(xml: string, tag: string): string {
        const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1].trim() : "";
    }

    private getBalanceByCode(xml: string, code: string): string {
        const blocks = xml.split("<Bal>");
        for (const b of blocks) {
            if (b.includes(`<Cd>${code}</Cd>`)) {
                return this.getTagContent(b, "Amt");
            }
        }
        return "0";
    }
}

// New Camt052Parser for intraday cash positioning (ISO 20022 intraday)
export class Camt052Parser implements BankStatementParser {
    canParse(content: string): boolean {
        return content.includes("<camt.052") || (content.includes("<Document") && content.includes("CstmrAcctRpt"));
    }

    parse(content: string): ParsedStatement[] {
        // Reuse Camt053Parser logic and mark lines as intraday
        const statements = new Camt053Parser().parse(content);
        statements.forEach(stmt => {
            stmt.lines.forEach(line => {
                (line as any).intraday = true;
            });
        });
        return statements;
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
        if (new Camt053Parser().canParse(content)) return new Camt053Parser();
        if (new Camt052Parser().canParse(content)) return new Camt052Parser();
        if (new MT940Parser().canParse(content)) return new MT940Parser();
        if (new BAI2Parser().canParse(content)) return new BAI2Parser();
        throw new Error("Unknown statement format");
    }
};
