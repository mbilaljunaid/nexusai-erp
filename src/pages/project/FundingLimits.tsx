import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FundingLimit { id: string; project_id: string; funding_source: string; limit_amount: number; utilized_amount: number; available: number; utilization_pct: number; status: string; alert_threshold_pct: number; restrict_charges: boolean; }
interface Commitment { id: string; project_id: string; commitment_type: string; reference_number: string; vendor_id: string; description: string; committed_amount: number; invoiced_amount: number; remaining_amount: number; status: string; commitment_date: string; }
interface CommitSummary { commitment_type: string; count: number; total_committed: number; total_invoiced: number; total_remaining: number; }

function fmt(n: any) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
const STATUS_STYLES: Record<string, { bg: string, text: string, borderLeft: string }> = {
    Active: { bg: 'bg-emerald-100', text: 'text-emerald-600', borderLeft: 'border-l-emerald-600' },
    Exhausted: { bg: 'bg-red-100', text: 'text-red-600', borderLeft: 'border-l-red-600' },
    Suspended: { bg: 'bg-amber-100', text: 'text-amber-600', borderLeft: 'border-l-amber-600' },
    Closed: { bg: 'bg-gray-100', text: 'text-gray-500', borderLeft: 'border-l-gray-500' },
    Open: { bg: 'bg-blue-100', text: 'text-blue-700', borderLeft: 'border-l-blue-700' },
    PartiallyInvoiced: { bg: 'bg-amber-100', text: 'text-amber-600', borderLeft: 'border-l-amber-600' },
    FullyInvoiced: { bg: 'bg-emerald-100', text: 'text-emerald-600', borderLeft: 'border-l-emerald-600' }
};
const DEFAULT_STYLE = { bg: 'bg-gray-100', text: 'text-gray-500', borderLeft: 'border-l-gray-500' };

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

    const commitColumns: SpreadsheetColumn<Commitment>[] = [
        { id: "type", header: "Type", width: "120px", cell: (c) => <span className="font-bold text-[10px] font-mono">{c.commitment_type}</span> },
        { id: "reference", header: "Reference", width: "150px", cell: (c) => <span className="text-gray-500">{c.reference_number ?? '—'}</span> },
        { id: "vendor", header: "Vendor", width: "150px", cell: (c) => <span>{c.vendor_id ?? '—'}</span> },
        { id: "committed", header: "Committed", width: "120px", cell: (c) => <span className="font-mono">{fmt(c.committed_amount)}</span> },
        { id: "invoiced", header: "Invoiced", width: "120px", cell: (c) => <span className="font-mono">{fmt(c.invoiced_amount)}</span> },
        { id: "remaining", header: "Remaining", width: "120px", cell: (c) => <span className="font-mono text-emerald-600 font-bold">{fmt(c.remaining_amount)}</span> },
        {
            id: "status", header: "Status", width: "120px", cell: (c) => {
                const s = STATUS_STYLES[c.status] || DEFAULT_STYLE;
                return <span className={`py-0.5 px-1.5 rounded-sm text-[10px] font-bold ${s.bg} ${s.text}`}>{c.status}</span>;
            }
        },
        { id: "actions", header: "", width: "100px", cell: (c) => c.status !== 'Closed' && c.status !== 'Cancelled' ? <button onClick={() => closeCommitMut.mutate(c.id)} className="py-1 px-2 bg-gray-100 border-none rounded-md text-[10px] cursor-pointer">Close</button> : null }
    ];

    return (
        <StandardPage title="Funding Limits &amp; Commitment Tracking">
            <div className="mb-4">

                <p className="text-[13px] text-gray-500 mt-1 mb-0">Funding source limits · PO &amp; subcontract commitments · Spending controls</p>
            </div>

            {/* Project selector */}
            <div className="flex gap-2 mb-3.5">
                <input placeholder="Enter Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} className="py-1.5 px-3 border border-gray-300 rounded-lg text-xs min-w-[220px]" aria-label="Project ID" />
                <button disabled={!projectId} onClick={() => setActiveProject(projectId)} className="py-1.5 px-4 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50">Load</button>
            </div>

            {activeProject && (
                <>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3">
                        <div className="flex gap-1">
                            {/* eslint-disable-next-line react/forbid-dom-props */}
                            {(['funding', 'commitments'] as const).map(t => (
                                <button key={t} onClick={() => setTab(t)} className={`py-1.5 px-4 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer capitalize ${tab === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>{t === 'funding' ? `Funding Limits (${fundingLimits.length})` : `Commitments (${commitments.length})`}</button>
                            ))}
                        </div>
                        <button onClick={() => tab === 'funding' ? setShowNewFL(true) : setShowNewCommit(true)} className="ml-auto py-1.5 px-3.5 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">+ Add</button>
                    </div>

                    {/* Funding Limits */}
                    {tab === 'funding' && (
                        <>
                            {showNewFL && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-2.5">
                                    <div className="text-xs font-bold mb-2">Add Funding Limit</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-[10px] font-semibold">Source</label>
                                            <Select value={flForm.fundingSource} onValueChange={v => setFlForm(p => ({ ...p, fundingSource: v }))}>
                                                <SelectTrigger className="py-1.5 px-2 text-[11px]" aria-label="Funding source"><SelectValue /></SelectTrigger>
                                                <SelectContent>{['GRANT', 'CONTRACT', 'INTERNAL', 'LOAN', 'EQUITY'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        {(
                                            [
                                                ['limitAmount', 'Limit Amount', 'number'],
                                                ['alertThresholdPct', 'Alert at %', 'number']
                                            ] as const
                                        ).map(([k, l, t]) => (
                                            <div key={k as string} className="flex flex-col gap-0.5">
                                                <label className="text-[10px] font-semibold">{l as string}</label>
                                                <input type={t as string} value={(flForm as any)[k as string]} onChange={e => setFlForm(p => ({ ...p, [k as string]: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-[11px]" aria-label={l as string} />
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-1.5 pt-3.5">
                                            <input type="checkbox" id="restrict_charges" checked={flForm.restrictCharges} onChange={e => setFlForm(p => ({ ...p, restrictCharges: e.target.checked }))} className="m-0" />
                                            <label htmlFor="restrict_charges" className="text-[11px]">Block charges when exceeded</label>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 justify-end mt-2">
                                        <button onClick={() => setShowNewFL(false)} className="py-1 px-3 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                                        <button disabled={!flForm.limitAmount} onClick={() => addFLMut.mutate({ ...flForm, projectId: activeProject })} className="py-1 px-3 bg-blue-700 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-50">Add</button>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                {fundingLimits.map(fl => {
                                    const pct = Math.min(100, Number(fl.utilization_pct));
                                    const s = STATUS_STYLES[fl.status] || DEFAULT_STYLE;
                                    return (
                                        <div key={fl.id} className={`bg-white rounded-xl p-3 px-4 border border-x border-y border-l-[4px] ${fl.status === 'Exhausted' ? 'border-red-300' : 'border-gray-200'} ${s.borderLeft}`}>
                                            <div className="flex justify-between mb-1.5">
                                                <div className="font-bold text-[13px]">{fl.funding_source} <span className="font-mono text-gray-500 text-xs font-normal">(Limit: {fmt(fl.limit_amount)})</span></div>
                                                <span className={`text-[10px] py-0.5 px-1.5 rounded-sm font-bold ${s.bg} ${s.text}`}>{fl.status}</span>
                                            </div>
                                            <div className="flex gap-4 text-[11px] text-gray-500 mb-1.5">
                                                <span>Utilized: <strong>{fmt(fl.utilized_amount)}</strong></span>
                                                <span>Available: <strong className="text-emerald-600">{fmt(fl.available)}</strong></span>
                                                <span>Alert at: {fl.alert_threshold_pct}%</span>
                                                {fl.restrict_charges && <span className="text-amber-600 font-semibold">⚑ Charges blocked at 100%</span>}
                                            </div>
                                            <div className="bg-gray-100 rounded-full h-2">
                                                <style>{`
                                                    .fl-progress-${fl.id} { width: ${pct}%; }
                                                `}</style>
                                                <div className={`h-full rounded-full transition-all duration-300 fl-progress-${fl.id} ${pct >= 100 ? 'bg-red-600' : pct >= fl.alert_threshold_pct ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">{pct.toFixed(1)}% utilized</div>
                                        </div>
                                    );
                                })}
                                {fundingLimits.length === 0 && <div className="text-center text-gray-400 p-6">No funding limits defined</div>}
                            </div>
                        </>
                    )}

                    {/* Commitments */}
                    {tab === 'commitments' && (
                        <>
                            {/* Summary by type */}
                            {commitSummary.length > 0 && (
                                <div className="flex gap-2 mb-2.5">
                                    {commitSummary.map(s => (
                                        <div key={s.commitment_type} className="bg-white border border-gray-200 rounded-xl py-2.5 px-4 flex-1">
                                            <div className="text-[11px] text-gray-500 mb-0.5">{s.commitment_type}</div>
                                            <div className="text-[15px] font-extrabold font-mono">{fmt(s.total_committed)}</div>
                                            <div className="text-[10px] text-emerald-600">Remaining: {fmt(s.total_remaining)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showNewCommit && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-2.5">
                                    <div className="text-xs font-bold mb-2">Add Commitment</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-[10px] font-semibold">Type</label>
                                            <Select value={commitForm.commitmentType} onValueChange={v => setCommitForm(p => ({ ...p, commitmentType: v }))}>
                                                <SelectTrigger className="py-1.5 px-2 text-[11px]" aria-label="Commitment type"><SelectValue /></SelectTrigger>
                                                <SelectContent>{['PO', 'CONTRACT', 'SUBCONTRACT', 'PRELIM_ESTIMATE'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        {(
                                            [
                                                ['referenceNumber', 'Reference #', 'text'],
                                                ['vendorId', 'Vendor ID', 'text'],
                                                ['committedAmount', 'Amount', 'number'],
                                                ['description', 'Description', 'text'],
                                                ['commitmentDate', 'Date', 'date']
                                            ] as const
                                        ).map(([k, l, t]) => (
                                            <div key={k as string} className="flex flex-col gap-0.5">
                                                <label className="text-[10px] font-semibold">{l as string}</label>
                                                <input type={t as string} value={(commitForm as any)[k as string]} onChange={e => setCommitForm(p => ({ ...p, [k as string]: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-[11px]" aria-label={l as string} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-1.5 justify-end mt-2">
                                        <button onClick={() => setShowNewCommit(false)} className="py-1 px-3 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                                        <button disabled={!commitForm.committedAmount} onClick={() => addCommitMut.mutate({ ...commitForm, projectId: activeProject })} className="py-1 px-3 bg-blue-700 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-50">Add</button>
                                    </div>
                                </div>
                            )}

                            <div className="min-h-[400px] h-full border border-gray-200 rounded-xl">
                                <InteractiveSpreadsheet
                                    columns={commitColumns}
                                    data={commitments}
                                    onChange={() => { }}
                                    containerHeight="500px"
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </StandardPage>
    );
}
