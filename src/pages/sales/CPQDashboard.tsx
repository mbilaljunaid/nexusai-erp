import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Minus } from 'lucide-react';

interface Quote { id: string; quote_number: string; customer_id: string; status: string; net_total: number; list_total: number; discount_pct: number; margin_pct: number | null; valid_until: string; currency: string; created_by: string; lines?: QuoteLine[]; }
interface QuoteLine { id: string; line_number: number; product_id: string; description: string; quantity: number; unit_price: number; discount_pct: number; net_price: number; }
interface Renewal { id: string; contract_number: string; customer_id: string; renewal_date: string; status: string; auto_renew: boolean; mrr: number; days_until_renewal: number; }
interface EVMMetric { wbs_code: string; description: string; pv: number; ev: number; ac: number; sv: number; cv: number; cpi: number; spi: number; }

const STATUS_CLR: Record<string, string> = { Draft: '#9ca3af', Pending_Approval: '#d97706', Approved: '#1d4ed8', Presented: '#7c3aed', Won: '#059669', Lost: '#dc2626', Expired: '#6b7280', Pending: '#d97706', Renewed: '#059669', Churned: '#dc2626', On_Hold: '#f59e0b' };
const ACTIONS: Record<string, { a: string; label: string; clr: string }[]> = {
    Draft: [{ a: 'SUBMIT', label: 'Submit', clr: '#1d4ed8' }],
    Pending_Approval: [{ a: 'APPROVE', label: 'Approve', clr: '#059669' }, { a: 'LOSE', label: 'Decline', clr: '#dc2626' }],
    Approved: [{ a: 'PRESENT', label: 'Mark Presented', clr: '#7c3aed' }],
    Presented: [{ a: 'WIN', label: 'Won!', clr: '#059669' }, { a: 'LOSE', label: 'Lost', clr: '#dc2626' }],
};

export default function CPQDashboard() {
    const [view, setView] = useState<'cpq' | 'renewal' | 'evm'>('cpq');
    const [selected, setSelected] = useState<Quote | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [evmBaseline, setEvmBaseline] = useState('');
    const qc = useQueryClient();

    const { data: quotes = [] } = useQuery<Quote[]>({ queryKey: ['quotes', statusFilter], queryFn: () => fetch(`/api/ext/cpq/quotes${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: renewals = [] } = useQuery<Renewal[]>({ queryKey: ['renewals'], queryFn: () => fetch('/api/ext/renewals?status=Pending').then(r => r.json()), enabled: view === 'renewal' });
    const { data: upcoming = [] } = useQuery<Renewal[]>({ queryKey: ['renewals-upcoming'], queryFn: () => fetch('/api/ext/renewals/upcoming?daysAhead=30').then(r => r.json()), enabled: view === 'renewal' });
    const { data: evmMetrics } = useQuery<{ controlAccounts: EVMMetric[]; totals: any; eac: number }>({ queryKey: ['evm', evmBaseline], enabled: !!evmBaseline, queryFn: () => fetch(`/api/ext/evm/baselines/${evmBaseline}/metrics`).then(r => r.json()) });

    const transitionMut = useMutation({ mutationFn: ({ id, action }: any) => fetch(`/api/ext/cpq/quotes/${id}/transition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, actor: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }) });
    const renewMut = useMutation({ mutationFn: (id: string) => fetch(`/api/ext/renewals/${id}/renew`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ renewedBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['renewals'] }) });

    const won = quotes.filter(q => q.status === 'Won').length;
    const lost = quotes.filter(q => q.status === 'Lost').length;
    const pending = quotes.filter(q => ['Draft', 'Pending_Approval', 'Presented'].includes(q.status)).length;
    const pipeline = quotes.filter(q => q.status !== 'Lost' && q.status !== 'Expired').reduce((s, q) => s + Number(q.net_total ?? 0), 0);

    const kpiC = (val: number, gd = 1) => val >= gd ? '#059669' : val >= gd * 0.8 ? '#d97706' : '#dc2626';

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>CPQ & Revenue Intelligence</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Configure-price-quote · Renewal management · EVM metrics</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {[['cpq', 'Quotes'], ['renewal', 'Renewals'], ['evm', 'EVM']].map(([v, lbl]) => (
                        <button key={v} onClick={() => setView(v as any)} style={{ padding: '7px 14px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer', background: view === v ? '#111827' : '#f3f4f6', color: view === v ? '#fff' : '#6b7280' }}>{lbl}</button>
                    ))}
                </div>
            </div>

            {view === 'cpq' && (
                <>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        {[{ lbl: 'Pipeline', val: `$${(pipeline / 1000).toFixed(0)}K`, clr: '#1d4ed8' }, { lbl: 'Won', val: won, clr: '#059669' }, { lbl: 'Lost', val: lost, clr: '#dc2626' }, { lbl: 'Open', val: pending, clr: '#d97706' }].map(k => (
                            <div key={k.lbl} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', minWidth: 100 }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: k.clr }}>{k.val}</div>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{k.lbl}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        {['', 'Draft', 'Pending_Approval', 'Approved', 'Presented', 'Won', 'Lost'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: statusFilter === s ? '#111827' : '#fff', color: statusFilter === s ? '#fff' : '#6b7280', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{s || 'All'}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 14 }}>
                        <div style={{ flex: 1 }}>
                            {quotes.map(q => {
                                const clr = STATUS_CLR[q.status] ?? '#6b7280';
                                const acts = ACTIONS[q.status] ?? [];
                                return (
                                    <div key={q.id} onClick={() => setSelected(selected?.id === q.id ? null : q)} style={{ background: '#fff', border: `1px solid ${selected?.id === q.id ? '#1d4ed8' : '#e5e7eb'}`, borderLeft: `4px solid ${clr}`, borderRadius: 10, padding: '10px 14px', marginBottom: 6, cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{q.quote_number} — {q.customer_id}</div>
                                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: clr + '18', color: clr }}>{q.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#6b7280', marginBottom: 4 }}>
                                            <span>List: <strong style={{ color: '#374151' }}>${Number(q.list_total).toLocaleString()}</strong></span>
                                            <span>Net: <strong style={{ color: '#059669' }}>${Number(q.net_total).toLocaleString()}</strong></span>
                                            <span>Disc: <strong>{Number(q.discount_pct)}%</strong></span>
                                            {q.valid_until && <span>Valid until: <strong>{q.valid_until}</strong></span>}
                                        </div>
                                        {acts.length > 0 && (
                                            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                                {acts.map(a => <button key={a.a} onClick={ev => { ev.stopPropagation(); transitionMut.mutate({ id: q.id, action: a.a }); }} style={{ padding: '2px 7px', background: a.clr + '12', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: a.clr, fontWeight: 700 }}>{a.label}</button>)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {quotes.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, background: '#fff', borderRadius: 10 }}>No quotes</div>}
                        </div>
                        {selected && (
                            <div style={{ width: 280, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{selected.quote_number}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 5 }}>Line Items</div>
                                {(selected.lines ?? []).map(l => (
                                    <div key={l.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 4, marginBottom: 4, fontSize: 10 }}>
                                        <div style={{ fontWeight: 600 }}>#{l.line_number} {l.product_id}</div>
                                        <div style={{ color: '#6b7280' }}>{l.description}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{l.quantity} × ${Number(l.unit_price).toFixed(2)}</span>
                                            <span style={{ fontWeight: 700, color: '#059669' }}>${Number(l.net_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                {!selected.lines?.length && <div style={{ color: '#9ca3af', fontSize: 10 }}>No lines</div>}
                            </div>
                        )}
                    </div>
                </>
            )}

            {view === 'renewal' && (
                <div>
                    {upcoming.length > 0 && (
                        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 11 }}>
                            <strong>⚠️ {upcoming.length} contract(s)</strong> renewing within 30 days
                        </div>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                        <thead><tr style={{ background: '#f9fafb' }}>
                            {['Contract', 'Customer', 'Renewal Date', 'Days', 'MRR', 'Auto-Renew', 'Status', ''].map(h => <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {renewals.map(ren => {
                                const days = Number(ren.days_until_renewal);
                                const clr = STATUS_CLR[ren.status] ?? '#6b7280';
                                return (
                                    <tr key={ren.id} style={{ borderBottom: '1px solid #f3f4f6', background: days <= 7 ? '#fefce8' : undefined }}>
                                        <td style={{ padding: '7px 10px', fontWeight: 600 }}>{ren.contract_number}</td>
                                        <td style={{ padding: '7px 10px' }}>{ren.customer_id}</td>
                                        <td style={{ padding: '7px 10px' }}>{ren.renewal_date}</td>
                                        <td style={{ padding: '7px 10px', color: days <= 7 ? '#dc2626' : days <= 14 ? '#d97706' : '#059669', fontWeight: 700 }}>{days}d</td>
                                        <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>${Number(ren.mrr ?? 0).toLocaleString()}</td>
                                        <td style={{ padding: '7px 10px' }}><span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: ren.auto_renew ? '#d1fae5' : '#f3f4f6', color: ren.auto_renew ? '#059669' : '#9ca3af' }}>{ren.auto_renew ? 'AUTO' : 'MANUAL'}</span></td>
                                        <td style={{ padding: '7px 10px' }}><span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: clr + '18', color: clr }}>{ren.status}</span></td>
                                        <td style={{ padding: '7px 10px' }}>
                                            {ren.status === 'Pending' && <button onClick={() => renewMut.mutate(ren.id)} style={{ padding: '3px 8px', background: '#059669', color: '#fff', border: 'none', borderRadius: 5, fontSize: 9, cursor: 'pointer', fontWeight: 700 }}>Renew</button>}
                                        </td>
                                    </tr>
                                );
                            })}
                            {renewals.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No pending renewals</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'evm' && (
                <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                        <input value={evmBaseline} onChange={e => setEvmBaseline(e.target.value)} placeholder="Paste Baseline ID..." style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12, width: 300 }} aria-label="Baseline ID" />
                        {evmMetrics && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[{ lbl: 'SPI', val: Number(evmMetrics.totals.ev / (evmMetrics.totals.pv || 1)).toFixed(2), gd: 1 }, { lbl: 'CPI', val: Number(evmMetrics.totals.ev / (evmMetrics.totals.ac || 1)).toFixed(2), gd: 1 }, { lbl: 'EAC', val: `$${Number(evmMetrics.eac / 1000).toFixed(0)}K`, clr: '#1d4ed8' }].map(k => (
                                    <div key={k.lbl} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px' }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: (k as any).clr ?? kpiC(Number(k.val)) }}>{k.val}</div>
                                        <div style={{ fontSize: 9, color: '#9ca3af' }}>{k.lbl}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {evmMetrics && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                            <thead><tr style={{ background: '#f9fafb' }}>
                                {['WBS', 'Description', 'PV', 'EV', 'AC', 'SV', 'CV', 'CPI', 'SPI'].map(h => <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {evmMetrics.controlAccounts.map((ca, i) => {
                                    const svClr = Number(ca.sv ?? 0) >= 0 ? '#059669' : '#dc2626';
                                    const cvClr = Number(ca.cv ?? 0) >= 0 ? '#059669' : '#dc2626';
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontSize: 10, fontWeight: 600 }}>{ca.wbs_code}</td>
                                            <td style={{ padding: '7px 10px', color: '#6b7280' }}>{ca.description ?? '—'}</td>
                                            <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>${Number(ca.pv ?? 0).toLocaleString()}</td>
                                            <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>${Number(ca.ev ?? 0).toLocaleString()}</td>
                                            <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>${Number(ca.ac ?? 0).toLocaleString()}</td>
                                            <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: svClr, fontWeight: 700 }}>{Number(ca.sv ?? 0) >= 0 ? '+' : ''}{Number(ca.sv ?? 0).toLocaleString()}</td>
                                            <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: cvClr, fontWeight: 700 }}>{Number(ca.cv ?? 0) >= 0 ? '+' : ''}{Number(ca.cv ?? 0).toLocaleString()}</td>
                                            <td style={{ padding: '7px 10px', color: kpiC(Number(ca.cpi ?? 1)), fontWeight: 700 }}>{Number(ca.cpi ?? 0).toFixed(2)}</td>
                                            <td style={{ padding: '7px 10px', color: kpiC(Number(ca.spi ?? 1)), fontWeight: 700 }}>{Number(ca.spi ?? 0).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {!evmBaseline && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, background: '#fff', borderRadius: 10 }}>Enter a Baseline ID to view EVM metrics</div>}
                </div>
            )}
        </div>
    );
}
