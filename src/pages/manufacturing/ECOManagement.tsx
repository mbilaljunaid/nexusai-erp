import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


interface ECO {
    id: string; eco_number: string; title: string; change_type: string;
    priority: string; status: string; requested_by: string; approved_by: string;
    effective_date: string; affected_items: any[]; created_at: string;
}
interface ECOSummary { status: string; priority: string; count: number; }

const PRIORITY_CLR: Record<string, string> = { CRITICAL: 'text-red-600 bg-red-600/20', HIGH: 'text-amber-600 bg-amber-600/20', MEDIUM: 'text-blue-700 bg-blue-700/20', LOW: 'text-emerald-600 bg-emerald-600/20' };
const STATUS_CLR: Record<string, string> = { Draft: 'text-gray-400 bg-gray-400/20', Under_Review: 'text-amber-600 bg-amber-600/20', Approved: 'text-blue-700 bg-blue-700/20', Released: 'text-violet-600 bg-violet-600/20', Implemented: 'text-emerald-600 bg-emerald-600/20', Cancelled: 'text-red-600 bg-red-600/20' };

const STATUS_BORDER_CLR: Record<string, string> = { Draft: 'border-x-gray-400/40 border-b-gray-400/40 border-t-gray-400', Under_Review: 'border-x-amber-600/40 border-b-amber-600/40 border-t-amber-600', Approved: 'border-x-blue-700/40 border-b-blue-700/40 border-t-blue-700', Released: 'border-x-violet-600/40 border-b-violet-600/40 border-t-violet-600', Implemented: 'border-x-emerald-600/40 border-b-emerald-600/40 border-t-emerald-600', Cancelled: 'border-x-red-600/40 border-b-red-600/40 border-t-red-600' };
const STATUS_TEXT_CLR: Record<string, string> = { Draft: 'text-gray-400', Under_Review: 'text-amber-600', Approved: 'text-blue-700', Released: 'text-violet-600', Implemented: 'text-emerald-600', Cancelled: 'text-red-600' };

const ACTIONS: Record<string, { label: string; action: string; color: string }[]> = {
    Draft: [{ label: 'Submit for Review', action: 'submit', color: 'bg-blue-700' }],
    Under_Review: [{ label: '✓ Approve', action: 'approve', color: 'bg-emerald-600' }, { label: 'Cancel', action: 'cancel', color: 'bg-red-600' }],
    Approved: [{ label: '🚀 Release', action: 'release', color: 'bg-violet-600' }],
    Released: [{ label: '✓ Mark Implemented', action: 'implement', color: 'bg-emerald-600' }],
};

export default function ECOManagement() {
    const [selected, setSelected] = useState<ECO | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [form, setForm] = useState({ title: '', description: '', changeType: 'DESIGN', priority: 'MEDIUM', requestedBy: '' });
    const qc = useQueryClient();

    const { data: ecos = [] } = useQuery<ECO[]>({ queryKey: ['eco', statusFilter], queryFn: () => fetch(`/api/mfg/eco${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: summary = [] } = useQuery<ECOSummary[]>({ queryKey: ['eco-summary'], queryFn: () => fetch('/api/mfg/eco/summary').then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/mfg/eco', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['eco', 'eco-summary'] }); setShowNew(false); } });
    const actionMut = useMutation({ mutationFn: ({ id, action }: { id: string; action: string }) => fetch(`/api/mfg/eco/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, actor: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['eco', 'eco-summary'] }) });

    // Build status totals
    const statusTotals = ['Draft', 'Under_Review', 'Approved', 'Released', 'Implemented', 'Cancelled'].map(s => ({
        status: s, count: summary.filter(x => x.status === s).reduce((a, b) => a + Number(b.count), 0)
    }));

    const ecoColumns: SpreadsheetColumn<ECO>[] = [
        { id: "eco_number", header: "ECO #", width: "120px", cell: (e) => <span className="font-mono font-bold text-[11px]">{e.eco_number}</span> },
        {
            id: "title", header: "Title", width: "300px", cell: (e) => (
                <>
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-[10px] text-gray-400">Requested by: {e.requested_by ?? '—'}</div>
                </>
            )
        },
        { id: "type", header: "Type", width: "120px", cell: (e) => <span className="text-[10px] text-gray-500">{e.change_type}</span> },
        {
            id: "priority", header: "Priority", width: "120px", cell: (e) => (
                <span className={`py-0.5 px-2 rounded font-bold text-[10px] ${PRIORITY_CLR[e.priority]}`}>{e.priority}</span>
            )
        },
        {
            id: "status", header: "Status", width: "150px", cell: (e) => (
                <span className={`py-0.5 px-2 rounded font-bold text-[10px] ${STATUS_CLR[e.status]}`}>{e.status.replace(/_/g, ' ')}</span>
            )
        },
        {
            id: "actions", header: "Actions", width: "150px", cell: (e) => (
                <div className="flex gap-1">
                    {(ACTIONS[e.status] ?? []).map(a => (
                        <button key={a.action} onClick={(ev) => { ev.stopPropagation(); actionMut.mutate({ id: e.id, action: a.action }); }} className={`py-1 px-2 text-white border-none rounded-md text-[10px] cursor-pointer ${a.color}`}>{a.label}</button>
                    ))}
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Engineering Change Orders">
            <div className="flex justify-between mb-4">
                <div>

                    <p className="text-[13px] text-gray-500 mt-1 mb-0">Change lifecycle · Approval workflow · BOM impact tracking</p>
                </div>
                <button onClick={() => setShowNew(true)} className="py-2 px-3.5 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">+ New ECO</button>
            </div>

            {/* Status strip */}
            <div className="flex gap-2 mb-3.5">
                {statusTotals.map(s => (
                    <div key={s.status} onClick={() => setStatusFilter(statusFilter === s.status ? '' : s.status)} className={`flex-1 bg-white rounded-lg py-2 px-2.5 cursor-pointer border-r border-l border-b border-t-[3px] ${STATUS_BORDER_CLR[s.status]} ${statusFilter && statusFilter !== s.status ? 'opacity-50' : 'opacity-100'}`}>
                        <div className={`text-lg font-extrabold font-mono ${STATUS_TEXT_CLR[s.status]}`}>{s.count}</div>
                        <div className="text-[9px] text-gray-400 font-semibold">{s.status.replace(/_/g, ' ')}</div>
                    </div>
                ))}
            </div>

            {/* New ECO form */}
            {showNew && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-3">
                    <div className="text-[13px] font-bold mb-2.5">Create ECO</div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {(
                            [
                                ['changeType', 'Type', ['DESIGN', 'PROCESS', 'MATERIAL', 'TOOLING', 'SOFTWARE', 'SAFETY']],
                                ['priority', 'Priority', ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']]
                            ] as const
                        ).map(([k, l, opts]) => (
                            <div key={k} className="flex flex-col gap-0.5">
                                <label className="text-[10px] font-bold">{l}</label>
                                <select value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="py-1 px-2 border border-gray-300 rounded-md text-[11px]" aria-label={l}>
                                    {opts.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[10px] font-bold">Requested By</label>
                            <input value={form.requestedBy} onChange={e => setForm(p => ({ ...p, requestedBy: e.target.value }))} className="py-1 px-2 border border-gray-300 rounded-md text-[11px]" aria-label="Requested by" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                        <label className="text-[10px] font-bold">Title</label>
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs" aria-label="Title" />
                    </div>
                    <div className="flex flex-col gap-1 mb-2.5">
                        <label className="text-[10px] font-bold">Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-[11px] resize-y" aria-label="Description" />
                    </div>
                    <div className="flex gap-1.5 justify-end">
                        <button onClick={() => setShowNew(false)} className="py-1 px-3 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={!form.title} onClick={() => createMut.mutate(form)} className="py-1 px-3 bg-blue-700 text-white border-none rounded-md text-[11px] font-bold cursor-pointer disabled:opacity-50">Create</button>
                    </div>
                </div>
            )}

            <div className="flex gap-3.5">
                {/* ECO list */}
                <div className="flex-1 min-h-[400px] h-full border border-gray-200 rounded-xl">
                    <InteractiveSpreadsheet
                        columns={ecoColumns}
                        data={ecos}
                        activeRow={selected?.id}
                        onRowSelect={(e) => setSelected(selected?.id === e.id ? null : e as ECO)}
                        onChange={() => { }}
                        containerHeight="600px"
                    />
                </div>
                {/* Detail */}
                {selected && (
                    <div className="w-[280px] shrink-0 bg-white border border-gray-200 rounded-xl p-3.5">
                        <div className="flex justify-between mb-2">
                            <div className="font-bold text-xs">{selected.eco_number}</div>
                            <button onClick={() => setSelected(null)} className="bg-transparent border-none cursor-pointer">✕</button>
                        </div>
                        <div className="text-[11px] text-gray-700 mb-2.5">{selected.title}</div>
                        <div className="text-[10px] text-gray-500 mb-2.5">
                            <div>Type: <strong className="font-bold text-gray-900">{selected.change_type}</strong></div>
                            <div>Approved by: {selected.approved_by ?? '—'}</div>
                            <div>Effective: {selected.effective_date ?? '—'}</div>
                        </div>
                        {selected.affected_items?.length > 0 && (
                            <>
                                <div className="text-[10px] font-bold mb-1">Affected Items</div>
                                {selected.affected_items.map((item: any, i: number) => (
                                    <div key={i} className="text-[10px] bg-gray-50 rounded px-1.5 py-0.5 mb-0.5">{item.itemNumber} Rev {item.revision}</div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
