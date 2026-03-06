import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayCircle, CheckCircle2, XCircle, FileText, Download, Globe, DollarSign, Users, RefreshCw } from 'lucide-react';
import { EnterpriseContextSwitcher, buildScopeHeaders } from '@/components/enterprise/EnterpriseContextSwitcher';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
interface PayrollRun {
    id: string;
    payroll_name: string;
    period_start: string;
    period_end: string;
    pay_date: string;
    country_code: string;
    currency_code: string;
    status: string;
    employee_count: number;
    gross_total: number;
    net_total: number;
    tax_total: number;
    employer_ni: number;
}

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
    Draft: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Draft' },
    Processing: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Processing' },
    Review: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Under Review' },
    Approved: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Approved' },
    Paid: { color: 'text-violet-600', bg: 'bg-violet-100', label: 'Paid' },
    Reversed: { color: 'text-red-600', bg: 'bg-red-100', label: 'Reversed' },
};

const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'IN', 'AU', 'CA', 'SG'];
const fmt = (n: number, c = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);

export default function PayrollWorkbench() {
    const [countryFilter, setCountryFilter] = useState('');
    const [leId, setLeId] = useState<string | undefined>();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        payrollName: '', periodStart: '', periodEnd: '', payDate: '', countryCode: 'US', currencyCode: 'USD',
    });

    const scopeHeaders = buildScopeHeaders({ 'legal-entity': leId });
    const leHeader = leId ? { 'x-legal-entity-id': leId } : {};

    const qc = useQueryClient();

    const { data: runs = [], isLoading } = useQuery<PayrollRun[]>({
        queryKey: ['payroll-runs', countryFilter, leId],
        queryFn: () => fetch(
            `/api/hr/payroll/runs${countryFilter ? `?countryCode=${countryFilter}` : ''}`,
            { headers: { ...scopeHeaders } }
        ).then(r => r.json()),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/hr/payroll/runs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...leHeader },
            body: JSON.stringify({ ...data, entLegalEntityId: leId })
        }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); setShowCreateForm(false); },
    });

    const processMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/hr/payroll/runs/${id}/process`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-runs'] }),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/hr/payroll/runs/${id}/approve`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-runs'] }),
    });

    const glMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/hr/payroll/runs/${id}/post-gl`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll-runs'] }),
    });

    const payFileMutation = useMutation({
        mutationFn: ({ id, format }: { id: string; format: string }) =>
            fetch('/api/hr/payroll/payment-files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: id, format }) }).then(r => r.json()),
    });

    const totalGross = runs.reduce((s, r) => s + Number(r.gross_total ?? 0), 0);
    const totalNet = runs.reduce((s, r) => s + Number(r.net_total ?? 0), 0);
    const totalEmp = runs.reduce((s, r) => s + Number(r.employee_count ?? 0), 0);

    const runColumns: SpreadsheetColumn<any>[] = [
        { id: "payroll_name", header: "Run Name", width: "200px", cell: (row) => <span className="run-name">{row.payroll_name}</span> },
        { id: "country_code", header: "Country", width: "100px", cell: (row) => <span className="cbadge">{row.country_code}</span> },
        { id: "period", header: "Period", width: "200px", cell: (row) => <span className="date-cell">{row.period_start} – {row.period_end}</span> },
        { id: "pay_date", header: "Pay Date", width: "120px", cell: (row) => <span className="date-cell">{row.pay_date}</span> },
        { id: "employee_count", header: "Employees", width: "100px", cell: (row) => <div className="num-cell w-full">{Number(row.employee_count).toLocaleString()}</div> },
        { id: "gross_total", header: "Gross", width: "120px", cell: (row) => <div className="amt-cell w-full">{fmt(row.gross_total, row.currency_code)}</div> },
        { id: "net_total", header: "Net", width: "120px", cell: (row) => <div className="amt-cell green w-full">{fmt(row.net_total, row.currency_code)}</div> },
        { id: "tax_total", header: "Tax", width: "120px", cell: (row) => <div className="amt-cell red w-full">{fmt(row.tax_total, row.currency_code)}</div> },
        {
            id: "status", header: "Status", width: "120px", cell: (row) => {
                const cfg = STATUS_CFG[row.status] ?? { color: 'text-gray-500', bg: 'bg-gray-100', label: row.status };
                return <span className={cn(`status-pill ${cfg.bg} ${cfg.color}`)}>{cfg.label}</span>;
            }
        },
        {
            id: "actions", header: "Actions", width: "300px", cell: (row) => (
                <div className="action-cell">
                    {row.status === 'Draft' && (
                        <button className="act-btn blue" onClick={() => processMutation.mutate(row.id)} aria-label="Process run">
                            <PlayCircle size={13} /> Process
                        </button>
                    )}
                    {row.status === 'Review' && (
                        <button className="act-btn green" onClick={() => approveMutation.mutate(row.id)} aria-label="Approve run">
                            <CheckCircle2 size={13} /> Approve
                        </button>
                    )}
                    {row.status === 'Approved' && (
                        <>
                            <button className="act-btn purple" onClick={() => glMutation.mutate(row.id)} aria-label="Post to GL">
                                GL Post
                            </button>
                            <Select onValueChange={v => v && payFileMutation.mutate({ id: row.id, format: v })}>
                                <SelectTrigger className="fmt-select" aria-label="Generate payment file"><SelectValue placeholder="Pay File…" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACH_NACHA">ACH/NACHA</SelectItem>
                                    <SelectItem value="BACS">BACS</SelectItem>
                                    <SelectItem value="SEPA_PAIN001">SEPA</SelectItem>
                                    <SelectItem value="FPS">FPS</SelectItem>
                                </SelectContent>
                            </Select>
                        </>
                    )}
                    <a href={`/api/hr/payroll/runs/${row.id}/payslips`} target="_blank" rel="noreferrer" className="act-link">
                        <FileText size={13} /> Payslips
                    </a>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Global Payroll Workbench"
            description="Multi-country payroll processing, GL costing & statutory payment files"
            actions={
                <button className="create-run-btn" onClick={() => setShowCreateForm(true)} aria-label="Create payroll run">
                    + Create Run
                </button>
            }
        >

            {/* KPI Strip */}
            <div className="pw-kpis">
                <PWKpi label="Employees" value={totalEmp.toLocaleString()} icon={<Users size={18} />} colorClass="text-blue-700" borderClass="border-l-blue-700" />
                <PWKpi label="Gross Payroll" value={fmt(totalGross)} icon={<DollarSign size={18} />} colorClass="text-emerald-600" borderClass="border-l-emerald-600" />
                <PWKpi label="Net Pay" value={fmt(totalNet)} icon={<DollarSign size={18} />} colorClass="text-violet-600" borderClass="border-l-violet-600" />
                <PWKpi label="Active Runs" value={String(runs.filter(r => ['Draft', 'Processing', 'Review'].includes(r.status)).length)} icon={<RefreshCw size={18} />} colorClass="text-amber-600" borderClass="border-l-amber-600" />
            </div>

            {/* Country filter */}
            <div className="country-filters">
                {['', ...COUNTRIES].map(c => (
                    <button
                        key={c}
                        className={cn(`country-pill ${countryFilter === c ? 'active' : ''}`)}
                        onClick={() => setCountryFilter(c)}
                    >
                        {c || 'All Countries'}
                    </button>
                ))}
            </div>

            {/* Runs Table */}
            <div className="pw-table-card">
                {isLoading ? (
                    <div className="empty-td p-8 text-center text-zinc-500">Loading…</div>
                ) : (
                    <div className="min-h-72 h-full">
                        <InteractiveSpreadsheet
                            columns={runColumns}
                            data={runs}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                        {runs.length === 0 && <div className="empty-td p-8 text-center text-zinc-500 border-t border-zinc-200">No payroll runs found</div>}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-box">
                        <h2 className="modal-title">New Payroll Run</h2>
                        {(['payrollName', 'periodStart', 'periodEnd', 'payDate'] as const).map(field => (
                            <div key={field} className="mf">
                                <label className="ml" htmlFor={`pr-${field}`}>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                                <Input id={`pr-${field}`} className="h-9 px-2.5 text-[13px]" type={field.includes('Date') || field.includes('Start') || field.includes('End') ? 'date' : 'text'} value={createForm[field] as string} onChange={e => setCreateForm(p => ({ ...p, [field]: e.target.value }))} />
                            </div>
                        ))}
                        <div className="mf">
                            <label className="ml" htmlFor="pr-country">Country</label>
                            <Select value={createForm.countryCode} onValueChange={v => setCreateForm(p => ({ ...p, countryCode: v }))}>
                                <SelectTrigger id="pr-country" className="mi" aria-label="Country"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="modal-actions">
                            <button className="mcancel" onClick={() => setShowCreateForm(false)}>Cancel</button>
                            <button className="msubmit" onClick={() => createMutation.mutate(createForm)} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating…' : 'Create Run'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .pw-container { font-family: 'Inter', sans-serif; }
                .create-run-btn { padding: 10px 20px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .pw-kpis { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                .country-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
                .country-pill { padding: 5px 12px; border: 1px solid #e5e7eb; border-radius: 9999px; font-size: 12px; font-weight: 500; background: #fff; color: #6b7280; cursor: pointer; }
                .country-pill.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
                .pw-table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: auto; }
                .pw-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .pw-table th { padding: 10px 14px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
                .pw-row:hover { background: #f9fafb; }
                .pw-table td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .run-name { font-weight: 600; color: #111827; }
                .cbadge { background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
                .date-cell { font-family: monospace; font-size: 12px; color: #6b7280; }
                .num-cell { text-align: right; }
                .amt-cell { text-align: right; font-family: monospace; font-size: 12px; }
                .amt-cell.green { color: #059669; }
                .amt-cell.red { color: #dc2626; }
                .status-pill { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
                .action-cell { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
                .act-btn { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
                .act-btn.blue { background: #dbeafe; color: #1d4ed8; }
                .act-btn.green { background: #d1fae5; color: #059669; }
                .act-btn.purple { background: #ede9fe; color: #7c3aed; }
                .act-link { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #6b7280; text-decoration: none; }
                .fmt-select { padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 11px; }
                .empty-td { text-align: center; padding: 40px; color: #9ca3af; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 400px; max-width: 90vw; }
                .modal-title { font-size: 18px; font-weight: 700; margin: 0 0 20px; }
                .mf { margin-bottom: 12px; }
                .ml { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; text-transform: capitalize; }
                .mi { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
                .mcancel { padding: 8px 16px; border: 1px solid #d1d5db; background: #fff; border-radius: 8px; cursor: pointer; }
                .msubmit { padding: 8px 20px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .msubmit:disabled { background: #9ca3af; }
                .pw-kpi-card { background: #fff; border: 1px solid #e5e7eb; border-left-width: 4px; border-left-style: solid; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; min-width: 160px; }
                .pw-kpi-val { font-size: 20px; font-weight: 800; }
                .pw-kpi-lbl { font-size: 11px; color: #6b7280; margin-top: 2px; }
            `}</style>
        </StandardPage>
    );
}

function PWKpi({ label, value, icon, colorClass, borderClass }: { label: string; value: string; icon: React.ReactNode; colorClass: string; borderClass: string }) {
    return (
        <div className={cn(`pw-kpi-card ${borderClass}`)}>
            <div className={colorClass}>{icon}</div>
            <div>
                <div className={cn(`pw-kpi-val ${colorClass}`)}>{value}</div>
                <div className="pw-kpi-lbl">{label}</div>
            </div>
        </div>
    );
}
