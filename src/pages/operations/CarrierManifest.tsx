import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Printer, Archive, Send } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";

interface Manifest { id: string; manifest_number: string; carrier_scac: string; ship_date: string; total_packages: number; total_weight_kg: number; status: string; }
interface ManifestPackage { id: string; tracking_number: string; customer_name: string; ship_to_city: string; ship_to_state: string; ship_to_zip: string; weight_kg: number; service_code: string; label_printed: boolean; label_zpl: string; }

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
    Open: { bg: '#eff6ff', color: '#1d4ed8' },
    Closed: { bg: '#fef3c7', color: '#d97706' },
    Tendered: { bg: '#d1fae5', color: '#059669' },
    InTransit: { bg: '#e0f2fe', color: '#0284c7' },
};

export default function CarrierManifest() {
    const [selected, setSelected] = useState<Manifest | null>(null);
    const [zplPreview, setZplPreview] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showNewPkg, setShowNewPkg] = useState(false);
    const [newMfst, setNewMfst] = useState({ carrierScac: '', shipDate: new Date().toISOString().slice(0, 10), originWarehouse: 'W01' });
    const [newPkg, setNewPkg] = useState({ customerName: '', address: '', city: '', state: '', zip: '', weightKg: 1, serviceCode: 'GROUND' });
    const qc = useQueryClient();

    const { data: manifests = [] } = useQuery<Manifest[]>({ queryKey: ['manifests'], queryFn: () => fetch('/api/wms/manifests').then(r => r.json()) });
    const { data: packages = [] } = useQuery<ManifestPackage[]>({ queryKey: ['packages', selected?.id], queryFn: () => fetch(`/api/wms/manifests/${selected!.id}/packages`).then(r => r.json()), enabled: !!selected });
    const { data: summary } = useQuery({ queryKey: ['manifest-summary'], queryFn: () => fetch('/api/wms/manifests/summary').then(r => r.json()) });

    const createMfstMut = useMutation({
        mutationFn: (d: any) => fetch('/api/wms/manifests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['manifests', 'manifest-summary'] }); setShowNew(false); },
    });

    const addPkgMut = useMutation({
        mutationFn: (d: any) => fetch(`/api/wms/manifests/${selected!.id}/packages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, shipTo: { address: d.address, city: d.city, state: d.state, zip: d.zip } }) }).then(r => r.json()),
        onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['packages', 'manifests', 'manifest-summary'] }); setZplPreview(data.zpl || ''); setShowNewPkg(false); },
    });

    const printMut = useMutation({
        mutationFn: (pkgId: string) => fetch(`/api/wms/packages/${pkgId}/print`, { method: 'POST' }).then(r => r.json()),
        onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['packages'] }); setZplPreview(data.zpl || ''); },
    });

    const closeMut = useMutation({ mutationFn: (id: string) => fetch(`/api/wms/manifests/${id}/close`, { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['manifests'] }) });
    const tenderMut = useMutation({ mutationFn: (id: string) => fetch(`/api/wms/manifests/${id}/tender`, { method: 'POST' }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['manifests'] }) });

    return (
        <StandardPage title="Carrier Manifest">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Shipping manifests · ZPL label generation · Tender to carrier</p>
                </div>
                <button onClick={() => setShowNew(true)} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>+ New Manifest</button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[['Open', summary?.open_manifests ?? 0, '#1d4ed8'], ['Closed', summary?.closed_manifests ?? 0, '#d97706'], ['Tendered', summary?.tendered_manifests ?? 0, '#059669'], ['Pkgs Today', summary?.total_packages_today ?? 0, '#6b7280']].map(([l, v, c]) => (
                    <div key={l} style={{ background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 18px', flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>{v}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* New Manifest form */}
            {showNew && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>New Manifest</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[['carrierScac', 'Carrier SCAC', 'text'], ['shipDate', 'Ship Date', 'date'], ['originWarehouse', 'Warehouse', 'text']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                <input type={t} value={(newMfst as any)[k] ?? ''} onChange={e => setNewMfst(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10 }}>
                        <button onClick={() => setShowNew(false)} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={createMfstMut.isPending || !newMfst.carrierScac} onClick={() => createMfstMut.mutate(newMfst)} style={{ padding: '6px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Create</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14 }}>
                {/* Manifest list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {manifests.map(m => {
                        const cfg = STATUS_CFG[m.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                        return (
                            <div key={m.id} onClick={() => setSelected(m)} style={{ background: '#fff', border: `1px solid ${selected?.id === m.id ? '#1d4ed8' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: selected?.id === m.id ? '#eff6ff' : '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{m.manifest_number}</span>
                                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{m.status}</span>
                                </div>
                                <div style={{ fontSize: 10, color: '#374151', marginBottom: 2 }}>{m.carrier_scac} · {m.ship_date}</div>
                                <div style={{ fontSize: 10, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}><Package size={10} /> {m.total_packages} pkgs · {Number(m.total_weight_kg || 0).toFixed(1)} kg</div>
                            </div>
                        );
                    })}
                    {manifests.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No manifests</div>}
                </div>

                {/* Detail panel */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                    {selected ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace' }}>{selected.manifest_number}</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.carrier_scac} · {selected.ship_date} · {selected.total_packages} packages</div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => setShowNewPkg(true)} style={{ padding: '6px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Package size={11} /> Add Package</button>
                                    {selected.status === 'Open' && <button onClick={() => closeMut.mutate(selected.id)} style={{ padding: '6px 12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Archive size={11} /> Close</button>}
                                    {selected.status === 'Closed' && <button onClick={() => tenderMut.mutate(selected.id)} style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Send size={11} /> Tender</button>}
                                </div>
                                <InteractiveSpreadsheet
                                    data={packages}
                                    columns={[
                                        {
                                            id: "tracking_number",
                                            header: "Tracking #",
                                            width: "150px",
                                            cell: (row, index, updateRow) => (
                                                <Input
                                                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-mono font-semibold"
                                                    value={row.tracking_number}
                                                    onChange={(e) => updateRow("tracking_number", e.target.value)}
                                                    placeholder="Tracking Number"
                                                />
                                            )
                                        },
                                        {
                                            id: "customer_name",
                                            header: "Customer",
                                            width: "200px",
                                            cell: (row, index, updateRow) => (
                                                <Input
                                                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                                                    value={row.customer_name || ''}
                                                    onChange={(e) => updateRow("customer_name", e.target.value)}
                                                    placeholder="Customer Name"
                                                />
                                            )
                                        },
                                        {
                                            id: "destination",
                                            header: "Destination (City, ST Zip)",
                                            width: "250px",
                                            cell: (row, index, updateRow) => (
                                                <div className="flex gap-1 h-9 items-center px-2">
                                                    <Input className="h-7 min-w-0 border-0 focus-visible:ring-1 bg-transparent px-1" value={row.ship_to_city || ''} onChange={(e) => updateRow("ship_to_city", e.target.value)} placeholder="City" />
                                                    <Input className="h-7 w-12 border-0 focus-visible:ring-1 bg-transparent px-1 text-center" value={row.ship_to_state || ''} onChange={(e) => updateRow("ship_to_state", e.target.value)} placeholder="ST" maxLength={2} />
                                                    <Input className="h-7 w-20 border-0 focus-visible:ring-1 bg-transparent px-1" value={row.ship_to_zip || ''} onChange={(e) => updateRow("ship_to_zip", e.target.value)} placeholder="Zip" />
                                                </div>
                                            )
                                        },
                                        {
                                            id: "weight_kg",
                                            header: "Weight (kg)",
                                            width: "120px",
                                            cell: (row, index, updateRow) => (
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-mono text-right"
                                                    value={row.weight_kg || ''}
                                                    onChange={(e) => updateRow("weight_kg", parseFloat(e.target.value) || 0)}
                                                />
                                            )
                                        },
                                        {
                                            id: "service_code",
                                            header: "Service",
                                            width: "140px",
                                            cell: (row, index, updateRow) => (
                                                <select
                                                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent px-2"
                                                    value={row.service_code || 'GROUND'}
                                                    onChange={(e) => updateRow("service_code", e.target.value)}
                                                >
                                                    <option value="GROUND">GROUND</option>
                                                    <option value="EXPRESS">EXPRESS</option>
                                                    <option value="OVERNIGHT">OVERNIGHT</option>
                                                    <option value="LTL">LTL</option>
                                                </select>
                                    <div style={{ marginTop: 14, background: '#111827', borderRadius: 8, padding: 12 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Printer size={11} /> ZPL II Label Payload</div>
                                        <pre style={{ fontSize: 10, fontFamily: 'monospace', color: '#d1fae5', margin: 0, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>{zplPreview}</pre>
                                    </div>
                                            )
                                        }
                            </>
                            ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#9ca3af', fontSize: 14 }}>Select a manifest to view details</div>}
                        </div>
                </div>
            </div>
            );
}
</StandardPage>