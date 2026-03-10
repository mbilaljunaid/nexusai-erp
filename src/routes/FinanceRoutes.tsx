
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
// import { lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import JournalWizard from "@/pages/gl/JournalWizard";
import { AlertCircle } from "lucide-react";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";

// Static Imports for Finance & GL
import TreasuryCommandCenter from "@/pages/TreasuryCommandCenter";
import ReconciliationPage from "@/pages/ReconciliationPage";
import FixedAssets from "@/pages/finance/FixedAssets";
import FixedAssetWorkbench from "@/pages/finance/FixedAssetWorkbench";
import APInvoices from "@/pages/finance/ap/APInvoices";
import APInvoiceEntry from "@/pages/finance/ap/APInvoiceEntry";
import APInvoiceDetail from "@/pages/finance/ap/APInvoiceDetail";
import InvoiceInstallments from "@/pages/finance/ap/InvoiceInstallments";
import APDashboard from "@/pages/finance/ap/APDashboard";
import GLDashboard from "@/pages/finance/gl/GLDashboard";
import APSuppliers from "@/pages/finance/ap/APSuppliers";
import APSupplierDetail from "@/pages/finance/ap/APSupplierDetail";
import APWithholdingTax from "@/pages/finance/ap/APWithholdingTax";
import APAICaptureUpload from "@/pages/finance/ap/APAICaptureUpload";
import APReports from "@/pages/finance/ap/APReports";
import APPrepayments from "@/pages/finance/ap/APPrepayments";
import APPaymentBatches from "@/pages/finance/ap/APPaymentBatches";
import APPaymentDetail from "@/pages/finance/ap/APPaymentDetail";
import CreatePPR from "@/pages/finance/ap/CreatePPR";
import APQuickPayment from "@/pages/finance/ap/APQuickPayment";
import APSystemConfig from "@/pages/finance/ap/APSystemConfig";
import PaymentTermsMaster from "@/pages/finance/ap/PaymentTermsMaster";
import APPeriodClose from "@/pages/finance/ap/APPeriodClose";
import SupplierPortal from "@/pages/finance/ap/SupplierPortal";
import ERSSettlementEngine from "@/pages/finance/ap/ERSSettlementEngine";

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
import ARDashboard from "@/pages/finance/ar/ARDashboard";
import ARInvoiceDetail from "@/pages/finance/ar/ARInvoiceDetail";
import AutoInvoiceWorkbench from "@/pages/finance/ar/AutoInvoiceWorkbench";
import ArAutoAccountingSetup from "@/pages/finance/ar/ArAutoAccountingSetup";
import ArDocumentSequencingSetup from "@/pages/finance/ar/ArDocumentSequencingSetup";
import ARReceipts from "@/pages/finance/ar/ARReceipts";
import ARReceiptDetail from "@/pages/finance/ar/ARReceiptDetail";
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
import GLRateTypes from "@/pages/finance/gl/GLRateTypes";
import JournalImport from "@/pages/gl/JournalImport";

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
import GLInquiry from "@/pages/gl/GLInquiry";
import GLAllocations from "@/pages/gl/GLAllocations";
import BalanceCubeInquiry from "@/pages/gl/BalanceCubeInquiry";
import StatisticalLedgerSetup from "@/pages/gl/StatisticalLedgerSetup";
import CustomerProfileClasses from "@/pages/finance/ar/CustomerProfileClasses";
import TaxRegimeSetup from "@/pages/tax/TaxRegimeSetup";
import TaxDeterminingFactors from "@/pages/tax/TaxDeterminingFactors";

// Oracle Parity — Batch 2-5 Pages
import FAAssetWorkbench from "@/pages/fixed-assets/AssetWorkbench";
import ProrateConventionSetup from "@/pages/fixed-assets/ProrateConventionSetup";
import PhysicalInventoryReconciliation from "@/pages/fixed-assets/PhysicalInventoryReconciliation";
import CapitalProjectsInterface from "@/pages/fixed-assets/CapitalProjectsInterface";
import ArAdjustmentApprovals from "@/pages/finance/ar/ArAdjustmentApprovals";
import VatReturnOutput from "@/pages/finance/tax/VatReturnOutput";
import TaxDashboard from "@/pages/finance/tax/TaxDashboard";
import ExpenseDashboard from "@/pages/finance/expenses/ExpenseDashboard";
import ICDashboard from "@/pages/finance/intercompany/ICDashboard";
import IcAutoInvoice from "@/pages/finance/intercompany/IcAutoInvoice";
import SupplierMerge from "@/pages/finance/ap/SupplierMerge";
import NotionalCashPooling from "@/pages/finance/cash/NotionalCashPooling";
import FADashboard from "@/pages/finance/fixed-assets/FADashboard";
import SLADashboard from "@/pages/finance/sla/SLADashboard";

// Oracle Parity — Round 2 P2 Pages
import RecurringInvoiceTemplates from "@/pages/finance/ap/RecurringInvoiceTemplates";
import InvoiceHoldTypesConfig from "@/pages/finance/ap/config/InvoiceHoldTypesConfig";
import ChargeBackSetup from "@/pages/finance/ar/ChargeBackSetup";
import BankStatementExceptions from "@/pages/finance/cash/BankStatementExceptions";
import TaxBookConfiguration from "@/pages/fixed-assets/TaxBookConfiguration";
import IcReceiverWorkbench from "@/pages/finance/intercompany/IcReceiverWorkbench";

// Oracle Parity — P3 Pages
import BankStatementImport from "@/pages/finance/cash/BankStatementImport";
import APOpenInterface from "@/pages/finance/ap/APOpenInterface";
import AssetReclassification from "@/pages/fixed-assets/AssetReclassification";
import SupplierTRNValidator from "@/pages/tax/SupplierTRNValidator";
import CashAdvanceReconciliation from "@/pages/expenses/CashAdvanceReconciliation";
import ExpenseAuditRuleSets from "@/pages/expenses/ExpenseAuditRuleSets";
import NettingSettlementPayment from "@/pages/finance/intercompany/NettingSettlementPayment";
import LeaseApprovalChainConfig from "@/pages/leases/LeaseApprovalChainConfig";

// Oracle Parity — Round 4 (AR + Expense gaps)
import CreditDebitMemoWorkbench from "@/pages/finance/ar/CreditDebitMemoWorkbench";
import ReceiptApplicationWorkbench from "@/pages/finance/ar/ReceiptApplicationWorkbench";
import ExpensePayrollReimbursement from "@/pages/expenses/ExpensePayrollReimbursement";
import DistributionSetTemplates from "@/pages/finance/ap/config/DistributionSetTemplates";
import FourWayMatchConfig from "@/pages/finance/ap/config/FourWayMatchConfig";
import PerDiemRateTable from "@/pages/expenses/PerDiemRateTable";

// Oracle Parity — Round 6 P1 (Critical Missing Pages)
import ExpenseReportEntry from "@/pages/expenses/ExpenseReportEntry";
import ExpenseApprovalWorkbench from "@/pages/expenses/ExpenseApprovalWorkbench";
import FaMassChange from "@/pages/fixed-assets/FaMassChange";
import FaWhatIfAnalysis from "@/pages/fixed-assets/FaWhatIfAnalysis";
import VatReturnWizard from "@/pages/tax/VatReturnWizard";

// Oracle Parity — Round 6 P2 (Important Missing Pages)
import BankAccountSetup from "@/pages/finance/cash/BankAccountSetup";
import BankStatementMatchRules from "@/pages/finance/cash/BankStatementMatchRules";
import FaAssetAdditionWizard from "@/pages/fixed-assets/FaAssetAdditionWizard";
import FaDepreciationProjection from "@/pages/fixed-assets/FaDepreciationProjection";
import ArStatementPrint from "@/pages/finance/ar/ArStatementPrint";
import ArLockboxSetup from "@/pages/finance/ar/ArLockboxSetup";
import GlEncumbranceSetup from "@/pages/gl/GlEncumbranceSetup";
import GlSecondaryLedgerSetup from "@/pages/gl/GlSecondaryLedgerSetup";
import TaxSubscriptionSetup from "@/pages/tax/TaxSubscriptionSetup";
import TaxExemptionSetup from "@/pages/tax/TaxExemptionSetup";
import SubleaseManagement from "@/pages/leases/SubleaseManagement";

// Oracle Parity — Round 6 P3 (Final 2% Remaining Gaps)
import APPositivePayConfig from "@/pages/finance/ap/APPositivePayConfig";
import FaMassAdditions from "@/pages/fixed-assets/FaMassAdditions";
import FaGroupAssets from "@/pages/fixed-assets/FaGroupAssets";
import FaImpairmentTesting from "@/pages/fixed-assets/FaImpairmentTesting";
import ArRemittanceBatch from "@/pages/finance/ar/ArRemittanceBatch";
import ArCustomerHierarchy from "@/pages/finance/ar/ArCustomerHierarchy";
import CamtImport from "@/pages/finance/cash/CamtImport";
import LeaseInitialDirectCosts from "@/pages/leases/LeaseInitialDirectCosts";

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
import SmartViewIntegration from "@/pages/epm/SmartViewIntegration";
import ESGReporting from "@/pages/epm/ESGReporting";

// EPM Phase 6 Gap Components
import SupplierEmissionSurveys from "@/pages/epm/SupplierEmissionSurveys";
import SustainabilityPublicDashboard from "@/pages/epm/SustainabilityPublicDashboard";

import ModuleLayout from "@/components/layouts/ModuleLayout";
import { FinanceSidebar } from "@/components/nav/FinanceSidebar";

export default function FinanceRoutes() {
    console.log("DEBUG: FinanceRoutes RENDERED. Path:", window.location.pathname);
    return (
        <ModuleLayout sidebar={<FinanceSidebar />}>
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
                <Route path="/finance/fixed-assets" component={FADashboard} />
                <Route path="/finance/fixed-assets/workbench" component={FAAssetWorkbench} />
                <Route path="/finance/fixed-assets/inquiry" component={FixedAssets} />
                <Route path="/finance/fixed-assets/prorate-conventions" component={ProrateConventionSetup} />
                <Route path="/finance/fixed-assets/physical-inventory" component={PhysicalInventoryReconciliation} />
                <Route path="/finance/fixed-assets/capital-projects" component={CapitalProjectsInterface} />
                <Route path="/finance/fixed-assets/tax-books" component={TaxBookConfiguration} />
                <Route path="/finance/fixed-assets/reclassification" component={AssetReclassification} />
                <Route path="/finance/cash/notional-pooling" component={NotionalCashPooling} />
                <Route path="/finance/cash/bank-exceptions" component={BankStatementExceptions} />
                <Route path="/finance/cash/bank-statement-import" component={BankStatementImport} />
                <Route path="/finance/ap/supplier-merge" component={SupplierMerge} />
                <Route path="/finance/ap/supplier-portal" component={SupplierPortal} />
                <Route path="/finance/ap/suppliers/:id" component={APSupplierDetail} />
                <Route path="/finance/ap/suppliers" component={APSuppliers} />
                <Route path="/finance/ap/invoices/new" component={APInvoiceEntry} />
                <Route path="/finance/ap/invoices/:id/installments" component={InvoiceInstallments} />
                <Route path="/finance/ap/invoices/:id" component={APInvoiceDetail} />
                <Route path="/finance/ap/invoices" component={APInvoices} />
                <Route path="/finance/ap/payments/new" component={CreatePPR} />
                <Route path="/finance/ap/payments/quick" component={APQuickPayment} />
                <Route path="/finance/ap/payments/:id" component={APPaymentDetail} />
                <Route path="/finance/ap/payments" component={APPaymentBatches} />
                <Route path="/finance/ap/withholding-tax" component={APWithholdingTax} />
                <Route path="/finance/ap/ai-capture" component={APAICaptureUpload} />
                <Route path="/finance/ap/reports" component={APReports} />
                <Route path="/finance/ap/prepayments" component={APPrepayments} />
                <Route path="/finance/ap/payment-terms" component={PaymentTermsMaster} />
                <Route path="/finance/ap/period-close" component={APPeriodClose} />
                <Route path="/finance/ap/config/hold-types" component={InvoiceHoldTypesConfig} />
                <Route path="/finance/ap/config" component={APSystemConfig} />
                <Route path="/finance/ap/recurring-invoices" component={RecurringInvoiceTemplates} />
                <Route path="/finance/ap/ers-settlement" component={ERSSettlementEngine} />
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

                <Route path="/finance/ar" component={ARDashboard} />
                <Route path="/finance/accounts-receivable" component={ARDashboard} />
                <Route path="/finance/ar/invoices/:id" component={ARInvoiceDetail} />
                <Route path="/finance/ar/invoices" component={ARInvoices} />
                <Route path="/finance/ar/autoinvoice" component={AutoInvoiceWorkbench} />
                <Route path="/finance/ar/auto-accounting" component={ArAutoAccountingSetup} />
                <Route path="/finance/ar/document-sequencing" component={ArDocumentSequencingSetup} />
                <Route path="/finance/ar/receipts/:id" component={ARReceiptDetail} />
                <Route path="/finance/ar/receipts" component={ARReceipts} />
                <Route path="/finance/ar/customers" component={ARCustomers} />
                <Route path="/finance/ar/chargebacks" component={ChargeBackSetup} />
                <Route path="/finance/ar/credit-debit-memos" component={CreditDebitMemoWorkbench} />
                <Route path="/finance/ar/receipt-application" component={ReceiptApplicationWorkbench} />
                <Route path="/finance/ar/adjustment-approvals" component={ArAdjustmentApprovals} />
                <Route path="/finance/tax/vat-return" component={VatReturnOutput} />
                <Route path="/finance/intercompany/auto-invoice" component={IcAutoInvoice} />
                <Route path="/intercompany/auto-invoice" component={IcAutoInvoice} />
                <Route path="/finance/intercompany/receiver-workbench" component={IcReceiverWorkbench} />
                <Route path="/intercompany/receiver-workbench" component={IcReceiverWorkbench} />
                <Route path="/finance/ar/analytics" component={ArAnalytics} />
                <Route path="/finance/ar/reports" component={ArReports} />
                <Route path="/finance/ar/customers/:id" component={CustomerDetails} />
                <Route path="/finance/ar/period-close" component={ArPeriodClose} />
                <Route path="/finance/ar/dunning" component={ArDunningWorkbench} />
                <Route path="/finance/ar/lockbox" component={LockboxWorkbench} />
                <Route path="/finance/ar/revenue-schedules" component={ArRevenueWorkbench} />
                <Route path="/finance/ar/revenue" component={ArRevenueWorkbench} />
                <Route path="/finance/ar/collections" component={CollectionsWorkbench} />
                <Route path="/finance/ar/profile-classes" component={CustomerProfileClasses} />
                <Route path="/finance/ic/disputes" component={ICDisputeWorkbench} />
                <Route path="/finance/intercompany/netting-settlement" component={NettingSettlementPayment} />
                <Route path="/intercompany/netting-settlement" component={NettingSettlementPayment} />

                <Route path="/finance/gl" component={GLDashboard} />
                <Route path="/finance/gl/journals/new" component={JournalEntry} />
                <Route path="/finance/gl/journals/wizard" component={JournalWizard} />
                <Route path="/finance/gl/journals/approvals" component={JournalApprovalHub} />
                <Route path="/finance/gl/config/posting-rules" component={PostingRulesManager} />
                <Route path="/finance/gl/config/validations" component={ValidationControls} />
                <Route path="/finance/gl/journals" component={JournalEntries} />
                <Route path="/finance/gl/imports" component={JournalImport} />
                <Route path="/finance/gl/reports/builder" component={FSGBuilder} />
                <Route path="/finance/gl/reports" component={FinancialReports} />
                <Route path="/finance/gl/reports/account-analysis" component={AccountAnalysisReport} />
                <Route path="/finance/gl/inquiry" component={GLInquiry} />
                <Route path="/finance/gl/inquiry/balance-cube" component={BalanceCubeInquiry} />
                <Route path="/finance/gl/audit" component={AuditLogsPage} />
                <Route path="/finance/gl/period-close" component={CloseDashboard} />
                <Route path="/finance/gl/budgets" component={BudgetManager} />
                <Route path="/finance/gl/allocations" component={GLAllocations} />
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
                <Route path="/finance/sla" component={SLADashboard} />
                <Route path="/finance/sla/dashboard" component={SLADashboard} />
                <Route path="/finance/sla/manual-entry" component={ManualJournalEntry} />
                <Route path="/finance/sla/reconciliation" component={SlaReconciliation} />
                <Route path="/finance/gl/config/translation" component={TranslationRules} />
                <Route path="/finance/gl/config/sources" component={SourceCategorySetup} />
                <Route path="/finance/gl/config/rate-types" component={GLRateTypes} />
                <Route path="/finance/gl/config/statistical-ledgers" component={StatisticalLedgerSetup} />

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
                <Route path="/finance/epm/smartview" component={SmartViewIntegration} />
                <Route path="/finance/epm/esg" component={ESGReporting} />
                <Route path="/finance/epm/esg/supplier-surveys" component={SupplierEmissionSurveys} />
                <Route path="/finance/epm/esg/public-dashboard" component={SustainabilityPublicDashboard} />

                <Route path="/finance/gl/consolidation/rules" component={EliminationRuleBuilder} />
                <Route path="/finance/gl/consolidation/results/:runId">{(params: { runId: string }) => <ConsolidationResultsViewer />}</Route>
                <Route path="/finance/gl/consolidation/journals" component={EliminationJournalReview} />
                <Route path="/finance/gl/consolidation/elimination-rules" component={EliminationRules} />

                {/* Intercompany Module */}
                <Route path="/finance/intercompany" component={ICDashboard} />
                <Route path="/finance/intercompany/workbench" component={IntercompanyWorkbench} />
                <Route path="/finance/intercompany/netting" component={NettingWorkbench} />
                <Route path="/finance/intercompany/allocations" component={AllocationsWorkbench} />
                <Route path="/finance/intercompany/reconciliation" component={IntercompanyReconciliation} />
                <Route path="/finance/intercompany/data-access" component={ICDataAccessManager} />

                <Route path="/finance/tax" component={TaxDashboard} />
                <Route path="/finance/tax/management" component={TaxManagement} />
                <Route path="/finance/tax/regimes" component={TaxRegimeSetup} />
                <Route path="/finance/tax/determining-factors" component={TaxDeterminingFactors} />
                <Route path="/finance/tax/supplier-trn" component={SupplierTRNValidator} />
                <Route path="/finance/expense-management" component={ExpenseDashboard} />
                <Route path="/finance/expenses/cash-advances" component={CashAdvanceReconciliation} />
                <Route path="/finance/expenses/audit-rules" component={ExpenseAuditRuleSets} />
                <Route path="/finance/expenses/payroll-reimbursement" component={ExpensePayrollReimbursement} />
                <Route path="/finance/expenses/per-diem-rates" component={PerDiemRateTable} />
                <Route path="/finance/expenses/new-report" component={ExpenseReportEntry} />
                <Route path="/finance/expenses/approvals" component={ExpenseApprovalWorkbench} />
                {/* Legacy redirects for old /expenses/* paths */}
                <Route path="/expenses/cash-advances" component={CashAdvanceReconciliation} />
                <Route path="/expenses/audit-rules" component={ExpenseAuditRuleSets} />
                <Route path="/expenses/payroll-reimbursement" component={ExpensePayrollReimbursement} />
                <Route path="/expenses/per-diem-rates" component={PerDiemRateTable} />
                <Route path="/expenses/new-report" component={ExpenseReportEntry} />
                <Route path="/expenses/approvals" component={ExpenseApprovalWorkbench} />
                <Route path="/finance/ap/config/distribution-sets" component={DistributionSetTemplates} />
                <Route path="/finance/ap/config/match-tolerances" component={FourWayMatchConfig} />
                <Route path="/finance/fixed-assets/mass-change" component={FaMassChange} />
                <Route path="/fixed-assets/mass-change" component={FaMassChange} />
                <Route path="/finance/fixed-assets/what-if" component={FaWhatIfAnalysis} />
                <Route path="/fixed-assets/what-if" component={FaWhatIfAnalysis} />
                <Route path="/finance/fixed-assets/add-asset" component={FaAssetAdditionWizard} />
                <Route path="/fixed-assets/add-asset" component={FaAssetAdditionWizard} />
                <Route path="/finance/fixed-assets/depreciation-projection" component={FaDepreciationProjection} />
                <Route path="/fixed-assets/depreciation-projection" component={FaDepreciationProjection} />
                <Route path="/finance/tax/vat-return" component={VatReturnWizard} />
                <Route path="/finance/tax/subscriptions" component={TaxSubscriptionSetup} />
                <Route path="/finance/tax/exemptions" component={TaxExemptionSetup} />
                <Route path="/finance/cash/bank-accounts" component={BankAccountSetup} />
                <Route path="/finance/cash/match-rules" component={BankStatementMatchRules} />
                <Route path="/finance/ar/statements" component={ArStatementPrint} />
                <Route path="/finance/ar/lockbox-setup" component={ArLockboxSetup} />
                <Route path="/finance/gl/encumbrance-types" component={GlEncumbranceSetup} />
                <Route path="/finance/gl/encumbrance-types" component={GlEncumbranceSetup} />
                <Route path="/finance/gl/secondary-ledgers" component={GlSecondaryLedgerSetup} />
                <Route path="/finance/gl/secondary-ledgers" component={GlSecondaryLedgerSetup} />
                <Route path="/finance/leases/subleases" component={SubleaseManagement} />
                <Route path="/leases/subleases" component={SubleaseManagement} />
                <Route path="/finance/ap/positive-pay" component={APPositivePayConfig} />
                <Route path="/finance/fixed-assets/mass-additions" component={FaMassAdditions} />
                <Route path="/fixed-assets/mass-additions" component={FaMassAdditions} />
                <Route path="/finance/fixed-assets/group-assets" component={FaGroupAssets} />
                <Route path="/fixed-assets/group-assets" component={FaGroupAssets} />
                <Route path="/finance/fixed-assets/impairment" component={FaImpairmentTesting} />
                <Route path="/fixed-assets/impairment" component={FaImpairmentTesting} />
                <Route path="/finance/ar/remittance-batches" component={ArRemittanceBatch} />
                <Route path="/finance/ar/customer-hierarchy" component={ArCustomerHierarchy} />
                <Route path="/finance/cash/camt-import" component={CamtImport} />
                <Route path="/finance/leases/initial-direct-costs" component={LeaseInitialDirectCosts} />
                <Route path="/leases/initial-direct-costs" component={LeaseInitialDirectCosts} />


                <Route path="/finance/ap/settings">
                    <ProtectedRoute>
                        <ApSettings />
                    </ProtectedRoute>
                </Route>

                {/* Revenue Management */}
                <Route path="/finance/revenue" component={() => {
                    const [, setLocation] = useLocation();
                    useEffect(() => setLocation("/finance/revenue/intelligence"), [setLocation]);
                    return null;
                }} />
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
                <Route path="/finance/leases/approval-chains" component={LeaseApprovalChainConfig} />
                <Route path="/finance/leases/reports/disclosure" component={LeaseDisclosureReport} />
                <Route path="/finance/leases/:id" component={LeaseDetailPage} />
                <Route path="/finance/leases/:id/schedules">{(params: { id: string }) => <LeaseSchedulesView leaseId={params.id} />}</Route>
                <Route path="/finance/leases/:id/modify">{(params: { id: string }) => <LeaseModificationWizard leaseId={params.id} />}</Route>

                <Route path="/finance/contracts/:id" component={ContractDetailView} />

                {/* Module Overview & Catch-all */}
                <Route path="/finance-module" component={Finance} />
                <Route path="/finance/:page?" component={Finance} />
                <Route component={GenericModuleDashboard} />
            </Switch>
        </ModuleLayout>
    );
}
