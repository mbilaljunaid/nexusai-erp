import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Leaf, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";

interface ESGGoal { id: string; goal_code: string; goal_name: string; category: string; subcategory: string; unit: string; baseline_value: number; target_value: number; target_year: number; status: string; owner: string; }
interface Actual { actual_value: number; period: string; data_source: string; }
interface VarianceRow { cost_center: string; gl_account: string; budget_amount: number; actual_amount: number; committed_amount: number; available: number; utilization_pct: number; control_action: string; }

const CATEGORY_CLR: Record<string, string> = { ENVIRONMENTAL: 'bg-emerald-600', SOCIAL: 'bg-blue-500', GOVERNANCE: 'bg-purple-600' };
const BORDER_CLR: Record<string, string> = { ENVIRONMENTAL: 'border-l-emerald-600', SOCIAL: 'border-l-blue-500', GOVERNANCE: 'border-l-purple-600' };
const STATUS_CLR: Record<string, string> = { On_Track: 'bg-emerald-100 text-emerald-600', At_Risk: 'bg-amber-100 text-amber-600', Off_Track: 'bg-red-100 text-red-600', Achieved: 'bg-purple-100 text-purple-600', Active: 'bg-gray-100 text-gray-500', Draft: 'bg-gray-100 text-gray-400' };

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
        { id: "cost_center", header: "Cost Center", width: "150px", cell: (v: any) => <span className="font-semibold">{v.cost_center}</span> },
        { id: "gl_account", header: "GL Account", width: "150px", cell: (v: any) => <span className="font-mono text-[10px] text-gray-500">{v.gl_account}</span> },
        { id: "budget", header: "Budget", width: "120px", cell: (v: any) => <span className="font-mono">${Number(v.budget_amount).toLocaleString()}</span> },
        { id: "actual", header: "Actual", width: "120px", cell: (v: any) => <span className="font-mono">${Number(v.actual_amount).toLocaleString()}</span> },
        { id: "committed", header: "Committed", width: "120px", cell: (v: any) => <span className="font-mono text-amber-600">${Number(v.committed_amount).toLocaleString()}</span> },
        { id: "available", header: "Available", width: "120px", cell: (v: any) => <span className={`font-mono font-bold ${Number(v.available) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>${Number(v.available).toLocaleString()}</span> },
        {
            id: "utilization", header: "Utilization", width: "150px", cell: (v: any) => {
                const pct = Number(v.utilization_pct ?? 0);
                const barClr = pct >= 100 ? 'bg-red-600 text-red-600' : pct >= 90 ? 'bg-amber-500 text-amber-500' : 'bg-emerald-600 text-emerald-600';
                const p = Math.min(100, Math.floor(pct / 10) * 10);
                const wcls = p >= 100 ? 'w-full' : p >= 90 ? 'w-[90%]' : p >= 80 ? 'w-[80%]' : p >= 70 ? 'w-[70%]' : p >= 60 ? 'w-[60%]' : p >= 50 ? 'w-[50%]' : p >= 40 ? 'w-[40%]' : p >= 30 ? 'w-[30%]' : p >= 20 ? 'w-[20%]' : p >= 10 ? 'w-[10%]' : 'w-0';
                return (
                    <div className="flex items-center gap-[5px]">
                        <div className="w-[60px] bg-gray-100 h-[5px] rounded-full">
                            <div className={`${wcls} ${barClr.split(' ')[0]} h-full rounded-full`} />
                        </div>
                        <span className={`${barClr.split(' ')[1]} font-bold`}>{pct.toFixed(1)}%</span>
                    </div>
                );
            }
        },
        { id: "control", header: "Control", width: "120px", cell: (v: any) => <span className={`px-[5px] py-[2px] rounded-[3px] text-[9px] ${v.control_action === 'HARD_STOP' ? 'bg-red-100 text-red-600' : v.control_action === 'HOLD' ? 'bg-yellow-100 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>{v.control_action}</span> },
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
                <div className="flex gap-1.5">
                    {['goals', 'budget'].map(t => <button key={t} onClick={() => setTab(t as any)} className={`px-3.5 py-[7px] border-none rounded-lg font-bold text-[11px] cursor-pointer ${tab === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>{t === 'goals' ? 'ESG Goals' : 'Budget Control'}</button>)}
                </div>
            }
        >

            {tab === 'goals' && (
                <>
                    {/* KPIs */}
                    <div className="flex gap-2.5 mb-3.5">
                        {[{ lbl: 'Environmental', val: env, clr: 'text-emerald-600', icon: '🌱' }, { lbl: 'Social', val: social, clr: 'text-blue-500', icon: '👥' }, { lbl: 'Governance', val: gov, clr: 'text-purple-600', icon: '⚖️' }, { lbl: 'On Track', val: onTrack, clr: 'text-emerald-600', icon: '✓' }].map(k => (
                            <div key={k.lbl} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 min-w-[100px]">
                                <div className="text-base">{k.icon}</div>
                                <div className={`text-xl font-extrabold ${k.clr}`}>{k.val}</div>
                                <div className="text-[10px] text-gray-400">{k.lbl}</div>
                            </div>
                        ))}
                    </div>

                    {/* Category filter + New */}
                    <div className="flex gap-1.5 mb-2.5 justify-between">
                        <div className="flex gap-1.5">
                            {['', 'ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'].map(c => <button key={c} onClick={() => setCatFilter(c)} className={`px-2.5 py-1.5 border border-gray-200 rounded-md text-[10px] font-semibold cursor-pointer ${catFilter === c ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>{c || 'All'}</button>)}
                        </div>
                        <button onClick={() => setShowNew(true)} className="px-3 py-1.5 bg-emerald-600 text-white border-none rounded-md text-[11px] font-bold cursor-pointer">+ New Goal</button>
                    </div>

                    {showNew && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mb-3">
                            <div className="font-bold text-xs mb-2">Create ESG Goal</div>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {[['Code', 'goalCode', 'text'], ['Name', 'goalName', 'text'], ['Unit', 'unit', 'text'], ['Owner', 'owner', 'text'], ['Baseline', 'baselineValue', 'number'], ['Target', 'targetValue', 'number'], ['Target Year', 'targetYear', 'number'], ['Subcategory', 'subcategory', 'text']].map(([lbl, key, type]) => (
                                    <div key={key} className="flex flex-col gap-0.5">
                                        <label className="text-[10px] font-bold">{lbl}</label>
                                        <Input type={type} value={(goalForm as any)[key]} onChange={e => setGoalForm(p => ({ ...p, [key]: e.target.value }))} className="px-2 py-1.5 border border-green-200 rounded-md text-[11px]" aria-label={lbl} />
                                    </div>
                                ))}
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[10px] font-bold">Category</label>
                                    <Select value={goalForm.category} onValueChange={v => setGoalForm(p => ({ ...p, category: v }))}>
                                        <SelectTrigger aria-label="Category" className="text-[11px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>{['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-1.5 justify-end">
                                <button onClick={() => setShowNew(false)} className="px-3 py-1.5 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                                <button disabled={!goalForm.goalCode || !goalForm.goalName} onClick={() => createGoalMut.mutate({ ...goalForm, baselineValue: parseFloat(goalForm.baselineValue) || null, targetValue: parseFloat(goalForm.targetValue) || null, targetYear: parseInt(goalForm.targetYear) || null })} className="px-3 py-1.5 bg-emerald-600 text-white border-none rounded-md text-[11px] font-bold cursor-pointer hover:bg-emerald-700 disabled:opacity-50">Save</button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3.5">
                        {/* Goals list */}
                        <div className="flex-1">
                            <div className="flex flex-col gap-1.5">
                                {goals.map(g => {
                                    const clr = STATUS_CLR[g.status] ?? 'bg-gray-100 text-gray-500';
                                    const catClr = CATEGORY_CLR[g.category] ?? 'bg-gray-500';
                                    const bdrClr = BORDER_CLR[g.category] ?? 'border-l-gray-500';
                                    const pct = g.target_value && g.baseline_value
                                        ? Math.min(100, Math.round(((Number(g.baseline_value)) / Number(g.target_value)) * 100))
                                        : 0;
                                    const p = Math.min(100, Math.floor(pct / 10) * 10);
                                    const wcls = p >= 100 ? 'w-full' : p >= 90 ? 'w-[90%]' : p >= 80 ? 'w-[80%]' : p >= 70 ? 'w-[70%]' : p >= 60 ? 'w-[60%]' : p >= 50 ? 'w-[50%]' : p >= 40 ? 'w-[40%]' : p >= 30 ? 'w-[30%]' : p >= 20 ? 'w-[20%]' : p >= 10 ? 'w-[10%]' : 'w-0';

                                    return (
                                        <div key={g.id} onClick={() => { setSelectedGoal(selectedGoal?.id === g.id ? null : g); setActualForm(a => ({ ...a, goalId: g.id })); }} className={`bg-white border hover:shadow-sm cursor-pointer border-l-[4px] rounded-xl px-3.5 py-2.5 ${selectedGoal?.id === g.id ? 'border-emerald-600' : 'border-gray-200'} ${bdrClr}`}>
                                            <div className="flex justify-between mb-1">
                                                <div className="font-bold text-[13px]">{g.goal_name}</div>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${clr}`}>{g.status}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mb-1.5">{g.goal_code} · {g.category} · {g.unit} · Owner: {g.owner ?? '—'}</div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`${wcls} ${catClr} h-full rounded-full`} />
                                                </div>
                                                <div className="text-[9px] text-gray-400 whitespace-nowrap">Target: {g.target_value ?? '—'} {g.unit} by {g.target_year}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {goals.length === 0 && <div className="text-center text-gray-400 p-8 bg-white rounded-xl">No ESG goals — create one</div>}
                            </div>
                        </div>

                        {/* Detail + Record actual */}
                        {selectedGoal && (
                            <div className="w-[280px] flex-shrink-0">
                                <div className="bg-white border border-gray-200 rounded-xl p-3.5 mb-2.5">
                                    <div className="font-bold text-[13px] mb-2">{selectedGoal.goal_name}</div>
                                    <div className="text-[11px] leading-relaxed text-gray-700">
                                        Baseline: <strong>{selectedGoal.baseline_value ?? '—'} {selectedGoal.unit}</strong><br />
                                        Target: <strong>{selectedGoal.target_value ?? '—'} {selectedGoal.unit}</strong> by <strong>{selectedGoal.target_year}</strong>
                                    </div>
                                    <div className="mt-2.5 text-[11px] font-bold mb-1.5">Actuals</div>
                                    {(performance?.actuals ?? []).map((a, i) => (
                                        <div key={i} className="flex justify-between text-[10px] border-b border-gray-100 pb-0.5 mb-0.5">
                                            <span className="text-gray-500">{a.period}</span>
                                            <span className="font-bold">{Number(a.actual_value).toFixed(2)} {selectedGoal.unit}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                    <div className="text-[11px] font-bold mb-2">Record Actual</div>
                                    {[['Period', 'period', 'text'], ['Value', 'actualValue', 'number'], ['Source', 'dataSource', 'text']].map(([lbl, key, type]) => (
                                        <div key={key} className="mb-1.5">
                                            <label className="text-[9px] font-bold block mb-0.5">{lbl}</label>
                                            <Input type={type} value={(actualForm as any)[key]} onChange={e => setActualForm(p => ({ ...p, [key]: e.target.value }))} className="w-full px-2 py-1 border border-green-200 rounded-[5px] text-[11px] box-border" aria-label={lbl} />
                                        </div>
                                    ))}
                                    <button disabled={!actualForm.actualValue} onClick={() => recordActualMut.mutate({ goalId: selectedGoal.id, period: actualForm.period, actualValue: parseFloat(actualForm.actualValue), dataSource: actualForm.dataSource || null })} className="w-full py-1.5 bg-emerald-600 text-white border-none rounded-md text-[10px] cursor-pointer font-bold disabled:opacity-50 hover:bg-emerald-700">Record</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {tab === 'budget' && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Input value={budgetPeriod} onChange={e => setBudgetPeriod(e.target.value)} placeholder="YYYY-MM" className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs" aria-label="Budget period" />
                        <span className="text-[11px] text-gray-400">Approved budget variance by cost center / GL account</span>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        {variance.length > 0 ? (
                            <InteractiveSpreadsheet
                                data={variance}
                                columns={varianceColumns}
                                virtualized={true}
                                containerHeight="500px"
                                onChange={() => { }}
                            />
                        ) : (
                            <div className="p-6 text-center text-gray-400">No approved budget controls for {budgetPeriod}</div>
                        )}
                    </div>
                </div>
            )}
        </StandardPage>
    );
}
