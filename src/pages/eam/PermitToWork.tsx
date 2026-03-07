import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HardHat, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Permit { id: string; permit_number: string; permit_type: string; asset_id: string; location: string; description: string; status: string; requested_by: string; approved_by: string; contractor: string; start_datetime: string; end_datetime: string; events: PEvent[]; }
interface PEvent { at: string; by: string; action: string; note: string; }
interface CBMAlert { asset_id: string; parameter_name: string; reading_value: number; reading_at: string; }

const STATUS_CLR: Record<string, string> = { Draft: '#9ca3af', Pending_Approval: '#d97706', Approved: '#1d4ed8', Active: '#059669', Suspended: '#f59e0b', Closed: '#6b7280', Cancelled: '#dc2626' };
const TYPE_CLR: Record<string, string> = { HOT_WORK: '#dc2626', COLD_WORK: '#3b82f6', CONFINED_SPACE: '#d97706', ELECTRICAL: '#7c3aed', HEIGHT: '#f59e0b', EXCAVATION: '#6b7280', RADIATION: '#dc2626' };
const ACTIONS: Record<string, string[]> = {
    Pending_Approval: ['APPROVE', 'CANCEL'],
    Approved: ['ISSUE', 'CANCEL'],
    Active: ['SUSPEND', 'CLOSE'],
    Suspended: ['RESUME', 'CLOSE'],
};

export default function PermitToWork() {
    const [selected, setSelected] = useState<Permit | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ permitType: 'COLD_WORK', assetId: '', location: '', description: '', requestedBy: '', contractor: '', startDatetime: '', endDatetime: '' });
    const qc = useQueryClient();

    const { data: permits = [] } = useQuery<Permit[]>({ queryKey: ['permits', statusFilter], queryFn: () => fetch(`/api/eam/permits${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: expiring = [] } = useQuery<Permit[]>({ queryKey: ['permits-expiring'], queryFn: () => fetch('/api/eam/permits/expiring?hours=24').then(r => r.json()) });
    const { data: cbmAlerts = [] } = useQuery<CBMAlert[]>({ queryKey: ['cbm-alerts'], queryFn: () => fetch('/api/eam/cbm/alerts').then(r => r.json()) });

    const createMut = useMutation({ mutationFn: (d: any) => fetch('/api/eam/permits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ['permits'] }); setShowNew(false); } });
    const transitionMut = useMutation({ mutationFn: ({ id, action }: any) => fetch(`/api/eam/permits/${id}/transition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor: 'current-user', action }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['permits'] }) });

    const active = permits.filter(p => p.status === 'Active').length;
    const pending = permits.filter(p => p.status === 'Pending_Approval').length;

    const hoursLeft = (p: Permit) => {
        if (!p.end_datetime) return null;
        const h = Math.round((new Date(p.end_datetime).getTime() - Date.now()) / 3600000);
        return h;
    };

    return (
        <StandardPage title="Permit-to-Work">
            <div className="flex justify-between mb-4 items-start">
                <div>
                    <p className="text-sm text-muted-foreground mt-1">Hazardous work permits · Safety lifecycle · CBM alerts</p>
                </div>
                <button onClick={() => setShowNew(true)} className="px-3.5 py-1.5 bg-red-600 text-white border-none rounded-lg text-[11px] font-bold cursor-pointer">+ New Permit</button>
            </div>

            {/* KPI row */}
            <div className="flex gap-2.5 mb-3.5">
                {[{ lbl: 'Active', val: active, clr: '#059669' }, { lbl: 'Pending Approval', val: pending, clr: '#d97706' }, { lbl: 'Expiring 24h', val: expiring.length, clr: '#f59e0b' }, { lbl: 'CBM Alerts', val: cbmAlerts.length, clr: '#dc2626' }].map(k => (
                    <Card key={k.lbl} className="px-4 py-2.5 min-w-24 shadow-sm">
                        <div className="text-xl font-extrabold" style={{ color: k.clr }}>{k.val}</div>
                        <div className="text-[10px] text-gray-400">{k.lbl}</div>
                    </Card>
                ))}
            </div>

            {/* Expiring alert banner */}
            {expiring.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-300 rounded-lg px-3 py-2 mb-2.5 flex items-center gap-2 text-[11px]">
                    <Clock size={12} color="#d97706" />
                    <strong>{expiring.length} permit(s) expiring within 24 hours:</strong> {expiring.map(p => p.permit_number).join(', ')}
                </div>
            )}

            {/* CBM alerts */}
            {cbmAlerts.length > 0 && (
                <div className="bg-red-500/10 border border-red-300 rounded-lg px-3 py-2 mb-2.5 flex gap-3 flex-wrap text-[10px]">
                    <AlertTriangle size={12} color="#dc2626" className="shrink-0" />
                    {cbmAlerts.map((a, i) => <span key={i} className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{a.asset_id} · {a.parameter_name}: {Number(a.reading_value).toFixed(2)}</span>)}
                </div>
            )}

            {showNew && (
                <Card className="p-3.5 mb-3 bg-slate-500/10 shadow-sm border-gray-200">
                    <div className="font-bold text-xs mb-2">Create Permit</div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-[10px] font-bold">Type</Label>
                            <Select value={form.permitType} onValueChange={v => setForm(p => ({ ...p, permitType: v }))}>
                                <SelectTrigger className="px-2 py-1.5 text-xs h-auto" aria-label="Type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['COLD_WORK', 'HOT_WORK', 'CONFINED_SPACE', 'ELECTRICAL', 'HEIGHT', 'EXCAVATION', 'RADIATION'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {[['Asset ID', 'assetId', 'text'], ['Location', 'location', 'text'], ['Requested By', 'requestedBy', 'text'], ['Contractor', 'contractor', 'text'], ['Start', 'startDatetime', 'datetime-local'], ['End', 'endDatetime', 'datetime-local']].map(([lbl, key, type]) => (
                            <div key={key} className="flex flex-col gap-0.5">
                                <Label className="text-[10px] font-bold">{lbl}</Label>
                                <Input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="px-2 py-1.5 text-[11px] h-auto" aria-label={lbl} />
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <Label className="text-[10px] font-bold">Description</Label>
                            <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="px-2 py-1.5 text-[11px] h-auto" aria-label="Description" />
                        </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                        <button onClick={() => setShowNew(false)} className="px-3 py-1 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={!form.requestedBy} onClick={() => createMut.mutate(form)} className="px-3 py-1 bg-red-600 text-white border-none rounded-md text-[11px] font-bold cursor-pointer disabled:opacity-50">Create</button>
                    </div>
                </Card>
            )}

            <div className="flex gap-1.5 mb-2.5">
                {['', 'Pending_Approval', 'Approved', 'Active', 'Suspended', 'Closed', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={cn(`px-2.5 py-1 border border-gray-200 rounded-md text-[10px] font-semibold cursor-pointer ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`)}>{s || 'All'}</button>
                ))}
            </div>

            <div className="flex gap-3.5">
                <div className="flex-1">
                    {permits.map(p => {
                        const clr = STATUS_CLR[p.status] ?? '#6b7280';
                        const tclr = TYPE_CLR[p.permit_type] ?? '#6b7280';
                        const hrs = hoursLeft(p);
                        return (
                            <Card key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)} className="px-3.5 py-2.5 mb-1.5 cursor-pointer shadow-sm relative overflow-hidden" style={{ border: `1px solid ${selected?.id === p.id ? '#dc2626' : '#e5e7eb'}` }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: tclr }}></div>
                                <div className="flex justify-between mb-0.5">
                                    <div className="flex gap-1.5 items-center">
                                        <HardHat size={12} color={tclr} />
                                        <span className="font-bold text-[13px]">{p.permit_number}</span>
                                        <span className="text-[9px] px-1 py-px rounded font-bold" style={{ background: tclr + '18', color: tclr }}>{p.permit_type.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: clr + '18', color: clr }}>{p.status}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mb-0.5">{p.description ?? '—'} · Asset: {p.asset_id ?? '—'} · {p.location ?? '—'}</div>
                                <div className="text-[9px] text-gray-400">By: {p.requested_by} {p.contractor ? `· Contractor: ${p.contractor}` : ''} {hrs !== null && p.status === 'Active' ? `· ${hrs}h remaining` : ''}</div>
                                {(ACTIONS[p.status] ?? []).length > 0 && (
                                    <div className="flex gap-1 mt-1.5">
                                        {(ACTIONS[p.status] ?? []).map(a => <button key={a} onClick={ev => { ev.stopPropagation(); transitionMut.mutate({ id: p.id, action: a }); }} className={cn(`px-1.5 py-px border-none rounded text-[9px] cursor-pointer font-bold ${a === 'APPROVE' || a === 'RESUME' || a === 'ISSUE' ? 'bg-blue-500/10 text-blue-700' : 'bg-red-500/10 text-red-600'}`)}>{a}</button>)}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                    {permits.length === 0 && <div className="text-center text-gray-400 p-8 bg-white rounded-xl">No permits</div>}
                </div>

                {selected && (
                    <Card className="w-64 shrink-0 p-3.5 shadow-sm">
                        <div className="font-bold text-[13px] mb-2">{selected.permit_number}</div>
                        <div className="text-[10px] leading-[1.8] text-gray-700">
                            <strong>Type:</strong> {selected.permit_type}<br />
                            <strong>Asset:</strong> {selected.asset_id ?? '—'}<br />
                            <strong>Location:</strong> {selected.location ?? '—'}<br />
                            <strong>Contractor:</strong> {selected.contractor ?? '—'}<br />
                            <strong>Start:</strong> {selected.start_datetime ? formatDateTime(selected.start_datetime) : '—'}<br />
                            <strong>End:</strong> {selected.end_datetime ? formatDateTime(selected.end_datetime) : '—'}
                        </div>
                        <div className="mt-2.5 text-[11px] font-bold mb-1.5">Event Log</div>
                        <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                            {(selected.events ?? []).map((ev, i) => (
                                <div key={i} className="text-[9px] border-l-2 border-gray-200 pl-1.5">
                                    <div className="font-bold text-gray-500">{ev.action} · {ev.by}</div>
                                    <div className="text-gray-700">{ev.note}</div>
                                    <div className="text-gray-400">{formatDateTime(ev.at)}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
