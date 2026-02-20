import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayCircle, CheckCircle2, XCircle, FileText, Download, Globe, DollarSign, Users, RefreshCw } from 'lucide-react';

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
    Draft: { color: '#6b7280', bg: '#f3f4f6', label: 'Draft' },
    Processing: { color: '#d97706', bg: '#fef3c7', label: 'Processing' },
    Review: { color: '#2563eb', bg: '#dbeafe', label: 'Under Review' },
    Approved: { color: '#059669', bg: '#d1fae5', label: 'Approved' },
    Paid: { color: '#7c3aed', bg: '#ede9fe', label: 'Paid' },
    Reversed: { color: '#dc2626', bg: '#fee2e2', label: 'Reversed' },
};

const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'IN', 'AU', 'CA', 'SG'];
const fmt = (n: number, c = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);

export default function PayrollWorkbench() {
    const [countryFilter, setCountryFilter] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        payrollName: '', periodStart: '', periodEnd: '', payDate: '', countryCode: 'US', currencyCode: 'USD',
    });

    const qc = useQueryClient();

    const { data: runs = [], isLoading } = useQuery<PayrollRun[]>({
        queryKey: ['payroll-runs', countryFilter],
        queryFn: () => fetch(`/api/hr/payroll/runs${countryFilter ? `?countryCode=${countryFilter}` : ''}`).then(r => r.json()),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/hr/payroll/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
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

    return (
        <div className="pw-container">
            <div className="pw-header">
                <div>
                    <h1 className="pw-title">Global Payroll Workbench</h1>
                    <p className="pw-subtitle">Multi-country payroll processing, GL costing & statutory payment files</p>
                </div>
                <button className="create-run-btn" onClick={() => setShowCreateForm(true)} aria-label="Create payroll run">
                    + Create Run
                </button>
            </div>

            {/* KPI Strip */}
            <div className="pw-kpis">
                <PWKpi label="Employees" value={totalEmp.toLocaleString()} icon={<Users size={18} />} color="#1d4ed8" />
                <PWKpi label="Gross Payroll" value={fmt(totalGross)} icon={<DollarSign size={18} />} color="#059669" />
                <PWKpi label="Net Pay" value={fmt(totalNet)} icon={<DollarSign size={18} />} color="#7c3aed" />
                <PWKpi label="Active Runs" value={String(runs.filter(r => ['Draft', 'Processing', 'Review'].includes(r.status)).length)} icon={<RefreshCw size={18} />} color="#d97706" />
            </div>

            {/* Country filter */}
            <div className="country-filters">
                {['', ...COUNTRIES].map(c => (
                    <button
                        key={c}
                        className={`country-pill ${countryFilter === c ? 'active' : ''}`}
                        onClick={() => setCountryFilter(c)}
                    >
                        {c || 'All Countries'}
                    </button>
                ))}
            </div>

            {/* Runs Table */}
            <div className="pw-table-card">
                <table className="pw-table">
                    <thead>
                        <tr>
                            <th>Run Name</th><th>Country</th><th>Period</th><th>Pay Date</th>
                            <th>Employees</th><th>Gross</th><th>Net</th><th>Tax</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={10} className="empty-td">Loading…</td></tr>
                        ) : runs.length === 0 ? (
                            <tr><td colSpan={10} className="empty-td">No payroll runs found</td></tr>
                        ) : runs.map(run => {
                            const cfg = STATUS_CFG[run.status] ?? { color: '#6b7280', bg: '#f3f4f6', label: run.status };
                            return (
                                <tr key={run.id} className="pw-row">
                                    <td className="run-name">{run.payroll_name}</td>
                                    <td><span className="cbadge">{run.country_code}</span></td>
                                    <td className="date-cell">{run.period_start} – {run.period_end}</td>
                                    <td className="date-cell">{run.pay_date}</td>
                                    <td className="num-cell">{Number(run.employee_count).toLocaleString()}</td>
                                    <td className="amt-cell">{fmt(run.gross_total, run.currency_code)}</td>
                                    <td className="amt-cell green">{fmt(run.net_total, run.currency_code)}</td>
                                    <td className="amt-cell red">{fmt(run.tax_total, run.currency_code)}</td>
                                    <td><span className="status-pill" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                                    <td className="action-cell">
                                        {run.status === 'Draft' && (
                                            <button className="act-btn blue" onClick={() => processMutation.mutate(run.id)} aria-label="Process run">
                                                <PlayCircle size={13} /> Process
                                            </button>
                                        )}
                                        {run.status === 'Review' && (
                                            <button className="act-btn green" onClick={() => approveMutation.mutate(run.id)} aria-label="Approve run">
                                                <CheckCircle2 size={13} /> Approve
                                            </button>
                                        )}
                                        {run.status === 'Approved' && (
                                            <>
                                                <button className="act-btn purple" onClick={() => glMutation.mutate(run.id)} aria-label="Post to GL">
                                                    GL Post
                                                </button>
                                                <select
                                                    className="fmt-select"
                                                    onChange={e => e.target.value && payFileMutation.mutate({ id: run.id, format: e.target.value })}
                                                    defaultValue=""
                                                    aria-label="Generate payment file"
                                                >
                                                    <option value="" disabled>Pay File…</option>
                                                    <option value="ACH_NACHA">ACH/NACHA</option>
                                                    <option value="BACS">BACS</option>
                                                    <option value="SEPA_PAIN001">SEPA</option>
                                                    <option value="FPS">FPS</option>
                                                </select>
                                            </>
                                        )}
                                        <a href={`/api/hr/payroll/runs/${run.id}/payslips`} target="_blank" rel="noreferrer" className="act-link">
                                            <FileText size={13} /> Payslips
                                        </a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-box">
                        <h2 className="modal-title">New Payroll Run</h2>
                        {(['payrollName', 'periodStart', 'periodEnd', 'payDate'] as const).map(field => (
                            <div key={field} className="mf">
                                <label className="ml" htmlFor={`pr-${field}`}>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                                <input id={`pr-${field}`} className="mi" type={field.includes('Date') || field.includes('Start') || field.includes('End') ? 'date' : 'text'} value={createForm[field]} onChange={e => setCreateForm(p => ({ ...p, [field]: e.target.value }))} />
                            </div>
                        ))}
                        <div className="mf">
                            <label className="ml" htmlFor="pr-country">Country</label>
                            <select id="pr-country" className="mi" value={createForm.countryCode} onChange={e => setCreateForm(p => ({ ...p, countryCode: e.target.value }))}>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
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
                .pw-container { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .pw-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .pw-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .pw-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
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
            `}</style>
        </div>
    );
}

function PWKpi({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${color}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 }}>
            <div style={{ color }}>{icon}</div>
            <div>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{label}</div>
            </div>
        </div>
    );
}
