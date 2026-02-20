import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, DollarSign, Activity } from 'lucide-react';

interface FundingLimit { id: string; project_id: string; funding_source: string; limit_amount: number; utilized_amount: number; available: number; utilization_pct: number; status: string; alert_threshold_pct: number; restrict_charges: boolean; }
interface Commitment { id: string; project_id: string; commitment_type: string; reference_number: string; vendor_id: string; description: string; committed_amount: number; invoiced_amount: number; remaining_amount: number; status: string; commitment_date: string; }
interface CommitSummary { commitment_type: string; count: number; total_committed: number; total_invoiced: number; total_remaining: number; }

function fmt(n: any) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
const STATUS_CLR: Record<string, string> = { Active: '#059669', Exhausted: '#dc2626', Suspended: '#d97706', Closed: '#6b7280', Open: '#1d4ed8', PartiallyInvoiced: '#d97706', FullyInvoiced: '#059669' };

export default function FundingLimits() {
    const [tab, setTab] = useState<'funding' | 'commitments'>('funding');
    const [projectId, setProjectId] = useState('');
    const [activeProject, setActiveProject] = useState('');
    const [showNewFL, setShowNewFL] = useState(false);
    const [showNewCommit, setShowNewCommit] = useState(false);
    const [flForm, setFlForm] = useState({ fundingSource: 'GRANT', limitAmount: '', alertThresholdPct: '80', restrictCharges: true });
    const [commitForm, setCommitForm] = useState({ commitmentType: 'PO', referenceNumber: '', vendorId: '', description: '', committedAmount: '', commitmentDate: '' });
    const qc = useQueryClient();

    const { data: fundingLimits = [] } = useQuery<FundingLimit[]>({ queryKey: ['fl', activeProject], enabled: !!activeProject, queryFn: () => fetch(`/api/project/funding-limits?projectId=${activeProject}`).then(r => r.json()) });
    const { data: commitments = [] } = useQuery<Commitment[]>({ queryKey: ['commits', activeProject], enabled: !!activeProject, queryFn: () => fetch(`/api/project/commitments?projectId=${activeProject}`).then(r => r.json()) });
    const { data: commitSummary = [] } = useQuery<CommitSummary[]>({ queryKey: ['commit-summary', activeProject], enabled: !!activeProject, queryFn: () => fetch(`/api/project/commitments/summary?projectId=${activeProject}`).then(r => r.json()) });

    const addFLMut = useMutation({ mutationFn: (d: any) => fetch('/api/project/funding-limits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['fl', activeProject] }); setShowNewFL(false); } });
    const addCommitMut = useMutation({ mutationFn: (d: any) => fetch('/api/project/commitments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['commits', activeProject, 'commit-summary', activeProject] }); setShowNewCommit(false); } });
    const closeCommitMut = useMutation({ mutationFn: (id: string) => fetch(`/api/project/commitments/${id}/close`, { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['commits', activeProject] }) });

    return (
        <div style={{ padding: 24, maxWidth: 1300, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Funding Limits &amp; Commitment Tracking</h1>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Funding source limits · PO &amp; subcontract commitments · Spending controls</p>
            </div>

            {/* Project selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input placeholder="Enter Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 12, minWidth: 220 }} aria-label="Project ID" />
                <button disabled={!projectId} onClick={() => setActiveProject(projectId)} style={{ padding: '7px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Load</button>
            </div>

            {activeProject && (
                <>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                        {(['funding', 'commitments'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: tab === t ? '#111827' : '#fff', color: tab === t ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'funding' ? `Funding Limits (${fundingLimits.length})` : `Commitments (${commitments.length})`}</button>
                        ))}
                        <button onClick={() => tab === 'funding' ? setShowNewFL(true) : setShowNewCommit(true)} style={{ marginLeft: 'auto', padding: '7px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
                    </div>

                    {/* Funding Limits */}
                    {tab === 'funding' && (
                        <>
                            {showNewFL && (
                                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Add Funding Limit</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <label style={{ fontSize: 10, fontWeight: 600 }}>Source</label>
                                            <select value={flForm.fundingSource} onChange={e => setFlForm(p => ({ ...p, fundingSource: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Funding source">
                                                {['GRANT', 'CONTRACT', 'INTERNAL', 'LOAN', 'EQUITY'].map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        {[['limitAmount', 'Limit Amount', 'number'], ['alertThresholdPct', 'Alert at %', 'number']].map(([k, l, t]) => (
                                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                                <input type={t} value={(flForm as any)[k]} onChange={e => setFlForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 14 }}>
                                            <input type="checkbox" id="restrict_charges" checked={flForm.restrictCharges} onChange={e => setFlForm(p => ({ ...p, restrictCharges: e.target.checked }))} />
                                            <label htmlFor="restrict_charges" style={{ fontSize: 11 }}>Block charges when exceeded</label>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                                        <button onClick={() => setShowNewFL(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                        <button disabled={!flForm.limitAmount} onClick={() => addFLMut.mutate({ ...flForm, projectId: activeProject })} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Add</button>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {fundingLimits.map(fl => {
                                    const pct = Math.min(100, Number(fl.utilization_pct));
                                    return (
                                        <div key={fl.id} style={{ background: '#fff', border: `1px solid ${fl.status === 'Exhausted' ? '#fca5a5' : '#e5e7eb'}`, borderLeft: `4px solid ${STATUS_CLR[fl.status] ?? '#6b7280'}`, borderRadius: 10, padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <div style={{ fontWeight: 700, fontSize: 13 }}>{fl.funding_source} <span style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: 12, fontWeight: 400 }}>(Limit: {fmt(fl.limit_amount)})</span></div>
                                                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: STATUS_CLR[fl.status] + '20', color: STATUS_CLR[fl.status] ?? '#6b7280', fontWeight: 700 }}>{fl.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                                                <span>Utilized: <strong>{fmt(fl.utilized_amount)}</strong></span>
                                                <span>Available: <strong style={{ color: '#059669' }}>{fmt(fl.available)}</strong></span>
                                                <span>Alert at: {fl.alert_threshold_pct}%</span>
                                                {fl.restrict_charges && <span style={{ color: '#d97706', fontWeight: 600 }}>⚑ Charges blocked at 100%</span>}
                                            </div>
                                            <div style={{ background: '#f3f4f6', borderRadius: 999, height: 8 }}>
                                                <div style={{ width: pct + '%', background: pct >= 100 ? '#dc2626' : pct >= fl.alert_threshold_pct ? '#d97706' : '#059669', height: '100%', borderRadius: 999, transition: 'width .3s' }} />
                                            </div>
                                            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{pct.toFixed(1)}% utilized</div>
                                        </div>
                                    );
                                })}
                                {fundingLimits.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No funding limits defined</div>}
                            </div>
                        </>
                    )}

                    {/* Commitments */}
                    {tab === 'commitments' && (
                        <>
                            {/* Summary by type */}
                            {commitSummary.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                    {commitSummary.map(s => (
                                        <div key={s.commitment_type} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', flex: 1 }}>
                                            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{s.commitment_type}</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'monospace' }}>{fmt(s.total_committed)}</div>
                                            <div style={{ fontSize: 10, color: '#059669' }}>Remaining: {fmt(s.total_remaining)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showNewCommit && (
                                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Add Commitment</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <label style={{ fontSize: 10, fontWeight: 600 }}>Type</label>
                                            <select value={commitForm.commitmentType} onChange={e => setCommitForm(p => ({ ...p, commitmentType: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Commitment type">
                                                {['PO', 'CONTRACT', 'SUBCONTRACT', 'PRELIM_ESTIMATE'].map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        {[['referenceNumber', 'Reference #', 'text'], ['vendorId', 'Vendor ID', 'text'], ['committedAmount', 'Amount', 'number'], ['description', 'Description', 'text'], ['commitmentDate', 'Date', 'date']].map(([k, l, t]) => (
                                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                                <input type={t} value={(commitForm as any)[k]} onChange={e => setCommitForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                                        <button onClick={() => setShowNewCommit(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                        <button disabled={!commitForm.committedAmount} onClick={() => addCommitMut.mutate({ ...commitForm, projectId: activeProject })} style={{ padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Add</button>
                                    </div>
                                </div>
                            )}

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                                <thead><tr style={{ background: '#f9fafb' }}>
                                    {['Type', 'Reference', 'Vendor', 'Committed', 'Invoiced', 'Remaining', 'Status', ''].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {commitments.map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '9px 12px', fontWeight: 700, fontSize: 10, fontFamily: 'monospace' }}>{c.commitment_type}</td>
                                            <td style={{ padding: '9px 12px', color: '#6b7280' }}>{c.reference_number ?? '—'}</td>
                                            <td style={{ padding: '9px 12px' }}>{c.vendor_id ?? '—'}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{fmt(c.committed_amount)}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{fmt(c.invoiced_amount)}</td>
                                            <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#059669', fontWeight: 700 }}>{fmt(c.remaining_amount)}</td>
                                            <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: (STATUS_CLR[c.status] ?? '#6b7280') + '18', color: STATUS_CLR[c.status] ?? '#6b7280' }}>{c.status}</span></td>
                                            <td style={{ padding: '9px 12px' }}>
                                                {c.status !== 'Closed' && c.status !== 'Cancelled' && <button onClick={() => closeCommitMut.mutate(c.id)} style={{ padding: '3px 8px', background: '#f3f4f6', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>Close</button>}
                                            </td>
                                        </tr>
                                    ))}
                                    {commitments.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No commitments</td></tr>}
                                </tbody>
                            </table>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
