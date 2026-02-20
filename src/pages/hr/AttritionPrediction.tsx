import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingDown, AlertTriangle, User } from 'lucide-react';

interface RiskScore {
    id: string; employee_id: string; risk_score: number; risk_band: string;
    tenure_months: number; engagement_score: number; last_promotion_days: number;
    compa_ratio: number; recent_absence_days: number; top_factors: Factor[];
    scored_at: string;
}
interface Factor { factor: string; value: string | number; direction: string; weight: number; }
interface Distribution { risk_band: string; count: number; avg_score: number; }

const BAND_CFG: Record<string, { bg: string; color: string; label: string }> = {
    CRITICAL: { bg: '#fee2e2', color: '#dc2626', label: '🔴 Critical' },
    HIGH: { bg: '#fef3c7', color: '#d97706', label: '🟠 High' },
    MEDIUM: { bg: '#fffbeb', color: '#f59e0b', label: '🟡 Medium' },
    LOW: { bg: '#f0fdf4', color: '#059669', label: '🟢 Low' },
};

function ScoreBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const col = pct >= 75 ? '#dc2626' : pct >= 50 ? '#d97706' : pct >= 25 ? '#f59e0b' : '#059669';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 999, height: 6 }}>
                <div style={{ width: pct + '%', background: col, height: '100%', borderRadius: 999, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: col, width: 32, textAlign: 'right' }}>{pct}%</span>
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

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Attrition Risk Prediction</h1>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>SHAP-explained risk factors · Flight risk scoring · Retention signals</p>
                </div>
                <button onClick={() => setShowScore(true)} style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Score Employee</button>
            </div>

            {/* Distribution KPIs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(band => {
                    const d = distribution.find(x => x.risk_band === band);
                    const cfg = BAND_CFG[band];
                    const pct = totalHeadcount > 0 ? Math.round(Number(d?.count ?? 0) / totalHeadcount * 100) : 0;
                    return (
                        <div key={band} onClick={() => setBandFilter(bandFilter === band ? '' : band)} style={{ flex: 1, background: cfg.bg, border: `1px solid ${cfg.color}40`, borderLeft: `4px solid ${cfg.color}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', opacity: bandFilter && bandFilter !== band ? 0.5 : 1 }}>
                            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: cfg.color }}>{d?.count ?? 0}</div>
                            <div style={{ fontSize: 10, color: cfg.color, fontWeight: 700 }}>{cfg.label}</div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{pct}% of workforce</div>
                        </div>
                    );
                })}
            </div>

            {/* Score form */}
            {showScore && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Score Employee Flight Risk</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {[['employeeId', 'Employee ID', 'text'], ['tenureMonths', 'Tenure (months)', 'number'], ['engagementScore', 'Engagement (1-5)', 'number'], ['lastPromotionDays', 'Days Since Promo', 'number'], ['managerTenureMonths', 'Manager Tenure (mo)', 'number'], ['compaRatio', 'Compa-Ratio (0-1.5)', 'number'], ['recentAbsenceDays', 'Absence Days (30d)', 'number'], ['overdueGoals', 'Overdue Goals', 'number']].map(([k, l, t]) => (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ fontSize: 10, fontWeight: 600 }}>{l}</label>
                                <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11 }} aria-label={l} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button onClick={() => setShowScore(false)} style={{ padding: '6px 14px', background: '#e5e7eb', border: 'none', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={!form.employeeId || scoreMut.isPending} onClick={() => scoreMut.mutate(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, k === 'employeeId' ? v : Number(v)])))} style={{ padding: '6px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            {scoreMut.isPending ? 'Scoring…' : 'Calculate Risk Score'}
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 14 }}>
                {/* Risk table */}
                <div style={{ flex: 1 }}>
                    {bandFilter && <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Showing: {BAND_CFG[bandFilter]?.label} — <button onClick={() => setBandFilter('')} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontSize: 11 }}>Clear</button></div>}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                        <thead><tr style={{ background: '#f9fafb' }}>
                            {['Employee', 'Risk Score', 'Band', 'Engagement', 'Tenure', 'Compa', 'Top Factor'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {highRisk.map(r => {
                                const cfg = BAND_CFG[r.risk_band] ?? BAND_CFG.LOW;
                                const top = (r.top_factors as Factor[])?.[0];
                                return (
                                    <tr key={r.id} onClick={() => setSelected(selected?.id === r.id ? null : r)} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === r.id ? '#f0f9ff' : undefined }}>
                                        <td style={{ padding: '8px 12px', fontWeight: 600 }}><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={12} color="#9ca3af" />{r.employee_id}</div></td>
                                        <td style={{ padding: '8px 12px', minWidth: 120 }}><ScoreBar score={Number(r.risk_score)} /></td>
                                        <td style={{ padding: '8px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{r.risk_band}</span></td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: Number(r.engagement_score) < 2.5 ? '#dc2626' : '#374151' }}>{Number(r.engagement_score).toFixed(1)}</span></td>
                                        <td style={{ padding: '8px 12px', color: '#6b7280' }}>{r.tenure_months}mo</td>
                                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: Number(r.compa_ratio) < 0.9 ? '#dc2626' : '#374151' }}>{Number(r.compa_ratio).toFixed(2)}</td>
                                        <td style={{ padding: '8px 12px', fontSize: 10, color: '#9ca3af' }}>{top?.factor ?? '—'}</td>
                                    </tr>
                                );
                            })}
                            {!isLoading && highRisk.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No risk scores — submit an employee to calculate</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Detail panel */}
                {selected && (
                    <div style={{ width: 320, flexShrink: 0 }}>
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{selected.employee_id}</div>
                                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ marginBottom: 10 }}><ScoreBar score={Number(selected.risk_score)} /></div>
                            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Risk Factors (SHAP)</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {(selected.top_factors as Factor[]).map((f, i) => (
                                    <div key={i} style={{ background: '#fef3c7', borderRadius: 6, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700 }}>{f.factor}</div>
                                            <div style={{ fontSize: 10, color: '#6b7280' }}>Value: {f.value}</div>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706' }}>+{Math.round(Number(f.weight) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* History trend */}
                        {history.length > 1 && (
                            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Score History</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {history.slice(0, 6).map((h, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280' }}>{new Date(h.scored_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <div style={{ width: 100 }}><ScoreBar score={Number(h.risk_score)} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
