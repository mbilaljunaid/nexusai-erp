
import { parserFactory, MT940Parser, BAI2Parser } from "../utils/banking-parsers";

describe("BankStatementParsers", () => {

    // mocked basic MT940 content
    // :20:TRX123
    // :25:ACC123
    // :60F:C230101EUR1000,00
    // :61:2301020102C100,50NMSCPAYMENT
    // :86:PAYMENT REF
    // :62F:C230102EUR1100,50
    const sampleMT940 = `
:20:TRXBATCH001
:25:ACC123456
:28C:1
:60F:C230101EUR1000,00
:61:230102C100,50NMSCTRF
:86:Payment Received
:62F:C230102EUR1100,50
    `.trim();

    it("should detect MT940 format", () => {
        const parser = parserFactory.getParser(sampleMT940);
        expect(parser).toBeInstanceOf(MT940Parser);
    });

    it("should parse MT940 correctly", () => {
        const parser = new MT940Parser();
        const result = parser.parse(sampleMT940);

        expect(result).toHaveLength(1);
        const stmt = result[0];

        // Header Checks
        expect(stmt.header.bankAccountId).toBe("ACC123456");
        expect(stmt.header.statementNumber).toBe("TRXBATCH001");
        expect(stmt.header.openingBalance).toBe("1000.00");
        expect(stmt.header.closingBalance).toBe("1100.50");

        // Line Checks
        expect(stmt.lines).toHaveLength(1);
        const line = stmt.lines[0];
        expect(line.amount).toBe("100.50"); // Credit = Positive
        expect(line.description).toBe("Payment Received");
    });

    it("should handle multi-block MT940", () => {
        const multiBlock = sampleMT940 + "\n:20:BATCH002\n:25:ACC999\n:60F:D230101EUR500,00\n:62F:D230101EUR500,00";
        const parser = new MT940Parser();
        const result = parser.parse(multiBlock);
        expect(result).toHaveLength(2);
        expect(result[1].header.bankAccountId).toBe("ACC999");
    });

    it("should parse Debit entries as negative amounts", () => {
        // :61:230102D50,00NMSC
        const debitLine = ":61:230102D50,00NMSC";
        // Manual access to private method via prototype or just integration test
        // We will just create a small block
        const block = `
:20:TEST
:25:ACC
:61:230102D50,00NMSC
        `.trim();

        const parser = new MT940Parser();
        const result = parser.parse(block);
        expect(result[0].lines[0].amount).toBe("-50.00");
    });
});
