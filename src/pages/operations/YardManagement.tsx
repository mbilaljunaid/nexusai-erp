import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Clock, CheckCircle2 } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";


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

function fmtTime(d: string) { return d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'; }

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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Dock scheduling · Carrier appointments</p>
                </div>
                {tab === 'appointments' && <button onClick={() => setShowNew(true)} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>+ Schedule</button>}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[['Total', docks.length, '#6b7280'], ['Available', docks.filter(d => !d.is_occupied).length, '#059669'], ['Occupied', docks.filter(d => d.is_occupied).length, '#dc2626'], ['Pending Today', appts.filter(a => a.status === 'Scheduled').length, '#1d4ed8']].map(([l, v, c]) => (
                    <div key={l as string} style={{ background: '#fff', border: `1px solid #e5e7eb`, borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 18px', flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>{v}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{l}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {(['docks', 'appointments', 'schedule'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: tab === t ? '#111827' : '#fff', color: tab === t ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {t === 'docks' ? 'Live Dock View' : t === 'appointments' ? 'Appointments' : 'Schedule'}
                    </button>
                ))}
            </div>

            {tab === 'docks' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
                    {docks.map(d => (
                        <div key={d.id} style={{ background: d.is_occupied ? '#fff7f7' : '#f0fdf9', border: `2px solid ${d.is_occupied ? '#fca5a5' : '#6ee7b7'}`, borderRadius: 12, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>Dock {d.dock_number}</span>
                                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: '#f3f4f6', color: '#6b7280' }}>{d.dock_type}</span>
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: d.is_occupied ? '#dc2626' : '#059669', marginBottom: 5 }}>
                                {d.is_occupied ? '● OCCUPIED' : '○ AVAILABLE'}
                            </div>
                            {d.is_occupied && <div style={{ fontSize: 10, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={10} /> {d.current_carrier}</div>}
                            <div style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}><Clock size={10} /> {d.today_appts ?? 0} today</div>
                        </div>
                    ))}
                    {docks.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', padding: 24 }}>No docks configured</div>}
                </div>
            )}

            {tab === 'appointments' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 12 }} aria-label="Date filter" />
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{appts.length} appointments</span>
                    </div>

                    {showNew && (
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Schedule Appointment</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {[['Carrier SCAC', 'carrierScac', 'text'], ['Direction', 'direction', 'select:INBOUND|OUTBOUND'], ['Start Time', 'scheduledStart', 'datetime-local'], ['End Time', 'scheduledEnd', 'datetime-local'], ['PO Reference', 'purchaseOrderRef', 'text']].map(([lbl, key, type]) => (
                                    <div key={key as string} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <label style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>{lbl}</label>
                                        {(type as string).startsWith('select:') ? (
                                            <select style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} value={(form as any)[key as string]} onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))} aria-label={lbl as string}>
                                                {(type as string).slice(7).split('|').map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input type={type as string} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} value={(form as any)[key as string] ?? ''} onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))} aria-label={lbl as string} />
                                        )}
                                    </div>
                                ))}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <label style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>Dock</label>
                                    <select style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} value={form.dockId} onChange={e => setForm(p => ({ ...p, dockId: e.target.value }))} aria-label="Select dock">
                                        <option value="">Select dock…</option>
                                        {docks.map(d => <option key={d.id} value={d.id}>Dock {d.dock_number}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10 }}>
                                <button onClick={() => setShowNew(false)} style={{ padding: '7px 14px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                <button disabled={schedMut.isPending || !form.dockId} onClick={() => schedMut.mutate(form)} style={{ padding: '7px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                    {schedMut.isPending ? 'Scheduling…' : 'Schedule'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {appts.map(a => {
                            const cfg = STATUS_CFG[a.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                            return (
                                <div key={a.id} onClick={() => setSelected(selected?.id === a.id ? null : a)} style={{ background: '#fff', border: `1px solid ${selected?.id === a.id ? '#1d4ed8' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>Dock {a.dock_number}</span>
                                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{a.status}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}><Truck size={10} /> {a.carrier_scac} · {a.direction}</div>
                                    <div style={{ fontSize: 10, color: '#6b7280' }}><Clock size={10} style={{ display: 'inline' }} /> {fmtTime(a.scheduled_start)} – {fmtTime(a.scheduled_end)}</div>

                                    {selected?.id === a.id && (
                                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                            {a.status === 'Scheduled' && <>
                                                <button onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'checkin' }); }} style={{ padding: '5px 10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Check In</button>
                                                <button onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'noshow' }); }} style={{ padding: '5px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>No Show</button>
                                            </>}
                                            {a.status === 'CheckedIn' && <>
                                                <button onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'activity', body: { activity: 'Unloading' } }); }} style={{ padding: '5px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Unloading</button>
                                                <button onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'activity', body: { activity: 'Loading' } }); }} style={{ padding: '5px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Loading</button>
                                            </>}
                                            {(a.status === 'Loading' || a.status === 'Unloading') && (
                                                <button onClick={e => { e.stopPropagation(); actMut.mutate({ id: a.id, action: 'depart' }); }} style={{ padding: '5px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <CheckCircle2 size={11} /> Depart
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {appts.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No appointments for this date</div>}
                    </div>
                </div>
            )}

            {tab === 'schedule' && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, overflowX: 'auto' }}>
                    <div style={{ display: 'flex', gap: 0, minWidth: 700 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 50 }}>
                            <div style={{ height: 32 }} />
                            {Array.from({ length: 14 }, (_, i) => i + 6).map(h => (
                                <div key={h} style={{ height: 40, fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, borderBottom: '1px solid #f3f4f6' }}>{h}:00</div>
                            ))}
                        </div>
                        {docks.slice(0, 8).map(dock => (
                            <div key={dock.id} style={{ display: 'flex', flexDirection: 'column', flex: 1, borderLeft: '1px solid #e5e7eb' }}>
                                <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>#{dock.dock_number}</div>
                                <div style={{ position: 'relative', height: 560, backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #f3f4f6 39px, #f3f4f6 40px)' }}>
                                    {appts.filter(a => a.dock_number === dock.dock_number).map(a => {
                                        const sH = new Date(a.scheduled_start).getHours() + new Date(a.scheduled_start).getMinutes() / 60;
                                        const eH = new Date(a.scheduled_end).getHours() + new Date(a.scheduled_end).getMinutes() / 60;
                                        const cfg = STATUS_CFG[a.status] ?? { bg: '#eff6ff', color: '#1d4ed8' };
                                        return (
                                            <div key={a.id} style={{ position: 'absolute', top: Math.max(0, (sH - 6) * 40), height: Math.max(20, (eH - sH) * 40), left: 2, right: 2, background: cfg.bg, borderLeft: `3px solid ${cfg.color}`, borderRadius: 4, padding: '2px 4px', overflow: 'hidden', fontSize: 9 }}>
                                                <div style={{ fontWeight: 700 }}>{a.carrier_scac}</div>
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
