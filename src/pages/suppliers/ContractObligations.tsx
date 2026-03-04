import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, ArrowUp } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";


interface Obligation {
    id: string;
    contract_id: string;
    supplier_id: string;
    obligation_type: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    escalation_level: number;
    penalty_amount: number;
    currency_code: string;
    evidence_url: string;
}

const OB_STATUS: Record<string, { bg: string; color: string }> = {
    Pending: { bg: '#eff6ff', color: '#1d4ed8' },
    InReview: { bg: '#fef3c7', color: '#d97706' },
    Met: { bg: '#d1fae5', color: '#059669' },
    Overdue: { bg: '#fee2e2', color: '#dc2626' },
    Waived: { bg: '#f3f4f6', color: '#6b7280' },
};

const ESC_LABELS = ['—', '⚠ Warning', '🔴 Manager', '🚨 Legal'];

function fmt(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function ContractObligations() {
    const [filter, setFilter] = useState<string>('');
    const [selected, setSelected] = useState<Obligation | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [newOb, setNewOb] = useState({ contractId: '', supplierId: '', obligationType: 'DELIVERY', title: '', dueDate: '', recurrence: 'NONE', penaltyAmount: '' });
    const qc = useQueryClient();

    const { data: summary } = useQuery({ queryKey: ['ob-summary'], queryFn: () => fetch('/api/supplier/obligations/summary').then(r => r.json()) });
    const { data: obligations = [] } = useQuery<Obligation[]>({ queryKey: ['obligations', filter], queryFn: () => fetch(`/api/supplier/obligations${filter ? `?status=${filter}` : ''}`).then(r => r.json()) });
    const { data: upcoming = [] } = useQuery<Obligation[]>({ queryKey: ['ob-upcoming'], queryFn: () => fetch('/api/supplier/obligations/upcoming?days=30').then(r => r.json()) });

    const createMut = useMutation({
        mutationFn: (d: any) => fetch('/api/supplier/obligations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['obligations', 'ob-summary'] }); setShowNew(false); },
    });

    const evidenceMut = useMutation({
        mutationFn: ({ id, url }: { id: string; url: string }) => fetch(`/api/supplier/obligations/${id}/evidence`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evidenceUrl: url }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['obligations'] }); setEvidenceUrl(''); },
    });

    const reviewMut = useMutation({
        mutationFn: ({ id, decision }: { id: string; decision: string }) => fetch(`/api/supplier/obligations/${id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, reviewedBy: 'current-user' }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['obligations', 'ob-summary'] }); setSelected(null); },
    });

    const escMut = useMutation({
        mutationFn: (id: string) => fetch(`/api/supplier/obligations/${id}/escalate`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['obligations'] }),
    });

    return (
        <StandardPage title="Contract Obligations">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Supplier compliance tracking · Evidence submission · Escalation management</p>
                </div>
                <button onClick={() => setShowNew(true)} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>+ Add Obligation</button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[['Total', summary?.total ?? 0, '#6b7280'], ['Pending', summary?.pending ?? 0, '#1d4ed8'], ['Overdue', summary?.overdue ?? 0, '#dc2626'], ['Met', summary?.met ?? 0, '#059669'], ['At Risk', `${summary?.currency_code ?? 'USD'} ${Number(summary?.total_at_risk ?? 0).toLocaleString()}`, '#d97706']].map(([l, v, c]) => (
                    <div key={l as string} style={{ background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 18px', flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace' }}>{v}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* Upcoming alert banner */}
            {upcoming.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} color="#d97706" />
                    <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>{upcoming.length} obligation{upcoming.length !== 1 ? 's' : ''} due within 30 days</span>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                        {upcoming.slice(0, 3).map(u => <span key={u.id} style={{ fontSize: 11, background: '#fef3c7', padding: '2px 8px', borderRadius: 4, color: '#b45309' }}>{u.title} — {fmt(u.due_date)}</span>)}
                    </div>
                </div>
            )}

            {/* Add form */}
            {showNew && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Add Contract Obligation</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[['contractId', 'Contract ID', 'text'], ['supplierId', 'Supplier ID', 'text'], ['title', 'Title', 'text'], ['dueDate', 'Due Date', 'date'], ['penaltyAmount', 'Penalty Amount', 'number']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                <input type={t} value={(newOb as any)[k] ?? ''} onChange={e => setNewOb(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 600 }}>Type</label>
                            <select value={newOb.obligationType} onChange={e => setNewOb(p => ({ ...p, obligationType: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Obligation type">
                                {['DELIVERY', 'REPORTING', 'COMPLIANCE', 'INSURANCE', 'PAYMENT', 'SLA', 'AUDIT'].map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 600 }}>Recurrence</label>
                            <select value={newOb.recurrence} onChange={e => setNewOb(p => ({ ...p, recurrence: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Recurrence">
                                {['NONE', 'MONTHLY', 'QUARTERLY', 'ANNUAL'].map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10 }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={createMut.isPending || !newOb.contractId || !newOb.title} onClick={() => createMut.mutate(newOb)} style={{ padding: '6px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Create</button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {['', 'Pending', 'InReview', 'Overdue', 'Met', 'Waived'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 7, background: filter === s ? '#111827' : '#fff', color: filter === s ? '#fff' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {/* Obligation list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {obligations.map(ob => {
                    const cfg = OB_STATUS[ob.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                    const sel = selected?.id === ob.id;
                    return (
                        <div key={ob.id} onClick={() => setSelected(sel ? null : ob)} style={{ background: '#fff', border: `1px solid ${sel ? '#1d4ed8' : '#e5e7eb'}`, borderLeft: `4px solid ${cfg.color}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{ob.title}</span>
                                    <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>{ob.obligation_type}</span>
                                </div>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: cfg.bg, color: cfg.color, fontWeight: 700 }}>{ob.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6b7280' }}>
                                <span><Clock size={10} style={{ display: 'inline' }} /> Due: {fmt(ob.due_date)}</span>
                                <span>Supplier: {ob.supplier_id}</span>
                                <span>Contract: {ob.contract_id}</span>
                                {ob.escalation_level > 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}>{ESC_LABELS[ob.escalation_level]}</span>}
                                {ob.penalty_amount && <span style={{ color: '#d97706', fontWeight: 600 }}>{ob.currency_code} {Number(ob.penalty_amount).toLocaleString()}</span>}
                            </div>

                            {sel && (
                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e5e7eb' }}>
                                    {ob.description && <p style={{ fontSize: 12, color: '#374151', margin: '0 0 8px' }}>{ob.description}</p>}
                                    {ob.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                                            <input placeholder="Evidence URL" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} style={{ flex: 1, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Evidence URL" />
                                            <button disabled={!evidenceUrl} onClick={e => { e.stopPropagation(); evidenceMut.mutate({ id: ob.id, url: evidenceUrl }); }} style={{ padding: '5px 10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Submit Evidence</button>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {ob.status === 'InReview' && <>
                                            <button onClick={e => { e.stopPropagation(); reviewMut.mutate({ id: ob.id, decision: 'Met' }); }} style={{ padding: '5px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><CheckCircle2 size={11} /> Mark Met</button>
                                            <button onClick={e => { e.stopPropagation(); reviewMut.mutate({ id: ob.id, decision: 'Waived' }); }} style={{ padding: '5px 10px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Waive</button>
                                        </>}
                                        {ob.status === 'Overdue' && (
                                            <button onClick={e => { e.stopPropagation(); escMut.mutate(ob.id); }} style={{ padding: '5px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><ArrowUp size={11} /> Escalate</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {obligations.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 30 }}>No obligations found</div>}
            </div>
        </StandardPage>
    );
}
