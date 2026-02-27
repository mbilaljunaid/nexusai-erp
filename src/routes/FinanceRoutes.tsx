
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
// import { lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import JournalWizard from "@/pages/gl/JournalWizard";
import { AlertCircle } from "lucide-react";

// Static Imports for Finance & GL
import TreasuryCommandCenter from "@/pages/TreasuryCommandCenter";
import ReconciliationPage from "@/pages/ReconciliationPage";
import FixedAssets from "@/pages/finance/FixedAssets";
import FixedAssetWorkbench from "@/pages/finance/FixedAssetWorkbench";
import APInvoices from "@/pages/finance/ap/APInvoices";
import APInvoiceEntry from "@/pages/finance/ap/APInvoiceEntry";
import APDashboard from "@/pages/finance/ap/APDashboard";
import APSuppliers from "@/pages/finance/ap/APSuppliers";
import APWithholdingTax from "@/pages/finance/ap/APWithholdingTax";
import APAICaptureUpload from "@/pages/finance/ap/APAICaptureUpload";
import APReports from "@/pages/finance/ap/APReports";
import APPrepayments from "@/pages/finance/ap/APPrepayments";
import APPaymentBatches from "@/pages/finance/ap/APPaymentBatches";
import APSystemConfig from "@/pages/finance/ap/APSystemConfig";
import PaymentTermsMaster from "@/pages/finance/ap/PaymentTermsMaster";
import APPeriodClose from "@/pages/finance/ap/APPeriodClose";

// Cash Management
import CashManagementDashboard from "@/pages/finance/cash/CashManagementDashboard";
import CashReconciliationWorkbench from "@/pages/finance/CashReconciliationWorkbench";
import CashForecastingView from "@/pages/finance/cash/CashForecastingView";
import CurrencyRevaluationView from "@/pages/finance/cash/CurrencyRevaluationView";
import ZBAManagement from "@/pages/finance/cash/ZBAManagement";
import BankReconciliationWorkbench from "@/pages/finance/cash/BankReconciliationWorkbench";
import CashPositionDashboard from "@/pages/finance/cash/CashPositionDashboard";
import TreasuryBankAccounts from "@/pages/finance/treasury/BankAccounts";

import AccountsReceivable from "@/pages/AccountsReceivable";
import EnterpriseBillingDashboard from "@/pages/billing/BillingDashboard";
import BillingWorkbench from "@/pages/billing/BillingWorkbench";
import BillingRulesManager from "@/pages/billing/BillingRulesManager";
import BillingProfileManager from "@/pages/billing/BillingProfileManager";
import BillingAnomalyDashboard from "@/pages/billing/BillingAnomalyDashboard";
// Handle mixed exports
import { SubscriptionWorkbench } from "@/pages/billing/SubscriptionWorkbench";
import { ArInvoiceList } from "@/components/ar/ArInvoiceList";
import SubscriptionLifecycleManager from "@/pages/billing/SubscriptionLifecycleManager";
import UsageMeteringDashboard from "@/pages/billing/UsageMeteringDashboard";
import DunningConfigManager from "@/pages/billing/DunningConfigManager";
import RevenueWaterfallDashboard from "@/pages/billing/RevenueWaterfallDashboard";
import CreditMemoWorkbench from "@/pages/billing/CreditMemoWorkbench";

import ARInvoices from "@/pages/finance/ar/ARInvoices";
import ARReceipts from "@/pages/finance/ar/ARReceipts";
import ARCustomers from "@/pages/finance/ar/ARCustomers";
import ArAnalytics from "@/pages/finance/ar/ArAnalytics";
import ArReports from "@/pages/finance/ar/ArReports";
import ArDunningWorkbench from "@/pages/finance/ar/ArDunningWorkbench";
import LockboxWorkbench from "@/pages/finance/LockboxWorkbench";
import { ArRevenueWorkbench } from "@/components/ar/ArRevenueWorkbench";
import CollectionsWorkbench from "@/pages/finance/ar/CollectionsWorkbench";
import ICDisputeWorkbench from "@/pages/finance/ICDisputeWorkbench";
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
import ArPeriodClose from "@/pages/finance/ar/ArPeriodClose";
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

// Intercompany Module
import IntercompanyWorkbench from "@/pages/intercompany/IntercompanyWorkbench";
import NettingWorkbench from "@/pages/intercompany/NettingWorkbench";
import AllocationsWorkbench from "@/pages/intercompany/AllocationsWorkbench";
import IntercompanyReconciliation from "@/pages/intercompany/IntercompanyReconciliation";
import ICDataAccessManager from "@/pages/intercompany/ICDataAccessManager";

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
import LeaseSchedulesView from "@/pages/leases/LeaseSchedulesView";
import LeaseApprovalsWorkbench from "@/pages/leases/LeaseApprovalsWorkbench";
import LeaseModificationWizard from "@/pages/leases/LeaseModificationWizard";
import LeaseComplianceDashboard from "@/pages/leases/LeaseComplianceDashboard";
import ContractList from "@/pages/contracts/ContractList";
import ContractDetailView from "@/pages/ContractDetailView";
import RevenueSSPManager from "@/pages/RevenueSSPManager";
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

// Financial Consolidation
import LedgerSetManager from "@/pages/gl/LedgerSetManager";
import FxTranslationDashboard from "@/pages/gl/FxTranslationDashboard";
import EliminationRuleBuilder from "@/pages/gl/EliminationRuleBuilder";
import ConsolidationResultsViewer from "@/pages/gl/ConsolidationResultsViewer";
import EliminationJournalReview from "@/pages/gl/EliminationJournalReview";
import VarianceAnalysis from "@/pages/gl/VarianceAnalysis";

// EPM Phase 1 Components
import BudgetControlRules from "@/pages/epm/BudgetControlRules";
import BudgetBalanceDrillDown from "@/pages/epm/BudgetBalanceDrillDown";
import VarianceAnalysisWorkbench from "@/pages/epm/VarianceAnalysisWorkbench";
import BudgetReconciliation from "@/pages/epm/BudgetReconciliation";

// EPM Phase 2 Components
import ScenarioComparison from "@/pages/epm/ScenarioComparison";
import BudgetWorkflow from "@/pages/epm/BudgetWorkflow";
import BudgetAllocationWorkbench from "@/pages/epm/BudgetAllocationWorkbench";

import ModuleLayout from "@/components/layouts/ModuleLayout";
// import { FinanceSidebar } from "@/components/nav/FinanceSidebar";

export default function FinanceRoutes() {
    console.log("DEBUG: FinanceRoutes RENDERED. Path:", window.location.pathname);
    return (
        <ModuleLayout>
            <Switch>
                <Route path="/finance/cash" component={CashManagementDashboard} />
                <Route path="/finance/cash-management" component={CashManagementDashboard} />
                <Route path="/finance/cash/reconciliation" component={CashReconciliationWorkbench} />
                <Route path="/finance/cash/forecasting" component={CashForecastingView} />
                <Route path="/finance/cash/revaluation" component={CurrencyRevaluationView} />
                <Route path="/finance/cash/zba" component={ZBAManagement} />
                <Route path="/finance/cash/bank-reconciliation" component={BankReconciliationWorkbench} />
                <Route path="/finance/cash/position" component={CashPositionDashboard} />
                <Route path="/finance/treasury" component={TreasuryCommandCenter} />
                <Route path="/finance/treasury/bank-accounts" component={TreasuryBankAccounts} />
                <Route path="/finance/cash/accounts/:id/reconcile" component={ReconciliationPage} />
                <Route path="/finance/fixed-assets" component={FixedAssetWorkbench} />
                <Route path="/finance/fixed-assets/workbench" component={FixedAssetWorkbench} />
                <Route path="/finance/fixed-assets/inquiry" component={FixedAssets} />
                <Route path="/finance/ap/suppliers" component={APSuppliers} />
                <Route path="/finance/ap/invoices/new" component={APInvoiceEntry} />
                <Route path="/finance/ap/invoices" component={APInvoices} />
                <Route path="/finance/ap/payments" component={APPaymentBatches} />
                <Route path="/finance/ap/withholding-tax" component={APWithholdingTax} />
                <Route path="/finance/ap/ai-capture" component={APAICaptureUpload} />
                <Route path="/finance/ap/reports" component={APReports} />
                <Route path="/finance/ap/prepayments" component={APPrepayments} />
                <Route path="/finance/ap/payment-terms" component={PaymentTermsMaster} />
                <Route path="/finance/ap/period-close" component={APPeriodClose} />
                <Route path="/finance/ap/config" component={APSystemConfig} />
                <Route path="/finance/ap" component={APDashboard} />
                {/* Legacy redirect for backward compatibility */}
                <Route path="/finance/accounts-payable" component={() => {
                    const [, setLocation] = useLocation();
                    useEffect(() => setLocation("/finance/ap"), [setLocation]);
                    return null;
                }} />
                <Route path="/finance/accounts-receivable" component={AccountsReceivable} />
                <Route path="/finance/billing" component={EnterpriseBillingDashboard} />
                <Route path="/finance/billing/subscriptions" component={SubscriptionLifecycleManager} />
                <Route path="/finance/billing/usage-metering" component={UsageMeteringDashboard} />
                <Route path="/finance/billing/dunning" component={DunningConfigManager} />
                <Route path="/finance/billing/revenue-waterfall" component={RevenueWaterfallDashboard} />
                <Route path="/finance/billing/credit-memos" component={CreditMemoWorkbench} />
                <Route path="/finance/billing/workbench" component={BillingWorkbench} />
                <Route path="/finance/billing/rules" component={BillingRulesManager} />
                <Route path="/finance/billing/profiles" component={BillingProfileManager} />
                <Route path="/finance/billing/anomalies" component={BillingAnomalyDashboard} />

                <Route path="/finance/ar/invoices" component={ARInvoices} />
                <Route path="/finance/ar/receipts" component={ARReceipts} />
                <Route path="/finance/ar/customers" component={ARCustomers} />
                <Route path="/finance/ar/analytics" component={ArAnalytics} />
                <Route path="/finance/ar/reports" component={ArReports} />
                <Route path="/finance/ar/customers/:id" component={CustomerDetails} />
                <Route path="/finance/ar/period-close" component={ArPeriodClose} />
                <Route path="/finance/ar/dunning" component={ArDunningWorkbench} />
                <Route path="/finance/ar/lockbox" component={LockboxWorkbench} />
                <Route path="/finance/ar/revenue-schedules" component={ArRevenueWorkbench} />
                <Route path="/finance/ar/revenue" component={ArRevenueWorkbench} />
                <Route path="/finance/ar/collections" component={CollectionsWorkbench} />
                <Route path="/finance/ic/disputes" component={ICDisputeWorkbench} />

                <Route path="/finance/gl/journals/new" component={JournalEntry} />
                <Route path="/finance/gl/journals/wizard" component={JournalWizard} />
                <Route path="/finance/gl/journals/approvals" component={JournalApprovalHub} />
                <Route path="/finance/gl/config/posting-rules" component={PostingRulesManager} />
                <Route path="/finance/gl/config/validations" component={ValidationControls} />
                <Route path="/finance/gl/journals" component={JournalEntries} />
                <Route path="/finance/gl/reports/builder" component={FSGBuilder} />
                <Route path="/finance/gl/reports" component={FinancialReports} />
                <Route path="/finance/gl/reports/account-analysis" component={AccountAnalysisReport} />
                <Route path="/finance/gl/audit" component={AuditLogsPage} />
                <Route path="/finance/gl/period-close" component={CloseDashboard} />
                <Route path="/finance/gl/budgets" component={BudgetManager} />
                <Route path="/finance/gl/cvr" component={CVRManager} />
                <Route path="/finance/gl/data-access" component={DataAccessManager} />
                <Route path="/finance/gl/trial-balance" component={TrialBalance} />
                <Route path="/finance/gl/config/ledgers" component={LedgerSetup} />
                <Route path="/finance/gl/config/ledger-sets" component={LedgerSetSetup} />
                <Route path="/finance/gl/config/legal-entities" component={LegalEntitySetup} />
                <Route path="/finance/gl/value-sets" component={ValueSetManager} />
                <Route path="/finance/gl/coa-structures" component={CoaStructureSetup} />
                <Route path="/finance/gl/hierarchies" component={HierarchyManager} />
                <Route path="/finance/gl/config" component={ConfigurationHub} />
                <Route path="/finance/gl/config/calendars" component={CalendarSetup} />
                <Route path="/finance/gl/config/sla" component={AccountingHubWorkbench} />
                <Route path="/finance/gl/config/sla/adr" component={AdrBuilder} />
                <Route path="/finance/sla/dashboard" component={SlaDashboard} />
                <Route path="/finance/sla/manual-entry" component={ManualJournalEntry} />
                <Route path="/finance/sla/reconciliation" component={SlaReconciliation} />
                <Route path="/finance/gl/config/translation" component={TranslationRules} />
                <Route path="/finance/gl/config/sources" component={SourceCategorySetup} />
                <Route path="/finance/gl/config/controls" component={LedgerControlSetup} />
                <Route path="/finance/gl/intercompany" component={IntercompanyRules} />
                <Route path="/finance/gl/revaluation" component={Revaluation} />
                <Route path="/finance/gl/close-center" component={FinancialCloseCenter} />
                <Route path="/finance/gl/consolidation" component={ConsolidationWorkbench} />
                <Route path="/finance/gl/consolidation/ledger-sets" component={LedgerSetManager} />
                <Route path="/finance/gl/consolidation/variance" component={VarianceAnalysis} />

                {/* EPM Module Routes */}
                <Route path="/finance/epm/budget-controls" component={BudgetControlRules} />
                <Route path="/finance/epm/budget-balances/:periodId" component={BudgetBalanceDrillDown} />
                <Route path="/finance/epm/variance-analysis" component={VarianceAnalysisWorkbench} />
                <Route path="/finance/epm/budget-reconciliation" component={BudgetReconciliation} />
                <Route path="/finance/epm/scenarios" component={ScenarioComparison} />
                <Route path="/finance/epm/workflow" component={BudgetWorkflow} />
                <Route path="/finance/epm/allocations" component={BudgetAllocationWorkbench} />
                <Route path="/finance/gl/consolidation/rules" component={EliminationRuleBuilder} />
                <Route path="/finance/gl/consolidation/results/:runId">{(params: { runId: string }) => <ConsolidationResultsViewer />}</Route>
                <Route path="/finance/gl/consolidation/journals" component={EliminationJournalReview} />
                <Route path="/finance/gl/consolidation/elimination-rules" component={EliminationRules} />

                {/* Intercompany Module */}
                <Route path="/finance/intercompany/workbench" component={IntercompanyWorkbench} />
                <Route path="/finance/intercompany/netting" component={NettingWorkbench} />
                <Route path="/finance/intercompany/allocations" component={AllocationsWorkbench} />
                <Route path="/finance/intercompany/reconciliation" component={IntercompanyReconciliation} />
                <Route path="/finance/intercompany/data-access" component={ICDataAccessManager} />

                <Route path="/finance/tax" component={TaxManagement} />
                <Route path="/finance/expense-management" component={ExpenseManagement} />

                <Route path="/finance/ap/settings">
                    <ProtectedRoute>
                        <ApSettings />
                    </ProtectedRoute>
                </Route>

                {/* Revenue Management */}
                <Route path="/finance/revenue/contracts" component={RevenueContractWorkbench} />
                <Route path="/finance/revenue/contracts/:id" component={RevenueContractDetail} />
                <Route path="/finance/revenue/periods" component={RevenuePeriodClose} />
                <Route path="/finance/revenue/ssp" component={RevenueSSPManager} />
                <Route path="/finance/revenue/rules" component={RevenueRuleManager} />
                <Route path="/finance/revenue/waterfall" component={RevenueWaterfall} />
                <Route path="/finance/revenue/deferred" component={DeferredRevenueMatrix} />
                <Route path="/finance/revenue/events" component={RevenueSourceEvents} />
                <Route path="/finance/revenue/audit" component={RevenueAuditConsole} />
                <Route path="/finance/revenue/setup" component={RevenueAccountingSetup} />
                <Route path="/finance/revenue/intelligence" component={RevenueIntelligence} />
                <Route path="/finance/revenue/forecasting" component={RevenueForecasting} />
                <Route path="/finance/revenue/optimization" component={RevenueOptimization} />

                {/* Lease & Contracts */}
                <Route path="/finance/leases" component={LeasePortfolioWorkbench} />
                <Route path="/finance/leases/compliance" component={LeaseComplianceDashboard} />
                <Route path="/finance/leases/approvals" component={LeaseApprovalsWorkbench} />
                <Route path="/finance/leases/setup" component={LeaseSystemSetup} />
                <Route path="/finance/leases/reports/disclosure" component={LeaseDisclosureReport} />
                <Route path="/finance/leases/:id" component={LeaseDetailPage} />
                <Route path="/finance/leases/:id/schedules">{(params: { id: string }) => <LeaseSchedulesView leaseId={params.id} />}</Route>
                <Route path="/finance/leases/:id/modify">{(params: { id: string }) => <LeaseModificationWizard leaseId={params.id} />}</Route>

                <Route path="/finance/contracts" component={ContractList} />
                <Route path="/finance/contracts/:id" component={ContractDetailView} />

                {/* Fallback for Finance Routes */}
                <Route>
                    {(_params) => {
                        const [loc] = useLocation();
                        console.warn(`FINANCE ROUTE NOT FOUND. Global: ${window.location.pathname} | Wouter Nested: ${loc}`);
                        return (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">404 - Page Not Found (Finance)</h2>
                                <p className="text-gray-500 max-w-md">
                                    The requested page could not be found within the Finance module.
                                    <br /><br />
                                    <strong>Debug Info:</strong>
                                    <br />Global Path: {window.location.pathname}
                                    <br />Wouter Nested Path: {loc}
                                </p>
                            </div>
                        );
                    }}
                </Route>

                {/* Module Overview & Catch-all */}
                <Route path="/finance-module" component={Finance} />
                <Route path="/finance/:page?" component={Finance} />
            </Switch>
        </ModuleLayout>
    );
}
