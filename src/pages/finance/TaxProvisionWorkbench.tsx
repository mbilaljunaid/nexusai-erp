import React, { useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, TrendingUp, TrendingDown, FileCheck, RefreshCw } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Input } from "@/components/ui/input";

interface TaxProvision {
    id: string;
    entity_id: string;
    period_name: string;
    fiscal_year: number;
    pretax_income: number;
    taxable_income: number;
    current_tax_expense: number;
    net_deferred_tax: number;
    effective_tax_rate: number;
    standard: 'ASC740' | 'IAS12';
    status: 'Draft' | 'Reviewed' | 'Filed';
}

const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

async function computeProvision(params: any): Promise<any> {
    const res = await fetch('/api/finance/tax-provisions/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Computation failed');
    return res.json();
}

async function listProvisions(year: number): Promise<TaxProvision[]> {
    const res = await fetch(`/api/finance/tax-provisions?year=${year}`);
    if (!res.ok) throw new Error('Failed to load provisions');
    return res.json();
}

export default function TaxProvisionWorkbench() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [standard, setStandard] = useState<'ASC740' | 'IAS12'>('ASC740');
    const [form, setForm] = useState({
        entityId: '',
        periodName: '',
        pretaxIncome: '',
        permanentDiff: '',
        temporaryDiff: '',
        taxRate: '0.21',
        dta: '',
        dtl: '',
    });
    const [result, setResult] = useState<any>(null);
    const qc = useQueryClient();

    const { data: provisions = [] } = useQuery<any>({
        queryKey: ['tax-provisions', year],
        queryFn: () => listProvisions(year),
    });

    const computeMutation = useMutation({
        mutationFn: computeProvision,
        onSuccess: (data) => {
            setResult(data);
            qc.invalidateQueries({ queryKey: ['tax-provisions'] });
        },
    });

    const provisionColumns: SpreadsheetColumn<TaxProvision>[] = [
        { id: "entity_id", header: "Entity", width: "120px", cell: (row) => row.entity_id.slice(0, 8) },
        { id: "period_name", header: "Period", width: "120px", cell: (row) => row.period_name },
        { id: "pretax_income", header: "Pre-Tax Income", width: "150px", cell: (row) => fmtCurrency(row.pretax_income) },
        { id: "current_tax_expense", header: "Tax Expense", width: "150px", cell: (row) => fmtCurrency(row.current_tax_expense) },
        { id: "effective_tax_rate", header: "ETR", width: "100px", cell: (row) => fmtPct(row.effective_tax_rate) },
        { id: "standard", header: "Standard", width: "100px", cell: (row) => <span className="standard-tag">{row.standard}</span> },
        { id: "status", header: "Status", width: "120px", cell: (row) => <span className={`prov-status ${row.status.toLowerCase()}`}>{row.status}</span> }
    ];

    const handleCompute = useCallback(() => {
        computeMutation.mutate({
            entityId: form.entityId,
            periodName: form.periodName,
            fiscalYear: year,
            pretaxIncome: parseFloat(form.pretaxIncome) || 0,
            permanentDifferences: parseFloat(form.permanentDiff) || 0,
            temporaryDifferences: parseFloat(form.temporaryDiff) || 0,
            currentTaxRate: parseFloat(form.taxRate) || 0.21,
            deferredTaxAsset: parseFloat(form.dta) || 0,
            deferredTaxLiability: parseFloat(form.dtl) || 0,
            standard,
        });
    }, [form, year, standard, computeMutation]);

    const inputField = (label: string, key: keyof typeof form, placeholder = '0.00') => (
        <div className="tax-field">
            <label className="tax-label" htmlFor={`tax-${key}`}>{label}</label>
            <Input
                id={`tax-${key}`}
                type="number"
                step="any"
                className="tax-input"
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            />
        </div>
    );

    return (
        <StandardPage
            title="Tax Provision Workbench"
            description="ASC 740 / IAS 12 current & deferred tax computation"
            actions={
                <div className="tax-controls">
                    <Select value={String(year)} onValueChange={val => setYear(Number(val))}>
                        <SelectTrigger className="tax-select" aria-label="Fiscal year">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="standard-toggle">
                        {(['ASC740', 'IAS12'] as const).map(s => (
                            <button
                                key={s}
                                className={`std-btn ${standard === s ? 'active' : ''}`}
                                onClick={() => setStandard(s)}
                                aria-pressed={standard === s}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <div className="tax-layout">
                {/* Input Form */}
                <div className="tax-form-card">
                    <h2 className="card-title">Provision Inputs</h2>
                    {inputField('Entity ID', 'entityId', 'Entity UUID')}
                    {inputField('Period', 'periodName', 'e.g. Jan-2026')}
                    {inputField('Pre-Tax Income', 'pretaxIncome', '1,000,000')}
                    {inputField('Permanent Differences', 'permanentDiff', '0')}
                    {inputField('Temporary Differences', 'temporaryDiff', '0')}
                    {inputField('Statutory Tax Rate (decimal)', 'taxRate', '0.21')}
                    <hr className="tax-divider" />
                    <h3 className="section-title">Deferred Tax</h3>
                    {inputField('Deferred Tax Asset (DTA)', 'dta', '0')}
                    {inputField('Deferred Tax Liability (DTL)', 'dtl', '0')}

                    <button
                        className="compute-btn"
                        onClick={handleCompute}
                        disabled={computeMutation.isPending}
                        aria-label="Compute tax provision"
                    >
                        <Calculator size={16} />
                        {computeMutation.isPending ? 'Computing…' : 'Compute Provision'}
                    </button>
                </div>

                {/* Result Panel */}
                <div className="tax-result-panel">
                    {result ? (
                        <>
                            <h2 className="card-title">Provision Result</h2>
                            <div className="result-kpis">
                                <MetricCard label="Taxable Income" value={fmtCurrency(result.taxableIncome)} icon={<Calculator size={20} />} color="#1d4ed8" />
                                <MetricCard label="Current Tax Expense" value={fmtCurrency(result.currentTaxExpense)} icon={<TrendingUp size={20} />} color="#dc2626" />
                                <MetricCard label="Net Deferred Tax" value={fmtCurrency(result.netDeferredTax)} icon={result.netDeferredTax >= 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />} color={result.netDeferredTax >= 0 ? '#059669' : '#dc2626'} />
                                <MetricCard label="Total Tax Expense" value={fmtCurrency(result.totalTaxExpense)} icon={<FileCheck size={20} />} color="#7c3aed" />
                                <MetricCard label="Effective Tax Rate" value={result.effectiveTaxRate} icon={<TrendingUp size={20} />} color="#d97706" />
                            </div>
                            <div className="result-waterfall">
                                <div className="waterfall-row">
                                    <span>Pre-Tax Income</span>
                                    <span>{fmtCurrency(parseFloat(form.pretaxIncome) || 0)}</span>
                                </div>
                                <div className="waterfall-row adj">
                                    <span>+ Permanent Differences</span>
                                    <span>{fmtCurrency(parseFloat(form.permanentDiff) || 0)}</span>
                                </div>
                                <div className="waterfall-row adj">
                                    <span>+ Temporary Differences</span>
                                    <span>{fmtCurrency(parseFloat(form.temporaryDiff) || 0)}</span>
                                </div>
                                <div className="waterfall-row total">
                                    <span>= Taxable Income</span>
                                    <span>{fmtCurrency(result.taxableIncome)}</span>
                                </div>
                                <div className="waterfall-row adj">
                                    <span>× Tax Rate ({fmtPct(parseFloat(form.taxRate))})</span>
                                    <span>{fmtCurrency(result.currentTaxExpense)}</span>
                                </div>
                                <div className="waterfall-row adj">
                                    <span>± Net Deferred Tax (DTA - DTL)</span>
                                    <span>{fmtCurrency(result.netDeferredTax)}</span>
                                </div>
                                <div className="waterfall-row grand-total">
                                    <span>= Total Tax Expense (ASC 740)</span>
                                    <span>{fmtCurrency(result.totalTaxExpense)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-result">
                            <Calculator size={48} color="#d1d5db" />
                            <p>Enter inputs and click <strong>Compute Provision</strong> to see results</p>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table */}
            {provisions.length > 0 && (
                <div className="provision-history">
                    <h2 className="card-title">Provision History — FY {year}</h2>
                    <div className="border rounded-lg overflow-hidden h-[300px]">
                        <InteractiveSpreadsheet
                            columns={provisionColumns}
                            data={provisions}
                            onChange={() => { }}
                            containerHeight="100%"
                        />
                    </div>
                </div>
            )}

            <style>{`
                .tax-provision-workbench { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .tax-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .tax-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .tax-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .tax-controls { display: flex; gap: 12px; align-items: center; }
                .tax-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
                .standard-toggle { display: flex; background: #f3f4f6; border-radius: 8px; padding: 2px; }
                .std-btn { padding: 6px 14px; border: none; background: transparent; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; color: #6b7280; transition: all 0.2s; }
                .std-btn.active { background: #fff; color: #1d4ed8; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .tax-layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px; margin-bottom: 24px; }
                .tax-form-card, .tax-result-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
                .card-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 20px; }
                .tax-field { margin-bottom: 16px; }
                .tax-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
                .tax-input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
                .tax-input:focus { outline: none; border-color: #1d4ed8; box-shadow: 0 0 0 2px rgba(29,78,216,0.1); }
                .tax-divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
                .section-title { font-size: 13px; font-weight: 600; color: #6b7280; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em; }
                .compute-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; transition: opacity 0.2s; }
                .compute-btn:hover { opacity: 0.9; }
                .compute-btn:disabled { background: #9ca3af; cursor: not-allowed; }
                .result-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
                .result-waterfall { background: #f9fafb; border-radius: 10px; padding: 16px; }
                .waterfall-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
                .waterfall-row:last-child { border-bottom: none; }
                .waterfall-row.adj { color: #6b7280; }
                .waterfall-row.total { font-weight: 600; color: #111827; }
                .waterfall-row.grand-total { font-weight: 800; color: #1d4ed8; font-size: 15px; margin-top: 4px; }
                .empty-result { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 16px; color: #9ca3af; text-align: center; }
                .provision-history { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
                .standard-tag { background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .prov-status { padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
                .prov-status.draft { background: #f3f4f6; color: #6b7280; }
                .prov-status.reviewed { background: #fef3c7; color: #d97706; }
                .prov-status.filed { background: #d1fae5; color: #059669; }
            `}</style>
        </StandardPage >
    );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
    return (
        <div className="metric-card" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="metric-icon" style={{ color }}>{icon}</div>
            <div className="metric-value" style={{ color }}>{value}</div>
            <div className="metric-label">{label}</div>
            <style>{`
                .metric-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
                .metric-icon { margin-bottom: 8px; }
                .metric-value { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
                .metric-label { font-size: 11px; color: #6b7280; }
            `}</style>
        </div>
    );
}
