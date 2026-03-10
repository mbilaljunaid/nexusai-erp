import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
interface NineBoxEntry { employee_id: string; performance: number; potential: number; box_label: string; assessed_by: string; notes: string; }

const BOX_CONFIG: Record<string, { bg: string; border: string; label: string }> = {
    'Underperformer': { bg: 'bg-red-500/10', border: 'border-red-300', label: 'Underperformer' },
    'Inconsistent Player': { bg: 'bg-orange-500/10', border: 'border-orange-300', label: 'Inconsistent' },
    'Enigma': { bg: 'bg-yellow-500/10', border: 'border-yellow-300', label: 'Enigma' },
    'Core Player': { bg: 'bg-sky-500/10', border: 'border-sky-300', label: 'Core Player' },
    'High Potential': { bg: 'bg-blue-500/10', border: 'border-blue-300', label: 'High Potential' },
    'Solid Performer': { bg: 'bg-green-500/10', border: 'border-green-300', label: 'Solid Performer' },
    'High Performer': { bg: 'bg-emerald-100', border: 'border-emerald-400', label: 'High Performer' },
    'Star': { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-400', label: '⭐ Star' },
};

// 3×3 grid layout: potential (col) × performance (row)
const GRID_MAP: { perf: number; pot: number; key: string }[] = [
    { perf: 3, pot: 1, key: 'Solid Performer' }, { perf: 3, pot: 2, key: 'High Performer' }, { perf: 3, pot: 3, key: 'Star' },
    { perf: 2, pot: 1, key: 'Core Player' }, { perf: 2, pot: 2, key: 'Core Player' }, { perf: 2, pot: 3, key: 'High Potential' },
    { perf: 1, pot: 1, key: 'Underperformer' }, { perf: 1, pot: 2, key: 'Inconsistent Player' }, { perf: 1, pot: 3, key: 'Enigma' },
];

export default function NineBoxGrid() {
    const [period, setPeriod] = useState(String(new Date().getFullYear()));
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ employeeId: '', performance: '2', potential: '2', assessedBy: '', notes: '' });
    const qc = useQueryClient();

    const { data: grid = [] } = useQuery<NineBoxEntry[]>({ queryKey: ['nine-box', period], queryFn: () => fetch(`/api/ext/talent/nine-box?period=${period}`).then(r => r.json()) });

    const addMut = useMutation({
        mutationFn: (d: any) => fetch('/api/ext/talent/nine-box', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['nine-box'] }); setShowAdd(false); }
    });
    const purgeMut = useMutation({
        mutationFn: () => fetch('/api/ext/talent/nine-box/gdpr-purge', { method: 'DELETE' }).then(r => r.json()),
    });

    const boxEntries = (perf: number, pot: number) => grid.filter(e => e.performance === perf && e.potential === pot);

    const gridColumns: SpreadsheetColumn<any>[] = [
        { id: "employee_id", header: "Employee", width: "150px", cell: (row) => <span className="font-semibold">{row.employee_id}</span> },
        {
            id: "box_label", header: "Box", width: "150px", cell: (row) => {
                const cfg = BOX_CONFIG[row.box_label] ?? { bg: 'bg-gray-500/10', border: 'border-border', label: row.box_label };
                return <span className={cn(`px-1.5 py-0.5 rounded text-[9px] font-bold border ${cfg.bg} ${cfg.border}`)}>{cfg.label}</span>
            }
        },
        { id: "performance", header: "Performance", width: "100px", cell: (row) => ['', '🔴 Low', '🟡 Medium', '🟢 High'][row.performance] },
        { id: "potential", header: "Potential", width: "100px", cell: (row) => ['', '🔴 Low', '🟡 Medium', '🟢 High'][row.potential] },
        { id: "assessed_by", header: "Assessed By", width: "150px", cell: (row) => <span className="text-muted-foreground">{row.assessed_by || '—'}</span> },
        { id: "notes", header: "Notes", width: "250px", cell: (row) => <span className="text-muted-foreground block max-w-48 overflow-hidden text-ellipsis whitespace-nowrap">{row.notes || '—'}</span> }
    ];

    return (
        <StandardPage
            title="Nine-Box Talent Grid"
            description="Performance × Potential · Cascading goal alignment · GDPR-compliant"
            actions={
                <div className="flex gap-2">
                    <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="YYYY" className="h-7 rounded-[7px] text-xs w-20" aria-label="Year" />
                    <Button variant="default" size="sm" onClick={() => setShowAdd(true)} className="text-white text-[11px] hover:">+ Add Assessment</Button>
                    <Button variant="secondary" size="sm" onClick={() => purgeMut.mutate()} className="text-muted-foreground text-[11px] hover:" title="GDPR purge expired records">🔒 GDPR Purge</Button>
                </div>
            }
        >

            {showAdd && (
                <Card className="bg-purple-500/10 border-purple-200 p-3.5 mb-4 shadow-sm">
                    <div className="font-bold text-xs mb-2">New Assessment — {period}</div>
                    <div className="grid grid-cols-5 gap-2 mb-2">
                        {[['Employee ID', 'employeeId', 'text'], ['Assessed By', 'assessedBy', 'text']].map(([lbl, key, type]) => (
                            <div key={key}><Label className="text-[10px] font-bold block">{lbl}</Label>
                                <Input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="w-full h-7 px-2 py-1 border-purple-200 rounded-md text-[11px]" aria-label={lbl} />
                            </div>
                        ))}
                        {[['Performance', 'performance'], ['Potential', 'potential']].map(([lbl, key]) => (
                            <div key={key}><Label className="text-[10px] font-bold block">{lbl}</Label>
                                <Select value={(form as any)[key]} onValueChange={v => setForm(p => ({ ...p, [key]: v }))}>
                                    <SelectTrigger className="w-full text-[11px]" aria-label={lbl}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 — Low</SelectItem><SelectItem value="2">2 — Medium</SelectItem><SelectItem value="3">3 — High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                        <div><Label className="text-[10px] font-bold block">Notes</Label>
                            <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full h-7 px-2 py-1 border-purple-200 rounded-md text-[11px]" aria-label="Notes" />
                        </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                        <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)} className="text-[11px] hover:">Cancel</Button>
                        <Button variant="default" size="sm" disabled={!form.employeeId} onClick={() => addMut.mutate({ employeeId: form.employeeId, period, performance: parseInt(form.performance), potential: parseInt(form.potential), assessedBy: form.assessedBy || null, notes: form.notes || null })} className="text-white text-[11px] hover: disabled:opacity-50 disabled:">Save</Button>
                    </div>
                </Card>
            )}

            {/* Axis labels */}
            <div className="flex gap-2">
                {/* Performance Y-label */}
                <div className="flex flex-col justify-center items-center w-7">
                    <span className="text-[9px] text-muted-foreground [writing-mode:vertical-rl] rotate-180 tracking-[2px]">PERFORMANCE ↑</span>
                </div>
                <div className="flex-1">
                    {/* Potential X-label */}
                    <div className="text-center text-[9px] text-muted-foreground mb-1 tracking-[2px]">← LOW · POTENTIAL · HIGH →</div>
                    <div className="grid grid-cols-3 gap-2">
                        {GRID_MAP.map((cell, i) => {
                            const entries = boxEntries(cell.perf, cell.pot);
                            const cfg = BOX_CONFIG[cell.key] ?? { bg: 'bg-gray-500/10', border: 'border-border', label: cell.key };
                            return (
                                <div key={i} className={cn(`rounded-xl p-2.5 min-h-24 border-[2px] ${cfg.bg} ${cfg.border}`)}>
                                    <div className="text-[10px] font-extrabold text-foreground/90 mb-1.5">{cfg.label}</div>
                                    <div className="flex flex-wrap gap-1">
                                        {entries.map((e, j) => (
                                            <div key={j} className={cn(`bg-card rounded-md px-1.5 py-0.5 text-[9px] border ${cfg.border}`)}>
                                                <div className="font-bold">{e.employee_id}</div>
                                                {e.assessed_by && <div className="text-muted-foreground/70">by {e.assessed_by}</div>}
                                            </div>
                                        ))}
                                        {entries.length === 0 && <div className="text-gray-300 text-[9px] italic">empty</div>}
                                    </div>
                                    <div className="mt-1 text-[8px] text-muted-foreground/70">P={cell.perf} × pt={cell.pot}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Summary table */}
            <Card className="mt-5 overflow-hidden h-[400px]">
                <InteractiveSpreadsheet
                    columns={gridColumns}
                    data={grid}
                    onChange={() => { }}
                    containerHeight="400px"
                />
                {grid.length === 0 && <div className="p-6 text-center text-muted-foreground/70 border-t border-border">No assessments for {period}</div>}
            </Card>
        </StandardPage>
    );
}
