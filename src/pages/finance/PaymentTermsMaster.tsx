import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Clock, Percent, ChevronRight, CheckCircle2 } from 'lucide-react';
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Input } from "@/components/ui/input";
import { DatePicker } from '@/components/ui/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface PaymentTerm {
    id: string;
    term_code: string;
    term_name: string;
    net_days: number;
    discount_pct: number;
    discount_days: number;
    term_type: string;
    is_split: boolean;
    active: boolean;
}

interface ScheduleLine {
    id: string;
    installment_num: number;
    due_date: string;
    amount: number;
    discount_amount: number;
    discount_due_date: string;
    status: string;
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    Net: { bg: '#dbeafe', color: '#1d4ed8' },
    EOM: { bg: '#d1fae5', color: '#059669' },
    InstallmentSplit: { bg: '#f3e8ff', color: '#7c3aed' },
    ImmediateDue: { bg: '#fee2e2', color: '#dc2626' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

export default function PaymentTermsMaster() {
    const [selected, setSelected] = useState<PaymentTerm | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [newTerm, setNewTerm] = useState({ termCode: '', termName: '', netDays: 30, discountPct: 0, discountDays: 0, termType: 'Net' });
    const [schedTest, setSchedTest] = useState({ termCode: '', invoiceDate: new Date().toISOString().slice(0, 10), totalAmount: 10000 });
    const [schedule, setSchedule] = useState<ScheduleLine[]>([]);
    const qc = useQueryClient();

    const { data: terms = [], isLoading } = useQuery<PaymentTerm[]>({
        queryKey: ['payment-terms'],
        queryFn: () => fetch('/api/finance/payment-terms').then(r => r.json()),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/finance/payment-terms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-terms'] }); setShowNew(false); },
    });

    const schedMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/finance/payment-terms/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (data) => setSchedule(Array.isArray(data) ? data : []),
    });

    const scheduleColumns: SpreadsheetColumn<ScheduleLine>[] = [
        { id: "installment_num", header: "#", width: "50px", cell: (row) => row.installment_num },
        { id: "due_date", header: "Due Date", width: "120px", cell: (row) => <div className="mono due-date">{row.due_date}</div> },
        { id: "amount", header: "Amount", width: "120px", cell: (row) => <div className="mono">{fmt(row.amount)}</div> },
        { id: "discount", header: "Discount", width: "120px", cell: (row) => <div className="mono green">{row.discount_amount > 0 ? fmt(row.discount_amount) : '—'}</div> },
        { id: "discountDeadline", header: "Discount Deadline", width: "150px", cell: (row) => <div className="mono small">{row.discount_due_date ?? '—'}</div> }
    ];

    return (
        <StandardPage
            title="Payment Terms Master"
            description="Configure Net, EOM, Instalment-Split, and Immediate terms"
            actions={
                <button className="add-btn" onClick={() => setShowNew(true)} aria-label="Add payment term">
                    <Plus size={14} /> Add Term
                </button>
            }
        >
            <div className="ptm-layout">
                {/* Terms List */}
                <div className="terms-panel">
                    {isLoading ? <div className="loading">Loading…</div> : (
                        terms.map(t => {
                            const cfg = TYPE_COLORS[t.term_type] ?? { bg: '#f3f4f6', color: '#6b7280' };
                            return (
                                <div key={t.id} className={`term-card ${selected?.id === t.id ? 'selected' : ''}`} onClick={() => { setSelected(t); setSchedTest(p => ({ ...p, termCode: t.term_code })); }}>
                                    <div className="tc-top">
                                        <span className="tc-code">{t.term_code}</span>
                                        <span className="tc-type" style={{ background: cfg.bg, color: cfg.color }}>{t.term_type}</span>
                                    </div>
                                    <div className="tc-name">{t.term_name}</div>
                                    <div className="tc-meta">
                                        <span><Clock size={10} /> {t.net_days}d</span>
                                        {t.discount_pct > 0 && <span><Percent size={10} /> {t.discount_pct}% in {t.discount_days}d</span>}
                                        {t.is_split && <span>Split</span>}
                                    </div>
                                    <ChevronRight size={14} className="tc-arrow" />
                                </div>
                            );
                        })
                    )}
                    {terms.length === 0 && !isLoading && <div className="empty">No payment terms defined</div>}
                </div>

                {/* Right Panel */}
                <div className="detail-panel">
                    {showNew && (
                        <div className="new-term-form">
                            <h3 className="nf-title">New Payment Term</h3>
                            <div className="form-grid">
                                {[
                                    ['termCode', 'Term Code', 'text', 'NET30'],
                                    ['termName', 'Display Name', 'text', 'Net 30 Days'],
                                    ['netDays', 'Net Days', 'number', '30'],
                                    ['discountPct', 'Discount %', 'number', '2'],
                                    ['discountDays', 'Discount Days', 'number', '10'],
                                ].map(([key, label, type, ph]) => (
                                    <div key={key} className="ff">
                                        <label className="fl">{label}</label>
                                        <input className="fi" type={type as string} placeholder={ph as string}
                                            value={(newTerm as any)[key as string] ?? ''}
                                            onChange={e => setNewTerm(p => ({ ...p, [key as string]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                                            aria-label={label as string} />
                                    </div>
                                ))}
                                <div className="ff">
                                    <label className="fl">Type</label>
                                    <Select value={newTerm.termType} onValueChange={v => setNewTerm(p => ({ ...p, termType: v }))}>
                                        <SelectTrigger className="fi" aria-label="Term type"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['Net', 'EOM', 'InstallmentSplit', 'ImmediateDue'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="nf-actions">
                                <button className="cancel-btn" onClick={() => setShowNew(false)} aria-label="Cancel">Cancel</button>
                                <button className="save-btn" disabled={createMutation.isPending}
                                    onClick={() => createMutation.mutate(newTerm)} aria-label="Save payment term">Save Term</button>
                            </div>
                        </div>
                    )}

                    {/* Schedule Tester */}
                    <div className="sched-tester">
                        <h3 className="st-title">Due Date Calculator</h3>
                        <div className="st-row">
                            <div className="sf">
                                <label className="sl">Term Code</label>
                                <input className="si" value={schedTest.termCode} onChange={e => setSchedTest(p => ({ ...p, termCode: e.target.value }))} placeholder="e.g. NET30" aria-label="Term code for calculator" />
                            </div>
                            <div className="sf">
                                <label className="sl">Invoice Date</label>
                                <DatePicker className="si" value={schedTest.invoiceDate} onChange={v => setSchedTest(p => ({ ...p, invoiceDate: v }))} aria-label="Invoice date" />
                            </div>
                            <div className="sf">
                                <label className="sl">Amount</label>
                                <input className="si" type="number" value={schedTest.totalAmount} onChange={e => setSchedTest(p => ({ ...p, totalAmount: parseFloat(e.target.value) || 0 }))} aria-label="Invoice amount" />
                            </div>
                        </div>
                        <button className="calc-btn" disabled={!schedTest.termCode || schedMutation.isPending}
                            onClick={() => schedMutation.mutate({ ...schedTest, sourceType: 'Invoice', sourceId: crypto.randomUUID() })} aria-label="Calculate schedule">
                            <Calendar size={13} /> {schedMutation.isPending ? 'Calculating…' : 'Calculate Schedule'}
                        </button>

                        {schedule.length > 0 && (
                            <div style={{ marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', height: 250 }}>
                                <InteractiveSpreadsheet
                                    columns={scheduleColumns}
                                    data={schedule}
                                    onChange={() => { }}
                                    containerHeight="100%"
                                />
                            </div>
                        )}
                    </div>

                    {selected && (
                        <div className="term-detail">
                            <h3 className="td-title">{selected.term_name}</h3>
                            <div className="td-grid">
                                <div className="td-kv"><span>Code</span><strong>{selected.term_code}</strong></div>
                                <div className="td-kv"><span>Type</span><strong>{selected.term_type}</strong></div>
                                <div className="td-kv"><span>Net Days</span><strong>{selected.net_days}</strong></div>
                                <div className="td-kv"><span>Discount</span><strong>{selected.discount_pct}% in {selected.discount_days}d</strong></div>
                                <div className="td-kv"><span>Split</span><strong>{selected.is_split ? 'Yes' : 'No'}</strong></div>
                                <div className="td-kv"><span>Active</span><strong>{selected.active ? '✅' : '❌'}</strong></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .ptm-container { padding: 24px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .ptm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .ptm-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .ptm-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .add-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
                .ptm-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
                .terms-panel { display: flex; flex-direction: column; gap: 8px; }
                .term-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; cursor: pointer; position: relative; }
                .term-card.selected { border-color: #1d4ed8; background: #eff6ff; }
                .term-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
                .tc-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .tc-code { font-size: 13px; font-weight: 700; font-family: monospace; color: #111827; }
                .tc-type { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .tc-name { font-size: 12px; color: #374151; margin-bottom: 6px; }
                .tc-meta { display: flex; gap: 10px; font-size: 10px; color: #9ca3af; }
                .tc-meta svg { vertical-align: middle; }
                .tc-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #d1d5db; }
                .empty, .loading { text-align: center; color: #9ca3af; font-size: 13px; padding: 24px; }
                .detail-panel { display: flex; flex-direction: column; gap: 16px; }
                .new-term-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .nf-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .ff { display: flex; flex-direction: column; gap: 4px; }
                .fl { font-size: 11px; font-weight: 600; color: #374151; }
                .fi { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .nf-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
                .cancel-btn { padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; }
                .save-btn { padding: 8px 16px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .save-btn:disabled { background: #9ca3af; }
                .sched-tester { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .st-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; }
                .st-row { display: flex; gap: 10px; margin-bottom: 10px; }
                .sf { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .sl { font-size: 11px; font-weight: 600; color: #374151; }
                .si { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; width: 100%; box-sizing: border-box; }
                .calc-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #059669; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; margin-bottom: 12px; }
                .calc-btn:disabled { background: #9ca3af; }
                .st-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
                .st-table th { padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .st-row-tr:hover { background: #f9fafb; }
                .st-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
                .mono { font-family: monospace; }
                .small { font-size: 11px; }
                .green { color: #059669; }
                .due-date { font-weight: 600; }
                .term-detail { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .td-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 14px; }
                .td-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .td-kv { display: flex; flex-direction: column; background: #f9fafb; border-radius: 6px; padding: 8px 12px; }
                .td-kv span { font-size: 11px; color: #9ca3af; margin-bottom: 2px; }
                .td-kv strong { font-size: 13px; color: #111827; font-family: monospace; }
            `}</style>
        </StandardPage >
    );
}
