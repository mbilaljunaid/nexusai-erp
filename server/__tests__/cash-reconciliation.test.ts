
import { cashService } from "../services/cash";
import { storage } from "../storage";
import { db } from "../db";

// Mock dependencies
jest.mock("../storage", () => ({
    storage: {
        listCashStatementLines: jest.fn(),
        listCashTransactions: jest.fn(),
        createCashMatchingGroup: jest.fn(),
        updateCashTransaction: jest.fn(),
        listCashReconciliationRules: jest.fn(),
        getCashBankAccount: jest.fn(),
    }
}));

jest.mock("../db", () => ({
    db: {
        update: jest.fn(() => ({
            set: jest.fn(() => ({
                where: jest.fn().mockResolvedValue([])
            }))
        }))
    }
}));

describe("CashService Reconciliation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("manualReconcile", () => {
        it("should successfully reconcile matching amounts", async () => {
            // Setup Mocks
            (storage.listCashStatementLines as jest.Mock).mockResolvedValue([
                { id: "line-1", amount: "100.00", reconciled: false },
                { id: "line-2", amount: "50.00", reconciled: false }
            ]);
            (storage.listCashTransactions as jest.Mock).mockResolvedValue([
                { id: "tx-1", amount: "150.00", status: "Unreconciled" }
            ]);
            (storage.createCashMatchingGroup as jest.Mock).mockResolvedValue({ id: "group-1" });

            // Execute
            await cashService.manualReconcile(
                "acc-1",
                ["line-1", "line-2"],
                ["tx-1"]
            );

            // Assert
            expect(storage.createCashMatchingGroup).toHaveBeenCalled();
            // Verify DB updates for lines
            expect(db.update).toHaveBeenCalled();
            // We can't easily check the chain of db.update().set().where() without complex mocks, 
            // but ensuring it didn't throw and called update is a good start.
        });

        it("should throw error on amount mismatch", async () => {
            (storage.listCashStatementLines as jest.Mock).mockResolvedValue([
                { id: "line-1", amount: "100.00" }
            ]);
            (storage.listCashTransactions as jest.Mock).mockResolvedValue([
                { id: "tx-1", amount: "99.00" }
            ]);

            await expect(cashService.manualReconcile("acc-1", ["line-1"], ["tx-1"]))
                .rejects.toThrow("Amount mismatch");
        });
    });

    describe("autoReconcile", () => {
        it("should match based on exact amount and date tolerance", async () => {
            (storage.getCashBankAccount as jest.Mock).mockResolvedValue({ id: "acc-1", ledgerId: "led-1", name: "Test Account" });
            (storage.listCashReconciliationRules as jest.Mock).mockResolvedValue([
                { ruleName: "Exact Match", priority: 1, matchingCriteria: { dateToleranceDays: 1 } }
            ]);
            (storage.listCashStatementLines as jest.Mock).mockResolvedValue([
                { id: "line-1", amount: "100.00", transactionDate: new Date("2025-01-01"), reconciled: false }
            ]);
            (storage.listCashTransactions as jest.Mock).mockResolvedValue([
                { id: "tx-1", amount: "100.00", transactionDate: new Date("2025-01-01"), status: "Unreconciled" }
            ]);
            (storage.createCashMatchingGroup as jest.Mock).mockResolvedValue({ id: "group-auto" });

            const result = await cashService.autoReconcile("acc-1");

            expect(result.matched).toBe(1);
            expect(storage.createCashMatchingGroup).toHaveBeenCalled();
            expect(storage.updateCashTransaction).toHaveBeenCalledWith("tx-1", expect.objectContaining({ status: "Cleared" }));
        });
    });
});
