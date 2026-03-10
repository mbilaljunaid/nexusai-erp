
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
// import { lazy } from "react";

// Static load CRM components
import LeadsDetail from "@/pages/LeadsDetail";
import AccountsDetail from "@/pages/AccountsDetail";
import Account360 from "@/pages/crm/Account360";
import ContactList from "@/pages/crm/ContactList";
import TerritoryManager from "@/pages/crm/TerritoryManager";
import IncentiveDashboard from "@/pages/crm/IncentiveDashboard";
import CommissionPlanManager from "@/pages/crm/CommissionPlanManager";
import SalesForecasting from "@/pages/crm/SalesForecasting";
import CampaignDashboard from "@/pages/crm/CampaignDashboard";
import CampaignDetail from "@/pages/crm/CampaignDetail";
import CampaignFlowBuilder from "@/pages/crm/CampaignFlowBuilder";
import EmailTemplateBuilder from "@/pages/crm/EmailTemplateBuilder";
import CaseDashboard from "@/pages/crm/CaseDashboard";
import CaseDetail from "@/pages/crm/CaseDetail";
import OmnichannelRouting from "@/pages/crm/OmnichannelRouting";
import DispatchConsole from "@/pages/crm/DispatchConsole";
import KnowledgeBaseDashboard from "@/pages/crm/KnowledgeBaseDashboard";
import TerritoryRuleBuilder from "@/pages/crm/TerritoryRuleBuilder";
import ContractDashboard from "@/pages/crm/ContractDashboard";
import ContractDetail from "@/pages/crm/ContractDetail";
import PartnerDashboard from "@/pages/crm/PartnerDashboard";
import FieldServiceDashboard from "@/pages/crm/FieldServiceDashboard";
import WorkOrderDetail from "@/pages/crm/WorkOrderDetail";
import CrmQuotaManagement from "@/pages/crm/CrmQuotaManagement";
import CRM from "@/pages/CRM";

// Phase 1 CRM Components
import OpportunityPipeline from "@/pages/crm/OpportunityPipeline";
import QuoteBuilder from "@/pages/crm/QuoteBuilder";

// Phase 2 CRM Components
import LeadScoringDashboard from "@/pages/crm/LeadScoringDashboard";
import CompetitorIntelligence from "@/pages/crm/CompetitorIntelligence";

// Phase 3 CRM Components
import CrmAnalyticsDashboard from "@/pages/crm/CrmAnalyticsDashboard";
import DealDesk from "@/pages/crm/DealDesk";

// Phase 4 CRM Components
import ProductCatalogManager from "@/pages/crm/ProductCatalogManager";
import CpqConfigurator from "@/pages/crm/CpqConfigurator";
import ProductConfigurator from "@/pages/crm/cpq/ProductConfigurator";

// Phase 5 CRM Components
import EmailCampaignBuilder from "@/pages/crm/EmailCampaignBuilder";
import MarketingAutomation from "@/pages/crm/MarketingAutomation";

// Phase 6 CRM Components
import CaseManagement from "@/pages/crm/CaseManagement";
import KnowledgeBase from "@/pages/crm/KnowledgeBase";

// Phase 7 CRM Components
import PartnerManagement from "@/pages/crm/PartnerManagement";
import DealRegistration from "@/pages/crm/DealRegistration";

// Contract Lines
import ContractLinesWorkbench from "@/pages/crm/ContractLinesWorkbench";

// Phase 5 Gap Components
import SalesActivities from "@/pages/crm/SalesActivities";
import SegmentBuilder from "@/pages/crm/SegmentBuilder";
import MarketingAttribution from "@/pages/crm/MarketingAttribution";
import ContractLifecycleManagement from "@/pages/crm/ContractLifecycleManagement";
import AgentScriptBuilder from "@/pages/crm/AgentScriptBuilder";
import ContactCenterAnalytics from "@/pages/crm/ContactCenterAnalytics";
import SalesLeaderboard from "@/pages/crm/SalesLeaderboard";
import CommissionDisputes from "@/pages/crm/CommissionDisputes";

// Phase 6 Gap Components
import CollaborativeForecasting from "@/pages/crm/CollaborativeForecasting";
import MobileSalesApp from "@/pages/crm/MobileSalesApp";
import UtmTracking from "@/pages/crm/UtmTracking";
import AbTestingFramework from "@/pages/crm/AbTestingFramework";
import GuidedSelling from "@/pages/crm/GuidedSelling";
import QuoteApprovalWorkflow from "@/pages/crm/QuoteApprovalWorkflow";
import EmailToCase from "@/pages/crm/EmailToCase";
import CustomerSurveyCsat from "@/pages/crm/CustomerSurveyCsat";
import TechnicianSkillsZones from "@/pages/crm/TechnicianSkillsZones";
import SpatialDispatchOptimizer from "@/pages/crm/SpatialDispatchOptimizer";
import MobileTechnicianApp from "@/pages/crm/MobileTechnicianApp";
import PartsReplenishment from "@/pages/crm/PartsReplenishment";
import ClawbackRules from "@/pages/crm/ClawbackRules";
import PlanAgreementSignOffs from "@/pages/crm/PlanAgreementSignOffs";
import PlaybookBuilder from "@/pages/crm/PlaybookBuilder";
import ServiceEntitlements from "@/pages/crm/ServiceEntitlements";

// CRM Landing
import CrmDashboard from "@/pages/crm/CrmDashboard";

import ModuleLayout from "@/components/layouts/ModuleLayout";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";
import { CrmSidebar } from "@/components/nav/CrmSidebar";
import CPQDashboard from "@/pages/crm/CPQDashboard";

export default function CrmRoutes() {
    return (
        <ModuleLayout sidebar={<CrmSidebar />}>
            <Switch>
                <Route path="/crm/leads/:id" component={LeadsDetail} />
                <Route path="/crm/leads" component={LeadsDetail} />
                <Route path="/crm/territories/builder" component={TerritoryRuleBuilder} />
                <Route path="/crm/accounts" component={AccountsDetail} />
                <Route path="/crm/accounts/:id" component={Account360} />
                <Route path="/crm/contacts" component={ContactList} />
                <Route path="/crm/territories" component={TerritoryManager} />
                <Route path="/crm/incentives" component={IncentiveDashboard} />
                <Route path="/crm/commissions/admin" component={CommissionPlanManager} />
                <Route path="/crm/forecast" component={SalesForecasting} />
                <Route path="/crm/campaigns" component={CampaignDashboard} />
                <Route path="/crm/campaigns/:id" component={CampaignDetail} />
                <Route path="/crm/campaigns/builder" component={CampaignFlowBuilder} />
                <Route path="/crm/marketing/email-templates" component={EmailTemplateBuilder} />
                <Route path="/crm/cases" component={CaseDashboard} />
                <Route path="/crm/cases/routing" component={OmnichannelRouting} />
                <Route path="/crm/cases/:id" component={CaseDetail} />
                <Route path="/crm/field-service" component={DispatchConsole} />
                <Route path="/crm/knowledge" component={KnowledgeBaseDashboard} />
                <Route path="/crm/contracts" component={ContractDashboard} />
                <Route path="/crm/contracts/:id/lines" component={ContractLinesWorkbench} />
                <Route path="/crm/contracts/:id" component={ContractDetail} />
                <Route path="/crm/partner" component={PartnerDashboard} />
                <Route path="/crm/quotas" component={CrmQuotaManagement} />
                <Route path="/crm/analytics" component={CrmAnalyticsDashboard} />
                <Route path="/crm/field-service" component={FieldServiceDashboard} />
                <Route path="/crm/field-service/:id" component={WorkOrderDetail} />
                <Route path="/crm/pipeline" component={OpportunityPipeline} />
                <Route path="/crm/quotes/builder" component={QuoteBuilder} />
                <Route path="/crm/lead-scoring" component={LeadScoringDashboard} />
                <Route path="/crm/competitors" component={CompetitorIntelligence} />
                <Route path="/crm/analytics" component={CrmAnalyticsDashboard} />
                <Route path="/crm/deal-desk" component={DealDesk} />
                <Route path="/crm/catalog" component={ProductCatalogManager} />
                <Route path="/crm/cpq" component={CPQDashboard} />
                <Route path="/crm/cpq/configure" component={CpqConfigurator} />
                <Route path="/crm/cpq/rules" component={ProductConfigurator} />
                <Route path="/crm/marketing/campaigns" component={EmailCampaignBuilder} />
                <Route path="/crm/marketing/automation" component={MarketingAutomation} />
                <Route path="/crm/service" component={() => {
                    const [, setLocation] = useLocation();
                    useEffect(() => setLocation("/crm/service/cases"), [setLocation]);
                    return null;
                }} />
                <Route path="/crm/service/cases" component={CaseManagement} />
                <Route path="/crm/service/knowledge" component={KnowledgeBase} />
                <Route path="/crm/partners" component={PartnerManagement} />
                <Route path="/crm/partners/deals" component={DealRegistration} />

                {/* Phase 5 & 6 Gap Routes */}
                <Route path="/crm/activities" component={SalesActivities} />
                <Route path="/crm/marketing/segments" component={SegmentBuilder} />
                <Route path="/crm/marketing/attribution" component={MarketingAttribution} />
                <Route path="/crm/cpq/clm" component={ContractLifecycleManagement} />
                <Route path="/crm/service/scripts" component={AgentScriptBuilder} />
                <Route path="/crm/service/analytics" component={ContactCenterAnalytics} />
                <Route path="/crm/incentives/leaderboard" component={SalesLeaderboard} />
                <Route path="/crm/incentives/disputes" component={CommissionDisputes} />

                <Route path="/crm/sales/forecasting" component={CollaborativeForecasting} />
                <Route path="/crm/sales/playbooks" component={PlaybookBuilder} />
                <Route path="/crm/sales/mobile" component={MobileSalesApp} />
                <Route path="/crm/marketing/utm" component={UtmTracking} />
                <Route path="/crm/marketing/ab-testing" component={AbTestingFramework} />
                <Route path="/crm/cpq/guided" component={GuidedSelling} />
                <Route path="/crm/cpq/approvals" component={QuoteApprovalWorkflow} />
                <Route path="/crm/service/email-to-case" component={EmailToCase} />
                <Route path="/crm/service/csat" component={CustomerSurveyCsat} />
                <Route path="/crm/service/entitlements" component={ServiceEntitlements} />
                <Route path="/crm/field-service/skills" component={TechnicianSkillsZones} />
                <Route path="/crm/field-service/optimizer" component={SpatialDispatchOptimizer} />
                <Route path="/crm/field-service/mobile" component={MobileTechnicianApp} />
                <Route path="/crm/field-service/parts" component={PartsReplenishment} />
                <Route path="/crm/compensation/clawbacks" component={ClawbackRules} />
                <Route path="/crm/compensation/agreements" component={PlanAgreementSignOffs} />

                {/* Module Overview & Catch-all */}
                <Route path="/crm-module" component={CRM} />
                <Route path="/crm" component={CrmDashboard} />
                <Route path="/crm/:page?" component={CRM} />
                <Route component={GenericModuleDashboard} />
            </Switch>
        </ModuleLayout>
    );
}
