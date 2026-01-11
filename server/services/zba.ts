
import { storage } from "../storage";
import { cashAuditService } from "./cash-audit.service";

export class ZbaService {
    async executeSweeps() {
        console.log("[CASH] Starting ZBA Sweep Process...");
        const allStructures = await storage.listCashZbaStructures();
        const structures = allStructures.filter(s => s.active && s.status === 'Active');
        let sweepCount = 0;

        for (const structure of structures) {
            if (!structure.active) continue;

            const subAccount = await storage.getCashBankAccount(structure.subAccountId);
            const masterAccount = await storage.getCashBankAccount(structure.masterAccountId);

            if (!subAccount || !masterAccount) continue;

            const currentBalance = Number(subAccount.currentBalance);
            const targetBalance = Number(structure.targetBalance);
            const variance = currentBalance - targetBalance;

            if (Math.abs(variance) < 0.01) continue;

            // Determine Sweep Direction
            const direction = variance > 0 ? "SUB_TO_MASTER" : "MASTER_TO_SUB";
            const amount = Math.abs(variance);

            console.log(`[CASH] ZBA Sweep: ${direction} for ${amount} (Sub: ${subAccount.name})`);

            // 1. Record the Sweep Event
            const sweep = await storage.createCashZbaSweep({
                structureId: structure.id,
                amount: amount.toString(),
                direction,
                sweepDate: new Date(),
                status: "Completed"
            });

            // 2. Create Internal Cash Transactions for Accounting
            // Sub Account Leg
            await storage.createCashTransaction({
                bankAccountId: subAccount.id,
                sourceModule: "GL",
                sourceId: sweep.id,
                amount: (variance > 0 ? -amount : amount).toString(),
                description: `ZBA Sweep: ${direction}`,
                transactionDate: new Date(),
                status: "Unreconciled"
            });

            // Master Account Leg
            await storage.createCashTransaction({
                bankAccountId: masterAccount.id,
                sourceModule: "GL",
                sourceId: sweep.id,
                amount: (variance > 0 ? amount : -amount).toString(),
                description: `ZBA Sweep: ${direction} from ${subAccount.name}`,
                transactionDate: new Date(),
                status: "Unreconciled"
            });

            // 3. Update Bank Account Balances
            await storage.updateCashBankAccount(subAccount.id, {
                currentBalance: targetBalance.toString()
            });

            await storage.updateCashBankAccount(masterAccount.id, {
                currentBalance: (Number(masterAccount.currentBalance) + (variance > 0 ? amount : -amount)).toString()
            });

            sweepCount++;
        }

        return {
            processed: structures.length,
            swept: sweepCount,
            message: `ZBA Sweep complete. Generated ${sweepCount} movements.`
        };
    }

    async listStructures() {
        return await storage.listCashZbaStructures();
    }

    async createStructure(data: any) {
        // New structures start as Pending for Maker-Checker workflow
        return await storage.createCashZbaStructure({
            ...data,
            status: "Pending",
            active: true
        });
    }

    async approveStructure(id: string) {
        return await storage.updateCashZbaStructure(id, {
            status: "Active"
        });
    }

    async rejectStructure(id: string) {
        return await storage.updateCashZbaStructure(id, {
            status: "Rejected",
            active: false
        });
    }

    async listSweeps(structureId?: string) {
        return await storage.listCashZbaSweeps(structureId);
    }
}

export const zbaService = new ZbaService();
