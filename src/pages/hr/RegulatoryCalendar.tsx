import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useEnterpriseStore } from '@/lib/enterpriseStore';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
                    <div className="w-full flex items-center gap-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex-grow">
                            <div className={cn(`h-full rounded-full transition-all ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] w-8 text-right font-medium">{pct}%</span>
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
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => sweepMut.mutate()} className="h-8 text-[11px] flex gap-1.5"><RefreshCw className="h-[11px] w-[11px]" /> Sweep Overdue</Button>
                    <Button size="sm" onClick={() => setTab('new')} className="h-8 text-[11px] px-3.5 bg-blue-700 hover:bg-blue-800 text-white border-none">+ Add Event</Button>
                </div>
            }
            className="p-6 max-w-[1400px] mx-auto font-sans"
        >

            {/* Summary cards by regulation */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mb-4">
                {regSummary.map((r, i) => (
                    <Button key={r.regulation} variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setRegFilter(regFilter === r.regulation ? '' : r.regulation)}>
                        <div className={cn(`bg-card border border-border rounded-xl p-3 cursor-pointer transition-all ${regFilter && regFilter !== r.regulation ? 'opacity-50 grayscale hover:grayscale-0' : 'hover:border-primary/50 shadow-sm'}`)} style={{ borderTopWidth: '4px', borderTopColor: REG_COLORS[i % REG_COLORS.length] }}>
                            <div className="text-[13px] font-extrabold" style={{ color: REG_COLORS[i % REG_COLORS.length] }}>{r.regulation ?? 'Other'}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{r.total} events</div>
                            {Number(r.overdue) > 0 && <div className="text-[10px] text-red-600 font-bold mt-1">⚑ {r.overdue} overdue</div>}
                            {r.next_due && <div className="text-[10px] text-muted-foreground mt-1 font-medium">Next: {fmtDate(r.next_due)}</div>}
                        </div>
                    </Button>
                ))}
            </div>

            {/* Alert banner */}
            {overdueCount > 0 && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg py-2.5 px-3.5 mb-4 flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">{overdueCount} overdue regulatory event{overdueCount > 1 ? 's' : ''} require immediate attention</span>
                </div>
            )}
            {upcomingCount > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg py-2.5 px-3.5 mb-4 flex items-center gap-2.5 shadow-sm">
                    <Calendar className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{upcomingCount} event{upcomingCount > 1 ? 's' : ''} due within 60 days</span>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="calendar" value={tab as any} onValueChange={setTab as any} className="w-full mb-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="calendar" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Events ({events.length})</TabsTrigger>
                    <TabsTrigger value="fcpa" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">FCPA Training</TabsTrigger>
                    <TabsTrigger value="new" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">+ New Event</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Calendar events */}
            {tab === 'calendar' && (
                <div className="flex flex-col gap-2">
                    {events.map(e => {
                        const days = daysUntil(e.due_date);
                        return (
                            <div key={e.id} className={cn(`bg-card rounded-xl p-3.5 px-5 flex justify-between items-center border ${e.status === 'Overdue' ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 shadow-sm' : 'border-border shadow-sm'}`)}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[14px] font-bold text-foreground">{e.title}</span>
                                        <Badge variant="outline" className="text-[10px] h-[18px] px-1.5 font-bold uppercase tracking-wider bg-background/50" style={{ color: STATUS_CLR[e.status] || '#6b7280', borderColor: STATUS_CLR[e.status] || '#e5e7eb' }}>{e.status}</Badge>
                                        {e.regulation && <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-semibold">{e.regulation}</span>}
                                        <span className="text-[11px] text-muted-foreground ml-1">{e.event_type}</span>
                                    </div>
                                    <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                                        Due: <strong className="text-foreground">{fmtDate(e.due_date)}</strong>
                                        {e.status !== 'Completed' && e.status !== 'Waived' && (
                                            <span className={cn(`font-semibold text-[11px] ml-1 ${days < 0 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-emerald-600'}`)}>
                                                ({days < 0 ? Math.abs(days) + 'd overdue' : days + 'd remaining'})
                                            </span>
                                        )}
                                    </div>
                                    {e.description && <div className="text-[11px] text-muted-foreground/80 mt-1 max-w-3xl truncate">{e.description}</div>}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {e.status !== 'Completed' && e.status !== 'Waived' && (
                                        <>
                                            {e.status === 'Upcoming' && <Button variant="outline" size="sm" onClick={() => statusMut.mutate({ id: e.id, status: 'In_Progress' })} className="h-7 px-3 text-[11px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-semibold shadow-sm">Start</Button>}
                                            <Button variant="outline" size="sm" onClick={() => statusMut.mutate({ id: e.id, status: 'Completed' })} className="h-7 px-3 text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold shadow-sm gap-1.5"><CheckCircle2 className="h-3 w-3" /> Complete</Button>
                                            <Button variant="ghost" size="sm" onClick={() => statusMut.mutate({ id: e.id, status: 'Waived' })} className="h-7 px-3 text-[11px] text-muted-foreground hover:text-foreground">Waive</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {events.length === 0 && <div className="text-center text-muted-foreground p-12 border border-dashed border-border rounded-xl">No events — add regulatory filing deadlines or training events</div>}
                </div>
            )}

            {/* FCPA Training */}
            {tab === 'fcpa' && (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-end mb-2">
                        <Button variant="outline" size="sm" onClick={() => fcpaSweepMut.mutate()} className="h-8 text-[11px] flex gap-1.5"><RefreshCw className="h-[11px] w-[11px]" /> Sweep Overdue</Button>
                    </div>
                    <div className="min-h-72 h-full border border-border rounded-xl shadow-sm overflow-hidden bg-card">
                        <InteractiveSpreadsheet
                            columns={fcpaColumns}
                            data={fcpaSummary}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                        {fcpaSummary.length === 0 && <div className="text-center text-muted-foreground p-12 border-t border-border">No FCPA assignments yet</div>}
                    </div>
                </div>
            )}

            {/* New Event form */}
            {tab === 'new' && (
                <div className="bg-card rounded-xl p-6 border border-border max-w-2xl mx-auto shadow-sm mt-4">
                    <div className="text-lg font-bold mb-6">New Regulatory Event</div>
                    <div className="grid grid-cols-2 gap-5 mb-8">
                        <div className="col-span-2 flex flex-col gap-2">
                            <Label className="text-xs font-semibold text-foreground">Title</Label>
                            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="h-9 text-[13px] rounded-md" aria-label="Title" />
                        </div>
                        {[['regulation', 'Regulation', REGULATIONS], ['eventType', 'Event Type', EVENT_TYPES], ['recurrence', 'Recurrence', ['NONE', 'MONTHLY', 'QUARTERLY', 'ANNUAL']]].map(([k, l, opts]) => (
                            <div key={k as string} className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold text-foreground">{l as string}</Label>
                                <Select value={(form as any)[k as string]} onValueChange={v => setForm(p => ({ ...p, [k as string]: v }))}>
                                    <SelectTrigger className="h-9 text-[13px] rounded-md" aria-label={l as string}><SelectValue /></SelectTrigger>
                                    <SelectContent>{(opts as string[]).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        ))}
                        {[['jurisdiction', 'Jurisdiction', 'text'], ['dueDate', 'Due Date', 'date'], ['reminderDays', 'Remind (days before)', 'number']].map(([k, l, t]) => (
                            <div key={k as string} className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold text-foreground">{l as string}</Label>
                                <Input type={t as string} value={(form as any)[k as string] as string} onChange={e => setForm(p => ({ ...p, [k as string]: e.target.value }))} className="h-9 text-[13px] rounded-md" aria-label={l as string} />
                            </div>
                        ))}
                        <div className="col-span-2 flex flex-col gap-2">
                            <Label className="text-xs font-semibold text-foreground">Description</Label>
                            <Textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="min-h-[80px] text-[13px] rounded-md" aria-label="Description" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-5 border-t border-border/60">
                        <Button variant="outline" size="sm" onClick={() => setTab('calendar')} className="px-4">Cancel</Button>
                        <Button size="sm" disabled={!form.title || !form.dueDate || createMut.isPending} onClick={() => createMut.mutate(form)} className="px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-none">Create Event</Button>
                    </div>
                </div>
            )}
        </StandardPage>
    );
}
