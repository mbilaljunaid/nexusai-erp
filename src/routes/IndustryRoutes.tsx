
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Healthcare
const PatientManagement = lazyWithRetry(() => import("@/pages/industries/healthcare/PatientManagement"));
const AppointmentScheduling = lazyWithRetry(() => import("@/pages/industries/healthcare/AppointmentScheduling"));
const ClinicalDocumentation = lazyWithRetry(() => import("@/pages/industries/healthcare/ClinicalDocumentation"));
const LaboratoryManagement = lazyWithRetry(() => import("@/pages/industries/healthcare/LaboratoryManagement"));
const PharmacyManagement = lazyWithRetry(() => import("@/pages/industries/healthcare/PharmacyManagement"));
const MedicalBilling = lazyWithRetry(() => import("@/pages/industries/healthcare/MedicalBilling"));
const InpatientManagement = lazyWithRetry(() => import("@/pages/industries/healthcare/InpatientManagement"));
const HealthcareBIDashboard = lazyWithRetry(() => import("@/pages/industries/healthcare/HealthcareBIDashboard"));
const HealthcareCompliance = lazyWithRetry(() => import("@/pages/industries/healthcare/HealthcareCompliance"));

// Telecom
const NetworkInventoryOSS = lazyWithRetry(() => import("@/pages/industries/telecom/NetworkInventoryOSS"));
const TelecomBillingRevenue = lazyWithRetry(() => import("@/pages/industries/telecom/TelecomBillingRevenue"));
const FaultPerformanceMonitoring = lazyWithRetry(() => import("@/pages/industries/telecom/FaultPerformanceMonitoring"));
const TelecomFinanceCompliance = lazyWithRetry(() => import("@/pages/industries/telecom/TelecomFinanceCompliance"));
const TelecomBIDashboard = lazyWithRetry(() => import("@/pages/industries/telecom/TelecomBIDashboard"));
const CustomerDeviceManagement = lazyWithRetry(() => import("@/pages/industries/telecom/CustomerDeviceManagement"));
const SLAServiceTierManagement = lazyWithRetry(() => import("@/pages/industries/telecom/SLAServiceTierManagement"));
const TelecomCustomerSupport = lazyWithRetry(() => import("@/pages/industries/telecom/TelecomCustomerSupport"));

// Hospitality
const ReservationBooking = lazyWithRetry(() => import("@/pages/industries/hospitality/ReservationBooking"));
const FrontDeskOperations = lazyWithRetry(() => import("@/pages/industries/hospitality/FrontDeskOperations"));
const HousekeepingManagement = lazyWithRetry(() => import("@/pages/industries/hospitality/HousekeepingManagement"));
const FoodBeveragePOS = lazyWithRetry(() => import("@/pages/industries/hospitality/FoodBeveragePOS"));
const EventBanquetingManagement = lazyWithRetry(() => import("@/pages/industries/hospitality/EventBanquetingManagement"));
const GuestCRMManagement = lazyWithRetry(() => import("@/pages/industries/hospitality/GuestCRMManagement"));
const RevenueManagement = lazyWithRetry(() => import("@/pages/industries/hospitality/RevenueManagement"));
const HospitalityInventory = lazyWithRetry(() => import("@/pages/industries/hospitality/HospitalityInventory"));
const HospitalityHRRostering = lazyWithRetry(() => import("@/pages/industries/hospitality/HospitalityHRRostering"));
const HospitalityBIDashboard = lazyWithRetry(() => import("@/pages/industries/hospitality/HospitalityBIDashboard"));

// Retail & Commerce
const PointOfSale = lazyWithRetry(() => import("@/pages/industries/retail/PointOfSale"));
const StoreOperationsDashboard = lazyWithRetry(() => import("@/pages/industries/retail/StoreOperationsDashboard"));
const OmniChannelOrders = lazyWithRetry(() => import("@/pages/industries/retail/OmniChannelOrders"));
const MerchandisePlanning = lazyWithRetry(() => import("@/pages/industries/retail/MerchandisePlanning"));
const PricingPromoEngine = lazyWithRetry(() => import("@/pages/industries/retail/PricingPromoEngine"));
const Ecommerce = lazyWithRetry(() => import("@/pages/industries/retail/Ecommerce"));

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
const AutomotiveProduction = lazyWithRetry(() => import("@/pages/industries/automotive/AutomotiveProduction"));
const AutomotiveSalesCRM = lazyWithRetry(() => import("@/pages/industries/automotive/AutomotiveSalesCRM"));
const AutomotiveSupplyChain = lazyWithRetry(() => import("@/pages/industries/automotive/AutomotiveSupplyChain"));
const AutomotiveQualityAnalytics = lazyWithRetry(() => import("@/pages/industries/automotive/AutomotiveQualityAnalytics"));
const AutomotiveBIDashboard = lazyWithRetry(() => import("@/pages/industries/automotive/AutomotiveBIDashboard"));

// Banking
const BankingCoreBanking = lazyWithRetry(() => import("@/pages/industries/banking/BankingCoreBanking"));
const BankingCustomerAccounts = lazyWithRetry(() => import("@/pages/industries/banking/BankingCustomerAccounts"));
const BankingLoansCredit = lazyWithRetry(() => import("@/pages/industries/banking/BankingLoansCredit"));
const BankingPayments = lazyWithRetry(() => import("@/pages/industries/banking/BankingPayments"));
const BankingAIFraudDetection = lazyWithRetry(() => import("@/pages/industries/banking/BankingAIFraudDetection"));
const BankingBIDashboards = lazyWithRetry(() => import("@/pages/industries/banking/BankingBIDashboards"));

// Insurance
const InsurancePolicyManagement = lazyWithRetry(() => import("@/pages/industries/insurance/InsurancePolicyManagement"));
const InsuranceClaimsProcessing = lazyWithRetry(() => import("@/pages/industries/insurance/InsuranceClaimsProcessing"));
const InsuranceUnderwriting = lazyWithRetry(() => import("@/pages/industries/insurance/InsuranceUnderwriting"));
const InsuranceBillingPremiums = lazyWithRetry(() => import("@/pages/industries/insurance/InsuranceBillingPremiums"));
const InsuranceBIDashboards = lazyWithRetry(() => import("@/pages/industries/insurance/InsuranceBIDashboards"));

// Government
const GovernmentCitizenServices = lazyWithRetry(() => import("@/pages/industries/government/GovernmentCitizenServices"));
const GovernmentProcurement = lazyWithRetry(() => import("@/pages/industries/government/GovernmentProcurement"));
const GovernmentGrantsFunding = lazyWithRetry(() => import("@/pages/industries/government/GovernmentGrantsFunding"));
const GovernmentCompliance = lazyWithRetry(() => import("@/pages/industries/government/GovernmentCompliance"));
const GovernmentHR = lazyWithRetry(() => import("@/pages/industries/government/GovernmentHR"));
const GovernmentBIDashboards = lazyWithRetry(() => import("@/pages/industries/government/GovernmentBIDashboards"));

// Education
const EdDashboard = lazyWithRetry(() => import("@/pages/industries/education/EdDashboard"));
const AdmissionsEnrollment = lazyWithRetry(() => import("@/pages/industries/education/AdmissionsEnrollment"));
const EdFaculty = lazyWithRetry(() => import("@/pages/industries/education/EdFaculty"));
const EducationBilling = lazyWithRetry(() => import("@/pages/industries/education/EducationBilling"));
const EducationAnalytics = lazyWithRetry(() => import("@/pages/industries/education/EducationAnalytics"));

// Energy
const GridOperations = lazyWithRetry(() => import("@/pages/industries/energy/GridOperations"));
const EnergyTrading = lazyWithRetry(() => import("@/pages/industries/energy/EnergyTrading"));
const EnergyAnalytics = lazyWithRetry(() => import("@/pages/industries/energy/EnergyAnalytics"));

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
