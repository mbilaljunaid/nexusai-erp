import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';

interface RevEvent { id: string; period_start: string; period_end: string; pct_complete: number; costs_incurred: number; costs_to_complete: number; revenue_recognized: number; cumulative_revenue: number; gl_posted: boolean; gl_reference: string; method: string; contract_value: number; }
interface RevSummary { method: string; contract_value: number; total_recognized: number; cumulative: number; remaining: number; pct_recognized: number; period_count: number; gl_posted_count: number; }

function fmt(n: number | string) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'; }

const METHODS = ['POC', 'MILESTONE', 'TIME_MATERIALS', 'COMPLETED_CONTRACT'] as const;

export default function RevenueRecognition() {
    const [projectId, setProjectId] = useState('');
    const [activeProject, setActiveProject] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [showRecognize, setShowRecognize] = useState(false);
    const [setup, setSetup] = useState({ method: 'POC', contractValue: '', currencyCode: 'USD', startDate: '', endDate: '' });
    const [recognize, setRecognize] = useState({ periodStart: '', periodEnd: '', costsIncurred: '', costsToComplete: '', pctCompleteOverride: '', milestoneAmount: '' });
    const qc = useQueryClient();

    const { data: summary } = useQuery<RevSummary>({ queryKey: ['rev-summary', activeProject], enabled: !!activeProject, queryFn: () => fetch(`/api/project/revenue-summary?projectId=${activeProject}`).then(r => r.json()) });
    const { data: events = [] } = useQuery<RevEvent[]>({ queryKey: ['rev-events', activeProject], enabled: !!activeProject, queryFn: () => fetch(`/api/project/revenue-events?projectId=${activeProject}`).then(r => r.json()) });

    const setupMut = useMutation({
        mutationFn: (d: any) => fetch('/api/project/revenue-methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rev-summary', activeProject] }); setShowSetup(false); },
    });
    const recognizeMut = useMutation({
        mutationFn: (d: any) => fetch('/api/project/revenue-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rev-events', activeProject, 'rev-summary', activeProject] }); setShowRecognize(false); },
    });
    const postGLMut = useMutation({
        mutationFn: ({ id }: { id: string }) => fetch(`/api/project/revenue-events/${id}/post-gl`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postedBy: 'current-user', glReference: 'GL-' + Date.now() }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['rev-events', activeProject] }),
    });

    const pctNum = summary ? Math.min(100, Math.round(Number(summary.pct_recognized))) : 0;

    return (
        <div style={{ padding: 24, maxWidth: 1300, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Revenue Recognition</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>POC · Milestone · Time &amp; Materials · Completed Contract — ASC 606/IFRS 15</p>
                </div>
            </div>

            {/* Project picker */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input placeholder="Enter Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 12, minWidth: 220 }} aria-label="Project ID" />
                <button disabled={!projectId} onClick={() => setActiveProject(projectId)} style={{ padding: '7px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Load Project</button>
                {activeProject && <button onClick={() => setShowSetup(true)} style={{ padding: '7px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>⚙ Setup Method</button>}
                {activeProject && summary && <button onClick={() => setShowRecognize(true)} style={{ padding: '7px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Recognize Revenue</button>}
            </div>

            {activeProject && summary && (
                <>
                    {/* Summary bar */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
                            {[['Method', summary.method], ['Contract Value', 'USD ' + fmt(summary.contract_value)], ['Recognized', 'USD ' + fmt(summary.total_recognized)], ['Remaining', 'USD ' + fmt(summary.remaining)], ['Periods', summary.period_count], ['GL Posted', summary.gl_posted_count + '/' + summary.period_count]].map(([l, v]) => (
                                <div key={l as string}>
                                    <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'monospace' }}>{v}</div>
                                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                        {/* progress bar */}
                        <div style={{ background: '#f3f4f6', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                            <div style={{ width: pctNum + '%', background: pctNum >= 90 ? '#059669' : '#1d4ed8', height: '100%', borderRadius: 999, transition: 'width .4s' }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{pctNum}% recognized of contract value</div>
                    </div>

                    {/* Setup form */}
                    {showSetup && (
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Setup Recognition Method — Project {activeProject}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <label style={{ fontSize: 10, fontWeight: 600 }}>Method</label>
                                    <select value={setup.method} onChange={e => setSetup(p => ({ ...p, method: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Revenue method">
                                        {METHODS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                {[['contractValue', 'Contract Value', 'number'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date']].map(([k, l, t]) => (
                                    <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                        <input type={t} value={(setup as any)[k]} onChange={e => setSetup(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button onClick={() => setShowSetup(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                <button disabled={!setup.contractValue} onClick={() => setupMut.mutate({ ...setup, projectId: activeProject })} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Save Method</button>
                            </div>
                        </div>
                    )}

                    {/* Recognize form */}
                    {showRecognize && (
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Recognize Revenue — {summary.method}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                {[['periodStart', 'Period Start', 'date'], ['periodEnd', 'Period End', 'date'], ['costsIncurred', 'Costs Incurred', 'number'], ['costsToComplete', 'Costs to Complete', 'number'], ...(summary.method === 'POC' ? [['pctCompleteOverride', '% Complete Override', 'number']] : []), ...(summary.method === 'MILESTONE' ? [['milestoneAmount', 'Milestone Amount', 'number']] : [])].map(([k, l, t]) => (
                                    <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                        <input type={t} value={(recognize as any)[k] ?? ''} onChange={e => setRecognize(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button onClick={() => setShowRecognize(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                <button disabled={!recognize.periodStart || recognizeMut.isPending} onClick={() => recognizeMut.mutate({ ...recognize, projectId: activeProject })} style={{ padding: '5px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Recognize</button>
                            </div>
                        </div>
                    )}

                    {/* Events table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                        <thead><tr style={{ background: '#f9fafb' }}>
                            {['Period', '% Complete', 'Costs Incurred', 'Costs to Complete', 'Recognized', 'Cumulative', 'GL', ''].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {events.map(e => (
                                <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>{fmtDate(e.period_start)} – {fmtDate(e.period_end)}</td>
                                    <td style={{ padding: '9px 12px' }}>{(Number(e.pct_complete) * 100).toFixed(1)}%</td>
                                    <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{fmt(e.costs_incurred)}</td>
                                    <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{fmt(e.costs_to_complete)}</td>
                                    <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>{fmt(e.revenue_recognized)}</td>
                                    <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#6b7280' }}>{fmt(e.cumulative_revenue)}</td>
                                    <td style={{ padding: '9px 12px' }}>
                                        {e.gl_posted ? <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#059669', fontSize: 10, fontWeight: 700 }}><CheckCircle2 size={11} /> Posted</span>
                                            : <span style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>Pending</span>}
                                    </td>
                                    <td style={{ padding: '9px 12px' }}>
                                        {!e.gl_posted && <button onClick={() => postGLMut.mutate({ id: e.id })} style={{ padding: '3px 8px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>Post GL</button>}
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No recognition events — search a project and recognize revenue</td></tr>}
                        </tbody>
                    </table>
                </>
            )}

            {!activeProject && (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                    <BarChart2 size={32} style={{ marginBottom: 8, opacity: .4 }} />
                    <p style={{ fontSize: 13 }}>Enter a project ID to load revenue recognition schedule</p>
                </div>
            )}
        </div>
    );
}
