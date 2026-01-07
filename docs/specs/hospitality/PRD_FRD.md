# HOSPITALITY INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" Hotels, Resorts, Events

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
A complete Property Management System (PMS) overlay that integrates front-desk operations, housekeeping, and F&B services with dynamic pricing and IoT room control.

### 1.2 Scope
*   **Segments:** Hotels, Resorts, Serviced Apartments, Event Venues.
*   **Key Modules:**
    *   **Reservations:** Direct Booking, OTA Integration (Expedia/Booking.com via Channel Manager).
    *   **Front Desk:** Check-in/out, Night Audit, Guest Profiles (CRM).
    *   **Housekeeping:** Room Status, Cleaning Schedules, Maintenance.
    *   **POS:** Restaurant/Spa billing to room.
    *   **Revenue Management:** RevPAR tracking, Dynamic Pricing.
    *   **IoT:** Smart Key, Room Temp/Light control.

### 1.3 User Personas
*   **Front Desk Agent:** Manages guest arrivals/departures.
*   **Housekeeping Supervisor:** Assigns cleaning tasks.
*   **Revenue Manager:** Optimizes rates.
*   **Guest:** Mobile check-in, room controls.

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Reservation
*   **Status Flow:** `INQUIRY` -> `CONFIRMED` -> `CHECKED_IN` -> `CHECKED_OUT` -> `CANCELLED`.
*   **Inventory:** Must deduct from Available Room Count for the specific Room Type & Date Range.

#### 2.1.2 Guest Profile
*   **Loyalty:** Points accrual, Tier status (Gold/Platinum).
*   **Preferences:** "High floor", "Extra pillows" (Used by AI for room assignment).

#### 2.1.3 Room & Rate
*   **Room:** Static attributes (Type, View, Floor). Dynamic status (Clean/Dirty, Occupied/Vacant).
*   **Rate Plan:** Base Rate + Modifiers (Seasonality, Events).

### 2.2 Workflows

#### 2.2.1 Guest Journey
1.  **Book:** Channel Manager pushes booking -> PMS creates Reservation.
2.  **Pre-Arrival:** AI assigns specific room based on preferences.
3.  **Check-In:** ID Scan -> Payment Auth -> Key Card issued.
4.  **Stay:** POS charges posted to Folio.
5.  **Check-Out:** Bill settlement -> Invoice -> Room marked Dirty.

#### 2.2.2 AI Action: Dynamic Pricing
*   **Trigger:** Daily batch or Threshold breach (Occupancy > 80%).
*   **Input:** Competitor rates (API), Local Events, Current Pace.
*   **Output:** Rate adjustment Recommendation (+/- %).

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `DYNAMIC_PRICING_ADJUSTMENT`
*   **Description:** Update nightly rates for room types based on demand.
*   **Action:** `HOSPITALITY.RATE.UPDATE`
*   **Safety:** Requires Revenue Manager approval if deviation > 10%.

### 3.2 `PREDICT_GUEST_PREFERENCES`
*   **Description:** Suggest room amenities or upsells (Spa, Dinner) based on history.
*   **Action:** `HOSPITALITY.CRM.CREATE_OFFER`
*   **deterministic:** Selection from pre-defined catalog.

### 3.3 `SCHEDULE_HOUSEKEEPING`
*   **Description:** Optimize cleaning route based on check-out times and VIP arrivals.
*   **Action:** `HOSPITALITY.HOUSEKEEPING.ASSIGN_TASKS`

---

## 4. REPORTING & ANALYTICS
*   **RevPAR (Revenue Per Available Room):** ADR * Occupancy.
*   **ADR (Average Daily Rate):** Total Room Revenue / Rooms Sold.
*   **Housekeeping Efficiency:** Minutes per room cleaned.
*   **Guest Satisfaction (CSAT):** Post-stay survey aggregation.
