import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Play, Trash2, ChevronRight, Table2, BarChart3 } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

interface FSGRow {
    rowNum: number;
    label: string;
    accountRange?: string;
    formula?: string;
    indent?: number;
    isBold?: boolean;
    isTotal?: boolean;
}

interface FSGColumn {
    colNum: number;
    label: string;
    periodOffset?: number;
    scenario?: string;
}

interface ReportDef {
    id: string;
    name: string;
    report_type: string;
    is_published: boolean;
}

async function listReports(): Promise<ReportDef[]> {
    const res = await fetch('/api/finance/fsg-reports');
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
}

async function runReport(params: { reportDefinitionId: string; periodName: string; ledgerId: string }): Promise<any> {
    const res = await fetch('/api/finance/fsg-reports/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to run report');
    return res.json();
}

const REPORT_TYPES = ['IncomeStatement', 'BalanceSheet', 'CashFlow', 'Custom'] as const;
const DEFAULT_IS_ROWS: FSGRow[] = [
    { rowNum: 1, label: 'Revenue', accountRange: '4000-4999', isBold: false },
    { rowNum: 2, label: 'Cost of Goods Sold', accountRange: '5000-5999', isBold: false },
    { rowNum: 3, label: 'Gross Profit', formula: 'R1 - R2', isBold: true, isTotal: true },
    { rowNum: 4, label: 'Operating Expenses', accountRange: '6000-6999', isBold: false },
    { rowNum: 5, label: 'Operating Income', formula: 'R3 - R4', isBold: true, isTotal: true },
];
const DEFAULT_COLUMNS: FSGColumn[] = [
    { colNum: 1, label: 'Actual (Current)', periodOffset: 0, scenario: 'Actual' },
    { colNum: 2, label: 'Actual (Prior Year)', periodOffset: -12, scenario: 'Actual' },
    { colNum: 3, label: 'Budget', periodOffset: 0, scenario: 'Budget' },
];

export default function FSGReportBuilder() {
    const [activeTab, setActiveTab] = useState<'library' | 'builder'>('library');
    const [reportName, setReportName] = useState('New Report');
    const [reportType, setReportType] = useState<typeof REPORT_TYPES[number]>('IncomeStatement');
    const [rows, setRows] = useState<FSGRow[]>(DEFAULT_IS_ROWS);
    const [columns, setColumns] = useState<FSGColumn[]>(DEFAULT_COLUMNS);
    const [runParams, setRunParams] = useState({ periodName: '', ledgerId: '' });
    const [runResult, setRunResult] = useState<any>(null);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    const qc = useQueryClient();
    const { data: reports = [] } = useQuery<any>({ queryKey: ['fsg-reports'], queryFn: listReports });

    const runMutation = useMutation({
        mutationFn: runReport,
        onSuccess: (data) => setRunResult(data),
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) =>
            fetch('/api/finance/fsg-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['fsg-reports'] }),
    });

    const addRow = () => setRows(r => [...r, {
        rowNum: (r.at(-1)?.rowNum ?? 0) + 1,
        label: 'New Row',
    }]);

    const removeRow = (rowNum: number) => setRows(r => r.filter(row => row.rowNum !== rowNum));

    const updateRow = (rowNum: number, field: keyof FSGRow, value: any) =>
        setRows(r => r.map(row => row.rowNum === rowNum ? { ...row, [field]: value } : row));

    const handleRun = useCallback(() => {
        if (!selectedReport || !runParams.periodName || !runParams.ledgerId) return;
        runMutation.mutate({ reportDefinitionId: selectedReport, ...runParams });
    }, [selectedReport, runParams, runMutation]);

    const runResultColumns: SpreadsheetColumn<FSGRow>[] = [
        {
            id: 'row-label',
            header: 'Row',
            width: '250px',
            cell: (row) => (
                <div style={{ paddingLeft: `${(row.indent ?? 0) * 16 + 12}px`, fontWeight: row.isBold ? 700 : 400 }}>
                    {row.label}
                </div>
            )
        },
        ...(runResult?.columns ?? []).map((c: FSGColumn) => ({
            id: `col-${c.colNum}`,
            header: c.label,
            width: '150px',
            cell: (row: any) => {
                const val = runResult?.data?.[row.rowNum]?.[c.colNum] ?? 0;
                return (
                    <div className={`text-right w-full font-variant-numeric tabular-nums ${val < 0 ? 'text-red-600' : ''}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)}
                    </div>
                );
            }
        }))
    ];

    const editorColumns: SpreadsheetColumn<FSGRow>[] = [
        { id: "rowNum", header: "#", width: "50px", cell: (row) => <div className="text-center font-bold text-zinc-500">{row.rowNum}</div> },
        { id: "label", header: "Label", width: "200px", cell: (row) => <input className="w-full px-2 py-1 border rounded" aria-label="Label" value={row.label} onChange={e => updateRow(row.rowNum, 'label', e.target.value)} /> },
        { id: "accountRange", header: "Account Range", width: "150px", cell: (row) => <input className="w-full px-2 py-1 border rounded font-mono" aria-label="Account Range" value={row.accountRange ?? ''} placeholder="e.g. 5000-5999" onChange={e => updateRow(row.rowNum, 'accountRange', e.target.value)} /> },
        { id: "formula", header: "Formula (e.g. R1+R2)", width: "150px", cell: (row) => <input className="w-full px-2 py-1 border rounded font-mono" aria-label="Formula" value={row.formula ?? ''} placeholder="e.g. R1 - R2" onChange={e => updateRow(row.rowNum, 'formula', e.target.value)} /> },
        { id: "isBold", header: "Bold", width: "60px", cell: (row) => <div className="text-center w-full"><input type="checkbox" aria-label="Bold" checked={!!row.isBold} onChange={e => updateRow(row.rowNum, 'isBold', e.target.checked)} /></div> },
        { id: "isTotal", header: "Total", width: "60px", cell: (row) => <div className="text-center w-full"><input type="checkbox" aria-label="Total" checked={!!row.isTotal} onChange={e => updateRow(row.rowNum, 'isTotal', e.target.checked)} /></div> },
        { id: "delete", header: "Del", width: "60px", cell: (row) => <button className="p-1 text-red-600 hover:bg-red-100 rounded w-full flex justify-center" aria-label="Delete" onClick={() => removeRow(row.rowNum)}><Trash2 size={14} /></button> }
    ];

    return (
        <StandardPage
            title="FSG Report Builder"
            description="Oracle FSG-equivalent — define rows, columns, account ranges & formulas"
            actions={
                <div className="fsg-tabs">
                    {(['library', 'builder'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`fsg-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            aria-selected={activeTab === tab}
                        >
                            {tab === 'library' ? <Table2 size={14} /> : <BarChart3 size={14} />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            }
        >
            {activeTab === 'library' ? (
                <div className="fsg-library">
                    {/* Run Panel */}
                    <div className="run-panel">
                        <h2 className="panel-title">Run a Report</h2>
                        <div className="run-row">
                            <select
                                value={selectedReport ?? ''}
                                onChange={e => setSelectedReport(e.target.value)}
                                className="fsg-select"
                                aria-label="Select report"
                            >
                                <option value="">Select report…</option>
                                {reports.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <input
                                className="fsg-input"
                                placeholder="Period (e.g. Jan-2026)"
                                value={runParams.periodName}
                                onChange={e => setRunParams(p => ({ ...p, periodName: e.target.value }))}
                                aria-label="Period name"
                            />
                            <input
                                className="fsg-input"
                                placeholder="Ledger ID"
                                value={runParams.ledgerId}
                                onChange={e => setRunParams(p => ({ ...p, ledgerId: e.target.value }))}
                                aria-label="Ledger ID"
                            />
                            <button
                                className="run-btn"
                                onClick={handleRun}
                                disabled={runMutation.isPending || !selectedReport}
                                aria-label="Run report"
                            >
                                <Play size={14} />
                                {runMutation.isPending ? 'Running…' : 'Run'}
                            </button>
                        </div>
                    </div>

                    {/* Run Result */}
                    {runResult && (
                        <div className="run-result">
                            <h2 className="panel-title">{runResult.reportName} — {runResult.periodName}</h2>
                            <div className="border rounded-lg overflow-hidden h-[300px]">
                                <InteractiveSpreadsheet
                                    columns={runResultColumns}
                                    data={runResult.rows ?? []}
                                    onChange={() => { }}
                                    containerHeight="100%"
                                />
                            </div>
                        </div>
                    )}

                    {/* Report Library */}
                    <div className="report-cards">
                        {reports.map(r => (
                            <div key={r.id} className="report-card" onClick={() => { setSelectedReport(r.id); }}>
                                <div className="report-card-name">{r.name}</div>
                                <div className="report-card-type">{r.report_type}</div>
                                <ChevronRight size={16} color="#9ca3af" />
                            </div>
                        ))}
                        {reports.length === 0 && (
                            <div className="empty-library">No reports yet — use the Builder tab to create one</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="fsg-design">
                    <div className="design-toolbar">
                        <input
                            className="report-name-input"
                            value={reportName}
                            onChange={e => setReportName(e.target.value)}
                            aria-label="Report name"
                        />
                        <select
                            value={reportType}
                            onChange={e => setReportType(e.target.value as any)}
                            className="fsg-select"
                            aria-label="Report type"
                        >
                            {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button
                            className="save-btn"
                            onClick={() => saveMutation.mutate({ name: reportName, reportType, rows, columns })}
                            disabled={saveMutation.isPending}
                            aria-label="Save report"
                        >
                            {saveMutation.isPending ? 'Saving…' : 'Save Report'}
                        </button>
                    </div>

                    {/* Rows Editor */}
                    <div className="editor-section">
                        <div className="editor-header">
                            <h2 className="panel-title">Rows</h2>
                            <button className="add-row-btn" onClick={addRow} aria-label="Add row">
                                <Plus size={14} /> Add Row
                            </button>
                        </div>
                        <div className="border rounded-lg overflow-hidden h-[400px]">
                            <InteractiveSpreadsheet
                                columns={editorColumns}
                                data={rows}
                                onChange={() => { }}
                                containerHeight="100%"
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .fsg-builder { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .fsg-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .fsg-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .fsg-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .fsg-tabs { display: flex; gap: 2px; background: #f3f4f6; border-radius: 10px; padding: 3px; }
                .fsg-tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; background: transparent; color: #6b7280; transition: all 0.2s; }
                .fsg-tab.active { background: #fff; color: #1d4ed8; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
                .run-panel, .run-result, .report-cards { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
                .panel-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 16px; }
                .run-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
                .fsg-select, .fsg-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; flex: 1; min-width: 160px; }
                .run-btn { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
                .run-btn:disabled { background: #9ca3af; }
                .report-cards { display: flex; flex-direction: column; gap: 8px; }
                .report-card { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
                .report-card:hover { background: #eff6ff; border-color: #bfdbfe; }
                .report-card-name { font-weight: 600; color: #111827; }
                .report-card-type { font-size: 12px; color: #6b7280; }
                .empty-library { text-align: center; padding: 40px; color: #9ca3af; }
                .fsg-design { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
                .design-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
                .report-name-input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; font-weight: 600; }
                .save-btn { padding: 9px 20px; background: #059669; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
                .save-btn:disabled { background: #9ca3af; }
                .editor-section { margin-top: 20px; }
                .editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .add-row-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: #f0f9ff; border: 1px solid #bfdbfe; color: #1d4ed8; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
            `}</style>
        </StandardPage >
    );
}
