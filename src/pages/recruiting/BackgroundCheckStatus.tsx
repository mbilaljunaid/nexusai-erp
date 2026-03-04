import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ShieldAlert, ClipboardList } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface BGCOrder {
    id: string; applicant_id: string; candidate_name: string; package_type: string;
    status: string; adjudication: string; consent_signed_at: string; ordered_at: string;
    completed_at: string; total_components: number; completed_components: number; hits: number;
    hold_start_date: string; final_decision: string;
}
interface BGCDetail extends BGCOrder { components: { component_type: string; status: string; result: string; details: string }[]; }
interface BGCSummary { initiated: number; in_progress: number; clear: number; consider: number; adverse_action: number; withdrawn: number; }

const STATUS_CLR: Record<string, string> = { Initiated: '#1d4ed8', In_Progress: '#d97706', Complete: '#059669', Adverse_Action: '#dc2626', Cancelled: '#6b7280' };
const ADJ_CLR: Record<string, string> = { Clear: '#059669', Consider: '#d97706', Adverse: '#dc2626' };
const RESULT_CLR: Record<string, string> = { Clear: '#059669', Hit: '#dc2626', Unable_To_Verify: '#d97706' };

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
                    <div style={{ fontWeight: 700 }}>{row.candidate_name ?? row.applicant_id}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{row.applicant_id}</div>
                </div>
            )
        },
        { id: "package", header: "Package", width: "120px", cell: (row) => <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#374151' }}>{row.package_type}</div> },
        {
            id: "progress", header: "Progress", width: "200px", cell: (row) => {
                const pct = row.total_components > 0 ? Math.round(Number(row.completed_components) / Number(row.total_components) * 100) : 0;
                return (
                    <div style={{ minWidth: 90 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#6b7280' }}>
                            <span>{row.completed_components}/{row.total_components}</span>
                            {Number(row.hits) > 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}>⚑ {row.hits} hit{Number(row.hits) > 1 ? 's' : ''}</span>}
                        </div>
                        <div style={{ background: '#f3f4f6', borderRadius: 999, height: 5, marginTop: 2 }}>
                            <div style={{ width: pct + '%', background: pct === 100 ? '#059669' : '#1d4ed8', height: '100%', borderRadius: 999 }} />
                        </div>
                    </div>
                );
            }
        },
        { id: "adjudication", header: "Adjudication", width: "120px", cell: (row) => row.adjudication ? <span style={{ fontWeight: 700, color: ADJ_CLR[row.adjudication] ?? '#6b7280' }}>{row.adjudication}</span> : <span style={{ color: '#9ca3af', fontSize: 10 }}>—</span> },
        { id: "status", header: "Status", width: "150px", cell: (row) => <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: (STATUS_CLR[row.status] ?? '#6b7280') + '18', color: STATUS_CLR[row.status] ?? '#6b7280' }}>{row.status.replace(/_/g, ' ')}</span> },
        {
            id: "actions", header: "", width: "160px", cell: (row) => (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', width: '100%' }}>
                    <button onClick={(e) => { e.stopPropagation(); loadDetail(row.id); }} style={{ padding: '3px 8px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>View</button>
                    {row.status === 'Initiated' && <button onClick={(e) => { e.stopPropagation(); consentMut.mutate(row.id); }} style={{ padding: '3px 8px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>Get Consent</button>}
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1300, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Background Check Management</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>FCRA compliant · Adverse action workflow · Component-level results</p>
                </div>
                <button onClick={() => setShowNew(true)} style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Initiate Check</button>
            </div>

            {/* KPIs */}
            {summary && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    {([['Initiated', summary.initiated, '#6b7280'], ['In Progress', summary.in_progress, '#d97706'], ['Clear', summary.clear, '#059669'], ['Consider', summary.consider, '#f59e0b'], ['Adverse Action', summary.adverse_action, '#dc2626'], ['Withdrawn', summary.withdrawn, '#9ca3af']] as [string, number, string][]).map(([l, v, c]) => (
                        <div key={l} style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: c }}>{v ?? 0}</div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{l}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter row */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['', 'Initiated', 'In_Progress', 'Complete', 'Adverse_Action'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: filter === s ? '#111827' : '#fff', color: filter === s ? '#fff' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{s || 'All'}</button>
                ))}
            </div>

            {/* New order form */}
            {showNew && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Initiate Background Check</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <label style={{ fontSize: 10, fontWeight: 600 }}>Package</label>
                            <select value={form.packageType} onChange={e => setForm(p => ({ ...p, packageType: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Package">
                                {['BASIC', 'STANDARD', 'COMPREHENSIVE', 'EXECUTIVE', 'INTERNATIONAL'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        {[['applicantId', 'Applicant ID', 'text'], ['candidateName', 'Candidate Name', 'text'], ['candidateEmail', 'Email', 'email']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.applicantId} onClick={() => initMut.mutate(form)} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Initiate</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 14 }}>
                {/* Orders list */}
                <div style={{ flex: 1, height: 600, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)', border: '1px solid #e5e7eb' }}>
                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No orders</div>
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
                    <div style={{ width: 340, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedOrder.candidate_name ?? selectedOrder.applicant_id}</div>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                            <div>Package: <strong>{selectedOrder.package_type}</strong></div>
                            <div>Consent: {fmtDate(selectedOrder.consent_signed_at)}</div>
                            <div>Ordered: {fmtDate(selectedOrder.ordered_at)}</div>
                            {selectedOrder.completed_at && <div>Completed: {fmtDate(selectedOrder.completed_at)}</div>}
                            {selectedOrder.hold_start_date && <div style={{ color: '#dc2626' }}>Hold start: {selectedOrder.hold_start_date}</div>}
                            {selectedOrder.final_decision && <div>Final decision: <strong>{selectedOrder.final_decision}</strong></div>}
                        </div>

                        {/* Components */}
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Component Results</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                            {selectedOrder.components.map(c => (
                                <div key={c.component_type} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#f9fafb', borderRadius: 6 }}>
                                    <span style={{ fontSize: 10 }}>{c.component_type}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: c.result ? (RESULT_CLR[c.result] ?? '#6b7280') : '#9ca3af' }}>{c.result ?? c.status}</span>
                                </div>
                            ))}
                        </div>

                        {/* Update component */}
                        {selectedOrder.status === 'In_Progress' && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Record Component Result</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <select value={componentForm.componentType} onChange={e => setComponentForm(p => ({ ...p, componentType: e.target.value }))} style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 10 }} aria-label="Component type">
                                        {selectedOrder.components.filter(c => !c.result).map(c => <option key={c.component_type} value={c.component_type}>{c.component_type}</option>)}
                                    </select>
                                    <select value={componentForm.result} onChange={e => setComponentForm(p => ({ ...p, result: e.target.value }))} style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 10 }} aria-label="Result">
                                        {['Clear', 'Hit', 'Unable_To_Verify'].map(r => <option key={r}>{r}</option>)}
                                    </select>
                                    <input placeholder="Details (optional)" value={componentForm.details} onChange={e => setComponentForm(p => ({ ...p, details: e.target.value }))} style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 10 }} aria-label="Details" />
                                    <button onClick={() => componentMut.mutate({ id: selectedOrder.id, ...componentForm })} style={{ padding: '4px', background: '#059669', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>Record</button>
                                </div>
                            </div>
                        )}

                        {/* Adverse action */}
                        {selectedOrder.status === 'Complete' && selectedOrder.adjudication === 'Consider' && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>Adverse Adjudication</div>
                                <button onClick={() => adverseMut.mutate(selectedOrder.id)} style={{ width: '100%', padding: '5px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <ShieldAlert size={10} /> Initiate Adverse Action
                                </button>
                            </div>
                        )}

                        {/* Final decision */}
                        {(selectedOrder.status === 'Complete' || selectedOrder.status === 'Adverse_Action') && !selectedOrder.final_decision && (
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Final Decision</div>
                                <select value={decisionForm.decision} onChange={e => setDecisionForm(p => ({ ...p, decision: e.target.value as any }))} style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 10, width: '100%', marginBottom: 4 }} aria-label="Decision">
                                    {['Proceed', 'Withdraw', 'Conditional'].map(d => <option key={d}>{d}</option>)}
                                </select>
                                <input placeholder="Notes" value={decisionForm.notes} onChange={e => setDecisionForm(p => ({ ...p, notes: e.target.value }))} style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 10, width: '100%', marginBottom: 4 }} aria-label="Notes" />
                                <button onClick={() => decisionMut.mutate({ id: selectedOrder.id, ...decisionForm })} style={{ width: '100%', padding: '5px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>Finalize</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
