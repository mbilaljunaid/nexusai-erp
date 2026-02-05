
import { lazy } from "react";
import { Route, Switch } from "wouter";

// Healthcare
const PatientManagement = lazy(() => import("@/pages/PatientManagement"));
const AppointmentScheduling = lazy(() => import("@/pages/AppointmentScheduling"));
const ClinicalDocumentation = lazy(() => import("@/pages/ClinicalDocumentation"));
const LaboratoryManagement = lazy(() => import("@/pages/LaboratoryManagement"));
const PharmacyManagement = lazy(() => import("@/pages/PharmacyManagement"));
const MedicalBilling = lazy(() => import("@/pages/MedicalBilling"));
const InpatientManagement = lazy(() => import("@/pages/InpatientManagement"));
const HealthcareBIDashboard = lazy(() => import("@/pages/HealthcareBIDashboard"));
const HealthcareCompliance = lazy(() => import("@/pages/HealthcareCompliance"));

// Telecom
const NetworkInventoryOSS = lazy(() => import("@/pages/NetworkInventoryOSS"));
const TelecomBillingRevenue = lazy(() => import("@/pages/TelecomBillingRevenue"));
const FaultPerformanceMonitoring = lazy(() => import("@/pages/FaultPerformanceMonitoring"));
const TelecomFinanceCompliance = lazy(() => import("@/pages/TelecomFinanceCompliance"));
const TelecomBIDashboard = lazy(() => import("@/pages/TelecomBIDashboard"));
const CustomerDeviceManagement = lazy(() => import("@/pages/CustomerDeviceManagement"));
const SLAServiceTierManagement = lazy(() => import("@/pages/SLAServiceTierManagement"));
const TelecomCustomerSupport = lazy(() => import("@/pages/TelecomCustomerSupport"));

// Hospitality
const ReservationBooking = lazy(() => import("@/pages/ReservationBooking"));
const FrontDeskOperations = lazy(() => import("@/pages/FrontDeskOperations"));
const HousekeepingManagement = lazy(() => import("@/pages/HousekeepingManagement"));
const FoodBeveragePOS = lazy(() => import("@/pages/FoodBeveragePOS"));
const EventBanquetingManagement = lazy(() => import("@/pages/EventBanquetingManagement"));
const GuestCRMManagement = lazy(() => import("@/pages/GuestCRMManagement"));
const RevenueManagement = lazy(() => import("@/pages/RevenueManagement")); // Duplicate name check?
const HospitalityInventory = lazy(() => import("@/pages/HospitalityInventory"));
const HospitalityHRRostering = lazy(() => import("@/pages/HospitalityHRRostering"));
const HospitalityBIDashboard = lazy(() => import("@/pages/HospitalityBIDashboard"));

// Retail & Commerce
const PointOfSale = lazy(() => import("@/pages/PointOfSale"));
const StoreOperationsDashboard = lazy(() => import("@/pages/StoreOperationsDashboard"));
const OmniChannelOrders = lazy(() => import("@/pages/OmniChannelOrders"));
const MerchandisePlanning = lazy(() => import("@/pages/MerchandisePlanning"));
const PricingPromoEngine = lazy(() => import("@/pages/PricingPromoEngine"));
const Ecommerce = lazy(() => import("@/pages/Ecommerce"));

// Logistics Orphans (Detailed)
const LogisticsComplianceSafety = lazy(() => import("@/pages/LogisticsComplianceSafety"));
const ColdChainLogistics = lazy(() => import("@/pages/ColdChainLogistics"));
const LogisticsShipping = lazy(() => import("@/pages/LogisticsShipping"));
const LogisticsAnalytics = lazy(() => import("@/pages/LogisticsAnalytics"));
const LogisticsOptimization = lazy(() => import("@/pages/LogisticsOptimization"));
const SupplyChainLogistics = lazy(() => import("@/pages/SupplyChainLogistics"));
// const OrdersLogistics = lazy(() => import("@/pages/OrdersLogistics")); // Overlap with Order Mgmt?
const WarehouseInventoryLogistics = lazy(() => import("@/pages/WarehouseInventoryLogistics"));
const BillingLogistics = lazy(() => import("@/pages/BillingLogistics"));

export default function IndustryRoutes() {
    return (
        <Switch>
            {/* Healthcare */}
            <Route path="/industry/healthcare/patients" component={PatientManagement} />
            <Route path="/industry/healthcare/appointments" component={AppointmentScheduling} />
            <Route path="/industry/healthcare/clinical" component={ClinicalDocumentation} />
            <Route path="/industry/healthcare/lab" component={LaboratoryManagement} />
            <Route path="/industry/healthcare/pharmacy" component={PharmacyManagement} />
            <Route path="/industry/healthcare/billing" component={MedicalBilling} />
            <Route path="/industry/healthcare/inpatient" component={InpatientManagement} />
            <Route path="/industry/healthcare/bi" component={HealthcareBIDashboard} />
            <Route path="/industry/healthcare/compliance" component={HealthcareCompliance} />

            {/* Telecom */}
            <Route path="/industry/telecom/network-oss" component={NetworkInventoryOSS} />
            <Route path="/industry/telecom/billing" component={TelecomBillingRevenue} />
            <Route path="/industry/telecom/monitoring" component={FaultPerformanceMonitoring} />
            <Route path="/industry/telecom/compliance" component={TelecomFinanceCompliance} />
            <Route path="/industry/telecom/bi" component={TelecomBIDashboard} />
            <Route path="/industry/telecom/devices" component={CustomerDeviceManagement} />
            <Route path="/industry/telecom/sla" component={SLAServiceTierManagement} />
            <Route path="/industry/telecom/support" component={TelecomCustomerSupport} />

            {/* Hospitality */}
            <Route path="/industry/hospitality/reservations" component={ReservationBooking} />
            <Route path="/industry/hospitality/front-desk" component={FrontDeskOperations} />
            <Route path="/industry/hospitality/housekeeping" component={HousekeepingManagement} />
            <Route path="/industry/hospitality/pos" component={FoodBeveragePOS} />
            <Route path="/industry/hospitality/events" component={EventBanquetingManagement} />
            <Route path="/industry/hospitality/guest-crm" component={GuestCRMManagement} />
            <Route path="/industry/hospitality/revenue" component={RevenueManagement} />
            <Route path="/industry/hospitality/inventory" component={HospitalityInventory} />
            <Route path="/industry/hospitality/rostering" component={HospitalityHRRostering} />
            <Route path="/industry/hospitality/bi" component={HospitalityBIDashboard} />

            {/* Retail */}
            <Route path="/industry/retail/pos" component={PointOfSale} />
            <Route path="/industry/retail/store-ops" component={StoreOperationsDashboard} />
            <Route path="/industry/retail/omnichannel" component={OmniChannelOrders} />
            <Route path="/industry/retail/merchandise" component={MerchandisePlanning} />
            <Route path="/industry/retail/pricing" component={PricingPromoEngine} />
            <Route path="/industry/retail/ecommerce" component={Ecommerce} />

            {/* Logistics Specifics */}
            <Route path="/industry/logistics/compliance" component={LogisticsComplianceSafety} />
            <Route path="/industry/logistics/cold-chain" component={ColdChainLogistics} />
            <Route path="/industry/logistics/shipping" component={LogisticsShipping} />
            <Route path="/industry/logistics/analytics" component={LogisticsAnalytics} />
            <Route path="/industry/logistics/optimization" component={LogisticsOptimization} />
            <Route path="/industry/logistics/supply-chain" component={SupplyChainLogistics} />
            <Route path="/industry/logistics/warehouse" component={WarehouseInventoryLogistics} />
            <Route path="/industry/logistics/billing" component={BillingLogistics} />
        </Switch>
    );
}
