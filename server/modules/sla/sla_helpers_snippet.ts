
export interface SlaEventPayload {
    amount: number;
    currencyCode: string;
    eventDate: Date;
    sourceData: any; // Flexible source
}

// --- Helper Methods ---

export function evaluateCondition(condition: string, context: SlaEventPayload): boolean {
    try {
        // Secure-ish evaluation: strictly limit scope to 'source' (sourceData) and 'header' (payload root)
        // Example: "source.taxAmount > 0"
        // Re-mapping context for cleaner syntax in rules
        const scope = {
            source: context.sourceData,
            header: {
                amount: context.amount,
                currency: context.currencyCode,
                date: context.eventDate
            }
        };

        // Basic parsing for specific operators to avoid full eval() for MVP security
        // Or use Function constructor with keys
        const keys = Object.keys(scope);
        const values = Object.values(scope);
        const func = new Function(...keys, `return ${condition};`);

        return !!func(...values);
    } catch (err) {
        console.error(`[SLA] Error evaluating condition "${condition}":`, err);
        return false; // Fail safe
    }
}

export function deriveAmount(amountSource: string | null, context: SlaEventPayload): number {
    if (!amountSource || amountSource === "amount") {
        return context.amount;
    }

    // Check sourceData
    const val = context.sourceData?.[amountSource];
    if (val !== undefined && val !== null) {
        return Number(val);
    }

    return 0;
}

export function deriveDescription(rule: string | null, defaultDesc: string, context: SlaEventPayload): string {
    if (!rule) return defaultDesc;

    // Simple interpolation: "Tax for {invoiceNumber}"
    return rule.replace(/\{(\w+)\}/g, (match, key) => {
        return context.sourceData?.[key] || match;
    });
}
