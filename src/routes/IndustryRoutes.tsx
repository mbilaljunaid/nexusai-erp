
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

// Automotive
const AutomotiveProduction = lazy(() => import("@/pages/AutomotiveProduction"));
const AutomotiveSalesCRM = lazy(() => import("@/pages/AutomotiveSalesCRM"));
const AutomotiveSupplyChain = lazy(() => import("@/pages/AutomotiveSupplyChain"));
const AutomotiveQualityAnalytics = lazy(() => import("@/pages/AutomotiveQualityAnalytics"));
const AutomotiveBIDashboard = lazy(() => import("@/pages/AutomotiveBIDashboard"));

// Banking
const BankingCoreBanking = lazy(() => import("@/pages/BankingCoreBanking"));
const BankingCustomerAccounts = lazy(() => import("@/pages/BankingCustomerAccounts"));
const BankingLoansCredit = lazy(() => import("@/pages/BankingLoansCredit"));
const BankingPayments = lazy(() => import("@/pages/BankingPayments"));
const BankingAIFraudDetection = lazy(() => import("@/pages/BankingAIFraudDetection"));
const BankingBIDashboards = lazy(() => import("@/pages/BankingBIDashboards"));

// Insurance
const InsurancePolicyManagement = lazy(() => import("@/pages/InsurancePolicyManagement"));
const InsuranceClaimsProcessing = lazy(() => import("@/pages/InsuranceClaimsProcessing"));
const InsuranceUnderwriting = lazy(() => import("@/pages/InsuranceUnderwriting"));
const InsuranceBillingPremiums = lazy(() => import("@/pages/InsuranceBillingPremiums"));
const InsuranceBIDashboards = lazy(() => import("@/pages/InsuranceBIDashboards"));

// Government
const GovernmentCitizenServices = lazy(() => import("@/pages/GovernmentCitizenServices"));
const GovernmentProcurement = lazy(() => import("@/pages/GovernmentProcurement"));
const GovernmentGrantsFunding = lazy(() => import("@/pages/GovernmentGrantsFunding"));
const GovernmentCompliance = lazy(() => import("@/pages/GovernmentCompliance"));
const GovernmentHR = lazy(() => import("@/pages/GovernmentHR"));
const GovernmentBIDashboards = lazy(() => import("@/pages/GovernmentBIDashboards"));

// Education
const EdDashboard = lazy(() => import("@/pages/EdDashboard"));
const AdmissionsEnrollment = lazy(() => import("@/pages/AdmissionsEnrollment"));
const EdFaculty = lazy(() => import("@/pages/EdFaculty"));
const EducationBilling = lazy(() => import("@/pages/EducationBilling"));
const EducationAnalytics = lazy(() => import("@/pages/EducationAnalytics"));

// Energy
const GridOperations = lazy(() => import("@/pages/GridOperations"));
const EnergyTrading = lazy(() => import("@/pages/EnergyTrading"));
const EnergyAnalytics = lazy(() => import("@/pages/EnergyAnalytics"));

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

            {/* Automotive */}
            <Route path="/industry/automotive/production" component={AutomotiveProduction} />
            <Route path="/industry/automotive/sales" component={AutomotiveSalesCRM} />
            <Route path="/industry/automotive/supply-chain" component={AutomotiveSupplyChain} />
            <Route path="/industry/automotive/quality" component={AutomotiveQualityAnalytics} />
            <Route path="/industry/automotive/bi" component={AutomotiveBIDashboard} />

            {/* Banking */}
            <Route path="/industry/banking/core" component={BankingCoreBanking} />
            <Route path="/industry/banking/accounts" component={BankingCustomerAccounts} />
            <Route path="/industry/banking/loans" component={BankingLoansCredit} />
            <Route path="/industry/banking/payments" component={BankingPayments} />
            <Route path="/industry/banking/fraud" component={BankingAIFraudDetection} />
            <Route path="/industry/banking/bi" component={BankingBIDashboards} />

            {/* Insurance */}
            <Route path="/industry/insurance/policies" component={InsurancePolicyManagement} />
            <Route path="/industry/insurance/claims" component={InsuranceClaimsProcessing} />
            <Route path="/industry/insurance/underwriting" component={InsuranceUnderwriting} />
            <Route path="/industry/insurance/billing" component={InsuranceBillingPremiums} />
            <Route path="/industry/insurance/bi" component={InsuranceBIDashboards} />

            {/* Government */}
            <Route path="/industry/government/citizen" component={GovernmentCitizenServices} />
            <Route path="/industry/government/procurement" component={GovernmentProcurement} />
            <Route path="/industry/government/grants" component={GovernmentGrantsFunding} />
            <Route path="/industry/government/compliance" component={GovernmentCompliance} />
            <Route path="/industry/government/hr" component={GovernmentHR} />
            <Route path="/industry/government/bi" component={GovernmentBIDashboards} />

            {/* Education */}
            <Route path="/industry/education/dashboard" component={EdDashboard} />
            <Route path="/industry/education/admissions" component={AdmissionsEnrollment} />
            <Route path="/industry/education/faculty" component={EdFaculty} />
            <Route path="/industry/education/billing" component={EducationBilling} />
            <Route path="/industry/education/analytics" component={EducationAnalytics} />

            {/* Energy */}
            <Route path="/industry/energy/grid" component={GridOperations} />
            <Route path="/industry/energy/trading" component={EnergyTrading} />
            <Route path="/industry/energy/analytics" component={EnergyAnalytics} />
        </Switch>
    );
}
