import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Input } from "@/components/ui/input";


interface Cycle { id: string; cycle_name: string; cycle_type: string; status: string; count_date: string; line_count: number; counted_lines: number; approved_by: string; created_at: string; }
interface Line { id: string; item_number: string; location: string; lot_number: string; book_quantity: number; count_quantity: number; variance_quantity: number; variance_value: number; count_status: string; counted_by: string; }

const CYCLE_STATUS_CLR: Record<string, string> = { Planned: '#6b7280', Counting: '#d97706', Under_Review: '#1d4ed8', Approved: '#7c3aed', Posted: '#059669', Cancelled: '#dc2626' };

export default function PhysicalInventory() {
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
    const [showNewCycle, setShowNewCycle] = useState(false);
    const [showAddLines, setShowAddLines] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [cycleForm, setCycleForm] = useState({ cycleName: '', cycleType: 'CYCLE_COUNT', countDate: new Date().toISOString().split('T')[0], locationFilter: '', itemFilter: '' });
    const [linesText, setLinesText] = useState('');  // CSV: item,location,bookQty,unitCost
    const [countBy, setCountBy] = useState('');
    const qc = useQueryClient();

    const { data: cycles = [] } = useQuery<Cycle[]>({ queryKey: ['pi-cycles', statusFilter], queryFn: () => fetch(`/api/mfg/physical-inventory/cycles${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: variance = [] } = useQuery<Line[]>({ queryKey: ['pi-variance', selectedCycle?.id], enabled: !!selectedCycle, queryFn: () => fetch(`/api/mfg/physical-inventory/cycles/${selectedCycle!.id}/variance`).then(r => r.json()) });

    const createCycleMut = useMutation({ mutationFn: (d: any) => fetch('/api/mfg/physical-inventory/cycles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['pi-cycles'] }); setShowNewCycle(false); } });
    const addLinesMut = useMutation({ mutationFn: ({ cycleId, lines }: { cycleId: string; lines: any[] }) => fetch(`/api/mfg/physical-inventory/cycles/${cycleId}/lines`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines }) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['pi-cycles'] }); setShowAddLines(false); } });
    const recordCountMut = useMutation({ mutationFn: ({ lineId, countQuantity }: { lineId: string; countQuantity: number }) => fetch(`/api/mfg/physical-inventory/lines/${lineId}/count`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ countQuantity, countedBy: countBy || 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['pi-variance'] }) });
    const approveMut = useMutation({ mutationFn: (cycleId: string) => fetch(`/api/mfg/physical-inventory/cycles/${cycleId}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvedBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['pi-cycles'] }) });

    const parseLines = () => linesText.trim().split('\n').map(row => { const [itemNumber, location, bookQty, unitCost] = row.split(','); return { itemNumber, location, bookQuantity: parseFloat(bookQty), unitCost: parseFloat(unitCost) }; }).filter(l => l.itemNumber);

    const totalVariance = variance.reduce((s, l) => s + Number(l.variance_value ?? 0), 0);
    const negCount = variance.filter(l => Number(l.variance_quantity) < 0).length;
    const posCount = variance.filter(l => Number(l.variance_quantity) > 0).length;

    const varianceColumns: SpreadsheetColumn<Line>[] = [
        { id: "item", header: "Item", width: "120px", cell: (l) => <span style={{ fontWeight: 700 }}>{l.item_number}</span> },
        { id: "location", header: "Location", width: "120px", cell: (l) => <span style={{ color: '#6b7280' }}>{l.location ?? '—'}</span> },
        { id: "lot", header: "Lot", width: "120px", cell: (l) => <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9ca3af' }}>{l.lot_number ?? '—'}</span> },
        { id: "bookQty", header: "Book Qty", width: "100px", cell: (l) => <span style={{ fontFamily: 'monospace' }}>{Number(l.book_quantity).toFixed(2)}</span> },
        { id: "countQty", header: "Count Qty", width: "100px", cell: (l) => <span style={{ fontFamily: 'monospace', color: l.count_quantity == null ? '#9ca3af' : '#374151' }}>{l.count_quantity != null ? Number(l.count_quantity).toFixed(2) : '—'}</span> },
        {
            id: "variance", header: "Variance", width: "100px", cell: (l) => {
                const vqty = Number(l.variance_quantity ?? 0);
                return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: vqty < 0 ? '#dc2626' : vqty > 0 ? '#059669' : '#9ca3af' }}>{vqty !== 0 ? (vqty > 0 ? '+' : '') + vqty.toFixed(2) : '0'}</span>;
            }
        },
        {
            id: "valueDelta", header: "Value Δ", width: "100px", cell: (l) => {
                const vval = Number(l.variance_value ?? 0);
                return <span style={{ fontFamily: 'monospace', fontSize: 10, color: vval < 0 ? '#dc2626' : vval > 0 ? '#059669' : '#9ca3af' }}>{vval !== 0 ? (vval > 0 ? '+' : '') + '$' + Math.abs(vval).toFixed(2) : '—'}</span>;
            }
        },
        { id: "status", header: "Status", width: "100px", cell: (l) => <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: l.count_status === 'Counted' ? '#d1fae5' : '#f3f4f6', color: l.count_status === 'Counted' ? '#059669' : '#6b7280' }}>{l.count_status}</span> },
        {
            id: "action", header: "Action", width: "100px", cell: (l) => l.count_status === 'Pending' ? (
                <button onClick={() => recordCountMut.mutate({ lineId: l.id, countQuantity: parseFloat(prompt('Enter counted quantity:') ?? '0') })} style={{ padding: '2px 7px', background: '#eff6ff', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#1d4ed8' }}>Count</button>
            ) : null
        }
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Physical Inventory</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Cycle counts · Wall-to-wall · Variance analysis · Approval workflow</p>
                </div>
                <button onClick={() => setShowNewCycle(true)} style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New Cycle</button>
            </div>

            {/* New cycle form */}
            {showNewCycle && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Create Count Cycle</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Cycle Name</label>
                            <input value={cycleForm.cycleName} onChange={e => setCycleForm(p => ({ ...p, cycleName: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label="Cycle name" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Type</label>
                            <select value={cycleForm.cycleType} onChange={e => setCycleForm(p => ({ ...p, cycleType: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label="Cycle type">
                                {['CYCLE_COUNT', 'FULL_WALL_TO_WALL', 'ABC_CYCLE'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Count Date</label>
                            <Input type="date" value={cycleForm.countDate} onChange={e => setCycleForm(p => ({ ...p, countDate: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label="Count date" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Location Filter</label>
                            <input value={cycleForm.locationFilter} onChange={e => setCycleForm(p => ({ ...p, locationFilter: e.target.value }))} placeholder="e.g. WHSE-A" style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label="Location filter" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 700 }}>Item Filter</label>
                            <input value={cycleForm.itemFilter} onChange={e => setCycleForm(p => ({ ...p, itemFilter: e.target.value }))} placeholder="e.g. A-class items" style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} aria-label="Item filter" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowNewCycle(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!cycleForm.cycleName} onClick={() => createCycleMut.mutate(cycleForm)} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Create</button>
                    </div>
                </div>
            )}

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['', 'Planned', 'Counting', 'Under_Review', 'Approved', 'Posted', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: statusFilter === s ? '#111827' : '#fff', color: statusFilter === s ? '#fff' : '#6b7280', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{s || 'All'}</button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
                {/* Cycles list */}
                <div style={{ width: 380, flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {cycles.map(c => {
                            const clr = CYCLE_STATUS_CLR[c.status] ?? '#6b7280';
                            const pct = c.line_count > 0 ? Math.round(Number(c.counted_lines) / Number(c.line_count) * 100) : 0;
                            return (
                                <div key={c.id} onClick={() => setSelectedCycle(selectedCycle?.id === c.id ? null : c)} style={{ background: '#fff', border: `1px solid ${selectedCycle?.id === c.id ? '#1d4ed8' : '#e5e7eb'}`, borderLeft: `4px solid ${clr}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{c.cycle_name}</div>
                                        <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: clr + '18', color: clr }}>{c.status}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6 }}>{c.cycle_type.replace(/_/g, ' ')} · {new Date(c.count_date).toLocaleDateString()} · {c.counted_lines}/{c.line_count} lines</div>
                                    <div style={{ background: '#f3f4f6', borderRadius: 999, height: 4 }}>
                                        <div style={{ width: pct + '%', background: pct === 100 ? '#059669' : '#1d4ed8', height: '100%', borderRadius: 999 }} />
                                    </div>
                                    {c.status === 'Counting' && (
                                        <button onClick={ev => { ev.stopPropagation(); approveMut.mutate(c.id); }} style={{ marginTop: 6, padding: '4px 10px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <CheckCircle2 size={9} /> Approve
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {cycles.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, background: '#fff', borderRadius: 10 }}>No cycles — create a count cycle to start</div>}
                    </div>
                </div>

                {/* Variance detail */}
                {selectedCycle && (
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedCycle.cycle_name} — Variance</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>Short: {negCount}</div>
                                <div style={{ fontSize: 11, background: '#d1fae5', color: '#059669', fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>Over: {posCount}</div>
                                <div style={{ fontSize: 11, background: Math.abs(totalVariance) > 0 ? '#fef3c7' : '#f3f4f6', color: Math.abs(totalVariance) > 0 ? '#d97706' : '#6b7280', fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                                    Net: {totalVariance < 0 ? '-' : '+'}${Math.abs(totalVariance).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
                            <button onClick={() => setShowAddLines(!showAddLines)} style={{ padding: '5px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>+ Add Lines (CSV)</button>
                            <input value={countBy} onChange={e => setCountBy(e.target.value)} placeholder="Counted by…" style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, width: 120 }} aria-label="Counted by" />
                        </div>
                        {showAddLines && (
                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>CSV format: ItemNumber, Location, BookQty, UnitCost (one per line)</div>
                                <textarea rows={4} value={linesText} onChange={e => setLinesText(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', boxSizing: 'border-box' }} aria-label="CSV lines" />
                                <button onClick={() => addLinesMut.mutate({ cycleId: selectedCycle.id, lines: parseLines() })} disabled={!linesText.trim()} style={{ marginTop: 6, padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Add Lines</button>
                            </div>
                        )}
                        <div style={{ height: '500px', width: '100%' }}>
                            <InteractiveSpreadsheet
                                columns={varianceColumns}
                                data={variance}
                                onChange={() => { }}
                                containerHeight="500px"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
