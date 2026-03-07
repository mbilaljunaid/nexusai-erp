import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Send, CheckCircle2, XCircle, Plus, FileCode } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber } from '@/lib/formatters';
import { Button } from "@/components/ui/button";


interface LoadTender {
    id: string;
    tender_number: string;
    carrier_scac: string;
    origin_city: string;
    origin_state: string;
    dest_city: string;
    dest_state: string;
    pickup_date: string;
    equipment_type: string;
    weight_lbs: number;
    freight_charge: number;
    currency_code: string;
    status: string;
    carrier_response: string;
    edi_204_sent: boolean;
    edi_990_received: boolean;
}

const STATUS_CFG: Record<string, { bg: string; color: string; icon?: React.ReactNode }> = {
    Draft: { bg: '#f3f4f6', color: '#6b7280' },
    Sent: { bg: '#eff6ff', color: '#1d4ed8' },
    Accepted: { bg: '#d1fae5', color: '#059669' },
    Declined: { bg: '#fee2e2', color: '#dc2626' },
    Conditional: { bg: '#fef3c7', color: '#d97706' },
    Cancelled: { bg: '#fee2e2', color: '#9ca3af' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

export default function LoadTenderWorkbench() {
    const [selected, setSelected] = useState<LoadTender | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [edi204, setEdi204] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [newForm, setNewForm] = useState({
        carrierId: '', originCity: '', originState: '', destCity: '', destState: '',
        pickupDate: new Date().toISOString().slice(0, 10), equipmentType: 'TL',
        weightLbs: 20000, palletCount: 20, freightCharge: 2500, referenceNumber: ''
    });
    const qc = useQueryClient();

    const { data: tenders = [] } = useQuery<LoadTender[]>({
        queryKey: ['tenders', statusFilter],
        queryFn: () => fetch(`/api/logistics/tenders${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/logistics/tenders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, origin: { city: data.originCity, state: data.originState }, destination: { city: data.destCity, state: data.destState }, carrierId: data.carrierId }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenders'] }); setShowNew(false); },
    });

    const sendMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/logistics/tenders/${id}/send`, { method: 'POST' }).then(r => r.json()),
        onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['tenders'] }); setEdi204(data.edi204 || ''); },
    });

    const responseMutation = useMutation({
        mutationFn: ({ id, response }: { id: string; response: string }) =>
            fetch(`/api/logistics/tenders/${id}/edi990`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carrierResponse: response }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tenders'] }),
    });

    const totalAccepted = tenders.filter(t => t.status === 'Accepted').reduce((s, t) => s + Number(t.freight_charge ?? 0), 0);

    return (
        <StandardPage title="Load Tender Workbench">
            <div className="ltw-header">
                <div>

                    <p className="ltw-sub">EDI 204 Load Tender / EDI 990 Response management</p>
                </div>
                <Button variant="default" className="add-btn" onClick={() => setShowNew(true)} aria-label="New tender"><Plus className="h-[13px] w-[13px]"  /> New Tender</Button>
            </div>

            <div className="kpis">
                {[
                    { label: 'Total', val: tenders.length, cls: 'blue' },
                    { label: 'Accepted', val: tenders.filter(t => t.status === 'Accepted').length, cls: 'green' },
                    { label: 'Declined', val: tenders.filter(t => t.status === 'Declined').length, cls: 'red' },
                    { label: 'Freight Value', val: fmt(totalAccepted), cls: 'purple' },
                ].map(k => (
                    <div key={k.label} className={cn(`kpi-card ${k.cls}`)}><div className="kv">{k.val}</div><div className="kl">{k.label}</div></div>
                ))}
            </div>

            <div className="filter-row">
                {['', 'Draft', 'Sent', 'Accepted', 'Declined', 'Cancelled'].map(s => (
                    <Button variant="default" key={s} className={cn(`fp ${statusFilter === s ? 'active' : ''}`)} onClick={() => setStatusFilter(s)}>{s || 'All'}</Button>
                ))}
            </div>

            <div className="ltw-layout">
                <div className="ltw-list">
                    {showNew && (
                        <div className="new-form">
                            <div className="nf-t">New Load Tender</div>
                            <div className="nf-g">
                                {[['carrierId', 'Carrier SCAC', 'text'], ['referenceNumber', 'Reference #', 'text'], ['originCity', 'Origin City', 'text'], ['originState', 'Origin State', 'text'], ['destCity', 'Dest City', 'text'], ['destState', 'Dest State', 'text'], ['pickupDate', 'Pickup Date', 'date'], ['weightLbs', 'Weight (lbs)', 'number'], ['palletCount', '# Pallets', 'number'], ['freightCharge', 'Freight $', 'number']].map(([k, label, t]) => (
                                    <div key={k} className="nff">
                                        <Label className="nfl">{label}</Label>
                                        <Input type={t as string} value={(newForm as any)[k as string] ?? ''} onChange={e => setNewForm(p => ({ ...p, [k as string]: t === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))} className="h-8 text-[11px]" aria-label={label as string} />
                                    </div>
                                ))}
                                <div className="nff">
                                    <Label className="nfl">Equipment</Label>
                                    <Select value={newForm.equipmentType} onValueChange={v => setNewForm(p => ({ ...p, equipmentType: v }))}>
                                        <SelectTrigger className="nfi" aria-label="Equipment type"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['TL', 'LTL', 'INTERMODAL', 'AIR'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="nf-actions">
                                <Button variant="default" className="cancel-btn" onClick={() => setShowNew(false)} aria-label="Cancel">Cancel</Button>
                                <Button variant="default" className="save-btn" disabled={createMutation.isPending} onClick={() => createMutation.mutate(newForm)} aria-label="Create tender">Create</Button>
                            </div>
                        </div>
                    )}
                    {tenders.map(t => {
                        const cfg = STATUS_CFG[t.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                        return (
                            <div key={t.id} className={cn(`tender-card ${selected?.id === t.id ? 'selected' : ''}`)} onClick={() => setSelected(t)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                <div className="tc-top">
                                    <span className="tc-num">{t.tender_number}</span>
                                    <span className="tc-status" style={{ background: cfg.bg, color: cfg.color }}>{t.status}</span>
                                </div>
                                <div className="tc-route"><Truck className="h-2.5 w-2.5"  /> {t.origin_city}, {t.origin_state} → {t.dest_city}, {t.dest_state}</div>
                                <div className="tc-meta">{t.carrier_scac} · {t.equipment_type} · {fmt(t.freight_charge)}</div>
                                <div className="tc-edi">
                                    <span className={t.edi_204_sent ? 'green' : 'grey'}>204 {t.edi_204_sent ? '✓' : '✗'}</span>
                                    <span className={t.edi_990_received ? 'green' : 'grey'}>990 {t.edi_990_received ? '✓' : '✗'}</span>
                                </div>
                            </div>
                        );
                    })}
                    {tenders.length === 0 && <div className="empty">No tenders found</div>}
                </div>

                <div className="ltw-detail">
                    {selected ? (
                        <>
                            <div className="det-header">
                                <div>
                                    <div className="det-num">{selected.tender_number}</div>
                                    <div className="det-route"><Truck className="h-3 w-3"  /> {selected.origin_city}, {selected.origin_state} → {selected.dest_city}, {selected.dest_state}</div>
                                </div>
                                <div className="det-actions">
                                    {selected.status === 'Draft' && (
                                        <Button variant="default" className="send-btn" disabled={sendMutation.isPending} onClick={() => sendMutation.mutate(selected.id)} aria-label="Send EDI 204">
                                            <Send className="h-3 w-3"  /> {sendMutation.isPending ? 'Sending…' : 'Send EDI 204'}
                                        </Button>
                                    )}
                                    {selected.status === 'Sent' && (
                                        <div className="resp-btns">
                                            <Button variant="default" className="acc-btn" disabled={responseMutation.isPending} onClick={() => responseMutation.mutate({ id: selected.id, response: 'Accept' })} aria-label="Accept tender"><CheckCircle2 className="h-3 w-3"  /> Accept</Button>
                                            <Button variant="default" className="dec-btn" disabled={responseMutation.isPending} onClick={() => responseMutation.mutate({ id: selected.id, response: 'Decline' })} aria-label="Decline tender"><XCircle className="h-3 w-3"  /> Decline</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="det-grid">
                                <div className="dkv"><span>Carrier</span><strong>{selected.carrier_scac}</strong></div>
                                <div className="dkv"><span>Equipment</span><strong>{selected.equipment_type}</strong></div>
                                <div className="dkv"><span>Pickup</span><strong>{selected.pickup_date}</strong></div>
                                <div className="dkv"><span>Weight</span><strong>{formatNumber(Number(selected.weight_lbs))} lbs</strong></div>
                                <div className="dkv"><span>Freight</span><strong>{fmt(selected.freight_charge)}</strong></div>
                                <div className="dkv"><span>Response</span><strong>{selected.carrier_response ?? '—'}</strong></div>
                            </div>
                            {edi204 && (
                                <div className="edi-box">
                                    <div className="eb-title"><FileCode className="h-3 w-3"  /> EDI 204 Payload</div>
                                    <pre className="edi-pre">{edi204}</pre>
                                </div>
                            )}
                        </>
                    ) : <div className="no-sel">Select a tender to view details</div>}
                </div>
            </div>

            <style>{`
                .ltw-container { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .ltw-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .ltw-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .ltw-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .add-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
                .kpis { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
                .kpi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 16px; min-width: 110px; }
                .kpi-card.blue { border-left: 4px solid #1d4ed8; } .kpi-card.green { border-left: 4px solid #059669; } .kpi-card.red { border-left: 4px solid #dc2626; } .kpi-card.purple { border-left: 4px solid #7c3aed; }
                .kv { font-size: 20px; font-weight: 800; color: #111827; font-family: monospace; }
                .kl { font-size: 10px; color: #9ca3af; margin-top: 2px; }
                .filter-row { display: flex; gap: 4px; margin-bottom: 14px; flex-wrap: wrap; }
                .fp { padding: 4px 12px; border: 1px solid #e5e7eb; border-radius: 9999px; font-size: 11px; cursor: pointer; background: #fff; color: #6b7280; }
                .fp.active { background: #111827; color: #fff; border-color: #111827; }
                .ltw-layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
                .ltw-list { display: flex; flex-direction: column; gap: 6px; }
                .new-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 6px; }
                .nf-t { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 10px; }
                .nf-g { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
                .nff { display: flex; flex-direction: column; gap: 3px; }
                .nfl { font-size: 10px; font-weight: 600; color: #374151; }
                .nfi { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 11px; }
                .nf-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
                .cancel-btn { padding: 7px 14px; background: #f3f4f6; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; }
                .save-btn { padding: 7px 14px; background: #1d4ed8; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
                .tender-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
                .tender-card.selected { border-color: #1d4ed8; background: #eff6ff; }
                .tender-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
                .tc-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .tc-num { font-size: 12px; font-weight: 700; font-family: monospace; color: #111827; }
                .tc-status { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .tc-route { font-size: 11px; color: #374151; display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
                .tc-meta { font-size: 10px; color: #6b7280; margin-bottom: 4px; }
                .tc-edi { display: flex; gap: 8px; font-size: 10px; font-weight: 600; }
                .green { color: #059669; } .grey { color: #d1d5db; }
                .empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 20px; }
                .ltw-detail { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .det-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
                .det-num { font-size: 16px; font-weight: 800; font-family: monospace; color: #111827; }
                .det-route { font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; margin-top: 4px; }
                .det-actions { display: flex; gap: 8px; }
                .send-btn { display: flex; align-items: center; gap: 5px; padding: 8px 14px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .resp-btns { display: flex; gap: 6px; }
                .acc-btn { display: flex; align-items: center; gap: 5px; padding: 7px 12px; background: #059669; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .dec-btn { display: flex; align-items: center; gap: 5px; padding: 7px 12px; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .det-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
                .dkv { display: flex; flex-direction: column; background: #f9fafb; border-radius: 6px; padding: 8px 12px; }
                .dkv span { font-size: 10px; color: #9ca3af; margin-bottom: 2px; }
                .dkv strong { font-size: 13px; color: #111827; font-family: monospace; }
                .edi-box { background: #111827; border-radius: 8px; padding: 12px; }
                .eb-title { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #9ca3af; margin-bottom: 8px; }
                .edi-pre { font-size: 10px; font-family: monospace; color: #d1fae5; white-space: pre-wrap; margin: 0; max-height: 300px; overflow-y: auto; }
                .no-sel { display: flex; align-items: center; justify-content: center; height: 200px; color: #9ca3af; font-size: 14px; }
            `}</style>
        </StandardPage>
    );
}
