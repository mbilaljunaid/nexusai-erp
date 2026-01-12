// cash.service.ts - Service wrapper for cash related operations used by sweep engine
import { zbaService } from "./zba";
import { logger } from "../utils/logger";

/**
 * CashService provides high‑level methods required by the automated sweep engine.
 * It delegates to existing services (e.g., ZbaService) and can be extended with
 * additional cash‑management functionality.
 */
export class CashService {
    /**
     * Retrieve ZBA structures that are pending sweep.
     * For now we consider all structures with status "Active" as pending.
     */
    async getPendingZbaStructures() {
        const all = await zbaService.listStructures();
        // Filter active structures; in a real system you would have a specific "pending" flag.
        return all.filter((s: any) => s.status === "Active");
    }

    /**
     * Perform a sweep for a single ZBA structure.
     * This is a thin wrapper around ZbaService.executeSweeps which processes all.
     * In a full implementation you would target the specific structure.
     */
    async sweepZba(zbaId: string) {
        logger.info(`[CashService] Sweeping ZBA id=${zbaId}`);
        // Placeholder: invoke the full sweep process; it will handle the given id internally.
        // In a real implementation you would have a method to sweep a single structure.
        await zbaService.executeSweeps();
    }
}

export const cashService = new CashService();
