import { apiRequest } from "@/lib/queryClient";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PMDefinition {
    id: string;
    name: string;
    assetId: string;
    assetName: string;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
    frequencyValue: number;
    lastGenerated?: string;
    nextDue: string;
    status: "ACTIVE" | "INACTIVE" | "DRAFT";
}

export interface PMGenerationParams {
    definitionIds: string[];
    startDate: string;
    endDate: string;
}

export interface MeterReading {
    id: string;
    meterId: string;
    meterName: string;
    assetId: string;
    assetName: string;
    readingValue: number;
    readingDate: string;
    readBy: string;
    notes?: string;
    gpsLocation?: string;
}

export interface Meter {
    id: string;
    assetId: string;
    assetName: string;
    meterName: string;
    uom: string;
    currentReading: number;
    lastReadingDate: string;
    warningThreshold?: number;
    criticalThreshold?: number;
    status: "NORMAL" | "WARNING" | "CRITICAL" | "OVERDUE";
}

export interface InspectionTemplate {
    id: string;
    name: string;
    category: string;
    itemCount: number;
    description?: string;
}

export interface Inspection {
    id: string;
    woId?: string;
    assetId: string;
    assetName: string;
    templateId: string;
    templateName: string;
    status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
    inspectedBy: string;
    inspectionDate: string;
    passCount: number;
    failCount: number;
    naCount: number;
}

export interface WorkPermit {
    id: string;
    permitNumber: string;
    woId?: string;
    permitType: string;
    location: string;
    description: string;
    requestedBy: string;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "ACTIVE" | "CLOSED" | "CANCELLED";
    validFrom?: string;
    validTo?: string;
    approvals: PermitApproval[];
}

export interface PermitApproval {
    level: number;
    approver: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approvedDate?: string;
    comments?: string;
}

export interface WorkDefinition {
    id: string;
    code: string;
    name: string;
    category: string;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    version: number;
    estimatedHours: number;
    estimatedCost: number;
    operationCount: number;
    materialCount: number;
    requiredSkills: string[];
    lastUsedDate?: string;
    useCount: number;
}

export interface WorkDefinitionDetail extends WorkDefinition {
    operations: WorkOperation[];
    materials: WorkMaterial[];
    notes?: string;
}

export interface WorkOperation {
    sequence: number;
    description: string;
    duration: number;
    skillRequired: string;
}

export interface WorkMaterial {
    itemCode: string;
    description: string;
    quantity: number;
    uom: string;
    estimatedCost: number;
}

export interface WorkOrderCost {
    id: string;
    woId: string;
    woNumber: string;
    assetName: string;
    description: string;
    actualLabor: number;
    actualMaterial: number;
    actualOther: number;
    totalActual: number;
    budgetLabor: number;
    budgetMaterial: number;
    budgetOther: number;
    totalBudget: number;
    variance: number;
    variancePercent: number;
    status: "PENDING_APPROVAL" | "APPROVED" | "POSTED_TO_GL" | "TRANSFERRED";
    completedDate?: string;
    approvedBy?: string;
    glPostDate?: string;
    projectId?: string;
}

export interface ServiceRequest {
    id: string;
    srNumber: string;
    title: string;
    description: string;
    location: string;
    assetName?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    priorityScore: number;
    status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CONVERTED_TO_WO";
    requestedBy: string;
    requestedByEmail: string;
    submittedDate: string;
    convertedWoNumber?: string;
}

export interface AssetHealth {
    id: string;
    assetId: string;
    assetName: string;
    assetType: string;
    healthScore: number;
    status: "GOOD" | "WATCH" | "ALERT" | "CRITICAL";
    criticality: number;
    failureRisk: number;
    uptime: number;
    nextPMDate: string;
}

export interface PredictiveAlert {
    id: string;
    assetId: string;
    assetName: string;
    alertType: "FAILURE_RISK" | "DEGRADATION" | "THRESHOLD_BREACH";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    probability: number;
    daysToFailure: number;
    description: string;
    recommendedAction: string;
}

export interface MaterialItem {
    id: string;
    itemCode: string;
    description: string;
    uom: string;
    onHand: number;
    reserved: number;
    available: number;
    reorderPoint: number;
    reorderQty: number;
    leadTimeDays: number;
    status: "OK" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
    lastPurchasePrice: number;
    avgMonthlyUsage: number;
}

export interface PurchaseRequisition {
    id: string;
    prNumber: string;
    itemCode: string;
    description: string;
    quantity: number;
    uom: string;
    estimatedCost: number;
    requestedBy: string;
    status: "DRAFT" | "SUBMITTED" | "APPROVED" | "ORDERED";
    createdDate: string;
    approvedDate?: string;
}

// ============================================================================
// PM SCHEDULER SERVICES
// ============================================================================

export const pmService = {
    async getPMDefinitions(): Promise<PMDefinition[]> {
        return apiRequest("GET", "/maintenance/pm/definitions").then(r => r.json());
    },

    async getPMDefinition(id: string): Promise<PMDefinition> {
        return apiRequest("GET", `/maintenance/pm/definitions/${id}`).then(r => r.json());
    },

    async createPMDefinition(data: Partial<PMDefinition>): Promise<PMDefinition> {
        return apiRequest("POST", "/maintenance/pm/definitions", data).then(r => r.json());
    },

    async updatePMDefinition(id: string, data: Partial<PMDefinition>): Promise<PMDefinition> {
        return apiRequest("PUT", `/maintenance/pm/definitions/${id}`, data).then(r => r.json());
    },

    async generatePMs(params: PMGenerationParams): Promise<{ count: number; workOrders: string[] }> {
        return apiRequest("POST", "/maintenance/pm/generate", params).then(r => r.json());
    },

    async previewPMGeneration(params: PMGenerationParams): Promise<any[]> {
        return apiRequest("POST", "/maintenance/pm/generate/preview", params).then(r => r.json());
    },
};

// ============================================================================
// METER READING SERVICES
// ============================================================================

export const meterService = {
    async getMeters(): Promise<Meter[]> {
        return apiRequest("GET", "/maintenance/meters").then(r => r.json());
    },

    async getMeter(id: string): Promise<Meter> {
        return apiRequest("GET", `/maintenance/meters/${id}`).then(r => r.json());
    },

    async getMeterReadings(meterId: string): Promise<MeterReading[]> {
        return apiRequest("GET", `/maintenance/meters/${meterId}/readings`).then(r => r.json());
    },

    async submitReading(data: {
        meterId: string;
        readingValue: number;
        readingDate: string;
        notes?: string;
        gpsLocation?: string;
        photoUrl?: string;
    }): Promise<MeterReading> {
        return apiRequest("POST", "/maintenance/meters/readings", data).then(r => r.json());
    },

    async updateThresholds(
        meterId: string,
        thresholds: { warningThreshold?: number; criticalThreshold?: number }
    ): Promise<Meter> {
        return apiRequest("PUT", `/maintenance/meters/${meterId}/thresholds`, thresholds).then(r => r.json());
    },
};

// ============================================================================
// QUALITY INSPECTION SERVICES
// ============================================================================

export const qualityService = {
    async getTemplates(): Promise<InspectionTemplate[]> {
        return apiRequest("GET", "/maintenance/inspections/templates").then(r => r.json());
    },

    async getTemplate(id: string): Promise<InspectionTemplate> {
        return apiRequest("GET", `/maintenance/inspections/templates/${id}`).then(r => r.json());
    },

    async getInspections(): Promise<Inspection[]> {
        return apiRequest("GET", "/maintenance/inspections").then(r => r.json());
    },

    async submitInspection(data: {
        assetId: string;
        templateId: string;
        woId?: string;
        results: any[];
        photos?: string[];
    }): Promise<Inspection> {
        return apiRequest("POST", "/maintenance/inspections", data).then(r => r.json());
    },

    async getAnalytics(params?: { startDate?: string; endDate?: string }): Promise<{
        totalInspections: number;
        passRate: number;
        failRate: number;
        trendData: any[];
        defectCategories: any[];
    }> {
        // Note: params handling in apiRequest doesn't support query params directly
        // This will need backend route to accept optional query params
        return apiRequest("GET", "/maintenance/quality/analytics").then(r => r.json());
    },
};

// ============================================================================
// WORK PERMIT SERVICES
// ============================================================================

export const permitService = {
    async getPermitTypes(): Promise<any[]> {
        return apiRequest("GET", "/maintenance/permit-types").then(r => r.json());
    },

    async getPermits(): Promise<WorkPermit[]> {
        return apiRequest("GET", "/maintenance/permits").then(r => r.json());
    },

    async getPermit(id: string): Promise<WorkPermit> {
        return apiRequest("GET", `/maintenance/permits/${id}`).then(r => r.json());
    },

    async createPermit(data: {
        permitType: string;
        location: string;
        description: string;
        woId?: string;
        hazards: string[];
        safeguards: string[];
    }): Promise<WorkPermit> {
        return apiRequest("POST", "/maintenance/permits", data).then(r => r.json());
    },

    async approvePermit(id: string, comments?: string): Promise<WorkPermit> {
        return apiRequest("POST", `/maintenance/permits/${id}/approve`, { comments }).then(r => r.json());
    },

    async rejectPermit(id: string, reason: string): Promise<WorkPermit> {
        return apiRequest("POST", `/maintenance/permits/${id}/reject`, { reason }).then(r => r.json());
    },

    async closePermit(id: string): Promise<WorkPermit> {
        return apiRequest("POST", `/maintenance/permits/${id}/close`).then(r => r.json());
    },
};

// ============================================================================
// WORK LIBRARY SERVICES
// ============================================================================

export const workLibraryService = {
    async getDefinitions(params?: { category?: string; status?: string }): Promise<WorkDefinition[]> {
        return apiRequest("GET", "/maintenance/library/definitions").then(r => r.json());
    },

    async getDefinitionDetail(id: string): Promise<WorkDefinitionDetail> {
        return apiRequest("GET", `/maintenance/library/definitions/${id}`).then(r => r.json());
    },

    async createDefinition(data: {
        code: string;
        name: string;
        category: string;
        operations: WorkOperation[];
        materials: WorkMaterial[];
        notes?: string;
    }): Promise<WorkDefinitionDetail> {
        return apiRequest("POST", "/maintenance/library/definitions", data).then(r => r.json());
    },

    async applyToWorkOrder(definitionId: string, woId: string): Promise<{ success: boolean }> {
        return apiRequest("POST", `/maintenance/library/definitions/${definitionId}/apply/${woId}`).then(r => r.json());
    },

    async createFromWorkOrder(woId: string, data: { code: string; name: string }): Promise<WorkDefinitionDetail> {
        return apiRequest("POST", `/maintenance/library/definitions/from-wo/${woId}`, data).then(r => r.json());
    },
};

// ============================================================================
// COST MANAGEMENT SERVICES
// ============================================================================

export const costService = {
    async getWorkOrderCosts(params?: { status?: string }): Promise<WorkOrderCost[]> {
        return apiRequest("GET", "/maintenance/costs").then(r => r.json());
    },

    async getCostDetail(woId: string): Promise<WorkOrderCost> {
        return apiRequest("GET", `/maintenance/work-orders/${woId}/costs`).then(r => r.json());
    },

    async approveCosts(costId: string): Promise<WorkOrderCost> {
        return apiRequest("POST", `/maintenance/costs/${costId}/approve`).then(r => r.json());
    },

    async postToGL(costId: string, glAccount: string, costCenter: string): Promise<{ success: boolean }> {
        return apiRequest("POST", `/maintenance/costs/${costId}/post-to-gl`, { glAccount, costCenter }).then(r => r.json());
    },

    async transferToProject(costId: string, projectId: string): Promise<WorkOrderCost> {
        return apiRequest("POST", `/ maintenance / costs / ${costId}/transfer`, { projectId }).then(r => r.json());
    },

    async getGLQueue(): Promise<any[]> {
        return apiRequest("GET", "/maintenance/costs/gl-queue").then(r => r.json());
    },

    async getVarianceAnalysis(params?: { startDate?: string; endDate?: string }): Promise<{
        categories: any[];
        totalBudget: number;
        totalActual: number;
        totalVariance: number;
    }> {
        return apiRequest("GET", "/maintenance/costs/variance").then(r => r.json());
    },
};

// ============================================================================
// SERVICE REQUEST SERVICES
// ============================================================================

export const serviceRequestService = {
    async getServiceRequests(params?: { status?: string }): Promise<ServiceRequest[]> {
        return apiRequest("GET", "/maintenance/service-requests").then(r => r.json());
    },

    async createServiceRequest(data: {
        title: string;
        description: string;
        location: string;
        assetName?: string;
        priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }): Promise<ServiceRequest> {
        return apiRequest("POST", "/maintenance/service-requests", data).then(r => r.json());
    },

    async updateStatus(
        id: string,
        status: "UNDER_REVIEW" | "APPROVED" | "REJECTED"
    ): Promise<ServiceRequest> {
        return apiRequest("PUT", `/maintenance/service-requests/${id}/status`, { status }).then(r => r.json());
    },

    async convertToWorkOrder(id: string): Promise<{ woNumber: string; srId: string }> {
        return apiRequest("POST", `/maintenance/service-requests/${id}/convert`).then(r => r.json());
    },
};

// ============================================================================
// ASSET HEALTH SERVICES
// ============================================================================

export const assetHealthService = {
    async getAssetHealth(): Promise<AssetHealth[]> {
        return apiRequest("GET", "/maintenance/assets/health").then(r => r.json());
    },

    async getAssetHealthDetail(assetId: string): Promise<{
        asset: AssetHealth;
        healthHistory: any[];
        alerts: PredictiveAlert[];
    }> {
        return apiRequest("GET", `/maintenance/assets/${assetId}/health`).then(r => r.json());
    },

    async getPredictiveAlerts(): Promise<PredictiveAlert[]> {
        return apiRequest("GET", "/maintenance/alerts/predictive").then(r => r.json());
    },

    async getHealthTrends(assetId: string): Promise<any[]> {
        return apiRequest("GET", `/maintenance/assets/${assetId}/health/trends`).then(r => r.json());
    },
};

// ============================================================================
// MATERIAL PLANNING SERVICES
// ============================================================================

export const materialService = {
    async getMaterials(params?: { status?: string }): Promise<MaterialItem[]> {
        return apiRequest("GET", "/maintenance/materials").then(r => r.json());
    },

    async generatePR(materialId: string, quantity?: number): Promise<PurchaseRequisition> {
        return apiRequest("POST", `/maintenance/materials/${materialId}/generate-pr`, { quantity }).then(r => r.json());
    },

    async getPurchaseRequisitions(): Promise<PurchaseRequisition[]> {
        return apiRequest("GET", "/maintenance/purchase-requisitions").then(r => r.json());
    },

    async submitPR(prId: string): Promise<PurchaseRequisition> {
        return apiRequest("POST", `/maintenance/purchase-requisitions/${prId}/submit`).then(r => r.json());
    },

    async getReservations(): Promise<any[]> {
        return apiRequest("GET", "/maintenance/materials/reservations").then(r => r.json());
    },

    async reserveMaterial(data: {
        itemCode: string;
        quantity: number;
        woId: string;
        requestedDate: string;
    }): Promise<any> {
        return apiRequest("POST", "/maintenance/materials/reserve", data).then(r => r.json());
    },

    async issueMaterial(reservationId: string): Promise<any> {
        return apiRequest("POST", `/maintenance/materials/reservations/${reservationId}/issue`).then(r => r.json());
    },
};

// ============================================================================
// SCHEDULING SERVICES
// ============================================================================

export const schedulingService = {
    async getScheduledWorkOrders(params?: { startDate?: string; endDate?: string }): Promise<any[]> {
        return apiRequest("GET", "/maintenance/schedules").then(r => r.json());
    },

    async getTechnicians(): Promise<any[]> {
        return apiRequest("GET", "/maintenance/technicians").then(r => r.json());
    },

    async updateSchedule(woId: string, data: {
        scheduledStart?: string;
        scheduledEnd?: string;
        technicianId?: string;
    }): Promise<any> {
        return apiRequest("PUT", `/maintenance/work-orders/${woId}/schedule`, data).then(r => r.json());
    },
};
