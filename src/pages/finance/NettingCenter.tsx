import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, TrendingDown, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from "@/components/ui/card";

interface NettingSession { id: string; session_name: string; period: string; currency: string; status: string; entities_in_scope: string[]; net_positions: NetPos[]; settlement_date: string; created_at: string; }
interface NetPos { id?: string; entity: string; payable: number; receivable: number; net: number; }
interface TPPolicy { id: string; policy_name: string; transaction_category: string; method: string; arm_length_margin_pct: number; benchmark_range_low: number; benchmark_range_high: number; effective_from: string; }
interface TPAnalysis { id: string; policy_name: string; transaction_category: string; period: string; actual_margin_pct: number; benchmark_margin_pct: number; variance_pct: number; in_range: boolean; flagged: boolean; transactions_reviewed: number; analysis_notes: string; }

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    Draft: { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-500' },
    Running: { text: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-600' },
    Completed: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-700' },
    Settled: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-600' },
    Cancelled: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-600' }
};

export default function NettingCenter() {
    const [tab, setTab] = useState<'netting' | 'tp'>('netting');
    const [selectedSession, setSelectedSession] = useState<NettingSession | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ sessionName: '', period: new Date().toISOString().slice(0, 7), currency: 'USD', entitiesText: '', settlementDate: '' });
    const [showNewPolicy, setShowNewPolicy] = useState(false);
    const [policyForm, setPolicyForm] = useState({ policyName: '', transactionCategory: 'GOODS', method: 'TNMM', benchmarkRangeLow: '', benchmarkRangeHigh: '', effectiveFrom: new Date().toISOString().split('T')[0] });
    const [analysisForm, setAnalysisForm] = useState({ policyId: '', period: new Date().toISOString().slice(0, 7), actualMarginPct: '', transactionsReviewed: '' });
    const qc = useQueryClient();

    const { data: sessions = [] } = useQuery<NettingSession[]>({ queryKey: ['netting-sessions'], queryFn: () => fetch('/api/ic/netting/sessions').then(r => r.json()) });
    const { data: policies = [] } = useQuery<TPPolicy[]>({ queryKey: ['tp-policies'], queryFn: () => fetch('/api/ic/tp/policies').then(r => r.json()), enabled: tab === 'tp' });
    const { data: analyses = [] } = useQuery<TPAnalysis[]>({ queryKey: ['tp-analyses'], queryFn: () => fetch('/api/ic/tp/analyses').then(r => r.json()), enabled: tab === 'tp' });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/ic/netting/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['netting-sessions'] }); setShowNew(false); } });
    const runMut = useMutation({ mutationFn: (id: string) => fetch(`/ api / ic / netting / sessions / ${id} /run`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['netting - sessions'] }) });
    const settleMut = useMutation({ mutationFn: (id: string) => fetch(`/api/ic/netting/sessions/${id}/settle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settledBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['netting-sessions'] }) });
    const createPolicyMut = useMutation({ mutationFn: (d: any) => fetch('/api/ic/tp/policies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tp-policies'] }); setShowNewPolicy(false); } });
    const runAnalysisMut = useMutation({ mutationFn: (d: any) => fetch('/api/ic/tp/analyses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['tp-analyses'] }) });

    const netPosColumns: SpreadsheetColumn<NetPos>[] = [
        { id: "entity", header: "Entity", width: "150px", cell: (row) => <div className="font-bold">{row.entity}</div> },
        { id: "payable", header: "Payable", width: "120px", cell: (row) => <div className="font-mono text-red-600">${Number(row.payable).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div> },
        { id: "receivable", header: "Receivable", width: "120px", cell: (row) => <div className="font-mono text-emerald-600">${Number(row.receivable).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div> },
        { id: "net", header: "Net Position", width: "150px", cell: (row) => <div className={cn(`font-mono font-bold ${Number(row.net) >= 0 ? 'text-emerald-600' : 'text-red-600'}`)}>{Number(row.net) >= 0 ? '+' : ''}{Number(row.net).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div> },
        { id: "flow", header: "Flow", width: "100px", cell: (row) => <div>{Number(row.net) > 0 ? <span className="text-emerald-600"><TrendingUp size={12} /></span> : Number(row.net) < 0 ? <span className="text-red-600"><TrendingDown size={12} /></span> : '—'}</div> }
    ];

    const analysesColumns: SpreadsheetColumn<TPAnalysis>[] = [
        { id: "policy", header: "Policy", width: "200px", cell: (row) => <div className="font-semibold">{row.policy_name}</div> },
        { id: "category", header: "Category", width: "120px", cell: (row) => <div className="text-gray-500 text-[10px]">{row.transaction_category}</div> },
        { id: "period", header: "Period", width: "100px", cell: (row) => <div className="font-mono">{row.period}</div> },
        { id: "actual", header: "Actual %", width: "100px", cell: (row) => <div className="font-mono">{Number(row.actual_margin_pct).toFixed(2)}%</div> },
        { id: "benchmark", header: "Benchmark %", width: "100px", cell: (row) => <div className="font-mono text-gray-500">{Number(row.benchmark_margin_pct).toFixed(2)}%</div> },
        { id: "variance", header: "Variance", width: "100px", cell: (row) => <div className={cn(`font-mono font-bold ${Number(row.variance_pct) < 0 ? 'text-red-600' : 'text-emerald-600'}`)}>{Number(row.variance_pct) > 0 ? '+' : ''}{Number(row.variance_pct).toFixed(2)}%</div> },
        { id: "inRange", header: "In Range", width: "100px", cell: (row) => <div><span className={cn(`text-[9px] px-1 py-0.5 rounded-[3px] ${row.in_range ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`)}>{row.in_range ? '✓ Yes' : '✗ No'}</span></div> },
        { id: "status", header: "Status", width: "120px", cell: (row) => <div>{row.flagged && <span className="text-[9px] px-1 py-0.5 rounded-[3px] bg-yellow-100 text-amber-600 font-bold">⚠ Flagged</span>}</div> }
    ];

    return (
        <StandardPage
            title="IC Netting Center"
            description="Multilateral netting · Transfer pricing · Arm-length analysis"
            actions={
                <div className="flex gap-2">
                    {['netting', 'tp'].map(t => <button key={t} onClick={() => setTab(t as any)} data-active={tab === t} className={cn(`px-3.5 py-1.5 border-none rounded-lg font-bold text-[11px] cursor-pointer hover:bg-gray-200 hover:text-gray-800 ${tab === t ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white' : 'bg-gray-100 text-gray-500'}`)}>{t === 'netting' ? 'Netting' : 'Transfer Pricing'}</button>)}
                </div>
            }
        >
            <div className="px-6 max-w-[1400px] mx-auto font-sans">

                {tab === 'netting' && (
                    <>
                        <div className="flex justify-end mb-2.5">
                            <button onClick={() => setShowNew(true)} className="px-3.5 py-1.5 bg-blue-700 text-white border-none rounded-lg text-[11px] font-bold cursor-pointer hover:bg-blue-800">+ New Session</button>
                        </div>
                        {showNew && (
                            <Card className="bg-gray-50 p-3.5 mb-3 shadow-sm">
                                <div className="font-bold text-[12px] mb-2">Create Netting Session</div>
                                <div className="grid grid-cols-4 gap-2 mb-2.5">
                                    {[['Session Name', 'sessionName', 'text'], ['Period (YYYY-MM)', 'period', 'text'], ['Currency', 'currency', 'text'], ['Settlement Date', 'settlementDate', 'date']].map(([lbl, key, type]) => (
                                        <div key={key} className="flex flex-col gap-0.5">
                                            <label className="text-[10px] font-bold">{lbl}</label>
                                            <Input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="h-8 text-[12px]" aria-label={lbl} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-0.5 mb-2.5">
                                    <label className="text-[10px] font-bold">Entities (one per line)</label>
                                    <Textarea rows={3} value={form.entitiesText} onChange={e => setForm(p => ({ ...p, entitiesText: e.target.value }))} className="font-mono text-xs" aria-label="Entities" />
                                </div>
                                <div className="flex gap-1.5 justify-end">
                                    <button onClick={() => setShowNew(false)} className="px-3 py-1 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer hover:bg-gray-300">Cancel</button>
                                    <button onClick={() => createMut.mutate({ ...form, entitiesInScope: form.entitiesText.split('\n').map(s => s.trim()).filter(Boolean) })} disabled={!form.sessionName || !form.period} className="px-3 py-1 bg-blue-700 text-white border-none rounded-md text-[11px] font-bold cursor-pointer hover:bg-blue-800 disabled:opacity-50">Create</button>
                                </div>
                            </Card>
                        )}
                        <div className="flex gap-3.5">
                            <div className="w-80 shrink-0 flex flex-col gap-1.5">
                                {sessions.map(s => {
                                    const style = STATUS_STYLES[s.status] ?? STATUS_STYLES['Draft'];
                                    return (
                                        <Card key={s.id} onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)} className={cn(`p-[10px_12px] cursor-pointer outline-none border-l-[4px] border-l-solid shadow-sm mb-2 ${selectedSession?.id === s.id ? 'border-l-blue-700' : 'border-l-gray-200'} ${style.border}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                            <div className="flex justify-between mb-0.5">
                                                <div className="font-bold text-[13px]">{s.session_name}</div>
                                                <span className={cn(`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold ${style.bg} ${style.text}`)}>{s.status}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400">{s.period} · {s.currency} · {(s.entities_in_scope ?? []).length} entities</div>
                                            {s.status === 'Draft' && <button onClick={ev => { ev.stopPropagation(); runMut.mutate(s.id); }} className="mt-1.5 px-2 py-0.5 bg-blue-50 border-none rounded-[4px] text-[9px] cursor-pointer text-blue-700 hover:bg-blue-100">▶ Run Netting</button>}
                                            {s.status === 'Completed' && <button onClick={ev => { ev.stopPropagation(); settleMut.mutate(s.id); }} className="mt-1.5 px-2 py-0.5 bg-emerald-50 border-none rounded-[4px] text-[9px] cursor-pointer text-emerald-600 font-bold hover:bg-emerald-100 flex items-center gap-1"><CheckCircle2 size={9} /> Settle</button>}
                                        </Card>
                                    );
                                })}
                                {sessions.length === 0 && <div className="text-center text-gray-400 p-8 bg-white rounded-[10px]">No sessions — create one</div>}
                            </div>
                            {selectedSession && (
                                <div className="flex-1">
                                    <div className="font-bold text-[14px] mb-2.5">{selectedSession.session_name} — Net Positions</div>
                                    {(selectedSession.net_positions ?? []).length > 0 ? (
                                        <Card className="overflow-hidden h-72 shadow-sm">
                                            <InteractiveSpreadsheet
                                                columns={netPosColumns}
                                                data={selectedSession.net_positions}
                                                onChange={() => { }}
                                                containerHeight="100%"
                                            />
                                        </Card>
                                    ) : <div className="text-center text-gray-400 p-10">Run netting to compute positions</div>}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {tab === 'tp' && (
                    <div>
                        <div className="flex gap-3.5">
                            {/* Policies */}
                            <div className="w-80 shrink-0">
                                <div className="flex justify-between mb-2 items-center">
                                    <div className="font-bold text-[13px]">TP Policies</div>
                                    <button onClick={() => setShowNewPolicy(true)} className="px-2.5 py-1 bg-blue-700 text-white border-none rounded-[6px] text-[10px] cursor-pointer hover:bg-blue-800">+ Policy</button>
                                </div>
                                {showNewPolicy && (
                                    <Card className="bg-gray-50 p-2.5 mb-2 shadow-sm">
                                        {[['Policy Name', 'policyName', 'text'], ['Category', 'transactionCategory', 'select'], ['Method', 'method', 'select'], ['Range Low %', 'benchmarkRangeLow', 'number'], ['Range High %', 'benchmarkRangeHigh', 'number'], ['Effective From', 'effectiveFrom', 'date']].map(([lbl, key, type]) => (
                                            <div key={key} className="mb-1">
                                                <label className="text-[9px] font-bold block">{lbl}</label>
                                                {type === 'select' && key === 'transactionCategory'
                                                    ? <Select value={(policyForm as any)[key]} onValueChange={v => setPolicyForm(p => ({ ...p, [key]: v }))}><SelectTrigger aria-label={lbl} className="text-[11px]"><SelectValue /></SelectTrigger><SelectContent>{['GOODS', 'SERVICES', 'IP_ROYALTIES', 'LOANS', 'COST_SHARING'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
                                                    : type === 'select' && key === 'method'
                                                        ? <Select value={(policyForm as any)[key]} onValueChange={v => setPolicyForm(p => ({ ...p, [key]: v }))}><SelectTrigger aria-label={lbl} className="text-[11px]"><SelectValue /></SelectTrigger><SelectContent>{['CUP', 'RESALE_PRICE', 'COST_PLUS', 'TNMM', 'PSM', 'CUSTOM'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
                                                        : <Input type={type} value={(policyForm as any)[key]} onChange={e => setPolicyForm(p => ({ ...p, [key]: e.target.value }))} className="h-7 text-[11px]" aria-label={lbl} />}
                                            </div>
                                        ))}
                                        <div className="flex gap-1 justify-end mt-1.5">
                                            <button onClick={() => setShowNewPolicy(false)} className="px-2 py-0.5 bg-gray-200 border-none rounded-[5px] text-[10px] cursor-pointer hover:bg-gray-300">Cancel</button>
                                            <button onClick={() => createPolicyMut.mutate({ ...policyForm, benchmarkRangeLow: parseFloat(policyForm.benchmarkRangeLow) || null, benchmarkRangeHigh: parseFloat(policyForm.benchmarkRangeHigh) || null })} className="px-2 py-0.5 bg-blue-700 text-white border-none rounded-[5px] text-[10px] cursor-pointer hover:bg-blue-800">Save</button>
                                        </div>
                                    </Card>
                                )}
                                {policies.map(p => (
                                    <Card key={p.id} className="p-[8px_10px] mb-1 shadow-sm">
                                        <div className="font-bold text-[12px]">{p.policy_name}</div>
                                        <div className="text-[9px] text-gray-400 mb-0.5">{p.method} · {p.transaction_category}</div>
                                        <div className="text-[10px] text-gray-700">Range: {p.benchmark_range_low ?? '—'}% – {p.benchmark_range_high ?? '—'}%</div>
                                        <button onClick={() => setAnalysisForm(af => ({ ...af, policyId: p.id }))} className="mt-1 px-1.5 py-0.5 bg-blue-50 border-none rounded-[4px] text-[9px] cursor-pointer text-blue-700 hover:bg-blue-100">Select for Analysis</button>
                                    </Card>
                                ))}
                            </div>

                            {/* Analyses */}
                            <div className="flex-1">
                                <div className="flex justify-between mb-2 items-center">
                                    <div className="font-bold text-[13px]">Analyses</div>
                                    <div className="flex gap-1.5 items-center">
                                        <Input placeholder="Period YYYY-MM" value={analysisForm.period} onChange={e => setAnalysisForm(p => ({ ...p, period: e.target.value }))} className="px-2 py-1 border border-gray-300 rounded-[6px] text-[11px] w-28" aria-label="Analysis period" />
                                        <Input type="number" placeholder="Actual margin %" value={analysisForm.actualMarginPct} onChange={e => setAnalysisForm(p => ({ ...p, actualMarginPct: e.target.value }))} className="px-2 py-1 border border-gray-300 rounded-[6px] text-[11px] w-28" aria-label="Actual margin pct" />
                                        <button disabled={!analysisForm.policyId || !analysisForm.actualMarginPct} onClick={() => runAnalysisMut.mutate({ policyId: analysisForm.policyId, period: analysisForm.period, actualMarginPct: parseFloat(analysisForm.actualMarginPct), transactionsReviewed: parseInt(analysisForm.transactionsReviewed) || 0 })} className="px-3 py-1 bg-violet-600 text-white border-none rounded-[6px] text-[11px] cursor-pointer flex items-center hover:bg-violet-700 disabled:opacity-50"><BarChart3 size={10} className="mr-0.5" />Run Analysis</button>
                                    </div>
                                </div>
                                <Card className="overflow-hidden h-[400px] shadow-sm">
                                    {analyses.length > 0 ? (
                                        <InteractiveSpreadsheet
                                            columns={analysesColumns}
                                            data={analyses}
                                            onChange={() => { }}
                                            containerHeight="100%"
                                        />
                                    ) : (
                                        <div className="p-5 text-center text-gray-400">No analyses — select a policy and run</div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
