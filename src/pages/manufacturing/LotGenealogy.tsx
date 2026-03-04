import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitMerge, ChevronRight, AlertTriangle } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


interface Lot { id: string; lot_number: string; item_number: string; item_description: string; lot_type: string; quantity: number; unit_of_measure: string; status: string; expiry_date: string; supplier_lot: string; work_order_id: string; parent_lots: any[]; trace_events: any[]; created_at: string; }

const STATUS_CFG: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-600', Consumed: 'bg-gray-100 text-gray-500',
    Quarantine: 'bg-red-100 text-red-600', Scrapped: 'bg-amber-100 text-amber-600', Expired: 'bg-gray-100 text-gray-400',
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

    const lotColumns: SpreadsheetColumn<Lot>[] = [
        { id: "lotNumber", header: "Lot #", width: "150px", cell: (l) => <span className="font-mono font-bold text-[11px]">{l.lot_number}</span> },
        { id: "item", header: "Item", width: "200px", cell: (l) => <><div className="font-semibold text-[11px]">{l.item_number}</div><div className="text-[10px] text-gray-400">{l.item_description}</div></> },
        { id: "type", header: "Type", width: "100px", cell: (l) => <span className="text-[10px] text-gray-500">{l.lot_type}</span> },
        { id: "quantity", header: "Quantity", width: "150px", cell: (l) => <span className="font-mono font-bold">{Number(l.quantity).toLocaleString()} {l.unit_of_measure}</span> },
        {
            id: "expiry", header: "Expiry", width: "150px", cell: (l) => {
                const daysToExpiry = l.expiry_date ? Math.ceil((new Date(l.expiry_date).getTime() - Date.now()) / 86400000) : null;
                return l.expiry_date ? <span className={daysToExpiry !== null && daysToExpiry < 30 ? 'text-red-600 font-bold' : 'text-gray-700 font-normal'}>{fmtDate(l.expiry_date)}</span> : <span className="text-gray-400">—</span>;
            }
        },
        {
            id: "status", header: "Status", width: "120px", cell: (l) => {
                const cfg = STATUS_CFG[l.status] ?? STATUS_CFG.Active;
                return <span className={`py-0.5 px-2 rounded font-bold text-[10px] ${cfg}`}>{l.status}</span>;
            }
        },
        { id: "actions", header: "", width: "80px", cell: (l) => l.status === 'Active' ? <button onClick={ev => { ev.stopPropagation(); statusMut.mutate({ lot: l.lot_number, status: 'Quarantine' }); }} className="py-0.5 px-2 bg-red-100 border-none rounded text-[9px] cursor-pointer text-red-600">Hold</button> : null }
    ];

    return (
        <StandardPage title="Lot Genealogy &amp; Traceability">
            <div className="flex justify-between mb-4">
                <div>

                    <p className="text-[13px] text-gray-500 mt-1">Forward/backward traceability · JSONB trace events · Expiry management</p>
                </div>
                <button onClick={() => setShowNew(!showNew)} className="py-2 px-3.5 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">+ New Lot</button>
            </div>

            {expiring.length > 0 && (
                <div className="bg-amber-100 border border-amber-200 rounded-lg py-2 px-3.5 mb-3 flex items-center gap-2">
                    <AlertTriangle size={12} color="#d97706" />
                    <span className="text-xs text-amber-600 font-bold">{expiring.length} lot{expiring.length > 1 ? 's' : ''} expiring within 30 days</span>
                    <span className="text-[11px] text-amber-900">{expiring.slice(0, 3).map(l => `${l.lot_number} (${l.item_number})`).join(', ')}</span>
                </div>
            )}

            {showNew && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-3">
                    <div className="text-xs font-bold mb-2.5">Create Lot</div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {[['lotNumber', 'Lot Number', 'text'], ['itemNumber', 'Item Number', 'text'], ['quantity', 'Quantity', 'number'], ['unitOfMeasure', 'UOM', 'text'], ['expiryDate', 'Expiry Date', 'date'], ['supplierLot', 'Supplier Lot', 'text'], ['workOrderId', 'Work Order ID', 'text']].map(([k, l, t]) => (
                            <div key={k} className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-bold text-gray-700">{l}</label>
                                <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="py-1 px-2 border border-gray-300 rounded-md text-[11px]" aria-label={l} />
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold">Lot Type</label>
                            <select value={form.lotType} onChange={e => setForm(p => ({ ...p, lotType: e.target.value }))} className="py-1 px-2 border border-gray-300 rounded-md text-[11px]" aria-label="Lot type">
                                {['PRODUCTION', 'PURCHASED', 'REWORK', 'CONSIGNMENT'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                        <button onClick={() => setShowNew(false)} className="py-1 px-3 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={!form.lotNumber || !form.itemNumber} onClick={() => createMut.mutate({ ...form, quantity: Number(form.quantity) })} className="py-1 px-3 bg-blue-700 text-white border-none rounded-md text-[11px] font-bold cursor-pointer disabled:opacity-50">Create Lot</button>
                    </div>
                </div>
            )}

            <div className="flex gap-1.5 mb-3 flex-wrap">
                {['', 'Active', 'Quarantine', 'Consumed', 'Scrapped', 'Expired'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`py-1 px-2 border border-gray-200 rounded-md text-[10px] font-semibold cursor-pointer ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>{s || 'All'}</button>
                ))}
                <input value={itemFilter} onChange={e => setItemFilter(e.target.value)} placeholder="Filter by item…" className="py-1 px-2 border border-gray-300 rounded-md text-[11px] w-[140px]" aria-label="Filter by item" />
            </div>

            <div className="flex gap-3.5">
                <div className="flex-1 min-h-[400px] h-full border border-gray-200 rounded-xl">
                    <InteractiveSpreadsheet
                        columns={lotColumns}
                        data={lots}
                        activeRow={selected?.id}
                        onRowSelect={(l) => { setSelected(selected?.id === l.id ? null : l as Lot); setTraceMode(null); }}
                        onChange={() => { }}
                        containerHeight="600px"
                    />
                </div>

                {selected && (
                    <div className="w-[300px] shrink-0 bg-white border border-gray-200 rounded-xl p-3.5">
                        <div className="flex justify-between mb-2">
                            <div className="font-bold">{selected.lot_number}</div>
                            <button onClick={() => setSelected(null)} className="bg-transparent border-none cursor-pointer">✕</button>
                        </div>
                        <div className="text-[10px] text-gray-500 mb-2.5">
                            <div>Item: <strong className="font-bold">{selected.item_number}</strong></div>
                            <div>Qty: {Number(selected.quantity).toLocaleString()} {selected.unit_of_measure}</div>
                            {selected.work_order_id && <div>Work Order: {selected.work_order_id}</div>}
                            {selected.supplier_lot && <div>Supplier Lot: {selected.supplier_lot}</div>}
                        </div>
                        <div className="flex gap-1.5 mb-2.5">
                            <button onClick={() => setTraceMode(traceMode === 'up' ? null : 'up')} className={`flex-1 py-1 rounded-md text-[10px] cursor-pointer flex items-center justify-center gap-1 border-none ${traceMode === 'up' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                <GitMerge size={10} /> Parents
                            </button>
                            <button onClick={() => setTraceMode(traceMode === 'down' ? null : 'down')} className={`flex-1 py-1 rounded-md text-[10px] cursor-pointer flex items-center justify-center gap-1 border-none ${traceMode === 'down' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                <ChevronRight size={10} /> Children
                            </button>
                        </div>
                        {traceMode && (
                            <div className="mb-2.5">
                                {(traceData as any[]).map((t: any, i: number) => (
                                    <div key={i} className="py-1 px-2 bg-gray-50 rounded-md mb-1 text-[10px]">
                                        <span className="font-mono font-bold">{t.lot_number}</span> — {t.item_number}
                                    </div>
                                ))}
                                {(traceData as any[]).length === 0 && <span className="text-[10px] text-gray-400">No {traceMode === 'up' ? 'parent' : 'child'} lots</span>}
                            </div>
                        )}
                        <div className="text-[10px] font-bold mb-1.5">Trace Events</div>
                        <div className="flex flex-col gap-1">
                            {(selected.trace_events ?? []).slice(-5).reverse().map((ev: any, i: number) => (
                                <div key={i} className="flex gap-1.5 text-[9px] items-center py-1 px-1.5 bg-gray-50 rounded">
                                    <span className="py-0.5 px-1 rounded-sm bg-gray-900 text-white text-[8px]">{ev.event}</span>
                                    <span className="text-gray-500">{new Date(ev.at).toLocaleDateString()}</span>
                                    {ev.qty && <span className="font-mono">{ev.qty}</span>}
                                </div>
                            ))}
                            {!(selected.trace_events ?? []).length && <span className="text-[10px] text-gray-400">No events</span>}
                        </div>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
