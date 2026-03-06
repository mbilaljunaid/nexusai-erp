import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle2, Search, RefreshCw, Eye } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


interface ScreeningResult {
    id: string;
    entity_type: string;
    entity_id: string;
    entity_name: string;
    list_sources: string[];
    match_status: string;
    match_score: number;
    matched_name: string;
    program_tags: string[];
    screened_at: string;
    reviewed_by: string;
    review_notes: string;
}

interface ReconSignoff {
    id: string;
    period_name: string;
    statement_balance: number;
    gl_balance: number;
    reconciled_balance: number;
    status: string;
    preparer_id: string;
    reviewer_id: string;
    approver_id: string;
}

const STATUS_CFG: Record<string, string> = {
    Clear: 'bg-emerald-100 text-emerald-600',
    PotentialMatch: 'bg-amber-100 text-amber-600',
    Confirmed: 'bg-red-100 text-red-600',
    FalsePositive: 'bg-gray-100 text-gray-500',
};

const RECON_CFG: Record<string, string> = {
    Draft: 'bg-blue-50 text-blue-700',
    Reviewed: 'bg-amber-100 text-amber-600',
    Approved: 'bg-emerald-100 text-emerald-600',
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function DebtCovenantMonitor() {
    const [activeTab, setActiveTab] = useState<'sanctions' | 'recon'>('sanctions');
    const [screenForm, setScreenForm] = useState({ entityType: 'Supplier', entityId: '', entityName: '' });
    const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
    const [reviewOutcome, setReviewOutcome] = useState<'FalsePositive' | 'Confirmed'>('FalsePositive');
    const qc = useQueryClient();

    const { data: screenHistory = [], isLoading } = useQuery<ScreeningResult[]>({
        queryKey: ['sanctions-history'],
        queryFn: () => fetch('/api/treasury/sanctions/history').then(r => r.json()),
    });

    const { data: stats } = useQuery<any>({
        queryKey: ['sanctions-stats'],
        queryFn: () => fetch('/api/treasury/sanctions/stats').then(r => r.json()),
    });

    const { data: signoffs = [] } = useQuery<ReconSignoff[]>({
        queryKey: ['recon-signoffs'],
        queryFn: () => fetch('/api/treasury/recon/signoffs').then(r => r.json()),
    });

    const { data: reconSummary } = useQuery<any>({
        queryKey: ['recon-summary'],
        queryFn: () => fetch('/api/treasury/recon/summary').then(r => r.json()),
    });

    const screenMutation = useMutation({
        mutationFn: (data: any) =>
            fetch('/api/treasury/sanctions/screen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['sanctions-history', 'sanctions-stats'] }),
    });

    const batchScreenMutation = useMutation({
        mutationFn: (data: any) =>
            fetch('/api/treasury/sanctions/batch-screen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['sanctions-history', 'sanctions-stats'] }),
    });

    const reviewMutation = useMutation({
        mutationFn: ({ id, ...rest }: any) =>
            fetch(`/api/treasury/sanctions/${id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sanctions-history'] }); setSelectedResult(null); },
    });

    const reviewSignoffMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/treasury/recon/signoffs/${id}/review`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['recon-signoffs', 'recon-summary'] }),
    });

    const approveSignoffMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/treasury/recon/signoffs/${id}/approve`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['recon-signoffs', 'recon-summary'] }),
    });

    const pending = screenHistory.filter(s => s.match_status === 'PotentialMatch').length;
    const confirmed = screenHistory.filter(s => s.match_status === 'Confirmed').length;

    const screenColumns: SpreadsheetColumn<any>[] = [
        { id: "name", header: "Name", width: "150px", cell: (row) => <span className="fw">{row.entity_name}</span> },
        { id: "type", header: "Type", width: "120px", cell: (row) => <span className="type-chip">{row.entity_type}</span> },
        {
            id: "status", header: "Status", width: "120px", cell: (row) => {
                const cfg = STATUS_CFG[row.match_status] ?? 'bg-gray-100 text-gray-500';
                return <span className={`status-chip ${cfg}`}>{row.match_status}</span>;
            }
        },
        { id: "score", header: "Score", width: "100px", cell: (row) => <span className="mono">{row.match_score?.toFixed(0) ?? '—'}%</span> },
        { id: "lists", header: "Lists", width: "150px", cell: (row) => <div className="lists">{(row.list_sources ?? []).map((l: string) => <span key={l} className="list-tag">{l}</span>)}</div> },
        { id: "programs", header: "Programs", width: "150px", cell: (row) => <div className="lists">{(row.program_tags ?? []).map((p: string) => <span key={p} className="prog-tag">{p}</span>)}</div> },
        { id: "date", header: "Date", width: "100px", cell: (row) => <span className="mono small">{formatDate(row.screened_at)}</span> },
        {
            id: "action", header: "", width: "100px", cell: (row) => (
                (row.match_status === 'PotentialMatch' || row.match_status === 'Confirmed') && !row.reviewed_by ? (
                    <button className="review-btn" onClick={() => setSelectedResult(row)} aria-label={`Review ${row.entity_name}`}><Eye size={12} /> Review</button>
                ) : null
            )
        }
    ];

    const reconColumns: SpreadsheetColumn<any>[] = [
        { id: "period", header: "Period", width: "150px", cell: (row) => <span className="mono fw">{row.period_name}</span> },
        { id: "stmt_bal", header: "Statement Balance", width: "150px", cell: (row) => <span className="mono">{fmt(row.statement_balance)}</span> },
        { id: "gl_bal", header: "GL Balance", width: "150px", cell: (row) => <span className="mono">{fmt(row.gl_balance)}</span> },
        { id: "recon_bal", header: "Recon Balance", width: "150px", cell: (row) => <span className="mono">{fmt(row.reconciled_balance)}</span> },
        {
            id: "variance", header: "Variance", width: "150px", cell: (row) => {
                const variance = Number(row.reconciled_balance) - Number(row.gl_balance);
                return <span className={`mono ${Math.abs(variance) < 0.01 ? 'green' : 'red'}`}>{fmt(variance)}</span>;
            }
        },
        {
            id: "status", header: "Status", width: "120px", cell: (row) => {
                const cfg = RECON_CFG[row.status] ?? 'bg-gray-100 text-gray-500';
                return <span className={`status-chip ${cfg}`}>{row.status}</span>;
            }
        },
        {
            id: "action", header: "Actions", width: "150px", cell: (row) => (
                <div className="recon-btns">
                    {row.status === 'Draft' && (
                        <button className="tiny-btn blue" disabled={reviewSignoffMutation.isPending} onClick={() => reviewSignoffMutation.mutate(row.id)} aria-label={`Review recon for ${row.period_name}`}>Review</button>
                    )}
                    {row.status === 'Reviewed' && (
                        <button className="tiny-btn green" disabled={approveSignoffMutation.isPending} onClick={() => approveSignoffMutation.mutate(row.id)} aria-label={`Approve recon for ${row.period_name}`}>Approve</button>
                    )}
                    {row.status === 'Approved' && <CheckCircle2 size={14} style={{ color: '#059669' }} />}
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Compliance Controls">
            <div className="dcm-header">

                <p className="dcm-sub">Sanctions Screening · Bank Reconciliation Sign-off</p>
            </div>

            {/* KPIs */}
            <div className="dcm-kpis">
                <DcmKpi label="Total Screened" value={stats?.total_screened ?? 0} colorClass="text-blue-700" borderClass="border-l-blue-700" />
                <DcmKpi label="Pending Review" value={pending} colorClass="text-amber-600" borderClass="border-l-amber-600" alert={pending > 0} />
                <DcmKpi label="Confirmed Matches" value={confirmed} colorClass="text-red-600" borderClass="border-l-red-600" alert={confirmed > 0} />
                <DcmKpi label="Recon Approved" value={reconSummary?.approved ?? 0} colorClass="text-emerald-600" borderClass="border-l-emerald-600" />
                <DcmKpi label="Recon Pending" value={reconSummary?.pending_approval ?? 0} colorClass="text-purple-600" borderClass="border-l-purple-600" />
            </div>

            {/* Tabs */}
            <div className="dcm-tabs">
                {(['sanctions', 'recon'] as const).map(t => (
                    <button key={t} className={`dcm-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                        {t === 'sanctions' ? '🛡 Sanctions Screening' : '📋 Bank Recon Sign-off'}
                        {t === 'sanctions' && pending > 0 && <span className="tab-badge">{pending}</span>}
                        {t === 'recon' && (reconSummary?.pending_approval > 0) && <span className="tab-badge">{reconSummary.pending_approval}</span>}
                    </button>
                ))}
            </div>

            {activeTab === 'sanctions' && (
                <div className="dcm-panel">
                    <div className="sanctions-layout">
                        {/* Screen Form */}
                        <div className="screen-form">
                            <h3 className="sf-title">Screen Entity</h3>
                            <div className="sf">
                                <label className="sl">Entity Type</label>
                                <Select value={screenForm.entityType} onValueChange={v => setScreenForm(p => ({ ...p, entityType: v }))}>
                                    <SelectTrigger className="si" aria-label="Entity type"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['Supplier', 'Customer', 'Employee', 'BeneficialOwner'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sf">
                                <label className="sl">Entity ID</label>
                                <Input placeholder="Supplier / Customer ID" value={screenForm.entityId} onChange={e => setScreenForm(p => ({ ...p, entityId: e.target.value }))} className="h-9 text-[12px]" aria-label="Entity ID" />
                            </div>
                            <div className="sf">
                                <label className="sl">Entity Name</label>
                                <Input placeholder="Full legal name" value={screenForm.entityName} onChange={e => setScreenForm(p => ({ ...p, entityName: e.target.value }))} className="h-9 text-[12px]" aria-label="Entity name" />
                            </div>
                            <button className="screen-btn" disabled={!screenForm.entityName || screenMutation.isPending}
                                onClick={() => screenMutation.mutate(screenForm)} aria-label="Screen entity">
                                <Search size={14} /> {screenMutation.isPending ? 'Screening…' : 'Screen Entity'}
                            </button>
                            <button className="batch-btn" disabled={batchScreenMutation.isPending}
                                onClick={() => batchScreenMutation.mutate({ entityType: 'Supplier' })} aria-label="Batch screen all suppliers">
                                <RefreshCw size={14} /> {batchScreenMutation.isPending ? 'Screening…' : 'Batch Screen Suppliers'}
                            </button>
                            {screenMutation.isSuccess && screenMutation.data && (
                                <div className={`screen-result ${(screenMutation.data as ScreeningResult).match_status.toLowerCase()}`}>
                                    <div className="sr-status">{(screenMutation.data as ScreeningResult).match_status}</div>
                                    {(screenMutation.data as ScreeningResult).match_score > 0 && <div className="sr-score">Score: {(screenMutation.data as ScreeningResult).match_score}%</div>}
                                    {(screenMutation.data as ScreeningResult).matched_name && <div className="sr-match">Matched: {(screenMutation.data as ScreeningResult).matched_name}</div>}
                                </div>
                            )}
                        </div>

                        {/* History Table */}
                        <div className="history-panel flex flex-col h-[400px]">
                            <h3 className="sf-title">Screening History</h3>
                            <div className="flex-1 mt-2">
                                {isLoading ? (
                                    <div className="loading h-full flex items-center justify-center">Loading…</div>
                                ) : screenHistory.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">No screening history</div>
                                ) : (
                                    <InteractiveSpreadsheet
                                        columns={screenColumns}
                                        data={screenHistory}
                                        onChange={() => { }}
                                        containerHeight="100%"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Review Modal */}
                    {selectedResult && (
                        <div role="button" tabIndex={0} className="modal-backdrop" onClick={() => setSelectedResult(null)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                            <div role="button" tabIndex={0} className="review-modal" onClick={e => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                <h3 className="rm-title">Review Match</h3>
                                <div className="rm-entity">{selectedResult.entity_name}</div>
                                {selectedResult.matched_name && <div className="rm-match">Matched against: <strong>{selectedResult.matched_name}</strong></div>}
                                <div className="rm-score">Similarity score: <strong>{selectedResult.match_score}%</strong></div>
                                <div className="rm-lists">Lists: {(selectedResult.list_sources ?? []).join(', ')}</div>
                                <div className="rm-progs">Programs: {(selectedResult.program_tags ?? []).join(', ')}</div>
                                <div className="rm-choice" style={{ gap: '12px' }}>
                                    <RadioGroup value={reviewOutcome} onValueChange={(v: any) => setReviewOutcome(v)} className="flex flex-col gap-3">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="FalsePositive" id="r1" />
                                            <label htmlFor="r1" className="text-[13px] cursor-pointer">False Positive — clear entity</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Confirmed" id="r2" />
                                            <label htmlFor="r2" className="text-[13px] cursor-pointer">Confirmed Match — escalate</label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="rm-actions">
                                    <button className="rm-cancel" onClick={() => setSelectedResult(null)} aria-label="Cancel review">Cancel</button>
                                    <button
                                        className={`rm-confirm ${reviewOutcome === 'Confirmed' ? 'danger' : 'success'}`}
                                        disabled={reviewMutation.isPending}
                                        onClick={() => reviewMutation.mutate({ id: selectedResult.id, outcome: reviewOutcome })}
                                        aria-label="Submit review"
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'recon' && (
                <div className="dcm-panel">
                    <div className="recon-summary-grid">
                        <ReconKpi label="Drafts" value={reconSummary?.drafts ?? 0} colorClass="text-blue-700" />
                        <ReconKpi label="Pending Approval" value={reconSummary?.pending_approval ?? 0} colorClass="text-amber-600" />
                        <ReconKpi label="Approved" value={reconSummary?.approved ?? 0} colorClass="text-emerald-600" />
                        <ReconKpi label="Avg Variance" value={reconSummary?.avg_variance ? fmt(reconSummary.avg_variance) : '$0'} colorClass="text-purple-600" isText />
                    </div>
                    <div className="h-[400px]">
                        {signoffs.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">No bank reconciliations found</div>
                        ) : (
                            <InteractiveSpreadsheet
                                columns={reconColumns}
                                data={signoffs}
                                onChange={() => { }}
                                containerHeight="100%"
                            />
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .dcm-container { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .dcm-header { margin-bottom: 20px; }
                .dcm-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .dcm-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .dcm-kpis { display: flex; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
                .dcm-tabs { display: flex; gap: 6px; margin-bottom: 16px; }
                .dcm-tab { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; color: #374151; }
                .dcm-tab.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
                .tab-badge { background: #dc2626; color: #fff; border-radius: 9999px; padding: 1px 6px; font-size: 10px; font-weight: 700; }
                .dcm-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
                .sanctions-layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; }
                .screen-form { display: flex; flex-direction: column; gap: 10px; }
                .sf-title { font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 8px; }
                .sf { display: flex; flex-direction: column; gap: 4px; }
                .sl { font-size: 11px; font-weight: 600; color: #374151; }
                .si { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .screen-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .screen-btn:disabled { background: #9ca3af; }
                .batch-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; font-size: 12px; cursor: pointer; }
                .batch-btn:disabled { color: #9ca3af; }
                .screen-result { padding: 10px; border-radius: 8px; }
                .screen-result.clear { background: #d1fae5; }
                .screen-result.potentialmatch { background: #fef3c7; }
                .screen-result.confirmed { background: #fee2e2; }
                .sr-status { font-size: 13px; font-weight: 700; }
                .sr-score, .sr-match { font-size: 11px; margin-top: 4px; color: #374151; }
                .history-panel { overflow: auto; }
                .sct { width: 100%; border-collapse: collapse; font-size: 12px; }
                .sct th { padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .sct-row:hover { background: #f9fafb; }
                .sct td { padding: 7px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .fw { font-weight: 600; }
                .mono { font-family: monospace; }
                .small { font-size: 11px; }
                .type-chip { background: #dbeafe; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .status-chip { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .lists { display: flex; flex-wrap: wrap; gap: 3px; }
                .list-tag { background: #f3f4f6; color: #374151; padding: 1px 5px; border-radius: 3px; font-size: 10px; font-family: monospace; }
                .prog-tag { background: #fef3c7; color: #d97706; padding: 1px 5px; border-radius: 3px; font-size: 10px; font-weight: 600; }
                .review-btn { display: flex; align-items: center; gap: 3px; padding: 3px 8px; background: #fff; border: 1px solid #d97706; color: #d97706; border-radius: 5px; font-size: 11px; cursor: pointer; }
                .empty { text-align: center; padding: 32px; color: #9ca3af; font-size: 13px; }
                .loading { text-align: center; padding: 32px; color: #9ca3af; }
                .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .review-modal { background: #fff; border-radius: 16px; padding: 28px; width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
                .rm-title { font-size: 18px; font-weight: 700; margin: 0 0 12px; }
                .rm-entity { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px; }
                .rm-match, .rm-score, .rm-lists, .rm-progs { font-size: 13px; color: #374151; margin-bottom: 6px; }
                .rm-choice { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
                .rc-label { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
                .rm-actions { display: flex; gap: 10px; margin-top: 14px; }
                .rm-cancel { flex: 1; padding: 9px; background: #f3f4f6; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
                .rm-confirm { flex: 2; padding: 9px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: #fff; }
                .rm-confirm.success { background: #059669; }
                .rm-confirm.danger { background: #dc2626; }
                .recon-summary-grid { display: flex; gap: 14px; margin-bottom: 16px; }
                .rct { width: 100%; border-collapse: collapse; font-size: 12px; }
                .rct th { padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .rct-row:hover { background: #f9fafb; }
                .rct td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .recon-btns { display: flex; gap: 6px; }
                .tiny-btn { padding: 4px 10px; border: none; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; color: #fff; }
                .tiny-btn.blue { background: #1d4ed8; }
                .tiny-btn.green { background: #059669; }
                .green { color: #059669; }
                .red { color: #dc2626; }
            `}</style>
        </StandardPage>
    );
}

function DcmKpi({ label, value, colorClass, borderClass, alert }: { label: string; value: number | string; colorClass: string; borderClass: string; alert?: boolean }) {
    return (
        <div className={`bg-white border-y border-r border-l-4 rounded-xl px-4 py-3 min-w-[120px] ${alert ? 'border-y-red-300 border-r-red-300' : 'border-y-gray-200 border-r-gray-200'} ${borderClass}`}>
            <div className={`text-[22px] font-[800] ${colorClass}`}>{value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
        </div>
    );
}

function ReconKpi({ label, value, colorClass, isText }: { label: string; value: number | string; colorClass: string; isText?: boolean }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 flex-1">
            <div className={`font-[800] ${colorClass} ${isText ? 'text-base font-mono' : 'text-[22px]'}`}>{value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
        </div>
    );
}
