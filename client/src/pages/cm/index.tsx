import { Wallet, AlertCircle, TrendingUp, FileWarning } from 'lucide-react';
import React, { useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import CashGrid from '@/components/cm/CashGrid';
import BankAccountSideSheet from '@/components/cm/BankAccountSideSheet';
import StatementLineSideSheet from '@/components/cm/StatementLineSideSheet';
import ReconciliationDetailSideSheet from '@/components/cm/ReconciliationDetailSideSheet';
import CashTransactionSideSheet from '@/components/cm/CashTransactionSideSheet';
import ImportStatementDialog from '@/components/cm/ImportStatementDialog';
import { CashForecastWidget } from '@/components/cash/CashForecastWidget';

export default function CashManagementDashboard() {
    const [bankAccountOpen, setBankAccountOpen] = useState(false);
    const [statementOpen, setStatementOpen] = useState(false);
    const [reconciliationOpen, setReconciliationOpen] = useState(false);
    const [transactionOpen, setTransactionOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const sampleAccount = {
        id: 'acc1',
        name: 'Main Business Account',
        iban: 'GB33BUKB20201555555555',
        swiftCode: 'BUKBGB22',
        balance: 1250000,
    };
    const sampleStatement = {
        id: 'stmt1',
        date: '2026-01-10',
        description: 'Cash Sale',
        amount: 20000,
        balance: 520000,
    };
    const sampleReconciliation = {
        id: 'rec1',
        date: '2026-01-12',
        description: 'Bank Reconciliation',
        status: 'Pending',
        matchedLines: 5,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Bank Balances" value="$1,250,000" icon={Wallet} />
                <MetricCard title="Unreconciled Items" value="12" icon={AlertCircle} />
                <MetricCard title="Cash Position Today" value="$850,000" icon={TrendingUp} />
                <MetricCard title="Statement Exceptions" value="3" icon={FileWarning} />
            </div>
            {/* Forecast Widget */}
            <div className="grid grid-cols-1 gap-4">
                <CashForecastWidget />
            </div>

            {/* Premium Grid for cash transactions */}
            <CashGrid
                accountId={sampleAccount.id}
                onAddTransaction={() => {
                    setSelectedTransaction(null);
                    setTransactionOpen(true);
                }}
                onEditTransaction={(txn: any) => {
                    setSelectedTransaction(txn);
                    setTransactionOpen(true);
                }}
                onImportStatement={() => setImportOpen(true)}
            />
            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setBankAccountOpen(true)}
                >
                    View Bank Account
                </button>
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => setStatementOpen(true)}
                >
                    View Statement Line
                </button>
                <button
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    onClick={() => setReconciliationOpen(true)}
                >
                    View Reconciliation Detail
                </button>
            </div>
            {/* Side Sheets */}
            <BankAccountSideSheet open={bankAccountOpen} account={sampleAccount} onClose={() => setBankAccountOpen(false)} />
            <StatementLineSideSheet open={statementOpen} line={sampleStatement} onClose={() => setStatementOpen(false)} />
            <ReconciliationDetailSideSheet open={reconciliationOpen} detail={sampleReconciliation} onClose={() => setReconciliationOpen(false)} />
            <CashTransactionSideSheet
                open={transactionOpen}
                accountId={sampleAccount.id}
                transaction={selectedTransaction}
                onClose={() => {
                    setTransactionOpen(false);
                    setSelectedTransaction(null);
                }}
            />
            <ImportStatementDialog
                open={importOpen}
                accountId={sampleAccount.id}
                onClose={() => setImportOpen(false)}
            />
        </div>
    );
}
