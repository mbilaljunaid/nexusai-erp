
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
import CaseDashboard from "@/pages/crm/CaseDashboard";
import CaseDetail from "@/pages/crm/CaseDetail";
import KnowledgeBaseDashboard from "@/pages/crm/KnowledgeBaseDashboard";
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

// Phase 5 CRM Components
import EmailCampaignBuilder from "@/pages/crm/EmailCampaignBuilder";
import MarketingAutomation from "@/pages/crm/MarketingAutomation";

// Phase 6 CRM Components
import CaseManagement from "@/pages/crm/CaseManagement";
import KnowledgeBase from "@/pages/crm/KnowledgeBase";

// Phase 7 CRM Components
import PartnerManagement from "@/pages/crm/PartnerManagement";
import DealRegistration from "@/pages/crm/DealRegistration";

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
                <Route path="/crm/accounts" component={AccountsDetail} />
                <Route path="/crm/accounts/:id" component={Account360} />
                <Route path="/crm/contacts" component={ContactList} />
                <Route path="/crm/territories" component={TerritoryManager} />
                <Route path="/crm/incentives" component={IncentiveDashboard} />
                <Route path="/crm/commissions/admin" component={CommissionPlanManager} />
                <Route path="/crm/forecast" component={SalesForecasting} />
                <Route path="/crm/campaigns" component={CampaignDashboard} />
                <Route path="/crm/campaigns/:id" component={CampaignDetail} />
                <Route path="/crm/cases" component={CaseDashboard} />
                <Route path="/crm/cases/:id" component={CaseDetail} />
                <Route path="/crm/knowledge" component={KnowledgeBaseDashboard} />
                <Route path="/crm/contracts" component={ContractDashboard} />
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

                {/* Module Overview & Catch-all */}
                <Route path="/crm-module" component={CRM} />
                <Route path="/crm" component={CrmDashboard} />
                <Route path="/crm/:page?" component={CRM} />
                <Route component={GenericModuleDashboard} />
            </Switch>
        </ModuleLayout>
    );
}
