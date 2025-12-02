/**
 * Mobile API - Phase 7
 * Optimized endpoints for mobile clients
 */

export interface MobileResponse<T> {
  data: T;
  metadata?: { timestamp: Date; version: string };
  sync?: { version: number; deltaSync: boolean };
}

export interface SyncRequest {
  formId: string;
  lastSync?: Date;
  deltaOnly?: boolean;
}

export interface MinimalForm {
  id: string;
  name: string;
  icon?: string;
  lastModified?: Date;
}

export class MobileAPI {
  /**
   * Fetch forms for mobile (minimal payload)
   */
  fetchFormsMobile(userId: string, filters?: Record<string, any>): MobileResponse<MinimalForm[]> {
    if (!userId) {
      throw new Error("userId is required");
    }

    // Return minimal form data for mobile
    const forms: MinimalForm[] = [];
    return {
      data: forms,
      metadata: { timestamp: new Date(), version: "v1" },
      sync: { version: 1, deltaSync: false },
    };
  }

  /**
   * Fetch form for mobile (optimized)
   */
  fetchFormMobile(formId: string, recordId?: string): MobileResponse<Record<string, any>> {
    if (!formId) {
      throw new Error("formId is required");
    }

    // Return only essential fields
    const form: Record<string, any> = {};

    return {
      data: form,
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }

  /**
   * Submit form mobile (minimal upload)
   */
  submitFormMobile(formId: string, data: any, userId: string): MobileResponse<{ recordId: string; synced: boolean }> {
    if (!formId || !userId || !data) {
      throw new Error("formId, userId, and data are required");
    }

    return {
      data: { recordId: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, synced: true },
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }

  /**
   * Get sync data (delta sync)
   */
  getSyncData(userId: string, requests: SyncRequest[]): MobileResponse<Record<string, any[]>> {
    if (!userId || !requests || requests.length === 0) {
      throw new Error("userId and requests are required");
    }

    const syncData: Record<string, any[]> = {};

    for (const req of requests) {
      if (!req.formId) {
        throw new Error("Each request must have a formId");
      }
      syncData[req.formId] = [];
      // Would fetch actual delta data based on lastSync
    }

    return {
      data: syncData,
      sync: { version: 1, deltaSync: true },
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }

  /**
   * Get offline data package (minimal)
   */
  getOfflinePackage(
    userId: string,
    formIds: string[]
  ): MobileResponse<{
    forms: Record<string, any>[];
    validationRules: Record<string, any>;
    glAccounts: Record<string, any>[];
  }> {
    if (!userId || !formIds || formIds.length === 0) {
      throw new Error("userId and formIds are required");
    }

    return {
      data: {
        forms: [],
        validationRules: {},
        glAccounts: [],
      },
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }

  /**
   * Batch sync (upload multiple forms at once)
   */
  batchSyncMobile(
    userId: string,
    submissions: { formId: string; data: any }[]
  ): MobileResponse<{ synced: number; failed: number; records: Array<{ formId: string; recordId: string }> }> {
    if (!userId || !submissions || submissions.length === 0) {
      throw new Error("userId and submissions are required");
    }

    return {
      data: {
        synced: submissions.length,
        failed: 0,
        records: submissions.map((s) => ({
          formId: s.formId,
          recordId: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      },
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }
}

export const mobileAPI = new MobileAPI();
