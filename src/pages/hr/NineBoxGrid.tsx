import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface NineBoxEntry { employee_id: string; performance: number; potential: number; box_label: string; assessed_by: string; notes: string; }

const BOX_CONFIG: Record<string, { bg: string; border: string; label: string }> = {
    'Underperformer': { bg: 'bg-red-50', border: 'border-red-300', label: 'Underperformer' },
    'Inconsistent Player': { bg: 'bg-orange-50', border: 'border-orange-300', label: 'Inconsistent' },
    'Enigma': { bg: 'bg-yellow-50', border: 'border-yellow-300', label: 'Enigma' },
    'Core Player': { bg: 'bg-sky-50', border: 'border-sky-300', label: 'Core Player' },
    'High Potential': { bg: 'bg-blue-50', border: 'border-blue-300', label: 'High Potential' },
    'Solid Performer': { bg: 'bg-green-50', border: 'border-green-300', label: 'Solid Performer' },
    'High Performer': { bg: 'bg-emerald-100', border: 'border-emerald-400', label: 'High Performer' },
    'Star': { bg: 'bg-fuchsia-50', border: 'border-fuchsia-400', label: '⭐ Star' },
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
                const cfg = BOX_CONFIG[row.box_label] ?? { bg: 'bg-gray-50', border: 'border-gray-200', label: row.box_label };
                return <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${cfg.bg} ${cfg.border}`}>{cfg.label}</span>
            }
        },
        { id: "performance", header: "Performance", width: "100px", cell: (row) => ['', '🔴 Low', '🟡 Medium', '🟢 High'][row.performance] },
        { id: "potential", header: "Potential", width: "100px", cell: (row) => ['', '🔴 Low', '🟡 Medium', '🟢 High'][row.potential] },
        { id: "assessed_by", header: "Assessed By", width: "150px", cell: (row) => <span className="text-gray-500">{row.assessed_by || '—'}</span> },
        { id: "notes", header: "Notes", width: "250px", cell: (row) => <span className="text-gray-500 block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{row.notes || '—'}</span> }
    ];

    return (
        <StandardPage
            title="Nine-Box Talent Grid"
            description="Performance × Potential · Cascading goal alignment · GDPR-compliant"
            actions={
                <div className="flex gap-2">
                    <input value={period} onChange={e => setPeriod(e.target.value)} placeholder="YYYY" className="px-2.5 py-1.5 border border-gray-300 rounded-[7px] text-xs w-20" aria-label="Year" />
                    <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 bg-violet-600 text-white border-none rounded-lg text-[11px] font-bold cursor-pointer hover:bg-violet-700">+ Add Assessment</button>
                    <button onClick={() => purgeMut.mutate()} className="px-3 py-1.5 bg-gray-100 text-gray-500 border-none rounded-lg text-[11px] cursor-pointer hover:bg-gray-200" title="GDPR purge expired records">🔒 GDPR Purge</button>
                </div>
            }
        >

            {showAdd && (
                <div className="bg-purple-50 border border-purple-200 rounded-[10px] p-3.5 mb-4">
                    <div className="font-bold text-xs mb-2">New Assessment — {period}</div>
                    <div className="grid grid-cols-5 gap-2 mb-2">
                        {[['Employee ID', 'employeeId', 'text'], ['Assessed By', 'assessedBy', 'text']].map(([lbl, key, type]) => (
                            <div key={key}><label className="text-[10px] font-bold block">{lbl}</label>
                                <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="w-full px-2 py-1 border border-purple-200 rounded-md text-[11px] box-border" aria-label={lbl} />
                            </div>
                        ))}
                        {[['Performance', 'performance'], ['Potential', 'potential']].map(([lbl, key]) => (
                            <div key={key}><label className="text-[10px] font-bold block">{lbl}</label>
                                <Select value={(form as any)[key]} onValueChange={v => setForm(p => ({ ...p, [key]: v }))}>
                                    <SelectTrigger className="w-full text-[11px]" aria-label={lbl}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 — Low</SelectItem><SelectItem value="2">2 — Medium</SelectItem><SelectItem value="3">3 — High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                        <div><label className="text-[10px] font-bold block">Notes</label>
                            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full px-2 py-1 border border-purple-200 rounded-md text-[11px] box-border" aria-label="Notes" />
                        </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                        <button onClick={() => setShowAdd(false)} className="px-3 py-1 bg-gray-200 border-none rounded-md text-[11px] cursor-pointer hover:bg-gray-300">Cancel</button>
                        <button disabled={!form.employeeId} onClick={() => addMut.mutate({ employeeId: form.employeeId, period, performance: parseInt(form.performance), potential: parseInt(form.potential), assessedBy: form.assessedBy || null, notes: form.notes || null })} className="px-3 py-1 bg-violet-600 text-white border-none rounded-md text-[11px] font-bold cursor-pointer hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                    </div>
                </div>
            )}

            {/* Axis labels */}
            <div className="flex gap-2">
                {/* Performance Y-label */}
                <div className="flex flex-col justify-center items-center w-7">
                    <span className="text-[9px] text-gray-500 [writing-mode:vertical-rl] rotate-180 tracking-[2px]">PERFORMANCE ↑</span>
                </div>
                <div className="flex-1">
                    {/* Potential X-label */}
                    <div className="text-center text-[9px] text-gray-500 mb-1 tracking-[2px]">← LOW · POTENTIAL · HIGH →</div>
                    <div className="grid grid-cols-3 gap-2">
                        {GRID_MAP.map((cell, i) => {
                            const entries = boxEntries(cell.perf, cell.pot);
                            const cfg = BOX_CONFIG[cell.key] ?? { bg: 'bg-gray-50', border: 'border-gray-200', label: cell.key };
                            return (
                                <div key={i} className={`rounded-xl p-2.5 min-h-[100px] border-[2px] ${cfg.bg} ${cfg.border}`}>
                                    <div className="text-[10px] font-extrabold text-gray-700 mb-1.5">{cfg.label}</div>
                                    <div className="flex flex-wrap gap-1">
                                        {entries.map((e, j) => (
                                            <div key={j} className={`bg-white rounded-md px-1.5 py-[3px] text-[9px] border ${cfg.border}`}>
                                                <div className="font-bold">{e.employee_id}</div>
                                                {e.assessed_by && <div className="text-gray-400">by {e.assessed_by}</div>}
                                            </div>
                                        ))}
                                        {entries.length === 0 && <div className="text-gray-300 text-[9px] italic">empty</div>}
                                    </div>
                                    <div className="mt-1 text-[8px] text-gray-400">P={cell.perf} × pt={cell.pot}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Summary table */}
            <div className="mt-5 bg-white border border-gray-200 rounded-xl overflow-hidden h-[400px]">
                <InteractiveSpreadsheet
                    columns={gridColumns}
                    data={grid}
                    onChange={() => { }}
                    containerHeight="400px"
                />
                {grid.length === 0 && <div className="p-6 text-center text-gray-400 border-t border-gray-200">No assessments for {period}</div>}
            </div>
        </StandardPage>
    );
}
