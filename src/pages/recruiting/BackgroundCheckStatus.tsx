import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ShieldAlert, ClipboardList } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";

interface BGCOrder {
    id: string; applicant_id: string; candidate_name: string; package_type: string;
    status: string; adjudication: string; consent_signed_at: string; ordered_at: string;
    completed_at: string; total_components: number; completed_components: number; hits: number;
    hold_start_date: string; final_decision: string;
}
interface BGCDetail extends BGCOrder { components: { component_type: string; status: string; result: string; details: string }[]; }
interface BGCSummary { initiated: number; in_progress: number; clear: number; consider: number; adverse_action: number; withdrawn: number; }

const STATUS_CLR: Record<string, string> = { Initiated: 'bg-blue-700/10 text-blue-700', In_Progress: 'bg-amber-600/10 text-amber-600', Complete: 'bg-emerald-600/10 text-emerald-600', Adverse_Action: 'bg-red-600/10 text-red-600', Cancelled: 'bg-gray-500/10 text-gray-500' };
const ADJ_CLR: Record<string, string> = { Clear: 'text-emerald-600', Consider: 'text-amber-600', Adverse: 'text-red-600' };
const RESULT_CLR: Record<string, string> = { Clear: 'text-emerald-600', Hit: 'text-red-600', Unable_To_Verify: 'text-amber-600' };

function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function BackgroundCheckStatus() {
    const [selectedOrder, setSelectedOrder] = useState<BGCDetail | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [filter, setFilter] = useState('');
    const [form, setForm] = useState({ applicantId: '', candidateName: '', candidateEmail: '', packageType: 'STANDARD' });
    const [componentForm, setComponentForm] = useState({ componentType: 'CRIMINAL', result: 'Clear', details: '' });
    const [decisionForm, setDecisionForm] = useState({ decision: 'Proceed' as 'Proceed' | 'Withdraw' | 'Conditional', notes: '' });
    const qc = useQueryClient();

    const { data: summary } = useQuery<BGCSummary>({ queryKey: ['bgc-summary'], queryFn: () => fetch('/api/recruiting/bgc/summary').then(r => r.json()) });
    const { data: orders = [] } = useQuery<BGCOrder[]>({ queryKey: ['bgc-orders', filter], queryFn: () => fetch(`/api/recruiting/bgc/orders${filter ? `?status=${filter}` : ''}`).then(r => r.json()) });

    const initMut = useMutation({ mutationFn: (d: any) => fetch('/api/recruiting/bgc/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['bgc-orders', 'bgc-summary'] }); setShowNew(false); } });
    const consentMut = useMutation({ mutationFn: (id: string) => fetch(`/api/recruiting/bgc/orders/${id}/consent`, { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['bgc-orders', 'bgc-summary'] }) });
    const componentMut = useMutation({ mutationFn: ({ id, ...d }: any) => fetch(`/api/recruiting/bgc/orders/${id}/component`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['bgc-orders', 'bgc-summary'] }); loadDetail(v.id); } });
    const adverseMut = useMutation({ mutationFn: (id: string) => fetch(`/api/recruiting/bgc/orders/${id}/adverse`, { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['bgc-orders', 'bgc-summary'] }) });
    const decisionMut = useMutation({ mutationFn: ({ id, ...d }: any) => fetch(`/api/recruiting/bgc/orders/${id}/decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, decidedBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['bgc-orders', 'bgc-summary'] }) });

    const loadDetail = async (id: string) => {
        const d = await fetch(`/api/recruiting/bgc/orders/${id}`).then(r => r.json());
        setSelectedOrder(d);
    };

    const orderColumns: SpreadsheetColumn<any>[] = [
        {
            id: "candidate", header: "Candidate", width: "200px", cell: (row) => (
                <div onClick={() => loadDetail(row.id)} className="cursor-pointer">
                    <div className="font-bold">{row.candidate_name ?? row.applicant_id}</div>
                    <div className="text-[10px] text-gray-400">{row.applicant_id}</div>
                </div>
            )
        },
        { id: "package", header: "Package", width: "120px", cell: (row) => <div className="font-mono text-[10px] font-bold text-gray-700">{row.package_type}</div> },
        {
            id: "progress", header: "Progress", width: "200px", cell: (row) => {
                const pct = row.total_components > 0 ? Math.round(Number(row.completed_components) / Number(row.total_components) * 100) : 0;
                return (
                    <div>
                        <div className="flex justify-between text-[9px] text-gray-500">
                            <span>{row.completed_components}/{row.total_components}</span>
                            {Number(row.hits) > 0 && <span className="text-red-600 font-bold">⚑ {row.hits} hit{Number(row.hits) > 1 ? 's' : ''}</span>}
                        </div>
                        <style>{`.bgc-pct-${row.id} { width: ${pct}%; }`}</style>
                        <div className="bg-gray-100 rounded-full h-[5px] mt-0.5">
                            {/* eslint-disable-next-line react/forbid-dom-props */}
                            <div className={`h-full rounded-full bgc-pct-${row.id} ${pct === 100 ? 'bg-emerald-600' : 'bg-blue-700'}`} />
                        </div>
                    </div>
                );
            }
        },
        { id: "adjudication", header: "Adjudication", width: "120px", cell: (row) => row.adjudication ? <span className={`font-bold ${ADJ_CLR[row.adjudication] ?? 'text-gray-500'}`}>{row.adjudication}</span> : <span className="text-gray-400 text-[10px]">—</span> },
        { id: "status", header: "Status", width: "150px", cell: (row) => <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_CLR[row.status] ?? 'bg-gray-500/10 text-gray-500'}`}>{row.status.replace(/_/g, ' ')}</span> },
        {
            id: "actions", header: "", width: "160px", cell: (row) => (
                <div className="flex gap-1.5 justify-end w-full">
                    <button onClick={(e) => { e.stopPropagation(); loadDetail(row.id); }} className="px-2 py-1 bg-gray-100 text-gray-700 border-none rounded-[5px] text-[10px] cursor-pointer">View</button>
                    {row.status === 'Initiated' && <button onClick={(e) => { e.stopPropagation(); consentMut.mutate(row.id); }} className="px-2 py-1 bg-blue-700 text-white border-none rounded-[5px] text-[10px] cursor-pointer">Get Consent</button>}
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Background Check Management" description="FCRA compliant · Adverse action workflow · Component-level results">
            <div className="flex justify-between mb-4">
                <button onClick={() => setShowNew(true)} className="px-3.5 py-2 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">+ Initiate Check</button>
            </div>

            {/* KPIs */}
            {summary && (
                <div className="flex gap-2.5 mb-3.5">
                    {([['Initiated', summary.initiated, 'border-gray-500', 'text-gray-500'], ['In Progress', summary.in_progress, 'border-amber-600', 'text-amber-600'], ['Clear', summary.clear, 'border-emerald-600', 'text-emerald-600'], ['Consider', summary.consider, 'border-amber-500', 'text-amber-500'], ['Adverse Action', summary.adverse_action, 'border-red-600', 'text-red-600'], ['Withdrawn', summary.withdrawn, 'border-gray-400', 'text-gray-400']] as [string, number, string, string][]).map(([l, v, bc, tc]) => (
                        <div key={l} className={`flex-1 bg-white border border-gray-200 border-l-4 rounded-xl p-2.5 ${bc}`}>
                            <div className={`text-xl font-extrabold font-mono ${tc}`}>{v ?? 0}</div>
                            <div className="text-[10px] text-gray-400">{l}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter row */}
            <div className="flex gap-1.5 mb-3">
                {['', 'Initiated', 'In_Progress', 'Complete', 'Adverse_Action'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 border border-gray-200 rounded-md text-[11px] font-semibold cursor-pointer ${filter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>{s || 'All'}</button>
                ))}
            </div>

            {/* New order form */}
            {showNew && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-3">
                    <div className="text-[13px] font-bold mb-2.5">Initiate Background Check</div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] font-semibold">Package</label>
                            <select value={form.packageType} onChange={e => setForm(p => ({ ...p, packageType: e.target.value }))} className="px-2 py-1.5 border border-gray-300 rounded-md text-[11px]" aria-label="Package">
                                {['BASIC', 'STANDARD', 'COMPREHENSIVE', 'EXECUTIVE', 'INTERNATIONAL'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        {[['applicantId', 'Applicant ID', 'text'], ['candidateName', 'Candidate Name', 'text'], ['candidateEmail', 'Email', 'email']].map(([k, l, t]) => (
                            <div key={k} className="flex flex-col gap-0.5">
                                <label className="text-[10px] font-semibold">{l}</label>
                                <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="px-2 py-1.5 border border-gray-300 rounded-md text-[11px]" aria-label={l} />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-1.5 justify-end mt-2.5">
                        <button onClick={() => setShowNew(false)} className="px-3 py-1 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={!form.applicantId} onClick={() => initMut.mutate(form)} className="px-3 py-1 bg-blue-700 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-50">Initiate</button>
                    </div>
                </div>
            )}

            <div className="flex gap-3.5">
                {/* Orders list */}
                <div className="flex-1 h-[600px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    {orders.length === 0 ? (
                        <div className="text-center text-gray-400 p-6">No orders</div>
                    ) : (
                        <InteractiveSpreadsheet
                            columns={orderColumns}
                            data={orders.map(o => ({ ...o, _selected: o.id === selectedOrder?.id }))}
                            onChange={() => { }}
                            containerHeight="100%"
                        />
                    )}
                </div>

                {/* Detail panel */}
                {selectedOrder && (
                    <div className="w-[340px] bg-white border border-gray-200 rounded-xl p-4 shrink-0">
                        <div className="flex justify-between mb-2.5">
                            <div className="text-[13px] font-bold">{selectedOrder.candidate_name ?? selectedOrder.applicant_id}</div>
                            <button onClick={() => setSelectedOrder(null)} className="bg-transparent border-none cursor-pointer text-sm">✕</button>
                        </div>
                        <div className="text-[11px] text-gray-500 mb-2.5">
                            <div>Package: <strong>{selectedOrder.package_type}</strong></div>
                            <div>Consent: {fmtDate(selectedOrder.consent_signed_at)}</div>
                            <div>Ordered: {fmtDate(selectedOrder.ordered_at)}</div>
                            {selectedOrder.completed_at && <div>Completed: {fmtDate(selectedOrder.completed_at)}</div>}
                            {selectedOrder.hold_start_date && <div className="text-red-600">Hold start: {selectedOrder.hold_start_date}</div>}
                            {selectedOrder.final_decision && <div>Final decision: <strong>{selectedOrder.final_decision}</strong></div>}
                        </div>

                        {/* Components */}
                        <div className="text-[11px] font-bold mb-1.5 text-gray-700">Component Results</div>
                        <div className="flex flex-col gap-1 mb-3">
                            {selectedOrder.components.map(c => (
                                <div key={c.component_type} className="flex justify-between px-2 py-1 bg-gray-50 rounded-md">
                                    <span className="text-[10px]">{c.component_type}</span>
                                    <span className={`text-[10px] font-bold ${c.result ? (RESULT_CLR[c.result] ?? 'text-gray-500') : 'text-gray-400'}`}>{c.result ?? c.status}</span>
                                </div>
                            ))}
                        </div>

                        {/* Update component */}
                        {selectedOrder.status === 'In_Progress' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mb-2.5">
                                <div className="text-[10px] font-bold mb-1.5">Record Component Result</div>
                                <div className="flex flex-col gap-1.5">
                                    <select value={componentForm.componentType} onChange={e => setComponentForm(p => ({ ...p, componentType: e.target.value }))} className="px-1.5 py-1 border border-gray-300 rounded-md text-[10px]" aria-label="Component type">
                                        {selectedOrder.components.filter(c => !c.result).map(c => <option key={c.component_type} value={c.component_type}>{c.component_type}</option>)}
                                    </select>
                                    <select value={componentForm.result} onChange={e => setComponentForm(p => ({ ...p, result: e.target.value }))} className="px-1.5 py-1 border border-gray-300 rounded-md text-[10px]" aria-label="Result">
                                        {['Clear', 'Hit', 'Unable_To_Verify'].map(r => <option key={r}>{r}</option>)}
                                    </select>
                                    <input placeholder="Details (optional)" value={componentForm.details} onChange={e => setComponentForm(p => ({ ...p, details: e.target.value }))} className="px-1.5 py-1 border border-gray-300 rounded-md text-[10px]" aria-label="Details" />
                                    <button onClick={() => componentMut.mutate({ id: selectedOrder.id, ...componentForm })} className="p-1 bg-emerald-600 text-white border-none rounded-md text-[10px] cursor-pointer">Record</button>
                                </div>
                            </div>
                        )}

                        {/* Adverse action */}
                        {selectedOrder.status === 'Complete' && selectedOrder.adjudication === 'Consider' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-2.5">
                                <div className="text-[10px] font-bold text-red-600 mb-1">Adverse Adjudication</div>
                                <button onClick={() => adverseMut.mutate(selectedOrder.id)} className="w-full p-1.5 bg-red-600 text-white border-none rounded-md text-[10px] cursor-pointer flex items-center justify-center gap-1">
                                    <ShieldAlert size={10} /> Initiate Adverse Action
                                </button>
                            </div>
                        )}

                        {/* Final decision */}
                        {(selectedOrder.status === 'Complete' || selectedOrder.status === 'Adverse_Action') && !selectedOrder.final_decision && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                                <div className="text-[10px] font-bold mb-1.5">Final Decision</div>
                                <select value={decisionForm.decision} onChange={e => setDecisionForm(p => ({ ...p, decision: e.target.value as any }))} className="px-1.5 py-1 border border-gray-300 rounded-md text-[10px] w-full mb-1" aria-label="Decision">
                                    {['Proceed', 'Withdraw', 'Conditional'].map(d => <option key={d}>{d}</option>)}
                                </select>
                                <input placeholder="Notes" value={decisionForm.notes} onChange={e => setDecisionForm(p => ({ ...p, notes: e.target.value }))} className="px-1.5 py-1 border border-gray-300 rounded-md text-[10px] w-full mb-1" aria-label="Notes" />
                                <button onClick={() => decisionMut.mutate({ id: selectedOrder.id, ...decisionForm })} className="w-full p-1.5 bg-blue-700 text-white border-none rounded-md text-[10px] cursor-pointer">Finalize</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
