
import { Route, Switch } from "wouter";
// import { lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import JournalWizard from "@/pages/gl/JournalWizard";

// Static Imports for Finance & GL
import TreasuryCommandCenter from "@/pages/TreasuryCommandCenter";
import ReconciliationPage from "@/pages/ReconciliationPage";
import FixedAssets from "@/pages/finance/FixedAssets";
import APInvoices from "@/pages/APInvoices";
import AccountsReceivable from "@/pages/AccountsReceivable";
import EnterpriseBillingDashboard from "@/pages/billing/BillingDashboard";
import BillingWorkbench from "@/pages/billing/BillingWorkbench";
import BillingRulesManager from "@/pages/billing/BillingRulesManager";
import BillingProfileManager from "@/pages/billing/BillingProfileManager";
import BillingAnomalyDashboard from "@/pages/billing/BillingAnomalyDashboard";
// Handle mixed exports
import { SubscriptionWorkbench } from "@/pages/billing/SubscriptionWorkbench";
import { ArInvoiceList } from "@/components/ar/ArInvoiceList";

import ArAnalytics from "@/pages/ArAnalytics";
import ArReports from "@/pages/ArReports";
import CustomerDetails from "@/pages/CustomerDetails";
import JournalEntry from "@/pages/gl/JournalEntry";
import JournalApprovalHub from "@/pages/gl/JournalApprovalHub";

import { PostingRulesManager } from "@/pages/gl/PostingRulesManager";
import { ValidationControls } from "@/pages/gl/ValidationControls";

import JournalEntries from "@/pages/JournalEntries";
import FSGBuilder from "@/pages/gl/FSGBuilder";
import FinancialReports from "@/pages/gl/FinancialReports";
import AuditLogsPage from "@/pages/gl/AuditLogs";
import Finance from "@/pages/Finance";
import CloseDashboard from "@/pages/gl/CloseDashboard";
import BudgetManager from "@/pages/gl/BudgetManager";
import CVRManager from "@/pages/gl/CVRManager";
import DataAccessManager from "@/pages/gl/DataAccessManager";
import ArPeriodClose from "@/pages/ArPeriodClose";
import TrialBalance from "@/pages/gl/TrialBalance";
import LedgerSetup from "@/pages/gl/LedgerSetup";
import LedgerSetSetup from "@/pages/gl/LedgerSetSetup";
import LegalEntitySetup from "@/pages/gl/LegalEntitySetup";
import ValueSetManager from "@/pages/gl/ValueSetManager";
import CoaStructureSetup from "@/pages/gl/CoaStructureSetup";
import HierarchyManager from "@/pages/gl/HierarchyManager";
import ConfigurationHub from "@/pages/gl/ConfigurationHub";
import CalendarSetup from "@/pages/gl/CalendarSetup";
import AccountingHubWorkbench from "@/pages/gl/config/sla/AccountingHubWorkbench";
import AdrBuilder from "@/pages/sla/AdrBuilder";
import SlaDashboard from "@/pages/sla/SlaDashboard";
import ManualJournalEntry from "@/pages/sla/ManualJournalEntry";
import SlaReconciliation from "@/pages/gl/SlaReconciliation";

import SourceCategorySetup from "@/pages/gl/SourceCategorySetup";
import LedgerControlSetup from "@/pages/gl/LedgerControlSetup";
import IntercompanyRules from "@/pages/gl/IntercompanyRules";
import Revaluation from "@/pages/gl/Revaluation";
import TaxManagement from "@/pages/TaxManagement";
import ExpenseManagement from "@/pages/ExpenseManagement";
import ApSettings from "@/components/ap/ApSettings";

// Revenue Management
import RevenueContractWorkbench from "@/pages/RevenueContractWorkbench";
import RevenueRuleManager from "@/pages/RevenueRuleManager";
import RevenueContractDetail from "@/pages/RevenueContractDetail";
import RevenuePeriodClose from "@/pages/RevenuePeriodClose";

import AccountAnalysisReport from "@/pages/gl/AccountAnalysisReport";

// Lease & Contracts
import LeasePortfolioWorkbench from "@/pages/leases/LeasePortfolioWorkbench";
import LeaseSystemSetup from "@/pages/leases/LeaseSystemSetup";
import LeaseDisclosureReport from "@/pages/leases/LeaseDisclosureReport";
import LeaseDetailPage from "@/pages/leases/LeaseDetailPage";
import ContractList from "@/pages/contracts/ContractList";
import ContractDetailView from "@/pages/ContractDetailView";
import SSPManager from "@/pages/SSPManager";
import RevenueWaterfall from "@/pages/RevenueWaterfall";
import DeferredRevenueMatrix from "@/pages/DeferredRevenueMatrix";
import RevenueSourceEvents from "@/pages/RevenueSourceEvents";
import RevenueAuditConsole from "@/pages/RevenueAuditConsole";
import RevenueAccountingSetup from "@/pages/RevenueAccountingSetup";
import { RevenueIntelligence } from "@/pages/revenue/RevenueIntelligence";
import RevenueForecasting from "@/pages/RevenueForecasting";
import RevenueOptimization from "@/pages/RevenueOptimization";

import TranslationRules from "@/pages/gl/TranslationRules";
import ConsolidationWorkbench from "@/pages/gl/ConsolidationWorkbench";
import EliminationRules from "@/pages/gl/EliminationRules";
import FinancialCloseCenter from "@/pages/gl/FinancialCloseCenter";

import ModuleLayout from "@/components/layouts/ModuleLayout";
// import { FinanceSidebar } from "@/components/nav/FinanceSidebar";

export default function FinanceRoutes() {
    console.log("DEBUG: FinanceRoutes RENDERED. Path:", window.location.pathname);
    return (
        <ModuleLayout>
            <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded">
                DEBUG: FinanceRoutes Active. Path: {window.location.pathname}
            </div>
            <Switch>
                <Route path="/finance/cash-management" component={TreasuryCommandCenter} />
                <Route path="/finance/treasury" component={TreasuryCommandCenter} />
                <Route path="/cash/accounts/:id/reconcile" component={ReconciliationPage} />
                <Route path="/finance/fixed-assets" component={FixedAssets} />
                <Route path="/finance/accounts-payable" component={APInvoices} />
                <Route path="/finance/accounts-receivable" component={AccountsReceivable} />
                <Route path="/finance/billing" component={EnterpriseBillingDashboard} />
                <Route path="/finance/billing/workbench" component={BillingWorkbench} />
                <Route path="/finance/billing/rules" component={BillingRulesManager} />
                <Route path="/finance/billing/profiles" component={BillingProfileManager} />
                <Route path="/finance/billing/anomalies" component={BillingAnomalyDashboard} />
                <Route path="/finance/billing/subscriptions" component={SubscriptionWorkbench} />

                <Route path="/finance/ar/invoices" component={ArInvoiceList} />
                <Route path="/finance/ar/analytics" component={ArAnalytics} />
                <Route path="/finance/ar/reports" component={ArReports} />
                <Route path="/finance/ar/customers/:id" component={CustomerDetails} />
                <Route path="/finance/ar/period-close" component={ArPeriodClose} />

                <Route path="/gl/journals/new" component={JournalEntry} />
                <Route path="/gl/journals/wizard" component={JournalWizard} />
                <Route path="/gl/journals/approvals" component={JournalApprovalHub} />
                <Route path="/gl/config/posting-rules" component={PostingRulesManager} />
                <Route path="/gl/config/validations" component={ValidationControls} />
                <Route path="/gl/journals" component={JournalEntries} />
                <Route path="/gl/reports/builder" component={FSGBuilder} />
                <Route path="/gl/reports" component={FinancialReports} />
                <Route path="/gl/reports/account-analysis" component={AccountAnalysisReport} />
                <Route path="/gl/audit" component={AuditLogsPage} />
                <Route path="/gl/period-close" component={CloseDashboard} />
                <Route path="/gl/budgets" component={BudgetManager} />
                <Route path="/gl/cvr" component={CVRManager} />
                <Route path="/gl/data-access" component={DataAccessManager} />
                <Route path="/gl/trial-balance" component={TrialBalance} />
                <Route path="/gl/config/ledgers" component={LedgerSetup} />
                <Route path="/gl/config/ledger-sets" component={LedgerSetSetup} />
                <Route path="/gl/config/legal-entities" component={LegalEntitySetup} />
                <Route path="/gl/value-sets" component={ValueSetManager} />
                <Route path="/gl/coa-structures" component={CoaStructureSetup} />
                <Route path="/gl/hierarchies" component={HierarchyManager} />
                <Route path="/gl/config" component={ConfigurationHub} />
                <Route path="/gl/config/calendars" component={CalendarSetup} />
                <Route path="/gl/config/sla" component={AccountingHubWorkbench} />
                <Route path="/gl/config/sla/adr" component={AdrBuilder} />
                <Route path="/finance/sla/dashboard" component={SlaDashboard} />
                <Route path="/finance/sla/manual-entry" component={ManualJournalEntry} />
                <Route path="/finance/sla/reconciliation" component={SlaReconciliation} />
                <Route path="/gl/config/translation" component={TranslationRules} />
                <Route path="/gl/config/sources" component={SourceCategorySetup} />
                <Route path="/gl/config/controls" component={LedgerControlSetup} />
                <Route path="/gl/intercompany" component={IntercompanyRules} />
                <Route path="/gl/revaluation" component={Revaluation} />
                <Route path="/gl/close-center" component={FinancialCloseCenter} />
                <Route path="/gl/consolidation" component={ConsolidationWorkbench} />
                <Route path="/gl/consolidation/rules" component={EliminationRules} />

                <Route path="/finance/tax" component={TaxManagement} />
                <Route path="/finance/expense-management" component={ExpenseManagement} />

                <Route path="/ap/settings">
                    <ProtectedRoute>
                        <ApSettings />
                    </ProtectedRoute>
                </Route>

                {/* Revenue Management */}
                <Route path="/revenue/contracts" component={RevenueContractWorkbench} />
                <Route path="/revenue/contracts/:id" component={RevenueContractDetail} />
                <Route path="/revenue/periods" component={RevenuePeriodClose} />
                <Route path="/revenue/ssp" component={SSPManager} />
                <Route path="/revenue/rules" component={RevenueRuleManager} />
                <Route path="/revenue/waterfall" component={RevenueWaterfall} />
                <Route path="/revenue/deferred" component={DeferredRevenueMatrix} />
                <Route path="/revenue/events" component={RevenueSourceEvents} />
                <Route path="/revenue/audit" component={RevenueAuditConsole} />
                <Route path="/revenue/setup" component={RevenueAccountingSetup} />
                <Route path="/revenue/intelligence" component={RevenueIntelligence} />
                <Route path="/revenue/forecasting" component={RevenueForecasting} />
                <Route path="/revenue/optimization" component={RevenueOptimization} />

                {/* Lease & Contracts */}
                <Route path="/finance/leases" component={LeasePortfolioWorkbench} />
                <Route path="/finance/leases/setup" component={LeaseSystemSetup} />
                <Route path="/finance/leases/reports/disclosure" component={LeaseDisclosureReport} />
                <Route path="/finance/leases/:id" component={LeaseDetailPage} />
                <Route path="/finance/contracts" component={ContractList} />
                <Route path="/finance/contracts/:id" component={ContractDetailView} />

                {/* Module Overview & Catch-all */}
                <Route path="/finance-module" component={Finance} />
                <Route path="/finance/:page?" component={Finance} />

                {/* Fallback for Finance Routes */}
                <Route>
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold text-red-600">404 - Page Not Found (Finance)</h2>
                        <p className="mt-2 text-gray-600">The requested page could not be found within the Finance module.</p>
                        <div className="mt-4 p-4 bg-gray-100 rounded text-left inline-block">
                            <p><strong>Current Path:</strong> {window.location.pathname}</p>
                            <p><strong>Router Base:</strong> FinanceRoutes</p>
                        </div>
                    </div>
                </Route>
            </Switch>
        </ModuleLayout>
    );
}
