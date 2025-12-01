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

export class MobileAPI {
  /**
   * Fetch forms for mobile (minimal payload)
   */
  fetchFormsMobile(userId: string, filters?: any): MobileResponse<any[]> {
    // Return minimal form data for mobile
    const forms = []; // Would fetch actual forms
    return {
      data: forms.map((f) => ({
        id: f.id,
        name: f.name,
        icon: f.icon,
        lastModified: f.updatedAt,
      })),
      metadata: { timestamp: new Date(), version: "v1" },
      sync: { version: 1, deltaSync: false },
    };
  }

  /**
   * Fetch form for mobile (optimized)
   */
  fetchFormMobile(formId: string, recordId?: string): MobileResponse<any> {
    // Return only essential fields
    const form = {}; // Would fetch actual form

    return {
      data: form,
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }

  /**
   * Submit form mobile (minimal upload)
   */
  submitFormMobile(formId: string, data: any, userId: string): MobileResponse<{ recordId: string; synced: boolean }> {
    return {
      data: { recordId: `REC-${Date.now()}`, synced: true },
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }

  /**
   * Get sync data (delta sync)
   */
  getSyncData(userId: string, requests: SyncRequest[]): MobileResponse<{ [formId: string]: any[] }> {
    const syncData: { [key: string]: any[] } = {};

    for (const req of requests) {
      syncData[req.formId] = [];
      // Would fetch actual delta data
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
  getOfflinePackage(userId: string, formIds: string[]): MobileResponse<{
    forms: any[];
    validationRules: any;
    glAccounts: any[];
  }> {
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
  ): MobileResponse<{ synced: number; failed: number; records: any[] }> {
    return {
      data: {
        synced: submissions.length,
        failed: 0,
        records: submissions.map((s) => ({ formId: s.formId, recordId: `REC-${Date.now()}` })),
      },
      metadata: { timestamp: new Date(), version: "v1" },
    };
  }
}

export const mobileAPI = new MobileAPI();
