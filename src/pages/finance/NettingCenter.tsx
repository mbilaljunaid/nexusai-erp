import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, TrendingDown, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface NettingSession { id: string; session_name: string; period: string; status: string; entities_in_scope: string[]; net_positions: NetPos[]; settlement_date: string; created_at: string; }
interface NetPos { entity: string; payable: number; receivable: number; net: number; }
interface TPPolicy { id: string; policy_name: string; transaction_category: string; method: string; arm_length_margin_pct: number; benchmark_range_low: number; benchmark_range_high: number; effective_from: string; }
interface TPAnalysis { id: string; policy_name: string; transaction_category: string; period: string; actual_margin_pct: number; benchmark_margin_pct: number; variance_pct: number; in_range: boolean; flagged: boolean; transactions_reviewed: number; analysis_notes: string; }

const STATUS_CLR: Record<string, string> = { Draft: '#6b7280', Running: '#d97706', Completed: '#1d4ed8', Settled: '#059669', Cancelled: '#dc2626' };

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
    const runMut = useMutation({ mutationFn: (id: string) => fetch(`/api/ic/netting/sessions/${id}/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['netting-sessions'] }) });
    const settleMut = useMutation({ mutationFn: (id: string) => fetch(`/api/ic/netting/sessions/${id}/settle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settledBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['netting-sessions'] }) });
    const createPolicyMut = useMutation({ mutationFn: (d: any) => fetch('/api/ic/tp/policies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tp-policies'] }); setShowNewPolicy(false); } });
    const runAnalysisMut = useMutation({ mutationFn: (d: any) => fetch('/api/ic/tp/analyses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['tp-analyses'] }) });

    const netPosColumns: SpreadsheetColumn<NetPos>[] = [
        { id: "entity", header: "Entity", width: "150px", cell: (row) => <div style={{ fontWeight: 700 }}>{row.entity}</div> },
        { id: "payable", header: "Payable", width: "120px", cell: (row) => <div style={{ fontFamily: 'monospace', color: '#dc2626' }}>${Number(row.payable).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div> },
        { id: "receivable", header: "Receivable", width: "120px", cell: (row) => <div style={{ fontFamily: 'monospace', color: '#059669' }}>${Number(row.receivable).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div> },
        { id: "net", header: "Net Position", width: "150px", cell: (row) => <div style={{ fontFamily: 'monospace', fontWeight: 700, color: Number(row.net) >= 0 ? '#059669' : '#dc2626' }}>{Number(row.net) >= 0 ? '+' : ''}{Number(row.net).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div> },
        { id: "flow", header: "Flow", width: "100px", cell: (row) => <div>{Number(row.net) > 0 ? <span style={{ color: '#059669' }}><TrendingUp size={12} /></span> : Number(row.net) < 0 ? <span style={{ color: '#dc2626' }}><TrendingDown size={12} /></span> : '—'}</div> }
    ];

    const analysesColumns: SpreadsheetColumn<TPAnalysis>[] = [
        { id: "policy", header: "Policy", width: "200px", cell: (row) => <div style={{ fontWeight: 600 }}>{row.policy_name}</div> },
        { id: "category", header: "Category", width: "120px", cell: (row) => <div style={{ color: '#6b7280', fontSize: 10 }}>{row.transaction_category}</div> },
        { id: "period", header: "Period", width: "100px", cell: (row) => <div style={{ fontFamily: 'monospace' }}>{row.period}</div> },
        { id: "actual", header: "Actual %", width: "100px", cell: (row) => <div style={{ fontFamily: 'monospace' }}>{Number(row.actual_margin_pct).toFixed(2)}%</div> },
        { id: "benchmark", header: "Benchmark %", width: "100px", cell: (row) => <div style={{ fontFamily: 'monospace', color: '#6b7280' }}>{Number(row.benchmark_margin_pct).toFixed(2)}%</div> },
        { id: "variance", header: "Variance", width: "100px", cell: (row) => <div style={{ fontFamily: 'monospace', color: Number(row.variance_pct) < 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>{Number(row.variance_pct) > 0 ? '+' : ''}{Number(row.variance_pct).toFixed(2)}%</div> },
        { id: "inRange", header: "In Range", width: "100px", cell: (row) => <div><span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: row.in_range ? '#d1fae5' : '#fee2e2', color: row.in_range ? '#059669' : '#dc2626' }}>{row.in_range ? '✓ Yes' : '✗ No'}</span></div> },
        { id: "status", header: "Status", width: "120px", cell: (row) => <div>{row.flagged && <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: '#fef9c3', color: '#d97706', fontWeight: 700 }}>⚠ Flagged</span>}</div> }
    ];

    return (
        <StandardPage
            title="IC Netting Center"
            description="Multilateral netting · Transfer pricing · Arm-length analysis"
            actions={
                <div style={{ display: 'flex', gap: 8 }}>
                    {['netting', 'tp'].map(t => <button key={t} onClick={() => setTab(t as any)} style={{ padding: '7px 14px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer', background: tab === t ? '#111827' : '#f3f4f6', color: tab === t ? '#fff' : '#6b7280' }}>{t === 'netting' ? 'Netting' : 'Transfer Pricing'}</button>)}
                </div>
            }
        >
            <div style={{ padding: '0 24px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

                {tab === 'netting' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <button onClick={() => setShowNew(true)} style={{ padding: '7px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ New Session</button>
                        </div>
                        {showNew && (
                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Create Netting Session</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                                    {[['Session Name', 'sessionName', 'text'], ['Period (YYYY-MM)', 'period', 'text'], ['Currency', 'currency', 'text'], ['Settlement Date', 'settlementDate', 'date']].map(([lbl, key, type]) => (
                                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <label style={{ fontSize: 10, fontWeight: 700 }}>{lbl}</label>
                                            <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label={lbl} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
                                    <label style={{ fontSize: 10, fontWeight: 700 }}>Entities (one per line)</label>
                                    <textarea rows={3} value={form.entitiesText} onChange={e => setForm(p => ({ ...p, entitiesText: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }} aria-label="Entities" />
                                </div>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                    <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={() => createMut.mutate({ ...form, entitiesInScope: form.entitiesText.split('\n').map(s => s.trim()).filter(Boolean) })} disabled={!form.sessionName || !form.period} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Create</button>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 14 }}>
                            <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {sessions.map(s => {
                                    const clr = STATUS_CLR[s.status] ?? '#6b7280';
                                    return (
                                        <div key={s.id} onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)} style={{ background: '#fff', border: `1px solid ${selectedSession?.id === s.id ? '#1d4ed8' : '#e5e7eb'}`, borderLeft: `4px solid ${clr}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <div style={{ fontWeight: 700, fontSize: 13 }}>{s.session_name}</div>
                                                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: clr + '18', color: clr }}>{s.status}</span>
                                            </div>
                                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.period} · {s.currency} · {(s.entities_in_scope ?? []).length} entities</div>
                                            {s.status === 'Draft' && <button onClick={ev => { ev.stopPropagation(); runMut.mutate(s.id); }} style={{ marginTop: 6, padding: '3px 8px', background: '#eff6ff', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#1d4ed8' }}>▶ Run Netting</button>}
                                            {s.status === 'Completed' && <button onClick={ev => { ev.stopPropagation(); settleMut.mutate(s.id); }} style={{ marginTop: 6, padding: '3px 8px', background: '#f0fdf4', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#059669', fontWeight: 700 }}><CheckCircle2 size={9} /> Settle</button>}
                                        </div>
                                    );
                                })}
                                {sessions.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, background: '#fff', borderRadius: 10 }}>No sessions — create one</div>}
                            </div>
                            {selectedSession && (
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{selectedSession.session_name} — Net Positions</div>
                                    {(selectedSession.net_positions ?? []).length > 0 ? (
                                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', height: 300, background: '#fff' }}>
                                            <InteractiveSpreadsheet
                                                columns={netPosColumns}
                                                data={selectedSession.net_positions}
                                                onChange={() => { }}
                                                containerHeight="100%"
                                            />
                                        </div>
                                    ) : <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>Run netting to compute positions</div>}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {tab === 'tp' && (
                    <div>
                        <div style={{ display: 'flex', gap: 14 }}>
                            {/* Policies */}
                            <div style={{ width: 320, flexShrink: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>TP Policies</div>
                                    <button onClick={() => setShowNewPolicy(true)} style={{ padding: '4px 10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}>+ Policy</button>
                                </div>
                                {showNewPolicy && (
                                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                                        {[['Policy Name', 'policyName', 'text'], ['Category', 'transactionCategory', 'select'], ['Method', 'method', 'select'], ['Range Low %', 'benchmarkRangeLow', 'number'], ['Range High %', 'benchmarkRangeHigh', 'number'], ['Effective From', 'effectiveFrom', 'date']].map(([lbl, key, type]) => (
                                            <div key={key} style={{ marginBottom: 5 }}>
                                                <label style={{ fontSize: 9, fontWeight: 700, display: 'block' }}>{lbl}</label>
                                                {type === 'select' && key === 'transactionCategory'
                                                    ? <select value={(policyForm as any)[key]} onChange={e => setPolicyForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 11 }} aria-label={lbl}>{['GOODS', 'SERVICES', 'IP_ROYALTIES', 'LOANS', 'COST_SHARING'].map(v => <option key={v}>{v}</option>)}</select>
                                                    : type === 'select' && key === 'method'
                                                        ? <select value={(policyForm as any)[key]} onChange={e => setPolicyForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 11 }} aria-label={lbl}>{['CUP', 'RESALE_PRICE', 'COST_PLUS', 'TNMM', 'PSM', 'CUSTOM'].map(v => <option key={v}>{v}</option>)}</select>
                                                        : <input type={type} value={(policyForm as any)[key]} onChange={e => setPolicyForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 11, boxSizing: 'border-box' }} aria-label={lbl} />}
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 6 }}>
                                            <button onClick={() => setShowNewPolicy(false)} style={{ padding: '3px 8px', background: '#e5e7eb', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>Cancel</button>
                                            <button onClick={() => createPolicyMut.mutate({ ...policyForm, benchmarkRangeLow: parseFloat(policyForm.benchmarkRangeLow) || null, benchmarkRangeHigh: parseFloat(policyForm.benchmarkRangeHigh) || null })} style={{ padding: '3px 8px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>Save</button>
                                        </div>
                                    </div>
                                )}
                                {policies.map(p => (
                                    <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', marginBottom: 5 }}>
                                        <div style={{ fontWeight: 700, fontSize: 12 }}>{p.policy_name}</div>
                                        <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 3 }}>{p.method} · {p.transaction_category}</div>
                                        <div style={{ fontSize: 10, color: '#374151' }}>Range: {p.benchmark_range_low ?? '—'}% – {p.benchmark_range_high ?? '—'}%</div>
                                        <button onClick={() => setAnalysisForm(af => ({ ...af, policyId: p.id }))} style={{ marginTop: 4, padding: '2px 7px', background: '#eff6ff', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#1d4ed8' }}>Select for Analysis</button>
                                    </div>
                                ))}
                            </div>

                            {/* Analyses */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>Analyses</div>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <input placeholder="Period YYYY-MM" value={analysisForm.period} onChange={e => setAnalysisForm(p => ({ ...p, period: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, width: 110 }} aria-label="Analysis period" />
                                        <input type="number" placeholder="Actual margin %" value={analysisForm.actualMarginPct} onChange={e => setAnalysisForm(p => ({ ...p, actualMarginPct: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, width: 120 }} aria-label="Actual margin pct" />
                                        <button disabled={!analysisForm.policyId || !analysisForm.actualMarginPct} onClick={() => runAnalysisMut.mutate({ policyId: analysisForm.policyId, period: analysisForm.period, actualMarginPct: parseFloat(analysisForm.actualMarginPct), transactionsReviewed: parseInt(analysisForm.transactionsReviewed) || 0 })} style={{ padding: '5px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}><BarChart3 size={10} style={{ marginRight: 3 }} />Run Analysis</button>
                                    </div>
                                </div>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', height: 400, background: '#fff' }}>
                                    {analyses.length > 0 ? (
                                        <InteractiveSpreadsheet
                                            columns={analysesColumns}
                                            data={analyses}
                                            onChange={() => { }}
                                            containerHeight="100%"
                                        />
                                    ) : (
                                        <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No analyses — select a policy and run</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
