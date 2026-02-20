import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, AlertTriangle, Package, Zap, TrendingUp } from 'lucide-react';

interface Shipment {
    id: string;
    pro_number: string;
    tracking_number: string;
    carrier_scac: string;
    current_status: string;
    current_city: string;
    current_state: string;
    eta: string;
    origin_city: string;
    dest_city: string;
    edi_214_count: number;
    last_event_at: string;
}

interface TrackingEvent {
    id: string;
    event_code: string;
    event_description: string;
    event_city: string;
    event_state: string;
    event_time: string;
}

interface PerformanceRow {
    carrier_scac: string;
    total_shipments: number;
    delivered: number;
    exceptions: number;
    on_time_pct: number;
}

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
    Tendered: { bg: '#f3f4f6', color: '#6b7280' },
    PickedUp: { bg: '#eff6ff', color: '#1d4ed8' },
    InTransit: { bg: '#e0f2fe', color: '#0284c7' },
    OutForDelivery: { bg: '#fef3c7', color: '#d97706' },
    Delivered: { bg: '#d1fae5', color: '#059669' },
    Exception: { bg: '#fee2e2', color: '#dc2626' },
};

export default function ShipmentTracking() {
    const [activeTab, setActiveTab] = useState<'shipments' | 'performance' | 'mode'>('shipments');
    const [selected, setSelected] = useState<Shipment | null>(null);
    const [eventForm, setEventForm] = useState({ shipmentId: '', proNumber: '', eventCode: 'X6', eventCity: '', eventState: '', eventDescription: '' });
    const [modeForm, setModeForm] = useState({ originZip: '', destZip: '', weightLbs: 5000, requiredTransitDays: 5 });
    const qc = useQueryClient();

    const { data: shipments = [] } = useQuery<Shipment[]>({
        queryKey: ['shipments'],
        queryFn: () => fetch('/api/logistics/shipments').then(r => r.json()),
    });

    const { data: selectedDetail } = useQuery<{ shipment: Shipment; events: TrackingEvent[] }>({
        queryKey: ['shipment-detail', selected?.id],
        queryFn: () => fetch(`/api/logistics/shipments/${selected!.id}`).then(r => r.json()),
        enabled: !!selected,
    });

    const { data: performance = [] } = useQuery<PerformanceRow[]>({
        queryKey: ['carrier-performance'],
        queryFn: () => fetch('/api/logistics/shipments/performance').then(r => r.json()),
        enabled: activeTab === 'performance',
    });

    const eventMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/logistics/shipments/edi214', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments', 'shipment-detail'] }); },
    });

    const [modeResult, setModeResult] = useState<any>(null);
    const modeMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/logistics/mode-optimizer/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: setModeResult,
    });

    const inTransit = shipments.filter(s => s.current_status === 'InTransit').length;
    const exceptions = shipments.filter(s => s.current_status === 'Exception').length;
    const delivered = shipments.filter(s => s.current_status === 'Delivered').length;

    return (
        <div className="st-container">
            <div className="st-header">
                <div>
                    <h1 className="st-title">Shipment Tracking</h1>
                    <p className="st-sub">Real-time carrier visibility · EDI 214 · Mode Optimizer</p>
                </div>
            </div>

            <div className="st-kpis">
                <div className="kpc total"><div className="kpv">{shipments.length}</div><div className="kpl">Total</div></div>
                <div className="kpc transit"><div className="kpv">{inTransit}</div><div className="kpl">In Transit</div></div>
                <div className="kpc deliv"><div className="kpv">{delivered}</div><div className="kpl">Delivered</div></div>
                <div className="kpc exc"><div className="kpv">{exceptions}</div><div className="kpl">Exceptions</div></div>
            </div>

            <div className="tab-bar">
                {(['shipments', 'performance', 'mode'] as const).map(t => (
                    <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} aria-pressed={activeTab === t}>
                        {t === 'shipments' && <Package size={12} />}
                        {t === 'performance' && <TrendingUp size={12} />}
                        {t === 'mode' && <Zap size={12} />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'shipments' && (
                <div className="ships-layout">
                    <div className="ships-left">
                        {/* EDI 214 Event Entry */}
                        <div className="edi-form">
                            <div className="ef-title">Log EDI 214 Event</div>
                            <div className="ef-row">
                                <input className="ei" placeholder="PRO# or Tracking#" value={eventForm.proNumber} onChange={e => setEventForm(p => ({ ...p, proNumber: e.target.value }))} aria-label="PRO number" />
                                <select className="ei" value={eventForm.eventCode} onChange={e => setEventForm(p => ({ ...p, eventCode: e.target.value }))} aria-label="Event code">
                                    <option value="A9">A9 = Tendered</option>
                                    <option value="X3">X3 = Picked Up</option>
                                    <option value="X6">X6 = In Transit</option>
                                    <option value="X1">X1 = Out for Delivery</option>
                                    <option value="D1">D1 = Delivered</option>
                                    <option value="AF">AF = Exception</option>
                                </select>
                            </div>
                            <div className="ef-row">
                                <input className="ei" placeholder="City" value={eventForm.eventCity} onChange={e => setEventForm(p => ({ ...p, eventCity: e.target.value }))} aria-label="Event city" />
                                <input className="ei" placeholder="State" value={eventForm.eventState} onChange={e => setEventForm(p => ({ ...p, eventState: e.target.value }))} aria-label="Event state" />
                            </div>
                            <button className="ef-btn" disabled={!eventForm.proNumber || eventMutation.isPending}
                                onClick={() => eventMutation.mutate({ ...eventForm, shipmentId: selected?.id })} aria-label="Submit EDI event">
                                {eventMutation.isPending ? 'Submitting…' : 'Submit EDI 214'}
                            </button>
                        </div>

                        {/* Shipment list */}
                        {shipments.map(s => {
                            const cfg = STATUS_CFG[s.current_status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                            return (
                                <div key={s.id} className={`ship-card ${selected?.id === s.id ? 'selected' : ''}`} onClick={() => setSelected(s)}>
                                    <div className="sc-top">
                                        <span className="sc-pro">{s.pro_number || s.tracking_number || s.id.slice(0, 8)}</span>
                                        <span className="sc-status" style={{ background: cfg.bg, color: cfg.color }}>{s.current_status}</span>
                                    </div>
                                    <div className="sc-route"><MapPin size={10} /> {s.origin_city ?? '?'} → {s.dest_city ?? '?'}</div>
                                    <div className="sc-meta">{s.carrier_scac} · {s.edi_214_count} updates</div>
                                    {s.current_status === 'Exception' && <div className="sc-exc"><AlertTriangle size={10} /> Exception</div>}
                                </div>
                            );
                        })}
                        {shipments.length === 0 && <div className="empty">No shipments</div>}
                    </div>

                    <div className="ships-right">
                        {selectedDetail ? (
                            <>
                                <div className="sd-header">
                                    <div className="sd-pro">{selectedDetail.shipment.pro_number || selectedDetail.shipment.id}</div>
                                    <div className="sd-carr">{selectedDetail.shipment.carrier_scac}</div>
                                </div>
                                {selectedDetail.shipment.current_city && (
                                    <div className="location-badge">
                                        <MapPin size={12} /> Currently in {selectedDetail.shipment.current_city}, {selectedDetail.shipment.current_state}
                                    </div>
                                )}
                                <div className="timeline">
                                    {selectedDetail.events.map((e, i) => (
                                        <div key={e.id} className={`tl-item ${i === 0 ? 'current' : ''}`}>
                                            <div className="tl-dot" />
                                            <div className="tl-content">
                                                <div className="tl-code"><span className="code-badge">{e.event_code}</span> {e.event_description}</div>
                                                <div className="tl-loc">{e.event_city && `${e.event_city}, ${e.event_state}`}</div>
                                                <div className="tl-time">{new Date(e.event_time).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedDetail.events.length === 0 && <div className="empty">No tracking events yet</div>}
                                </div>
                            </>
                        ) : <div className="no-sel">Select a shipment to view tracking</div>}
                    </div>
                </div>
            )}

            {activeTab === 'performance' && (
                <div className="perf-panel">
                    <table className="perf-table">
                        <thead><tr><th>Carrier SCAC</th><th>Total</th><th>Delivered</th><th>Exceptions</th><th>On-Time %</th><th>Score</th></tr></thead>
                        <tbody>
                            {performance.map(p => (
                                <tr key={p.carrier_scac} className="perf-row">
                                    <td className="mono bold">{p.carrier_scac}</td>
                                    <td className="mono">{p.total_shipments}</td>
                                    <td className="mono green">{p.delivered}</td>
                                    <td className="mono red">{p.exceptions}</td>
                                    <td className="mono"><strong>{Number(p.on_time_pct).toFixed(1)}%</strong></td>
                                    <td>
                                        <div className="perf-bar-bg">
                                            <div className="perf-bar" style={{ width: `${p.on_time_pct}%`, background: Number(p.on_time_pct) >= 95 ? '#059669' : Number(p.on_time_pct) >= 85 ? '#d97706' : '#dc2626' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {performance.length === 0 && <tr><td colSpan={6} className="empty">No performance data</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'mode' && (
                <div className="mode-panel">
                    <h3 className="mp-title">Transport Mode Optimizer</h3>
                    <div className="mode-form">
                        {[['originZip', 'Origin ZIP', 'text'], ['destZip', 'Destination ZIP', 'text'], ['weightLbs', 'Weight (lbs)', 'number'], ['requiredTransitDays', 'Max Transit Days', 'number']].map(([k, label, t]) => (
                            <div key={k} className="mff">
                                <label className="mfl">{label}</label>
                                <input className="mfi" type={t as string} value={(modeForm as any)[k as string]} onChange={e => setModeForm(p => ({ ...p, [k as string]: t === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))} aria-label={label as string} />
                            </div>
                        ))}
                        <button className="opt-btn" disabled={modeMutation.isPending || !modeForm.originZip || !modeForm.destZip}
                            onClick={() => modeMutation.mutate(modeForm)} aria-label="Optimize mode">
                            <Zap size={13} /> {modeMutation.isPending ? 'Optimizing…' : 'Optimize'}
                        </button>
                    </div>
                    {modeResult && (
                        <div className="mode-results">
                            <div className="mr-rec">
                                <div className="mr-rec-label">Recommended</div>
                                <div className="mr-rec-mode">{modeResult.recommended?.mode}</div>
                                <div className="mr-rec-sub">${modeResult.recommended?.cost?.toFixed(2)} · {modeResult.recommended?.transitDays}d · {modeResult.recommended?.co2Kg?.toFixed(1)}kg CO₂</div>
                            </div>
                            <table className="opt-table">
                                <thead><tr><th>Mode</th><th>Cost</th><th>Transit</th><th>CO₂ (kg)</th><th>Score</th></tr></thead>
                                <tbody>
                                    {modeResult.options?.map((o: any) => (
                                        <tr key={o.mode} className={o.mode === modeResult.recommended?.mode ? 'opt-rec' : ''}>
                                            <td className="mono bold">{o.mode}</td>
                                            <td className="mono">${o.cost?.toFixed(2)}</td>
                                            <td>{o.transitDays}d</td>
                                            <td>{o.co2Kg?.toFixed(1)}</td>
                                            <td><strong>{(o.score * 100).toFixed(0)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .st-container { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .st-header { margin-bottom: 16px; }
                .st-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .st-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .st-kpis { display: flex; gap: 10px; margin-bottom: 14px; }
                .kpc { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 18px; flex: 1; }
                .kpc.total { border-left: 4px solid #6b7280; } .kpc.transit { border-left: 4px solid #0284c7; } .kpc.deliv { border-left: 4px solid #059669; } .kpc.exc { border-left: 4px solid #dc2626; }
                .kpv { font-size: 22px; font-weight: 800; font-family: monospace; color: #111827; }
                .kpl { font-size: 11px; color: #9ca3af; margin-top: 2px; }
                .tab-bar { display: flex; gap: 4px; margin-bottom: 14px; }
                .tab-btn { display: flex; align-items: center; gap: 5px; padding: 7px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; color: #6b7280; }
                .tab-btn.active { background: #111827; color: #fff; border-color: #111827; }
                .ships-layout { display: grid; grid-template-columns: 300px 1fr; gap: 14px; }
                .ships-left { display: flex; flex-direction: column; gap: 6px; }
                .edi-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
                .ef-title { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px; }
                .ef-row { display: flex; gap: 6px; margin-bottom: 6px; }
                .ei { flex: 1; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 11px; }
                .ef-btn { width: 100%; padding: 7px; background: #1d4ed8; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; margin-top: 2px; }
                .ef-btn:disabled { background: #9ca3af; }
                .ship-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; cursor: pointer; }
                .ship-card.selected { border-color: #1d4ed8; background: #eff6ff; }
                .ship-card:hover { background: #f9fafb; }
                .sc-top { display: flex; justify-content: space-between; margin-bottom: 3px; }
                .sc-pro { font-size: 11px; font-weight: 700; font-family: monospace; }
                .sc-status { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
                .sc-route { font-size: 10px; color: #6b7280; display: flex; align-items: center; gap: 3px; margin-bottom: 3px; }
                .sc-meta { font-size: 10px; color: #9ca3af; }
                .sc-exc { display: flex; align-items: center; gap: 3px; font-size: 10px; color: #dc2626; font-weight: 700; margin-top: 2px; }
                .empty { text-align: center; color: #9ca3af; font-size: 12px; padding: 16px; }
                .ships-right { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
                .sd-header { margin-bottom: 10px; }
                .sd-pro { font-size: 16px; font-weight: 800; font-family: monospace; color: #111827; }
                .sd-carr { font-size: 12px; color: #6b7280; }
                .location-badge { display: flex; align-items: center; gap: 6px; background: #eff6ff; color: #1d4ed8; padding: 6px 10px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; }
                .timeline { border-left: 2px solid #e5e7eb; padding-left: 16px; }
                .tl-item { position: relative; margin-bottom: 12px; }
                .tl-item.current .tl-dot { background: #1d4ed8; }
                .tl-dot { position: absolute; left: -21px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #d1d5db; }
                .tl-code { font-size: 12px; font-weight: 600; color: #111827; }
                .code-badge { background: #111827; color: #fff; padding: 1px 5px; border-radius: 3px; font-size: 10px; font-family: monospace; }
                .tl-loc { font-size: 11px; color: #6b7280; }
                .tl-time { font-size: 10px; color: #9ca3af; }
                .no-sel { display: flex; align-items: center; justify-content: center; height: 200px; color: #9ca3af; font-size: 14px; }
                .perf-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .perf-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .perf-table th { padding: 8px 14px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .perf-row:hover { background: #f9fafb; }
                .perf-table td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; }
                .perf-bar-bg { background: #f3f4f6; border-radius: 4px; height: 6px; width: 100px; }
                .perf-bar { height: 6px; border-radius: 4px; transition: width 0.3s ease; }
                .mono { font-family: monospace; } .bold { font-weight: 700; }
                .green { color: #059669; } .red { color: #dc2626; }
                .mode-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .mp-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; }
                .mode-form { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
                .mff { display: flex; flex-direction: column; gap: 4px; }
                .mfl { font-size: 11px; font-weight: 600; color: #374151; }
                .mfi { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .opt-btn { grid-column: span 2; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .opt-btn:disabled { background: #9ca3af; }
                .mode-results { }
                .mr-rec { background: linear-gradient(135deg, #d1fae5, #eff6ff); border-radius: 10px; padding: 14px; margin-bottom: 12px; }
                .mr-rec-label { font-size: 11px; color: #059669; font-weight: 700; }
                .mr-rec-mode { font-size: 24px; font-weight: 900; color: #111827; font-family: monospace; margin: 2px 0; }
                .mr-rec-sub { font-size: 12px; color: #374151; }
                .opt-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .opt-table th { padding: 6px 10px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .opt-table td { padding: 6px 10px; border-bottom: 1px solid #f3f4f6; }
                .opt-rec { background: #f0fdf4; font-weight: 600; }
            `}</style>
        </div>
    );
}
