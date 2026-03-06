import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, Bell, TrendingDown, CheckCheck } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { Checkbox } from "@/components/ui/checkbox";


interface BudgetAlert { id: string; project_id: string; alert_type: string; severity: string; budget_amount: number; actual_amount: number; variance_pct: number; description: string; is_acknowledged: boolean; created_at: string; }
interface AlertSummary { critical: number; warnings: number; info: number; acknowledged: number; }
interface VarRow { id: string; resource_id: string; resource_type: string; role: string; period_start: string; period_end: string; planned_hours: number; actual_hours: number; hour_variance: number; planned_cost: number; actual_cost: number; cost_variance: number; variance_pct: number; }

function fmt(n: any) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtDate(d: string) { return d ? formatDate(d) : '—'; }

const SEV_CFG: Record<string, { bg: string; color: string; border: string; borderLeft: string; iconColor: string; icon: React.ElementType }> = {
    Critical: { bg: 'bg-red-100', color: 'text-red-600', border: 'border-red-600/30', borderLeft: 'border-l-red-600', iconColor: '#dc2626', icon: AlertOctagon },
    Warning: { bg: 'bg-amber-100', color: 'text-amber-600', border: 'border-amber-600/30', borderLeft: 'border-l-amber-600', iconColor: '#d97706', icon: Bell },
    Info: { bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-700/30', borderLeft: 'border-l-blue-700', iconColor: '#1d4ed8', icon: Bell },
};

export default function CommitmentDashboard() {
    const [tab, setTab] = useState<'alerts' | 'variance'>('alerts');
    const [projectId, setProjectId] = useState('');
    const [activeProject, setActiveProject] = useState('');
    const [showAck, setShowAck] = useState(false);
    const qc = useQueryClient();

    const { data: summary } = useQuery<AlertSummary>({ queryKey: ['alert-summary'], queryFn: () => fetch('/api/project/budget-alerts/summary').then(r => r.json()) });
    const { data: alerts = [] } = useQuery<BudgetAlert[]>({ queryKey: ['alerts', activeProject, showAck], enabled: !!activeProject, queryFn: () => fetch(`/api/project/budget-alerts?projectId=${activeProject}&acknowledged=${showAck}`).then(r => r.json()) });
    const { data: variance = [] } = useQuery<VarRow[]>({ queryKey: ['variance', activeProject], enabled: !!activeProject && tab === 'variance', queryFn: () => fetch(`/api/project/resource-variance?projectId=${activeProject}`).then(r => r.json()) });

    const ackMut = useMutation({
        mutationFn: (id: string) => fetch(`/api/project/budget-alerts/${id}/acknowledge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acknowledgedBy: 'current-user' }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', activeProject, 'alert-summary'] }),
    });
    const detectMut = useMutation({
        mutationFn: () => fetch('/api/project/budget-alerts/detect', { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', activeProject, 'alert-summary'] }),
    });

    const varColumns: SpreadsheetColumn<VarRow>[] = [
        { id: "resource", header: "Resource", width: "150px", cell: (v) => <span className="font-semibold">{v.resource_id}</span> },
        { id: "type", header: "Type", width: "150px", cell: (v) => <span className="text-[10px] font-mono text-gray-500">{v.resource_type}</span> },
        { id: "period", header: "Period", width: "100px", cell: (v) => <span className="text-gray-500 whitespace-nowrap">{fmtDate(v.period_start)}</span> },
        { id: "planHrs", header: "Plan Hrs", width: "100px", cell: (v) => <span className="font-mono">{v.planned_hours}</span> },
        { id: "actHrs", header: "Act Hrs", width: "100px", cell: (v) => <span className="font-mono">{v.actual_hours}</span> },
        { id: "delHrs", header: "Δ Hrs", width: "100px", cell: (v) => <span className={cn(`font-mono ${v.hour_variance < 0 ? 'text-red-600' : 'text-emerald-600'}`)}>{v.hour_variance > 0 ? '+' : ''}{v.hour_variance}</span> },
        { id: "planCost", header: "Plan Cost", width: "120px", cell: (v) => <span className="font-mono">{fmt(v.planned_cost)}</span> },
        { id: "actCost", header: "Act Cost", width: "120px", cell: (v) => <span className="font-mono">{fmt(v.actual_cost)}</span> },
        { id: "delCost", header: "Δ Cost", width: "120px", cell: (v) => <span className={cn(`font-mono ${v.cost_variance < 0 ? 'text-red-600' : 'text-emerald-600'}`)}>{v.cost_variance > 0 ? '+' : ''}{fmt(v.cost_variance)}</span> },
        {
            id: "varPct", header: "Var %", width: "100px", cell: (v) => {
                const overBudget = Number(v.variance_pct) > 0;
                return <span className={cn(`font-bold ${overBudget ? 'text-red-600' : 'text-emerald-600'}`)}>{overBudget ? '+' : ''}{Number(v.variance_pct).toFixed(1)}%</span>;
            }
        },
    ];

    return (
        <StandardPage title="Budget Exception &amp; Variance Dashboard">
            <div className="flex justify-between mb-4">
                <div>

                    <p className="text-[13px] text-gray-500 mt-1 mb-0">Cost overrun alerts · Resource plan vs actuals · Threshold detection</p>
                </div>
                <button onClick={() => detectMut.mutate()} disabled={detectMut.isPending} className="py-2 px-3.5 bg-purple-600 text-white border-none rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-50">
                    <TrendingDown size={13} /> Run Exception Detection
                </button>
            </div>

            {/* Global KPIs */}
            {summary && (
                <div className="flex gap-2.5 mb-3.5">
                    {(
                        [
                            ['Critical', summary.critical, 'text-red-600', 'border-l-red-600'],
                            ['Warnings', summary.warnings, 'text-amber-600', 'border-l-amber-600'],
                            ['Info', summary.info, 'text-blue-700', 'border-l-blue-700'],
                            ['Acknowledged', summary.acknowledged, 'text-emerald-600', 'border-l-emerald-600']
                        ] as const
                    ).map(([l, v, textClass, borderClass]) => (
                        <div key={l as string} className={cn(`bg-white border border-gray-200 rounded-xl py-2.5 px-4 flex-1 border-l-[4px] ${borderClass}`)}>
                            <div className={cn(`text-[22px] font-extrabold font-mono ${textClass}`)}>{v as number}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{l as string}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Project picker */}
            <div className="flex gap-2 mb-3">
                <Input placeholder="Enter Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} className="text-xs min-w-56 h-8" aria-label="Project ID" />
                <button disabled={!projectId} onClick={() => setActiveProject(projectId)} className="py-1.5 px-4 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50">Load</button>
            </div>

            {activeProject && (
                <>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3">
                        <div className="flex gap-1">
                            {(['alerts', 'variance'] as const).map(t => (
                                <button key={t} onClick={() => setTab(t)} className={cn(`py-1.5 px-4 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer ${tab === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`)}>
                                    {t === 'alerts' ? `Budget Alerts (${alerts.length})` : 'Resource Variance'}
                                </button>
                            ))}
                        </div>
                        {tab === 'alerts' && (
                            <label className="flex items-center gap-1.5 ml-auto text-[11px] cursor-pointer">
                                <Checkbox checked={showAck} onCheckedChange={c => setShowAck(!!c)} className="m-0" />
                                Show acknowledged
                            </label>
                        )}
                    </div>

                    {tab === 'alerts' && (
                        <div className="flex flex-col gap-1.5">
                            {alerts.map(a => {
                                const cfg = SEV_CFG[a.severity] ?? SEV_CFG.Info;
                                const Icon = cfg.icon;
                                return (
                                    <div key={a.id} className={cn(`rounded-xl p-2.5 px-3.5 flex justify-between items-center border border-l-[4px] ${cfg.bg} ${cfg.border} ${cfg.borderLeft}`)}>
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Icon size={13} color={cfg.iconColor} />
                                                <span className="text-xs font-bold text-gray-900">{a.alert_type.replace(/_/g, ' ')}</span>
                                                <span className={cn(`text-[10px] font-bold ${cfg.color}`)}>{a.severity}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-700">{a.description}</div>
                                            {a.budget_amount && <div className="text-[10px] text-gray-500 mt-0.5">Budget: {fmt(a.budget_amount)} · Actual: {fmt(a.actual_amount)} · Variance: {Number(a.variance_pct).toFixed(1)}%</div>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">{fmtDate(a.created_at)}</span>
                                            {!a.is_acknowledged && (
                                                <button onClick={() => ackMut.mutate(a.id)} className="py-1 px-2.5 bg-emerald-600 text-white border-none rounded-md text-[10px] font-semibold cursor-pointer flex items-center gap-1">
                                                    <CheckCheck size={10} /> Acknowledge
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {alerts.length === 0 && <div className="text-center text-gray-400 p-6">{showAck ? 'No acknowledged alerts' : '✓ No open budget alerts'}</div>}
                        </div>
                    )}

                    {tab === 'variance' && (
                        <div className="min-h-[400px] h-full border border-gray-200 rounded-xl">
                            <InteractiveSpreadsheet
                                columns={varColumns}
                                data={variance}
                                onChange={() => { }}
                                containerHeight="600px"
                            />
                        </div>
                    )}
                </>
            )}
        </StandardPage>
    );
}
