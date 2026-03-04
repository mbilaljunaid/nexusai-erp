import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, ShieldOff, AlertCircle } from 'lucide-react';
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface Cert { id: string; supplier_id: string; cert_type: string; cert_number: string; issuing_body: string; issue_date: string; expiry_date: string; status: string; verified_by: string; days_remaining?: number; }
interface Portfolio { cert_type: string; suppliers_with_cert: number; active: number; expired: number; earliest_expiry: string; }

const CERT_STATUS: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
    Active: { bg: '#d1fae5', color: '#059669', icon: ShieldCheck },
    Expired: { bg: '#fee2e2', color: '#dc2626', icon: ShieldOff },
    Pending: { bg: '#eff6ff', color: '#1d4ed8', icon: ShieldAlert },
    Revoked: { bg: '#fef3c7', color: '#d97706', icon: AlertCircle },
};

function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

const CERT_TYPES = ['ISO9001', 'ISO14001', 'ISO45001', 'ISO27001', 'SOC2', 'GDPR', 'SMETA', 'FSSC22000', 'REACH', 'ROHS', 'CUSTOM'];

export default function CertificationStatus() {
    const [tab, setTab] = useState<'certs' | 'portfolio' | 'expiring'>('certs');
    const [statusFilter, setStatusFilter] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [selected, setSelected] = useState<Cert | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ supplierId: '', certType: 'ISO9001', certNumber: '', issuingBody: '', issueDate: '', expiryDate: '', alertDaysBefore: 30 });
    const qc = useQueryClient();

    const { data: certs = [] } = useQuery<Cert[]>({ queryKey: ['certs', statusFilter, supplierId], queryFn: () => fetch(`/api/supplier/certifications${statusFilter || supplierId ? `?${new URLSearchParams(Object.fromEntries(Object.entries({ status: statusFilter, supplierId }).filter(([, v]) => v)))}` : ''}`).then(r => r.json()) });
    const { data: portfolio = [] } = useQuery<Portfolio[]>({ queryKey: ['cert-portfolio'], queryFn: () => fetch('/api/supplier/certifications/portfolio').then(r => r.json()) });
    const { data: expiring = [] } = useQuery<Cert[]>({ queryKey: ['cert-expiring'], queryFn: () => fetch('/api/supplier/certifications/expiring?days=60').then(r => r.json()) });

    const addMut = useMutation({
        mutationFn: (d: any) => fetch('/api/supplier/certifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['certs', 'cert-portfolio', 'cert-expiring'] }); setShowNew(false); },
    });

    const verifyMut = useMutation({
        mutationFn: (id: string) => fetch(`/api/supplier/certifications/${id}/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verifiedBy: 'current-user' }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['certs'] }); setSelected(null); },
    });

    const revokeMut = useMutation({
        mutationFn: (id: string) => fetch(`/api/supplier/certifications/${id}/revoke`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['certs', 'cert-portfolio'] }); setSelected(null); },
    });

    const portfolioColumns: SpreadsheetColumn<any>[] = [
        { id: "cert_type", header: "Cert Type", width: "150px", cell: (p: any) => <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{p.cert_type}</span> },
        { id: "suppliers", header: "Suppliers", width: "120px", cell: (p: any) => <span style={{ fontFamily: 'monospace' }}>{p.suppliers_with_cert}</span> },
        { id: "active", header: "Active", width: "120px", cell: (p: any) => <span style={{ color: '#059669', fontWeight: 600 }}>{p.active}</span> },
        { id: "expired", header: "Expired", width: "120px", cell: (p: any) => <span style={{ color: p.expired > 0 ? '#dc2626' : '#6b7280' }}>{p.expired}</span> },
        { id: "earliest_expiry", header: "Earliest Expiry", width: "150px", cell: (p: any) => <span style={{ color: '#6b7280' }}>{fmtDate(p.earliest_expiry)}</span> }
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Supplier Certifications</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>ISO · SOC2 · GDPR · Custom — verification & expiry alerts</p>
                </div>
                <button onClick={() => setShowNew(true)} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>+ Add Certificate</button>
            </div>

            {/* Expiry alert */}
            {expiring.length > 0 && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={14} color="#d97706" />
                    <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>{expiring.length} cert{expiring.length !== 1 ? 's' : ''} expiring within 60 days</span>
                    <button onClick={() => setTab('expiring')} style={{ padding: '2px 10px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>View all</button>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {(['certs', 'portfolio', 'expiring'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: tab === t ? '#111827' : '#fff', color: tab === t ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {t === 'certs' ? 'All Certificates' : t === 'portfolio' ? 'Portfolio View' : `Expiring (${expiring.length})`}
                    </button>
                ))}
            </div>

            {/* Add form */}
            {showNew && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Add Certificate</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 600 }}>Cert Type</label>
                            <select value={form.certType} onChange={e => setForm(p => ({ ...p, certType: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Certificate type">
                                {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        {[['supplierId', 'Supplier ID', 'text'], ['certNumber', 'Cert Number', 'text'], ['issuingBody', 'Issuing Body', 'text'], ['issueDate', 'Issue Date', 'date'], ['expiryDate', 'Expiry Date', 'date']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                <input type={t} value={(form as any)[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10 }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={addMut.isPending || !form.supplierId} onClick={() => addMut.mutate(form)} style={{ padding: '6px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Add</button>
                    </div>
                </div>
            )}

            {tab === 'certs' && (
                <>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <input placeholder="Filter by supplier ID" value={supplierId} onChange={e => setSupplierId(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 12, minWidth: 200 }} aria-label="Supplier filter" />
                        {['', 'Active', 'Expired', 'Pending', 'Revoked'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 7, background: statusFilter === s ? '#111827' : '#fff', color: statusFilter === s ? '#fff' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                        {certs.map(c => {
                            const cfg = CERT_STATUS[c.status] ?? { bg: '#f3f4f6', color: '#6b7280', icon: ShieldCheck };
                            const Icon = cfg.icon;
                            const sel = selected?.id === c.id;
                            return (
                                <div key={c.id} onClick={() => setSelected(sel ? null : c)} style={{ background: '#fff', border: `2px solid ${sel ? '#1d4ed8' : '#e5e7eb'}`, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Icon size={14} color={cfg.color} />
                                            <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>{c.cert_type}</span>
                                        </div>
                                        <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{c.status}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#374151', marginBottom: 3 }}>Supplier: <strong>{c.supplier_id}</strong></div>
                                    {c.issuing_body && <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>{c.issuing_body} #{c.cert_number}</div>}
                                    <div style={{ fontSize: 10, color: '#6b7280' }}>
                                        {c.issue_date && `Issued: ${fmtDate(c.issue_date)}  `}
                                        {c.expiry_date && <span style={{ color: c.status === 'Active' && new Date(c.expiry_date) < new Date(Date.now() + 60 * 86400000) ? '#d97706' : undefined }}>Expires: {fmtDate(c.expiry_date)}</span>}
                                    </div>
                                    {c.verified_by && <div style={{ fontSize: 10, color: '#059669', marginTop: 4 }}>✓ Verified by {c.verified_by}</div>}
                                    {sel && (
                                        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                                            {c.status === 'Pending' && <button onClick={e => { e.stopPropagation(); verifyMut.mutate(c.id); }} style={{ padding: '4px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Verify</button>}
                                            {c.status === 'Active' && <button onClick={e => { e.stopPropagation(); revokeMut.mutate(c.id); }} style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>Revoke</button>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {certs.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', padding: 24 }}>No certificates found</div>}
                    </div>
                </>
            )}

            {tab === 'portfolio' && (
                <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)', border: '1px solid #e5e7eb' }}>
                    {portfolio.length > 0 ? (
                        <InteractiveSpreadsheet
                            data={portfolio}
                            columns={portfolioColumns}
                            virtualized={true}
                            containerHeight="500px"
                            onChange={() => { }}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No data</div>
                    )}
                </div>
            )}

            {tab === 'expiring' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {expiring.map(c => {
                        const days = c.days_remaining ?? Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / 86400000);
                        return (
                            <div key={c.id} style={{ background: '#fff', border: `1px solid ${days <= 14 ? '#fca5a5' : '#fcd34d'}`, borderLeft: `4px solid ${days <= 14 ? '#dc2626' : '#d97706'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{c.cert_type}</span>
                                    <span style={{ marginLeft: 8, fontSize: 11, color: '#6b7280' }}>Supplier: {c.supplier_id} · #{c.cert_number}</span>
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: days <= 14 ? '#dc2626' : '#d97706' }}>
                                    {days <= 0 ? 'EXPIRED' : `${days} days remaining`} — Expires {fmtDate(c.expiry_date)}
                                </div>
                            </div>
                        );
                    })}
                    {expiring.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No certificates expiring within 60 days</div>}
                </div>
            )}
        </div>
    );
}
