import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
                <span className={cn(`py-0.5 px-2 rounded font-bold text-[10px] ${PRIORITY_CLR[e.priority]}`)}>{e.priority}</span>
            )
        },
        {
            id: "status", header: "Status", width: "150px", cell: (e) => (
                <span className={cn(`py-0.5 px-2 rounded font-bold text-[10px] ${STATUS_CLR[e.status]}`)}>{e.status.replace(/_/g, ' ')}</span>
            )
        },
        {
            id: "actions", header: "Actions", width: "150px", cell: (e) => (
                <div className="flex gap-1">
                    {(ACTIONS[e.status] ?? []).map(a => (
                        <Button variant="default" size="sm" key={a.action} onClick={(ev) => { ev.stopPropagation(); actionMut.mutate({ id: e.id, action: a.action }); }} className={cn(`py-1 px-2 text-white border-none rounded-md text-[10px] cursor-pointer ${a.color}`)}>{a.label}</Button>
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
                <Button variant="default" size="sm" onClick={() => setShowNew(true)} className="text-white text-xs">+ New ECO</Button>
            </div>

            {/* Status strip */}
            <div className="flex gap-2 mb-3.5">
                {statusTotals.map(s => (
                    <Card key={s.status} onClick={() => setStatusFilter(statusFilter === s.status ? '' : s.status)} className={cn(`flex-1 rounded-xl py-2 px-2.5 cursor-pointer border-t-[3px] shadow-sm ${STATUS_BORDER_CLR[s.status]} ${statusFilter && statusFilter !== s.status ? 'opacity-50' : 'opacity-100'}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                        <div className={cn(`text-lg font-extrabold font-mono ${STATUS_TEXT_CLR[s.status]}`)}>{s.count}</div>
                        <div className="text-[9px] text-gray-400 font-semibold">{s.status.replace(/_/g, ' ')}</div>
                    </Card>
                ))}
            </div>

            {/* New ECO form */}
            {showNew && (
                <Card className="p-3.5 mb-3 bg-slate-500/10 shadow-sm border-gray-200">
                    <div className="text-[13px] font-bold mb-2.5">Create ECO</div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {(
                            [
                                ['changeType', 'Type', ['DESIGN', 'PROCESS', 'MATERIAL', 'TOOLING', 'SOFTWARE', 'SAFETY']],
                                ['priority', 'Priority', ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']]
                            ] as const
                        ).map(([k, l, opts]) => (
                            <div key={k} className="flex flex-col gap-0.5">
                                <Label className="text-[10px] font-bold">{l}</Label>
                                <Select value={(form as any)[k]} onValueChange={v => setForm(p => ({ ...p, [k]: v }))}>
                                    <SelectTrigger className="py-1 px-2 text-[11px]" aria-label={l}><SelectValue /></SelectTrigger>
                                    <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <Label className="text-[10px] font-bold">Requested By</Label>
                            <Input value={form.requestedBy} onChange={e => setForm(p => ({ ...p, requestedBy: e.target.value }))} className="py-1 px-2 border border-gray-300 rounded-md text-[11px]" aria-label="Requested by" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                        <Label className="text-[10px] font-bold">Title</Label>
                        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs" aria-label="Title" />
                    </div>
                    <div className="flex flex-col gap-1 mb-2.5">
                        <Label className="text-[10px] font-bold">Description</Label>
                        <Textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="text-xs resize-y" aria-label="Description" />
                    </div>
                    <div className="flex gap-1.5 justify-end">
                        <Button variant="secondary" size="sm" onClick={() => setShowNew(false)} className="text-[11px]">Cancel</Button>
                        <Button variant="default" size="sm" disabled={!form.title} onClick={() => createMut.mutate(form)} className="text-white text-[11px] disabled:opacity-50">Create</Button>
                    </div>
                </Card>
            )}

            <div className="flex gap-3.5">
                {/* ECO list */}
                <Card className="flex-1 min-h-[400px] h-full overflow-hidden shadow-sm">
                    <InteractiveSpreadsheet
                        columns={ecoColumns}
                        data={ecos}
                        activeRow={selected?.id}
                        onRowSelect={(e) => setSelected(selected?.id === e.id ? null : e as ECO)}
                        onChange={() => { }}
                        containerHeight="600px"
                    />
                </Card>
                {/* Detail */}
                {selected && (
                    <Card className="w-72 shrink-0 p-3.5 shadow-sm">
                        <div className="flex justify-between mb-2">
                            <div className="font-bold text-xs">{selected.eco_number}</div>
                            <Button variant="outline" onClick={() => setSelected(null)} >✕</Button>
                        </div>
                        <div className="text-[11px] text-gray-700 mb-2.5">{selected.title}</div>
                        <div className="text-[10px] text-gray-500 mb-2.5">
                            <div>Type: <strong className="font-bold text-gray-900 dark:text-gray-200">{selected.change_type}</strong></div>
                            <div>Approved by: {selected.approved_by ?? '—'}</div>
                            <div>Effective: {selected.effective_date ?? '—'}</div>
                        </div>
                        {selected.affected_items?.length > 0 && (
                            <>
                                <div className="text-[10px] font-bold mb-1">Affected Items</div>
                                {selected.affected_items.map((item: any, i: number) => (
                                    <div key={i} className="text-[10px] bg-gray-500/10 rounded px-1.5 py-0.5 mb-0.5">{item.itemNumber} Rev {item.revision}</div>
                                ))}
                            </>
                        )}
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
