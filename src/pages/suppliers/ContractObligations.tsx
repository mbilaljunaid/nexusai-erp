import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, ArrowUp } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatNumber } from '@/lib/formatters';

interface Obligation {
    id: string;
    contract_id: string;
    supplier_id: string;
    obligation_type: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    escalation_level: number;
    penalty_amount: number;
    currency_code: string;
    evidence_url: string;
}

const OB_STATUS: Record<string, { bg: string; color: string }> = {
    Pending: { bg: '#eff6ff', color: '#1d4ed8' },
    InReview: { bg: '#fef3c7', color: '#d97706' },
    Met: { bg: '#d1fae5', color: '#059669' },
    Overdue: { bg: '#fee2e2', color: '#dc2626' },
    Waived: { bg: '#f3f4f6', color: '#6b7280' },
};

const ESC_LABELS = ['—', '⚠ Warning', '🔴 Manager', '🚨 Legal'];

function fmt(d: string) { return d ? formatDate(d) : '—'; }

export default function ContractObligations() {
    const [filter, setFilter] = useState<string>('');
    const [selected, setSelected] = useState<Obligation | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [newOb, setNewOb] = useState({ contractId: '', supplierId: '', obligationType: 'DELIVERY', title: '', dueDate: '', recurrence: 'NONE', penaltyAmount: '' });
    const qc = useQueryClient();

    const { data: summary } = useQuery<any>({ queryKey: ['ob-summary'], queryFn: () => fetch('/api/supplier/obligations/summary').then(r => r.json()) });
    const { data: obligations = [] } = useQuery<Obligation[]>({ queryKey: ['obligations', filter], queryFn: () => fetch(`/api/supplier/obligations${filter ? `?status=${filter}` : ''}`).then(r => r.json()) });
    const { data: upcoming = [] } = useQuery<Obligation[]>({ queryKey: ['ob-upcoming'], queryFn: () => fetch('/api/supplier/obligations/upcoming?days=30').then(r => r.json()) });

    const createMut = useMutation({
        mutationFn: (d: any) => fetch('/api/supplier/obligations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['obligations', 'ob-summary'] }); setShowNew(false); },
    });

    const evidenceMut = useMutation({
        mutationFn: ({ id, url }: { id: string; url: string }) => fetch(`/api/supplier/obligations/${id}/evidence`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evidenceUrl: url }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['obligations'] }); setEvidenceUrl(''); },
    });

    const reviewMut = useMutation({
        mutationFn: ({ id, decision }: { id: string; decision: string }) => fetch(`/api/supplier/obligations/${id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, reviewedBy: 'current-user' }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['obligations', 'ob-summary'] }); setSelected(null); },
    });

    const escMut = useMutation({
        mutationFn: (id: string) => fetch(`/api/supplier/obligations/${id}/escalate`, { method: 'POST' }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['obligations'] }),
    });

    return (
        <StandardPage title="Contract Obligations">
            <div className="flex justify-between mb-4">
                <div>
                    <p className="text-sm text-muted-foreground mt-1">Supplier compliance tracking · Evidence submission · Escalation management</p>
                </div>
                <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-blue-700 text-white border-none rounded-lg font-semibold cursor-pointer text-sm">+ Add Obligation</button>
            </div>

            {/* KPIs */}
            <div className="flex gap-2.5 mb-3.5">
                {[['Total', summary?.total ?? 0, '#6b7280'], ['Pending', summary?.pending ?? 0, '#1d4ed8'], ['Overdue', summary?.overdue ?? 0, '#dc2626'], ['Met', summary?.met ?? 0, '#059669'], ['At Risk', `${summary?.currency_code ?? 'USD'} ${formatNumber(Number(summary?.total_at_risk ?? 0))}`, '#d97706']].map(([l, v, c]) => (
                    <Card key={l as string} className="px-4 py-2.5 flex-1 shadow-sm border-l-[4px]" style={{ borderLeftColor: c as string }}>
                        <div className="text-xl font-extrabold font-mono">{v}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{l}</div>
                    </Card>
                ))}
            </div>

            {/* Upcoming alert banner */}
            {upcoming.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-300 rounded-xl px-3.5 py-2.5 mb-3.5 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5"  color="#d97706" />
                    <span className="text-xs text-amber-800 font-semibold">{upcoming.length} obligation{upcoming.length !== 1 ? 's' : ''} due within 30 days</span>
                    <div className="flex gap-1.5 ml-2">
                        {upcoming.slice(0, 3).map(u => <span key={u.id} className="text-[11px] bg-amber-100 px-2 py-0.5 rounded text-amber-700">{u.title} — {fmt(u.due_date)}</span>)}
                    </div>
                </div>
            )}

            {/* Add form */}
            {showNew && (
                <Card className="p-3.5 mb-3 shadow-sm">
                    <div className="text-[13px] font-bold mb-2.5">Add Contract Obligation</div>
                    <div className="grid grid-cols-3 gap-2">
                        {[['contractId', 'Contract ID', 'text'], ['supplierId', 'Supplier ID', 'text'], ['title', 'Title', 'text'], ['dueDate', 'Due Date', 'date'], ['penaltyAmount', 'Penalty Amount', 'number']].map(([k, l, t]) => (
                            <div key={k} className="flex flex-col gap-0.5">
                                <Label className="text-[10px] font-semibold">{l}</Label>
                                <Input type={t} value={(newOb as any)[k] ?? ''} onChange={e => setNewOb(p => ({ ...p, [k]: e.target.value }))} className="px-2 py-1.5 border border-gray-300 rounded-md text-[11px]" aria-label={l} />
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-[10px] font-semibold">Type</Label>
                            <Select value={newOb.obligationType} onValueChange={v => setNewOb(p => ({ ...p, obligationType: v }))}>
                                <SelectTrigger className="px-2 py-1.5 text-[11px]" aria-label="Obligation type"><SelectValue /></SelectTrigger>
                                <SelectContent>{['DELIVERY', 'REPORTING', 'COMPLIANCE', 'INSURANCE', 'PAYMENT', 'SLA', 'AUDIT'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-[10px] font-semibold">Recurrence</Label>
                            <Select value={newOb.recurrence} onValueChange={v => setNewOb(p => ({ ...p, recurrence: v }))}>
                                <SelectTrigger className="px-2 py-1.5 text-[11px]" aria-label="Recurrence"><SelectValue /></SelectTrigger>
                                <SelectContent>{['NONE', 'MONTHLY', 'QUARTERLY', 'ANNUAL'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-1.5 mt-2.5">
                        <button onClick={() => setShowNew(false)} className="px-3 py-1.5 bg-gray-100 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={createMut.isPending || !newOb.contractId || !newOb.title} onClick={() => createMut.mutate(newOb)} className="px-3 py-1.5 bg-blue-700 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-50">Create</button>
                    </div>
                </Card>
            )}

            {/* Filters */}
            <div className="flex gap-1.5 mb-2.5">
                {['', 'Pending', 'InReview', 'Overdue', 'Met', 'Waived'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={cn(`px-3 py-1 border border-gray-200 rounded-lg text-[11px] font-semibold cursor-pointer ${filter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`)}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {/* Obligation list */}
            <div className="flex flex-col gap-1.5">
                {obligations.map(ob => {
                    const cfg = OB_STATUS[ob.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                    const sel = selected?.id === ob.id;
                    return (
                        <Card key={ob.id} onClick={() => setSelected(sel ? null : ob)} className={cn(`px-3.5 py-2.5 cursor-pointer shadow-sm border-l-[4px] ${sel ? 'border-y-blue-700 border-r-blue-700' : ''}`)} style={{ borderLeftColor: cfg.color }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                            <div className="flex justify-between items-start mb-0.5">
                                <div>
                                    <span className="text-[13px] font-bold text-gray-900 dark:text-gray-200">{ob.title}</span>
                                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-semibold">{ob.obligation_type}</span>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: cfg.bg, color: cfg.color }}>{ob.status}</span>
                            </div>
                            <div className="flex gap-4 text-[11px] text-gray-500">
                                <span><Clock  className="inline h-2.5 w-2.5" /> Due: {fmt(ob.due_date)}</span>
                                <span>Supplier: {ob.supplier_id}</span>
                                <span>Contract: {ob.contract_id}</span>
                                {ob.escalation_level > 0 && <span className="text-red-600 font-bold">{ESC_LABELS[ob.escalation_level]}</span>}
                                {ob.penalty_amount && <span className="text-amber-600 font-semibold">{ob.currency_code} {formatNumber(Number(ob.penalty_amount))}</span>}
                            </div>

                            {sel && (
                                <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-200">
                                    {ob.description && <p className="text-xs text-gray-700 mb-2">{ob.description}</p>}
                                    {ob.status === 'Pending' && (
                                        <div className="flex gap-1.5 items-center mb-1.5">
                                            <Input placeholder="Evidence URL" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-[11px]" aria-label="Evidence URL" />
                                            <button disabled={!evidenceUrl} onClick={e => { e.stopPropagation(); evidenceMut.mutate({ id: ob.id, url: evidenceUrl }); }} className="px-2.5 py-1 bg-blue-700 text-white border-none rounded-md text-[11px] cursor-pointer disabled:opacity-50">Submit Evidence</button>
                                        </div>
                                    )}
                                    <div className="flex gap-1.5">
                                        {ob.status === 'InReview' && <>
                                            <button onClick={e => { e.stopPropagation(); reviewMut.mutate({ id: ob.id, decision: 'Met' }); }} className="px-2.5 py-1 bg-green-600 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer flex items-center gap-1"><CheckCircle2 className="h-[11px] w-[11px]"  /> Mark Met</button>
                                            <button onClick={e => { e.stopPropagation(); reviewMut.mutate({ id: ob.id, decision: 'Waived' }); }} className="px-2.5 py-1 bg-gray-500 text-white border-none rounded-md text-[11px] cursor-pointer">Waive</button>
                                        </>}
                                        {ob.status === 'Overdue' && (
                                            <button onClick={e => { e.stopPropagation(); escMut.mutate(ob.id); }} className="px-2.5 py-1 bg-red-600 text-white border-none rounded-md text-[11px] font-semibold cursor-pointer flex items-center gap-1"><ArrowUp className="h-[11px] w-[11px]"  /> Escalate</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
                {obligations.length === 0 && <div className="text-center text-gray-400 py-7">No obligations found</div>}
            </div>
        </StandardPage>
    );
}
