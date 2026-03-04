import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HardHat, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";


interface Permit { id: string; permit_number: string; permit_type: string; asset_id: string; location: string; description: string; status: string; requested_by: string; approved_by: string; contractor: string; start_datetime: string; end_datetime: string; events: PEvent[]; }
interface PEvent { at: string; by: string; action: string; note: string; }
interface CBMAlert { asset_id: string; parameter_name: string; reading_value: number; reading_at: string; }

const STATUS_CLR: Record<string, string> = { Draft: '#9ca3af', Pending_Approval: '#d97706', Approved: '#1d4ed8', Active: '#059669', Suspended: '#f59e0b', Closed: '#6b7280', Cancelled: '#dc2626' };
const TYPE_CLR: Record<string, string> = { HOT_WORK: '#dc2626', COLD_WORK: '#3b82f6', CONFINED_SPACE: '#d97706', ELECTRICAL: '#7c3aed', HEIGHT: '#f59e0b', EXCAVATION: '#6b7280', RADIATION: '#dc2626' };
const ACTIONS: Record<string, string[]> = {
    Pending_Approval: ['APPROVE', 'CANCEL'],
    Approved: ['ISSUE', 'CANCEL'],
    Active: ['SUSPEND', 'CLOSE'],
    Suspended: ['RESUME', 'CLOSE'],
};

export default function PermitToWork() {
    const [selected, setSelected] = useState<Permit | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ permitType: 'COLD_WORK', assetId: '', location: '', description: '', requestedBy: '', contractor: '', startDatetime: '', endDatetime: '' });
    const qc = useQueryClient();

    const { data: permits = [] } = useQuery<Permit[]>({ queryKey: ['permits', statusFilter], queryFn: () => fetch(`/api/eam/permits${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: expiring = [] } = useQuery<Permit[]>({ queryKey: ['permits-expiring'], queryFn: () => fetch('/api/eam/permits/expiring?hours=24').then(r => r.json()) });
    const { data: cbmAlerts = [] } = useQuery<CBMAlert[]>({ queryKey: ['cbm-alerts'], queryFn: () => fetch('/api/eam/cbm/alerts').then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/eam/permits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['permits'] }); setShowNew(false); } });
    const transitionMut = useMutation({ mutationFn: ({ id, action }: any) => fetch(`/api/eam/permits/${id}/transition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor: 'current-user', action }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['permits'] }) });

    const active = permits.filter(p => p.status === 'Active').length;
    const pending = permits.filter(p => p.status === 'Pending_Approval').length;

    const hoursLeft = (p: Permit) => {
        if (!p.end_datetime) return null;
        const h = Math.round((new Date(p.end_datetime).getTime() - Date.now()) / 3600000);
        return h;
    };

    return (
        <StandardPage title="Permit-to-Work">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-start' }}>
                <div>
                    
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Hazardous work permits · Safety lifecycle · CBM alerts</p>
                </div>
                <button onClick={() => setShowNew(true)} style={{ padding: '7px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ New Permit</button>
            </div>

            {/* KPI row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[{ lbl: 'Active', val: active, clr: '#059669' }, { lbl: 'Pending Approval', val: pending, clr: '#d97706' }, { lbl: 'Expiring 24h', val: expiring.length, clr: '#f59e0b' }, { lbl: 'CBM Alerts', val: cbmAlerts.length, clr: '#dc2626' }].map(k => (
                    <div key={k.lbl} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', minWidth: 100 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: k.clr }}>{k.val}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{k.lbl}</div>
                    </div>
                ))}
            </div>

            {/* Expiring alert banner */}
            {expiring.length > 0 && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <Clock size={12} color="#d97706" />
                    <strong>{expiring.length} permit(s) expiring within 24 hours:</strong> {expiring.map(p => p.permit_number).join(', ')}
                </div>
            )}

            {/* CBM alerts */}
            {cbmAlerts.length > 0 && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', marginBottom: 10, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 10 }}>
                    <AlertTriangle size={12} color="#dc2626" style={{ flexShrink: 0 }} />
                    {cbmAlerts.map((a, i) => <span key={i} style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 4 }}>{a.asset_id} · {a.parameter_name}: {Number(a.reading_value).toFixed(2)}</span>)}
                </div>
            )}

            {showNew && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Create Permit</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Type</label>
                            <select value={form.permitType} onChange={e => setForm(p => ({ ...p, permitType: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label="Type">{['COLD_WORK', 'HOT_WORK', 'CONFINED_SPACE', 'ELECTRICAL', 'HEIGHT', 'EXCAVATION', 'RADIATION'].map(t => <option key={t}>{t}</option>)}</select>
                        </div>
                        {[['Asset ID', 'assetId', 'text'], ['Location', 'location', 'text'], ['Requested By', 'requestedBy', 'text'], ['Contractor', 'contractor', 'text'], ['Start', 'startDatetime', 'datetime-local'], ['End', 'endDatetime', 'datetime-local']].map(([lbl, key, type]) => (
                            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ fontSize: 10, fontWeight: 700 }}>{lbl}</label>
                                <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={lbl} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, gridColumn: 'span 2' }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Description</label>
                            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Description" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.requestedBy} onClick={() => createMut.mutate(form)} style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Create</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {['', 'Pending_Approval', 'Approved', 'Active', 'Suspended', 'Closed', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: statusFilter === s ? '#111827' : '#fff', color: statusFilter === s ? '#fff' : '#6b7280', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{s || 'All'}</button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                    {permits.map(p => {
                        const clr = STATUS_CLR[p.status] ?? '#6b7280';
                        const tclr = TYPE_CLR[p.permit_type] ?? '#6b7280';
                        const hrs = hoursLeft(p);
                        return (
                            <div key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)} style={{ background: '#fff', border: `1px solid ${selected?.id === p.id ? '#dc2626' : '#e5e7eb'}`, borderLeft: `4px solid ${tclr}`, borderRadius: 10, padding: '10px 14px', marginBottom: 6, cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <HardHat size={12} color={tclr} />
                                        <span style={{ fontWeight: 700, fontSize: 13 }}>{p.permit_number}</span>
                                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: tclr + '18', color: tclr, fontWeight: 700 }}>{p.permit_type.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: clr + '18', color: clr }}>{p.status}</span>
                                </div>
                                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>{p.description ?? '—'} · Asset: {p.asset_id ?? '—'} · {p.location ?? '—'}</div>
                                <div style={{ fontSize: 9, color: '#9ca3af' }}>By: {p.requested_by} {p.contractor ? `· Contractor: ${p.contractor}` : ''} {hrs !== null && p.status === 'Active' ? `· ${hrs}h remaining` : ''}</div>
                                {(ACTIONS[p.status] ?? []).length > 0 && (
                                    <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                                        {(ACTIONS[p.status] ?? []).map(a => <button key={a} onClick={ev => { ev.stopPropagation(); transitionMut.mutate({ id: p.id, action: a }); }} style={{ padding: '2px 7px', background: a === 'APPROVE' || a === 'RESUME' || a === 'ISSUE' ? '#eff6ff' : '#fef2f2', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: a === 'CANCEL' ? '#dc2626' : '#1d4ed8', fontWeight: 700 }}>{a}</button>)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {permits.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, background: '#fff', borderRadius: 10 }}>No permits</div>}
                </div>

                {selected && (
                    <div style={{ width: 260, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{selected.permit_number}</div>
                        <div style={{ fontSize: 10, lineHeight: 1.8, color: '#374151' }}>
                            <strong>Type:</strong> {selected.permit_type}<br />
                            <strong>Asset:</strong> {selected.asset_id ?? '—'}<br />
                            <strong>Location:</strong> {selected.location ?? '—'}<br />
                            <strong>Contractor:</strong> {selected.contractor ?? '—'}<br />
                            <strong>Start:</strong> {selected.start_datetime ? new Date(selected.start_datetime).toLocaleString() : '—'}<br />
                            <strong>End:</strong> {selected.end_datetime ? new Date(selected.end_datetime).toLocaleString() : '—'}
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, marginBottom: 5 }}>Event Log</div>
                        <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {(selected.events ?? []).map((ev, i) => (
                                <div key={i} style={{ fontSize: 9, borderLeft: '2px solid #e5e7eb', paddingLeft: 6 }}>
                                    <div style={{ fontWeight: 700, color: '#6b7280' }}>{ev.action} · {ev.by}</div>
                                    <div style={{ color: '#374151' }}>{ev.note}</div>
                                    <div style={{ color: '#9ca3af' }}>{new Date(ev.at).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
