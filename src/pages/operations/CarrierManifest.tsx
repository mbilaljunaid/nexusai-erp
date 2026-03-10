import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Printer, Archive, Send } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Manifest { id: string; manifest_number: string; carrier_scac: string; ship_date: string; total_packages: number; total_weight_kg: number; status: string; }
interface ManifestPackage { id: string; tracking_number: string; customer_name: string; ship_to_city: string; ship_to_state: string; ship_to_zip: string; weight_kg: number; service_code: string; label_printed: boolean; label_zpl: string; }

const STATUS_CFG: Record<string, string> = {
    Open: 'bg-blue-500/10 text-blue-700',
    Closed: 'bg-amber-100 text-amber-600',
    Tendered: 'bg-emerald-100 text-emerald-600',
    InTransit: 'bg-sky-100 text-sky-600',
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
    const { data: summary } = useQuery<any>({ queryKey: ['manifest-summary'], queryFn: () => fetch('/api/wms/manifests/summary').then(r => r.json()) });

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
        <div className="p-6 max-w-7xl mx-auto font-sans">
            <div className="flex justify-between mb-4">
                <div>
                    <h1 className="text-[22px] font-bold text-foreground dark:text-gray-200 m-0">Carrier Manifest</h1>
                    <p className="text-[13px] text-muted-foreground mt-1 mb-0">Shipping manifests · ZPL label generation · Tender to carrier</p>
                </div>
                <Button variant="default" onClick={() => setShowNew(true)} className="text-white">+ New Manifest</Button>
            </div>

            {/* KPIs */}
            <div className="flex gap-2.5 mb-3.5">
                {[
                    ['Open', summary?.open_manifests ?? 0, 'border-l-blue-700'],
                    ['Closed', summary?.closed_manifests ?? 0, 'border-l-amber-600'],
                    ['Tendered', summary?.tendered_manifests ?? 0, 'border-l-emerald-600'],
                    ['Pkgs Today', summary?.total_packages_today ?? 0, 'border-l-gray-500']
                ].map(([l, v, c]) => (
                    <div key={l} className={cn(`bg-card border border-border rounded-xl py-2.5 px-4 flex-1 border-l-4 ${c}`)}>
                        <div className="text-[22px] font-extrabold font-mono">{v}</div>
                        <div className="text-[11px] text-muted-foreground/70 mt-0.5">{l}</div>
                    </div>
                ))}
            </div>

            {/* New Manifest form */}
            {showNew && (
                <div className="bg-card border border-border rounded-xl p-3.5 mb-2.5">
                    <div className="text-[13px] font-bold mb-2.5">New Manifest</div>
                    <div className="grid grid-cols-3 gap-2">
                        {[['carrierScac', 'Carrier SCAC', 'text'], ['shipDate', 'Ship Date', 'date'], ['originWarehouse', 'Warehouse', 'text']].map(([k, l, t]) => (
                            <div key={k} className="flex flex-col gap-1">
                                <Label className="text-[10px] font-semibold">{l}</Label>
                                <Input type={t} value={(newMfst as any)[k] ?? ''} onChange={e => setNewMfst(p => ({ ...p, [k]: e.target.value }))} className="px-2 py-1.5 border border-gray-300 rounded-md text-[11px]" aria-label={l} />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-1.5 mt-2.5">
                        <Button variant="secondary" size="sm" onClick={() => setShowNew(false)} className="text-[11px]">Cancel</Button>
                        <Button variant="default" size="sm" disabled={createMfstMut.isPending || !newMfst.carrierScac} onClick={() => createMfstMut.mutate(newMfst)} className="text-white text-[11px]">Create</Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-[280px_1fr] gap-3.5">
                {/* Manifest list */}
                <div className="flex flex-col gap-1.5">
                    {manifests.map(m => {
                        const cfgClass = STATUS_CFG[m.status] ?? 'bg-muted text-muted-foreground';
                        return (
                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelected(m)}>
                            <div key={m.id} className={cn(`border rounded-xl p-2.5 cursor-pointer ${selected?.id === m.id ? 'border-blue-700 bg-blue-500/10' : 'border-border bg-card'}`)}>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-[11px] font-bold font-mono">{m.manifest_number}</span>
                                                                <span className={cn(`px-1.5 py-0.5 rounded text-[9px] font-bold ${cfgClass}`)}>{m.status}</span>
                                                            </div>
                                                            <div className="text-[10px] text-foreground/90 mb-0.5">{m.carrier_scac} · {m.ship_date}</div>
                                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Package className="h-2.5 w-2.5"  /> {m.total_packages} pkgs · {Number(m.total_weight_kg || 0).toFixed(1)} kg</div>
                                                        </div>
                            </Button>
                        );
                    })}
                    {manifests.length === 0 && <div className="text-center text-muted-foreground/70 p-5">No manifests</div>}
                </div>

                {/* Detail panel */}
                <div className="bg-card border border-border rounded-xl p-4">
                    {selected ? (
                        <>
                            <div className="flex justify-between items-start mb-3.5">
                                <div>
                                    <div className="text-base font-extrabold font-mono">{selected.manifest_number}</div>
                                    <div className="text-xs text-muted-foreground">{selected.carrier_scac} · {selected.ship_date} · {selected.total_packages} packages</div>
                                </div>
                                <div className="flex gap-1.5">
                                    <Button variant="default" size="sm" onClick={() => setShowNewPkg(true)} className="text-white text-[11px] flex items-center gap-1"><Package className="h-[11px] w-[11px]"  /> Add Package</Button>
                                    {selected.status === 'Open' && <Button variant="default" size="sm" onClick={() => closeMut.mutate(selected.id)} className="text-white text-[11px] flex items-center gap-1"><Archive className="h-[11px] w-[11px]"  /> Close</Button>}
                                    {selected.status === 'Closed' && <Button variant="default" size="sm" onClick={() => tenderMut.mutate(selected.id)} className="text-white text-[11px] flex items-center gap-1"><Send className="h-[11px] w-[11px]"  /> Tender</Button>}
                                </div>
                            </div>

                            {showNewPkg && (
                                <div className="bg-gray-500/10 border border-border rounded-xl p-3 mb-3">
                                    <div className="text-xs font-bold mb-2">Add Package</div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {[['customerName', 'Customer Name', 'text'], ['address', 'Address', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text'], ['zip', 'ZIP', 'text'], ['weightKg', 'Weight (kg)', 'number']].map(([k, l, t]) => (
                                            <div key={k} className="flex flex-col gap-1">
                                                <Label className="text-[10px] font-semibold">{l}</Label>
                                                <Input type={t} value={(newPkg as any)[k] ?? ''} onChange={e => setNewPkg(p => ({ ...p, [k]: t === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))} className="px-2 py-1 border border-gray-300 rounded-md text-[11px]" aria-label={l} />
                                            </div>
                                        ))}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-[10px] font-semibold">Service</Label>
                                            <Select value={newPkg.serviceCode} onValueChange={v => setNewPkg(p => ({ ...p, serviceCode: v }))}>
                                                <SelectTrigger className="px-2 py-1 text-[11px]" aria-label="Service code"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {['GROUND', 'EXPRESS', 'OVERNIGHT', 'LTL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-1.5 mt-2">
                                        <Button variant="secondary" size="sm" onClick={() => setShowNewPkg(false)} className="text-[11px]">Cancel</Button>
                                        <Button variant="default" size="sm" disabled={addPkgMut.isPending} onClick={() => addPkgMut.mutate(newPkg)} className="text-white text-[11px]">Add & Generate Label</Button>
                                    </div>
                                </div>
                            )}

                            {/* Packages table */}
                            <Table className="text-[11px]">
                                <TableHeader>
                                    <TableRow className="bg-gray-500/10 hover:bg-gray-500/10">
                                        {['Tracking #', 'Customer', 'Destination', 'Weight', 'Service', 'Label', ''].map(h => (
                                            <TableHead key={h} className="py-2 px-2.5 h-auto text-foreground/90 font-semibold">{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages.map(p => (
                                        <TableRow key={p.id} className="border-border hover:bg-muted/50/50">
                                            <TableCell className="py-2 px-2.5 font-mono font-bold">{p.tracking_number}</TableCell>
                                            <TableCell className="py-2 px-2.5">{p.customer_name || '—'}</TableCell>
                                            <TableCell className="py-2 px-2.5">{p.ship_to_city}, {p.ship_to_state} {p.ship_to_zip}</TableCell>
                                            <TableCell className="py-2 px-2.5 font-mono">{Number(p.weight_kg).toFixed(2)} kg</TableCell>
                                            <TableCell className="py-2 px-2.5">{p.service_code}</TableCell>
                                            <TableCell className="py-2 px-2.5"><span className={cn(`font-semibold text-[10px] ${p.label_printed ? 'text-emerald-600' : 'text-muted-foreground/70'}`)}>{p.label_printed ? '✓ Printed' : 'Pending'}</span></TableCell>
                                            <TableCell className="py-2 px-2.5">
                                                <Button variant="secondary" size="sm" onClick={() => printMut.mutate(p.id)} className="flex items-center gap-1 text-white text-[10px]">
                                                    <Printer className="h-2.5 w-2.5"  /> Print ZPL
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {packages.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground/70 py-4">No packages</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* ZPL Preview */}
                            {zplPreview && (
                                <div className="mt-3.5 bg-gray-900 rounded-lg p-3">
                                    <div className="text-[11px] font-bold text-muted-foreground/70 mb-1.5 flex items-center gap-1.5"><Printer className="h-[11px] w-[11px]"  /> ZPL II Label Payload</div>
                                    <pre className="text-[10px] font-mono text-emerald-100 m-0 whitespace-pre-wrap max-h-72 overflow-y-auto">{zplPreview}</pre>
                                </div>
                            )}
                        </>
                    ) : <div className="flex items-center justify-center h-48 text-muted-foreground/70 text-sm">Select a manifest to view details</div>}
                </div>
            </div>
        </div>
    );
}
