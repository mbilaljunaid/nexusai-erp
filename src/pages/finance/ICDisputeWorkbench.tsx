import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, MessageSquare, CheckCircle2 } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Dispute { id: string; dispute_number: string; from_entity: string; to_entity: string; disputed_amount: number; currency: string; status: string; reason: string; opened_by: string; opened_at: string; events: DEvent[]; resolution: string; }
interface DEvent { at: string; by: string; action: string; note: string; }
interface Summary { status: string; reason: string; count: number; total_disputed: number; }

const STATUS_CFG: Record<string, string> = { Open: 'text-amber-600 bg-amber-50', Under_Review: 'text-blue-700 bg-blue-50', Escalated: 'text-red-600 bg-red-50', Resolved: 'text-emerald-600 bg-emerald-50', Closed: 'text-gray-500 bg-gray-50' };
const STATUS_CLR: Record<string, string> = { Open: '#d97706', Under_Review: '#1d4ed8', Escalated: '#dc2626', Resolved: '#059669', Closed: '#6b7280' };
const REASONS = ['AMOUNT_MISMATCH', 'MISSING_INVOICE', 'DUPLICATE', 'CURRENCY_DIFF', 'OTHER'];

export default function ICDisputeWorkbench() {
    const [selected, setSelected] = useState<Dispute | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [form, setForm] = useState({ fromEntity: '', toEntity: '', disputedAmount: '', currency: 'USD', reason: 'AMOUNT_MISMATCH', notes: '' });
    const [eventNote, setEventNote] = useState('');
    const [resolveText, setResolveText] = useState('');
    const qc = useQueryClient();

    const { data: disputes = [] } = useQuery<Dispute[]>({ queryKey: ['ic-disputes', statusFilter], queryFn: () => fetch(`/api/ic/disputes${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: summary = [] } = useQuery<Summary[]>({ queryKey: ['ic-disputes-summary'], queryFn: () => fetch('/api/ic/disputes/summary').then(r => r.json()) });
    const { data: icOrgs = [] } = useQuery<any[]>({ queryKey: ['ic-orgs'], queryFn: () => fetch('/api/ic/orgs').then(r => r.json()) });

    const openMut = useMutation({ mutationFn: (d: any) => fetch('/api/ic/disputes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ic-disputes'] }); qc.invalidateQueries({ queryKey: ['ic-disputes-summary'] }); setShowNew(false); } });
    const eventMut = useMutation({ mutationFn: ({ id, action, note }: any) => fetch(`/api/ic/disputes/${id}/event`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor: 'current-user', action, note }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['ic-disputes'] }) });
    const resolveMut = useMutation({ mutationFn: ({ id, resolution }: any) => fetch(`/api/ic/disputes/${id}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolvedBy: 'current-user', resolution }) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ic-disputes'] }); setResolveText(''); } });

    const safeDisputes = Array.isArray(disputes) ? disputes : [];
    const safeSummary = Array.isArray(summary) ? summary : [];

    const filteredDisputes = safeDisputes.filter(d => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (d.dispute_number?.toLowerCase().includes(q) || d.from_entity?.toLowerCase().includes(q) || d.to_entity?.toLowerCase().includes(q) || d.reason?.toLowerCase().includes(q));
    });

    const totalOpen = safeDisputes.filter(d => d.status === 'Open' || d.status === 'Escalated').length;
    const totalAmt = safeDisputes.reduce((s, d) => s + Number(d.disputed_amount ?? 0), 0);

    const disputeColumns: SpreadsheetColumn<Dispute>[] = [
        { id: "dispute_number", header: "#", width: "100px", cell: (row) => <div className="ic-col-id">{row.dispute_number}</div> },
        { id: "entities", header: "From → To", width: "150px", cell: (row) => <div className="ic-col-entities">{row.from_entity} → {row.to_entity}</div> },
        { id: "reason", header: "Reason", width: "120px", cell: (row) => <div className="ic-col-reason">{row.reason}</div> },
        { id: "amount", header: "Amount", width: "120px", cell: (row) => <div className="font-mono">{row.disputed_amount ? `$${Number(row.disputed_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</div> },
        { id: "status", header: "Status", width: "100px", cell: (row) => { const clrClass = STATUS_CFG[row.status] ?? 'text-gray-500 bg-gray-50'; return <span className={cn(`ic-stat-badge ${clrClass}`)}>{row.status}</span>; } },
        { id: "opened_at", header: "Opened", width: "100px", cell: (row) => <div className="ic-col-date">{formatDate(row.opened_at)}</div> },
        { id: "actions", header: "Actions", width: "200px", cell: (row) => <div className="ic-act-btns"><button onClick={(ev) => { ev.stopPropagation(); setSelected(selected?.id === row.id ? null : row); }} className="ic-btn-view">{selected?.id === row.id ? 'Unselect' : 'View'}</button>{row.status !== 'Resolved' && row.status !== 'Closed' && <><button onClick={ev => { ev.stopPropagation(); eventMut.mutate({ id: row.id, action: 'REVIEW', note: 'Under review' }); }} className="ic-btn-review">Review</button><button onClick={ev => { ev.stopPropagation(); eventMut.mutate({ id: row.id, action: 'ESCALATE', note: 'Escalated for management review' }); }} className="ic-btn-escalate">Escalate</button></>}</div> }
    ];

    return (
        <StandardPage
            title="IC Dispute Workbench"
            description="Intercompany discrepancy management · Dispute lifecycle · Resolution tracking"
            actions={
                <button onClick={() => setShowNew(true)} className="ic-btn-new">+ Open Dispute</button>
            }
        >
            {/* KPI row */}
            <div className="ic-kpis">
                {[{ label: 'Active Disputes', val: totalOpen, clr: 'text-red-600' }, { label: 'Total Disputed', val: `$${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, clr: 'text-amber-600' }, { label: 'Total Disputes', val: safeDisputes.length, clr: 'text-blue-700' }].map(k => (
                    <div key={k.label} className="ic-kpi-card">
                        <div className="ic-kpi-label">{k.label}</div>
                        <div className={cn(`ic-kpi-val ${k.clr}`)}>{k.val}</div>
                    </div>
                ))}
                {safeSummary.map(s => {
                    const clrClass = STATUS_CFG[s.status]?.split(' ')[0] ?? 'text-gray-700';
                    return (
                        <div key={s.status + s.reason} className="ic-kpi-sum">
                            <div className="ic-kpi-sum-label">{s.reason}</div>
                            <div className={cn(`ic-kpi-sum-val ${clrClass}`)}>{s.count} {s.status}</div>
                        </div>
                    );
                })}
            </div>

            {showNew && (
                <div className="ic-new-box">
                    <div className="ic-new-title">Open New IC Dispute</div>
                    <div className="ic-new-grid">
                        <div className="ic-new-fld">
                            <label>From Entity</label>
                            <Select value={form.fromEntity} onValueChange={v => setForm(p => ({ ...p, fromEntity: v }))}>
                                <SelectTrigger aria-label="From Entity"><SelectValue placeholder="Select Entity..." /></SelectTrigger>
                                <SelectContent>
                                    {icOrgs.map(org => <SelectItem key={org.id} value={org.id}>{org.org_name || org.id}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="ic-new-fld">
                            <label>To Entity</label>
                            <Select value={form.toEntity} onValueChange={v => setForm(p => ({ ...p, toEntity: v }))}>
                                <SelectTrigger aria-label="To Entity"><SelectValue placeholder="Select Entity..." /></SelectTrigger>
                                <SelectContent>
                                    {icOrgs.map(org => <SelectItem key={org.id} value={org.id}>{org.org_name || org.id}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {[['Currency', 'currency', 'text'], ['Disputed Amount', 'disputedAmount', 'number']].map(([lbl, key, type]) => (
                            <div key={key} className="ic-new-fld">
                                <label>{lbl}</label>
                                <Input type={type} value={(form as any)[key as string]} onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))} aria-label={lbl as string} />
                            </div>
                        ))}
                        <div className="ic-new-fld">
                            <label>Reason</label>
                            <Select value={form.reason} onValueChange={v => setForm(p => ({ ...p, reason: v }))}>
                                <SelectTrigger aria-label="Reason"><SelectValue /></SelectTrigger>
                                <SelectContent>{REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="ic-new-fld ic-span-2">
                            <label>Notes</label>
                            <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} aria-label="Notes" />
                        </div>
                    </div>
                    <div className="ic-new-acts">
                        <button onClick={() => setShowNew(false)} className="ic-btn-cancel">Cancel</button>
                        <button disabled={!form.fromEntity || !form.toEntity} onClick={() => openMut.mutate({ ...form, disputedAmount: parseFloat(form.disputedAmount) || undefined, openedBy: 'current-user' })} className="ic-btn-open">Open Dispute</button>
                    </div>
                </div>
            )}

            {/* Status filter */}
            <div className="ic-filters">
                <div className="ic-filter-btns">
                    {['', 'Open', 'Under_Review', 'Escalated', 'Resolved', 'Closed'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={cn(`ic-btn-filter ${statusFilter === s ? 'active' : ''}`)}>{s || 'All'}</button>
                    ))}
                </div>
                <Input
                    type="text"
                    placeholder="Search disputes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="ic-search"
                />
            </div>

            <div className="ic-main-layout">
                {/* Dispute list */}
                <div className="ic-list-sec">
                    <div className="h-[600px]">
                        <InteractiveSpreadsheet
                            columns={disputeColumns}
                            data={filteredDisputes}
                            onChange={() => { }}
                            containerHeight="100%"
                        />
                    </div>
                </div>

                {/* Detail panel */}
                {selected && (
                    <div className="ic-detail">
                        <div className="ic-det-id">{selected.dispute_number}</div>
                        <div className="ic-det-meta">
                            <strong>Entities:</strong> {selected.from_entity} → {selected.to_entity}<br />
                            <strong>Reason:</strong> {selected.reason}<br />
                            <strong>Amount:</strong> {selected.disputed_amount ? `$${Number(selected.disputed_amount).toFixed(2)}` : '—'}<br />
                            <strong>Opened by:</strong> {selected.opened_by}
                        </div>
                        <div className="ic-det-evt-title">Event Timeline</div>
                        <div className="ic-det-evts">
                            {(selected.events ?? []).map((ev, i) => (
                                <div key={i} className="ic-evt-row">
                                    <MessageSquare size={10} className="ic-evt-icon" />
                                    <div>
                                        <div className="ic-evt-hdr">{ev.action} · {ev.by} · {formatDateTime(ev.at)}</div>
                                        <div className="ic-evt-note">{ev.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selected.status !== 'Resolved' && selected.status !== 'Closed' && (
                            <div className="ic-acts-sec">
                                <div className="ic-acts-title">Add Event</div>
                                <Input value={eventNote} onChange={e => setEventNote(e.target.value)} placeholder="Event note…" className="ic-evt-in" aria-label="Event note" />
                                <div className="ic-evt-btn-row">
                                    <button disabled={!eventNote} onClick={() => eventMut.mutate({ id: selected.id, action: 'NOTE', note: eventNote })} className="ic-evt-btn">Add Note</button>
                                </div>
                                <div className="ic-res-sec">
                                    <div className="ic-acts-title">Resolve</div>
                                    <Input value={resolveText} onChange={e => setResolveText(e.target.value)} placeholder="Resolution notes…" className="ic-evt-in" aria-label="Resolution" />
                                    <button disabled={!resolveText} onClick={() => resolveMut.mutate({ id: selected.id, resolution: resolveText })} className="ic-res-btn">
                                        <CheckCircle2 size={10} /> Resolve Dispute
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .ic-col-id { font-family: monospace; font-size: 10px; color: #9ca3af; }
                .ic-col-entities { font-weight: 600; }
                .ic-col-reason { color: #6b7280; font-size: 10px; }
                .ic-stat-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
                .ic-col-date { color: #9ca3af; font-size: 10px; }
                .ic-act-btns { display: flex; gap: 4px; }
                .ic-btn-view { padding: 2px 6px; background: #e5e7eb; border: none; border-radius: 4px; font-size: 9px; cursor: pointer; color: #374151; }
                .ic-btn-review { padding: 2px 6px; background: #eff6ff; border: none; border-radius: 4px; font-size: 9px; cursor: pointer; color: #1d4ed8; }
                .ic-btn-escalate { padding: 2px 6px; background: #fef2f2; border: none; border-radius: 4px; font-size: 9px; cursor: pointer; color: #dc2626; }
                .ic-btn-new { padding: 7px 14px; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; }
                .ic-kpis { display: flex; gap: 10px; margin-bottom: 14px; }
                .ic-kpi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 16px; min-width: 120px; }
                .ic-kpi-label { font-size: 10px; color: #9ca3af; font-weight: 600; }
                .ic-kpi-val { font-size: 20px; font-weight: 800; }
                .ic-kpi-sum { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; }
                .ic-kpi-sum-label { font-size: 9px; color: #9ca3af; font-weight: 600; }
                .ic-kpi-sum-val { font-size: 14px; font-weight: 700; }
                .ic-new-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
                .ic-new-title { font-weight: 700; font-size: 12px; margin-bottom: 8px; }
                .ic-new-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
                .ic-new-fld { display: flex; flex-direction: column; gap: 2px; }
                .ic-new-fld label { font-size: 10px; font-weight: 700; }
                .ic-new-fld select, .ic-new-fld input { padding: 6px 8px; border: 1px solid #fca5a5; border-radius: 6px; font-size: 12px; }
                .ic-span-2 { grid-column: span 2; }
                .ic-new-acts { display: flex; gap: 6px; justify-content: flex-end; }
                .ic-btn-cancel { padding: 5px 12px; background: #e5e7eb; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; }
                .ic-btn-open { padding: 5px 12px; background: #dc2626; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
                .ic-filters { display: flex; gap: 6px; margin-bottom: 10px; justify-content: space-between; align-items: center; }
                .ic-filter-btns { display: flex; gap: 6px; }
                .ic-btn-filter { padding: 5px 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; color: #6b7280; font-size: 10px; font-weight: 600; cursor: pointer; }
                .ic-btn-filter.active { background: #111827; color: #fff; }
                .ic-search { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 11px; width: 250px; box-sizing: border-box; }
                .ic-main-layout { display: flex; gap: 14px; }
                .ic-list-sec { flex: 1; height: 600px; }
                .ic-detail { width: 300px; flex-shrink: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; align-self: flex-start; }
                .ic-det-id { font-weight: 700; font-size: 13px; margin-bottom: 8px; }
                .ic-det-meta { font-size: 11px; color: #6b7280; line-height: 1.7; }
                .ic-det-evt-title { margin-top: 10px; margin-bottom: 6px; font-size: 11px; font-weight: 700; }
                .ic-det-evts { max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
                .ic-evt-row { display: flex; gap: 7px; align-items: flex-start; }
                .ic-evt-icon { margin-top: 1px; color: #9ca3af; flex-shrink: 0; }
                .ic-evt-hdr { font-size: 9px; font-weight: 700; color: #6b7280; }
                .ic-evt-note { font-size: 10px; color: #374151; }
                .ic-acts-sec { margin-top: 10px; }
                .ic-acts-title { font-size: 10px; font-weight: 700; margin-bottom: 4px; }
                .ic-evt-in { width: 100%; padding: 5px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 10px; margin-bottom: 4px; box-sizing: border-box; }
                .ic-evt-btn-row { display: flex; gap: 4px; }
                .ic-evt-btn { flex: 1; padding: 4px; background: #f3f4f6; border: none; border-radius: 5px; font-size: 9px; cursor: pointer; }
                .ic-res-sec { margin-top: 8px; }
                .ic-res-btn { width: 100%; padding: 5px; background: #059669; color: #fff; border: none; border-radius: 6px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; }
            `}</style>
        </StandardPage>
    );
}
