import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


interface ECO {
    id: string; eco_number: string; title: string; change_type: string;
    priority: string; status: string; requested_by: string; approved_by: string;
    effective_date: string; affected_items: any[]; created_at: string;
}
interface ECOSummary { status: string; priority: string; count: number; }

const PRIORITY_CLR: Record<string, string> = { CRITICAL: '#dc2626', HIGH: '#d97706', MEDIUM: '#1d4ed8', LOW: '#059669' };
const STATUS_CLR: Record<string, string> = { Draft: '#9ca3af', Under_Review: '#d97706', Approved: '#1d4ed8', Released: '#7c3aed', Implemented: '#059669', Cancelled: '#dc2626' };

const ACTIONS: Record<string, { label: string; action: string; color: string }[]> = {
    Draft: [{ label: 'Submit for Review', action: 'submit', color: '#1d4ed8' }],
    Under_Review: [{ label: '✓ Approve', action: 'approve', color: '#059669' }, { label: 'Cancel', action: 'cancel', color: '#dc2626' }],
    Approved: [{ label: '🚀 Release', action: 'release', color: '#7c3aed' }],
    Released: [{ label: '✓ Mark Implemented', action: 'implement', color: '#059669' }],
};

export default function ECOManagement() {
    const [selected, setSelected] = useState<ECO | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [form, setForm] = useState({ title: '', description: '', changeType: 'DESIGN', priority: 'MEDIUM', requestedBy: '' });
    const qc = useQueryClient();

    const { data: ecos = [] } = useQuery<ECO[]>({ queryKey: ['eco', statusFilter], queryFn: () => fetch(`/api/mfg/eco${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: summary = [] } = useQuery<ECOSummary[]>({ queryKey: ['eco-summary'], queryFn: () => fetch('/api/mfg/eco/summary').then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/mfg/eco', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['eco', 'eco-summary'] }); setShowNew(false); } });
    const actionMut = useMutation({ mutationFn: ({ id, action }: { id: string; action: string }) => fetch(`/api/mfg/eco/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, actor: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['eco', 'eco-summary'] }) });

    // Build status totals
    const statusTotals = ['Draft', 'Under_Review', 'Approved', 'Released', 'Implemented', 'Cancelled'].map(s => ({
        status: s, count: summary.filter(x => x.status === s).reduce((a, b) => a + Number(b.count), 0)
    }));

    const ecoColumns: SpreadsheetColumn<ECO>[] = [
        { id: "eco_number", header: "ECO #", width: "120px", cell: (e) => <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11 }}>{e.eco_number}</span> },
        {
            id: "title", header: "Title", width: "300px", cell: (e) => (
                <>
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Requested by: {e.requested_by ?? '—'}</div>
                </>
            )
        },
        { id: "type", header: "Type", width: "120px", cell: (e) => <span style={{ fontSize: 10, color: '#6b7280' }}>{e.change_type}</span> },
        { id: "priority", header: "Priority", width: "120px", cell: (e) => <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: PRIORITY_CLR[e.priority] + '20', color: PRIORITY_CLR[e.priority] }}>{e.priority}</span> },
        { id: "status", header: "Status", width: "150px", cell: (e) => <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: STATUS_CLR[e.status] + '18', color: STATUS_CLR[e.status] }}>{e.status.replace(/_/g, ' ')}</span> },
        {
            id: "actions", header: "Actions", width: "150px", cell: (e) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    {(ACTIONS[e.status] ?? []).map(a => (
                        <button key={a.action} onClick={(ev) => { ev.stopPropagation(); actionMut.mutate({ id: e.id, action: a.action }); }} style={{ padding: '3px 8px', background: a.color, color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>{a.label}</button>
                    ))}
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Engineering Change Orders">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Change lifecycle · Approval workflow · BOM impact tracking</p>
                </div>
                <button onClick={() => setShowNew(true)} style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New ECO</button>
            </div>

            {/* Status strip */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {statusTotals.map(s => (
                    <div key={s.status} onClick={() => setStatusFilter(statusFilter === s.status ? '' : s.status)} style={{ flex: 1, background: '#fff', border: `1px solid ${STATUS_CLR[s.status]}40`, borderTop: `3px solid ${STATUS_CLR[s.status]}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', opacity: statusFilter && statusFilter !== s.status ? 0.5 : 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: STATUS_CLR[s.status] }}>{s.count}</div>
                        <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600 }}>{s.status.replace(/_/g, ' ')}</div>
                    </div>
                ))}
            </div>

            {/* New ECO form */}
            {showNew && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Create ECO</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                        {[['changeType', 'Type', ['DESIGN', 'PROCESS', 'MATERIAL', 'TOOLING', 'SOFTWARE', 'SAFETY']], ['priority', 'Priority', ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']]].map(([k, l, opts]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ fontSize: 10, fontWeight: 700 }}>{l}</label>
                                <select value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '5px 7px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l}>
                                    {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Requested By</label>
                            <input value={form.requestedBy} onChange={e => setForm(p => ({ ...p, requestedBy: e.target.value }))} style={{ padding: '5px 7px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Requested by" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                        <label style={{ fontSize: 10, fontWeight: 700 }}>Title</label>
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label="Title" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                        <label style={{ fontSize: 10, fontWeight: 700 }}>Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, resize: 'vertical' }} aria-label="Description" />
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.title} onClick={() => createMut.mutate(form)} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Create</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 14 }}>
                {/* ECO list */}
                <div style={{ flex: 1, minHeight: '400px', height: '100%', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                    <InteractiveSpreadsheet
                        columns={ecoColumns}
                        data={ecos}
                        activeRow={selected?.id}
                        onRowSelect={(e) => setSelected(selected?.id === e.id ? null : e as ECO)}
                        onChange={() => { }}
                        containerHeight="600px"
                    />
                </div>
                {/* Detail */}
                {selected && (
                    <div style={{ width: 280, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 12 }}>{selected.eco_number}</div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ fontSize: 11, color: '#374151', marginBottom: 10 }}>{selected.title}</div>
                        <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 10 }}>
                            <div>Type: <strong>{selected.change_type}</strong></div>
                            <div>Approved by: {selected.approved_by ?? '—'}</div>
                            <div>Effective: {selected.effective_date ?? '—'}</div>
                        </div>
                        {selected.affected_items?.length > 0 && (
                            <>
                                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Affected Items</div>
                                {selected.affected_items.map((item: any, i: number) => (
                                    <div key={i} style={{ fontSize: 10, background: '#f9fafb', borderRadius: 4, padding: '3px 6px', marginBottom: 2 }}>{item.itemNumber} Rev {item.revision}</div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
