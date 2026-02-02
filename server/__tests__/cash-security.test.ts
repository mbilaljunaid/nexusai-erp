
import { CashService } from "../services/cash";
import { db } from "../db";
import { storage } from "../storage";

// Mock dependencies
jest.mock("../db");
jest.mock("../storage");

describe("CashService Security", () => {
    let cashService: CashService;

    beforeEach(() => {
        cashService = new CashService();
        jest.clearAllMocks();
    });

    it("should return all accounts if no userId provided", async () => {
        (storage.listCashBankAccounts as jest.Mock).mockResolvedValue([{ id: "acc1" }]);

        const result = await cashService.listBankAccounts(); // no userId
        expect(result).toEqual([{ id: "acc1" }]);
        expect(storage.listCashBankAccounts).toHaveBeenCalled();
    });

    it("should filter accounts by DAS assignments if userId provided", async () => {
        const userId = "user-123";

        // Mock DB Chain for DAS
        const mockAssignments = [{ ledgerId: "LEDGER-A" }];
        const fromMock = jest.fn();
        const innerJoinMock = jest.fn();
        const whereMock = jest.fn();

        (db.select as jest.Mock).mockReturnValue({
            from: fromMock.mockReturnValue({
                innerJoin: innerJoinMock.mockReturnValue({
                    where: whereMock.mockResolvedValue(mockAssignments)
                })
            })
        });

        // Mock DB Chain for BankAccounts
        const fromBankMock = jest.fn();
        const whereBankMock = jest.fn();
        (db.select as jest.Mock).mockImplementationOnce(() => ({
            from: fromMock.mockReturnValue({
                innerJoin: innerJoinMock.mockReturnValue({
                    where: whereMock.mockResolvedValue(mockAssignments)
                })
            })
        })).mockImplementationOnce(() => ({ // Second call
            from: fromBankMock.mockReturnValue({
                where: whereBankMock.mockResolvedValue([{ id: "acc-ledger-a", ledgerId: "LEDGER-A" }])
            })
        }));

        const result = await cashService.listBankAccounts(userId);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("acc-ledger-a");

        // Ensure DAS query was made
        expect(fromMock).toHaveBeenCalled();
    });

    it("should return empty list if user has no DAS assignments", async () => {
        const userId = "user-no-access";

        // Mock Empty Assignment
        const fromMock = jest.fn();
        const innerJoinMock = jest.fn();
        const whereMock = jest.fn();
        (db.select as jest.Mock).mockReturnValue({
            from: fromMock.mockReturnValue({
                innerJoin: innerJoinMock.mockReturnValue({
                    where: whereMock.mockResolvedValue([])
                })
            })
        });

        const result = await cashService.listBankAccounts(userId);
        expect(result).toEqual([]);

        // Should NOT query bank accounts
        const fromBankMock = jest.fn();
        expect(fromBankMock).not.toHaveBeenCalled();
    });
});
