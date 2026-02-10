
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import NotFound from "@/pages/not-found";

const LandingPage = lazyWithRetry(() => import("@/pages/LandingPage"));
const AboutPage = lazyWithRetry(() => import("@/pages/AboutPage"));
const BlogPage = lazyWithRetry(() => import("@/pages/BlogPage"));
const BlogPostPage = lazyWithRetry(() => import("@/pages/BlogPostPage"));
const LoginPage = lazyWithRetry(() => import("@/pages/LoginPage"));
const SignupPage = lazyWithRetry(() => import("@/pages/SignupPage"));
const ForgotPasswordPage = lazyWithRetry(() => import("@/pages/ForgotPasswordPage"));
const DemoManagement = lazyWithRetry(() => import("@/pages/DemoManagement"));
const PortalLogin = lazyWithRetry(() => import("@/pages/portal/PortalLogin"));
const UseCases = lazyWithRetry(() => import("@/pages/UseCases"));
const IndustriesPage = lazyWithRetry(() => import("@/pages/IndustriesPage"));
const IndustryDetail = lazyWithRetry(() => import("@/pages/IndustryDetail"));
const ModuleDetail = lazyWithRetry(() => import("@/pages/ModuleDetail"));
const FeaturesPage = lazyWithRetry(() => import("@/pages/FeaturesPage"));
const FeatureDetailPage = lazyWithRetry(() => import("@/pages/FeatureDetailPage"));
const OpenSourcePage = lazyWithRetry(() => import("@/pages/OpenSourcePage"));
const ContributionPage = lazyWithRetry(() => import("@/pages/ContributionPage"));
const LicensePage = lazyWithRetry(() => import("@/pages/LicensePage"));
const ContributingPage = lazyWithRetry(() => import("@/pages/ContributingPage"));
const SecurityPolicyPage = lazyWithRetry(() => import("@/pages/SecurityPolicyPage"));
const ContactPage = lazyWithRetry(() => import("@/pages/ContactPage"));
const PrivacyPage = lazyWithRetry(() => import("@/pages/PrivacyPage"));
const TermsPage = lazyWithRetry(() => import("@/pages/TermsPage"));
const LegalPage = lazyWithRetry(() => import("@/pages/LegalPage"));
const PricingPage = lazyWithRetry(() => import("@/pages/PricingPage"));
const PartnersPage = lazyWithRetry(() => import("@/pages/PartnersPage"));
const CareersPage = lazyWithRetry(() => import("@/pages/public/CareersPage"));
const ModulesPage = lazyWithRetry(() => import("@/pages/ModulesPage"));
const ExternalSupplierRegistration = lazyWithRetry(() => import("@/pages/ExternalSupplierRegistration"));

// Public Process Pages
const PublicProcessHub = lazyWithRetry(() => import("@/pages/public/processes/PublicProcessHub"));
const PublicProcureToPayProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicProcureToPayProcess"));
const PublicOrderToCashProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicOrderToCashProcess"));
const PublicHireToRetireProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicHireToRetireProcess"));
const PublicMonthEndProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicMonthEndProcess"));
const PublicComplianceProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicComplianceProcess"));
const PublicInventoryProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicInventoryProcess"));
const PublicFixedAssetProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicFixedAssetProcess"));
const PublicProductionProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicProductionProcess"));
const PublicMRPProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicMRPProcess"));
const PublicQualityProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicQualityProcess"));
const PublicContractProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicContractProcess"));
const PublicBudgetProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicBudgetProcess"));
const PublicDemandProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicDemandProcess"));
const PublicCapacityProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicCapacityProcess"));
const PublicWarehouseProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicWarehouseProcess"));
const PublicCustomerReturnsProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicCustomerReturnsProcess"));
const PublicVendorPerformanceProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicVendorPerformanceProcess"));
const PublicSubscriptionBillingProcess = lazyWithRetry(() => import("@/pages/public/processes/pages/PublicSubscriptionBillingProcess"));

// Documentation
const ProcessFlowsPage = lazyWithRetry(() => import("@/pages/public/documentation/ProcessFlowsPage"));
const TrainingGuidesPage = lazyWithRetry(() => import("@/pages/public/documentation/TrainingGuidesPage"));
const TrainingLessonPage = lazyWithRetry(() => import("@/pages/public/documentation/TrainingLessonPage"));
const TrainingGuideCRM = lazyWithRetry(() => import("@/pages/public/documentation/TrainingGuideCRM"));
const TrainingGuideFinance = lazyWithRetry(() => import("@/pages/public/documentation/TrainingGuideFinance"));
const TrainingGuideInventory = lazyWithRetry(() => import("@/pages/public/documentation/TrainingGuideInventory"));
const TrainingGuideManufacturing = lazyWithRetry(() => import("@/pages/public/documentation/TrainingGuideManufacturing"));
const TrainingGuideAnalytics = lazyWithRetry(() => import("@/pages/public/documentation/TrainingGuideAnalytics"));
const TrainingGuideHR = lazyWithRetry(() => import("@/pages/public/documentation/TrainingGuideHR"));
const TechnicalDocumentationPage = lazyWithRetry(() => import("@/pages/public/documentation/TechnicalDocumentationPage"));
const TechnicalAPIReference = lazyWithRetry(() => import("@/pages/public/documentation/TechnicalAPIReference"));
const ImplementationGuidelinesPage = lazyWithRetry(() => import("@/pages/public/documentation/ImplementationGuidelinesPage"));
const ImplementationSystemSetup = lazyWithRetry(() => import("@/pages/public/documentation/ImplementationSystemSetup"));

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
