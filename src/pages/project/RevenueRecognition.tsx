import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";

interface RevEvent { id: string; period_start: string; period_end: string; pct_complete: number; costs_incurred: number; costs_to_complete: number; revenue_recognized: number; cumulative_revenue: number; gl_posted: boolean; gl_reference: string; method: string; contract_value: number; }
interface RevSummary { method: string; contract_value: number; total_recognized: number; cumulative: number; remaining: number; pct_recognized: number; period_count: number; gl_posted_count: number; }

function fmt(n: number | string) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'; }

const METHODS = ['POC', 'MILESTONE', 'TIME_MATERIALS', 'COMPLETED_CONTRACT'] as const;

export default function RevenueRecognition() {
    const [projectId, setProjectId] = useState('');
    const [activeProject, setActiveProject] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [showRecognize, setShowRecognize] = useState(false);
    const [setup, setSetup] = useState({ method: 'POC', contractValue: '', currencyCode: 'USD', startDate: '', endDate: '' });
    const [recognize, setRecognize] = useState({ periodStart: '', periodEnd: '', costsIncurred: '', costsToComplete: '', pctCompleteOverride: '', milestoneAmount: '' });
    const qc = useQueryClient();

    const { data: summary } = useQuery<RevSummary>({ queryKey: ['rev-summary', activeProject], enabled: !!activeProject, queryFn: () => fetch(`/api/project/revenue-summary?projectId=${activeProject}`).then(r => r.json()) });
    const { data: events = [] } = useQuery<RevEvent[]>({ queryKey: ['rev-events', activeProject], enabled: !!activeProject, queryFn: () => fetch(`/api/project/revenue-events?projectId=${activeProject}`).then(r => r.json()) });

    const setupMut = useMutation({
        mutationFn: (d: any) => fetch('/api/project/revenue-methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rev-summary', activeProject] }); setShowSetup(false); },
    });
    const recognizeMut = useMutation({
        mutationFn: (d: any) => fetch('/api/project/revenue-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rev-events', activeProject, 'rev-summary', activeProject] }); setShowRecognize(false); },
    });
    const postGLMut = useMutation({
        mutationFn: ({ id }: { id: string }) => fetch(`/api/project/revenue-events/${id}/post-gl`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postedBy: 'current-user', glReference: 'GL-' + Date.now() }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['rev-events', activeProject] }),
    });

    const pctNum = summary ? Math.min(100, Math.round(Number(summary.pct_recognized))) : 0;

    const revColumns: SpreadsheetColumn<RevEvent>[] = [
        { id: "period", header: "Period", width: "160px", cell: (e) => <span className="whitespace-nowrap">{fmtDate(e.period_start)} – {fmtDate(e.period_end)}</span> },
        { id: "pctComplete", header: "% Complete", width: "100px", cell: (e) => <span>{(Number(e.pct_complete) * 100).toFixed(1)}%</span> },
        { id: "costsIncurred", header: "Costs Incurred", width: "120px", cell: (e) => <span className="font-mono">{fmt(e.costs_incurred)}</span> },
        { id: "costsToComplete", header: "Costs to Complete", width: "130px", cell: (e) => <span className="font-mono">{fmt(e.costs_to_complete)}</span> },
        { id: "recognized", header: "Recognized", width: "110px", cell: (e) => <span className="font-mono font-bold text-emerald-600">{fmt(e.revenue_recognized)}</span> },
        { id: "cumulative", header: "Cumulative", width: "110px", cell: (e) => <span className="font-mono text-gray-500">{fmt(e.cumulative_revenue)}</span> },
        { id: "gl", header: "GL", width: "100px", cell: (e) => e.gl_posted ? <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold"><CheckCircle2 size={11} /> Posted</span> : <span className="text-[10px] text-amber-600 font-semibold">Pending</span> },
        { id: "actions", header: "", width: "100px", cell: (e) => !e.gl_posted ? <button onClick={() => postGLMut.mutate({ id: e.id })} className="py-1 px-2 bg-blue-700 text-white border-none rounded-md text-[10px] cursor-pointer">Post GL</button> : null }
    ];

    return (
        <StandardPage title="Revenue Recognition">
            <div className="flex justify-between mb-4">
                <div>

                    <p className="text-[13px] text-gray-500 mt-1 mb-0">POC · Milestone · Time &amp; Materials · Completed Contract — ASC 606/IFRS 15</p>
                </div>
            </div>

            {/* Project picker */}
            <div className="flex gap-2 mb-3.5">
                <input placeholder="Enter Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} className="py-1.5 px-3 border border-gray-300 rounded-lg text-xs min-w-[220px]" aria-label="Project ID" />
                <button disabled={!projectId} onClick={() => setActiveProject(projectId)} className="py-1.5 px-4 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50">Load Project</button>
                {activeProject && <button onClick={() => setShowSetup(true)} className="py-1.5 px-3.5 bg-gray-100 border border-gray-200 rounded-lg text-xs cursor-pointer">⚙ Setup Method</button>}
                {activeProject && summary && <button onClick={() => setShowRecognize(true)} className="py-1.5 px-3.5 bg-emerald-600 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">+ Recognize Revenue</button>}
            </div>

            {activeProject && summary && (
                <>
                    {/* Summary bar */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3.5">
                        <div className="flex gap-5 mb-2.5">
                            {(
                                [
                                    ['Method', summary.method],
                                    ['Contract Value', 'USD ' + fmt(summary.contract_value)],
                                    ['Recognized', 'USD ' + fmt(summary.total_recognized)],
                                    ['Remaining', 'USD ' + fmt(summary.remaining)],
                                    ['Periods', summary.period_count],
                                    ['GL Posted', summary.gl_posted_count + '/' + summary.period_count]
                                ] as const
                            ).map(([l, v]) => (
                                <div key={l as string}>
                                    <div className="text-[17px] font-extrabold font-mono">{v as React.ReactNode}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{l as string}</div>
                                </div>
                            ))}
                        </div>
                        {/* progress bar */}
                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            {/* eslint-disable-next-line react/forbid-dom-props */}
                            <div className={`h-full rounded-full transition-all duration-400 ${pctNum >= 90 ? 'bg-emerald-600' : 'bg-blue-700'}`} style={{ width: pctNum + '%' }} />
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">{pctNum}% recognized of contract value</div>
                    </div>

                    {/* Setup form */}
                    {showSetup && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-2.5">
                            <div className="text-xs font-bold mb-2">Setup Recognition Method — Project {activeProject}</div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[10px] font-semibold">Method</label>
                                    <select value={setup.method} onChange={e => setSetup(p => ({ ...p, method: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-[11px]" aria-label="Revenue method">
                                        {METHODS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                {(
                                    [
                                        ['contractValue', 'Contract Value', 'number'],
                                        ['startDate', 'Start Date', 'date'],
                                        ['endDate', 'End Date', 'date']
                                    ] as const
                                ).map(([k, l, t]) => (
                                    <div key={k as string} className="flex flex-col gap-0.5">
                                        <label className="text-[10px] font-semibold">{l as string}</label>
                                        <input type={t as string} value={(setup as any)[k as string]} onChange={e => setSetup(p => ({ ...p, [k as string]: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-[11px]" aria-label={l as string} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-1.5 justify-end mt-2">
                                <button onClick={() => setShowSetup(false)} className="py-1 px-3 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                                <button disabled={!setup.contractValue} onClick={() => setupMut.mutate({ ...setup, projectId: activeProject })} className="py-1 px-3 bg-blue-700 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-50">Save Method</button>
                            </div>
                        </div>
                    )}

                    {/* Recognize form */}
                    {showRecognize && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-2.5">
                            <div className="text-xs font-bold mb-2">Recognize Revenue — {summary.method}</div>
                            <div className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        ['periodStart', 'Period Start', 'date'],
                                        ['periodEnd', 'Period End', 'date'],
                                        ['costsIncurred', 'Costs Incurred', 'number'],
                                        ['costsToComplete', 'Costs to Complete', 'number'],
                                        ...(summary.method === 'POC' ? [['pctCompleteOverride', '% Complete Override', 'number']] : []),
                                        ...(summary.method === 'MILESTONE' ? [['milestoneAmount', 'Milestone Amount', 'number']] : [])
                                    ] as const
                                ).map(([k, l, t]) => (
                                    <div key={k as string} className="flex flex-col gap-0.5">
                                        <label className="text-[10px] font-semibold">{l as string}</label>
                                        <input type={t as string} value={(recognize as any)[k as string] ?? ''} onChange={e => setRecognize(p => ({ ...p, [k as string]: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-[11px]" aria-label={l as string} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-1.5 justify-end mt-2">
                                <button onClick={() => setShowRecognize(false)} className="py-1 px-3 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                                <button disabled={!recognize.periodStart || recognizeMut.isPending} onClick={() => recognizeMut.mutate({ ...recognize, projectId: activeProject })} className="py-1 px-3 bg-emerald-600 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-50">Recognize</button>
                            </div>
                        </div>
                    )}

                    {/* Events table */}
                    <div className="min-h-[400px] h-full border border-gray-200 rounded-xl">
                        <InteractiveSpreadsheet
                            columns={revColumns}
                            data={events}
                            onChange={() => { }}
                            containerHeight="500px"
                        />
                    </div>
                </>
            )}

            {!activeProject && (
                <div className="text-center p-14 text-gray-400">
                    <BarChart2 size={32} className="mb-2 opacity-40 mx-auto" />
                    <p className="text-[13px]">Enter a project ID to load revenue recognition schedule</p>
                </div>
            )}
        </StandardPage>
    );
}
