import { FormatterType, FormattedData } from "@/types/formatter";

// Mock cache for demo purposes. In real implementation, this would fetch from backend/cache.
const mockCache: Record<string, Record<string, string>> = {
    ledger: {
        "1": "Primary US Ledger",
        "2": "Primary IOS Ledger",
    },
    account: {
        "11010": "Cash - Operating",
        "50200": "Office Expenses",
    },
    user: {
        "user_123": "John Doe",
        "user_456": "Jane Smith",
    },
    status: {
        "OPEN": "Open",
        "CLOSED": "Closed",
        "PENDING": "Pending Approval",
    }
};

class UIFormatterService {
    /**
     * Formats a value based on its type.
     * Currently mocked to return immediate values.
     */
    async format(value: string | number, type: FormatterType): Promise<FormattedData> {
        // Simulate async if needed, but for Phase 1 we can keep it simple
        return this.resolve(value, type);
    }

    formatSync(value: string | number, type: FormatterType): FormattedData {
        return this.resolve(value, type);
    }

    private resolve(value: string | number, type: FormatterType): FormattedData {
        const valStr = String(value);

        // Handle standard types
        if (type === "date") {
            return {
                raw: value,
                formatted: new Date(value).toLocaleDateString(),
            };
        }

        if (type === "datetime") {
            return {
                raw: value,
                formatted: new Date(value).toLocaleString(),
            };
        }

        if (type === "currency") {
            return {
                raw: value,
                formatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
            }
        }

        // Lookup in mock cache
        const typeCache = mockCache[type];
        if (typeCache && typeCache[valStr]) {
            return {
                raw: value,
                formatted: `${typeCache[valStr]} (${valStr})`, // "Name (Code)" format
                metadata: { name: typeCache[valStr], code: valStr }
            };
        }

        // Fallback
        return {
            raw: value,
            formatted: valStr,
        };
    }
}

export const uiFormatter = new UIFormatterService();
