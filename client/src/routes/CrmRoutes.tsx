
import { Route, Switch } from "wouter";
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
import CrmAnalyticsDashboard from "@/pages/crm/CrmAnalyticsDashboard";
import FieldServiceDashboard from "@/pages/crm/FieldServiceDashboard";
import WorkOrderDetail from "@/pages/crm/WorkOrderDetail";
import CRM from "@/pages/CRM";

import ModuleLayout from "@/components/layouts/ModuleLayout";
// import { CrmSidebar } from "@/components/nav/CrmSidebar";

export default function CrmRoutes() {
    return (
        <ModuleLayout>
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
            <Route path="/crm/analytics" component={CrmAnalyticsDashboard} />
            <Route path="/crm/field-service" component={FieldServiceDashboard} />
            <Route path="/crm/field-service/:id" component={WorkOrderDetail} />

            {/* Module Overview & Catch-all */}
            <Route path="/crm-module" component={CRM} />
            <Route path="/crm/:page?" component={CRM} />
        </ModuleLayout>
    );
}
