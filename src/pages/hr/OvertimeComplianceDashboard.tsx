import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';

interface OvertimeRule {
    id: string;
    rule_code: string;
    jurisdiction: string;
    standard: string;
    daily_threshold_hours: number;
    weekly_threshold_hours: number;
    daily_ot_rate: number;
    weekly_ot_rate: number;
}

interface WeeklyOTRow {
    employee_id: string;
    week_start_date: string;
    total_hours: number;
    regular_hours: number;
    ot_hours: number;
    double_hours: number;
    gross_pay: number;
    jurisdiction: string;
    standard: string;
}

interface TimecardForm {
    employeeId: string;
    ruleCode: string;
    clockIn: string;
    clockOut: string;
    hourlyRate: number;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

const JURI_COLORS: Record<string, string> = { US_FEDERAL: '#1d4ed8', CA_ON: '#7c3aed', CA_BC: '#7c3aed', UK: '#059669', DE: '#d97706' };

export default function OvertimeComplianceDashboard() {
    const [activeTab, setActiveTab] = useState<'report' | 'timecard' | 'rules'>('report');
    const [weekDate, setWeekDate] = useState(new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10));
    const [tc, setTc] = useState<TimecardForm>({ employeeId: '', ruleCode: 'US_FLSA', clockIn: new Date().toISOString().slice(0, 16), clockOut: new Date().toISOString().slice(0, 16), hourlyRate: 25 });
    const qc = useQueryClient();

    const { data: rules = [] } = useQuery<OvertimeRule[]>({
        queryKey: ['ot-rules'],
        queryFn: () => fetch('/api/hr/wfm/overtime-rules').then(r => r.json()),
    });

    const { data: report = [], isLoading: reportLoading, refetch } = useQuery<WeeklyOTRow[]>({
        queryKey: ['ot-report', weekDate],
        queryFn: () => fetch(`/api/hr/wfm/overtime-report?weekStartDate=${weekDate}`).then(r => r.json()),
    });

    const tcMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/hr/wfm/timecards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['ot-report', weekDate] }),
    });

    const totalOTHours = report.reduce((s, r) => s + Number(r.ot_hours), 0);
    const totalDoubleHours = report.reduce((s, r) => s + Number(r.double_hours), 0);
    const totalPayroll = report.reduce((s, r) => s + Number(r.gross_pay), 0);

    return (
        <div className="ocd-container">
            <div className="ocd-header">
                <div>
                    <h1 className="ocd-title">Overtime Compliance Dashboard</h1>
                    <p className="ocd-sub">FLSA · California · Canada · EU WTD — regulatory overtime tracking</p>
                </div>
            </div>

            <div className="ocd-kpis">
                <div className="kpi blue"><div className="kv">{report.length}</div><div className="kl">Employees</div></div>
                <div className="kpi orange"><div className="kv">{totalOTHours.toFixed(1)}h</div><div className="kl">OT Hours (1.5×)</div></div>
                <div className="kpi red"><div className="kv">{totalDoubleHours.toFixed(1)}h</div><div className="kl">Double Time (2×)</div></div>
                <div className="kpi green"><div className="kv">{fmt(totalPayroll)}</div><div className="kl">Gross Payroll</div></div>
            </div>

            <div className="tab-bar">
                {(['report', 'timecard', 'rules'] as const).map(t => (
                    <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}
                        aria-pressed={activeTab === t}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
            </div>

            {activeTab === 'report' && (
                <div className="panel">
                    <div className="panel-row">
                        <div className="pf">
                            <label className="pl">Week Starting</label>
                            <input className="pi" type="date" value={weekDate} onChange={e => setWeekDate(e.target.value)} aria-label="Week start date" />
                        </div>
                        <button className="refresh-btn" onClick={() => refetch()} aria-label="Refresh report"><RefreshCw size={14} /></button>
                    </div>
                    <table className="ot-table">
                        <thead><tr><th>Employee</th><th>Regular</th><th>OT (1.5×)</th><th>Double (2×)</th><th>Gross Pay</th><th>Jurisdiction</th></tr></thead>
                        <tbody>
                            {reportLoading && <tr><td colSpan={6} className="loading">Loading…</td></tr>}
                            {report.map((r, i) => (
                                <tr key={i} className={`ot-row ${Number(r.ot_hours) > 10 ? 'high-ot' : ''}`}>
                                    <td className="mono">{r.employee_id.slice(0, 8)}…</td>
                                    <td className="mono">{Number(r.regular_hours).toFixed(1)}h</td>
                                    <td className="mono ot-cell">{Number(r.ot_hours) > 0 ? <><AlertTriangle size={11} /> {Number(r.ot_hours).toFixed(1)}h</> : '—'}</td>
                                    <td className="mono dbl-cell">{Number(r.double_hours) > 0 ? `${Number(r.double_hours).toFixed(1)}h` : '—'}</td>
                                    <td className="mono">{fmt(r.gross_pay)}</td>
                                    <td><span className="juri-tag" style={{ background: (JURI_COLORS[r.jurisdiction] ?? '#6b7280') + '22', color: JURI_COLORS[r.jurisdiction] ?? '#6b7280' }}>{r.jurisdiction}</span></td>
                                </tr>
                            ))}
                            {report.length === 0 && !reportLoading && <tr><td colSpan={6} className="empty">No data for selected week</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'timecard' && (
                <div className="panel tc-form">
                    <h3 className="tf-title">Log Timecard Punch</h3>
                    <div className="tf-grid">
                        <div className="ff"><label className="fl">Employee ID</label><input className="fi" placeholder="UUID or emp code" value={tc.employeeId} onChange={e => setTc(p => ({ ...p, employeeId: e.target.value }))} aria-label="Employee ID" /></div>
                        <div className="ff">
                            <label className="fl">Rule</label>
                            <select className="fi" value={tc.ruleCode} onChange={e => setTc(p => ({ ...p, ruleCode: e.target.value }))} aria-label="Overtime rule">
                                {rules.map(r => <option key={r.rule_code} value={r.rule_code}>{r.rule_code} ({r.jurisdiction})</option>)}
                                {rules.length === 0 && <option>US_FLSA</option>}
                            </select>
                        </div>
                        <div className="ff"><label className="fl">Clock In</label><input className="fi" type="datetime-local" value={tc.clockIn} onChange={e => setTc(p => ({ ...p, clockIn: e.target.value }))} aria-label="Clock in time" /></div>
                        <div className="ff"><label className="fl">Clock Out</label><input className="fi" type="datetime-local" value={tc.clockOut} onChange={e => setTc(p => ({ ...p, clockOut: e.target.value }))} aria-label="Clock out time" /></div>
                        <div className="ff"><label className="fl">Hourly Rate ($)</label><input className="fi" type="number" value={tc.hourlyRate} onChange={e => setTc(p => ({ ...p, hourlyRate: parseFloat(e.target.value) || 0 }))} aria-label="Hourly rate" /></div>
                    </div>
                    <button className="calc-btn" disabled={!tc.employeeId || tcMutation.isPending}
                        onClick={() => tcMutation.mutate(tc)} aria-label="Calculate overtime">
                        <Clock size={13} /> {tcMutation.isPending ? 'Calculating…' : 'Calculate OT'}
                    </button>
                    {tcMutation.isSuccess && (
                        <div className="tc-result">
                            <div className="tcr-row"><span>Regular</span><strong>{Number(tcMutation.data.regular_hours).toFixed(2)}h — {fmt(tcMutation.data.regular_pay)}</strong></div>
                            <div className="tcr-row"><span>OT (1.5×)</span><strong className="orange">{Number(tcMutation.data.ot_hours).toFixed(2)}h — {fmt(tcMutation.data.ot_pay)}</strong></div>
                            <div className="tcr-row"><span>Double (2×)</span><strong className="red">{Number(tcMutation.data.double_hours).toFixed(2)}h — {fmt(tcMutation.data.double_pay)}</strong></div>
                            <div className="tcr-row total"><span>Total Pay</span><strong>{fmt(tcMutation.data.total_pay)}</strong></div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="panel rules-panel">
                    {rules.map(r => (
                        <div key={r.id} className="rule-card">
                            <div className="rc-top">
                                <span className="rc-code">{r.rule_code}</span>
                                <span className="rc-juri" style={{ color: JURI_COLORS[r.jurisdiction] ?? '#6b7280' }}>{r.jurisdiction}</span>
                            </div>
                            <div className="rc-grid">
                                <div className="rcg"><span>Daily Threshold</span><strong>{r.daily_threshold_hours}h</strong></div>
                                <div className="rcg"><span>OT Rate (daily)</span><strong>{r.daily_ot_rate}×</strong></div>
                                <div className="rcg"><span>Weekly Threshold</span><strong>{r.weekly_threshold_hours}h</strong></div>
                                <div className="rcg"><span>OT Rate (weekly)</span><strong>{r.weekly_ot_rate}×</strong></div>
                            </div>
                        </div>
                    ))}
                    {rules.length === 0 && <div className="empty">No overtime rules configured</div>}
                </div>
            )}

            <style>{`
                .ocd-container { padding: 24px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', sans-serif; }
                .ocd-header { margin-bottom: 20px; }
                .ocd-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .ocd-sub { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .ocd-kpis { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
                .kpi { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 20px; flex: 1; min-width: 130px; }
                .kpi.blue { border-left: 4px solid #1d4ed8; } .kpi.orange { border-left: 4px solid #d97706; } .kpi.red { border-left: 4px solid #dc2626; } .kpi.green { border-left: 4px solid #059669; }
                .kv { font-size: 22px; font-weight: 800; font-family: monospace; color: #111827; }
                .kl { font-size: 11px; color: #9ca3af; margin-top: 2px; }
                .tab-bar { display: flex; gap: 4px; margin-bottom: 16px; }
                .tab-btn { padding: 7px 18px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; color: #6b7280; }
                .tab-btn.active { background: #111827; color: #fff; border-color: #111827; }
                .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .panel-row { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 14px; }
                .pf { display: flex; flex-direction: column; gap: 4px; }
                .pl { font-size: 11px; font-weight: 600; color: #374151; }
                .pi { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .refresh-btn { padding: 8px 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; }
                .ot-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .ot-table th { padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .ot-row:hover { background: #f9fafb; }
                .ot-row.high-ot { background: #fff7ed; }
                .ot-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .ot-cell { color: #d97706; font-weight: 700; display: flex; align-items: center; gap: 4px; }
                .dbl-cell { color: #dc2626; font-weight: 700; }
                .juri-tag { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .mono { font-family: monospace; }
                .empty, .loading { text-align: center; color: #9ca3af; font-size: 13px; padding: 16px; }
                .tc-form { }
                .tf-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; }
                .tf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
                .ff { display: flex; flex-direction: column; gap: 4px; }
                .fl { font-size: 11px; font-weight: 600; color: #374151; }
                .fi { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .calc-btn { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .calc-btn:disabled { background: #9ca3af; }
                .tc-result { margin-top: 14px; background: #f9fafb; border-radius: 8px; padding: 14px; }
                .tcr-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: #374151; border-bottom: 1px solid #e5e7eb; }
                .tcr-row.total { border-top: 2px solid #111827; margin-top: 4px; font-size: 14px; font-weight: 800; }
                .orange { color: #d97706; }
                .red { color: #dc2626; }
                .rules-panel { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
                .rule-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
                .rc-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .rc-code { font-size: 13px; font-weight: 700; font-family: monospace; color: #111827; }
                .rc-juri { font-size: 11px; font-weight: 700; }
                .rc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
                .rcg { display: flex; flex-direction: column; }
                .rcg span { font-size: 10px; color: #9ca3af; }
                .rcg strong { font-size: 13px; color: #111827; font-family: monospace; }
            `}</style>
        </div>
    );
}
