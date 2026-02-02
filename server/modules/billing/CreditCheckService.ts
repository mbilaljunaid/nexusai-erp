import { db } from "../../db";
import { arCustomerAccounts } from "@shared/schema/ar";
import { eq, sql } from "drizzle-orm";

/**
 * CreditCheckService
 * Enforces credit limits during Order Entry / Billing Event processing.
 */
export class CreditCheckService {

    /**
     * Check if a customer has sufficient credit.
     * @returns { pass: boolean, message: string }
     */
    async checkCredit(customerId: string, amount: number): Promise<{ pass: boolean, message: string }> {
        // 1. Get Customer Account
        // Note: Schema might need join if customerId is Party ID. Assuming 1:1 for V1 or direct link.
        // `arCustomerAccounts` has `customerId`.

        const [account] = await db.select().from(arCustomerAccounts).where(eq(arCustomerAccounts.customerId, customerId));

        if (!account) {
            // If no account profile, arguably we default to "No Limit" or "Strict". 
            // Enterprise rule: No Account = No Credit.
            return { pass: true, message: "No credit profile found, defaulting to Pass (or Warning)" };
        }

        const limit = Number(account.creditLimit || 0);
        const currentBalance = Number(account.balance || 0);

        if (limit === 0) {
            // Limit 0 usually means "Unlimited" or "Audited separate". 
            // Let's assume 0 = Unlimited for this implementation unless `creditHold` is true.
            if (account.creditHold) {
                return { pass: false, message: "Customer is on Credit Hold" };
            }
            return { pass: true, message: "Unlimited Credit" };
        }

        if (currentBalance + amount > limit) {
            return {
                pass: false,
                message: `Credit Limit Exceeded. Limit: ${limit}, Balance: ${currentBalance}, Attempted: ${amount}`
            };
        }

        return { pass: true, message: "Credit Check Passed" };
    }
}

export const creditCheckService = new CreditCheckService();
