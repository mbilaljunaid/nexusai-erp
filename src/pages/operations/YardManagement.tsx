import { formatTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Clock, CheckCircle2 } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { DatePicker } from '@/components/ui/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


interface Dock {
    id: string;
    dock_number: string;
    dock_type: string;
    is_occupied: boolean;
    current_carrier: string;
    today_appts: number;
}

interface Appointment {
    id: string;
    dock_number: string;
    carrier_scac: string;
    direction: string;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    purchase_order_ref: string;
}

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
    Scheduled: { bg: '#eff6ff', color: '#1d4ed8' },
    CheckedIn: { bg: '#fef3c7', color: '#d97706' },
    Loading: { bg: '#e0f2fe', color: '#0284c7' },
    Unloading: { bg: '#e0f2fe', color: '#0284c7' },
    Departed: { bg: '#d1fae5', color: '#059669' },
    NoShow: { bg: '#fee2e2', color: '#dc2626' },
};

function fmtTime(d: string) { return d ? formatTime(d) : '—'; }

export default function YardManagement() {
    const [tab, setTab] = useState<'docks' | 'appointments' | 'schedule'>('docks');
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ dockId: '', carrierScac: '', direction: 'INBOUND', scheduledStart: '', scheduledEnd: '', purchaseOrderRef: '' });
    const qc = useQueryClient();
    const wh = 'W01';

    const { data: docks = [] } = useQuery<Dock[]>({ queryKey: ['docks', wh], queryFn: () => fetch(`/api/wms/yard/docks?warehouseId=${wh}`).then(r => r.json()), refetchInterval: 30000 });
    const { data: appts = [] } = useQuery<Appointment[]>({ queryKey: ['appts', wh, date], queryFn: () => fetch(`/api/wms/yard/appointments?warehouseId=${wh}&date=${date}`).then(r => r.json()) });

    const schedMut = useMutation({
        mutationFn: (d: any) => fetch('/api/wms/yard/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, warehouseId: wh }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['appts'] }); setShowNew(false); },
    });

    const actMut = useMutation({
        mutationFn: ({ id, action, body }: { id: string; action: string; body?: any }) =>
            fetch(`/api/wms/yard/appointments/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['appts', 'docks'] }); setSelected(null); },
    });

    return (
        <StandardPage title="Yard Management">
            <div className="flex justify-between mb-4">
                <div>

                    <p className="text-[13px] text-muted-foreground" style={{margin: '4px 0 0'}}>Dock scheduling · Carrier appointments</p>
                </div>
                {tab === 'appointments' && <Button variant="default" onClick={() => setShowNew(true)} >+ Schedule</Button>}
            </div>

            <div className="flex gap-[10px] mb-[14px]">
                {[['Total', docks.length, '#6b7280'], ['Available', docks.filter(d => !d.is_occupied).length, '#059669'], ['Occupied', docks.filter(d => d.is_occupied).length, '#dc2626'], ['Pending Today', appts.filter(a => a.status === 'Scheduled').length, '#1d4ed8']].map(([l, v, c]) => (
                    <div key={l as string} style={{ background: '#fff', border: `1px solid #e5e7eb`, borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 18px', flex: 1 }}>
                        <div className="text-[22px] font-extrabold font-mono">{v}</div>
                        <div className="text-[11px] text-muted-foreground mt-[2px]">{l}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-1 mb-[14px]">
                {(['docks', 'appointments', 'schedule'] as const).map(t => (
                    <Button variant={tab === t ? "default" : "secondary"} size="sm" key={t} onClick={() => setTab(t)}>
                        {t === 'docks' ? 'Live Dock View' : t === 'appointments' ? 'Appointments' : 'Schedule'}
                    </Button>
                ))}
            </div>

            {tab === 'docks' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
                    {docks.map(d => (
                        <div key={d.id} style={{ background: d.is_occupied ? '#fff7f7' : '#f0fdf9', border: `2px solid ${d.is_occupied ? '#fca5a5' : '#6ee7b7'}`, borderRadius: 12, padding: 12 }}>
                            <div className="flex justify-between mb-2">
                                <span className="text-[13px] font-extrabold font-mono">Dock {d.dock_number}</span>
                                <span className="py-[2px] px-[6px] rounded-1 text-[9px] font-bold text-muted-foreground" style={{background: '#f3f4f6'}}>{d.dock_type}</span>
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: d.is_occupied ? '#dc2626' : '#059669', marginBottom: 5 }}>
                                {d.is_occupied ? '● OCCUPIED' : '○ AVAILABLE'}
                            </div>
                            {d.is_occupied && <div className="text-[10px] text-foreground flex items-center gap-1"><Truck className="h-2.5 w-2.5" /> {d.current_carrier}</div>}
                            <div className="text-[10px] text-muted-foreground flex items-center gap-[3px] mt-1"><Clock className="h-2.5 w-2.5" /> {d.today_appts ?? 0} today</div>
                        </div>
                    ))}
                    {docks.length === 0 && <div className="text-center text-muted-foreground p-6" style={{gridColumn: '1/-1'}}>No docks configured</div>}
                </div>
            )}

            {tab === 'appointments' && (
                <div>
                    <div className="flex items-center gap-3 mb-[10px]">
                        <DatePicker value={date} onChange={v => setDate(v)} aria-label="Date filter" />
                        <span className="text-[12px] text-muted-foreground">{appts.length} appointments</span>
                    </div>

                    {showNew && (
                        <div className="bg-card rounded-3 p-[14px] mb-[10px]" style={{border: '1px solid #e5e7eb'}}>
                            <div className="text-[13px] font-bold mb-[10px]">Schedule Appointment</div>
                            <div className="grid gap-2" style={{gridTemplateColumns: '1fr 1fr'}}>
                                {[['Carrier SCAC', 'carrierScac', 'text'], ['Direction', 'direction', 'select:INBOUND|OUTBOUND'], ['Start Time', 'scheduledStart', 'datetime-local'], ['End Time', 'scheduledEnd', 'datetime-local'], ['PO Reference', 'purchaseOrderRef', 'text']].map(([lbl, key, type]) => (
                                    <div key={key as string} className="flex flex-col gap-[3px]">
                                        <Label className="text-[10px] font-semibold text-foreground">{lbl}</Label>
                                        {(type as string).startsWith('select:') ? (
                                            <Select value={(form as any)[key as string]} onValueChange={v => setForm(p => ({ ...p, [key as string]: v }))}>
                                                <SelectTrigger className="py-[6px] px-[8px] rounded-[6px] text-[11px]" style={{border: '1px solid #d1d5db'}} aria-label={lbl as string}><SelectValue /></SelectTrigger>
                                                <SelectContent>{(type as string).slice(7).split('|').map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                            </Select>
                                        ) : (
                                            <Input type={type as string} className="py-[6px] px-[8px] rounded-[6px] text-[11px]" style={{border: '1px solid #d1d5db'}} value={(form as any)[key as string] ?? ''} onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))} aria-label={lbl as string} />
                                        )}
                                    </div>
                                ))}
                                <div className="flex flex-col gap-[3px]">
                                    <Label className="text-[10px] font-semibold text-foreground">Dock</Label>
                                    <Select value={form.dockId} onValueChange={v => setForm(p => ({ ...p, dockId: v }))}>
                                        <SelectTrigger className="py-[6px] px-[8px] rounded-[6px] text-[11px]" style={{border: '1px solid #d1d5db'}} aria-label="Select dock"><SelectValue placeholder="Select dock…" /></SelectTrigger>
                                        <SelectContent>
                                            {docks.map(d => <SelectItem key={d.id} value={d.id}>Dock {d.dock_number}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-[6px] mt-[10px]">
                                <Button variant="secondary" size="sm" onClick={() => setShowNew(false)} >Cancel</Button>
                                <Button variant="default" size="sm" disabled={schedMut.isPending || !form.dockId} onClick={() => schedMut.mutate(form)} >
                                    {schedMut.isPending ? 'Scheduling…' : 'Schedule'}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-[6px]">
                        {appts.map(a => {
                            const cfg = STATUS_CFG[a.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                            return (
                                <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelected(selected?.id === a.id ? null : a)}>
                                <div key={a.id} style={{ background: '#fff', border: `1px solid ${selected?.id === a.id ? '#1d4ed8' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                                                                    <div className="flex justify-between mb-[3px]">
                                                                        <span className="text-[12px] font-bold font-mono">Dock {a.dock_number}</span>
                                                                        <span className="py-[2px] px-[6px] rounded-1 text-[9px] font-bold" style={{background: cfg.bg, color: cfg.color}}>{a.status}</span>
                                                                    </div>
                                                                    <div className="text-[11px] text-foreground flex items-center gap-1 mb-[2px]"><Truck className="h-2.5 w-2.5" /> {a.carrier_scac} · {a.direction}</div>
                                                                    <div className="text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" style={{ display: 'inline' }} /> {fmtTime(a.scheduled_start)} – {fmtTime(a.scheduled_end)}</div>

                                                                    {selected?.id === a.id && (
                                                                        <div className="flex gap-[6px] mt-2" style={{flexWrap: 'wrap'}}>
                                                                            {a.status === 'Scheduled' && <>
                                                                                <Button variant="default" size="sm" onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'checkin' }); }} >Check In</Button>
                                                                                <Button variant="destructive" size="sm" onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'noshow' }); }} >No Show</Button>
                                                                            </>}
                                                                            {a.status === 'CheckedIn' && <>
                                                                                <Button variant="default" size="sm" onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'activity', body: { activity: 'Unloading' } }); }} >Unloading</Button>
                                                                                <Button variant="default" size="sm" onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'activity', body: { activity: 'Loading' } }); }} >Loading</Button>
                                                                            </>}
                                                                            {(a.status === 'Loading' || a.status === 'Unloading') && (
                                                                                <Button variant="default" size="sm" onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'depart' }); }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                                    <CheckCircle2 className="h-[11px] w-[11px]" /> Depart
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                </Button>
                            );
                        })}
                        {appts.length === 0 && <div className="text-center text-muted-foreground p-6">No appointments for this date</div>}
                    </div>
                </div>
            )}

            {tab === 'schedule' && (
                <div className="bg-card rounded-3 p-4 overflow-x-auto" style={{border: '1px solid #e5e7eb'}}>
                    <div className="flex gap-0" style={{minWidth: 700}}>
                        <div className="flex flex-col" style={{minWidth: 50}}>
                            <div className="h-8" />
                            {Array.from({ length: 14 }, (_, i) => i + 6).map(h => (
                                <div key={h} className="text-[10px] text-muted-foreground flex items-center justify-end" style={{height: 40, paddingRight: 6, borderBottom: '1px solid #f3f4f6'}}>{h}:00</div>
                            ))}
                        </div>
                        {docks.slice(0, 8).map(dock => (
                            <div key={dock.id} className="flex flex-col" style={{flex: 1, borderLeft: '1px solid #e5e7eb'}}>
                                <div className="flex items-center justify-center text-[11px] font-bold" style={{height: 32, background: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>#{dock.dock_number}</div>
                                <div style={{ position: 'relative', height: 560, backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #f3f4f6 39px, #f3f4f6 40px)' }}>
                                    {appts.filter(a => a.dock_number === dock.dock_number).map(a => {
                                        const sH = new Date(a.scheduled_start).getHours() + new Date(a.scheduled_start).getMinutes() / 60;
                                        const eH = new Date(a.scheduled_end).getHours() + new Date(a.scheduled_end).getMinutes() / 60;
                                        const cfg = STATUS_CFG[a.status] ?? { bg: '#eff6ff', color: '#1d4ed8' };
                                        return (
                                            <div key={a.id} style={{ position: 'absolute', top: Math.max(0, (sH - 6) * 40), height: Math.max(20, (eH - sH) * 40), left: 2, right: 2, background: cfg.bg, borderLeft: `3px solid ${cfg.color}`, borderRadius: 4, padding: '2px 4px', overflow: 'hidden', fontSize: 9 }}>
                                                <div className="font-bold">{a.carrier_scac}</div>
                                                <div style={{ opacity: 0.8 }}>{fmtTime(a.scheduled_start)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </StandardPage>
    );
}
