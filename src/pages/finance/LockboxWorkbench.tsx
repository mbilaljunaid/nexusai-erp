import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, CheckCircle2, AlertCircle, Search, Link2, X } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Input } from "@/components/ui/input";
import { DatePicker } from '@/components/ui/DatePicker';
import { Label } from "@/components/ui/label";


interface LockboxBatch {
    id: string;
    batch_date: string;
    total_amount: number;
    item_count: number;
    currency_code: string;
    status: string;
    imported_at: string;
}

interface LockboxItem {
    id: string;
    check_number: string;
    remittance_ref: string;
    payer_name: string;
    amount: number;
    item_date: string;
    matched_invoice_id: string;
    match_method: string;
    match_status: string;
    unapplied_amount: number;
}

interface LockboxSummary {
    total_batches: number;
    total_processed: number;
    matched_items: number;
    unmatched_items: number;
    total_unapplied: number;
}

const BATCH_STATUS_CFG: Record<string, { bg: string; color: string }> = {
    Matched: { bg: 'bg-emerald-100', color: 'text-emerald-700' },
    Partial: { bg: 'bg-amber-100', color: 'text-amber-700' },
    Pending: { bg: 'bg-blue-100', color: 'text-blue-700' },
    Exception: { bg: 'bg-red-100', color: 'text-red-700' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

export default function LockboxWorkbench() {
    const [selectedBatch, setSelectedBatch] = useState<LockboxBatch | null>(null);
    const [matchFilter, setMatchFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [matchingItem, setMatchingItem] = useState<any>(null);
    const [manualInvoiceSearch, setManualInvoiceSearch] = useState('');
    const [csvContent, setCsvContent] = useState('');
    const [batchDate, setBatchDate] = useState(new Date().toISOString().slice(0, 10));
    const fileRef = useRef<HTMLInputElement>(null);
    const qc = useQueryClient();

    const { data: batches = [] } = useQuery<any[]>({
        queryKey: ['lockbox-batches'],
        queryFn: () => fetch('/api/ar/lockbox/batches').then(r => r.json()),
    });

    const { data: summary } = useQuery<any>({
        queryKey: ['lockbox-summary'],
        queryFn: () => fetch('/api/ar/lockbox/summary').then(r => r.json()),
    });

    const { data: items = [] } = useQuery<any[]>({
        queryKey: ['lockbox-items', selectedBatch?.id],
        queryFn: () => selectedBatch
            ? fetch(`/api/ar/lockbox/batches/${selectedBatch.id}/items${matchFilter ? `?matchStatus=${matchFilter}` : ''}`).then(r => r.json())
            : Promise.resolve([]),
        enabled: !!selectedBatch?.id,
    });

    const { data: openInvoices = [] } = useQuery<any[]>({
        queryKey: ['ar-invoices-open'],
        queryFn: () => fetch('/api/ar/invoices').then(r => r.json()),
        enabled: !!matchingItem
    });

    const importMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/ar/lockbox/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['lockbox-batches'] });
            qc.invalidateQueries({ queryKey: ['lockbox-summary'] });
            setCsvContent('');
            // If the new batch is returned, select it
            if (data?.id) {
                setSelectedBatch(data);
            }
        },
    });

    // Manual Match Mutation
    const manualMatchMutation = useMutation({
        mutationFn: async ({ itemId, invoiceId }: { itemId: string; invoiceId: string }) => {
            const res = await fetch(`/api/ar/lockbox/items/${itemId}/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['lockbox-items'] });
            qc.invalidateQueries({ queryKey: ['lockbox-batches'] });
            qc.invalidateQueries({ queryKey: ['lockbox-summary'] });
            setMatchingItem(null);
        }
    });

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => setCsvContent(ev.target?.result as string);
        reader.readAsText(f);
    };

    const parseCSV = (csv: string) => {
        const lines = csv.split('\n').filter(Boolean);
        // Remove header only if the first line looks like a header (e.g., contains 'check' or 'amount')
        const dataLines = lines[0]?.toLowerCase().includes('amount') || lines[0]?.toLowerCase().includes('check') ? lines.slice(1) : lines;
        return dataLines.map((line: string) => {
            const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
            return { checkNumber: parts[0], remittanceRef: parts[1], payerName: parts[2], payerAccount: parts[3], amount: parseFloat(parts[4]) || 0, itemDate: parts[5] || batchDate };
        });
    };

    const safeItems = Array.isArray(items) ? items : [];
    const safeBatches = Array.isArray(batches) ? batches : [];

    const filteredItems = safeItems.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (item.check_number?.toLowerCase().includes(q) || item.payer_name?.toLowerCase().includes(q) || item.remittance_ref?.toLowerCase().includes(q));
    });

    const matched = safeItems.filter(i => i.match_status === 'Matched').length;
    const unmatched = safeItems.filter(i => i.match_status === 'Unmatched').length;

    const itemColumns: SpreadsheetColumn<LockboxItem>[] = [
        { id: "check_number", header: "Check #", width: "120px", cell: (row) => <div className="mono">{row.check_number ?? '—'}</div> },
        { id: "remittance_ref", header: "Remit Ref", width: "120px", cell: (row) => <div className="mono">{row.remittance_ref ?? '—'}</div> },
        { id: "payer_name", header: "Payer", width: "1fr", cell: (row) => row.payer_name ?? '—' },
        { id: "amount", header: "Amount", width: "120px", cell: (row) => <div className="mono">{fmt(row.amount)}</div> },
        { id: "method", header: "Method", width: "100px", cell: (row) => <div>{row.match_method ? <span className="method-tag">{row.match_method}</span> : <span className="grey">—</span>}</div> },
        { id: "status", header: "Status", width: "120px", cell: (row) => <div>{row.match_status === 'Matched' ? <span className="status-green"><CheckCircle2 size={11} /> Matched</span> : <span className="status-orange"><AlertCircle size={11} /> {row.match_status}</span>}</div> },
        { id: "unapplied", header: "Unapplied", width: "120px", cell: (row) => <div className={cn(`mono ${row.unapplied_amount > 0 ? 'red' : 'grey'}`)}>{row.unapplied_amount > 0 ? fmt(row.unapplied_amount) : '—'}</div> },
        { id: "action", header: "Action", width: "80px", cell: (row) => <div>{row.match_status !== 'Matched' && row.unapplied_amount > 0 && <button className="btn-match-action" onClick={() => setMatchingItem(row)}>Match</button>}</div> }
    ];

    return (
        <StandardPage
            title="Lockbox Workbench"
            description="Bank lockbox remittances — auto-matched to open invoices"
        >
            {/* KPIs */}
            <div className="lbw-kpis">
                <div className="kpi-card blue"><div className="kpi-val">{summary?.total_batches ?? 0}</div><div className="kpi-lbl">Total Batches</div></div>
                <div className="kpi-card green"><div className="kpi-val">{fmt(summary?.total_processed)}</div><div className="kpi-lbl">Total Processed</div></div>
                <div className="kpi-card purple"><div className="kpi-val">{summary?.matched_items ?? 0}</div><div className="kpi-lbl">Matched Items</div></div>
                <div className="kpi-card orange"><div className="kpi-val">{summary?.unmatched_items ?? 0}</div><div className="kpi-lbl">Unmatched</div></div>
                <div className="kpi-card red"><div className="kpi-val">{fmt(summary?.total_unapplied)}</div><div className="kpi-lbl">Unapplied</div></div>
            </div>

            <div className="lbw-layout">
                {/* Left: Import + Batch List */}
                <div className="lbw-left">
                    <div className="import-box">
                        <div className="ib-title">Import Lockbox File</div>
                        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} hidden />
                        <div className="drop-zone" role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                            <UploadCloud size={24} color="#9ca3af" />
                            <div className="dz-text">Upload CSV or paste below</div>
                            <div className="dz-sub">check#, remit_ref, payer, account, amount, date</div>
                        </div>
                        <Textarea className="csv-paste" placeholder="check001,INV-5042,ACME Corp,12345,15000,2026-01-15" value={csvContent} onChange={e => setCsvContent(e.target.value)} rows={4} aria-label="CSV lockbox content" />
                        <div className="date-row">
                            <Label className="dl">Batch Date</Label>
                            <DatePicker className="di" value={batchDate} onChange={v => setBatchDate(v)} aria-label="Batch date" />
                        </div>
                        <button className="import-btn" disabled={!csvContent || importMutation.isPending}
                            onClick={() => {
                                const parsedItems = parseCSV(csvContent);
                                importMutation.mutate({
                                    batchData: {
                                        batchDate: batchDate,
                                        totalAmount: parsedItems.reduce((sum: number, item: any) => sum + item.amount, 0).toString(),
                                        itemCount: parsedItems.length,
                                        currencyCode: 'USD'
                                    },
                                    itemsData: parsedItems.map((item: any) => ({
                                        ...item,
                                        amount: item.amount.toString()
                                    }))
                                });
                            }} aria-label="Import lockbox batch">
                            {importMutation.isPending ? 'Processing & Matching…' : 'Import & Auto-Match'}
                        </button>
                        {importMutation.isSuccess && (
                            <div className="success-row">
                                <CheckCircle2 size={14} />
                                {importMutation.data?.summary?.matched} matched / {importMutation.data?.summary?.unmatched} unmatched
                            </div>
                        )}
                    </div>

                    <div className="batch-list">
                        <div className="bl-title">Batch History</div>
                        {safeBatches.map(b => {
                            const cfg = BATCH_STATUS_CFG[b.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                            return (
                                <div key={b.id} className={cn(`batch-card ${selectedBatch?.id === b.id ? 'selected' : ''}`)} role="button" tabIndex={0} onClick={() => setSelectedBatch(b)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                    <div className="bc-top">
                                        <span className="bc-date mono">{formatDate(b.batch_date)}</span>
                                        <span className={cn(`bc-status ${cfg.bg} ${cfg.color}`)}>{b.status}</span>
                                    </div>
                                    <div className="bc-meta">{b.item_count} items · {fmt(b.total_amount)}</div>
                                </div>
                            );
                        })}
                        {safeBatches.length === 0 && <div className="empty">No lockbox batches</div>}
                    </div>
                </div>

                {/* Right: Item Detail */}
                <div className="lbw-right">
                    {selectedBatch ? (
                        <>
                            <div className="item-header">
                                <div className="ih-title">Batch: {formatDate(selectedBatch.batch_date)} — {selectedBatch.item_count} items</div>
                                <div className="ih-stats">
                                    <span className="green"><CheckCircle2 size={12} /> {matched} matched</span>
                                    <span className="orange"><AlertCircle size={12} /> {unmatched} unmatched</span>
                                </div>
                            </div>
                            <div className="filter-row-container">
                                <div className="filter-buttons">
                                    {['', 'Matched', 'Unmatched', 'Partial', 'Overpayment'].map(s => (
                                        <button key={s} className={cn(`filter-pill ${matchFilter === s ? 'active' : ''}`)} onClick={() => setMatchFilter(s)}>{s || 'All'}</button>
                                    ))}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search checks or payers..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="filter-search-input"
                                />
                            </div>
                            <div className="h-[400px]">
                                <InteractiveSpreadsheet
                                    columns={itemColumns}
                                    data={filteredItems}
                                    onChange={() => { }}
                                    containerHeight="100%"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="no-select">
                            <Link2 size={40} style={{ color: '#d1d5db', marginBottom: 12 }} />
                            <div>Select a batch to view items</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Match Modal */}
            {matchingItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Manual Match</h2>
                            <button className="close-btn" aria-label="Close modal" onClick={() => { setMatchingItem(null); setManualInvoiceSearch(''); }}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="match-context">
                                <div className="mc-row"><span className="lbl">Check #:</span> <span className="val mono">{matchingItem.check_number || 'N/A'}</span></div>
                                <div className="mc-row"><span className="lbl">Payer Name:</span> <span className="val">{matchingItem.payer_name || 'N/A'}</span></div>
                                <div className="mc-row"><span className="lbl">Read Remit Ref:</span> <span className="val mono">{matchingItem.remittance_ref || 'N/A'}</span></div>
                                <div className="mc-row"><span className="lbl">Amount to Apply:</span> <span className="val mono orange">{fmt(matchingItem.unapplied_amount)}</span></div>
                            </div>

                            <h3 className="section-title mt-24">Search Target Invoice</h3>
                            <Input
                                type="text"
                                placeholder="Search by Invoice Number or Customer..."
                                className="filter-search-input manual-search-input"
                                value={manualInvoiceSearch}
                                onChange={e => setManualInvoiceSearch(e.target.value)}
                            />

                            <div className="invoice-results">
                                {openInvoices.filter(inv =>
                                    inv.invoice_number.toLowerCase().includes(manualInvoiceSearch.toLowerCase()) ||
                                    (inv.customer_id && inv.customer_id.toLowerCase().includes(manualInvoiceSearch.toLowerCase()))
                                ).slice(0, 5).map(inv => (
                                    <div key={inv.id} className="inv-result-row">
                                        <div className="irr-left">
                                            <div className="irr-num mono">{inv.invoice_number}</div>
                                            <div className="irr-cust">Cust: {inv.customer_id.split('-')[0]}...</div>
                                        </div>
                                        <div className="irr-right">
                                            <div className="irr-amt mono">{fmt(inv.total_amount)}</div>
                                            <button
                                                className="btn-apply-match"
                                                disabled={manualMatchMutation.isPending}
                                                onClick={() => manualMatchMutation.mutate({ itemId: matchingItem.id, invoiceId: inv.id })}
                                            >
                                                {manualMatchMutation.isPending ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {openInvoices.length === 0 && <div className="empty">No open invoices found.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .lbw-container { padding: 24px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .lbw-header { margin-bottom: 20px; }
                .lbw-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .lbw-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .lbw-kpis { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
                .kpi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 16px; min-width: 130px; }
                .kpi-card.blue { border-left: 4px solid #1d4ed8; }
                .kpi-card.green { border-left: 4px solid #059669; }
                .kpi-card.purple { border-left: 4px solid #7c3aed; }
                .kpi-card.orange { border-left: 4px solid #d97706; }
                .kpi-card.red { border-left: 4px solid #dc2626; }
                .kpi-val { font-size: 20px; font-weight: 800; color: #111827; font-family: monospace; }
                .kpi-lbl { font-size: 11px; color: #9ca3af; margin-top: 2px; }
                .lbw-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
                .lbw-left { display: flex; flex-direction: column; gap: 16px; }
                .import-box { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
                .ib-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 10px; }
                .drop-zone { border: 2px dashed #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; margin-bottom: 8px; }
                .drop-zone:hover { border-color: #1d4ed8; background: #eff6ff; }
                .dz-text { font-size: 12px; font-weight: 600; color: #374151; margin-top: 4px; }
                .dz-sub { font-size: 10px; color: #9ca3af; font-family: monospace; }
                .csv-paste { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; font-size: 11px; font-family: monospace; resize: vertical; margin-bottom: 8px; }
                .date-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
                .dl { font-size: 11px; font-weight: 600; color: #374151; white-space: nowrap; }
                .di { flex: 1; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .import-btn { width: 100%; padding: 9px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .import-btn:disabled { background: #9ca3af; }
                .success-row { display: flex; align-items: center; gap: 6px; color: #059669; font-size: 11px; margin-top: 8px; }
                .batch-list { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
                .bl-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 10px; }
                .batch-card { padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin-bottom: 6px; }
                .batch-card.selected { border-color: #1d4ed8; background: #eff6ff; }
                .batch-card:hover { background: #f9fafb; }
                .bc-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .bc-date { font-size: 12px; font-weight: 600; }
                .bc-status { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .bc-meta { font-size: 11px; color: #6b7280; }
                .empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 16px; }
                .lbw-right { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
                .item-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid #e5e7eb; }
                .ih-title { font-size: 14px; font-weight: 700; color: #111827; }
                .ih-stats { display: flex; gap: 14px; font-size: 12px; }
                .filter-row-container { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; border-bottom: 1px solid #f3f4f6; }
                .filter-buttons { display: flex; gap: 4px; }
                .filter-search-input { padding: 4px 10px; border: 1px solid #d1d5db; border-radius: 9999px; font-size: 11px; width: 220px; box-sizing: border-box; outline: none; }
                .filter-pill { padding: 3px 10px; border: 1px solid #e5e7eb; border-radius: 9999px; font-size: 11px; cursor: pointer; background: #fff; color: #6b7280; }
                .filter-pill.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
                .item-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .item-table th { padding: 8px 14px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .item-row:hover { background: #f9fafb; }
                .item-table td { padding: 8px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .mono { font-family: monospace; }
                .method-tag { background: #f3e8ff; color: #7c3aed; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
                .status-green { display: flex; align-items: center; gap: 4px; color: #059669; }
                .status-orange { display: flex; align-items: center; gap: 4px; color: #d97706; }
                .no-select { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #9ca3af; font-size: 14px; }
                .green { color: #059669; display: flex; align-items: center; gap: 4px; }
                .orange { color: #d97706; display: flex; align-items: center; gap: 4px; }
                .red { color: #dc2626; }
                .grey { color: #9ca3af; }
                .btn-apply-match { background: #4f46e5; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-apply-match:hover:not(:disabled) { background: #4338ca; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3); }
                .btn-apply-match:disabled { background: #a5b4fc; cursor: not-allowed; }
                .section-title { margin-top: 24px; font-size: 13px; margin-bottom: 8px; }
                .manual-search-input { width: 100%; margin-bottom: 16px; }
            `}</style>
        </StandardPage >
    );
}
