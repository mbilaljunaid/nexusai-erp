
import { CsvStatementParser, CashImportService } from "../services/cash-import.service";
import { storage } from "../storage";

// Mock storage
jest.mock("../storage", () => ({
    storage: {
        createCashStatementHeader: jest.fn(),
        createCashStatementLine: jest.fn()
    }
}));

describe("CashImportService", () => {

    describe("CsvStatementParser", () => {
        it("should parse standard CSV content", async () => {
            const csvContent = "Date,Amount,Description,Reference\n2025-01-15,150.00,Deposit,REF123\n2025-01-16,-50.00,Payment,REF124";
            const buffer = Buffer.from(csvContent);
            const parser = new CsvStatementParser();
            const result = await parser.parse(buffer);

            expect(result.lines).toHaveLength(2);
            expect(result.lines[0]).toEqual(expect.objectContaining({
                transactionDate: new Date("2025-01-15"),
                amount: "150.00",
                description: "Deposit",
                referenceNumber: "REF123"
            }));
            expect(result.lines[1].amount).toBe("-50.00");
        });
    });

    describe("importBankStatement", () => {
        it("should create header and lines in storage", async () => {
            const csvContent = "Date,Amount,Description\n2025-01-15,100.00,Test";
            const buffer = Buffer.from(csvContent);
            const service = new CashImportService();

            (storage.createCashStatementHeader as jest.Mock).mockResolvedValue({ id: "header-1" });
            (storage.createCashStatementLine as jest.Mock).mockResolvedValue({ id: "line-1" });

            const result = await service.importBankStatement("acc-1", buffer, "CSV", "test.csv");

            expect(storage.createCashStatementHeader).toHaveBeenCalledWith(expect.objectContaining({
                bankAccountId: "acc-1",
                importFormat: "CSV",
                status: "Uploaded"
            }));

            expect(storage.createCashStatementLine).toHaveBeenCalledWith(expect.objectContaining({
                headerId: "header-1",
                amount: "100.00"
            }));

            expect(result.header.id).toBe("header-1");
            expect(result.lines).toHaveLength(1);
        });
    });
});
