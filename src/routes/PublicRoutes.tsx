
import { lazy } from "react";
import { Route, Switch } from "wouter";
import NotFound from "@/pages/not-found";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const DemoManagement = lazy(() => import("@/pages/DemoManagement"));
const PortalLogin = lazy(() => import("@/pages/portal/PortalLogin"));
const UseCases = lazy(() => import("@/pages/UseCases"));
const IndustriesPage = lazy(() => import("@/pages/IndustriesPage"));
const IndustryDetail = lazy(() => import("@/pages/IndustryDetail"));
const ModuleDetail = lazy(() => import("@/pages/ModuleDetail"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const FeatureDetailPage = lazy(() => import("@/pages/FeatureDetailPage"));
const OpenSourcePage = lazy(() => import("@/pages/OpenSourcePage"));
const ContributionPage = lazy(() => import("@/pages/ContributionPage"));
const LicensePage = lazy(() => import("@/pages/LicensePage"));
const ContributingPage = lazy(() => import("@/pages/ContributingPage"));
const SecurityPolicyPage = lazy(() => import("@/pages/SecurityPolicyPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PartnersPage = lazy(() => import("@/pages/PartnersPage"));
const CareersPage = lazy(() => import("@/pages/public/CareersPage"));
const ModulesPage = lazy(() => import("@/pages/ModulesPage"));
const ExternalSupplierRegistration = lazy(() => import("@/pages/ExternalSupplierRegistration"));

// Public Process Pages
const PublicProcessHub = lazy(() => import("@/pages/public/processes/PublicProcessHub"));
const PublicProcureToPayProcess = lazy(() => import("@/pages/public/processes/pages/PublicProcureToPayProcess"));
const PublicOrderToCashProcess = lazy(() => import("@/pages/public/processes/pages/PublicOrderToCashProcess"));
const PublicHireToRetireProcess = lazy(() => import("@/pages/public/processes/pages/PublicHireToRetireProcess"));
const PublicMonthEndProcess = lazy(() => import("@/pages/public/processes/pages/PublicMonthEndProcess"));
const PublicComplianceProcess = lazy(() => import("@/pages/public/processes/pages/PublicComplianceProcess"));
const PublicInventoryProcess = lazy(() => import("@/pages/public/processes/pages/PublicInventoryProcess"));
const PublicFixedAssetProcess = lazy(() => import("@/pages/public/processes/pages/PublicFixedAssetProcess"));
const PublicProductionProcess = lazy(() => import("@/pages/public/processes/pages/PublicProductionProcess"));
const PublicMRPProcess = lazy(() => import("@/pages/public/processes/pages/PublicMRPProcess"));
const PublicQualityProcess = lazy(() => import("@/pages/public/processes/pages/PublicQualityProcess"));
const PublicContractProcess = lazy(() => import("@/pages/public/processes/pages/PublicContractProcess"));
const PublicBudgetProcess = lazy(() => import("@/pages/public/processes/pages/PublicBudgetProcess"));
const PublicDemandProcess = lazy(() => import("@/pages/public/processes/pages/PublicDemandProcess"));
const PublicCapacityProcess = lazy(() => import("@/pages/public/processes/pages/PublicCapacityProcess"));
const PublicWarehouseProcess = lazy(() => import("@/pages/public/processes/pages/PublicWarehouseProcess"));
const PublicCustomerReturnsProcess = lazy(() => import("@/pages/public/processes/pages/PublicCustomerReturnsProcess"));
const PublicVendorPerformanceProcess = lazy(() => import("@/pages/public/processes/pages/PublicVendorPerformanceProcess"));
const PublicSubscriptionBillingProcess = lazy(() => import("@/pages/public/processes/pages/PublicSubscriptionBillingProcess"));

// Documentation
const ProcessFlowsPage = lazy(() => import("@/pages/public/documentation/ProcessFlowsPage"));
const TrainingGuidesPage = lazy(() => import("@/pages/public/documentation/TrainingGuidesPage"));
const TrainingLessonPage = lazy(() => import("@/pages/public/documentation/TrainingLessonPage"));
const TrainingGuideCRM = lazy(() => import("@/pages/public/documentation/TrainingGuideCRM"));
const TrainingGuideFinance = lazy(() => import("@/pages/public/documentation/TrainingGuideFinance"));
const TrainingGuideInventory = lazy(() => import("@/pages/public/documentation/TrainingGuideInventory"));
const TrainingGuideManufacturing = lazy(() => import("@/pages/public/documentation/TrainingGuideManufacturing"));
const TrainingGuideAnalytics = lazy(() => import("@/pages/public/documentation/TrainingGuideAnalytics"));
const TrainingGuideHR = lazy(() => import("@/pages/public/documentation/TrainingGuideHR"));
const TechnicalDocumentationPage = lazy(() => import("@/pages/public/documentation/TechnicalDocumentationPage"));
const TechnicalAPIReference = lazy(() => import("@/pages/public/documentation/TechnicalAPIReference"));
const ImplementationGuidelinesPage = lazy(() => import("@/pages/public/documentation/ImplementationGuidelinesPage"));
const ImplementationSystemSetup = lazy(() => import("@/pages/public/documentation/ImplementationSystemSetup"));

export default function PublicRoutes() {
    return (
        <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/use-cases" component={UseCases} />
            <Route path="/industries" component={IndustriesPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/blog" component={BlogPage} />
            <Route path="/blog/:id" component={BlogPostPage} />
            <Route path="/open-source" component={OpenSourcePage} />
            <Route path="/contribution" component={ContributionPage} />
            <Route path="/license" component={LicensePage} />
            <Route path="/docs/contributing" component={ContributingPage} />
            <Route path="/security" component={SecurityPolicyPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/legal" component={LegalPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/partners" component={PartnersPage} />
            <Route path="/careers" component={CareersPage} />
            <Route path="/modules" component={ModulesPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route path="/demo" component={DemoManagement} />
            <Route path="/portal/login" component={PortalLogin} />
            <Route path="/supplier/register" component={ExternalSupplierRegistration} />

            <Route path="/industry/:slug" component={IndustryDetail} />
            <Route path="/module/:slug" component={ModuleDetail} />
            <Route path="/features/:slug" component={FeatureDetailPage} />

            {/* Public Process Pages */}
            <Route path="/public/processes" component={PublicProcessHub} />
            <Route path="/public/processes/procure-to-pay" component={PublicProcureToPayProcess} />
            <Route path="/public/processes/order-to-cash" component={PublicOrderToCashProcess} />
            <Route path="/public/processes/hire-to-retire" component={PublicHireToRetireProcess} />
            <Route path="/public/processes/month-end-consolidation" component={PublicMonthEndProcess} />
            <Route path="/public/processes/compliance-risk" component={PublicComplianceProcess} />
            <Route path="/public/processes/inventory-management" component={PublicInventoryProcess} />
            <Route path="/public/processes/fixed-asset-lifecycle" component={PublicFixedAssetProcess} />
            <Route path="/public/processes/production-planning" component={PublicProductionProcess} />
            <Route path="/public/processes/mrp" component={PublicMRPProcess} />
            <Route path="/public/processes/quality-assurance" component={PublicQualityProcess} />
            <Route path="/public/processes/contract-management" component={PublicContractProcess} />
            <Route path="/public/processes/budget-planning" component={PublicBudgetProcess} />
            <Route path="/public/processes/demand-planning" component={PublicDemandProcess} />
            <Route path="/public/processes/capacity-planning" component={PublicCapacityProcess} />
            <Route path="/public/processes/warehouse-management" component={PublicWarehouseProcess} />
            <Route path="/public/processes/customer-returns" component={PublicCustomerReturnsProcess} />
            <Route path="/public/processes/vendor-performance" component={PublicVendorPerformanceProcess} />
            <Route path="/public/processes/subscription-billing" component={PublicSubscriptionBillingProcess} />

            {/* Documentation */}
            <Route path="/docs/process-flows" component={ProcessFlowsPage} />
            <Route path="/docs/training-guides" component={TrainingGuidesPage} />
            <Route path="/docs/training-guides/:category/:lesson" component={TrainingLessonPage} />
            <Route path="/docs/training-guides/crm" component={TrainingGuideCRM} />
            <Route path="/docs/training-guides/finance" component={TrainingGuideFinance} />
            <Route path="/docs/training-guides/inventory" component={TrainingGuideInventory} />
            <Route path="/docs/training-guides/manufacturing" component={TrainingGuideManufacturing} />
            <Route path="/docs/training-guides/analytics" component={TrainingGuideAnalytics} />
            <Route path="/docs/training-guides/hr" component={TrainingGuideHR} />
            <Route path="/docs/technical" component={TechnicalDocumentationPage} />
            <Route path="/docs/technical/api-reference" component={TechnicalAPIReference} />
            <Route path="/docs/implementation" component={ImplementationGuidelinesPage} />
            <Route path="/docs/implementation/system-setup" component={ImplementationSystemSetup} />

            <Route component={NotFound} />
        </Switch>
    );
}
