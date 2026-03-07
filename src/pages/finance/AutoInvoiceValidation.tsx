import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle, Play, Download, RefreshCw, FileText } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AutoInvRun {
    id: string;
    run_date: string;
    source_type: string;
    source_ref: string;
    status: string;
    total_lines: number;
    valid_lines: number;
    error_lines: number;
    validation_errors: Array<{ lineRef: string; rule: string; message: string }>;
    run_at: string;
}

interface ValidationRule {
    id: string;
    name: string;
}

const STATUS_CFG: Record<string, string> = {
    Validated: 'bg-emerald-100 text-emerald-600',
    Error: 'bg-red-100 text-red-600',
    Pending: 'bg-blue-500/10 text-blue-700',
    Imported: 'bg-purple-100 text-purple-700',
};

const SAMPLE_LINES = [
    { customerId: 'CUST001', quantity: 10, unitPrice: 500, revenueGlAccount: '4000', currencyCode: 'USD', invoiceDate: new Date().toISOString().slice(0, 10), paymentTermCode: 'NET30', transactionRef: `TXN${Date.now()}`, taxCode: 'VAT20', unitOfMeasure: 'EA', description: 'Professional Services' },
];

export default function AutoInvoiceValidation() {
    const [activeRun, setActiveRun] = useState<AutoInvRun | null>(null);
    const [sourceType, setSourceType] = useState<'Order' | 'Contract' | 'ShipmentLine' | 'UsageEvent'>('Order');
    const [sourceRef, setSourceRef] = useState('');
    const [linesJson, setLinesJson] = useState(JSON.stringify(SAMPLE_LINES, null, 2));
    const qc = useQueryClient();

    const { data: runs = [] } = useQuery<AutoInvRun[]>({
        queryKey: ['autoinvoice-runs'],
        queryFn: () => fetch('/api/finance/autoinvoice/runs').then(r => r.json()),
    });

    const { data: rules = [] } = useQuery<ValidationRule[]>({
        queryKey: ['autoinvoice-rules'],
        queryFn: () => fetch('/api/finance/autoinvoice/rules').then(r => r.json()),
    });

    const validateMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/finance/autoinvoice/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['autoinvoice-runs'] }); setActiveRun(data.run); },
    });

    const importMutation = useMutation({
        mutationFn: ({ runId, lines }: { runId: string; lines: any[] }) =>
            fetch(`/api/finance/autoinvoice/import/${runId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['autoinvoice-runs'] }),
    });

    let parsedLines: any[] = [];
    let jsonError = '';
    try { parsedLines = JSON.parse(linesJson); } catch { jsonError = 'Invalid JSON — check syntax'; }

    const runValidation = () => {
        if (!parsedLines.length || jsonError) return;
        validateMutation.mutate({ sourceType, sourceRef, lines: parsedLines });
    };

    const errColumns: SpreadsheetColumn<any>[] = [
        { id: "lineRef", header: "Line Ref", width: "150px", cell: (row) => <div className="mono">{row.lineRef}</div> },
        { id: "rule", header: "Rule", width: "150px", cell: (row) => <div><span className="rule-badge">{row.rule}</span></div> },
        { id: "message", header: "Message", width: "1fr", cell: (row) => <div className="err-msg">{row.message}</div> }
    ];

    return (
        <StandardPage
            title="AutoInvoice Validation"
            description="Oracle AR AutoInvoice — validate billing lines before AR import"
        >
            <div className="aiv-layout">
                {/* Left: Run Form + History */}
                <div className="aiv-left">
                    <div className="run-form">
                        <div className="rf-title">New Validation Run</div>
                        <div className="rf">
                            <Label className="rl">Source Type</Label>
                            <Select value={sourceType} onValueChange={v => setSourceType(v as any)}>
                                <SelectTrigger className="ri" aria-label="Source type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['Order', 'Contract', 'ShipmentLine', 'UsageEvent'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="rf">
                            <Label className="rl">Source Ref</Label>
                            <Input className="h-9 text-[12px]" placeholder="e.g. ORD-2026-0042" value={sourceRef} onChange={e => setSourceRef(e.target.value)} aria-label="Source reference" />
                        </div>
                        <div className="rf">
                            <Label className="rl">Lines (JSON array)</Label>
                            <Textarea className="rb font-mono text-xs" value={linesJson} onChange={e => setLinesJson(e.target.value)} rows={10} aria-label="Lines JSON" />
                            {jsonError && <div className="json-err">{jsonError}</div>}
                        </div>
                        <button className="validate-btn" disabled={!!jsonError || !parsedLines.length || validateMutation.isPending}
                            onClick={runValidation} aria-label="Run validation">
                            <Play size={13} /> {validateMutation.isPending ? 'Validating…' : 'Run Validation'}
                        </button>
                        {validateMutation.isSuccess && (
                            <div className={cn(`val-banner ${validateMutation.data?.canImport ? 'pass' : 'fail'}`)}>
                                {validateMutation.data?.canImport
                                    ? <><CheckCircle2 size={14} /> {validateMutation.data.validCount} lines valid — ready to import</>
                                    : <><AlertTriangle size={14} /> {validateMutation.data?.errorCount} errors — fix before import</>}
                            </div>
                        )}
                    </div>

                    <div className="hist-box">
                        <div className="hb-title">Run History</div>
                        {runs.map(r => {
                            const cfgClass = STATUS_CFG[r.status] ?? 'bg-gray-100 text-gray-500';
                            return (
                                <div key={r.id} className={cn(`run-card ${activeRun?.id === r.id ? 'selected' : ''}`)} role="button" tabIndex={0} onClick={() => setActiveRun(r)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                    <div className="rc-top">
                                        <span className="rc-ref mono">{r.source_ref || r.source_type}</span>
                                        <span className={cn(`rc-status ${cfgClass}`)}>{r.status}</span>
                                    </div>
                                    <div className="rc-meta">{r.total_lines} lines · {r.valid_lines} valid · {r.error_lines} err</div>
                                    <div className="rc-date small">{formatDateTime(r.run_at)}</div>
                                </div>
                            );
                        })}
                        {runs.length === 0 && <div className="empty">No validation runs yet</div>}
                    </div>
                </div>

                {/* Right: Rules + Error Detail */}
                <div className="aiv-right">
                    {/* Validation Rules */}
                    <div className="rules-box">
                        <div className="rb-title"><FileText size={14} /> Validation Rules ({rules.length})</div>
                        <div className="rules-grid">
                            {rules.map(rule => (
                                <div key={rule.id} className="rule-chip">
                                    <span className="rule-id">{rule.id}</span>
                                    <span className="rule-name">{rule.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Run Detail */}
                    {activeRun && (
                        <div className="run-detail">
                            <div className="rd-header">
                                <div>
                                    <div className="rd-title">{activeRun.source_ref || activeRun.source_type} — {activeRun.run_date}</div>
                                    <div className="rd-meta">{activeRun.total_lines} total · {activeRun.valid_lines} valid · <span className={activeRun.error_lines > 0 ? 'text-red-600' : 'text-emerald-600'}>{activeRun.error_lines} errors</span></div>
                                </div>
                                {activeRun.status === 'Validated' && activeRun.error_lines === 0 && (
                                    <button className="import-btn" disabled={importMutation.isPending}
                                        onClick={() => importMutation.mutate({ runId: activeRun.id, lines: parsedLines })} aria-label="Import to AR">
                                        <Download size={13} /> {importMutation.isPending ? 'Importing…' : 'Import to AR'}
                                    </button>
                                )}
                            </div>

                            {activeRun.validation_errors?.length > 0 ? (
                                <div className="h-72 border border-gray-200 rounded-lg overflow-hidden">
                                    <InteractiveSpreadsheet
                                        columns={errColumns}
                                        data={activeRun.validation_errors}
                                        onChange={() => { }}
                                        containerHeight="100%"
                                    />
                                </div>
                            ) : (
                                <div className="all-pass">
                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                    <span>All {activeRun.total_lines} lines passed validation</span>
                                </div>
                            )}

                            {importMutation.isSuccess && (
                                <div className="import-success">
                                    <CheckCircle2 size={14} /> {importMutation.data?.invoicesCreated} invoice(s) created in AR
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .aiv-layout { display: grid; grid-template-columns: 340px 1fr; gap: 20px; font-family: 'Inter', sans-serif; }
                .aiv-left { display: flex; flex-direction: column; gap: 16px; }
                .run-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
                .rf-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 12px; }
                .rf { margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px; }
                .rl { font-size: 11px; font-weight: 600; color: #374151; }
                .ri { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .rb { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 11px; font-family: monospace; resize: vertical; }
                .json-err { color: #dc2626; font-size: 11px; margin-top: 2px; }
                .validate-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 4px; }
                .validate-btn:disabled { background: #9ca3af; }
                .val-banner { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-top: 8px; }
                .val-banner.pass { background: #d1fae5; color: #059669; }
                .val-banner.fail { background: #fee2e2; color: #dc2626; }
                .hist-box { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
                .hb-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 10px; }
                .run-card { padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin-bottom: 6px; }
                .run-card.selected { border-color: #1d4ed8; background: #eff6ff; }
                .run-card:hover { background: #f9fafb; }
                .rc-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .rc-ref { font-size: 12px; font-weight: 600; }
                .rc-status { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .rc-meta { font-size: 11px; color: #6b7280; }
                .rc-date { color: #9ca3af; }
                .small { font-size: 11px; }
                .empty, .loading { text-align: center; color: #9ca3af; font-size: 13px; padding: 16px; }
                .aiv-right { display: flex; flex-direction: column; gap: 16px; }
                .rules-box { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
                .rb-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 12px; }
                .rules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; }
                .rule-chip { display: flex; align-items: center; gap: 6px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px 10px; }
                .rule-id { font-size: 10px; font-weight: 700; font-family: monospace; background: #dbeafe; color: #1d4ed8; padding: 1px 5px; border-radius: 3px; }
                .rule-name { font-size: 11px; color: #374151; }
                .run-detail { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
                .rd-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
                .rd-title { font-size: 14px; font-weight: 700; color: #111827; }
                .rd-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
                .import-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #059669; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .import-btn:disabled { background: #9ca3af; }
                .err-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .err-table th { padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; background: #fff7ed; border-bottom: 2px solid #fed7aa; }
                .err-row:hover { background: #fff7ed; }
                .err-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .mono { font-family: monospace; }
                .rule-badge { background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .err-msg { color: #374151; }
                .all-pass { display: flex; align-items: center; gap: 10px; padding: 24px; color: #059669; font-size: 14px; font-weight: 600; }
                .import-success { display: flex; align-items: center; gap: 6px; color: #7c3aed; font-size: 12px; margin-top: 10px; padding: 8px 12px; background: #f3e8ff; border-radius: 6px; }
            `}</style>
        </StandardPage>
    );
}
