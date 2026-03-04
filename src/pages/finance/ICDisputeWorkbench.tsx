import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, MessageSquare, CheckCircle2 } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface Dispute { id: string; dispute_number: string; from_entity: string; to_entity: string; disputed_amount: number; currency: string; status: string; reason: string; opened_by: string; opened_at: string; events: DEvent[]; resolution: string; }
interface DEvent { at: string; by: string; action: string; note: string; }
interface Summary { status: string; reason: string; count: number; total_disputed: number; }

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
        { id: "dispute_number", header: "#", width: "100px", cell: (row) => <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9ca3af' }}>{row.dispute_number}</div> },
        { id: "entities", header: "From → To", width: "150px", cell: (row) => <div style={{ fontWeight: 600 }}>{row.from_entity} → {row.to_entity}</div> },
        { id: "reason", header: "Reason", width: "120px", cell: (row) => <div style={{ color: '#6b7280', fontSize: 10 }}>{row.reason}</div> },
        { id: "amount", header: "Amount", width: "120px", cell: (row) => <div style={{ fontFamily: 'monospace' }}>{row.disputed_amount ? `$${Number(row.disputed_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</div> },
        { id: "status", header: "Status", width: "100px", cell: (row) => { const clr = STATUS_CLR[row.status] ?? '#6b7280'; return <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: clr + '18', color: clr }}>{row.status}</span>; } },
        { id: "opened_at", header: "Opened", width: "100px", cell: (row) => <div style={{ color: '#9ca3af', fontSize: 10 }}>{new Date(row.opened_at).toLocaleDateString()}</div> },
        { id: "actions", header: "Actions", width: "200px", cell: (row) => <div style={{ display: 'flex', gap: 4 }}><button onClick={(ev) => { ev.stopPropagation(); setSelected(selected?.id === row.id ? null : row); }} style={{ padding: '2px 6px', background: '#e5e7eb', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#374151' }}>{selected?.id === row.id ? 'Unselect' : 'View'}</button>{row.status !== 'Resolved' && row.status !== 'Closed' && <><button onClick={ev => { ev.stopPropagation(); eventMut.mutate({ id: row.id, action: 'REVIEW', note: 'Under review' }); }} style={{ padding: '2px 6px', background: '#eff6ff', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#1d4ed8' }}>Review</button><button onClick={ev => { ev.stopPropagation(); eventMut.mutate({ id: row.id, action: 'ESCALATE', note: 'Escalated for management review' }); }} style={{ padding: '2px 6px', background: '#fef2f2', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#dc2626' }}>Escalate</button></>}</div> }
    ];

    return (
        <StandardPage
            title="IC Dispute Workbench"
            description="Intercompany discrepancy management · Dispute lifecycle · Resolution tracking"
            actions={
                <button onClick={() => setShowNew(true)} style={{ padding: '7px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Open Dispute</button>
            }
        >
            {/* KPI row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[{ label: 'Active Disputes', val: totalOpen, clr: '#dc2626' }, { label: 'Total Disputed', val: `$${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, clr: '#d97706' }, { label: 'Total Disputes', val: safeDisputes.length, clr: '#1d4ed8' }].map(k => (
                    <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', minWidth: 120 }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{k.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: k.clr }}>{k.val}</div>
                    </div>
                ))}
                {safeSummary.map(s => (
                    <div key={s.status + s.reason} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px' }}>
                        <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600 }}>{s.reason}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: STATUS_CLR[s.status] ?? '#374151' }}>{s.count} {s.status}</div>
                    </div>
                ))}
            </div>

            {showNew && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Open New IC Dispute</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>From Entity</label>
                            <select value={form.fromEntity} onChange={e => setForm(p => ({ ...p, fromEntity: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12 }}>
                                <option value="">Select Entity...</option>
                                {icOrgs.map(org => <option key={org.id} value={org.id}>{org.org_name || org.id}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>To Entity</label>
                            <select value={form.toEntity} onChange={e => setForm(p => ({ ...p, toEntity: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12 }}>
                                <option value="">Select Entity...</option>
                                {icOrgs.map(org => <option key={org.id} value={org.id}>{org.org_name || org.id}</option>)}
                            </select>
                        </div>
                        {[['Currency', 'currency', 'text'], ['Disputed Amount', 'disputedAmount', 'number']].map(([lbl, key, type]) => (
                            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ fontSize: 10, fontWeight: 700 }}>{lbl}</label>
                                <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12 }} aria-label={lbl} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Reason</label>
                            <select value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12 }} aria-label="Reason">{REASONS.map(r => <option key={r}>{r}</option>)}</select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, gridColumn: 'span 2' }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Notes</label>
                            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12 }} aria-label="Notes" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.fromEntity || !form.toEntity} onClick={() => openMut.mutate({ ...form, disputedAmount: parseFloat(form.disputedAmount) || undefined, openedBy: 'current-user' })} style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Open Dispute</button>
                    </div>
                </div>
            )}

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['', 'Open', 'Under_Review', 'Escalated', 'Resolved', 'Closed'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: statusFilter === s ? '#111827' : '#fff', color: statusFilter === s ? '#fff' : '#6b7280', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{s || 'All'}</button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search disputes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 11, width: 250, boxSizing: 'border-box' }}
                />
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
                {/* Dispute list */}
                <div style={{ flex: 1, height: 600 }}>
                    <InteractiveSpreadsheet
                        columns={disputeColumns}
                        data={filteredDisputes}
                        onChange={() => { }}
                        containerHeight="100%"
                    />
                </div>

                {/* Detail panel */}
                {selected && (
                    <div style={{ width: 300, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{selected.dispute_number}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.7 }}>
                            <strong>Entities:</strong> {selected.from_entity} → {selected.to_entity}<br />
                            <strong>Reason:</strong> {selected.reason}<br />
                            <strong>Amount:</strong> {selected.disputed_amount ? `$${Number(selected.disputed_amount).toFixed(2)}` : '—'}<br />
                            <strong>Opened by:</strong> {selected.opened_by}
                        </div>
                        <div style={{ marginTop: 10, marginBottom: 6, fontSize: 11, fontWeight: 700 }}>Event Timeline</div>
                        <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {(selected.events ?? []).map((ev, i) => (
                                <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                                    <MessageSquare size={10} style={{ marginTop: 1, color: '#9ca3af', flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: '#6b7280' }}>{ev.action} · {ev.by} · {new Date(ev.at).toLocaleString()}</div>
                                        <div style={{ fontSize: 10, color: '#374151' }}>{ev.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selected.status !== 'Resolved' && selected.status !== 'Closed' && (
                            <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Add Event</div>
                                <input value={eventNote} onChange={e => setEventNote(e.target.value)} placeholder="Event note…" style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 10, marginBottom: 4, boxSizing: 'border-box' }} aria-label="Event note" />
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button disabled={!eventNote} onClick={() => eventMut.mutate({ id: selected.id, action: 'NOTE', note: eventNote })} style={{ flex: 1, padding: '4px', background: '#f3f4f6', border: 'none', borderRadius: 5, fontSize: 9, cursor: 'pointer' }}>Add Note</button>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Resolve</div>
                                    <input value={resolveText} onChange={e => setResolveText(e.target.value)} placeholder="Resolution notes…" style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 10, marginBottom: 4, boxSizing: 'border-box' }} aria-label="Resolution" />
                                    <button disabled={!resolveText} onClick={() => resolveMut.mutate({ id: selected.id, resolution: resolveText })} style={{ width: '100%', padding: '5px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <CheckCircle2 size={10} /> Resolve Dispute
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
