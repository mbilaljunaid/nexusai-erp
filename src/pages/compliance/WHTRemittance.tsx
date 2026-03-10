import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Globe, FileCheck, Download, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


interface WHTRule {
    id: string;
    country_code: string;
    income_type: string;
    rate: number;
    treaty_rate: number | null;
    threshold_amount: number;
    currency_code: string;
    effective_from: string;
}

interface WHTTransaction {
    id: string;
    supplier_id: string;
    country_code: string;
    income_type: string;
    gross_amount: number;
    wht_rate: number;
    wht_amount: number;
    net_amount: number;
    currency_code: string;
    period_name: string;
    remitted_at: string | null;
}

interface RemittanceBatch {
    id: string;
    country_code: string;
    period_name: string;
    total_wht: number;
    currency_code: string;
    status: string;
    due_date: string | null;
}

const INCOME_TYPES = ['Dividend', 'Interest', 'Royalty', 'Services', 'Other'];
const fmtCcy = (n: number, ccy = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 2 }).format(n);
const fmtPct = (n: number) => `${(Number(n) * 100).toFixed(2)}%`;

async function fetchRules(country?: string): Promise<WHTRule[]> {
    const q = country ? `?countryCode=${country}` : '';
    const res = await fetch(`/api/compliance/wht/rules${q}`);
    return res.json();
}
async function fetchBatches(): Promise<RemittanceBatch[]> {
    const res = await fetch('/api/compliance/wht/batches');
    return res.json();
}

export default function WHTRemittance() {
    const [period, setPeriod] = useState(() => {
        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const d = new Date();
        return `${m[d.getMonth()]}-${d.getFullYear()}`;
    });
    const [country, setCountry] = useState('');
    const [activeTab, setActiveTab] = useState<'rules' | 'transactions' | 'batches'>('transactions');
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [ruleForm, setRuleForm] = useState({
        countryCode: '', incomeType: 'Dividend', rate: '0.15', treatyRate: '', thresholdAmount: '0',
        currencyCode: 'USD', effectiveFrom: new Date().toISOString().slice(0, 10),
    });

    const qc = useQueryClient();
    const { data: rules = [] } = useQuery<any>({ queryKey: ['wht-rules', country], queryFn: () => fetchRules(country || undefined) });
    const { data: batches = [] } = useQuery<any>({ queryKey: ['wht-batches'], queryFn: fetchBatches });

    const { data: transactions = [] } = useQuery<WHTTransaction[]>({
        queryKey: ['wht-txns', period, country],
        queryFn: async () => {
            const q = new URLSearchParams({ period, ...(country && { countryCode: country }) });
            const res = await fetch(`/api/compliance/wht/transactions?${q}`);
            return res.json();
        },
    });

    const createRuleMutation = useMutation({
        mutationFn: (data: any) =>
            fetch('/api/compliance/wht/rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['wht-rules'] }); setShowRuleForm(false); },
    });

    const createBatchMutation = useMutation({
        mutationFn: (data: any) =>
            fetch('/api/compliance/wht/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['wht-batches'] }),
    });

    const fileBatchMutation = useMutation({
        mutationFn: ({ id, ref }: { id: string; ref: string }) =>
            fetch(`/api/compliance/wht/batches/${id}/file`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentRef: ref }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['wht-batches'] }),
    });

    const totalWHT = transactions.reduce((s, t) => s + Number(t.wht_amount), 0);
    const totalGross = transactions.reduce((s, t) => s + Number(t.gross_amount), 0);
    const remitted = transactions.filter(t => t.remitted_at).length;

    const transactionColumns: SpreadsheetColumn<WHTTransaction>[] = [
        { id: "supplier", header: "Supplier", width: "150px", cell: (t) => <span className="mono">{t.supplier_id.slice(0, 10)}…</span> },
        { id: "country", header: "Country", width: "80px", cell: (t) => <span className="country-badge">{t.country_code}</span> },
        { id: "type", header: "Type", width: "120px", cell: (t) => t.income_type },
        { id: "gross", header: "Gross", width: "120px", cell: (t) => <span className="amount">{fmtCcy(t.gross_amount, t.currency_code)}</span> },
        { id: "rate", header: "Rate", width: "80px", cell: (t) => <span className="rate">{fmtPct(t.wht_rate)}</span> },
        { id: "wht", header: "WHT", width: "120px", cell: (t) => <span className="amount red">{fmtCcy(t.wht_amount, t.currency_code)}</span> },
        { id: "net", header: "Net", width: "120px", cell: (t) => <span className="amount">{fmtCcy(t.net_amount, t.currency_code)}</span> },
        { id: "remitted", header: "Remitted", width: "120px", cell: (t) => t.remitted_at ? <span className="remitted-badge">✓ {formatDate(t.remitted_at)}</span> : <span className="pending-badge">Pending</span> }
    ];

    const ruleColumns: SpreadsheetColumn<WHTRule>[] = [
        { id: "country", header: "Country", width: "100px", cell: (r) => <span className="country-badge">{r.country_code}</span> },
        { id: "type", header: "Income Type", width: "150px", cell: (r) => r.income_type },
        { id: "stdRate", header: "Standard Rate", width: "120px", cell: (r) => <span className="rate">{fmtPct(r.rate)}</span> },
        { id: "treatyRate", header: "Treaty Rate", width: "120px", cell: (r) => <span className="rate">{r.treaty_rate ? fmtPct(r.treaty_rate) : <span className="na">N/A</span>}</span> },
        { id: "threshold", header: "Threshold", width: "150px", cell: (r) => fmtCcy(r.threshold_amount, r.currency_code) },
        { id: "effective", header: "Effective From", width: "150px", cell: (r) => r.effective_from }
    ];

    const batchColumns: SpreadsheetColumn<RemittanceBatch>[] = [
        { id: "period", header: "Period", width: "150px", cell: (b) => b.period_name },
        { id: "country", header: "Country", width: "100px", cell: (b) => <span className="country-badge">{b.country_code}</span> },
        { id: "totalWHT", header: "Total WHT", width: "150px", cell: (b) => <span className="amount red">{fmtCcy(b.total_wht, b.currency_code)}</span> },
        { id: "dueDate", header: "Due Date", width: "150px", cell: (b) => b.due_date ?? '—' },
        { id: "status", header: "Status", width: "120px", cell: (b) => <span className={cn(`batch-status ${b.status.toLowerCase()}`)}>{b.status}</span> },
        {
            id: "actions", header: "Actions", width: "120px", cell: (b) => b.status === 'Pending' ? (
                <Button variant="default"
                    className="file-btn"
                    onClick={() => fileBatchMutation.mutate({ id: b.id, ref: `REF-${b.id.slice(0, 8).toUpperCase()}` })}
                    disabled={fileBatchMutation.isPending}
                    aria-label={`File remittance batch for ${b.period_name}`}
                >
                    <FileCheck className="h-[13px] w-[13px]"  /> File
                </Button>
            ) : null
        }
    ];

    return (
        <StandardPage title="WHT Remittance Workbench">
            <div className="wht-header">
                <div>

                    <p className="wht-subtitle">Withholding tax calculation, statutory XML generation & batch remittance filing</p>
                </div>
                <div className="wht-controls">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="wht-select" aria-label="Select period">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m =>
                                <SelectItem key={m} value={`${m}-2026`}>{m}-2026</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <Input
                        className="wht-select"
                        placeholder="Country (e.g. IN)"
                        value={country}
                        onChange={e => setCountry(e.target.value.toUpperCase())}
                        maxLength={2}
                        aria-label="Country code filter"
                    />
                </div>
            </div>

            {/* KPIs */}
            <div className="wht-kpis">
                <WKpi label="Total Gross Payments" value={fmtCcy(totalGross)} color="#1d4ed8" icon={<DollarSign className="h-[18px] w-[18px]"  />} />
                <WKpi label="WHT Withheld" value={fmtCcy(totalWHT)} color="#dc2626" icon={<Globe className="h-[18px] w-[18px]"  />} />
                <WKpi label="Effective Rate" value={totalGross > 0 ? fmtPct(totalWHT / totalGross) : '0.00%'} color="#d97706" icon={<FileCheck className="h-[18px] w-[18px]"  />} />
                <WKpi label="Remitted" value={`${remitted} / ${transactions.length}`} color="#059669" icon={<FileCheck className="h-[18px] w-[18px]"  />} />
            </div>

            {/* Tabs */}
            <div className="wht-tabs">
                {(['transactions', 'rules', 'batches'] as const).map(t => (
                    <Button variant="default" key={t} className={cn(`wht-tab ${activeTab === t ? 'active' : ''}`)} onClick={() => setActiveTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                ))}
            </div>

            {activeTab === 'transactions' && (
                <div className="wht-card">
                    <div className="card-header-row">
                        <h2 className="card-title">WHT Transactions — {period}</h2>
                        <Button variant="default"
                            className="batch-btn"
                            onClick={() => createBatchMutation.mutate({ periodName: period, countryCode: country || 'ALL' })}
                            disabled={transactions.length === 0}
                            aria-label="Create remittance batch"
                        >
                            Create Remittance Batch
                        </Button>
                    </div>
                    <div className="h-[400px] w-full">
                        <InteractiveSpreadsheet
                            columns={transactionColumns}
                            data={transactions}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="wht-card">
                    <div className="card-header-row">
                        <h2 className="card-title">WHT Rules</h2>
                        <Button variant="default" className="add-rule-btn" onClick={() => setShowRuleForm(v => !v)} aria-label="Add WHT rule">
                            <PlusCircle className="h-3.5 w-3.5"  /> Add Rule
                        </Button>
                    </div>
                    {showRuleForm && (
                        <div className="rule-form">
                            {(['countryCode', 'rate', 'treatyRate', 'thresholdAmount', 'effectiveFrom'] as const).map(f => (
                                <div key={f} className="rule-field">
                                    <Label className="rule-label" htmlFor={`wht-${f}`}>{f.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                    <Input id={`wht-${f}`} className="rule-input" value={ruleForm[f]} onChange={e => setRuleForm(p => ({ ...p, [f]: e.target.value }))} />
                                </div>
                            ))}
                            <div className="rule-field">
                                <Label className="rule-label" htmlFor="wht-incomeType">Income Type</Label>
                                <Select value={ruleForm.incomeType} onValueChange={v => setRuleForm(p => ({ ...p, incomeType: v }))}>
                                    <SelectTrigger id="wht-incomeType" className="rule-input">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INCOME_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="default"
                                className="save-rule-btn"
                                onClick={() => createRuleMutation.mutate({
                                    ...ruleForm, rate: parseFloat(ruleForm.rate),
                                    treatyRate: ruleForm.treatyRate ? parseFloat(ruleForm.treatyRate) : undefined,
                                    thresholdAmount: parseFloat(ruleForm.thresholdAmount) || 0,
                                })}
                                disabled={createRuleMutation.isPending}
                                aria-label="Save WHT rule"
                            >
                                {createRuleMutation.isPending ? 'Saving…' : 'Save Rule'}
                            </Button>
                        </div>
                    )}
                    <div className="h-[400px] w-full">
                        <InteractiveSpreadsheet
                            columns={ruleColumns}
                            data={rules}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'batches' && (
                <div className="wht-card">
                    <h2 className="card-title">Remittance Batches</h2>
                    <div className="h-[400px] w-full">
                        <InteractiveSpreadsheet
                            columns={batchColumns}
                            data={batches}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                    </div>
                </div>
            )}

            <style>{`
                .wht-workbench { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .wht-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .wht-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .wht-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .wht-controls { display: flex; gap: 10px; }
                .wht-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; min-width: 130px; }
                .wht-kpis { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                .wht-tabs { display: flex; gap: 2px; background: #f3f4f6; border-radius: 10px; padding: 3px; margin-bottom: 16px; width: fit-content; }
                .wht-tab { padding: 8px 20px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; background: transparent; color: #6b7280; transition: all 0.2s; }
                .wht-tab.active { background: #fff; color: #1d4ed8; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
                .wht-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
                .card-header-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
                .card-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0; }
                .wht-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .wht-table th { padding: 10px 16px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
                .wht-row:hover { background: #f9fafb; }
                .wht-table td { padding: 10px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .mono { font-family: monospace; font-size: 12px; color: #6b7280; }
                .country-badge { background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
                .amount { font-variant-numeric: tabular-nums; font-family: monospace; }
                .amount.red { color: #dc2626; }
                .rate { font-family: monospace; color: #7c3aed; }
                .na { color: #9ca3af; font-style: italic; }
                .remitted-badge { background: #d1fae5; color: #059669; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .pending-badge { background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .batch-status { padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
                .batch-status.pending { background: #fef3c7; color: #d97706; }
                .batch-status.filed { background: #d1fae5; color: #059669; }
                .batch-status.paid { background: #dbeafe; color: #1d4ed8; }
                .empty-cell { text-align: center; padding: 40px; color: #9ca3af; }
                .batch-btn { padding: 7px 16px; background: #7c3aed; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .batch-btn:disabled { background: #d1d5db; }
                .add-rule-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: #f0f9ff; border: 1px solid #bfdbfe; color: #1d4ed8; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .file-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; background: #059669; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
                .rule-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
                .rule-field { display: flex; flex-direction: column; gap: 4px; }
                .rule-label { font-size: 11px; font-weight: 600; color: #374151; text-transform: capitalize; }
                .rule-input { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
                .save-rule-btn { grid-column: 3; padding: 8px 16px; background: #059669; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; align-self: end; }
            `}</style>
        </StandardPage>
    );
}

function WKpi({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', border: `1px solid #e5e7eb`, borderLeft: `4px solid ${color}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 }}>
            <div style={{ color }}>{icon}</div>
            <div>
                <div className="text-[20px] font-extrabold" style={{color}}>{value}</div>
                <div className="text-[11px] text-muted-foreground mt-[2px]">{label}</div>
            </div>
        </div>
    );
}
