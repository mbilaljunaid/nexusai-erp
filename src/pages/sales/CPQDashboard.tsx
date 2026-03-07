import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Minus } from 'lucide-react';
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Quote { id: string; quote_number: string; customer_id: string; status: string; net_total: number; list_total: number; discount_pct: number; margin_pct: number | null; valid_until: string; currency: string; created_by: string; lines?: QuoteLine[]; }
interface QuoteLine { id: string; line_number: number; product_id: string; description: string; quantity: number; unit_price: number; discount_pct: number; net_price: number; }
interface Renewal { id: string; contract_number: string; customer_id: string; renewal_date: string; status: string; auto_renew: boolean; mrr: number; days_until_renewal: number; }
interface EVMMetric { wbs_code: string; description: string; pv: number; ev: number; ac: number; sv: number; cv: number; cpi: number; spi: number; }

const STATUS_CLR: Record<string, string> = { Draft: 'bg-muted text-muted-foreground/70 border-l-gray-400', Pending_Approval: 'bg-amber-100 text-amber-600 border-l-amber-600', Approved: 'bg-blue-100 text-blue-700 border-l-blue-700', Presented: 'bg-purple-100 text-purple-600 border-l-purple-600', Won: 'bg-emerald-100 text-emerald-600 border-l-emerald-600', Lost: 'bg-red-100 text-red-600 border-l-red-600', Expired: 'bg-muted text-muted-foreground border-l-gray-500', Pending: 'bg-amber-100 text-amber-600 border-l-amber-600', Renewed: 'bg-emerald-100 text-emerald-600 border-l-emerald-600', Churned: 'bg-red-100 text-red-600 border-l-red-600', On_Hold: 'bg-amber-100 text-amber-500 border-l-amber-500' };
const ACTIONS: Record<string, { a: string; label: string; textClass: string; bgClass: string }[]> = {
    Draft: [{ a: 'SUBMIT', label: 'Submit', textClass: 'text-blue-700', bgClass: 'bg-blue-500/10 hover:bg-blue-500/15' }],
    Pending_Approval: [{ a: 'APPROVE', label: 'Approve', textClass: 'text-emerald-600', bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/15' }, { a: 'LOSE', label: 'Decline', textClass: 'text-red-600', bgClass: 'bg-red-500/10 hover:bg-red-500/15' }],
    Approved: [{ a: 'PRESENT', label: 'Mark Presented', textClass: 'text-purple-600', bgClass: 'bg-purple-500/10 hover:bg-purple-500/15' }],
    Presented: [{ a: 'WIN', label: 'Won!', textClass: 'text-emerald-600', bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/15' }, { a: 'LOSE', label: 'Lost', textClass: 'text-red-600', bgClass: 'bg-red-500/10 hover:bg-red-500/15' }],
};

export default function CPQDashboard() {
    const [view, setView] = useState<'cpq' | 'renewal' | 'evm'>('cpq');
    const [selected, setSelected] = useState<Quote | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [evmBaseline, setEvmBaseline] = useState('');
    const qc = useQueryClient();

    const { data: quotes = [] } = useQuery<Quote[]>({ queryKey: ['quotes', statusFilter], queryFn: () => fetch(`/api/ext/cpq/quotes${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()) });
    const { data: renewals = [] } = useQuery<Renewal[]>({ queryKey: ['renewals'], queryFn: () => fetch('/api/ext/renewals?status=Pending').then(r => r.json()), enabled: view === 'renewal' });
    const { data: upcoming = [] } = useQuery<Renewal[]>({ queryKey: ['renewals-upcoming'], queryFn: () => fetch('/api/ext/renewals/upcoming?daysAhead=30').then(r => r.json()), enabled: view === 'renewal' });
    const { data: evmMetrics } = useQuery<{ controlAccounts: EVMMetric[]; totals: any; eac: number }>({ queryKey: ['evm', evmBaseline], enabled: !!evmBaseline, queryFn: () => fetch(`/api/ext/evm/baselines/${evmBaseline}/metrics`).then(r => r.json()) });

    const transitionMut = useMutation({ mutationFn: ({ id, action }: any) => fetch(`/api/ext/cpq/quotes/${id}/transition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, actor: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }) });
    const renewMut = useMutation({ mutationFn: (id: string) => fetch(`/api/ext/renewals/${id}/renew`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ renewedBy: 'current-user' }) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ['renewals'] }) });

    const won = quotes.filter(q => q.status === 'Won').length;
    const lost = quotes.filter(q => q.status === 'Lost').length;
    const pending = quotes.filter(q => ['Draft', 'Pending_Approval', 'Presented'].includes(q.status)).length;
    const pipeline = quotes.filter(q => q.status !== 'Lost' && q.status !== 'Expired').reduce((s, q) => s + Number(q.net_total ?? 0), 0);

    const kpiC = (val: number, gd = 1) => val >= gd ? 'text-emerald-600' : val >= gd * 0.8 ? 'text-amber-600' : 'text-red-600';

    const renewalColumns: SpreadsheetColumn<any>[] = [
        { id: "contract", header: "Contract", width: "150px", cell: (ren: any) => <span className="font-semibold">{ren.contract_number}</span> },
        { id: "customer", header: "Customer", width: "150px", cell: (ren: any) => <span>{ren.customer_id}</span> },
        { id: "renewal_date", header: "Renewal Date", width: "120px", cell: (ren: any) => <span>{ren.renewal_date}</span> },
        { id: "days", header: "Days", width: "80px", cell: (ren: any) => <span className={cn(`font-bold ${Number(ren.days_until_renewal) <= 7 ? 'text-red-600' : Number(ren.days_until_renewal) <= 14 ? 'text-amber-600' : 'text-emerald-600'}`)}>{ren.days_until_renewal}d</span> },
        { id: "mrr", header: "MRR", width: "100px", cell: (ren: any) => <span className="font-mono">{formatCurrency(Number(ren.mrr ?? 0))}</span> },
        { id: "auto_renew", header: "Auto-Renew", width: "100px", cell: (ren: any) => <span className={cn(`text-[9px] px-1.5 py-0.5 rounded-sm ${ren.auto_renew ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground/70'}`)}>{ren.auto_renew ? 'AUTO' : 'MANUAL'}</span> },
        {
            id: "status", header: "Status", width: "120px", cell: (ren: any) => {
                const clss = STATUS_CLR[ren.status] ?? 'bg-muted text-muted-foreground';
                return <span className={cn(`text-[9px] px-1.5 py-0.5 rounded-sm ${clss}`)}>{ren.status}</span>;
            }
        },
        { id: "action", header: "", width: "100px", cell: (ren: any) => ren.status === 'Pending' ? <Button variant="default" size="sm" onClick={() => renewMut.mutate(ren.id)} className="text-white ] text-[9px]">Renew</Button> : null }
    ];

    const evmColumns: SpreadsheetColumn<any>[] = [
        { id: "wbs", header: "WBS", width: "120px", cell: (ca: any) => <span className="font-mono text-[10px] font-semibold">{ca.wbs_code}</span> },
        { id: "desc", header: "Description", width: "200px", cell: (ca: any) => <span className="text-muted-foreground">{ca.description ?? '—'}</span> },
        { id: "pv", header: "PV", width: "100px", cell: (ca: any) => <span className="font-mono">{formatCurrency(Number(ca.pv ?? 0))}</span> },
        { id: "ev", header: "EV", width: "100px", cell: (ca: any) => <span className="font-mono">{formatCurrency(Number(ca.ev ?? 0))}</span> },
        { id: "ac", header: "AC", width: "100px", cell: (ca: any) => <span className="font-mono">{formatCurrency(Number(ca.ac ?? 0))}</span> },
        { id: "sv", header: "SV", width: "100px", cell: (ca: any) => <span className={cn(`font-mono font-bold ${Number(ca.sv ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`)}>{Number(ca.sv ?? 0) >= 0 ? '+' : ''}{formatCurrency(Number(ca.sv ?? 0)).replace('$', '')}</span> },
        { id: "cv", header: "CV", width: "100px", cell: (ca: any) => <span className={cn(`font-mono font-bold ${Number(ca.cv ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`)}>{Number(ca.cv ?? 0) >= 0 ? '+' : ''}{formatCurrency(Number(ca.cv ?? 0)).replace('$', '')}</span> },
        { id: "cpi", header: "CPI", width: "80px", cell: (ca: any) => <span className={cn(`font-bold ${kpiC(Number(ca.cpi ?? 1))}`)}>{formatNumber(ca.cpi ?? 0, 2)}</span> },
        { id: "spi", header: "SPI", width: "80px", cell: (ca: any) => <span className={cn(`font-bold ${kpiC(Number(ca.spi ?? 1))}`)}>{formatNumber(ca.spi ?? 0, 2)}</span> }
    ];

    return (
        <StandardPage title="CPQ & Revenue Intelligence">
            <div className="flex justify-between mb-4 items-end">
                <div>

                    <p className="text-[13px] text-muted-foreground mt-1 mb-0">Configure-price-quote · Renewal management · EVM metrics</p>
                </div>
                <div className="flex gap-1.5">
                    {[['cpq', 'Quotes'], ['renewal', 'Renewals'], ['evm', 'EVM']].map(([v, lbl]) => (
                        <Button variant="secondary" size="sm" key={v} onClick={() => setView(v as any)} className={cn(`px-3.5 py-1.5 border-none rounded-lg font-bold text-[11px] cursor-pointer ${view === v ? 'bg-gray-900 text-white' : 'bg-muted text-muted-foreground'}`)}>{lbl}</Button>
                    ))}
                </div>
            </div>

            {view === 'cpq' && (
                <>
                    <div className="flex gap-2.5 mb-3.5">
                        {[{ lbl: 'Pipeline', val: `$${formatNumber(pipeline / 1000, 0)}K`, clr: 'text-blue-700' }, { lbl: 'Won', val: won, clr: 'text-emerald-600' }, { lbl: 'Lost', val: lost, clr: 'text-red-600' }, { lbl: 'Open', val: pending, clr: 'text-amber-600' }].map(k => (
                            <Card key={k.lbl} className="px-4 py-2.5 min-w-24 shadow-sm">
                                <div className={cn(`text-xl font-extrabold ${k.clr}`)}>{k.val}</div>
                                <div className="text-[10px] text-muted-foreground/70">{k.lbl}</div>
                            </Card>
                        ))}
                    </div>
                    <div className="flex gap-1.5 mb-2.5">
                        {['', 'Draft', 'Pending_Approval', 'Approved', 'Presented', 'Won', 'Lost'].map(s => (
                            <Button variant="secondary" size="sm" key={s} onClick={() => setStatusFilter(s)} className={cn(`px-2.5 py-1.5 border border-border rounded-md text-[10px] font-semibold cursor-pointer ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-card text-muted-foreground'}`)}>{s || 'All'}</Button>
                        ))}
                    </div>
                    <div className="flex gap-3.5">
                        <div className="flex-1">
                            {quotes.map(q => {
                                const statusClass = STATUS_CLR[q.status] ?? 'bg-muted text-muted-foreground/70 border-l-gray-400';
                                const acts = ACTIONS[q.status] ?? [];
                                return (
                                    <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelected(selected?.id === q.id ? null : q)}>
                                    <Card key={q.id} className={cn(`hover:shadow-md cursor-pointer border-l-[4px] px-3.5 py-2.5 mb-1.5 shadow-sm ${selected?.id === q.id ? 'border-y-blue-700 border-r-blue-700' : ''} ${statusClass.split(' ').find(c => c.startsWith('border-l-'))}`)}>
                                                                            <div className="flex justify-between mb-1">
                                                                                <div className="font-bold text-[13px]">{q.quote_number} — {q.customer_id}</div>
                                                                                <span className={cn(`text-[9px] px-1.5 py-0.5 rounded font-bold ${statusClass.replace(/border-l-\S+/, '')}`)}>{q.status}</span>
                                                                            </div>
                                                                            <div className="flex gap-3 text-[10px] text-muted-foreground mb-1">
                                                                                <span>List: <strong className="text-foreground/90">{formatCurrency(Number(q.list_total))}</strong></span>
                                                                                <span>Net: <strong className="text-emerald-600">{formatCurrency(Number(q.net_total))}</strong></span>
                                                                                <span>Disc: <strong>{Number(q.discount_pct)}%</strong></span>
                                                                                {q.valid_until && <span>Valid until: <strong>{q.valid_until}</strong></span>}
                                                                            </div>
                                                                            {acts.length > 0 && (
                                                                                <div className="flex gap-1 mt-1">
                                                                                    {acts.map(a => <Button variant="default" key={a.a} onClick={ev => { ev.stopPropagation(); transitionMut.mutate({ id: q.id, action: a.a }); }} className={cn(`px-1.5 py-0.5 border-none rounded font-bold text-[9px] cursor-pointer ${a.textClass} ${a.bgClass}`)}>{a.label}</Button>)}
                                                                                </div>
                                                                            )}
                                                                        </Card>
                                    </Button>
                                );
                            })}
                            {quotes.length === 0 && <Card className="text-center text-muted-foreground/70 p-8 shadow-sm">No quotes</Card>}
                        </div>
                        {selected && (
                            <Card className="w-72 flex-shrink-0 p-3.5 h-fit sticky top-4 shadow-sm">
                                <div className="font-bold text-[13px] mb-2">{selected.quote_number}</div>
                                <div className="text-[11px] font-bold mb-1.5">Line Items</div>
                                <Card className="p-2 border-none shadow-none bg-slate-500/10">
                                    {(selected.lines ?? []).map(l => (
                                        <div key={l.id} className="border-b border-border pb-1 mb-1 text-[10px]">
                                            <div className="font-semibold">#{l.line_number} {l.product_id}</div>
                                            <div className="text-muted-foreground">{l.description}</div>
                                            <div className="flex justify-between mt-0.5">
                                                <span>{l.quantity} × {formatCurrency(Number(l.unit_price))}</span>
                                                <span className="font-bold text-emerald-600">{formatCurrency(Number(l.net_price))}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {!selected.lines?.length && <div className="text-muted-foreground/70 text-[10px]">No lines</div>}
                                </Card>
                            </Card>
                        )}
                    </div>
                </>
            )}

            {view === 'renewal' && (
                <div>
                    {upcoming.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-300 rounded-lg px-3 py-2 mb-3 text-[11px]">
                            <strong>⚠️ {upcoming.length} contract(s)</strong> renewing within 30 days
                        </div>
                    )}
                    <Card className="overflow-hidden shadow-sm">
                        {renewals.length > 0 ? (
                            <InteractiveSpreadsheet
                                data={renewals}
                                columns={renewalColumns}
                                virtualized={true}
                                containerHeight="500px"
                                onChange={() => { }}
                            />
                        ) : (
                            <div className="p-6 text-center text-muted-foreground/70">No pending renewals</div>
                        )}
                    </Card>
                </div>
            )}

            {view === 'evm' && (
                <div>
                    <div className="flex gap-2 mb-3 items-center">
                        <Input value={evmBaseline} onChange={e => setEvmBaseline(e.target.value)} placeholder="Paste Baseline ID..." className="text-xs w-72 h-8" aria-label="Baseline ID" />
                        {evmMetrics && (
                            <div className="flex gap-2">
                                {[{ lbl: 'SPI', val: formatNumber(evmMetrics.totals.ev / (evmMetrics.totals.pv || 1), 2), gd: 1 }, { lbl: 'CPI', val: formatNumber(evmMetrics.totals.ev / (evmMetrics.totals.ac || 1), 2), gd: 1 }, { lbl: 'EAC', val: `$${formatNumber(evmMetrics.eac / 1000, 0)}K`, clr: 'text-blue-700' }].map(k => (
                                    <div key={k.lbl} className="bg-card border border-border rounded-lg px-3 py-1.5">
                                        <div className={cn(`text-sm font-extrabold ${(k as any).clr ?? kpiC(Number(k.val))}`)}>{k.val}</div>
                                        <div className="text-[9px] text-muted-foreground/70">{k.lbl}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {evmMetrics && (
                        <Card className="overflow-hidden shadow-sm">
                            <InteractiveSpreadsheet
                                data={evmMetrics.controlAccounts}
                                columns={evmColumns}
                                virtualized={true}
                                containerHeight="500px"
                                onChange={() => { }}
                            />
                        </Card>
                    )}
                    {!evmBaseline && <Card className="text-center text-muted-foreground/70 p-8 shadow-sm">Enter a Baseline ID to view EVM metrics</Card>}
                </div>
            )}
        </StandardPage>
    );
}
