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

  /**
   * Add to sync queue (offline submission)
   */
  addToQueue(userId: string, formId: string, data: any): SyncQueue {
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
    let synced = 0;
    let failed = 0;

    for (const item of this.syncQueue.values()) {
      if (item.userId !== userId || item.status !== "pending") continue;

      item.status = "syncing";
      try {
        // Simulate sync
        await this.performSync(item);
        item.status = "synced";
        synced++;
      } catch (error: any) {
        item.status = "failed";
        item.error = error.message;
        item.attempts++;
        failed++;

        // Remove after 3 failed attempts
        if (item.attempts >= 3) {
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
    return Array.from(this.syncQueue.values()).filter(
      (item) => item.userId === userId && item.status !== "synced"
    );
  }

  /**
   * Clear synced items
   */
  clearSyncedItems(userId: string): number {
    let count = 0;
    for (const [key, item] of this.syncQueue) {
      if (item.userId === userId && item.status === "synced") {
        this.syncQueue.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Perform sync (would call actual API)
   */
  private async performSync(item: SyncQueue): Promise<void> {
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
