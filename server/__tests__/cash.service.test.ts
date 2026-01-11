import { CashService } from "../services/cash";
import { storage } from "../storage";
import { InsertCashTransaction, InsertCashReconciliationRule } from "@shared/schema";

// Mock storage
jest.mock("../storage", () => ({
    storage: {
        createCashTransaction: jest.fn(),
        createCashReconciliationRule: jest.fn(),
        // Add other mocked methods if needed by CashService constructor or other calls
        listCashBankAccounts: jest.fn(),
        listCashStatementLines: jest.fn(),
        listCashTransactions: jest.fn(),
        getCashBankAccount: jest.fn(),
    },
}));

describe("CashService", () => {
    let cashService: CashService;

    beforeEach(() => {
        cashService = new CashService();
        jest.clearAllMocks();
    });

    describe("createTransaction", () => {
        it("should create a cash transaction with default values", async () => {
            const input = {
                bankAccountId: "bank-123",
                amount: "100.00",
                transactionDate: new Date("2025-01-01"),
                reference: "REF001",
            };

            // Mock storage return
            const mockTxn = { ...input, id: "txn-1", status: "Unreconciled" };
            (storage.createCashTransaction as jest.Mock).mockResolvedValue(mockTxn);

            const result = await cashService.createTransaction(input);

            expect(storage.createCashTransaction).toHaveBeenCalledWith(expect.objectContaining({
                bankAccountId: "bank-123",
                amount: "100.00",
                sourceModule: "GL", // Default
                sourceId: "MANUAL", // Default
                reference: "REF001",
                status: "Unreconciled",
            }));
            expect(result).toEqual(mockTxn);
        });

        it("should accept custom source and status", async () => {
            const input = {
                bankAccountId: "bank-123",
                amount: "50.00",
                sourceModule: "AP",
                sourceId: "PAY-999",
                status: "Cleared",
            };

            (storage.createCashTransaction as jest.Mock).mockResolvedValue({ ...input, id: "txn-2" });

            await cashService.createTransaction(input);

            expect(storage.createCashTransaction).toHaveBeenCalledWith(expect.objectContaining({
                sourceModule: "AP",
                sourceId: "PAY-999",
                status: "Cleared",
            }));
        });
    });

    describe("createReconciliationRule", () => {
        it("should create a reconciliation rule", async () => {
            const input: InsertCashReconciliationRule = {
                ruleName: "Auto Match Amount",
                ledgerId: "primary-ledger",
                matchingCriteria: { type: "AMOUNT_EXACT" },
                enabled: true,
                priority: 1,
            };

            (storage.createCashReconciliationRule as jest.Mock).mockResolvedValue({ ...input, id: "rule-1" });

            const result = await cashService.createReconciliationRule(input);

            expect(storage.createCashReconciliationRule).toHaveBeenCalledWith(input);
            expect(result).toEqual(expect.objectContaining({ id: "rule-1" }));
        });
    });
});
