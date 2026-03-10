# Maintenance Module - Service Layer Integration Guide

## Overview
This guide explains how to integrate the centralized `maintenance.service.ts` layer into existing Maintenance components to replace mock data with live API calls.

##  Service Layer Architecture

### File: `/src/services/maintenance.service.ts`
**Lines of Code:** ~850 LOC  
**Purpose:** Centralized API service layer for all Maintenance module operations

**Features:**
- ✅ **Typed interfaces** for all request/response objects
- ✅ **10 service areas** covering complete Maintenance lifecycle
- ✅ **40+ methods** mapped to backend endpoints
- ✅ **Error handling** built-in via apiRequest wrapper
- ✅ **Consistent API** follows RESTful conventions

---

## Service Areas

```typescript
import { maintenanceService } from "@/services/maintenance.service";

maintenanceService.pm               // PM Scheduling
maintenanceService.meter            // Meter Reading
maintenanceService.quality          // Quality Inspections
maintenanceService.permit           // Work Permits
maintenanceService.workLibrary      // Work Definitions
maintenanceService.cost             // Cost Management
maintenanceService.serviceRequest   // Service Requests
maintenanceService.assetHealth      // Asset Health Monitoring
maintenanceService.material         // Material Planning
maintenanceService.scheduling       // Work Order Scheduling
```

---

## Integration Pattern

### Example: Service Request Portal (COMPLETE ✅)

**File:** `ServiceRequestPortal.tsx`  
**Status:** Fully integrated with live APIs  
**Removed:** ~70 lines of mock data  
**Added:** ~30 lines of service calls

#### Step 1: Import Service + Types

```typescript
import { 
  serviceRequestService, 
  type ServiceRequest as ServiceRequestType 
} from "@/services/maintenance.service";
```

#### Step 2: Create Mapper (if needed)

```typescript
// Map API response format to component format
const mapServiceRequest = (apiSR: ServiceRequestType): ServiceRequest => ({
    id: apiSR.id,
    number: apiSR.srNumber,
    title: apiSR.title,
    description: apiSR.description,
    requestorName: apiSR.requestedBy,
    requestorEmail: apiSR.requestedByEmail,
    location: apiSR.location,
    assetName: apiSR.assetName,
    priority: apiSR.priority,
    status: apiSR.status,
    submittedDate: apiSR.submittedDate,
    workOrderId: apiSR.convertedWoNumber,
    priorityScore: apiSR.priorityScore,
});
```

#### Step 3: Replace Mock Data Loading

**BEFORE (Mock Data - ~70 lines):**
```typescript
const loadRequests = async () => {
    setLoading(true);
    try {
        const mockRequests: ServiceRequest[] = [
            { id: "sr-001", number: "SR-2026-001", ... },
            { id: "sr-002", number: "SR-2026-002", ... },
            // ... 70 lines of mock data
        ];
        setRequests(mockRequests);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
};
```

**AFTER (Live API - ~10 lines):**
```typescript
const loadRequests = async () => {
    setLoading(true);
    try {
        // ✅ LIVE API CALL - Replace mock data with service layer
        const apiRequests = await serviceRequestService.getServiceRequests();
        const mappedRequests = apiRequests.map(mapServiceRequest);
        setRequests(mappedRequests);
    } catch (error) {
        console.error("Failed to load service requests:", error);
        setRequests([]); // Fallback to empty array on error
    } finally {
        setLoading(false);
    }
};
```

#### Step 4: Replace Mock CRUD Operations

**CREATE (Submit Request):**
```typescript
const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // ✅ LIVE API CALL
        const apiResponse = await serviceRequestService.createServiceRequest({
            title: formData.title,
            description: formData.description,
            location: formData.location,
            assetName: formData.assetName,
            priority: formData.priority,
        });

        const newRequest = mapServiceRequest(apiResponse);
        setRequests([newRequest, ...requests]);
        setShowForm(false);
        // Reset form...
    } catch (error) {
        console.error("Failed to submit service request:", error);
        // TODO: Show error toast to user
    }
};
```

**UPDATE (Convert to WO):**
```typescript
const handleConvertToWO = async (requestId: string) => {
    try {
        // ✅ LIVE API CALL - Convert SR to WO
        const result = await serviceRequestService.convertToWorkOrder(requestId);

        setRequests(prev => prev.map(req =>
            req.id === requestId
                ? { ...req, status: "CONVERTED_TO_WO", workOrderId: result.woNumber }
                : req
        ));

        // TODO: Show success toast with WO number
    } catch (error) {
        console.error("Failed to convert SR to WO:", error);
        // TODO: Show error toast  
    }
};
```

---

## Integration Checklist

For each component, follow this checklist:

### 1. Import Service
```typescript
import { pmService } from "@/services/maintenance.service";
// or
import { materialService } from "@/services/maintenance.service";
```

### 2. Replace Mock Data Fetching
- ❌ Remove: `const mockData = [...]`
- ✅ Add: `const data = await service.getXXX()`

### 3. Replace Mock CRUD
- ❌ Remove: `setTimeout(() => {...}, 1000)`
- ✅ Add: `await service.createXXX(data)`
- ✅ Add: `await service.updateXXX(id, data)`
- ✅ Add: `await service.deleteXXX(id)`

### 4. Add Error Handling
```typescript
try {
    const result = await service.method();
    // Update state...
} catch (error) {
    console.error("Operation failed:", error);
    // TODO: Show user-friendly error toast
}
```

### 5. (Optional) Add Loading States
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
    setLoading(true);
    try {
        const data = await service.getData();
        setState(data);
    } finally {
        setLoading(false);
    }
};
```

---

## Service Method Reference

### PM Scheduling (`pmService`)
```typescript
await pmService.getPMDefinitions()                 // GET /maintenance/pm/definitions
await pmService.getPMDefinition(id)                // GET /maintenance/pm/definitions/:id
await pmService.createPMDefinition(data)           // POST /maintenance/pm/definitions
await pmService.updatePMDefinition(id, data)       // PUT /maintenance/pm/definitions/:id
await pmService.generatePMs(params)                // POST /maintenance/pm/generate
await pmService.previewPMGeneration(params)        // POST /maintenance/pm/generate/preview
```

### Meter Reading (`meterService`)
```typescript
await meterService.getMeters()                     // GET /maintenance/meters
await meterService.getMeter(id)                    // GET /maintenance/meters/:id
await meterService.getMeterReadings(meterId)       // GET /maintenance/meters/:id/readings
await meterService.submitReading(data)             // POST /maintenance/meters/readings
await meterService.updateThresholds(id, data)      // PUT /maintenance/meters/:id/thresholds
```

### Quality Inspections (`qualityService`)
```typescript
await qualityService.getTemplates()                // GET /maintenance/inspections/templates
await qualityService.getTemplate(id)               // GET /maintenance/inspections/templates/:id
await qualityService.getInspections()              // GET /maintenance/inspections
await qualityService.submitInspection(data)        // POST /maintenance/inspections
await qualityService.getAnalytics(params)          // GET /maintenance/quality/analytics
```

### Work Permits (`permitService`)
```typescript
await permitService.getPermits()                   // GET /maintenance/permits
await permitService.getPermit(id)                  // GET /maintenance/permits/:id
await permitService.createPermit(data)             // POST /maintenance/permits
await permitService.approvePermit(id, comments)    // POST /maintenance/permits/:id/approve
await permitService.rejectPermit(id, reason)       // POST /maintenance/permits/:id/reject
await permitService.closePermit(id)                // POST /maintenance/permits/:id/close
```

### Work Library (`workLibraryService`)
```typescript
await workLibraryService.getDefinitions(params)    // GET /maintenance/library/definitions
await workLibraryService.getDefinitionDetail(id)   // GET /maintenance/library/definitions/:id
await workLibraryService.createDefinition(data)    // POST /maintenance/library/definitions
await workLibraryService.applyToWorkOrder(defId, woId)  // POST /maintenance/library/definitions/:id/apply/:woId
await workLibraryService.createFromWorkOrder(woId, data) // POST /maintenance/library/definitions/from-wo/:woId
```

### Cost Management (`costService`)
```typescript
await costService.getWorkOrderCosts(params)        // GET /maintenance/costs
await costService.getCostDetail(woId)              // GET /maintenance/work-orders/:id/costs
await costService.approveCosts(costId)             // POST /maintenance/costs/:id/approve
await costService.postToGL(costId, glAccount, costCenter) // POST /maintenance/costs/:id/post-to-gl
await costService.transferToProject(costId, projectId)  // POST /maintenance/costs/:id/transfer
await costService.getGLQueue()                     // GET /maintenance/costs/gl-queue
await costService.getVarianceAnalysis(params)      // GET /maintenance/costs/variance
```

### Service Requests (`serviceRequestService`)
```typescript
await serviceRequestService.getServiceRequests(params)  // GET /maintenance/service-requests
await serviceRequestService.createServiceRequest(data)  // POST /maintenance/service-requests
await serviceRequestService.updateStatus(id, status)    // PUT /maintenance/service-requests/:id/status
await serviceRequestService.convertToWorkOrder(id)      // POST /maintenance/service-requests/:id/convert
```

### Asset Health (`assetHealthService`)
```typescript
await assetHealthService.getAssetHealth()          // GET /maintenance/assets/health
await assetHealthService.getAssetHealthDetail(id)  // GET /maintenance/assets/:id/health
await assetHealthService.getPredictiveAlerts()     // GET /maintenance/alerts/predictive
await assetHealthService.getHealthTrends(id)       // GET /maintenance/assets/:id/health/trends
```

### Materials (`materialService`)
```typescript
await materialService.getMaterials(params)         // GET /maintenance/materials
await materialService.generatePR(materialId, qty)  // POST /maintenance/materials/:id/generate-pr
await materialService.getPurchaseRequisitions()    // GET /maintenance/purchase-requisitions
await materialService.submitPR(prId)               // POST /maintenance/purchase-requisitions/:id/submit
await materialService.getReservations()            // GET /maintenance/materials/reservations
await materialService.reserveMaterial(data)        // POST /maintenance/materials/reserve
await materialService.issueMaterial(reservationId) // POST /maintenance/materials/reservations/:id/issue
```

### Scheduling (`schedulingService`)
```typescript
await schedulingService.getScheduledWorkOrders(params)  // GET /maintenance/schedules
await schedulingService.getTechnicians()                // GET /maintenance/technicians
await schedulingService.updateSchedule(woId, data)      // PUT /maintenance/work-orders/:id/schedule
```

---

## Remaining Components to Integrate

| Component | Status | Priority | Estimated LOC Reduction |
|-----------|--------|----------|------------------------|
| ServiceRequestPortal | ✅ COMPLETE | - | ~70 lines removed |
| PMScheduler | ⏳ TODO | HIGH | ~50-60 lines |
| MeterReadingModule | ⏳ TODO | HIGH | ~40-50 lines |
| InspectionWorkflow | ⏳ TODO | MEDIUM | ~30-40 lines |
| PermitWorkflow | ⏳ TODO | MEDIUM | ~40-50 lines |
| QualityAnalytics | ⏳ TODO | LOW | ~20-30 lines |
| WorkLibrary | ⏳ TODO | MEDIUM | ~30-40 lines |
| AssetHealthDashboard | ⏳ TODO | MEDIUM | ~60-70 lines |
| AdvancedSchedulingBoard | ⏳ TODO | LOW | ~40-50 lines |
| CostManagementHub | ⏳ TODO | MEDIUM | ~50-60 lines |
| MaterialPlanningView | ⏳ TODO | MEDIUM | ~60-70 lines |

**Total Potential Reduction:** ~500-600 lines of mock data removed

---

## Error Handling Best Practices

### 1. User-Friendly Error Messages
```typescript
try {
    await service.method();
} catch (error) {
    console.error("Operation failed:", error);
    toast.error("Failed to complete operation", {
        description: error instanceof Error ? error.message : "Unknown error"
    });
}
```

### 2. Fallback to Empty State
```typescript
try {
    const data = await service.getData();
    setData(data);
} catch (error) {
    console.error(error);
    setData([]); // Empty array fallback
}
```

### 3. Optimistic UI Updates
```typescript
// Update UI immediately
setData(prev => [...prev, newItem]);

try {
    await service.create(newItem);
    // Success - no additional UI update needed
} catch (error) {
    // Rollback on error
    setData(prev => prev.filter(item => item.id !== newItem.id));
    toast.error("Failed to create item");
}
```

---

## Testing Strategy

### 1. Unit Tests
Test service methods in isolation:
```typescript
describe('serviceRequestService', () => {
    it('should fetch service requests', async () => {
        const requests = await serviceRequestService.getServiceRequests();
        expect(requests).toBeDefined();
        expect(Array.isArray(requests)).toBe(true);
    });
});
```

### 2. Integration Tests
Test component integration:
```typescript
describe('ServiceRequestPortal', () => {
    it('should load requests on mount', async () => {
        render(<ServiceRequestPortal />);
        await waitFor(() => {
            expect(screen.getByText(/SR-2026-/)).toBeInTheDocument();
        });
    });
});
```

---

## Next Steps

### Immediate (Priority 1)
1. ✅ Fix `apiRequest` export (DONE - using queryClient.ts)
2. ✅ ServiceRequestPortal integration (DONE)
3. ⏳ PMScheduler integration
4. ⏳ MeterReadingModule integration

### Short-Term (Priority 2)
5. InspectionWorkflow integration
6. PermitWorkflow integration
7. CostManagementHub integration
8. MaterialPlanningView integration

### Medium-Term (Priority 3)
9. WorkLibrary integration
10. AssetHealthDashboard integration
11. AdvancedSchedulingBoard integration
12. QualityAnalytics integration

### Future Enhancements
- **WebSocket Integration:** Real-time updates for work order status changes
- **Retry Logic:** Automatic retry for failed requests
- **Request Caching:** Cache frequently accessed data (React Query)
- **Batch Operations:** Combine multiple API calls
- **Offline Support:** Queue operations when offline

---

## Summary

**Service Layer Created:** ✅ `maintenance.service.ts` (~850 LOC)
**Components Integrated:** 1/11 (ServiceRequestPortal)  
**Mock Data Removed:** ~70 lines  
**Live API Methods:** 40+ methods exposed  
**Build Status:** ✅ SUCCESS (client)

**Integration Pattern:** Import service → Replace mock data → Add error handling → Remove ~50-70 lines per component

**Next Action:** Integrate PM Scheduler and Meter Reading components following the ServiceRequestPortal pattern.
