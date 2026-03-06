import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, ShieldOff, AlertCircle } from 'lucide-react';
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Cert { id: string; supplier_id: string; cert_type: string; cert_number: string; issuing_body: string; issue_date: string; expiry_date: string; status: string; verified_by: string; days_remaining?: number; }
interface Portfolio { cert_type: string; suppliers_with_cert: number; active: number; expired: number; earliest_expiry: string; }

const CERT_STATUS: Record<string, { className: string; color: string; icon: React.ElementType }> = {
    Active: { className: 'bg-emerald-100 text-emerald-600', color: '#059669', icon: ShieldCheck },
    Expired: { className: 'bg-red-100 text-red-600', color: '#dc2626', icon: ShieldOff },
    Pending: { className: 'bg-blue-50 text-blue-700', color: '#1d4ed8', icon: ShieldAlert },
    Revoked: { className: 'bg-amber-100 text-amber-600', color: '#d97706', icon: AlertCircle },
};

function fmtDate(d: string) { return d ? formatDate(d) : '—'; }

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
        { id: "cert_type", header: "Cert Type", width: "150px", cell: (p: any) => <span className="font-bold font-mono">{p.cert_type}</span> },
        { id: "suppliers", header: "Suppliers", width: "120px", cell: (p: any) => <span className="font-mono">{p.suppliers_with_cert}</span> },
        { id: "active", header: "Active", width: "120px", cell: (p: any) => <span className="text-emerald-600 font-semibold">{p.active}</span> },
        { id: "expired", header: "Expired", width: "120px", cell: (p: any) => <span className={p.expired > 0 ? "text-red-600" : "text-gray-500"}>{p.expired}</span> },
        { id: "earliest_expiry", header: "Earliest Expiry", width: "150px", cell: (p: any) => <span className="text-gray-500">{fmtDate(p.earliest_expiry)}</span> }
    ];

    return (
        <StandardPage title="Supplier Certifications">
            <div className="flex justify-between mb-4">
                <div>

                    <p className="text-[13px] text-gray-500 mt-1">ISO · SOC2 · GDPR · Custom — verification & expiry alerts</p>
                </div>
                <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-blue-700 text-white border-0 rounded-lg font-semibold cursor-pointer">+ Add Certificate</button>
            </div>

            {/* Expiry alert */}
            {expiring.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg py-2.5 px-3.5 mb-3.5 flex items-center gap-2">
                    <AlertCircle size={14} color="#d97706" />
                    <span className="text-[12px] text-amber-900 font-semibold">{expiring.length} cert{expiring.length !== 1 ? 's' : ''} expiring within 60 days</span>
                    <button onClick={() => setTab('expiring')} className="px-2.5 py-0.5 bg-amber-600 text-white border-0 rounded text-[11px] cursor-pointer">View all</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-3.5">
                {(['certs', 'portfolio', 'expiring'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] font-semibold cursor-pointer ${tab === t ? "bg-gray-900 text-white" : "bg-white text-gray-500"}`}>
                        {t === 'certs' ? 'All Certificates' : t === 'portfolio' ? 'Portfolio View' : `Expiring (${expiring.length})`}
                    </button>
                ))}
            </div>

            {/* Add form */}
            {showNew && (
                <Card className="p-3.5 mb-3 shadow-sm">
                    <div className="text-[13px] font-bold mb-2.5">Add Certificate</div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-[3px]">
                            <label className="text-[10px] font-semibold">Cert Type</label>
                            <Select value={form.certType} onValueChange={v => setForm(p => ({ ...p, certType: v }))}>
                                <SelectTrigger className="px-2 py-1.5 text-[11px]" aria-label="Certificate type"><SelectValue /></SelectTrigger>
                                <SelectContent>{CERT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {[['supplierId', 'Supplier ID', 'text'], ['certNumber', 'Cert Number', 'text'], ['issuingBody', 'Issuing Body', 'text'], ['issueDate', 'Issue Date', 'date'], ['expiryDate', 'Expiry Date', 'date']].map(([k, l, t]) => (
                            <div key={k} className="flex flex-col gap-[3px]">
                                <label className="text-[10px] font-semibold">{l}</label>
                                <Input type={t} value={(form as any)[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="px-2 py-1.5 border border-gray-300 rounded-md text-[11px]" aria-label={l} />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-1.5 mt-2.5">
                        <button onClick={() => setShowNew(false)} className="px-3 py-1.5 bg-gray-100 border-0 rounded-md text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={addMut.isPending || !form.supplierId} onClick={() => addMut.mutate(form)} className="px-3 py-1.5 bg-blue-700 text-white border-0 rounded-md text-[11px] font-semibold cursor-pointer">Add</button>
                    </div>
                </Card>
            )}

            {tab === 'certs' && (
                <>
                    <div className="flex gap-2 mb-2.5">
                        <Input placeholder="Filter by supplier ID" value={supplierId} onChange={e => setSupplierId(e.target.value)} className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-[12px] min-w-[200px]" aria-label="Supplier filter" />
                        {['', 'Active', 'Expired', 'Pending', 'Revoked'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 border border-gray-200 rounded-md text-[11px] font-semibold cursor-pointer ${statusFilter === s ? "bg-gray-900 text-white" : "bg-white text-gray-500"}`}>
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {certs.map(c => {
                            const cfg = CERT_STATUS[c.status] ?? { className: 'bg-gray-100 text-gray-500', color: '#6b7280', icon: ShieldCheck };
                            const Icon = cfg.icon;
                            const sel = selected?.id === c.id;
                            return (
                                <Card key={c.id} onClick={() => setSelected(sel ? null : c)} className={`p-3.5 cursor-pointer shadow-sm border-2 ${sel ? 'border-blue-700' : 'border-gray-200'}`} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Icon size={14} color={cfg.color} />
                                            <span className="text-[13px] font-extrabold font-mono">{c.cert_type}</span>
                                        </div>
                                        <span className={`px-[7px] py-[2px] rounded-md text-[9px] font-bold ${cfg.className}`}>{c.status}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-700 mb-[3px]">Supplier: <strong>{c.supplier_id}</strong></div>
                                    {c.issuing_body && <div className="text-[10px] text-gray-500 mb-[3px]">{c.issuing_body} #{c.cert_number}</div>}
                                    <div className="text-[10px] text-gray-500">
                                        {c.issue_date && `Issued: ${fmtDate(c.issue_date)}  `}
                                        {c.expiry_date && <span className={c.status === 'Active' && new Date(c.expiry_date) < new Date(Date.now() + 60 * 86400000) ? "text-amber-600" : ""}>Expires: {fmtDate(c.expiry_date)}</span>}
                                    </div>
                                    {c.verified_by && <div className="text-[10px] text-emerald-600 mt-1">✓ Verified by {c.verified_by}</div>}
                                    {sel && (
                                        <div className="mt-2 flex gap-1.5">
                                            {c.status === 'Pending' && <button onClick={e => { e.stopPropagation(); verifyMut.mutate(c.id); }} className="px-2.5 py-1 bg-emerald-600 text-white border-0 rounded-md text-[11px] font-semibold cursor-pointer">Verify</button>}
                                            {c.status === 'Active' && <button onClick={e => { e.stopPropagation(); revokeMut.mutate(c.id); }} className="px-2.5 py-1 bg-red-600 text-white border-0 rounded-md text-[11px] cursor-pointer">Revoke</button>}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                        {certs.length === 0 && <div className="col-span-full text-center text-gray-400 p-6">No certificates found</div>}
                    </div>
                </>
            )}

            {tab === 'portfolio' && (
                <Card className="overflow-hidden shadow-sm">
                    {portfolio.length > 0 ? (
                        <InteractiveSpreadsheet
                            data={portfolio}
                            columns={portfolioColumns}
                            virtualized={true}
                            containerHeight="500px"
                            onChange={() => { }}
                        />
                    ) : (
                        <div className="text-center text-gray-400 p-5">No data</div>
                    )}
                </Card>
            )}

            {tab === 'expiring' && (
                <div className="flex flex-col gap-1.5">
                    {expiring.map(c => {
                        const days = c.days_remaining ?? Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / 86400000);
                        const isOk = days > 14;
                        return (
                            <Card key={c.id} className={`py-2.5 px-3.5 flex justify-between items-center shadow-sm border-l-[4px] ${isOk ? 'border-l-amber-600' : 'border-l-red-600'}`}>
                                <div>
                                    <span className="text-[13px] font-bold font-mono">{c.cert_type}</span>
                                    <span className="ml-2 text-[11px] text-gray-500">Supplier: {c.supplier_id} · #{c.cert_number}</span>
                                </div>
                                <div className={`text-[12px] font-bold ${isOk ? 'text-amber-600' : 'text-red-600'}`}>
                                    {days <= 0 ? 'EXPIRED' : `${days} days remaining`} — Expires {fmtDate(c.expiry_date)}
                                </div>
                            </Card>
                        );
                    })}
                    {expiring.length === 0 && <div className="text-center text-gray-400 p-6">No certificates expiring within 60 days</div>}
                </div>
            )}
        </StandardPage>
    );
}
