import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Search, Plus, Save, Loader2, Trash2 } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from '@/components/ui/InteractiveSpreadsheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { StandardPage } from "@/components/layout/StandardPage";

interface Facility {
    id: string;
    facility_name: string;
    lender: string;
    facility_type: string;
    facility_amount: number;
    drawn_amount: number;
    currency_code: string;
    maturity_date: string;
    status: string;
    covenant_count: number;
    recent_breaches: number;
}

interface HedgeRel {
    id: string;
    hedge_id: string;
    hedge_type: string;
    accounting_std: string;
    hedging_instrument_desc: string;
    hedged_item_desc: string;
    notional_amount: number;
    currency_code: string;
    inception_date: string;
    maturity_date: string;
    status: string;
    last_effectiveness: boolean | null;
}

interface CovenantDue {
    id: string;
    metric_name: string;
    covenant_type: string;
    threshold_min: number;
    threshold_max: number;
    next_test_date: string;
    test_frequency: string;
    facility_name: string;
    lender: string;
}

const fmt = (n: number, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);
const pct = (drawn: number, total: number) => total > 0 ? Math.round((drawn / total) * 100) : 0;

export default function HedgeEffectiveness() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'hedges' | 'covenants' | 'debt'>('hedges');
    const [testForm, setTestForm] = useState({ hedgeRelId: '', testDate: new Date().toISOString().slice(0, 10), hedgingGainLoss: '', hedgedItemGainLoss: '' });
    const [testResult, setTestResult] = useState<any>(null);
    const [localHedges, setLocalHedges] = useState<any[]>([]);
    const qc = useQueryClient();

    const { data: hedges = [] } = useQuery<HedgeRel[]>({
        queryKey: ['hedge-rels'],
        queryFn: () => fetch('/api/treasury/hedge-relationships').then(r => r.json()),
    });

    const { data: facilities = [] } = useQuery<Facility[]>({
        queryKey: ['debt-facilities'],
        queryFn: () => fetch('/api/treasury/debt/facilities').then(r => r.json()),
    });

    const { data: dueCovs = [] } = useQuery<CovenantDue[]>({
        queryKey: ['covenants-due'],
        queryFn: () => fetch('/api/treasury/debt/covenants/due').then(r => r.json()),
    });

    const testMutation = useMutation({
        mutationFn: (data: any) =>
            fetch(`/api/treasury/hedge-relationships/${data.hedgeRelId}/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (res) => { setTestResult(res); qc.invalidateQueries({ queryKey: ['hedge-rels'] }); },
    });

    useEffect(() => {
        if (hedges) {
            setLocalHedges(hedges);
        }
    }, [hedges]);

    const saveMutation = useMutation({
        mutationFn: async (updatedHedges: any[]) => {
            for (const h of updatedHedges) {
                if (!h.id || String(h.id).startsWith('temp-')) {
                    await fetch('/api/treasury/hedge-relationships', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...h, id: undefined }) });
                } else {
                    await apiRequest('PATCH', `/api/treasury/hedge-relationships/${h.id}`, h).catch(() => { });
                }
            }

            const deletedIds = hedges.filter((c: any) => !updatedHedges.find((uc: any) => uc.id === c.id)).map((c: any) => c.id);
            for (const id of deletedIds) {
                await fetch(`/api/treasury/hedge-relationships/${id}`, { method: 'DELETE' }).catch(() => { });
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['hedge-rels'] });
            toast({ title: "Hedge relationships saved" });
        },
    });

    const totalNotional = hedges.reduce((s, h) => s + Number(h.notional_amount), 0);
    const effectiveCount = hedges.filter(h => h.last_effectiveness === true).length;
    const breachCount = facilities.reduce((s, f) => s + Number(f.recent_breaches), 0);

    const dueCovsnColumns: SpreadsheetColumn<any>[] = [
        { id: "facility", header: "Facility", width: "150px", cell: (row) => <span className="fw">{row.facility_name}</span> },
        { id: "lender", header: "Lender", width: "150px", cell: (row) => <span>{row.lender}</span> },
        { id: "covenant", header: "Covenant", width: "150px", cell: (row) => <span>{row.metric_name}</span> },
        { id: "type", header: "Type", width: "120px", cell: (row) => <span className="type-chip">{row.covenant_type}</span> },
        { id: "min", header: "Min", width: "100px", cell: (row) => <span className="mono">{row.threshold_min ?? '—'}</span> },
        { id: "max", header: "Max", width: "100px", cell: (row) => <span className="mono">{row.threshold_max ?? '—'}</span> },
        { id: "next_test", header: "Next Test", width: "120px", cell: (row) => <span className="mono red">{row.next_test_date}</span> },
        { id: "frequency", header: "Frequency", width: "120px", cell: (row) => <span className="freq-chip">{row.test_frequency}</span> }
    ];

    return (
        <StandardPage title="Treasury Risk & Compliance">
            <div className="he-header">
                <div>

                    <p className="he-sub">Hedge Effectiveness (IFRS 9/ASC 815) · Debt Covenant Monitoring</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="he-kpis">
                <HeKpi label="Total Hedges" value={String(hedges.length)} icon={<Shield size={18} />} colorClass="text-blue-700" borderClass="border-l-blue-700" />
                <HeKpi label="Effective" value={String(effectiveCount)} icon={<CheckCircle2 size={18} />} colorClass="text-emerald-600" borderClass="border-l-emerald-600" />
                <HeKpi label="Total Notional" value={fmt(totalNotional)} icon={<TrendingUp size={18} />} colorClass="text-purple-600" borderClass="border-l-purple-600" />
                <HeKpi label="Covenant Breaches (90d)" value={String(breachCount)} icon={<AlertTriangle size={18} />} colorClass={breachCount > 0 ? 'text-red-600' : 'text-emerald-600'} borderClass={breachCount > 0 ? 'border-l-red-600' : 'border-l-emerald-600'} />
            </div>

            {/* Tabs */}
            <div className="he-tabs">
                {(['hedges', 'covenants', 'debt'] as const).map(t => (
                    <button key={t} className={`he-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'hedges' && (
                <div className="panel">
                    <div className="panel-layout">
                        {/* Hedge Table */}
                        <div className="he-card flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="card-title m-0">Hedge Relationships</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setLocalHedges([...localHedges, { id: `temp-${Date.now()}`, hedge_id: '', hedge_type: 'Cash Flow', accounting_std: 'IFRS 9', notional_amount: 0, currency_code: 'USD', status: 'Draft', last_effectiveness: null }])}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Hedge
                                    </Button>
                                    <Button size="sm" onClick={() => saveMutation.mutate(localHedges)} disabled={saveMutation.isPending}>
                                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                            <div className="border rounded-md bg-white">
                                <InteractiveSpreadsheet
                                    data={localHedges}
                                    columns={[
                                        {
                                            id: "hedge_id",
                                            header: "Hedge ID",
                                            width: "120px",
                                            cell: (row, index, updateRow) => (
                                                <div onClick={() => setTestForm(p => ({ ...p, hedgeRelId: row.id }))} className="w-full h-full cursor-pointer">
                                                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-medium" placeholder="ID" value={row.hedge_id || ''} onChange={(e) => updateRow("hedge_id", e.target.value)} />
                                                </div>
                                            )
                                        },
                                        {
                                            id: "hedge_type",
                                            header: "Type",
                                            width: "150px",
                                            cell: (row, index, updateRow) => (
                                                <Select value={row.hedge_type || ''} onValueChange={(val) => updateRow("hedge_type", val)}>
                                                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Type" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Fair Value">Fair Value</SelectItem>
                                                        <SelectItem value="Cash Flow">Cash Flow</SelectItem>
                                                        <SelectItem value="Net Investment">Net Investment</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )
                                        },
                                        {
                                            id: "notional_amount",
                                            header: "Notional",
                                            width: "150px",
                                            cell: (row, index, updateRow) => (
                                                <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="0" value={row.notional_amount || ''} onChange={(e) => updateRow("notional_amount", e.target.value)} />
                                            )
                                        },
                                        {
                                            id: "currency_code",
                                            header: "CCY",
                                            width: "100px",
                                            cell: (row, index, updateRow) => (
                                                <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent uppercase" placeholder="USD" maxLength={3} value={row.currency_code || ''} onChange={(e) => updateRow("currency_code", e.target.value.toUpperCase())} />
                                            )
                                        },
                                        {
                                            id: "status",
                                            header: "Status",
                                            width: "150px",
                                            cell: (row, index, updateRow) => (
                                                <Select value={row.status || ''} onValueChange={(val) => updateRow("status", val)}>
                                                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Status" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Draft">Draft</SelectItem>
                                                        <SelectItem value="Designated">Designated</SelectItem>
                                                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )
                                        },
                                        {
                                            id: "last_effectiveness",
                                            header: "Effectiveness",
                                            width: "150px",
                                            cell: (row) => (
                                                <div className="flex items-center h-full px-3">
                                                    {row.last_effectiveness === null ? (
                                                        <span className="grey-chip">Not Tested</span>
                                                    ) : row.last_effectiveness ? (
                                                        <span className="eff-pass"><CheckCircle2 size={12} /> Effective</span>
                                                    ) : (
                                                        <span className="eff-fail"><TrendingDown size={12} /> Ineffective</span>
                                                    )}
                                                </div>
                                            )
                                        }
                                    ]}
                                    onChange={setLocalHedges}
                                />
                            </div>
                        </div>

                        {/* Effectiveness Test Form */}
                        <div className="test-panel">
                            <h3 className="card-title">Run Effectiveness Test</h3>
                            <p className="test-hint">Click a hedge row to select it</p>
                            <div className="tf">
                                <label className="tl">Hedge Rel ID</label>
                                <input className="ti" value={testForm.hedgeRelId} onChange={e => setTestForm(p => ({ ...p, hedgeRelId: e.target.value }))} placeholder="Select from table or enter ID" aria-label="Hedge Relationship ID" />
                            </div>
                            <div className="tf">
                                <label className="tl">Test Date</label>
                                <Input className="ti" type="date" value={testForm.testDate} onChange={e => setTestForm(p => ({ ...p, testDate: e.target.value }))} aria-label="Test date" />
                            </div>
                            <div className="tf">
                                <label className="tl">Hedging Instrument G/L</label>
                                <input className="ti" type="number" value={testForm.hedgingGainLoss} onChange={e => setTestForm(p => ({ ...p, hedgingGainLoss: e.target.value }))} placeholder="e.g. 125000" aria-label="Hedging instrument gain or loss" />
                            </div>
                            <div className="tf">
                                <label className="tl">Hedged Item G/L</label>
                                <input className="ti" type="number" value={testForm.hedgedItemGainLoss} onChange={e => setTestForm(p => ({ ...p, hedgedItemGainLoss: e.target.value }))} placeholder="e.g. -120000" aria-label="Hedged item gain or loss" />
                            </div>
                            <button
                                className="run-test-btn"
                                disabled={!testForm.hedgeRelId || testMutation.isPending}
                                onClick={() => testMutation.mutate({ ...testForm, hedgingGainLoss: parseFloat(testForm.hedgingGainLoss), hedgedItemGainLoss: parseFloat(testForm.hedgedItemGainLoss) })}
                                aria-label="Run effectiveness test"
                            >
                                {testMutation.isPending ? 'Testing…' : 'Run Test'}
                            </button>

                            {testResult && (
                                <div className={`test-result ${testResult.isHighlyEffective ? 'pass' : 'fail'}`}>
                                    <div className="tr-header">
                                        {testResult.isHighlyEffective ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                        {testResult.isHighlyEffective ? 'Highly Effective' : 'Ineffective — Hedge Discontinued'}
                                    </div>
                                    <div className="tr-rows">
                                        <div className="tr-row"><span>Ratio</span><strong>{(testResult.effectivenessRatio * 100).toFixed(1)}%</strong></div>
                                        <div className="tr-row"><span>OCI Amount</span><strong>{fmt(testResult.ociAmount)}</strong></div>
                                        <div className="tr-row"><span>P&L Reclassified</span><strong>{fmt(testResult.plReclassified)}</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'covenants' && (
                <div className="panel flex flex-col h-[500px]">
                    <h3 className="card-title">Covenants Due (Next 30 Days)</h3>
                    <div className="flex-1 mt-4">
                        {dueCovs.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">No covenants due in next 30 days</div>
                        ) : (
                            <InteractiveSpreadsheet
                                columns={dueCovsnColumns}
                                data={dueCovs}
                                onChange={() => { }}
                                containerHeight="100%"
                            />
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'debt' && (
                <div className="panel">
                    <div className="debt-grid">
                        {facilities.map(f => {
                            const util = pct(f.drawn_amount, f.facility_amount);
                            const hasBreaches = f.recent_breaches > 0;
                            return (
                                <div key={f.id} className={`debt-card ${hasBreaches ? 'breach' : ''}`}>
                                    <div className="dc-top">
                                        <div className="dc-name">{f.facility_name}</div>
                                        {hasBreaches && <span className="breach-badge"><AlertTriangle size={10} /> Breach</span>}
                                    </div>
                                    <div className="dc-lender">{f.lender} · {f.facility_type}</div>
                                    <div className="dc-util">
                                        <div className="util-bar-bg">
                                            <style>{`.util-bar-he-${f.id} { width: ${util}%; }`}</style>
                                            <div className={`util-bar util-bar-he-${f.id} ${util > 80 ? 'bg-red-600' : 'bg-blue-700'}`} />
                                        </div>
                                        <span className="util-pct">{util}% utilised</span>
                                    </div>
                                    <div className="dc-amounts">
                                        <span>{fmt(f.drawn_amount, f.currency_code)} drawn</span>
                                        <span>of {fmt(f.facility_amount, f.currency_code)}</span>
                                    </div>
                                    <div className="dc-footer">
                                        <span>Matures: {f.maturity_date}</span>
                                        <span>{f.covenant_count} covenants</span>
                                    </div>
                                </div>
                            );
                        })}
                        {facilities.length === 0 && <div className="empty">No debt facilities configured</div>}
                    </div>
                </div>
            )}

            <style>{`
                .he-container { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .he-header { margin-bottom: 24px; }
                .he-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .he-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .he-kpis { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                .he-tabs { display: flex; gap: 2px; background: #f3f4f6; border-radius: 10px; padding: 3px; width: fit-content; margin-bottom: 20px; }
                .he-tab { padding: 8px 20px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; background: transparent; color: #6b7280; }
                .he-tab.active { background: #fff; color: #1d4ed8; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
                .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
                .panel-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
                .he-card { background: #f9fafb; border-radius: 8px; padding: 16px; }
                .card-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; }
                .he-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .he-table th { padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; background: #fff; border-bottom: 2px solid #e5e7eb; }
                .he-row { cursor: pointer; }
                .he-row:hover { background: #f0f9ff; }
                .he-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .mono { font-family: monospace; }
                .small { font-size: 11px; }
                .fw { font-weight: 600; }
                .type-chip { background: #dbeafe; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; white-space: nowrap; }
                .std-chip { background: #f3e8ff; color: #7c3aed; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .status-chip { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
                .status-chip.green { background: #d1fae5; color: #059669; }
                .status-chip.red { background: #fee2e2; color: #dc2626; }
                .grey-chip { background: #f3f4f6; color: #6b7280; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
                .eff-pass { display: flex; align-items: center; gap: 4px; color: #059669; font-size: 11px; }
                .eff-fail { display: flex; align-items: center; gap: 4px; color: #dc2626; font-size: 11px; }
                .empty { text-align: center; padding: 32px; color: #9ca3af; font-size: 13px; }
                .test-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
                .test-hint { font-size: 11px; color: #9ca3af; margin: -8px 0 12px; }
                .tf { margin-bottom: 10px; }
                .tl { display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px; }
                .ti { width: 100%; padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; box-sizing: border-box; }
                .run-test-btn { width: 100%; padding: 9px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 6px; }
                .run-test-btn:disabled { background: #9ca3af; }
                .test-result { margin-top: 14px; padding: 12px; border-radius: 8px; }
                .test-result.pass { background: #d1fae5; border: 1px solid #6ee7b7; }
                .test-result.fail { background: #fee2e2; border: 1px solid #fca5a5; }
                .tr-header { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
                .tr-rows { display: flex; flex-direction: column; gap: 4px; }
                .tr-row { display: flex; justify-content: space-between; font-size: 12px; }
                .freq-chip { background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
                .red { color: #dc2626; }
                .debt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
                .debt-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; transition: box-shadow 0.2s; }
                .debt-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .debt-card.breach { border-color: #fca5a5; }
                .dc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
                .dc-name { font-size: 14px; font-weight: 700; color: #111827; }
                .breach-badge { display: flex; align-items: center; gap: 4px; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
                .dc-lender { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
                .util-bar-bg { height: 6px; background: #e5e7eb; border-radius: 3px; margin-bottom: 4px; }
                .util-bar { height: 6px; border-radius: 3px; }
                .util-pct { font-size: 11px; color: #6b7280; }
                .dc-amounts { display: flex; justify-content: space-between; font-size: 12px; color: #374151; margin: 8px 0; font-family: monospace; }
                .dc-footer { display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 8px; margin-top: 4px; }
            `}</style>
        </StandardPage>
    );
}

function HeKpi({ label, value, icon, colorClass, borderClass }: { label: string; value: string; icon: React.ReactNode; colorClass: string; borderClass: string }) {
    return (
        <div className={`bg-white border flex items-center gap-3 min-w-[160px] px-4 py-3 rounded-xl border-gray-200 border-l-4 ${borderClass}`}>
            <div className={colorClass}>{icon}</div>
            <div>
                <div className={`text-xl font-extrabold ${colorClass}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
        </div>
    );
}
