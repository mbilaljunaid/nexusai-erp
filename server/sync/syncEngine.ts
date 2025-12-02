/**
 * Sync Engine - Phase 7
 * Offline-first synchronization for mobile
 */

export interface SyncQueue {
  id: string;
  userId: string;
  formId: string;
  data: any;
  status: "pending" | "syncing" | "synced" | "failed";
  timestamp: Date;
  attempts: number;
  error?: string;
}

export interface SyncState {
  userId: string;
  lastSync: Date;
  syncVersion: number;
  pendingCount: number;
  failedCount: number;
}

export class SyncEngine {
  private syncQueue: Map<string, SyncQueue> = new Map();
  private syncStates: Map<string, SyncState> = new Map();
  private queueCounter: number = 0;
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Add to sync queue (offline submission)
   */
  addToQueue(userId: string, formId: string, data: any): SyncQueue {
    if (!userId || !formId || !data) {
      throw new Error("userId, formId, and data are required");
    }

    const item: SyncQueue = {
      id: `SYNC-${Date.now()}-${++this.queueCounter}`,
      userId,
      formId,
      data,
      status: "pending",
      timestamp: new Date(),
      attempts: 0,
    };

    this.syncQueue.set(item.id, item);

    // Update sync state
    this.updateSyncState(userId);

    return item;
  }

  /**
   * Sync pending items
   */
  async syncPending(userId: string): Promise<{ synced: number; failed: number }> {
    if (!userId) {
      throw new Error("userId is required");
    }

    let synced = 0;
    let failed = 0;

    const items = Array.from(this.syncQueue.values());
    for (const item of items) {
      if (item.userId !== userId || item.status !== "pending") continue;

      item.status = "syncing";
      try {
        // Simulate sync
        await this.performSync(item);
        item.status = "synced";
        synced++;
      } catch (error: any) {
        item.status = "failed";
        item.error = error instanceof Error ? error.message : String(error);
        item.attempts++;
        failed++;

        // Remove after max attempts
        if (item.attempts >= this.MAX_ATTEMPTS) {
          this.syncQueue.delete(item.id);
        }
      }
    }

    this.updateSyncState(userId);
    return { synced, failed };
  }

  /**
   * Get sync state
   */
  getSyncState(userId: string): SyncState {
    if (!userId) {
      throw new Error("userId is required");
    }

    return (
      this.syncStates.get(userId) || {
        userId,
        lastSync: new Date(),
        syncVersion: 1,
        pendingCount: 0,
        failedCount: 0,
      }
    );
  }

  /**
   * Get pending items
   */
  getPendingItems(userId: string): SyncQueue[] {
    if (!userId) {
      throw new Error("userId is required");
    }

    return Array.from(this.syncQueue.values()).filter(
      (item) => item.userId === userId && item.status !== "synced"
    );
  }

  /**
   * Clear synced items
   */
  clearSyncedItems(userId: string): number {
    if (!userId) {
      throw new Error("userId is required");
    }

    let count = 0;
    const keysToDelete: string[] = [];

    const entries = Array.from(this.syncQueue.entries());
    for (const [key, item] of entries) {
      if (item.userId === userId && item.status === "synced") {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.syncQueue.delete(key);
      count++;
    }

    return count;
  }

  /**
   * Perform sync (would call actual API)
   */
  private async performSync(item: SyncQueue): Promise<void> {
    if (!item || !item.id) {
      throw new Error("Invalid sync item");
    }

    // In production, would POST to API endpoint
    // Simulate network delay
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Update sync state
   */
  private updateSyncState(userId: string): void {
    const pending = Array.from(this.syncQueue.values()).filter(
      (item) => item.userId === userId && item.status === "pending"
    );
    const failed = Array.from(this.syncQueue.values()).filter(
      (item) => item.userId === userId && item.status === "failed"
    );

    this.syncStates.set(userId, {
      userId,
      lastSync: new Date(),
      syncVersion: 1,
      pendingCount: pending.length,
      failedCount: failed.length,
    });
  }
}

export const syncEngine = new SyncEngine();
