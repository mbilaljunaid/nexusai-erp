import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingDown, AlertTriangle, User } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Card } from "@/components/ui/card";
interface RiskScore {
    id: string; employee_id: string; risk_score: number; risk_band: string;
    tenure_months: number; engagement_score: number; last_promotion_days: number;
    compa_ratio: number; recent_absence_days: number; top_factors: Factor[];
    scored_at: string;
}
interface Factor { factor: string; value: string | number; direction: string; weight: number; }
interface Distribution { risk_band: string; count: number; avg_score: number; }

const BAND_CFG: Record<string, { bg: string; color: string; label: string; borderL: string; border: string }> = {
    CRITICAL: { bg: 'bg-red-500/10', color: 'text-red-600', label: '🔴 Critical', borderL: 'border-l-red-600', border: 'border-red-200' },
    HIGH: { bg: 'bg-amber-500/10', color: 'text-amber-600', label: '🟠 High', borderL: 'border-l-amber-600', border: 'border-amber-200' },
    MEDIUM: { bg: 'bg-amber-500/10', color: 'text-amber-500', label: '🟡 Medium', borderL: 'border-l-amber-500', border: 'border-amber-200' },
    LOW: { bg: 'bg-emerald-500/10', color: 'text-emerald-600', label: '🟢 Low', borderL: 'border-l-emerald-600', border: 'border-emerald-200' },
};

function ScoreBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const col = pct >= 75 ? 'text-red-600 bg-red-600' : pct >= 50 ? 'text-amber-600 bg-amber-600' : pct >= 25 ? 'text-amber-500 bg-amber-500' : 'text-emerald-600 bg-emerald-600';
    const textCol = col.split(' ')[0];
    const bgCol = col.split(' ')[1];
    const id = React.useId().replace(/:/g, '');
    return (
        <div className="flex items-center gap-1.5 w-full">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-12">
                <style>{`
                    .score-bar-${id} { width: ${pct}%; }
                `}</style>
                <div className={cn(`${bgCol} h-full rounded-full transition-all duration-300 score-bar-${id}`)} />
            </div>
            <span className={cn(`text-[11px] font-bold ${textCol} w-8 text-right shrink-0`)}>{pct}%</span>
        </div>
    );
}

export default function AttritionPrediction() {
    const [selected, setSelected] = useState<RiskScore | null>(null);
    const [bandFilter, setBandFilter] = useState('');
    const [showScore, setShowScore] = useState(false);
    const [form, setForm] = useState({
        employeeId: '', tenureMonths: '', engagementScore: '', lastPromotionDays: '',
        managerTenureMonths: '', compaRatio: '', recentAbsenceDays: '', overdueGoals: '',
    });
    const qc = useQueryClient();

    const { data: distribution = [] } = useQuery<Distribution[]>({ queryKey: ['attrition-dist'], queryFn: () => fetch('/api/hr-analytics/attrition/distribution').then(r => r.json()) });
    const { data: highRisk = [], isLoading } = useQuery<RiskScore[]>({ queryKey: ['attrition-high', bandFilter], queryFn: () => fetch(`/api/hr-analytics/attrition/high-risk?${bandFilter ? `band=${bandFilter}&` : ''}limit=100`).then(r => r.json()) });
    const { data: history = [] } = useQuery<RiskScore[]>({ queryKey: ['attrition-history', selected?.employee_id], enabled: !!selected, queryFn: () => fetch(`/api/hr-analytics/attrition/employees/${selected!.employee_id}/history`).then(r => r.json()) });

    const scoreMut = useMutation({
        mutationFn: (d: any) => fetch('/api/hr-analytics/attrition/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['attrition-high', 'attrition-dist'] }); setShowScore(false); },
    });

    const totalHeadcount = distribution.reduce((s, d) => s + Number(d.count), 0);

    const riskColumns: SpreadsheetColumn<any>[] = [
        { id: "employee_id", header: "Employee", width: "150px", cell: (row) => <div className="font-semibold flex items-center gap-1.5 w-full"><User size={12} className="text-gray-400" />{row.employee_id}</div> },
        { id: "risk_score", header: "Risk Score", width: "150px", cell: (row) => <div className="w-full pr-4"><ScoreBar score={Number(row.risk_score)} /></div> },
        {
            id: "risk_band", header: "Band", width: "100px", cell: (row) => {
                const cfg = BAND_CFG[row.risk_band] ?? BAND_CFG.LOW;
                return <div className="w-full"><span className={cn(`py-0.5 px-2 rounded font-bold text-[10px] ${cfg.bg} ${cfg.color}`)}>{row.risk_band}</span></div>;
            }
        },
        { id: "engagement_score", header: "Engagement", width: "100px", cell: (row) => <div className={cn(`w-full text-center font-mono font-bold ${Number(row.engagement_score) < 2.5 ? 'text-red-600' : 'text-gray-700'}`)}>{Number(row.engagement_score).toFixed(1)}</div> },
        { id: "tenure", header: "Tenure", width: "100px", cell: (row) => <span className="text-gray-500">{row.tenure_months}mo</span> },
        { id: "compa", header: "Compa", width: "100px", cell: (row) => <div className={cn(`w-full font-mono ${Number(row.compa_ratio) < 0.9 ? 'text-red-600' : 'text-gray-700'}`)}>{Number(row.compa_ratio).toFixed(2)}</div> },
        {
            id: "top_factor", header: "Top Factor", width: "200px", cell: (row) => {
                const top = (row.top_factors as Factor[])?.[0];
                return <span className="text-[10px] text-gray-400">{top?.factor ?? '—'}</span>;
            }
        },
        {
            id: "actions", header: "Actions", width: "80px", cell: (row) => (
                <button onClick={() => setSelected(selected?.id === row.id ? null : row)} className={cn(`py-1 px-2 text-[11px] border-none rounded cursor-pointer ${selected?.id === row.id ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`)}>
                    {selected?.id === row.id ? 'Hide' : 'Select'}
                </button>
            )
        }
    ];

    return (
        <StandardPage
            title="Attrition Risk Prediction"
            description="SHAP-explained risk factors · Flight risk scoring · Retention signals"
            actions={
                <button onClick={() => setShowScore(true)} className="py-2 px-3.5 bg-blue-700 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">+ Score Employee</button>
            }
        >
            {/* Distribution KPIs */}
            <div className="flex gap-2.5 mb-3.5">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(band => {
                    const d = distribution.find(x => x.risk_band === band);
                    const cfg = BAND_CFG[band];
                    const pct = totalHeadcount > 0 ? Math.round(Number(d?.count ?? 0) / totalHeadcount * 100) : 0;
                    return (
                        <div key={band} onClick={() => setBandFilter(bandFilter === band ? '' : band)} className={cn(`flex-1 rounded-xl py-2.5 px-3.5 cursor-pointer border border-l-[4px] ${cfg.bg} ${cfg.borderL} ${cfg.border} ${bandFilter && bandFilter !== band ? 'opacity-50' : 'opacity-100'}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                            <div className={cn(`text-xl font-extrabold font-mono ${cfg.color}`)}>{d?.count ?? 0}</div>
                            <div className={cn(`text-[10px] font-bold ${cfg.color}`)}>{cfg.label}</div>
                            <div className="text-[10px] text-gray-400">{pct}% of workforce</div>
                        </div>
                    );
                })}
            </div>

            {/* Score form */}
            {showScore && (
                <Card className="p-3.5 mb-3 bg-slate-500/10 shadow-sm">
                    <div className="text-[13px] font-bold mb-2.5">Score Employee Flight Risk</div>
                    <div className="grid grid-cols-4 gap-2">
                        {[['employeeId', 'Employee ID', 'text'], ['tenureMonths', 'Tenure (months)', 'number'], ['engagementScore', 'Engagement (1-5)', 'number'], ['lastPromotionDays', 'Days Since Promo', 'number'], ['managerTenureMonths', 'Manager Tenure (mo)', 'number'], ['compaRatio', 'Compa-Ratio (0-1.5)', 'number'], ['recentAbsenceDays', 'Absence Days (30d)', 'number'], ['overdueGoals', 'Overdue Goals', 'number']].map(([k, l, t]) => (
                            <div key={k as string} className="flex flex-col gap-0.5">
                                <label className="text-[10px] font-semibold">{l as string}</label>
                                <Input type={t as string} value={(form as any)[k as string]} onChange={e => setForm(p => ({ ...p, [k as string]: e.target.value }))} className="h-7 text-xs" aria-label={l as string} />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 justify-end mt-2.5">
                        <button onClick={() => setShowScore(false)} className="py-1.5 px-3.5 bg-gray-200 border-none rounded-[7px] text-[11px] cursor-pointer">Cancel</button>
                        <button disabled={!form.employeeId || scoreMut.isPending} onClick={() => scoreMut.mutate(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, k === 'employeeId' ? v : Number(v)])))} className="py-1.5 px-3.5 bg-blue-700 text-white border-none rounded-[7px] text-[11px] font-bold cursor-pointer disabled:opacity-50">
                            {scoreMut.isPending ? 'Scoring…' : 'Calculate Risk Score'}
                        </button>
                    </div>
                </Card>
            )}

            <div className="flex gap-3.5">
                {/* Risk table */}
                <div className="flex-1">
                    {bandFilter && <div className="text-[11px] text-gray-500 mb-1.5">Showing: {BAND_CFG[bandFilter]?.label} — <button onClick={() => setBandFilter('')} className="bg-transparent border-none text-blue-700 cursor-pointer text-[11px]">Clear</button></div>}
                    <Card className="overflow-hidden h-full min-h-[400px]">
                        <InteractiveSpreadsheet
                            columns={riskColumns}
                            data={highRisk}
                            onChange={() => { }}
                            containerHeight="500px"
                        />
                        {!isLoading && highRisk.length === 0 && <div className="text-center text-gray-400 p-6 border-t border-gray-200">No risk scores — submit an employee to calculate</div>}
                        {isLoading && <div className="text-center text-gray-400 p-6 border-t border-gray-200">Loading calculations...</div>}
                    </Card>
                </div>

                {/* Detail panel */}
                {selected && (
                    <div className="w-80 shrink-0">
                        <Card className="p-3.5 mb-2.5 shadow-sm">
                            <div className="flex justify-between mb-2">
                                <div className="font-bold text-[13px]">{selected.employee_id}</div>
                                <button onClick={() => setSelected(null)} className="bg-transparent border-none cursor-pointer text-gray-400">✕</button>
                            </div>
                            <div className="mb-2.5 flex"><ScoreBar score={Number(selected.risk_score)} /></div>
                            <div className="text-[11px] font-bold mb-1.5 text-gray-700">Risk Factors (SHAP)</div>
                            <div className="flex flex-col gap-1.5">
                                {(selected.top_factors as Factor[]).map((f, i) => (
                                    <div key={i} className="bg-amber-500/10 rounded-md py-1.5 px-2.5 flex justify-between items-center">
                                        <div>
                                            <div className="text-[11px] font-bold">{f.factor}</div>
                                            <div className="text-[10px] text-gray-500">Value: {f.value}</div>
                                        </div>
                                        <span className="text-[11px] font-extrabold text-amber-600">+{Math.round(Number(f.weight) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        {/* History trend */}
                        {history.length > 1 && (
                            <Card className="p-3.5 shadow-sm">
                                <div className="text-[11px] font-bold mb-2">Score History</div>
                                <div className="flex flex-col gap-1">
                                    {history.slice(0, 6).map((h, i) => (
                                        <div key={i} className="flex justify-between text-[10px] items-center">
                                            <span className="text-gray-500">{formatDate(h.scored_at)}</span>
                                            <div className="w-24 flex"><ScoreBar score={Number(h.risk_score)} /></div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
