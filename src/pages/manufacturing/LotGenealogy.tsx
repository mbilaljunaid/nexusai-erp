import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitMerge, ChevronRight, AlertTriangle } from 'lucide-react';

interface Lot { id: string; lot_number: string; item_number: string; item_description: string; lot_type: string; quantity: number; unit_of_measure: string; status: string; expiry_date: string; supplier_lot: string; work_order_id: string; parent_lots: any[]; trace_events: any[]; created_at: string; }

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
    Active: { bg: '#d1fae5', color: '#059669' }, Consumed: { bg: '#f3f4f6', color: '#6b7280' },
    Quarantine: { bg: '#fee2e2', color: '#dc2626' }, Scrapped: { bg: '#fef3c7', color: '#d97706' }, Expired: { bg: '#f3f4f6', color: '#9ca3af' },
};
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function LotGenealogy() {
    const [selected, setSelected] = useState<Lot | null>(null);
    const [traceMode, setTraceMode] = useState<'up' | 'down' | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [itemFilter, setItemFilter] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ lotNumber: '', itemNumber: '', itemDescription: '', lotType: 'PRODUCTION', quantity: '', unitOfMeasure: 'EA', expiryDate: '', supplierLot: '', workOrderId: '' });
    const qc = useQueryClient();

    const { data: lots = [] } = useQuery<Lot[]>({ queryKey: ['lots', statusFilter, itemFilter], queryFn: () => fetch(`/api/mfg/lots?${statusFilter ? `status=${statusFilter}&` : ''}${itemFilter ? `item=${encodeURIComponent(itemFilter)}` : ''}`).then(r => r.json()) });
    const { data: expiring = [] } = useQuery<Lot[]>({ queryKey: ['lots-expiring'], queryFn: () => fetch('/api/mfg/lots/expiring?days=30').then(r => r.json()) });
    const { data: traceData = [] } = useQuery<Lot[]>({ queryKey: ['lot-trace', selected?.lot_number, traceMode], enabled: !!selected && !!traceMode, queryFn: () => fetch(`/api/mfg/lots/${selected!.lot_number}/${traceMode === 'up' ? 'trace-up' : 'trace-down'}`).then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/mfg/lots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['lots'] }); setShowNew(false); } });
    const statusMut = useMutation({ mutationFn: ({ lot, status }: { lot: string; status: string }) => fetch(`/api/mfg/lots/${lot}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['lots'] }) });

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Lot Genealogy &amp; Traceability</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Forward/backward traceability · JSONB trace events · Expiry management</p>
                </div>
                <button onClick={() => setShowNew(!showNew)} style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New Lot</button>
            </div>

            {expiring.length > 0 && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={12} color="#d97706" />
                    <span style={{ fontSize: 12, color: '#d97706', fontWeight: 700 }}>{expiring.length} lot{expiring.length > 1 ? 's' : ''} expiring within 30 days</span>
                    <span style={{ fontSize: 11, color: '#92400e' }}>{expiring.slice(0, 3).map(l => `${l.lot_number} (${l.item_number})`).join(', ')}</span>
                </div>
            )}

            {showNew && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Create Lot</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                        {[['lotNumber', 'Lot Number', 'text'], ['itemNumber', 'Item Number', 'text'], ['quantity', 'Quantity', 'number'], ['unitOfMeasure', 'UOM', 'text'], ['expiryDate', 'Expiry Date', 'date'], ['supplierLot', 'Supplier Lot', 'text'], ['workOrderId', 'Work Order ID', 'text']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ fontSize: 9, fontWeight: 700, color: '#374151' }}>{l}</label>
                                <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '5px 7px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 11 }} aria-label={l} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 9, fontWeight: 700 }}>Lot Type</label>
                            <select value={form.lotType} onChange={e => setForm(p => ({ ...p, lotType: e.target.value }))} style={{ padding: '5px 7px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 11 }} aria-label="Lot type">
                                {['PRODUCTION', 'PURCHASED', 'REWORK', 'CONSIGNMENT'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.lotNumber || !form.itemNumber} onClick={() => createMut.mutate({ ...form, quantity: Number(form.quantity) })} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Create Lot</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {['', 'Active', 'Quarantine', 'Consumed', 'Scrapped', 'Expired'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: statusFilter === s ? '#111827' : '#fff', color: statusFilter === s ? '#fff' : '#6b7280', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{s || 'All'}</button>
                ))}
                <input value={itemFilter} onChange={e => setItemFilter(e.target.value)} placeholder="Filter by item…" style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, width: 140 }} aria-label="Filter by item" />
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                        <thead><tr style={{ background: '#f9fafb' }}>
                            {['Lot #', 'Item', 'Type', 'Quantity', 'Expiry', 'Status', ''].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {lots.map(l => {
                                const cfg = STATUS_CFG[l.status] ?? STATUS_CFG.Active;
                                const daysToExpiry = l.expiry_date ? Math.ceil((new Date(l.expiry_date).getTime() - Date.now()) / 86400000) : null;
                                return (
                                    <tr key={l.id} onClick={() => { setSelected(selected?.id === l.id ? null : l); setTraceMode(null); }} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === l.id ? '#f0f9ff' : undefined }}>
                                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, fontSize: 11 }}>{l.lot_number}</td>
                                        <td style={{ padding: '8px 12px' }}><div style={{ fontWeight: 600, fontSize: 11 }}>{l.item_number}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>{l.item_description}</div></td>
                                        <td style={{ padding: '8px 12px', fontSize: 10, color: '#6b7280' }}>{l.lot_type}</td>
                                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700 }}>{Number(l.quantity).toLocaleString()} {l.unit_of_measure}</td>
                                        <td style={{ padding: '8px 12px', fontSize: 11 }}>{l.expiry_date ? <span style={{ color: daysToExpiry !== null && daysToExpiry < 30 ? '#dc2626' : '#374151', fontWeight: daysToExpiry !== null && daysToExpiry < 30 ? 700 : 400 }}>{fmtDate(l.expiry_date)}</span> : <span style={{ color: '#9ca3af' }}>—</span>}</td>
                                        <td style={{ padding: '8px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{l.status}</span></td>
                                        <td style={{ padding: '8px 12px' }}>{l.status === 'Active' && <button onClick={ev => { ev.stopPropagation(); statusMut.mutate({ lot: l.lot_number, status: 'Quarantine' }); }} style={{ padding: '2px 7px', background: '#fee2e2', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#dc2626' }}>Hold</button>}</td>
                                    </tr>
                                );
                            })}
                            {lots.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No lots found</td></tr>}
                        </tbody>
                    </table>
                </div>

                {selected && (
                    <div style={{ width: 300, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700 }}>{selected.lot_number}</div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 10 }}>
                            <div>Item: <strong>{selected.item_number}</strong></div>
                            <div>Qty: {Number(selected.quantity).toLocaleString()} {selected.unit_of_measure}</div>
                            {selected.work_order_id && <div>Work Order: {selected.work_order_id}</div>}
                            {selected.supplier_lot && <div>Supplier Lot: {selected.supplier_lot}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                            <button onClick={() => setTraceMode(traceMode === 'up' ? null : 'up')} style={{ flex: 1, padding: '5px', background: traceMode === 'up' ? '#1d4ed8' : '#f3f4f6', color: traceMode === 'up' ? '#fff' : '#374151', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <GitMerge size={10} /> Parents
                            </button>
                            <button onClick={() => setTraceMode(traceMode === 'down' ? null : 'down')} style={{ flex: 1, padding: '5px', background: traceMode === 'down' ? '#7c3aed' : '#f3f4f6', color: traceMode === 'down' ? '#fff' : '#374151', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <ChevronRight size={10} /> Children
                            </button>
                        </div>
                        {traceMode && (
                            <div style={{ marginBottom: 10 }}>
                                {(traceData as any[]).map((t: any, i: number) => (
                                    <div key={i} style={{ padding: '4px 8px', background: '#f9fafb', borderRadius: 6, marginBottom: 3, fontSize: 10 }}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{t.lot_number}</span> — {t.item_number}
                                    </div>
                                ))}
                                {(traceData as any[]).length === 0 && <span style={{ fontSize: 10, color: '#9ca3af' }}>No {traceMode === 'up' ? 'parent' : 'child'} lots</span>}
                            </div>
                        )}
                        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Trace Events</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {(selected.trace_events ?? []).slice(-5).reverse().map((ev: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: 6, fontSize: 9, alignItems: 'center', padding: '3px 6px', background: '#f9fafb', borderRadius: 4 }}>
                                    <span style={{ padding: '1px 5px', borderRadius: 3, background: '#111827', color: '#fff', fontSize: 8 }}>{ev.event}</span>
                                    <span style={{ color: '#6b7280' }}>{new Date(ev.at).toLocaleDateString()}</span>
                                    {ev.qty && <span style={{ fontFamily: 'monospace' }}>{ev.qty}</span>}
                                </div>
                            ))}
                            {!(selected.trace_events ?? []).length && <span style={{ fontSize: 10, color: '#9ca3af' }}>No events</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
