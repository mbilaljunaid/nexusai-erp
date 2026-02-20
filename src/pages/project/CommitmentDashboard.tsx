import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, Bell, TrendingDown, CheckCheck } from 'lucide-react';

interface BudgetAlert { id: string; project_id: string; alert_type: string; severity: string; budget_amount: number; actual_amount: number; variance_pct: number; description: string; is_acknowledged: boolean; created_at: string; }
interface AlertSummary { critical: number; warnings: number; info: number; acknowledged: number; }
interface VarRow { resource_id: string; resource_type: string; role: string; period_start: string; period_end: string; planned_hours: number; actual_hours: number; hour_variance: number; planned_cost: number; actual_cost: number; cost_variance: number; variance_pct: number; }

function fmt(n: any) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; }

const SEV_CFG: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
    Critical: { bg: '#fee2e2', color: '#dc2626', icon: AlertOctagon },
    Warning: { bg: '#fef3c7', color: '#d97706', icon: Bell },
    Info: { bg: '#eff6ff', color: '#1d4ed8', icon: Bell },
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

    return (
        <div style={{ padding: 24, maxWidth: 1300, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Budget Exception &amp; Variance Dashboard</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Cost overrun alerts · Resource plan vs actuals · Threshold detection</p>
                </div>
                <button onClick={() => detectMut.mutate()} disabled={detectMut.isPending} style={{ padding: '8px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingDown size={13} /> Run Exception Detection
                </button>
            </div>

            {/* Global KPIs */}
            {summary && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    {[['Critical', summary.critical, '#dc2626'], ['Warnings', summary.warnings, '#d97706'], ['Info', summary.info, '#1d4ed8'], ['Acknowledged', summary.acknowledged, '#059669']].map(([l, v, c]) => (
                        <div key={l as string} style={{ background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 18px', flex: 1 }}>
                            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: c as string }}>{v}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{l}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Project picker */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input placeholder="Enter Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 12, minWidth: 220 }} aria-label="Project ID" />
                <button disabled={!projectId} onClick={() => setActiveProject(projectId)} style={{ padding: '7px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Load</button>
            </div>

            {activeProject && (
                <>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                        {(['alerts', 'variance'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: tab === t ? '#111827' : '#fff', color: tab === t ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                {t === 'alerts' ? `Budget Alerts (${alerts.length})` : 'Resource Variance'}
                            </button>
                        ))}
                        {tab === 'alerts' && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', fontSize: 11, cursor: 'pointer' }}>
                                <input type="checkbox" checked={showAck} onChange={e => setShowAck(e.target.checked)} />
                                Show acknowledged
                            </label>
                        )}
                    </div>

                    {tab === 'alerts' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {alerts.map(a => {
                                const cfg = SEV_CFG[a.severity] ?? SEV_CFG.Info;
                                const Icon = cfg.icon;
                                return (
                                    <div key={a.id} style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, borderLeft: `4px solid ${cfg.color}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                <Icon size={13} color={cfg.color} />
                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{a.alert_type.replace(/_/g, ' ')}</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{a.severity}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: '#374151' }}>{a.description}</div>
                                            {a.budget_amount && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Budget: {fmt(a.budget_amount)} · Actual: {fmt(a.actual_amount)} · Variance: {Number(a.variance_pct).toFixed(1)}%</div>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 10, color: '#9ca3af' }}>{fmtDate(a.created_at)}</span>
                                            {!a.is_acknowledged && (
                                                <button onClick={() => ackMut.mutate(a.id)} style={{ padding: '4px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <CheckCheck size={10} /> Acknowledge
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {alerts.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>{showAck ? 'No acknowledged alerts' : '✓ No open budget alerts'}</div>}
                        </div>
                    )}

                    {tab === 'variance' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                            <thead><tr style={{ background: '#f9fafb' }}>
                                {['Resource', 'Type', 'Period', 'Plan Hrs', 'Act Hrs', 'Δ Hrs', 'Plan Cost', 'Act Cost', 'Δ Cost', 'Var %'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {variance.map((v, i) => {
                                    const overBudget = Number(v.variance_pct) > 0;
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: overBudget ? '#fff7ed' : undefined }}>
                                            <td style={{ padding: '9px 12px', fontWeight: 600 }}>{v.resource_id}</td>
                                            <td style={{ padding: '9px 12px', fontSize: 10, fontFamily: 'monospace', color: '#6b7280' }}>{v.resource_type}</td>
                                            <td style={{ padding: '9px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(v.period_start)}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{v.planned_hours}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{v.actual_hours}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: v.hour_variance < 0 ? '#dc2626' : '#059669' }}>{v.hour_variance > 0 ? '+' : ''}{v.hour_variance}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{fmt(v.planned_cost)}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{fmt(v.actual_cost)}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: v.cost_variance < 0 ? '#dc2626' : '#059669' }}>{v.cost_variance > 0 ? '+' : ''}{fmt(v.cost_variance)}</td>
                                            <td style={{ padding: '9px 12px', fontWeight: 700, color: overBudget ? '#dc2626' : '#059669' }}>{overBudget ? '+' : ''}{Number(v.variance_pct).toFixed(1)}%</td>
                                        </tr>
                                    );
                                })}
                                {variance.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No variance data — load a project with resource plans</td></tr>}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}
