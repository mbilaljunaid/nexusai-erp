
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Healthcare
const PatientManagement = lazyWithRetry(() => import("@/pages/PatientManagement"));
const AppointmentScheduling = lazyWithRetry(() => import("@/pages/AppointmentScheduling"));
const ClinicalDocumentation = lazyWithRetry(() => import("@/pages/ClinicalDocumentation"));
const LaboratoryManagement = lazyWithRetry(() => import("@/pages/LaboratoryManagement"));
const PharmacyManagement = lazyWithRetry(() => import("@/pages/PharmacyManagement"));
const MedicalBilling = lazyWithRetry(() => import("@/pages/MedicalBilling"));
const InpatientManagement = lazyWithRetry(() => import("@/pages/InpatientManagement"));
const HealthcareBIDashboard = lazyWithRetry(() => import("@/pages/HealthcareBIDashboard"));
const HealthcareCompliance = lazyWithRetry(() => import("@/pages/HealthcareCompliance"));

// Telecom
const NetworkInventoryOSS = lazyWithRetry(() => import("@/pages/NetworkInventoryOSS"));
const TelecomBillingRevenue = lazyWithRetry(() => import("@/pages/TelecomBillingRevenue"));
const FaultPerformanceMonitoring = lazyWithRetry(() => import("@/pages/FaultPerformanceMonitoring"));
const TelecomFinanceCompliance = lazyWithRetry(() => import("@/pages/TelecomFinanceCompliance"));
const TelecomBIDashboard = lazyWithRetry(() => import("@/pages/TelecomBIDashboard"));
const CustomerDeviceManagement = lazyWithRetry(() => import("@/pages/CustomerDeviceManagement"));
const SLAServiceTierManagement = lazyWithRetry(() => import("@/pages/SLAServiceTierManagement"));
const TelecomCustomerSupport = lazyWithRetry(() => import("@/pages/TelecomCustomerSupport"));

// Hospitality
const ReservationBooking = lazyWithRetry(() => import("@/pages/ReservationBooking"));
const FrontDeskOperations = lazyWithRetry(() => import("@/pages/FrontDeskOperations"));
const HousekeepingManagement = lazyWithRetry(() => import("@/pages/HousekeepingManagement"));
const FoodBeveragePOS = lazyWithRetry(() => import("@/pages/FoodBeveragePOS"));
const EventBanquetingManagement = lazyWithRetry(() => import("@/pages/EventBanquetingManagement"));
const GuestCRMManagement = lazyWithRetry(() => import("@/pages/GuestCRMManagement"));
const RevenueManagement = lazyWithRetry(() => import("@/pages/RevenueManagement"));
const HospitalityInventory = lazyWithRetry(() => import("@/pages/HospitalityInventory"));
const HospitalityHRRostering = lazyWithRetry(() => import("@/pages/HospitalityHRRostering"));
const HospitalityBIDashboard = lazyWithRetry(() => import("@/pages/HospitalityBIDashboard"));

// Retail & Commerce
const PointOfSale = lazyWithRetry(() => import("@/pages/PointOfSale"));
const StoreOperationsDashboard = lazyWithRetry(() => import("@/pages/StoreOperationsDashboard"));
const OmniChannelOrders = lazyWithRetry(() => import("@/pages/OmniChannelOrders"));
const MerchandisePlanning = lazyWithRetry(() => import("@/pages/MerchandisePlanning"));
const PricingPromoEngine = lazyWithRetry(() => import("@/pages/PricingPromoEngine"));
const Ecommerce = lazyWithRetry(() => import("@/pages/Ecommerce"));

// Logistics Orphans (Detailed)
const LogisticsComplianceSafety = lazyWithRetry(() => import("@/pages/LogisticsComplianceSafety"));
const ColdChainLogistics = lazyWithRetry(() => import("@/pages/ColdChainLogistics"));
const LogisticsShipping = lazyWithRetry(() => import("@/pages/LogisticsShipping"));
const LogisticsAnalytics = lazyWithRetry(() => import("@/pages/LogisticsAnalytics"));
const LogisticsOptimization = lazyWithRetry(() => import("@/pages/LogisticsOptimization"));
const SupplyChainLogistics = lazyWithRetry(() => import("@/pages/SupplyChainLogistics"));
const WarehouseInventoryLogistics = lazyWithRetry(() => import("@/pages/WarehouseInventoryLogistics"));
const BillingLogistics = lazyWithRetry(() => import("@/pages/BillingLogistics"));

// Automotive
const AutomotiveProduction = lazyWithRetry(() => import("@/pages/AutomotiveProduction"));
const AutomotiveSalesCRM = lazyWithRetry(() => import("@/pages/AutomotiveSalesCRM"));
const AutomotiveSupplyChain = lazyWithRetry(() => import("@/pages/AutomotiveSupplyChain"));
const AutomotiveQualityAnalytics = lazyWithRetry(() => import("@/pages/AutomotiveQualityAnalytics"));
const AutomotiveBIDashboard = lazyWithRetry(() => import("@/pages/AutomotiveBIDashboard"));

// Banking
const BankingCoreBanking = lazyWithRetry(() => import("@/pages/BankingCoreBanking"));
const BankingCustomerAccounts = lazyWithRetry(() => import("@/pages/BankingCustomerAccounts"));
const BankingLoansCredit = lazyWithRetry(() => import("@/pages/BankingLoansCredit"));
const BankingPayments = lazyWithRetry(() => import("@/pages/BankingPayments"));
const BankingAIFraudDetection = lazyWithRetry(() => import("@/pages/BankingAIFraudDetection"));
const BankingBIDashboards = lazyWithRetry(() => import("@/pages/BankingBIDashboards"));

// Insurance
const InsurancePolicyManagement = lazyWithRetry(() => import("@/pages/InsurancePolicyManagement"));
const InsuranceClaimsProcessing = lazyWithRetry(() => import("@/pages/InsuranceClaimsProcessing"));
const InsuranceUnderwriting = lazyWithRetry(() => import("@/pages/InsuranceUnderwriting"));
const InsuranceBillingPremiums = lazyWithRetry(() => import("@/pages/InsuranceBillingPremiums"));
const InsuranceBIDashboards = lazyWithRetry(() => import("@/pages/InsuranceBIDashboards"));

// Government
const GovernmentCitizenServices = lazyWithRetry(() => import("@/pages/GovernmentCitizenServices"));
const GovernmentProcurement = lazyWithRetry(() => import("@/pages/GovernmentProcurement"));
const GovernmentGrantsFunding = lazyWithRetry(() => import("@/pages/GovernmentGrantsFunding"));
const GovernmentCompliance = lazyWithRetry(() => import("@/pages/GovernmentCompliance"));
const GovernmentHR = lazyWithRetry(() => import("@/pages/GovernmentHR"));
const GovernmentBIDashboards = lazyWithRetry(() => import("@/pages/GovernmentBIDashboards"));

// Education
const EdDashboard = lazyWithRetry(() => import("@/pages/EdDashboard"));
const AdmissionsEnrollment = lazyWithRetry(() => import("@/pages/AdmissionsEnrollment"));
const EdFaculty = lazyWithRetry(() => import("@/pages/EdFaculty"));
const EducationBilling = lazyWithRetry(() => import("@/pages/EducationBilling"));
const EducationAnalytics = lazyWithRetry(() => import("@/pages/EducationAnalytics"));

// Energy
const GridOperations = lazyWithRetry(() => import("@/pages/GridOperations"));
const EnergyTrading = lazyWithRetry(() => import("@/pages/EnergyTrading"));
const EnergyAnalytics = lazyWithRetry(() => import("@/pages/EnergyAnalytics"));

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
