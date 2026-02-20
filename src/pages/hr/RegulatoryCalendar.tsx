import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface RegEvent {
    id: string; title: string; regulation: string; jurisdiction: string;
    event_type: string; due_date: string; status: string; owner_id: string;
    description: string; reminder_days: number; completed_at: string;
}
interface RegSummary { regulation: string; total: number; overdue: number; next_due: string; }
interface FCPASummary { training_module: string; total: number; completed_passed: number; overdue: number; in_progress: number; pending: number; completion_rate_pct: number; }

const STATUS_CLR: Record<string, string> = { Upcoming: '#1d4ed8', In_Progress: '#d97706', Completed: '#059669', Overdue: '#dc2626', Waived: '#6b7280' };
const REG_COLORS = ['#7c3aed', '#1d4ed8', '#059669', '#d97706', '#dc2626', '#ec4899', '#0891b2'];

function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

const REGULATIONS = ['GDPR', 'SOX', 'HIPAA', 'FCPA', 'EEOC', 'OSHA', 'ADA', 'CUSTOM'];
const EVENT_TYPES = ['FILING', 'AUDIT', 'TRAINING', 'POLICY_REVIEW', 'REPORTING', 'CERTIFICATION'];

export default function RegulatoryCalendar() {
    const [tab, setTab] = useState<'calendar' | 'fcpa' | 'new'>('calendar');
    const [regFilter, setRegFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [form, setForm] = useState({ title: '', regulation: 'GDPR', jurisdiction: 'US', eventType: 'FILING', dueDate: '', recurrence: 'NONE', description: '', reminderDays: '30' });
    const qc = useQueryClient();

    const { data: events = [] } = useQuery<RegEvent[]>({ queryKey: ['regcal', regFilter, statusFilter], queryFn: () => fetch(`/api/hr-analytics/regcal/events?${regFilter ? `regulation=${regFilter}&` : ''}${statusFilter ? `status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: dueSoon = [] } = useQuery<RegEvent[]>({ queryKey: ['regcal-soon'], queryFn: () => fetch('/api/hr-analytics/regcal/due-soon?days=60').then(r => r.json()) });
    const { data: regSummary = [] } = useQuery<RegSummary[]>({ queryKey: ['regcal-by-reg'], queryFn: () => fetch('/api/hr-analytics/regcal/by-regulation').then(r => r.json()) });
    const { data: fcpaSummary = [] } = useQuery<FCPASummary[]>({ queryKey: ['fcpa-summary'], queryFn: () => fetch('/api/hr-analytics/fcpa/summary').then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/hr-analytics/regcal/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['regcal', 'regcal-soon', 'regcal-by-reg'] }); setTab('calendar'); } });
    const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/hr-analytics/regcal/events/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, completedBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['regcal', 'regcal-soon', 'regcal-by-reg'] }) });
    const sweepMut = useMutation({ mutationFn: () => fetch('/api/hr-analytics/regcal/overdue-sweep', { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['regcal', 'regcal-soon'] }) });
    const fcpaSweepMut = useMutation({ mutationFn: () => fetch('/api/hr-analytics/fcpa/overdue-sweep', { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['fcpa-summary'] }) });

    const overdueCount = events.filter(e => e.status === 'Overdue').length;
    const upcomingCount = dueSoon.filter(e => e.status !== 'Overdue').length;

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Regulatory Calendar &amp; Compliance</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Filing deadlines · FCPA training compliance · Audit schedules</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => sweepMut.mutate()} style={{ padding: '7px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={11} /> Sweep Overdue</button>
                    <button onClick={() => setTab('new')} style={{ padding: '7px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Event</button>
                </div>
            </div>

            {/* Summary cards by regulation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 14 }}>
                {regSummary.map((r, i) => (
                    <div key={r.regulation} onClick={() => setRegFilter(regFilter === r.regulation ? '' : r.regulation)} style={{ background: '#fff', border: `1px solid ${REG_COLORS[i % REG_COLORS.length]}30`, borderLeft: `4px solid ${REG_COLORS[i % REG_COLORS.length]}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', opacity: regFilter && regFilter !== r.regulation ? 0.5 : 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: REG_COLORS[i % REG_COLORS.length] }}>{r.regulation ?? 'Other'}</div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>{r.total} events</div>
                        {Number(r.overdue) > 0 && <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 700 }}>⚑ {r.overdue} overdue</div>}
                        {r.next_due && <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>Next: {fmtDate(r.next_due)}</div>}
                    </div>
                ))}
            </div>

            {/* Alert banner */}
            {overdueCount > 0 && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={14} color="#dc2626" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{overdueCount} overdue regulatory event{overdueCount > 1 ? 's' : ''} require immediate attention</span>
                </div>
            )}
            {upcomingCount > 0 && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={12} color="#1d4ed8" />
                    <span style={{ fontSize: 12, color: '#1d4ed8' }}>{upcomingCount} event{upcomingCount > 1 ? 's' : ''} due within 60 days</span>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {(['calendar', 'fcpa', 'new'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: tab === t ? '#111827' : '#fff', color: tab === t ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {t === 'calendar' ? `Events (${events.length})` : t === 'fcpa' ? 'FCPA Training' : '+ New Event'}
                    </button>
                ))}
                {tab === 'calendar' && (
                    <>
                        {['', 'Upcoming', 'In_Progress', 'Completed', 'Overdue'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: statusFilter === s ? '#374151' : '#fff', color: statusFilter === s ? '#fff' : '#6b7280', fontSize: 10, fontWeight: 600, cursor: 'pointer', marginLeft: s === '' ? 6 : 0 }}>{s || 'All'}</button>
                        ))}
                        {regFilter && <button onClick={() => setRegFilter('')} style={{ padding: '5px 10px', border: '1px solid #1d4ed8', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}>✕ {regFilter}</button>}
                    </>
                )}
            </div>

            {/* Calendar events */}
            {tab === 'calendar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {events.map(e => {
                        const days = daysUntil(e.due_date);
                        const clr = STATUS_CLR[e.status] ?? '#6b7280';
                        return (
                            <div key={e.id} style={{ background: '#fff', border: `1px solid ${e.status === 'Overdue' ? '#fca5a5' : '#e5e7eb'}`, borderLeft: `4px solid ${clr}`, borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>{e.title}</span>
                                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: clr + '18', color: clr, fontWeight: 700 }}>{e.status}</span>
                                        {e.regulation && <span style={{ fontSize: 10, background: '#f3f4f6', borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>{e.regulation}</span>}
                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{e.event_type}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#6b7280' }}>Due: <strong>{fmtDate(e.due_date)}</strong> {e.status !== 'Completed' && <span style={{ color: days < 0 ? '#dc2626' : days < 14 ? '#d97706' : '#059669', fontWeight: 700 }}>({days < 0 ? Math.abs(days) + 'd overdue' : days + 'd remaining'})</span>}</div>
                                    {e.description && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{e.description}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                    {e.status !== 'Completed' && e.status !== 'Waived' && (
                                        <>
                                            {e.status === 'Upcoming' && <button onClick={() => statusMut.mutate({ id: e.id, status: 'In_Progress' })} style={{ padding: '3px 8px', background: '#fef3c7', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer', color: '#d97706', fontWeight: 600 }}>Start</button>}
                                            <button onClick={() => statusMut.mutate({ id: e.id, status: 'Completed' })} style={{ padding: '3px 8px', background: '#d1fae5', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}><CheckCircle2 size={9} />Complete</button>
                                            <button onClick={() => statusMut.mutate({ id: e.id, status: 'Waived' })} style={{ padding: '3px 8px', background: '#f3f4f6', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer', color: '#6b7280' }}>Waive</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {events.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No events — add regulatory filing deadlines or training events</div>}
                </div>
            )}

            {/* FCPA Training */}
            {tab === 'fcpa' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                        <button onClick={() => fcpaSweepMut.mutate()} style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={11} /> Sweep Overdue</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                        <thead><tr style={{ background: '#f9fafb' }}>
                            {['Module', 'Total', 'Passed', 'In Progress', 'Overdue', 'Pending', 'Completion %'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {fcpaSummary.map(s => {
                                const pct = Number(s.completion_rate_pct ?? 0);
                                return (
                                    <tr key={s.training_module} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 11 }}>{s.training_module.replace(/_/g, ' ')}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{s.total}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#059669', fontWeight: 700 }}>{s.completed_passed}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#d97706' }}>{s.in_progress}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: Number(s.overdue) > 0 ? '#dc2626' : '#374151', fontWeight: Number(s.overdue) > 0 ? 700 : 400 }}>{s.overdue}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#6b7280' }}>{s.pending}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 999, height: 6 }}>
                                                    <div style={{ width: pct + '%', background: pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#dc2626', height: '100%', borderRadius: 999 }} />
                                                </div>
                                                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {fcpaSummary.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No FCPA assignments yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* New Event form */}
            {tab === 'new' && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, maxWidth: 680 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>New Regulatory Event</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Title</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12 }} aria-label="Title" />
                        </div>
                        {[['regulation', 'Regulation', REGULATIONS], ['eventType', 'Event Type', EVENT_TYPES], ['recurrence', 'Recurrence', ['NONE', 'MONTHLY', 'QUARTERLY', 'ANNUAL']]].map(([k, l, opts]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <label style={{ fontSize: 10, fontWeight: 700 }}>{l}</label>
                                <select value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12 }} aria-label={l}>
                                    {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        {[['jurisdiction', 'Jurisdiction', 'text'], ['dueDate', 'Due Date', 'date'], ['reminderDays', 'Remind (days before)', 'number']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <label style={{ fontSize: 10, fontWeight: 700 }}>{l}</label>
                                <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12 }} aria-label={l} />
                            </div>
                        ))}
                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Description</label>
                            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12, resize: 'vertical' }} aria-label="Description" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                        <button onClick={() => setTab('calendar')} style={{ padding: '7px 16px', background: '#f3f4f6', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.title || !form.dueDate || createMut.isPending} onClick={() => createMut.mutate(form)} style={{ padding: '7px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Create Event</button>
                    </div>
                </div>
            )}
        </div>
    );
}
