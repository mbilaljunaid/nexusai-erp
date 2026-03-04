import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
interface NineBoxEntry { employee_id: string; performance: number; potential: number; box_label: string; assessed_by: string; notes: string; }

const BOX_CONFIG: Record<string, { bg: string; border: string; label: string }> = {
    'Underperformer': { bg: '#fef2f2', border: '#fca5a5', label: 'Underperformer' },
    'Inconsistent Player': { bg: '#fff7ed', border: '#fdba74', label: 'Inconsistent' },
    'Enigma': { bg: '#fefce8', border: '#fde047', label: 'Enigma' },
    'Core Player': { bg: '#f0f9ff', border: '#7dd3fc', label: 'Core Player' },
    'High Potential': { bg: '#eff6ff', border: '#93c5fd', label: 'High Potential' },
    'Solid Performer': { bg: '#f0fdf4', border: '#86efac', label: 'Solid Performer' },
    'High Performer': { bg: '#d1fae5', border: '#34d399', label: 'High Performer' },
    'Star': { bg: '#fdf4ff', border: '#c084fc', label: '⭐ Star' },
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
        { id: "employee_id", header: "Employee", width: "150px", cell: (row) => <span style={{ fontWeight: 600 }}>{row.employee_id}</span> },
        {
            id: "box_label", header: "Box", width: "150px", cell: (row) => {
                const cfg = BOX_CONFIG[row.box_label] ?? { bg: '#f9fafb', border: '#e5e7eb', label: row.box_label };
                return <span style={{ padding: '2px 6px', borderRadius: 4, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 9, fontWeight: 700 }}>{cfg.label}</span>
            }
        },
        { id: "performance", header: "Performance", width: "100px", cell: (row) => ['', '🔴 Low', '🟡 Medium', '🟢 High'][row.performance] },
        { id: "potential", header: "Potential", width: "100px", cell: (row) => ['', '🔴 Low', '🟡 Medium', '🟢 High'][row.potential] },
        { id: "assessed_by", header: "Assessed By", width: "150px", cell: (row) => <span style={{ color: '#6b7280' }}>{row.assessed_by || '—'}</span> },
        { id: "notes", header: "Notes", width: "250px", cell: (row) => <span style={{ color: '#6b7280', display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.notes || '—'}</span> }
    ];

    return (
        <StandardPage
            title="Nine-Box Talent Grid"
            description="Performance × Potential · Cascading goal alignment · GDPR-compliant"
            actions={
                <div style={{ display: 'flex', gap: 8 }}>
                    <input value={period} onChange={e => setPeriod(e.target.value)} placeholder="YYYY" style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 12, width: 80 }} aria-label="Year" />
                    <button onClick={() => setShowAdd(true)} style={{ padding: '6px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Add Assessment</button>
                    <button onClick={() => purgeMut.mutate()} style={{ padding: '6px 12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer' }} title="GDPR purge expired records">🔒 GDPR Purge</button>
                </div>
            }
        >

            {showAdd && (
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>New Assessment — {period}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 8 }}>
                        {[['Employee ID', 'employeeId', 'text'], ['Assessed By', 'assessedBy', 'text']].map(([lbl, key, type]) => (
                            <div key={key}><label style={{ fontSize: 10, fontWeight: 700, display: 'block' }}>{lbl}</label>
                                <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '5px 8px', border: '1px solid #e9d5ff', borderRadius: 6, fontSize: 11, boxSizing: 'border-box' }} aria-label={lbl} />
                            </div>
                        ))}
                        {[['Performance', 'performance'], ['Potential', 'potential']].map(([lbl, key]) => (
                            <div key={key}><label style={{ fontSize: 10, fontWeight: 700, display: 'block' }}>{lbl}</label>
                                <select value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '5px 8px', border: '1px solid #e9d5ff', borderRadius: 6, fontSize: 11 }} aria-label={lbl}>
                                    <option value="1">1 — Low</option><option value="2">2 — Medium</option><option value="3">3 — High</option>
                                </select>
                            </div>
                        ))}
                        <div><label style={{ fontSize: 10, fontWeight: 700, display: 'block' }}>Notes</label>
                            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ width: '100%', padding: '5px 8px', border: '1px solid #e9d5ff', borderRadius: 6, fontSize: 11, boxSizing: 'border-box' }} aria-label="Notes" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowAdd(false)} style={{ padding: '5px 12px', background: '#e5e7eb', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.employeeId} onClick={() => addMut.mutate({ employeeId: form.employeeId, period, performance: parseInt(form.performance), potential: parseInt(form.potential), assessedBy: form.assessedBy || null, notes: form.notes || null })} style={{ padding: '5px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                    </div>
                </div>
            )}

            {/* Axis labels */}
            <div style={{ display: 'flex', gap: 8 }}>
                {/* Performance Y-label */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 28 }}>
                    <span style={{ fontSize: 9, color: '#6b7280', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 2 }}>PERFORMANCE ↑</span>
                </div>
                <div style={{ flex: 1 }}>
                    {/* Potential X-label */}
                    <div style={{ textAlign: 'center', fontSize: 9, color: '#6b7280', marginBottom: 4, letterSpacing: 2 }}>← LOW · POTENTIAL · HIGH →</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {GRID_MAP.map((cell, i) => {
                            const entries = boxEntries(cell.perf, cell.pot);
                            const cfg = BOX_CONFIG[cell.key] ?? { bg: '#f9fafb', border: '#e5e7eb', label: cell.key };
                            return (
                                <div key={i} style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, borderRadius: 12, padding: 10, minHeight: 100 }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: '#374151', marginBottom: 6 }}>{cfg.label}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {entries.map((e, j) => (
                                            <div key={j} style={{ background: '#fff', border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '3px 6px', fontSize: 9 }}>
                                                <div style={{ fontWeight: 700 }}>{e.employee_id}</div>
                                                {e.assessed_by && <div style={{ color: '#9ca3af' }}>by {e.assessed_by}</div>}
                                            </div>
                                        ))}
                                        {entries.length === 0 && <div style={{ color: '#d1d5db', fontSize: 9, fontStyle: 'italic' }}>empty</div>}
                                    </div>
                                    <div style={{ marginTop: 4, fontSize: 8, color: '#9ca3af' }}>P={cell.perf} × pt={cell.pot}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Summary table */}
            <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', height: 400 }}>
                <InteractiveSpreadsheet
                    columns={gridColumns}
                    data={grid}
                    onChange={() => { }}
                    containerHeight="400px"
                />
                {grid.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', borderTop: '1px solid #e5e7eb' }}>No assessments for {period}</div>}
            </div>
        </StandardPage>
    );
}
