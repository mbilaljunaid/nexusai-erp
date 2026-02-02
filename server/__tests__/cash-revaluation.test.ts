
import { cashRevaluationService } from "../services/cash-revaluation.service";
import { db } from "../db";
import { storage } from "../storage";
import { cashAccountingService } from "../services/cash-accounting.service";

jest.mock("../db");
jest.mock("../storage");
jest.mock("../services/cash-accounting.service");

describe("CashRevaluationService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should calculate gain/loss correctly", async () => {
        const mockAccount = {
            id: "acc-1",
            name: "EUR Bank",
            currency: "EUR",
            currentBalance: "1000.00",
            ledgerId: "L1"
        };

        (storage.getCashBankAccount as jest.Mock).mockResolvedValue(mockAccount);

        // MockExchange Rate: 1.25 USD/EUR
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ rate: "1.25" }])
        });

        const result = await cashRevaluationService.calculateRevaluation("acc-1");

        // Historical value = 1000 * 1.1 = 1100
        // Current value = 1000 * 1.25 = 1250
        // Gain = 150
        expect(result.gainLoss).toBe(150);
    });

    it("should skip revaluation for functional currency", async () => {
        const mockAccount = {
            id: "acc-2",
            name: "USD Bank",
            currency: "USD",
            currentBalance: "500.00"
        };

        (storage.getCashBankAccount as jest.Mock).mockResolvedValue(mockAccount);

        const result = await cashRevaluationService.calculateRevaluation("acc-2");
        expect(result.gainLoss).toBe(0);
    });

    it("should post revaluation journal to SLA", async () => {
        const mockAccount = {
            id: "acc-1",
            name: "EUR Bank",
            currency: "EUR",
            currentBalance: "1000.00",
            ledgerId: "L1"
        };

        (storage.getCashBankAccount as jest.Mock).mockResolvedValue(mockAccount);
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ rate: "0.9" }])
        });

        await cashRevaluationService.postRevaluation("acc-1");

        expect(cashAccountingService.createAccounting).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: "REVALUATION",
                amount: expect.any(Number),
                sourceId: "acc-1"
            })
        );
    });
});
