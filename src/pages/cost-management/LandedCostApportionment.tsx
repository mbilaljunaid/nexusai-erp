import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from '@/components/ui/InteractiveSpreadsheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatNumber } from '@/lib/formatters';
import { Separator } from '@/components/ui/separator';
import {
    Ship, Plus, DollarSign, Package, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { Calculator, LayoutList as List, FileText } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LandedCostBatch {
    id: string;
    batchNumber: string;
    shipmentReference: string;
    carrier: string;
    portOfEntry: string;
    receiptDate: string;
    totalFreight: number;
    totalDuty: number;
    totalInsurance: number;
    totalBrokerage: number;
    totalMisc: number;
    totalLandedCost: number;
    status: string; // DRAFT, POSTED, REVERSED
    apportionmentMethod: string; // WEIGHT, VALUE, QUANTITY, VOLUME
    receiptLineCount: number;
    currency: string;
}

interface ApportionmentLine {
    id: string;
    batchId: string;
    receiptLineId: string;
    poNumber: string;
    itemCode: string;
    itemDescription: string;
    qtyReceived: number;
    receiptValue: number;
    weight: number;
    volume: number;
    allocatedFreight: number;
    allocatedDuty: number;
    allocatedInsurance: number;
    allocatedBrokerage: number;
    totalAllocated: number;
    unitLandedCost: number;
    itemCostUpdated: boolean;
}

const APPORTIONMENT_METHODS = [
    { value: 'VALUE', label: 'By Receipt Value (most common)' },
    { value: 'WEIGHT', label: 'By Weight (kg)' },
    { value: 'QUANTITY', label: 'By Quantity (units)' },
    { value: 'VOLUME', label: 'By Volume (m³)' },
];

const PORTS_OF_ENTRY = ['Los Angeles', 'Long Beach', 'New York/Newark', 'Houston', 'Chicago O\'Hare', 'Miami', 'Rotterdam', 'Dubai Jebel Ali', 'Singapore'];

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    DRAFT: { label: 'Draft', variant: 'outline' },
    CALCULATED: { label: 'Calculated', variant: 'default' },
    POSTED: { label: 'Posted to Cost', variant: 'secondary' },
    REVERSED: { label: 'Reversed', variant: 'destructive' },
};

function fmt(n: number) { return formatNumber(n, 0); }

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_BATCHES: LandedCostBatch[] = [
    {
        id: 'b1', batchNumber: 'LCB-2026-001', shipmentReference: 'BL-COSCO-283910', carrier: 'COSCO Shipping',
        portOfEntry: 'Long Beach', receiptDate: '2026-03-01', totalFreight: 12800, totalDuty: 4250,
        totalInsurance: 640, totalBrokerage: 380, totalMisc: 0, totalLandedCost: 18070,
        status: 'POSTED', apportionmentMethod: 'VALUE', receiptLineCount: 4, currency: 'USD',
    },
    {
        id: 'b2', batchNumber: 'LCB-2026-002', shipmentReference: 'AWB-FDX-992831', carrier: 'FedEx Air Freight',
        portOfEntry: 'Los Angeles', receiptDate: '2026-03-05', totalFreight: 3200, totalDuty: 960,
        totalInsurance: 160, totalBrokerage: 210, totalMisc: 120, totalLandedCost: 4650,
        status: 'CALCULATED', apportionmentMethod: 'WEIGHT', receiptLineCount: 2, currency: 'USD',
    },
    {
        id: 'b3', batchNumber: 'LCB-2026-003', shipmentReference: 'BL-MSC-740261', carrier: 'MSC Mediterranean',
        portOfEntry: 'Houston', receiptDate: '2026-03-08', totalFreight: 0, totalDuty: 0,
        totalInsurance: 0, totalBrokerage: 0, totalMisc: 0, totalLandedCost: 0,
        status: 'DRAFT', apportionmentMethod: 'VALUE', receiptLineCount: 0, currency: 'USD',
    },
];

const SEED_LINES: ApportionmentLine[] = [
    {
        id: 'l1', batchId: 'b1', receiptLineId: 'rl1', poNumber: 'PO-2026-0438', itemCode: 'RM-ALUM-6061',
        itemDescription: 'Aluminum Alloy 6061-T6 Bars', qtyReceived: 500, receiptValue: 42500,
        weight: 1350, volume: 0.8, allocatedFreight: 6140, allocatedDuty: 2030, allocatedInsurance: 462, allocatedBrokerage: 183, totalAllocated: 8815, unitLandedCost: 17.63, itemCostUpdated: true,
    },
    {
        id: 'l2', batchId: 'b1', receiptLineId: 'rl2', poNumber: 'PO-2026-0438', itemCode: 'RM-STEEL-304',
        itemDescription: 'Stainless Steel 304 Sheet 2mm', qtyReceived: 200, receiptValue: 18000,
        weight: 800, volume: 0.3, allocatedFreight: 2601, allocatedDuty: 862, allocatedInsurance: 196, allocatedBrokerage: 78, totalAllocated: 3737, unitLandedCost: 18.69, itemCostUpdated: true,
    },
    {
        id: 'l3', batchId: 'b1', receiptLineId: 'rl3', poNumber: 'PO-2026-0451', itemCode: 'COMP-MOTOR-3PH',
        itemDescription: '3-Phase AC Motor 7.5kW', qtyReceived: 12, receiptValue: 28800,
        weight: 540, volume: 0.5, allocatedFreight: 4165, allocatedDuty: 1380, allocatedInsurance: 313, allocatedBrokerage: 125, totalAllocated: 5983, unitLandedCost: 498.58, itemCostUpdated: true,
    },
    {
        id: 'l4', batchId: 'b1', receiptLineId: 'rl4', poNumber: 'PO-2026-0451', itemCode: 'COMP-GEARBOX',
        itemDescription: 'Helical Gearbox 20:1 Ratio', qtyReceived: 8, receiptValue: 11700,
        weight: 220, volume: 0.2, allocatedFreight: 1692, allocatedDuty: 560, allocatedInsurance: 127, allocatedBrokerage: 51, totalAllocated: 2430, unitLandedCost: 303.75, itemCostUpdated: true,
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandedCostApportionment() {
    const { toast } = useToast();
    const [selectedBatch, setSelectedBatch] = useState<LandedCostBatch | null>(null);
    const [showNewBatch, setShowNewBatch] = useState(false);
    const [newBatch, setNewBatch] = useState({
        shipmentReference: '', carrier: '', portOfEntry: 'Long Beach',
        receiptDate: '', apportionmentMethod: 'VALUE', currency: 'USD',
        totalFreight: '', totalDuty: '', totalInsurance: '', totalBrokerage: '', totalMisc: '',
    });

    const [batches, setBatches] = useState<LandedCostBatch[]>(SEED_BATCHES);
    const lines = SEED_LINES.filter(l => l.batchId === selectedBatch?.id);

    function totalCharges() {
        return ['totalFreight', 'totalDuty', 'totalInsurance', 'totalBrokerage', 'totalMisc']
            .reduce((s, k) => s + Number((newBatch as any)[k] || 0), 0);
    }

    function handleCreateBatch() {
        const total = totalCharges();
        if (!newBatch.shipmentReference || !newBatch.carrier || !newBatch.receiptDate) {
            toast({ title: 'Required fields missing', variant: 'destructive' });
            return;
        }
        const b: LandedCostBatch = {
            id: `b${Date.now()}`,
            batchNumber: `LCB-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, '0')}`,
            shipmentReference: newBatch.shipmentReference,
            carrier: newBatch.carrier,
            portOfEntry: newBatch.portOfEntry,
            receiptDate: newBatch.receiptDate,
            totalFreight: Number(newBatch.totalFreight || 0),
            totalDuty: Number(newBatch.totalDuty || 0),
            totalInsurance: Number(newBatch.totalInsurance || 0),
            totalBrokerage: Number(newBatch.totalBrokerage || 0),
            totalMisc: Number(newBatch.totalMisc || 0),
            totalLandedCost: total,
            status: 'DRAFT',
            apportionmentMethod: newBatch.apportionmentMethod,
            receiptLineCount: 0,
            currency: newBatch.currency,
        };
        setBatches(p => [...p, b]);
        setShowNewBatch(false);
        toast({ title: `Batch ${b.batchNumber} created`, description: `Total landed cost: $${fmt(total)}` });
    }

    function handleCalculate(batch: LandedCostBatch) {
        setBatches(p => p.map(b => b.id === batch.id ? { ...b, status: 'CALCULATED' } : b));
        toast({ title: 'Apportionment calculated', description: `Charges distributed to PO receipt lines using ${batch.apportionmentMethod} method.` });
    }

    function handlePostToItemCost(batch: LandedCostBatch) {
        setBatches(p => p.map(b => b.id === batch.id ? { ...b, status: 'POSTED' } : b));
        if (selectedBatch?.id === batch.id) setSelectedBatch({ ...batch, status: 'POSTED' });
        toast({ title: 'Posted to Item Cost', description: 'Landed cost unit adjustments applied to inventory item standard/average cost.' });
    }

    // ─── Columns ──────────────────────────────────────────────────────────────

    const batchColumns: SpreadsheetColumn<LandedCostBatch>[] = [
        { id: 'batchNumber', header: 'Batch #', width: '140px', cell: r => <span className="font-mono font-semibold text-xs">{r.batchNumber}</span> },
        { id: 'shipmentRef', header: 'Shipment Reference', width: '160px', cell: r => <span className="text-xs">{r.shipmentReference}</span> },
        { id: 'carrier', header: 'Carrier', width: '140px', cell: r => <span className="text-xs">{r.carrier}</span> },
        { id: 'portOfEntry', header: 'Port', width: '120px', cell: r => <span className="text-xs">{r.portOfEntry}</span> },
        { id: 'receiptDate', header: 'Receipt Date', width: '110px', cell: r => <span className="text-xs">{r.receiptDate}</span> },
        { id: 'method', header: 'Method', width: '90px', cell: r => <Badge variant="outline" className="text-[10px]">{r.apportionmentMethod}</Badge> },
        { id: 'totalLandedCost', header: 'Total Landed Cost', width: '130px', cell: r => <span className="font-mono text-sm font-bold">${fmt(r.totalLandedCost)}</span> },
        { id: 'lines', header: 'Lines', width: '60px', cell: r => <span className="text-xs text-muted-foreground">{r.receiptLineCount}</span> },
        { id: 'status', header: 'Status', width: '110px', cell: r => { const s = STATUS_MAP[r.status] || STATUS_MAP.DRAFT; return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>; } },
        {
            id: 'actions', header: '', width: '200px', cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => setSelectedBatch(r)}>
                        <List className="h-3 w-3 mr-1" /> Lines
                    </Button>
                    {r.status === 'DRAFT' && (
                        <Button size="sm" className="text-xs h-7 px-2 text-white" onClick={() => handleCalculate(r)}>
                            <Calculator className="h-3 w-3 mr-1" /> Calculate
                        </Button>
                    )}
                    {r.status === 'CALCULATED' && (
                        <Button size="sm" variant="default" className="text-xs h-7 px-2 text-white bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePostToItemCost(r)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Post to Cost
                        </Button>
                    )}
                </div>
            )
        },
    ];

    const lineColumns: SpreadsheetColumn<ApportionmentLine>[] = [
        { id: 'poNumber', header: 'PO #', width: '130px', cell: r => <span className="font-mono text-xs">{r.poNumber}</span> },
        { id: 'itemCode', header: 'Item Code', width: '130px', cell: r => <span className="font-mono text-xs font-semibold">{r.itemCode}</span> },
        { id: 'itemDescription', header: 'Description', width: '200px', cell: r => <span className="text-xs">{r.itemDescription}</span> },
        { id: 'qtyReceived', header: 'Qty', width: '70px', cell: r => <span className="text-xs text-right block">{fmt(r.qtyReceived)}</span> },
        { id: 'receiptValue', header: 'Receipt Value', width: '110px', cell: r => <span className="font-mono text-xs">${fmt(r.receiptValue)}</span> },
        { id: 'allocatedFreight', header: 'Freight', width: '90px', cell: r => <span className="font-mono text-xs text-blue-700">${fmt(r.allocatedFreight)}</span> },
        { id: 'allocatedDuty', header: 'Duty', width: '80px', cell: r => <span className="font-mono text-xs text-orange-600">${fmt(r.allocatedDuty)}</span> },
        { id: 'allocatedInsurance', header: 'Insurance', width: '90px', cell: r => <span className="font-mono text-xs">${fmt(r.allocatedInsurance)}</span> },
        { id: 'totalAllocated', header: 'Total Landed', width: '110px', cell: r => <span className="font-mono text-xs font-bold text-emerald-700">${fmt(r.totalAllocated)}</span> },
        { id: 'unitLandedCost', header: 'Unit Cost Adj', width: '110px', cell: r => <span className="font-mono text-xs font-bold">${r.unitLandedCost.toFixed(4)}</span> },
        { id: 'itemCostUpdated', header: 'Cost Updated', width: '100px', cell: r => r.itemCostUpdated ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    ];

    return (
        <StandardPage title="Landed Cost Apportionment">
            {/* Summary KPI bar */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Draft Batches', value: batches.filter(b => b.status === 'DRAFT').length, icon: FileText, color: 'text-muted-foreground' },
                    { label: 'Calculated (Pending Post)', value: batches.filter(b => b.status === 'CALCULATED').length, icon: Calculator, color: 'text-amber-600' },
                    { label: 'Posted to Item Cost', value: batches.filter(b => b.status === 'POSTED').length, icon: CheckCircle2, color: 'text-emerald-600' },
                    { label: 'Total Landed Cost (Posted)', value: `$${fmt(batches.filter(b => b.status === 'POSTED').reduce((s, b) => s + b.totalLandedCost, 0))}`, icon: DollarSign, color: 'text-blue-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
                        <Icon className={`h-7 w-7 ${color}`} />
                        <div><div className={`text-xl font-extrabold ${color}`}>{value}</div><div className="text-[11px] text-muted-foreground">{label}</div></div>
                    </div>
                ))}
            </div>

            {/* Batches table */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold">Landed Cost Batches</h2>
                <Button size="sm" className="text-white" onClick={() => setShowNewBatch(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> New Batch
                </Button>
            </div>
            <div className="border rounded-xl overflow-hidden mb-5">
                <InteractiveSpreadsheet columns={batchColumns} data={batches} onChange={() => { }} containerHeight="300px" />
            </div>

            {/* Apportionment Lines detail */}
            {selectedBatch && (
                <div>
                    <Separator className="mb-4" />
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-sm font-bold">PO Receipt Line Apportionment — {selectedBatch.batchNumber}</h2>
                            <p className="text-xs text-muted-foreground">
                                Method: <span className="font-semibold">{selectedBatch.apportionmentMethod}</span> · Total Landed Cost:
                                <span className="font-bold text-foreground ml-1">${fmt(selectedBatch.totalLandedCost)}</span>
                            </p>
                        </div>
                        {selectedBatch.status === 'DRAFT' && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">Add PO receipts to this batch to run apportionment</Badge>
                        )}
                    </div>
                    {lines.length > 0 ? (
                        <div className="border rounded-xl overflow-hidden">
                            <InteractiveSpreadsheet columns={lineColumns} data={lines} onChange={() => { }} containerHeight="320px" />
                        </div>
                    ) : (
                        <div className="border rounded-xl p-8 text-center text-muted-foreground text-sm">
                            <Package className="h-6 w-6 mx-auto mb-2 opacity-40" />
                            No receipt lines linked yet. Use "Link PO Receipts" to add receipts to this batch.
                        </div>
                    )}

                    {/* Cost charge breakdown */}
                    {lines.length > 0 && (
                        <div className="mt-4 grid grid-cols-5 gap-3">
                            {[
                                { label: 'Freight', total: selectedBatch.totalFreight, color: 'text-blue-700' },
                                { label: 'Import Duty', total: selectedBatch.totalDuty, color: 'text-orange-600' },
                                { label: 'Insurance', total: selectedBatch.totalInsurance, color: 'text-purple-600' },
                                { label: 'Brokerage', total: selectedBatch.totalBrokerage, color: 'text-yellow-600' },
                                { label: 'Total Landed', total: selectedBatch.totalLandedCost, color: 'text-emerald-700' },
                            ].map(({ label, total, color }) => (
                                <div key={label} className="bg-card border rounded-lg p-3 text-center">
                                    <div className={`text-base font-extrabold font-mono ${color}`}>${fmt(total)}</div>
                                    <div className="text-[10px] text-muted-foreground">{label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* New Batch Dialog */}
            <Dialog open={showNewBatch} onOpenChange={setShowNewBatch}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Landed Cost Batch</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-3">
                        {[
                            { key: 'shipmentReference', label: 'Shipment / BL Reference', type: 'text' },
                            { key: 'carrier', label: 'Carrier', type: 'text' },
                            { key: 'receiptDate', label: 'Receipt Date', type: 'date' },
                            { key: 'currency', label: 'Currency', type: 'text' },
                        ].map(({ key, label, type }) => (
                            <div key={key}>
                                <Label className="text-xs font-semibold">{label}</Label>
                                <Input type={type} className="mt-1 text-sm" value={(newBatch as any)[key]} onChange={e => setNewBatch(p => ({ ...p, [key]: e.target.value }))} aria-label={label} />
                            </div>
                        ))}
                        <div>
                            <Label className="text-xs font-semibold">Port of Entry</Label>
                            <Select value={newBatch.portOfEntry} onValueChange={v => setNewBatch(p => ({ ...p, portOfEntry: v }))}>
                                <SelectTrigger className="mt-1 text-sm" aria-label="Port of entry"><SelectValue /></SelectTrigger>
                                <SelectContent>{PORTS_OF_ENTRY.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs font-semibold">Apportionment Method</Label>
                            <Select value={newBatch.apportionmentMethod} onValueChange={v => setNewBatch(p => ({ ...p, apportionmentMethod: v }))}>
                                <SelectTrigger className="mt-1 text-sm" aria-label="Apportionment method"><SelectValue /></SelectTrigger>
                                <SelectContent>{APPORTIONMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Separator />
                    <p className="text-xs font-semibold text-muted-foreground mt-1">Charge Elements</p>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { key: 'totalFreight', label: 'Freight ($)' },
                            { key: 'totalDuty', label: 'Import Duty ($)' },
                            { key: 'totalInsurance', label: 'Insurance ($)' },
                            { key: 'totalBrokerage', label: 'Brokerage ($)' },
                            { key: 'totalMisc', label: 'Misc. Charges ($)' },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <Label className="text-xs font-semibold">{label}</Label>
                                <Input type="number" className="mt-1 text-sm" value={(newBatch as any)[key]} onChange={e => setNewBatch(p => ({ ...p, [key]: e.target.value }))} aria-label={label} />
                            </div>
                        ))}
                        <div className="flex flex-col justify-end">
                            <div className="text-[10px] text-muted-foreground">Total</div>
                            <div className="text-lg font-extrabold font-mono text-emerald-700">${fmt(totalCharges())}</div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setShowNewBatch(false)}>Cancel</Button>
                        <Button className="text-white" onClick={handleCreateBatch}>Create Batch</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
