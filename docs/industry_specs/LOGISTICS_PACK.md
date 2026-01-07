# Industry Pack: LOGISTICS (Phase 1)

**Version:** 1.0.0
**Status:** READY FOR DEV
**Domain:** `apps/logistics`

---

## 1. Domain Model (Database Schema)

### Entity Relationship Diagram (ERD)
*   **Fleet** (Trucks/Vehicles) 1--* **Driver**
*   **Shipment** 1--* **Route**
*   **Route** 1--* **Stop**
*   **Shipment** 1--* **ProofOfDelivery**

### Database Schema (PostgreSQL)

```sql
CREATE SCHEMA IF NOT EXISTS logistics_fleet;

-- 1. Vehicles
CREATE TABLE logistics_fleet.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  vin VARCHAR(50) UNIQUE NOT NULL,
  plate_number VARCHAR(20) NOT NULL,
  type VARCHAR(50) DEFAULT 'TRUCK_5TON',
  status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, IN_TRANSIT, MAINTENANCE
  gps_device_id VARCHAR(100)
);

-- 2. Shipments
CREATE TABLE logistics_fleet.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  assigned_vehicle_id UUID REFERENCES logistics_fleet.vehicles(id),
  estimated_delivery TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'PENDING' -- PENDING, DISPATCHED, DELIVERED, RETURNED
);
```

---

## 2. API Services & Controllers (Backend)

**Service:** `LogisticsService`
**Path:** `apps/logistics/src/modules/fleet/fleet.service.ts`

```typescript
// sample AI optimization method
async optimizeRoute(tenantId: string, shipmentIds: string[]): Promise<RoutePlan> {
  // 1. Fetch Geolocations for all shipments
  // 2. Run Traveling Salesman Problem (TSP) algorithm or call Google Routes API
  // 3. Assign optimal vehicle based on capacity
  // 4. Return planned route
}
```

---

## 3. AI Action Schemas (Agentic Capabilities)

### Action 1: `dispatch_fleet`
**Intent:** "Dispatch available trucks for today's pending shipments."

```json
{
  "domain": "LOGISTICS",
  "module": "fleet_management",
  "action": "dispatch_fleet",
  "parameters": {
    "zone": "North-East",
    "priority_only": true
  },
  "reasoning": "Found 15 high-priority shipments in North-East zone and 3 available trucks."
}
```

### Action 2: `predict_maintenance`
**Intent:** "Which trucks need maintenance?"

```json
{
  "domain": "LOGISTICS",
  "module": "maintenance",
  "action": "analyze_vehicle_health",
  "parameters": {
    "vehicle_ids": ["ALL"]
  },
  "output_prediction": {
    "vehicle_id": "V-99",
    "risk": "HIGH",
    "reason": "Engine temperature spikes > 110C observed in last 3 trips."
  }
}
```

---

## 4. Frontend Architecture (React)

**Folder Path:** `apps/web/src/features/logistics`

### Component Map
1.  **Live Map:** `FleetMap.tsx`
    *   *Lib:* `react-leaflet` or `mapbox-gl`.
    *   *Feature:* Real-time vehicle pins moving on map.
2.  **Dispatch Board:** `DispatchBoard.tsx`
    *   *Feature:* Drag-and-drop shipments onto vehicles.
3.  **Driver App (Mobile View):** `Drivermanifest.tsx`
    *   *Feature:* Signature pad for Proof of Delivery (POD).

---

## 5. Seed Data (Tenant 1 Demo)

```json
{
  "vehicles": [
    { "plate": "DXB-991", "type": "VAN", "status": "AVAILABLE" },
    { "plate": "DXB-552", "type": "TRUCK", "status": "IN_TRANSIT" }
  ],
  "shipments": [
    { "tracking": "TRK-10001", "dest": "123 Main St", "status": "PENDING" },
    { "tracking": "TRK-10002", "dest": "456 Side Ave", "status": "DISPATCHED" }
  ]
}
```

---

## 6. RBAC & Governance

| Role | Permissions |
| :--- | :--- |
| **Fleet Manager** | `fleet:manage`, `shipment:dispatch`, `driver:assign` |
| **Dispatcher** | `shipment:view`, `shipment:update_status` |
| **Driver** | `route:view`, `pod:upload` |

**Audit Log Rule:** All "Route Deviations" > 5km must be flagged and logged.
