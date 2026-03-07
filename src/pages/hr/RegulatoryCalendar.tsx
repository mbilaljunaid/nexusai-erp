import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useEnterpriseStore } from '@/lib/enterpriseStore';
import './RegulatoryCalendar.css';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface RegEvent {
    id: string; title: string; regulation: string; jurisdiction: string;
    event_type: string; due_date: string; status: string; owner_id: string;
    description: string; reminder_days: number; completed_at: string;
}
interface RegSummary { regulation: string; total: number; overdue: number; next_due: string; }
interface FCPASummary { training_module: string; total: number; completed_passed: number; overdue: number; in_progress: number; pending: number; completion_rate_pct: number; }

const STATUS_CLR: Record<string, string> = { Upcoming: '#1d4ed8', In_Progress: '#d97706', Completed: '#059669', Overdue: '#dc2626', Waived: '#6b7280' };
const REG_COLORS = ['#7c3aed', '#1d4ed8', '#059669', '#d97706', '#dc2626', '#ec4899', '#0891b2'];

function fmtDate(d: string) { return d ? formatDate(d) : '—'; }
function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

const REGULATIONS = ['GDPR', 'SOX', 'HIPAA', 'FCPA', 'EEOC', 'OSHA', 'ADA', 'CUSTOM'];
const EVENT_TYPES = ['FILING', 'AUDIT', 'TRAINING', 'POLICY_REVIEW', 'REPORTING', 'CERTIFICATION'];

export default function RegulatoryCalendar() {
    const [tab, setTab] = useState<'calendar' | 'fcpa' | 'new'>('calendar');
    const [regFilter, setRegFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [form, setForm] = useState({ title: '', regulation: 'GDPR', jurisdiction: 'US', eventType: 'FILING', dueDate: '', recurrence: 'NONE', description: '', reminderDays: '30' });
    const qc = useQueryClient();
    const { legalEntityId } = useEnterpriseStore();

    const { data: events = [] } = useQuery<RegEvent[]>({ queryKey: ['regcal', regFilter, statusFilter, legalEntityId], queryFn: () => fetch(`/api/hr-analytics/regcal/events?${regFilter ? `regulation=${regFilter}&` : ''}${statusFilter ? `status=${statusFilter}` : ''}`, { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()) });
    const { data: dueSoon = [] } = useQuery<RegEvent[]>({ queryKey: ['regcal-soon', legalEntityId], queryFn: () => fetch('/api/hr-analytics/regcal/due-soon?days=60', { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()) });
    const { data: regSummary = [] } = useQuery<RegSummary[]>({ queryKey: ['regcal-by-reg', legalEntityId], queryFn: () => fetch('/api/hr-analytics/regcal/by-regulation', { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()) });
    const { data: fcpaSummary = [] } = useQuery<FCPASummary[]>({ queryKey: ['fcpa-summary', legalEntityId], queryFn: () => fetch('/api/hr-analytics/fcpa/summary', { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/hr-analytics/regcal/events', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {}) }, body: JSON.stringify({ ...d, entLegalEntityId: legalEntityId }) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['regcal', 'regcal-soon', 'regcal-by-reg'] }); setTab('calendar'); } });
    const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/hr-analytics/regcal/events/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {}) }, body: JSON.stringify({ status, completedBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['regcal', 'regcal-soon', 'regcal-by-reg'] }) });
    const sweepMut = useMutation({ mutationFn: () => fetch('/api/hr-analytics/regcal/overdue-sweep', { method: 'POST', headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['regcal', 'regcal-soon'] }) });
    const fcpaSweepMut = useMutation({ mutationFn: () => fetch('/api/hr-analytics/fcpa/overdue-sweep', { method: 'POST', headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['fcpa-summary'] }) });

    const overdueCount = events.filter(e => e.status === 'Overdue').length;
    const upcomingCount = dueSoon.filter(e => e.status !== 'Overdue').length;

    const fcpaColumns: SpreadsheetColumn<any>[] = [
        { id: "training_module", header: "Module", width: "250px", cell: (row) => <span className="fcpa-td-bold">{row.training_module.replace(/_/g, ' ')}</span> },
        { id: "total", header: "Total", width: "100px", cell: (row) => <span className="fcpa-td-mono">{row.total}</span> },
        { id: "completed_passed", header: "Passed", width: "100px", cell: (row) => <span className="fcpa-td-mono fcpa-td-passed">{row.completed_passed}</span> },
        { id: "in_progress", header: "In Progress", width: "100px", cell: (row) => <span className="fcpa-td-mono fcpa-td-progress">{row.in_progress}</span> },
        { id: "overdue", header: "Overdue", width: "100px", cell: (row) => <span className={cn(`fcpa-td-mono ${Number(row.overdue) > 0 ? 'fcpa-td-overdue' : 'fcpa-td-pending'}`)}>{row.overdue}</span> },
        { id: "pending", header: "Pending", width: "100px", cell: (row) => <span className="fcpa-td-mono fcpa-td-pending">{row.pending}</span> },
        {
            id: "completion_rate_pct", header: "Completion %", width: "200px", cell: (row) => {
                const pct = Number(row.completion_rate_pct ?? 0);
                return (
                    <div className="progress-bar-container w-full">
                        <div className="progress-bar-bg flex-grow">
                            <style>{`
                                .fcpa-bar-w-${Math.round(pct)} { width: ${pct}%; }
                            `}</style>
                            <div className={cn(`progress-bar-fill fcpa-bar-w-${Math.round(pct)} ${pct >= 90 ? 'progress-safe' : pct >= 70 ? 'progress-warn' : 'progress-danger'}`)} />
                        </div>
                        <span className="progress-bar-text w-12 text-right">{pct}%</span>
                    </div>
                )
            }
        }
    ];

    return (
        <StandardPage
            title="Regulatory Calendar & Compliance"
            description="Filing deadlines · FCPA training compliance · Audit schedules"
            actions={
                <div className="regulatory-calendar-actions">
                    <Button variant="default" onClick={() => sweepMut.mutate()} className="btn-sweep"><RefreshCw className="h-[11px] w-[11px]"  /> Sweep Overdue</Button>
                    <Button variant="default" onClick={() => setTab('new')} className="btn-add">+ Add Event</Button>
                </div>
            }
            className="regulatory-calendar"
        >

            {/* Summary cards by regulation */}
            <div className="summary-grid">
                {regSummary.map((r, i) => (
                    <div key={r.regulation} onClick={() => setRegFilter(regFilter === r.regulation ? '' : r.regulation)} className={cn(`summary-card summary-card-color reg-color-${i % REG_COLORS.length} ${regFilter && regFilter !== r.regulation ? 'summary-card-dim' : 'summary-card-active'}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                        <div className={cn(`summary-card-title summary-card-title-color reg-color-${i % REG_COLORS.length}`)}>{r.regulation ?? 'Other'}</div>
                        <div className="summary-card-count">{r.total} events</div>
                        {Number(r.overdue) > 0 && <div className="summary-card-overdue">⚑ {r.overdue} overdue</div>}
                        {r.next_due && <div className="summary-card-next">Next: {fmtDate(r.next_due)}</div>}
                    </div>
                ))}
            </div>

            {/* Alert banner */}
            {overdueCount > 0 && (
                <div className="alert-overdue">
                    <AlertCircle className="h-3.5 w-3.5"  color="#dc2626" />
                    <span className="alert-overdue-text">{overdueCount} overdue regulatory event{overdueCount > 1 ? 's' : ''} require immediate attention</span>
                </div>
            )}
            {upcomingCount > 0 && (
                <div className="alert-upcoming">
                    <Calendar className="h-3 w-3"  color="#1d4ed8" />
                    <span className="alert-upcoming-text">{upcomingCount} event{upcomingCount > 1 ? 's' : ''} due within 60 days</span>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs-container">
                {(['calendar', 'fcpa', 'new'] as const).map(t => (
                    <Button variant="default" key={t} onClick={() => setTab(t)} className={cn(`btn-tab ${tab === t ? 'btn-tab-active' : 'btn-tab-inactive'}`)}>
                        {t === 'calendar' ? `Events (${events.length})` : t === 'fcpa' ? 'FCPA Training' : '+ New Event'}
                    </Button>
                ))}
                {tab === 'calendar' && (
                    <>
                        {['', 'Upcoming', 'In_Progress', 'Completed', 'Overdue'].map(s => (
                            <Button variant="default" key={s} onClick={() => setStatusFilter(s)} className={cn(`btn-filter ${statusFilter === s ? 'btn-filter-active' : 'btn-filter-inactive'} ${s === '' ? 'btn-filter-first' : ''}`)}>{s || 'All'}</Button>
                        ))}
                        {regFilter && <Button variant="default" onClick={() => setRegFilter('')} className="btn-filter-clear">✕ {regFilter}</Button>}
                    </>
                )}
            </div>

            {/* Calendar events */}
            {tab === 'calendar' && (
                <div className="events-list">
                    {events.map(e => {
                        const days = daysUntil(e.due_date);
                        const clrClass = `status-clr-${e.status in STATUS_CLR ? e.status : 'Unknown'}`;
                        return (
                            <div key={e.id} className={cn(`event-card event-card-${e.status === 'Overdue' ? 'Overdue' : 'Normal'} ${clrClass}`)}>
                                <div>
                                    <div className="event-header">
                                        <span className="event-title">{e.title}</span>
                                        <span className={cn(`event-status event-status-color ${clrClass}`)}>{e.status}</span>
                                        {e.regulation && <span className="event-regulation">{e.regulation}</span>}
                                        <span className="event-type">{e.event_type}</span>
                                    </div>
                                    <div className="event-due">Due: <strong>{fmtDate(e.due_date)}</strong> {e.status !== 'Completed' && <span className={cn(`${days < 0 ? 'event-due-overdue' : days < 14 ? 'event-due-soon' : 'event-due-safe'}`)}>({days < 0 ? Math.abs(days) + 'd overdue' : days + 'd remaining'})</span>}</div>
                                    {e.description && <div className="event-desc">{e.description}</div>}
                                </div>
                                <div className="event-actions">
                                    {e.status !== 'Completed' && e.status !== 'Waived' && (
                                        <>
                                            {e.status === 'Upcoming' && <Button variant="default" onClick={() => statusMut.mutate({ id: e.id, status: 'In_Progress' })} className="btn-action-start">Start</Button>}
                                            <Button variant="default" onClick={() => statusMut.mutate({ id: e.id, status: 'Completed' })} className="btn-action-complete"><CheckCircle2 className="h-[9px] w-[9px]"  />Complete</Button>
                                            <Button variant="default" onClick={() => statusMut.mutate({ id: e.id, status: 'Waived' })} className="btn-action-waive">Waive</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {events.length === 0 && <div className="no-events">No events — add regulatory filing deadlines or training events</div>}
                </div>
            )}

            {/* FCPA Training */}
            {tab === 'fcpa' && (
                <div className="fcpa-container">
                    <div className="fcpa-header">
                        <Button variant="default" onClick={() => fcpaSweepMut.mutate()} className="btn-sweep"><RefreshCw className="h-[11px] w-[11px]"  /> Sweep Overdue</Button>
                    </div>
                    <div className="min-h-72 h-full border border-gray-200 rounded-lg">
                        <InteractiveSpreadsheet
                            columns={fcpaColumns}
                            data={fcpaSummary}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                        {fcpaSummary.length === 0 && <div className="no-events p-4 text-center text-muted-foreground border-t">No FCPA assignments yet</div>}
                    </div>
                </div>
            )}

            {/* New Event form */}
            {tab === 'new' && (
                <div className="form-container">
                    <div className="form-title">New Regulatory Event</div>
                    <div className="form-grid">
                        <div className="form-group-full">
                            <Label className="form-label">Title</Label>
                            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="form-input h-9 text-[13px]" aria-label="Title" />
                        </div>
                        {[['regulation', 'Regulation', REGULATIONS], ['eventType', 'Event Type', EVENT_TYPES], ['recurrence', 'Recurrence', ['NONE', 'MONTHLY', 'QUARTERLY', 'ANNUAL']]].map(([k, l, opts]) => (
                            <div key={k as string} className="form-group">
                                <Label className="form-label">{l as string}</Label>
                                <Select value={(form as any)[k as string]} onValueChange={v => setForm(p => ({ ...p, [k as string]: v }))}>
                                    <SelectTrigger className="form-input" aria-label={l as string}><SelectValue /></SelectTrigger>
                                    <SelectContent>{(opts as string[]).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        ))}
                        {[['jurisdiction', 'Jurisdiction', 'text'], ['dueDate', 'Due Date', 'date'], ['reminderDays', 'Remind (days before)', 'number']].map(([k, l, t]) => (
                            <div key={k as string} className="form-group">
                                <Label className="form-label">{l as string}</Label>
                                <Input type={t as string} value={(form as any)[k as string] as string} onChange={e => setForm(p => ({ ...p, [k as string]: e.target.value }))} className="form-input h-9 text-[13px]" aria-label={l as string} />
                            </div>
                        ))}
                        <div className="form-group-full">
                            <Label className="form-label">Description</Label>
                            <Textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="form-textarea" aria-label="Description" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <Button variant="default" onClick={() => setTab('calendar')} className="btn-cancel">Cancel</Button>
                        <Button variant="default" disabled={!form.title || !form.dueDate || createMut.isPending} onClick={() => createMut.mutate(form)} className="btn-submit">Create Event</Button>
                    </div>
                </div>
            )}
        </StandardPage>
    );
}
