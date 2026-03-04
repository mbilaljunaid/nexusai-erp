import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

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
        { id: "item", header: "Item", width: "120px", cell: (l) => <span className="font-bold">{l.item_number}</span> },
        { id: "location", header: "Location", width: "120px", cell: (l) => <span className="text-gray-500">{l.location ?? '—'}</span> },
        { id: "lot", header: "Lot", width: "120px", cell: (l) => <span className="font-mono text-[10px] text-gray-400">{l.lot_number ?? '—'}</span> },
        { id: "bookQty", header: "Book Qty", width: "100px", cell: (l) => <span className="font-mono">{Number(l.book_quantity).toFixed(2)}</span> },
        { id: "countQty", header: "Count Qty", width: "100px", cell: (l) => <span className={`font-mono ${l.count_quantity == null ? 'text-gray-400' : 'text-gray-700'}`}>{l.count_quantity != null ? Number(l.count_quantity).toFixed(2) : '—'}</span> },
        {
            id: "variance", header: "Variance", width: "100px", cell: (l) => {
                const vqty = Number(l.variance_quantity ?? 0);
                return <span className={`font-mono font-bold ${vqty < 0 ? 'text-red-600' : vqty > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{vqty !== 0 ? (vqty > 0 ? '+' : '') + vqty.toFixed(2) : '0'}</span>;
            }
        },
        {
            id: "valueDelta", header: "Value Δ", width: "100px", cell: (l) => {
                const vval = Number(l.variance_value ?? 0);
                return <span className={`font-mono text-[10px] ${vval < 0 ? 'text-red-600' : vval > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{vval !== 0 ? (vval > 0 ? '+' : '') + '$' + Math.abs(vval).toFixed(2) : '—'}</span>;
            }
        },
        { id: "status", header: "Status", width: "100px", cell: (l) => <span className={`text-[9px] py-0.5 px-1.5 rounded-sm ${l.count_status === 'Counted' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{l.count_status}</span> },
        {
            id: "action", header: "Action", width: "100px", cell: (l) => l.count_status === 'Pending' ? (
                <button onClick={() => recordCountMut.mutate({ lineId: l.id, countQuantity: parseFloat(prompt('Enter counted quantity:') ?? '0') })} className="py-0.5 px-2 bg-blue-50 border-none rounded text-[9px] cursor-pointer text-blue-700">Count</button>
            ) : null
        }
    ];

    return (
        <div className="p-6 max-w-[1400px] mx-auto font-sans">
            <div className="flex justify-between mb-4">
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900 m-0">Physical Inventory</h1>
                    <p className="text-[13px] text-gray-500 mt-1 mb-0">Cycle counts · Wall-to-wall · Variance analysis · Approval workflow</p>
                </div>
                <button onClick={() => setShowNewCycle(true)} className="py-2 px-3.5 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">+ New Cycle</button>
            </div>

            {/* New cycle form */}
            {showNewCycle && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-3">
                    <div className="text-xs font-bold mb-2.5">Create Count Cycle</div>
                    <div className="grid grid-cols-3 gap-2 mb-2.5">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] font-bold">Cycle Name</label>
                            <input value={cycleForm.cycleName} onChange={e => setCycleForm(p => ({ ...p, cycleName: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs" aria-label="Cycle name" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] font-bold">Type</label>
                            <select value={cycleForm.cycleType} onChange={e => setCycleForm(p => ({ ...p, cycleType: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs" aria-label="Cycle type">
                                {['CYCLE_COUNT', 'FULL_WALL_TO_WALL', 'ABC_CYCLE'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] font-bold">Count Date</label>
                            <input type="date" value={cycleForm.countDate} onChange={e => setCycleForm(p => ({ ...p, countDate: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs" aria-label="Count date" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] font-bold">Location Filter</label>
                            <input value={cycleForm.locationFilter} onChange={e => setCycleForm(p => ({ ...p, locationFilter: e.target.value }))} placeholder="e.g. WHSE-A" className="py-1.5 px-2 border border-gray-300 rounded-md text-xs" aria-label="Location filter" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] font-bold">Item Filter</label>
                            <input value={cycleForm.itemFilter} onChange={e => setCycleForm(p => ({ ...p, itemFilter: e.target.value }))} placeholder="e.g. A-class items" className="py-1.5 px-2 border border-gray-300 rounded-md text-xs" aria-label="Item filter" />
                        </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                        <button onClick={() => setShowNewCycle(false)} className="py-1 px-3 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={!cycleForm.cycleName} onClick={() => createCycleMut.mutate(cycleForm)} className="py-1 px-3 bg-blue-700 text-white border-none rounded-md text-[11px] font-bold cursor-pointer disabled:opacity-50">Create</button>
                    </div>
                </div>
            )}

            {/* Status filter */}
            <div className="flex gap-1.5 mb-3">
                {['', 'Planned', 'Counting', 'Under_Review', 'Approved', 'Posted', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`py-1 px-2.5 border border-gray-200 rounded-md text-[10px] font-semibold cursor-pointer ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>{s || 'All'}</button>
                ))}
            </div>

            <div className="flex gap-3.5">
                {/* Cycles list */}
                <div className="w-[380px] shrink-0">
                    <style>{`
                        ${cycles.map(c => `
                            .pi-cycle-${c.id} { border-left: 4px solid ${CYCLE_STATUS_CLR[c.status] ?? '#6b7280'}; }
                            .pi-cycle-status-${c.id} { background: ${(CYCLE_STATUS_CLR[c.status] ?? '#6b7280')}18; color: ${CYCLE_STATUS_CLR[c.status] ?? '#6b7280'}; }
                            .pi-cycle-pct-${c.id} { width: ${c.line_count > 0 ? Math.round(Number(c.counted_lines) / Number(c.line_count) * 100) : 0}%; }
                        `).join('')}
                    `}</style>
                    <div className="flex flex-col gap-1.5">
                        {cycles.map(c => {
                            const clr = CYCLE_STATUS_CLR[c.status] ?? '#6b7280';
                            const pct = c.line_count > 0 ? Math.round(Number(c.counted_lines) / Number(c.line_count) * 100) : 0;
                            // eslint-disable-next-line react/forbid-dom-props
                            return (
                                // eslint-disable-next-line react/forbid-dom-props
                                <div key={c.id} onClick={() => setSelectedCycle(selectedCycle?.id === c.id ? null : c)} className={`bg-white rounded-xl p-3.5 cursor-pointer border pi-cycle-${c.id} ${selectedCycle?.id === c.id ? 'border-blue-700' : 'border-gray-200'}`}>
                                    <div className="flex justify-between mb-1">
                                        <div className="font-bold text-[13px]">{c.cycle_name}</div>
                                        {/* eslint-disable-next-line react/forbid-dom-props */}
                                        <span className={`py-0.5 px-2 rounded col-span-2 text-[10px] font-bold pi-cycle-status-${c.id}`}>{c.status}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 mb-1.5">{c.cycle_type.replace(/_/g, ' ')} · {new Date(c.count_date).toLocaleDateString()} · {c.counted_lines}/{c.line_count} lines</div>
                                    <div className="bg-gray-100 rounded-full h-1">
                                        {/* eslint-disable-next-line react/forbid-dom-props */}
                                        <div className={`h-full rounded-full pi-cycle-pct-${c.id} ${pct === 100 ? 'bg-emerald-600' : 'bg-blue-700'}`} />
                                    </div>
                                    {c.status === 'Counting' && (
                                        <button onClick={ev => { ev.stopPropagation(); approveMut.mutate(c.id); }} className="mt-1.5 py-1 px-2.5 bg-purple-600 text-white border-none rounded-md text-[10px] cursor-pointer flex items-center gap-1">
                                            <CheckCircle2 size={9} /> Approve
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {cycles.length === 0 && <div className="text-center text-gray-400 p-8 bg-white rounded-xl">No cycles — create a count cycle to start</div>}
                    </div>
                </div>

                {/* Variance detail */}
                {selectedCycle && (
                    <div className="flex-1">
                        <div className="flex justify-between mb-2.5 items-center">
                            <div className="font-bold text-sm">{selectedCycle.cycle_name} — Variance</div>
                            <div className="flex gap-2">
                                <div className="text-[11px] bg-red-100 text-red-600 font-bold py-1 px-2.5 rounded-md">Short: {negCount}</div>
                                <div className="text-[11px] bg-emerald-100 text-emerald-600 font-bold py-1 px-2.5 rounded-md">Over: {posCount}</div>
                                <div className={`text-[11px] font-bold py-1 px-2.5 rounded-md ${Math.abs(totalVariance) > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                    Net: {totalVariance < 0 ? '-' : '+'}${Math.abs(totalVariance).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="mb-2.5 flex gap-2">
                            <button onClick={() => setShowAddLines(!showAddLines)} className="py-1 px-3 bg-gray-100 border border-gray-200 rounded-md text-[11px] cursor-pointer">+ Add Lines (CSV)</button>
                            <input value={countBy} onChange={e => setCountBy(e.target.value)} placeholder="Counted by…" className="py-1 px-2 border border-gray-300 rounded-md text-[11px] w-[120px]" aria-label="Counted by" />
                        </div>
                        {showAddLines && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-2.5">
                                <div className="text-[10px] text-gray-500 mb-1">CSV format: ItemNumber, Location, BookQty, UnitCost (one per line)</div>
                                <textarea rows={4} value={linesText} onChange={e => setLinesText(e.target.value)} className="w-full py-1.5 px-2 border border-gray-300 rounded-md text-[10px] font-mono box-border" aria-label="CSV lines" />
                                <button onClick={() => addLinesMut.mutate({ cycleId: selectedCycle.id, lines: parseLines() })} disabled={!linesText.trim()} className="mt-1.5 py-1 px-3 bg-blue-700 text-white border-none rounded-md text-[11px] cursor-pointer disabled:opacity-50">Add Lines</button>
                            </div>
                        )}
                        <div className="h-[500px] w-full">
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
        </div >
    );
}
