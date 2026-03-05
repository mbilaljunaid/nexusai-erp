import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle2, AlertCircle, Link2, BarChart3 } from 'lucide-react';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


interface ImportRecord {
    id: string;
    format: string;
    statement_date: string;
    opening_balance: number;
    closing_balance: number;
    total_credits: number;
    total_debits: number;
    transaction_count: number;
    import_status: string;
    currency_code: string;
    imported_at: string;
}

interface BankTx {
    id: string;
    transaction_date: string;
    amount: number;
    direction: string;
    currency_code: string;
    description: string;
    bank_ref: string;
    match_status: string;
}

const STATUS_CFG: Record<string, string> = {
    Parsed: 'bg-emerald-100 text-emerald-600',
    Matched: 'bg-purple-100 text-purple-600',
    Error: 'bg-red-100 text-red-600',
    Pending: 'bg-amber-100 text-amber-600',
};

const fmt = (n: number, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);

export default function BankStatementImport() {
    const [activeImport, setActiveImport] = useState<ImportRecord | null>(null);
    const [format, setFormat] = useState<'BAI2' | 'MT940' | 'CAMT053'>('BAI2');
    const [pasteContent, setPasteContent] = useState('');
    const [matchFilter, setMatchFilter] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const qc = useQueryClient();

    const { data: imports = [], isLoading } = useQuery<ImportRecord[]>({
        queryKey: ['bank-statements'],
        queryFn: () => fetch('/api/treasury/bank-statements').then(r => r.json()),
    });

    const { data: transactions = [] } = useQuery<BankTx[]>({
        queryKey: ['bank-tx', activeImport?.id, matchFilter],
        queryFn: () => activeImport
            ? fetch(`/api/treasury/bank-statements/${activeImport.id}/transactions${matchFilter ? `?matchStatus=${matchFilter}` : ''}`).then(r => r.json())
            : Promise.resolve([]),
        enabled: !!activeImport,
    });

    const importMutation = useMutation({
        mutationFn: (data: { format: string; rawContent: string }) =>
            fetch('/api/treasury/bank-statements/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['bank-statements'] }); setPasteContent(''); },
    });

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setPasteContent(ev.target?.result as string);
        reader.readAsText(file);
    };

    const unmatched = transactions.filter(t => t.match_status === 'Unmatched').length;
    const matched = transactions.filter(t => t.match_status === 'Matched').length;

    const txColumns: SpreadsheetColumn<any>[] = [
        { id: "date", header: "Date", width: "120px", cell: (row) => <span className="mono">{row.transaction_date}</span> },
        { id: "direction", header: "Direction", width: "100px", cell: (row) => <span className={`dir-badge ${row.direction === 'Credit' ? 'cr' : 'dr'}`}>{row.direction}</span> },
        { id: "amount", header: "Amount", width: "120px", cell: (row) => <span className={`mono ${row.direction === 'Credit' ? 'green' : 'red'}`}>{fmt(row.amount, row.currency_code)}</span> },
        { id: "description", header: "Description", width: "250px", cell: (row) => <span className="desc">{row.description ?? '—'}</span> },
        { id: "ref", header: "Ref", width: "120px", cell: (row) => <span className="mono small">{row.bank_ref ?? '—'}</span> },
        {
            id: "status", header: "Status", width: "150px", cell: (row) => (
                row.match_status === 'Matched'
                    ? <span className="matched"><CheckCircle2 size={12} /> Matched</span>
                    : <span className="unmatched"><AlertCircle size={12} /> {row.match_status}</span>
            )
        }
    ];

    return (
        <StandardPage title="Bank Statement Import">
            <div className="bsi-header">
                <div>

                    <p className="bsi-sub">BAI2 · MT940 · CAMT.053 (ISO 20022)</p>
                </div>
            </div>

            <div className="bsi-layout">
                {/* Left: Import Panel */}
                <div className="bsi-import-panel">
                    <div className="fmt-row">
                        {(['BAI2', 'MT940', 'CAMT053'] as const).map(f => (
                            <button key={f} className={`fmt-btn ${format === f ? 'active' : ''}`} onClick={() => setFormat(f)}>{f}</button>
                        ))}
                    </div>
                    <input ref={fileRef} type="file" accept=".txt,.xml,.camt,.mt940,.bai2" onChange={handleFile} hidden />
                    <div className="drop-zone" onClick={() => fileRef.current?.click()}>
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <div className="dz-primary">Click to upload or paste below</div>
                        <div className="dz-sub">{format} format</div>
                    </div>
                    <Textarea className="paste-area" placeholder="Or paste statement content here…" value={pasteContent} onChange={e => setPasteContent(e.target.value)} rows={8} aria-label="Statement content" />
                    <button
                        className="import-btn"
                        disabled={!pasteContent || importMutation.isPending}
                        onClick={() => importMutation.mutate({ format, rawContent: pasteContent })}
                        aria-label="Import statement"
                    >
                        {importMutation.isPending ? 'Importing…' : 'Import Statement'}
                    </button>
                    {importMutation.isSuccess && (
                        <div className="success-msg">
                            <CheckCircle2 size={14} /> Imported {importMutation.data?.transactionCount ?? 0} transactions
                        </div>
                    )}

                    {/* Import History */}
                    <h3 className="hist-title">Import History</h3>
                    {isLoading ? <div className="loading">Loading…</div> : (
                        <div className="hist-list">
                            {imports.map(imp => {
                                const cfg = STATUS_CFG[imp.import_status] ?? 'bg-gray-100 text-gray-500';
                                return (
                                    <div key={imp.id} className={`hist-item ${activeImport?.id === imp.id ? 'selected' : ''}`} onClick={() => setActiveImport(imp)}>
                                        <div className="hist-top">
                                            <span className="hist-fmt">{imp.format}</span>
                                            <span className={`hist-status ${cfg}`}>{imp.import_status}</span>
                                        </div>
                                        <div className="hist-date">{imp.statement_date}</div>
                                        <div className="hist-amounts">
                                            <span className="green">+{fmt(imp.total_credits, imp.currency_code)}</span>
                                            <span className="red">-{fmt(imp.total_debits, imp.currency_code)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {imports.length === 0 && <div className="empty">No imports yet</div>}
                        </div>
                    )}
                </div>

                {/* Right: Transaction Detail */}
                <div className="bsi-tx-panel">
                    {activeImport ? (
                        <>
                            <div className="tx-header">
                                <div>
                                    <div className="tx-title">{activeImport.statement_date} — {activeImport.format}</div>
                                    <div className="tx-sub">{activeImport.transaction_count} transactions</div>
                                </div>
                                <div className="tx-kpis">
                                    <div className="tx-kpi"><span className="kpi-val green">{fmt(activeImport.closing_balance, activeImport.currency_code)}</span><span className="kpi-lbl">Closing</span></div>
                                    <div className="tx-kpi"><span className="kpi-val blue">{matched}</span><span className="kpi-lbl">Matched</span></div>
                                    <div className="tx-kpi"><span className="kpi-val red">{unmatched}</span><span className="kpi-lbl">Unmatched</span></div>
                                </div>
                            </div>
                            <div className="filter-row">
                                {['', 'Matched', 'Unmatched', 'Exception'].map(s => (
                                    <button key={s} className={`filter-pill ${matchFilter === s ? 'active' : ''}`} onClick={() => setMatchFilter(s)}>{s || 'All'}</button>
                                ))}
                            </div>
                            <div className="h-[400px]">
                                {transactions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">No transactions</div>
                                ) : (
                                    <InteractiveSpreadsheet
                                        columns={txColumns}
                                        data={transactions}
                                        onChange={() => { }}
                                        containerHeight="100%"
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="no-select">
                            <FileText size={48} style={{ color: '#d1d5db', marginBottom: 12 }} />
                            <div>Select an import to view transactions</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .bsi-container { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .bsi-header { margin-bottom: 24px; }
                .bsi-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .bsi-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .bsi-layout { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
                .bsi-import-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
                .fmt-row { display: flex; gap: 6px; margin-bottom: 14px; }
                .fmt-btn { flex: 1; padding: 6px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; background: #fff; color: #6b7280; }
                .fmt-btn.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
                .drop-zone { border: 2px dashed #d1d5db; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; margin-bottom: 12px; }
                .drop-zone:hover { border-color: #1d4ed8; background: #eff6ff; }
                .dz-primary { font-size: 13px; font-weight: 600; color: #374151; }
                .dz-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
                .paste-area { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; font-size: 11px; font-family: monospace; resize: vertical; }
                .import-btn { width: 100%; padding: 10px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 10px; }
                .import-btn:disabled { background: #9ca3af; }
                .success-msg { display: flex; align-items: center; gap: 6px; color: #059669; font-size: 12px; margin-top: 8px; }
                .hist-title { font-size: 13px; font-weight: 700; color: #374151; margin: 16px 0 8px; }
                .hist-list { display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; }
                .hist-item { padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
                .hist-item.selected { border-color: #1d4ed8; background: #eff6ff; }
                .hist-item:hover { background: #f9fafb; }
                .hist-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .hist-fmt { font-size: 11px; font-weight: 700; color: #1d4ed8; }
                .hist-status { padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
                .hist-date { font-size: 11px; color: #6b7280; font-family: monospace; }
                .hist-amounts { display: flex; gap: 10px; font-size: 11px; margin-top: 4px; font-family: monospace; }
                .loading, .empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 16px; }
                .bsi-tx-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
                .tx-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
                .tx-title { font-size: 15px; font-weight: 700; color: #111827; }
                .tx-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
                .tx-kpis { display: flex; gap: 16px; }
                .tx-kpi { display: flex; flex-direction: column; align-items: flex-end; }
                .kpi-val { font-size: 14px; font-weight: 700; }
                .kpi-lbl { font-size: 10px; color: #9ca3af; }
                .filter-row { display: flex; gap: 4px; padding: 10px 16px; border-bottom: 1px solid #f3f4f6; }
                .filter-pill { padding: 3px 10px; border: 1px solid #e5e7eb; border-radius: 9999px; font-size: 11px; cursor: pointer; background: #fff; color: #6b7280; }
                .filter-pill.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
                .tx-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .tx-table th { padding: 8px 14px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .tx-row:hover { background: #f9fafb; }
                .tx-table td { padding: 8px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .mono { font-family: monospace; }
                .small { font-size: 11px; }
                .desc { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #374151; }
                .dir-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .dir-badge.cr { background: #d1fae5; color: #059669; }
                .dir-badge.dr { background: #fee2e2; color: #dc2626; }
                .matched { display: flex; align-items: center; gap: 4px; color: #059669; font-size: 11px; }
                .unmatched { display: flex; align-items: center; gap: 4px; color: #d97706; font-size: 11px; }
                .no-select { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #9ca3af; font-size: 14px; }
                .green { color: #059669; }
                .red { color: #dc2626; }
                .blue { color: #1d4ed8; }
            `}</style>
        </StandardPage>
    );
}
