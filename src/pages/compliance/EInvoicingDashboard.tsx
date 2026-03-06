import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle2, XCircle, Clock, Globe, Send, RefreshCw, BarChart3 } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface EInvoiceDoc {
    id: string;
    invoice_id: string;
    standard: string;
    country_code: string;
    uuid: string;
    status: 'Pending' | 'Submitted' | 'Accepted' | 'Rejected' | 'Cancelled';
    submitted_at: string | null;
    accepted_at: string | null;
    created_at: string;
}

interface StatRow { standard: string; status: string; count: number; }

const STATUS_CFG = {
    Pending: { color: '#6b7280', bg: '#f3f4f6', icon: Clock },
    Submitted: { color: '#d97706', bg: '#fef3c7', icon: RefreshCw },
    Accepted: { color: '#059669', bg: '#d1fae5', icon: CheckCircle2 },
    Rejected: { color: '#dc2626', bg: '#fee2e2', icon: XCircle },
    Cancelled: { color: '#9ca3af', bg: '#f9fafb', icon: XCircle },
} as const;

const STANDARDS = ['ZATCA', 'SDI', 'CFDI', 'GST_IRN', 'PEPPOL'] as const;
const FLAG: Record<string, string> = { SA: '🇸🇦', IT: '🇮🇹', MX: '🇲🇽', IN: '🇮🇳', EU: '🇪🇺' };

async function fetchDocs(filters: Record<string, string>) {
    const q = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/compliance/einvoices?${q}`);
    if (!res.ok) throw new Error('Failed to load');
    return res.json() as Promise<EInvoiceDoc[]>;
}
async function fetchStats(): Promise<StatRow[]> {
    const res = await fetch('/api/compliance/einvoices/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
}

export default function EInvoicingDashboard() {
    const [statusFilter, setStatusFilter] = useState('');
    const [standardFilter, setStandardFilter] = useState('');
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitForm, setSubmitForm] = useState({
        invoiceId: '', invoiceType: 'AR', standard: 'ZATCA', countryCode: 'SA',
    });

    const qc = useQueryClient();
    const { data: docs = [], isLoading } = useQuery<any>({
        queryKey: ['einvoices', statusFilter, standardFilter],
        queryFn: () => fetchDocs({ ...(statusFilter && { status: statusFilter }), ...(standardFilter && { standard: standardFilter }) }),
    });
    const { data: stats = [] } = useQuery<any>({ queryKey: ['einvoice-stats'], queryFn: fetchStats });

    const submitMutation = useMutation({
        mutationFn: (data: any) =>
            fetch('/api/compliance/einvoices/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['einvoices'] }); setShowSubmitModal(false); },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            fetch(`/api/compliance/einvoices/${id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['einvoices'] }),
    });

    // Build pivot: standard → status → count
    const pivot: Record<string, Record<string, number>> = {};
    for (const s of stats) {
        if (!pivot[s.standard]) pivot[s.standard] = {};
        pivot[s.standard][s.status] = Number(s.count);
    }
    const totalAccepted = stats.filter(s => s.status === 'Accepted').reduce((n, s) => n + Number(s.count), 0);
    const totalRejected = stats.filter(s => s.status === 'Rejected').reduce((n, s) => n + Number(s.count), 0);
    const totalPending = stats.filter(s => s.status === 'Pending').reduce((n, s) => n + Number(s.count), 0);

    const dynamicStyles = `
        ${docs.map(d => `
            .einvoice-status-${d.id} { background: ${STATUS_CFG[d.status].bg}; color: ${STATUS_CFG[d.status].color}; }
        `).join('')}
    `;

    const docColumns: SpreadsheetColumn<EInvoiceDoc>[] = [
        { id: "country", header: "Country", width: "120px", cell: (d) => <>{FLAG[d.country_code] ?? '🌐'} {d.country_code}</> },
        { id: "standard", header: "Standard", width: "120px", cell: (d) => <span className="std-badge">{d.standard}</span> },
        { id: "invoiceId", header: "Invoice ID", width: "150px", cell: (d) => <span className="mono-cell">{d.invoice_id.slice(0, 12)}…</span> },
        { id: "uuid", header: "UUID", width: "200px", cell: (d) => <span className="mono-cell">{d.uuid?.slice(0, 16)}…</span> },
        {
            id: "status", header: "Status", width: "150px", cell: (d) => {
                const cfg = STATUS_CFG[d.status];
                const Icon = cfg.icon;
                return (
                    // eslint-disable-next-line react/forbid-dom-props
                    <span className={`status-pill einvoice-status-${d.id}`}>
                        <Icon size={12} /> {d.status}
                    </span>
                );
            }
        },
        { id: "submitted", header: "Submitted", width: "120px", cell: (d) => d.submitted_at ? formatDate(d.submitted_at) : '—' },
        {
            id: "actions", header: "Actions", width: "120px", cell: (d) => ['Submitted', 'Accepted'].includes(d.status) ? (
                <button
                    className="cancel-btn"
                    onClick={() => cancelMutation.mutate({ id: d.id, reason: 'User initiated cancellation' })}
                    aria-label={`Cancel e-invoice ${d.uuid}`}
                >
                    Cancel
                </button>
            ) : null
        }
    ];

    return (
        <div className="einvoice-dashboard">
            <style>{dynamicStyles}</style>
            {/* Header */}
            <div className="einv-header">
                <div>
                    <h1 className="einv-title">E-Invoicing Compliance</h1>
                    <p className="einv-subtitle">ZATCA · SDI · CFDI · GST IRN · PEPPOL — multi-standard submission portal</p>
                </div>
                <button className="submit-btn" onClick={() => setShowSubmitModal(true)} aria-label="Submit new e-invoice">
                    <Send size={15} /> Submit Invoice
                </button>
            </div>

            {/* KPI Strip */}
            <div className="einv-kpis">
                <KPICard label="Accepted" value={totalAccepted} icon={<CheckCircle2 size={18} />} colorCls="kpi-accepted-icon" bgCls="kpi-accepted-bg" borderCls="kpi-accepted-border" textCls="kpi-accepted-text" />
                <KPICard label="Rejected" value={totalRejected} icon={<XCircle size={18} />} colorCls="kpi-rejected-icon" bgCls="kpi-rejected-bg" borderCls="kpi-rejected-border" textCls="kpi-rejected-text" />
                <KPICard label="Pending" value={totalPending} icon={<Clock size={18} />} colorCls="kpi-pending-icon" bgCls="kpi-pending-bg" borderCls="kpi-pending-border" textCls="kpi-pending-text" />
            </div>

            {/* Standard Matrix */}
            <div className="standard-matrix">
                <h2 className="section-title">Acceptance Rate by Standard</h2>
                <div className="matrix-grid">
                    {STANDARDS.map(std => {
                        const accepted = pivot[std]?.Accepted ?? 0;
                        const total = Object.values(pivot[std] ?? {}).reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round(accepted / total * 100) : 0;
                        return (
                            <div key={std} className="std-card" onClick={() => setStandardFilter(std)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStandardFilter(std); } }}>
                                <div className="std-name">{std}</div>
                                <style>{`
                                    .std-color-${Math.round(pct)} { color: ${pct >= 90 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626'}; }
                                    .std-bg-${Math.round(pct)} { background: ${pct >= 90 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626'}; width: ${pct}%; }
                                `}</style>
                                <div className={`std-pct std-color-${Math.round(pct)}`}>
                                    {pct}%
                                </div>
                                <div className="std-bar-bg">
                                    <div className={`std-bar-fill std-bg-${Math.round(pct)}`} />
                                </div>
                                <div className="std-total">{total} docs</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters + Table */}
            <div className="einv-table-card">
                <div className="table-toolbar">
                    <div className="filter-row">
                        {['', 'Pending', 'Submitted', 'Accepted', 'Rejected', 'Cancelled'].map(s => (
                            <button
                                key={s}
                                className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
                                onClick={() => setStatusFilter(s)}
                                data-active={statusFilter === s}
                            >
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                    <Select value={standardFilter} onValueChange={setStandardFilter}>
                        <SelectTrigger className="std-select">
                            <SelectValue placeholder="All Standards" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Standards</SelectItem>
                            {STANDARDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="h-[500px] w-full">
                    {isLoading ? (
                        <div className="center-cell">Loading documents…</div>
                    ) : docs.length === 0 ? (
                        <div className="center-cell">No documents found</div>
                    ) : (
                        <InteractiveSpreadsheet
                            columns={docColumns}
                            data={docs}
                            onChange={() => { }}
                            containerHeight="500px"
                        />
                    )}
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Submit e-invoice">
                    <div className="modal-box">
                        <h2 className="modal-title">Submit E-Invoice</h2>
                        {(['invoiceId', 'invoiceType', 'standard', 'countryCode'] as const).map(field => (
                            <div key={field} className="modal-field">
                                <label className="modal-label" htmlFor={`einv-${field}`}>
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <Input
                                    id={`einv-${field}`}
                                    className="modal-input"
                                    value={submitForm[field]}
                                    onChange={e => setSubmitForm(f => ({ ...f, [field]: e.target.value }))}
                                    placeholder={field === 'invoiceId' ? 'Invoice UUID' : ''}
                                />
                            </div>
                        ))}
                        <div className="modal-actions">
                            <button className="modal-cancel-btn" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                            <button
                                className="modal-submit-btn"
                                onClick={() => submitMutation.mutate({ ...submitForm })}
                                disabled={submitMutation.isPending}
                                aria-label="Confirm submit e-invoice"
                            >
                                {submitMutation.isPending ? 'Submitting…' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .einvoice-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .einv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .einv-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .einv-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .submit-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .einv-kpis { display: flex; gap: 16px; margin-bottom: 24px; }
                .kpi-accepted-bg { background: #d1fae5; }
                .kpi-accepted-border { border: 1px solid #05966930; }
                .kpi-accepted-icon, .kpi-accepted-text { color: #059669; }
                .kpi-rejected-bg { background: #fee2e2; }
                .kpi-rejected-border { border: 1px solid #dc262630; }
                .kpi-rejected-icon, .kpi-rejected-text { color: #dc2626; }
                .kpi-pending-bg { background: #fef3c7; }
                .kpi-pending-border { border: 1px solid #d9770630; }
                .kpi-pending-icon, .kpi-pending-text { color: #d97706; }
                .standard-matrix { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
                .section-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 16px; }
                .matrix-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
                .std-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; cursor: pointer; transition: all 0.2s; }
                .std-card:hover { background: #eff6ff; border-color: #bfdbfe; }
                .std-name { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; }
                .std-pct { font-size: 26px; font-weight: 800; }
                .std-bar-bg { height: 4px; background: #e5e7eb; border-radius: 2px; margin: 8px 0; }
                .std-bar-fill { height: 4px; border-radius: 2px; transition: width 0.3s; }
                .std-total { font-size: 11px; color: #9ca3af; }
                .einv-table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
                .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; gap: 12px; flex-wrap: wrap; }
                .filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
                .filter-pill { padding: 5px 12px; border: 1px solid #e5e7eb; border-radius: 9999px; font-size: 12px; font-weight: 500; background: #fff; color: #6b7280; cursor: pointer; transition: all 0.15s; }
                .filter-pill.active { background: #2563eb; color: #fff; border-color: #2563eb; }
                .std-select { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; }
                .einv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .einv-table th { padding: 10px 14px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
                .einv-row { transition: background 0.1s; }
                .einv-row:hover { background: #f9fafb; }
                .einv-table td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .std-badge { background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .mono-cell { font-family: monospace; font-size: 12px; color: #6b7280; }
                .status-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
                .cancel-btn { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
                .center-cell { text-align: center; padding: 40px; color: #9ca3af; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 420px; max-width: 90vw; }
                .modal-title { font-size: 18px; font-weight: 700; margin: 0 0 20px; color: #111827; }
                .modal-field { margin-bottom: 14px; }
                .modal-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; text-transform: capitalize; }
                .modal-input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
                .modal-cancel-btn { padding: 8px 18px; border: 1px solid #d1d5db; background: #fff; border-radius: 8px; font-size: 14px; cursor: pointer; }
                .modal-submit-btn { padding: 8px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .modal-submit-btn:disabled { background: #9ca3af; }
            `}</style>
        </div>
    );
}

function KPICard({ label, value, icon, colorCls, bgCls, borderCls, textCls }: { label: string; value: number; icon: React.ReactNode; colorCls?: string; bgCls?: string; borderCls?: string; textCls?: string; }) {
    return (
        <div className={`rounded-xl px-5 py-4 flex items-center gap-3.5 min-w-[140px] ${bgCls} ${borderCls}`}>
            <div className={colorCls}>{icon}</div>
            <div>
                <div className={`text-[26px] font-extrabold ${textCls}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
        </div>
    );
}
