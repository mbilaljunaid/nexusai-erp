
import { cashForecastService } from "../services/cash-forecast.service";
import { db } from "../db";

// Mock dependencies
jest.mock("../db", () => ({
    db: {
        select: jest.fn(() => ({
            from: jest.fn(() => ({
                where: jest.fn()
            }))
        }))
    }
}));

describe("CashForecastService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should calculate forecast correctly based on inflows and outflows", async () => {
        // Setup Mocks
        const mockAccounts = [{ currentBalance: "1000.00", active: true }];

        // Mock AP Outflows (Due tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const mockAp = [{
            date: tomorrow,
            amount: "200.00",
            supplierId: 101,
            ref: "INV-AP-1"
        }];

        // Mock AR Inflows (Due day after tomorrow)
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        const mockAr = [{
            date: dayAfter,
            amount: "500.00",
            customerId: "CUST-1",
            ref: "INV-AR-1"
        }];


        // Helper to create a mock builder
        const createMockBuilder = (result: any[]) => ({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue(result)
            })
        });

        // Setup explicit mocks based on call order or inspection if needed
        // Since we know the order: Accounts -> AP -> AR
        (db.select as jest.Mock)
            .mockReturnValueOnce(createMockBuilder(mockAccounts)) // 1. Accounts
            .mockReturnValueOnce(createMockBuilder(mockAp))       // 2. AP
            .mockReturnValueOnce(createMockBuilder(mockAr));      // 3. AR


        // Execute
        const forecast = await cashForecastService.generateForecast(new Date(), 5);

        // Assert
        expect(forecast).toHaveLength(5);

        // Day 0 (Today): Balance 1000
        expect(forecast[0].openingBalance).toBe(1000);
        expect(forecast[0].closingBalance).toBe(1000);

        // Day 1 (Tomorrow): Balance 1000 -> Outflow 200 -> Closing 800
        expect(forecast[1].openingBalance).toBe(1000);
        expect(forecast[1].outflow).toBe(200);
        expect(forecast[1].closingBalance).toBe(800);

        // Day 2 (Day After): Balance 800 -> Inflow 500 -> Closing 1300
        expect(forecast[2].openingBalance).toBe(800);
        expect(forecast[2].inflow).toBe(500);
        expect(forecast[2].closingBalance).toBe(1300);
    });

    it("should handle empty data gracefully", async () => {
        const fromMock = jest.fn();
        const whereMock = jest.fn();

        (db.select as jest.Mock)
            .mockReturnValueOnce({ from: fromMock.mockReturnValue({ where: whereMock.mockResolvedValue([]) }) }) // Accounts empty
            .mockReturnValueOnce({ from: fromMock.mockReturnValue({ where: whereMock.mockResolvedValue([]) }) }) // AP empty
            .mockReturnValueOnce({ from: fromMock.mockReturnValue({ where: whereMock.mockResolvedValue([]) }) }); // AR empty

        const forecast = await cashForecastService.generateForecast(new Date(), 5);

        expect(forecast[0].openingBalance).toBe(0);
        expect(forecast[4].closingBalance).toBe(0);
        expect(forecast).toHaveLength(5);
    });
});
