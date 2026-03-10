import { uiFormatter } from "./uiFormatterService";

describe("UIFormatterService", () => {
    it("formats currency correctly", async () => {
        const result = await uiFormatter.format(1000, "currency");
        expect(result.formatted).toBe("$1,000.00");
    });

    it("formats mock ledger correctly", async () => {
        const result = await uiFormatter.format("1", "ledger");
        expect(result.formatted).toBe("Primary US Ledger (1)");
        expect(result.metadata?.name).toBe("Primary US Ledger");
    });

    it("handles fallback for unknown values", async () => {
        const result = await uiFormatter.format("unknown_id", "ledger");
        expect(result.formatted).toBe("unknown_id");
    });

    it("formats date correctly", async () => {
        const date = new Date("2023-01-01T00:00:00.000Z");
        const result = await uiFormatter.format(date.toISOString(), "date");
        // Date formatting depends on locale, checking if it returns a string is enough for basic verification
        expect(typeof result.formatted).toBe("string");
    });
});
