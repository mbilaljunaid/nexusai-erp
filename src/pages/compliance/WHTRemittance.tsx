import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Globe, FileCheck, Download, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
    const { data: rules = [] } = useQuery({ queryKey: ['wht-rules', country], queryFn: () => fetchRules(country || undefined) });
    const { data: batches = [] } = useQuery({ queryKey: ['wht-batches'], queryFn: fetchBatches });

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

    return (
        <div className="wht-workbench">
            <div className="wht-header">
                <div>
                    <h1 className="wht-title">WHT Remittance Workbench</h1>
                    <p className="wht-subtitle">Withholding tax calculation, statutory XML generation & batch remittance filing</p>
                </div>
                <div className="wht-controls">
                    <select className="wht-select" value={period} onChange={e => setPeriod(e.target.value)} aria-label="Select period">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m =>
                            <option key={m} value={`${m}-2026`}>{m}-2026</option>
                        )}
                    </select>
                    <input
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
                <WKpi label="Total Gross Payments" value={fmtCcy(totalGross)} color="#1d4ed8" icon={<DollarSign size={18} />} />
                <WKpi label="WHT Withheld" value={fmtCcy(totalWHT)} color="#dc2626" icon={<Globe size={18} />} />
                <WKpi label="Effective Rate" value={totalGross > 0 ? fmtPct(totalWHT / totalGross) : '0.00%'} color="#d97706" icon={<FileCheck size={18} />} />
                <WKpi label="Remitted" value={`${remitted} / ${transactions.length}`} color="#059669" icon={<FileCheck size={18} />} />
            </div>

            {/* Tabs */}
            <div className="wht-tabs">
                {(['transactions', 'rules', 'batches'] as const).map(t => (
                    <button key={t} className={`wht-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'transactions' && (
                <div className="wht-card">
                    <div className="card-header-row">
                        <h2 className="card-title">WHT Transactions — {period}</h2>
                        <button
                            className="batch-btn"
                            onClick={() => createBatchMutation.mutate({ periodName: period, countryCode: country || 'ALL' })}
                            disabled={transactions.length === 0}
                            aria-label="Create remittance batch"
                        >
                            Create Remittance Batch
                        </button>
                    </div>
                    <table className="wht-table">
                        <thead>
                            <tr>
                                <th>Supplier</th><th>Country</th><th>Type</th>
                                <th>Gross</th><th>Rate</th><th>WHT</th><th>Net</th><th>Remitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan={8} className="empty-cell">No WHT transactions for this period</td></tr>
                            ) : transactions.map(t => (
                                <tr key={t.id} className="wht-row">
                                    <td className="mono">{t.supplier_id.slice(0, 10)}…</td>
                                    <td><span className="country-badge">{t.country_code}</span></td>
                                    <td>{t.income_type}</td>
                                    <td className="amount">{fmtCcy(t.gross_amount, t.currency_code)}</td>
                                    <td className="rate">{fmtPct(t.wht_rate)}</td>
                                    <td className="amount red">{fmtCcy(t.wht_amount, t.currency_code)}</td>
                                    <td className="amount">{fmtCcy(t.net_amount, t.currency_code)}</td>
                                    <td>
                                        {t.remitted_at
                                            ? <span className="remitted-badge">✓ {new Date(t.remitted_at).toLocaleDateString()}</span>
                                            : <span className="pending-badge">Pending</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="wht-card">
                    <div className="card-header-row">
                        <h2 className="card-title">WHT Rules</h2>
                        <button className="add-rule-btn" onClick={() => setShowRuleForm(v => !v)} aria-label="Add WHT rule">
                            <PlusCircle size={14} /> Add Rule
                        </button>
                    </div>
                    {showRuleForm && (
                        <div className="rule-form">
                            {(['countryCode', 'rate', 'treatyRate', 'thresholdAmount', 'effectiveFrom'] as const).map(f => (
                                <div key={f} className="rule-field">
                                    <label className="rule-label" htmlFor={`wht-${f}`}>{f.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <input id={`wht-${f}`} className="rule-input" value={ruleForm[f]} onChange={e => setRuleForm(p => ({ ...p, [f]: e.target.value }))} />
                                </div>
                            ))}
                            <div className="rule-field">
                                <label className="rule-label" htmlFor="wht-incomeType">Income Type</label>
                                <select id="wht-incomeType" className="rule-input" value={ruleForm.incomeType} onChange={e => setRuleForm(p => ({ ...p, incomeType: e.target.value }))}>
                                    {INCOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <button
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
                            </button>
                        </div>
                    )}
                    <table className="wht-table">
                        <thead>
                            <tr><th>Country</th><th>Income Type</th><th>Standard Rate</th><th>Treaty Rate</th><th>Threshold</th><th>Effective From</th></tr>
                        </thead>
                        <tbody>
                            {rules.map(r => (
                                <tr key={r.id} className="wht-row">
                                    <td><span className="country-badge">{r.country_code}</span></td>
                                    <td>{r.income_type}</td>
                                    <td className="rate">{fmtPct(r.rate)}</td>
                                    <td className="rate">{r.treaty_rate ? fmtPct(r.treaty_rate) : <span className="na">N/A</span>}</td>
                                    <td>{fmtCcy(r.threshold_amount, r.currency_code)}</td>
                                    <td>{r.effective_from}</td>
                                </tr>
                            ))}
                            {rules.length === 0 && <tr><td colSpan={6} className="empty-cell">No WHT rules configured</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'batches' && (
                <div className="wht-card">
                    <h2 className="card-title">Remittance Batches</h2>
                    <table className="wht-table">
                        <thead>
                            <tr><th>Period</th><th>Country</th><th>Total WHT</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {batches.map(b => (
                                <tr key={b.id} className="wht-row">
                                    <td>{b.period_name}</td>
                                    <td><span className="country-badge">{b.country_code}</span></td>
                                    <td className="amount red">{fmtCcy(b.total_wht, b.currency_code)}</td>
                                    <td>{b.due_date ?? '—'}</td>
                                    <td><span className={`batch-status ${b.status.toLowerCase()}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'Pending' && (
                                            <button
                                                className="file-btn"
                                                onClick={() => fileBatchMutation.mutate({ id: b.id, ref: `REF-${b.id.slice(0, 8).toUpperCase()}` })}
                                                disabled={fileBatchMutation.isPending}
                                                aria-label={`File remittance batch for ${b.period_name}`}
                                            >
                                                <FileCheck size={13} /> File
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {batches.length === 0 && <tr><td colSpan={6} className="empty-cell">No remittance batches yet</td></tr>}
                        </tbody>
                    </table>
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
        </div>
    );
}

function WKpi({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', border: `1px solid #e5e7eb`, borderLeft: `4px solid ${color}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 }}>
            <div style={{ color }}>{icon}</div>
            <div>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{label}</div>
            </div>
        </div>
    );
}
