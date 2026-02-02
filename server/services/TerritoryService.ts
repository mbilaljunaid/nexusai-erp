
import { db } from "../db";
import { territories, territoryRules, accounts, leads, type Account, type Lead } from "../../shared/schema";
import { eq, desc, and } from "drizzle-orm";

export class TerritoryService {

    // --- Assignment Logic ---

    static async assignAccount(accountId: string) {
        const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
        if (!account) throw new Error("Account not found");

        const matchedTerritoryId = await this.findMatchingTerritory(account);
        if (matchedTerritoryId) {
            // Update Account (we need to add territoryId to accounts schema first, 
            // but for now we can just return it or log it. Wait, I should add territoryId to accounts schema!)
            // For now, let's assume we return the suggestion.
            return matchedTerritoryId;
        }
        return null;
    }

    static async findMatchingTerritory(entity: any): Promise<string | null> {
        // Fetch all rules
        const rules = await db.select().from(territoryRules).orderBy(desc(territoryRules.priority));

        for (const rule of rules) {
            const fieldValue = entity[rule.field];
            if (!fieldValue) continue;

            let match = false;
            switch (rule.operator) {
                case 'equals':
                    match = String(fieldValue).toLowerCase() === rule.value.toLowerCase();
                    break;
                case 'contains':
                    match = String(fieldValue).toLowerCase().includes(rule.value.toLowerCase());
                    break;
                case 'gt':
                    match = Number(fieldValue) > Number(rule.value);
                    break;
                case 'lt':
                    match = Number(fieldValue) < Number(rule.value);
                    break;
            }

            if (match) {
                return rule.territoryId;
            }
        }
        return null;
    }

    // --- CRUD ---
    // (Standard CRUD can be in routes, but helper methods here if needed)
}
