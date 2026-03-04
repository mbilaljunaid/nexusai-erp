import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertTriangle, XCircle, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface Certification {
    id: string;
    account_id: string;
    period_name: string;
    status: 'Pending' | 'In-Review' | 'Certified' | 'Escalated' | 'Rejected';
    balance_per_gl: number;
    balance_per_sub: number;
    variance: number;
    preparer_email: string;
    reviewer_email: string;
    certified_at: string | null;
    escalation_reason: string | null;
}

interface Summary { status: string; count: number; total_variance: number; }

const STATUS_CONFIG = {
    'Pending': { color: '#6b7280', bg: '#f3f4f6', icon: Clock },
    'In-Review': { color: '#d97706', bg: '#fef3c7', icon: Clock },
    'Certified': { color: '#059669', bg: '#d1fae5', icon: CheckCircle },
    'Escalated': { color: '#dc2626', bg: '#fee2e2', icon: AlertTriangle },
    'Rejected': { color: '#7c3aed', bg: '#ede9fe', icon: XCircle },
} as const;

async function fetchCerts(period: string): Promise<Certification[]> {
    const res = await fetch(`/api/finance/account-certs?period=${period}`);
    if (!res.ok) throw new Error('Failed to load certifications');
    return res.json();
}

async function fetchSummary(period: string): Promise<Summary[]> {
    const res = await fetch(`/api/finance/account-certs/summary?period=${period}`);
    if (!res.ok) throw new Error('Failed to load summary');
    return res.json();
}

export default function AccountCertPortal() {
    const [period, setPeriod] = useState(() => {
        const now = new Date();
        const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
        return `${mon}-${now.getFullYear()}`;
    });
    const [sortField, setSortField] = useState<'variance' | 'status'>('variance');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [actionTarget, setActionTarget] = useState<string | null>(null);

    const qc = useQueryClient();
    const { data: certs = [], isLoading } = useQuery({
        queryKey: ['account-certs', period],
        queryFn: () => fetchCerts(period),
    });
    const { data: summary = [] } = useQuery({
        queryKey: ['account-certs-summary', period],
        queryFn: () => fetchSummary(period),
    });

    const certifyMutation = useMutation({
        mutationFn: (certId: string) =>
            fetch(`/api/finance/account-certs/${certId}/certify`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['account-certs'] }),
    });

    const sorted = [...certs].sort((a, b) => {
        const v = sortField === 'variance'
            ? Math.abs(b.variance) - Math.abs(a.variance)
            : a.status.localeCompare(b.status);
        return sortDir === 'desc' ? v : -v;
    });

    const certifiedPct = certs.length ? Math.round(certs.filter(c => c.status === 'Certified').length / certs.length * 100) : 0;

    const certColumns: SpreadsheetColumn<Certification>[] = [
        { id: "account_id", header: "Account", width: "120px", cell: (row) => <div className="account-code">{row.account_id}</div> },
        { id: "status", header: "Status", width: "150px", cell: (row) => { const cfg = STATUS_CONFIG[row.status]; const Icon = cfg.icon; return <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}><Icon size={12} /> {row.status}</span>; } },
        { id: "variance", header: <div className="sortable-col" onClick={() => { setSortField('variance'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Variance{sortField === 'variance' && (sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}</div>, width: "120px", cell: (row) => <div className={`variance-cell ${Math.abs(row.variance) > 1000 ? 'high-variance' : ''}`}>{row.variance >= 0 ? '+' : ''}{row.variance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div> },
        { id: "gl_balance", header: "GL Balance", width: "120px", cell: (row) => row.balance_per_gl.toLocaleString('en-US', { minimumFractionDigits: 2 }) },
        { id: "sub_balance", header: "Sub Balance", width: "120px", cell: (row) => row.balance_per_sub.toLocaleString('en-US', { minimumFractionDigits: 2 }) },
        { id: "preparer", header: "Preparer", width: "150px", cell: (row) => <div className="email-cell">{row.preparer_email}</div> },
        { id: "reviewer", header: "Reviewer", width: "150px", cell: (row) => <div className="email-cell">{row.reviewer_email}</div> },
        { id: "actions", header: "Actions", width: "120px", cell: (row) => <div className="actions-cell">{row.status === 'In-Review' && <button className="btn-certify" onClick={() => certifyMutation.mutate(row.id)} disabled={certifyMutation.isPending} aria-label={`Certify account ${row.account_id}`}>Certify</button>}{row.escalation_reason && <span className="escalation-tooltip" title={row.escalation_reason}><AlertTriangle size={14} color="#dc2626" /></span>}</div> }
    ];

    return (
        <StandardPage
            title="Account Reconciliation Certification"
            description="SOX sign-off portal — preparer → reviewer → certified"
            actions={
                <select
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                    className="period-select"
                    aria-label="Select period"
                >
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                        <option key={m} value={`${m}-2026`}>{m}-2026</option>
                    ))}
                </select>
            }
        >
            <div className="account-cert-portal">

                {/* Summary KPIs */}
                <div className="cert-kpis">
                    <div className="kpi-card">
                        <div className="kpi-value">{certifiedPct}%</div>
                        <div className="kpi-label">Certified</div>
                        <div className="kpi-progress">
                            <div className="kpi-bar" style={{ width: `${certifiedPct}%` }} />
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-value">{certs.length}</div>
                        <div className="kpi-label">Total Accounts</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-value kpi-red">
                            ${totalVariance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="kpi-label">Total Variance</div>
                    </div>
                    {summary.map(s => {
                        const cfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG];
                        const Icon = cfg?.icon ?? Clock;
                        return (
                            <div key={s.status} className="kpi-status-card" style={{ borderColor: cfg?.color }}>
                                <Icon size={18} color={cfg?.color} />
                                <div className="kpi-status-count" style={{ color: cfg?.color }}>{s.count}</div>
                                <div className="kpi-status-label">{s.status}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Table */}
                <div style={{ height: 600, marginTop: 20 }}>
                    <InteractiveSpreadsheet
                        columns={certColumns}
                        data={sorted}
                        onChange={() => { }}
                        containerHeight="100%"
                    />
                </div>

                <style>{`
                .account-cert-portal { max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .period-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #fff; }
                .cert-kpis { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                .kpi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 20px; min-width: 140px; }
                .kpi-value { font-size: 28px; font-weight: 800; color: #111827; }
                .kpi-value.kpi-red { color: #dc2626; }
                .kpi-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
                .kpi-progress { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 8px; }
                .kpi-bar { height: 4px; background: #059669; border-radius: 2px; transition: width 0.3s; }
                .kpi-status-card { display: flex; flex-direction: column; align-items: center; gap: 4px; background: #fff; border: 2px solid; border-radius: 12px; padding: 12px 16px; min-width: 80px; }
                .kpi-status-count { font-size: 22px; font-weight: 700; }
                .kpi-status-label { font-size: 11px; color: #6b7280; }
                .cert-table-wrapper { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: auto; }
                .cert-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .cert-table thead { background: #f9fafb; }
                .cert-table th { padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
                .sortable-col { cursor: pointer; user-select: none; display: flex; align-items: center; gap: 4px; }
                .cert-row:hover { background: #f9fafb; }
                .cert-table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .account-code { font-family: monospace; font-weight: 600; color: #1d4ed8; }
                .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
                .variance-cell { font-family: monospace; }
                .high-variance { color: #dc2626; font-weight: 700; }
                .email-cell { font-size: 12px; color: #6b7280; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
                .actions-cell { display: flex; align-items: center; gap: 8px; }
                .btn-certify { padding: 5px 14px; background: #059669; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .btn-certify:hover { background: #047857; }
                .btn-certify:disabled { background: #9ca3af; cursor: not-allowed; }
                .loading-cell, .empty-cell { text-align: center; padding: 40px; color: #9ca3af; }
                .escalation-tooltip { cursor: help; }
            `}</style>
            </div>
        </StandardPage>
    );
}
