import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Printer, Archive, Send } from 'lucide-react';

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
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Carrier Manifest</h1>
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
                            </div>

                            {/* Add Package form */}
                            {showNewPkg && (
                                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Add Package</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                        {[['customerName', 'Customer Name', 'text'], ['address', 'Address', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text'], ['zip', 'ZIP', 'text'], ['weightKg', 'Weight (kg)', 'number']].map(([k, l, t]) => (
                                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                                <input type={t} value={(newPkg as any)[k] ?? ''} onChange={e => setNewPkg(p => ({ ...p, [k]: t === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <label style={{ fontSize: 10, fontWeight: 600 }}>Service</label>
                                            <select value={newPkg.serviceCode} onChange={e => setNewPkg(p => ({ ...p, serviceCode: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label="Service code">
                                                <option>GROUND</option><option>EXPRESS</option><option>OVERNIGHT</option><option>LTL</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                                        <button onClick={() => setShowNewPkg(false)} style={{ padding: '5px 10px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                        <button disabled={addPkgMut.isPending} onClick={() => addPkgMut.mutate(newPkg)} style={{ padding: '5px 10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Add & Generate Label</button>
                                    </div>
                                </div>
                            )}

                            {/* Packages table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                <thead><tr style={{ background: '#f9fafb' }}>
                                    {['Tracking #', 'Customer', 'Destination', 'Weight', 'Service', 'Label', ''].map(h => <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {packages.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700 }}>{p.tracking_number}</td>
                                            <td style={{ padding: '8px 10px' }}>{p.customer_name || '—'}</td>
                                            <td style={{ padding: '8px 10px' }}>{p.ship_to_city}, {p.ship_to_state} {p.ship_to_zip}</td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{Number(p.weight_kg).toFixed(2)} kg</td>
                                            <td style={{ padding: '8px 10px' }}>{p.service_code}</td>
                                            <td style={{ padding: '8px 10px' }}><span style={{ color: p.label_printed ? '#059669' : '#9ca3af', fontWeight: 600, fontSize: 10 }}>{p.label_printed ? '✓ Printed' : 'Pending'}</span></td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <button onClick={() => printMut.mutate(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: '#111827', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer' }}>
                                                    <Printer size={10} /> Print ZPL
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {packages.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 16 }}>No packages</td></tr>}
                                </tbody>
                            </table>

                            {/* ZPL Preview */}
                            {zplPreview && (
                                <div style={{ marginTop: 14, background: '#111827', borderRadius: 8, padding: 12 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Printer size={11} /> ZPL II Label Payload</div>
                                    <pre style={{ fontSize: 10, fontFamily: 'monospace', color: '#d1fae5', margin: 0, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>{zplPreview}</pre>
                                </div>
                            )}
                        </>
                    ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#9ca3af', fontSize: 14 }}>Select a manifest to view details</div>}
                </div>
            </div>
        </div>
    );
}
