import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Leaf, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface ESGGoal { id: string; goal_code: string; goal_name: string; category: string; subcategory: string; unit: string; baseline_value: number; target_value: number; target_year: number; status: string; owner: string; }
interface Actual { actual_value: number; period: string; data_source: string; }
interface VarianceRow { cost_center: string; gl_account: string; budget_amount: number; actual_amount: number; committed_amount: number; available: number; utilization_pct: number; control_action: string; }

const CATEGORY_CLR: Record<string, string> = { ENVIRONMENTAL: '#059669', SOCIAL: '#3b82f6', GOVERNANCE: '#7c3aed' };
const STATUS_CLR: Record<string, string> = { On_Track: '#059669', At_Risk: '#d97706', Off_Track: '#dc2626', Achieved: '#7c3aed', Active: '#6b7280', Draft: '#9ca3af' };

export default function ESGPlanning() {
    const [tab, setTab] = useState<'goals' | 'budget'>('goals');
    const [selectedGoal, setSelectedGoal] = useState<ESGGoal | null>(null);
    const [catFilter, setCatFilter] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [goalForm, setGoalForm] = useState({ goalCode: '', goalName: '', category: 'ENVIRONMENTAL', subcategory: '', unit: '', baselineValue: '', targetValue: '', targetYear: String(new Date().getFullYear() + 3), owner: '' });
    const [actualForm, setActualForm] = useState({ goalId: '', period: new Date().toISOString().slice(0, 7), actualValue: '', dataSource: '', notes: '' });
    const [budgetPeriod, setBudgetPeriod] = useState(new Date().toISOString().slice(0, 7));
    const qc = useQueryClient();

    const { data: goals = [] } = useQuery<ESGGoal[]>({ queryKey: ['esg-goals', catFilter], queryFn: () => fetch(`/api/epm/esg/goals${catFilter ? `?category=${catFilter}` : ''}`).then(r => r.json()) });
    const { data: performance } = useQuery<{ goal: ESGGoal; actuals: Actual[] }>({ queryKey: ['esg-perf', selectedGoal?.id], enabled: !!selectedGoal, queryFn: () => fetch(`/api/epm/esg/goals/${selectedGoal!.id}`).then(r => r.json()) });
    const { data: summary = [] } = useQuery<any[]>({ queryKey: ['esg-summary'], queryFn: () => fetch('/api/epm/esg/goals/summary').then(r => r.json()) });
    const { data: variance = [] } = useQuery<VarianceRow[]>({ queryKey: ['budget-variance', budgetPeriod], queryFn: () => fetch(`/api/epm/budget/variance?period=${budgetPeriod}&budgetVersion=Approved`).then(r => r.json()), enabled: tab === 'budget' });

    const createGoalMut = useMutation({ mutationFn: (d: any) => fetch('/api/epm/esg/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['esg-goals'] }); setShowNew(false); } });
    const recordActualMut = useMutation({ mutationFn: (d: any) => fetch('/api/epm/esg/actuals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['esg-perf', actualForm.goalId] }) });

    const env = goals.filter(g => g.category === 'ENVIRONMENTAL').length;
    const social = goals.filter(g => g.category === 'SOCIAL').length;
    const gov = goals.filter(g => g.category === 'GOVERNANCE').length;
    const onTrack = goals.filter(g => g.status === 'On_Track' || g.status === 'Achieved').length;

    const varianceColumns: SpreadsheetColumn<any>[] = [
        { id: "cost_center", header: "Cost Center", width: "150px", cell: (v: any) => <span style={{ fontWeight: 600 }}>{v.cost_center}</span> },
        { id: "gl_account", header: "GL Account", width: "150px", cell: (v: any) => <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7280' }}>{v.gl_account}</span> },
        { id: "budget", header: "Budget", width: "120px", cell: (v: any) => <span style={{ fontFamily: 'monospace' }}>${Number(v.budget_amount).toLocaleString()}</span> },
        { id: "actual", header: "Actual", width: "120px", cell: (v: any) => <span style={{ fontFamily: 'monospace' }}>${Number(v.actual_amount).toLocaleString()}</span> },
        { id: "committed", header: "Committed", width: "120px", cell: (v: any) => <span style={{ fontFamily: 'monospace', color: '#d97706' }}>${Number(v.committed_amount).toLocaleString()}</span> },
        { id: "available", header: "Available", width: "120px", cell: (v: any) => <span style={{ fontFamily: 'monospace', color: Number(v.available) < 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>${Number(v.available).toLocaleString()}</span> },
        {
            id: "utilization", header: "Utilization", width: "150px", cell: (v: any) => {
                const pct = Number(v.utilization_pct ?? 0);
                const barClr = pct >= 100 ? '#dc2626' : pct >= 90 ? '#f59e0b' : '#059669';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 60, background: '#f3f4f6', height: 5, borderRadius: 999 }}>
                            <div style={{ width: Math.min(100, pct) + '%', background: barClr, height: '100%', borderRadius: 999 }} />
                        </div>
                        <span style={{ color: barClr, fontWeight: 700 }}>{pct.toFixed(1)}%</span>
                    </div>
                );
            }
        },
        { id: "control", header: "Control", width: "120px", cell: (v: any) => <span style={{ padding: '2px 5px', borderRadius: 3, fontSize: 9, background: v.control_action === 'HARD_STOP' ? '#fee2e2' : v.control_action === 'HOLD' ? '#fef9c3' : '#f3f4f6', color: v.control_action === 'HARD_STOP' ? '#dc2626' : '#6b7280' }}>{v.control_action}</span> },
        {
            id: "status", header: "Status", width: "80px", cell: (v: any) => {
                const pct = Number(v.utilization_pct ?? 0);
                return pct >= 100 ? <AlertTriangle size={12} color="#dc2626" /> : pct >= 90 ? <AlertTriangle size={12} color="#f59e0b" /> : <CheckCircle2 size={12} color="#059669" />;
            }
        }
    ];

    return (
        <StandardPage
            title="ESG & Performance Planning"
            description="ESG goal tracking · Budgetary control · Variance analysis"
            actions={
                <div style={{ display: 'flex', gap: 6 }}>
                    {['goals', 'budget'].map(t => <button key={t} onClick={() => setTab(t as any)} style={{ padding: '7px 14px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer', background: tab === t ? '#111827' : '#f3f4f6', color: tab === t ? '#fff' : '#6b7280' }}>{t === 'goals' ? 'ESG Goals' : 'Budget Control'}</button>)}
                </div>
            }
        >

            {tab === 'goals' && (
                <>
                    {/* KPIs */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        {[{ lbl: 'Environmental', val: env, clr: '#059669', icon: '🌱' }, { lbl: 'Social', val: social, clr: '#3b82f6', icon: '👥' }, { lbl: 'Governance', val: gov, clr: '#7c3aed', icon: '⚖️' }, { lbl: 'On Track', val: onTrack, clr: '#059669', icon: '✓' }].map(k => (
                            <div key={k.lbl} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', minWidth: 100 }}>
                                <div style={{ fontSize: 16 }}>{k.icon}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: k.clr }}>{k.val}</div>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{k.lbl}</div>
                            </div>
                        ))}
                    </div>

                    {/* Category filter + New */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['', 'ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'].map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: catFilter === c ? '#111827' : '#fff', color: catFilter === c ? '#fff' : '#6b7280', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{c || 'All'}</button>)}
                        </div>
                        <button onClick={() => setShowNew(true)} style={{ padding: '5px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ New Goal</button>
                    </div>

                    {showNew && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Create ESG Goal</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                                {[['Code', 'goalCode', 'text'], ['Name', 'goalName', 'text'], ['Unit', 'unit', 'text'], ['Owner', 'owner', 'text'], ['Baseline', 'baselineValue', 'number'], ['Target', 'targetValue', 'number'], ['Target Year', 'targetYear', 'number'], ['Subcategory', 'subcategory', 'text']].map(([lbl, key, type]) => (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <label style={{ fontSize: 10, fontWeight: 700 }}>{lbl}</label>
                                        <input type={type} value={(goalForm as any)[key]} onChange={e => setGoalForm(p => ({ ...p, [key]: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11 }} aria-label={lbl} />
                                    </div>
                                ))}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <label style={{ fontSize: 10, fontWeight: 700 }}>Category</label>
                                    <select value={goalForm.category} onChange={e => setGoalForm(p => ({ ...p, category: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11 }} aria-label="Category">{['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'].map(c => <option key={c}>{c}</option>)}</select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                <button disabled={!goalForm.goalCode || !goalForm.goalName} onClick={() => createGoalMut.mutate({ ...goalForm, baselineValue: parseFloat(goalForm.baselineValue) || null, targetValue: parseFloat(goalForm.targetValue) || null, targetYear: parseInt(goalForm.targetYear) || null })} style={{ padding: '5px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 14 }}>
                        {/* Goals list */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {goals.map(g => {
                                    const clr = STATUS_CLR[g.status] ?? '#6b7280';
                                    const catClr = CATEGORY_CLR[g.category] ?? '#6b7280';
                                    const pct = g.target_value && g.baseline_value
                                        ? Math.min(100, Math.round(((Number(g.baseline_value)) / Number(g.target_value)) * 100))
                                        : 0;
                                    return (
                                        <div key={g.id} onClick={() => { setSelectedGoal(selectedGoal?.id === g.id ? null : g); setActualForm(a => ({ ...a, goalId: g.id })); }} style={{ background: '#fff', border: `1px solid ${selectedGoal?.id === g.id ? '#059669' : '#e5e7eb'}`, borderLeft: `4px solid ${catClr}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <div style={{ fontWeight: 700, fontSize: 13 }}>{g.goal_name}</div>
                                                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: clr + '18', color: clr }}>{g.status}</span>
                                            </div>
                                            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 5 }}>{g.goal_code} · {g.category} · {g.unit} · Owner: {g.owner ?? '—'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ flex: 1, background: '#f3f4f6', height: 5, borderRadius: 999 }}>
                                                    <div style={{ width: pct + '%', background: catClr, height: '100%', borderRadius: 999 }} />
                                                </div>
                                                <div style={{ fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap' }}>Target: {g.target_value ?? '—'} {g.unit} by {g.target_year}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {goals.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, background: '#fff', borderRadius: 10 }}>No ESG goals — create one</div>}
                            </div>
                        </div>

                        {/* Detail + Record actual */}
                        {selectedGoal && (
                            <div style={{ width: 280, flexShrink: 0 }}>
                                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{selectedGoal.goal_name}</div>
                                    <div style={{ fontSize: 11, lineHeight: 1.7, color: '#374151' }}>
                                        Baseline: <strong>{selectedGoal.baseline_value ?? '—'} {selectedGoal.unit}</strong><br />
                                        Target: <strong>{selectedGoal.target_value ?? '—'} {selectedGoal.unit}</strong> by <strong>{selectedGoal.target_year}</strong>
                                    </div>
                                    <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, marginBottom: 5 }}>Actuals</div>
                                    {(performance?.actuals ?? []).map((a, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, borderBottom: '1px solid #f3f4f6', paddingBottom: 2, marginBottom: 2 }}>
                                            <span style={{ color: '#6b7280' }}>{a.period}</span>
                                            <span style={{ fontWeight: 700 }}>{Number(a.actual_value).toFixed(2)} {selectedGoal.unit}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 7 }}>Record Actual</div>
                                    {[['Period', 'period', 'text'], ['Value', 'actualValue', 'number'], ['Source', 'dataSource', 'text']].map(([lbl, key, type]) => (
                                        <div key={key} style={{ marginBottom: 5 }}>
                                            <label style={{ fontSize: 9, fontWeight: 700, display: 'block' }}>{lbl}</label>
                                            <input type={type} value={(actualForm as any)[key]} onChange={e => setActualForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '4px 7px', border: '1px solid #bbf7d0', borderRadius: 5, fontSize: 11, boxSizing: 'border-box' }} aria-label={lbl} />
                                        </div>
                                    ))}
                                    <button disabled={!actualForm.actualValue} onClick={() => recordActualMut.mutate({ goalId: selectedGoal.id, period: actualForm.period, actualValue: parseFloat(actualForm.actualValue), dataSource: actualForm.dataSource || null })} style={{ width: '100%', padding: '5px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>Record</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {tab === 'budget' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <input value={budgetPeriod} onChange={e => setBudgetPeriod(e.target.value)} placeholder="YYYY-MM" style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12 }} aria-label="Budget period" />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Approved budget variance by cost center / GL account</span>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)', border: '1px solid #e5e7eb' }}>
                        {variance.length > 0 ? (
                            <InteractiveSpreadsheet
                                data={variance}
                                columns={varianceColumns}
                                virtualized={true}
                                containerHeight="500px"
                                onChange={() => { }}
                            />
                        ) : (
                            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No approved budget controls for {budgetPeriod}</div>
                        )}
                    </div>
                </div>
            )}
        </StandardPage>
    );
}
