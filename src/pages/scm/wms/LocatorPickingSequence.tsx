import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from '@/components/ui/InteractiveSpreadsheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';

interface LocatorZone { id: string; zoneCode: string; zoneName: string; }
interface LocatorRow {
    id: string; zoneId: string; zoneName: string; locatorCode: string; description: string;
    aisle: string; row: string; level: string; bin: string;
    pickingSeq: number; putawaySeq: number; locatorType: string;
    capacityUom: string; maxCapacity: number; currentUnits: number; utilizationPct: number;
    active: boolean; temperatureClass: string; pickingStrategy: string;
}

const ZONES: LocatorZone[] = [
    { id: 'z1', zoneCode: 'A-PICK', zoneName: 'Main Picking Zone A' },
    { id: 'z2', zoneCode: 'B-BULK', zoneName: 'Bulk Storage Zone B' },
    { id: 'z3', zoneCode: 'C-COLD', zoneName: 'Cold Storage Zone C' },
];

const SEED: LocatorRow[] = [
    { id: 'l1', zoneId: 'z1', zoneName: 'Main Picking Zone A', locatorCode: 'A-01-01-A', description: 'Aisle A Rack 01 Lvl 01 Bin A', aisle: 'A', row: '01', level: '01', bin: 'A', pickingSeq: 10, putawaySeq: 5, locatorType: 'STANDARD', capacityUom: 'PALLET', maxCapacity: 2, currentUnits: 1, utilizationPct: 50, active: true, temperatureClass: 'AMBIENT', pickingStrategy: 'FIFO' },
    { id: 'l2', zoneId: 'z1', zoneName: 'Main Picking Zone A', locatorCode: 'A-01-01-B', description: 'Aisle A Rack 01 Lvl 01 Bin B', aisle: 'A', row: '01', level: '01', bin: 'B', pickingSeq: 20, putawaySeq: 10, locatorType: 'STANDARD', capacityUom: 'PALLET', maxCapacity: 2, currentUnits: 2, utilizationPct: 100, active: true, temperatureClass: 'AMBIENT', pickingStrategy: 'FIFO' },
    { id: 'l3', zoneId: 'z1', zoneName: 'Main Picking Zone A', locatorCode: 'A-01-02-A', description: 'Aisle A Rack 01 Lvl 02 Bin A', aisle: 'A', row: '01', level: '02', bin: 'A', pickingSeq: 30, putawaySeq: 15, locatorType: 'STANDARD', capacityUom: 'PALLET', maxCapacity: 4, currentUnits: 0, utilizationPct: 0, active: true, temperatureClass: 'AMBIENT', pickingStrategy: 'FIFO' },
    { id: 'l4', zoneId: 'z1', zoneName: 'Main Picking Zone A', locatorCode: 'A-02-01-A', description: 'Aisle A Rack 02 Lvl 01 Bin A', aisle: 'A', row: '02', level: '01', bin: 'A', pickingSeq: 40, putawaySeq: 20, locatorType: 'STANDARD', capacityUom: 'PALLET', maxCapacity: 4, currentUnits: 1, utilizationPct: 25, active: true, temperatureClass: 'AMBIENT', pickingStrategy: 'FEFO' },
    { id: 'l5', zoneId: 'z1', zoneName: 'Main Picking Zone A', locatorCode: 'STG-01', description: 'Staging Lane 01', aisle: 'STG', row: '01', level: '01', bin: '-', pickingSeq: 1, putawaySeq: 1, locatorType: 'STAGING', capacityUom: 'PALLET', maxCapacity: 10, currentUnits: 4, utilizationPct: 40, active: true, temperatureClass: 'AMBIENT', pickingStrategy: 'FIFO' },
    { id: 'l6', zoneId: 'z2', zoneName: 'Bulk Storage Zone B', locatorCode: 'B-01-FLOOR', description: 'Bulk Floor Position 01', aisle: 'B', row: '01', level: 'FLOOR', bin: '-', pickingSeq: 100, putawaySeq: 50, locatorType: 'BULK', capacityUom: 'CBM', maxCapacity: 80, currentUnits: 45, utilizationPct: 56, active: true, temperatureClass: 'AMBIENT', pickingStrategy: 'FIFO' },
    { id: 'l7', zoneId: 'z2', zoneName: 'Bulk Storage Zone B', locatorCode: 'B-02-FLOOR', description: 'Bulk Floor Position 02 (HAZMAT)', aisle: 'B', row: '02', level: 'FLOOR', bin: '-', pickingSeq: 110, putawaySeq: 55, locatorType: 'BULK', capacityUom: 'CBM', maxCapacity: 80, currentUnits: 10, utilizationPct: 13, active: true, temperatureClass: 'HAZMAT', pickingStrategy: 'FIFO' },
    { id: 'l8', zoneId: 'z3', zoneName: 'Cold Storage Zone C', locatorCode: 'C-01-01-A', description: 'Cold Chamber 01 Rack 01 Bin A', aisle: 'C', row: '01', level: '01', bin: 'A', pickingSeq: 200, putawaySeq: 100, locatorType: 'STANDARD', capacityUom: 'PALLET', maxCapacity: 4, currentUnits: 2, utilizationPct: 50, active: true, temperatureClass: 'COLD_4C', pickingStrategy: 'FEFO' },
    { id: 'l9', zoneId: 'z3', zoneName: 'Cold Storage Zone C', locatorCode: 'C-02-FROZEN', description: 'Frozen Storage Rack 02', aisle: 'C', row: '02', level: '01', bin: 'A', pickingSeq: 210, putawaySeq: 105, locatorType: 'STANDARD', capacityUom: 'PALLET', maxCapacity: 4, currentUnits: 0, utilizationPct: 0, active: true, temperatureClass: 'FROZEN', pickingStrategy: 'FEFO' },
];

const TEMP_COLORS: Record<string, string> = {
    AMBIENT: 'bg-slate-100 text-slate-700',
    COLD_4C: 'bg-blue-100 text-blue-700',
    FROZEN: 'bg-sky-200 text-sky-800',
    HAZMAT: 'bg-red-100 text-red-700',
};

export default function LocatorPickingSequence() {
    const { toast } = useToast();
    const [locators, setLocators] = useState<LocatorRow[]>(SEED);
    const [zone, setZone] = useState('ALL');
    const [showNew, setShowNew] = useState(false);
    const [newLoc, setNewLoc] = useState({ zoneId: 'z1', locatorCode: '', description: '', aisle: '', row: '', level: '', bin: '', pickingSeq: '', putawaySeq: '', locatorType: 'STANDARD', capacityUom: 'PALLET', maxCapacity: '', temperatureClass: 'AMBIENT', pickingStrategy: 'FIFO' });

    const filtered = (zone === 'ALL' ? locators : locators.filter(l => l.zoneId === zone)).sort((a, b) => a.pickingSeq - b.pickingSeq);

    function move(id: string, dir: 'up' | 'down') {
        const idx = filtered.findIndex(l => l.id === id);
        if (dir === 'up' && idx === 0) return;
        if (dir === 'down' && idx === filtered.length - 1) return;
        const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
        const updated = [...locators];
        const a = updated.find(l => l.id === filtered[idx].id)!;
        const b = updated.find(l => l.id === filtered[swapIdx].id)!;
        const tmp = a.pickingSeq; a.pickingSeq = b.pickingSeq; b.pickingSeq = tmp;
        setLocators([...updated]);
        toast({ title: 'Sequence updated', description: `${a.locatorCode} ↔ ${b.locatorCode}` });
    }

    function save() {
        if (!newLoc.locatorCode || !newLoc.aisle) { toast({ title: 'Locator code and aisle required', variant: 'destructive' }); return; }
        const z = ZONES.find(z => z.id === newLoc.zoneId);
        setLocators(p => [...p, {
            id: `l${Date.now()}`, zoneId: newLoc.zoneId, zoneName: z?.zoneName || '', locatorCode: newLoc.locatorCode,
            description: newLoc.description, aisle: newLoc.aisle, row: newLoc.row, level: newLoc.level, bin: newLoc.bin,
            pickingSeq: Number(newLoc.pickingSeq) || (Math.max(...locators.map(l => l.pickingSeq)) + 10),
            putawaySeq: Number(newLoc.putawaySeq) || (Math.max(...locators.map(l => l.putawaySeq)) + 5),
            locatorType: newLoc.locatorType, capacityUom: newLoc.capacityUom, maxCapacity: Number(newLoc.maxCapacity) || 0,
            currentUnits: 0, utilizationPct: 0, active: true, temperatureClass: newLoc.temperatureClass, pickingStrategy: newLoc.pickingStrategy,
        }]);
        setShowNew(false);
        toast({ title: `Locator ${newLoc.locatorCode} added` });
    }

    const cols: SpreadsheetColumn<LocatorRow>[] = [
        {
            id: 'seq', header: 'Pick Seq', width: '90px', cell: r => (
                <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-sm w-8">{r.pickingSeq}</span>
                    <div className="flex flex-col gap-0.5">
                        <button onClick={() => move(r.id, 'up')} className="h-3 w-4 hover:text-primary text-muted-foreground" aria-label={`Move ${r.locatorCode} up`}><ArrowUp className="h-3 w-3" /></button>
                        <button onClick={() => move(r.id, 'down')} className="h-3 w-4 hover:text-primary text-muted-foreground" aria-label={`Move ${r.locatorCode} down`}><ArrowDown className="h-3 w-3" /></button>
                    </div>
                </div>
            )
        },
        { id: 'code', header: 'Locator Code', width: '130px', cell: r => <span className="font-mono font-semibold text-xs">{r.locatorCode}</span> },
        { id: 'zone', header: 'Zone', width: '130px', cell: r => <Badge variant="outline" className="text-[10px]">{r.zoneName}</Badge> },
        { id: 'address', header: 'Aisle·Row·Lvl·Bin', width: '150px', cell: r => <span className="text-xs font-mono text-muted-foreground">{r.aisle}·{r.row}·{r.level}·{r.bin}</span> },
        { id: 'type', header: 'Type', width: '90px', cell: r => <Badge variant="secondary" className="text-[10px]">{r.locatorType}</Badge> },
        { id: 'temp', header: 'Temp', width: '90px', cell: r => <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TEMP_COLORS[r.temperatureClass]}`}>{r.temperatureClass}</span> },
        { id: 'strategy', header: 'Strategy', width: '80px', cell: r => <span className="text-xs">{r.pickingStrategy}</span> },
        { id: 'cap', header: 'Cap', width: '80px', cell: r => <span className="text-xs">{r.maxCapacity} {r.capacityUom}</span> },
        {
            id: 'util', header: 'Utilization', width: '120px', cell: r => (
                <div className="flex items-center gap-1.5">
                    <div className="w-14 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${r.utilizationPct >= 100 ? 'bg-red-500' : r.utilizationPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${r.utilizationPct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono">{r.utilizationPct}%</span>
                </div>
            )
        },
        { id: 'putaway', header: 'Putaway Seq', width: '100px', cell: r => <span className="font-mono text-xs text-muted-foreground">{r.putawaySeq}</span> },
        { id: 'active', header: 'Active', width: '60px', cell: r => r.active ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    ];

    return (
        <StandardPage title="Locator & Picking Sequence">
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Total Locators', value: locators.length, color: 'text-foreground' },
                    { label: 'Full (100%)', value: locators.filter(l => l.utilizationPct >= 100).length, color: 'text-red-600' },
                    { label: 'Available', value: locators.filter(l => l.utilizationPct < 80 && l.active).length, color: 'text-emerald-600' },
                    { label: 'Zones', value: ZONES.length, color: 'text-blue-600' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-card border rounded-xl p-4">
                        <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                        <div className="text-[11px] text-muted-foreground">{label}</div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mb-3">
                <div className="flex gap-2 items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Zone:</span>
                    <Select value={zone} onValueChange={setZone}>
                        <SelectTrigger className="w-48 text-sm" aria-label="Zone filter"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Zones</SelectItem>
                            {ZONES.map(z => <SelectItem key={z.id} value={z.id}>{z.zoneName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button size="sm" className="text-white" onClick={() => setShowNew(true)}><Plus className="h-3.5 w-3.5 mr-1" />Add Locator</Button>
            </div>
            <div className="border rounded-xl overflow-hidden">
                <InteractiveSpreadsheet columns={cols} data={filtered} onChange={() => { }} containerHeight="520px" />
            </div>

            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Locator</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-3">
                        <div className="col-span-2">
                            <Label className="text-xs font-semibold">Zone</Label>
                            <Select value={newLoc.zoneId} onValueChange={v => setNewLoc(p => ({ ...p, zoneId: v }))}>
                                <SelectTrigger className="mt-1 text-sm" aria-label="Zone"><SelectValue /></SelectTrigger>
                                <SelectContent>{ZONES.map(z => <SelectItem key={z.id} value={z.id}>{z.zoneName}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {(['locatorCode', 'description', 'aisle', 'row', 'level', 'bin', 'pickingSeq', 'putawaySeq', 'maxCapacity'] as const).map(k => (
                            <div key={k}>
                                <Label className="text-xs font-semibold capitalize">{k.replace(/([A-Z])/g, ' $1')}</Label>
                                <Input className="mt-1 text-sm" value={(newLoc as any)[k]} onChange={e => setNewLoc(p => ({ ...p, [k]: e.target.value }))} aria-label={k} />
                            </div>
                        ))}
                        {[
                            { key: 'locatorType', label: 'Type', opts: ['STANDARD', 'STAGING', 'BULK', 'DOCK', 'RECEIVING'] },
                            { key: 'temperatureClass', label: 'Temp Class', opts: ['AMBIENT', 'COLD_4C', 'FROZEN', 'HAZMAT'] },
                            { key: 'pickingStrategy', label: 'Picking Strategy', opts: ['FIFO', 'LIFO', 'FEFO', 'NEAREST'] },
                        ].map(({ key, label, opts }) => (
                            <div key={key}>
                                <Label className="text-xs font-semibold">{label}</Label>
                                <Select value={(newLoc as any)[key]} onValueChange={v => setNewLoc(p => ({ ...p, [key]: v }))}>
                                    <SelectTrigger className="mt-1 text-sm" aria-label={label}><SelectValue /></SelectTrigger>
                                    <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                        <Button className="text-white" onClick={save}>Add Locator</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
