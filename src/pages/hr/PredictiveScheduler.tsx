import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Zap, Send, BarChart2, Users } from 'lucide-react';
import { useEnterpriseStore } from '@/lib/enterpriseStore';
import { StandardPage } from "@/components/layout/StandardPage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { DatePicker } from '@/components/ui/DatePicker';

interface Shift {
    id: string;
    employee_id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    shift_hours: number;
    status: string;
    predicted_demand: number;
}

interface CoverageData {
    date: string;
    scheduledHeadcount: number;
    gaps: Array<{ hour_of_day: number; required_headcount: number }>;
    forecasted: Array<{ hour_of_day: number; required_headcount: number }>;
}

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
    Confirmed: { bg: '#d1fae5', color: '#059669' },
    Scheduled: { bg: '#eff6ff', color: '#1d4ed8' },
    Open: { bg: '#fef3c7', color: '#d97706' },
    Cancelled: { bg: '#fee2e2', color: '#dc2626' },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function PredictiveScheduler() {
    const [activeTab, setActiveTab] = useState<'schedule' | 'forecast' | 'generate'>('schedule');
    const [location, setLocation] = useState('LOC-001');
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)); // Monday
        return d.toISOString().slice(0, 10);
    });
    const [coverageDate, setCoverageDate] = useState(new Date().toISOString().slice(0, 10));
    const [genParams, setGenParams] = useState({ weekStartDate: '', employeeIds: 'EMP001,EMP002,EMP003', maxHoursPerEmployee: 40, shiftHours: 8 });
    const qc = useQueryClient();
    const { legalEntityId } = useEnterpriseStore();

    const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 86400_000).toISOString().slice(0, 10);

    const { data: shifts = [] } = useQuery<Shift[]>({
        queryKey: ['shifts', location, weekStart, legalEntityId],
        queryFn: () => fetch(`/api/hr/wfm/schedule?locationId=${location}&startDate=${weekStart}&endDate=${weekEnd}`, { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()),
    });

    const { data: coverage } = useQuery<CoverageData>({
        queryKey: ['coverage', location, coverageDate, legalEntityId],
        queryFn: () => fetch(`/api/hr/wfm/coverage?locationId=${location}&date=${coverageDate}`, { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()),
        enabled: activeTab === 'forecast',
    });

    const forecastMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/hr/wfm/forecast', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {}) }, body: JSON.stringify({ ...data, entLegalEntityId: legalEntityId }) }).then(r => r.json()),
    });

    const generateMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/hr/wfm/schedule/generate', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {}) }, body: JSON.stringify({ ...data, entLegalEntityId: legalEntityId }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
    });

    const publishMutation = useMutation({
        mutationFn: () => fetch('/api/hr/wfm/schedule/publish', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {}) }, body: JSON.stringify({ locationId: location, weekStartDate: weekStart, entLegalEntityId: legalEntityId }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
    });

    // Group shifts by date for calendar view
    const shiftsByDate = shifts.reduce<Record<string, Shift[]>>((acc, s) => {
        acc[s.shift_date] = [...(acc[s.shift_date] ?? []), s];
        return acc;
    }, {});

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
    });

    const maxDemand = coverage?.forecasted ? Math.max(...coverage.forecasted.map(f => f.required_headcount), 1) : 1;

    return (
        <StandardPage
            title="Predictive Scheduler"
            description="AI-driven demand forecasting + constraint-based shift scheduling"
            actions={
                <div className="ps-ctrl">
                    <div className="ps-loc">
                        <label className="ll">Location</label>
                        <Input className="li" value={location} onChange={e => setLocation(e.target.value)} aria-label="Location ID" />
                    </div>
                    <div className="ps-wk">
                        <label className="ll">Week Of</label>
                        <DatePicker className="li" value={weekStart} onChange={v => setWeekStart(v)} aria-label="Week start date" />
                    </div>
                    <button className="pub-btn" disabled={publishMutation.isPending || shifts.length === 0}
                        onClick={() => publishMutation.mutate()} aria-label="Publish schedule">
                        <Send size={13} /> {publishMutation.isPending ? 'Publishing…' : 'Publish'}
                    </button>
                </div>
            }
        >

            <div className="tab-bar">
                {(['schedule', 'forecast', 'generate'] as const).map(t => (
                    <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                        onClick={() => setActiveTab(t)} aria-pressed={activeTab === t}>
                        {t === 'schedule' && <Calendar size={12} />}
                        {t === 'forecast' && <BarChart2 size={12} />}
                        {t === 'generate' && <Zap size={12} />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'schedule' && (
                <div className="week-grid">
                    {weekDates.map(date => {
                        const dayShifts = shiftsByDate[date] ?? [];
                        const d = new Date(date);
                        const label = format(d, 'EEE, MMM d');
                        return (
                            <div key={date} className="day-col">
                                <div className="day-header">{label}</div>
                                <div className="day-shifts">
                                    {dayShifts.map(s => {
                                        const cfg = STATUS_CFG[s.status] ?? { bg: '#f3f4f6', color: '#6b7280' };
                                        return (
                                            // eslint-disable-next-line
                                            <div key={s.id} className="shift-chip" style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.color}` }}>
                                                <div className="sc-time">{s.start_time}–{s.end_time}</div>
                                                <div className="sc-emp"><Users size={10} /> {s.employee_id?.slice(0, 6)}…</div>
                                                {/* eslint-disable-next-line */}
                                                <span className="sc-stat" style={{ color: cfg.color }}>{s.status}</span>
                                            </div>
                                        );
                                    })}
                                    {dayShifts.length === 0 && <div className="no-shift">No shifts</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'forecast' && (
                <div className="forecast-panel">
                    <div className="fc-ctrl">
                        <div className="pf"><label className="pl">Date</label><DatePicker className="pi" value={coverageDate} onChange={v => setCoverageDate(v)} aria-label="Date for coverage" /></div>
                        <button className="run-fc-btn" disabled={forecastMutation.isPending}
                            onClick={() => forecastMutation.mutate({ locationId: location, startDate: coverageDate, endDate: coverageDate })} aria-label="Run forecast">
                            {forecastMutation.isPending ? 'Forecasting…' : 'Run Forecast'}
                        </button>
                    </div>

                    {coverage && (
                        <>
                            <div className="cov-summary">
                                <div className="cs-kpi"><div className="ck-v">{coverage.scheduledHeadcount}</div><div className="ck-l">Scheduled</div></div>
                                <div className="cs-kpi"><div className="ck-v">{coverage.gaps?.length ?? 0}</div><div className="ck-l">Coverage Gaps</div></div>
                            </div>
                            <div className="demand-chart">
                                <div className="dc-title">Hourly Demand Forecast vs Scheduled</div>
                                <div className="bars">
                                    {HOURS.map(h => {
                                        const slot = coverage.forecasted?.find((f: any) => f.hour_of_day === h);
                                        const req = slot?.required_headcount ?? 0;
                                        const isGap = coverage.gaps?.some((g: any) => g.hour_of_day === h);
                                        return (
                                            <div key={h} className="bar-col">
                                                <div className="bar-wrap">
                                                    {/* eslint-disable-next-line */}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="bar" style={{ height: `${(req / maxDemand) * 80}px`, background: isGap ? '#fca5a5' : '#93c5fd' }} />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{`${h}:00 — ${req} needed`}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <div className="bar-h">{h % 4 === 0 ? `${h}h` : ''}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bar-legend"><span className="legend-item blue">■ Covered</span><span className="legend-item red">■ Gap</span></div>
                            </div>
                        </>
                    )}
                    {!coverage && <div className="empty">Select a date and run forecast</div>}
                </div>
            )}

            {activeTab === 'generate' && (
                <div className="gen-panel">
                    <h3 className="gp-title">Generate Schedule from Demand Forecast</h3>
                    <div className="gp-grid">
                        <div className="gf"><label className="gl">Week Start</label><DatePicker className="gi" value={genParams.weekStartDate || weekStart} onChange={v => setGenParams(p => ({ ...p, weekStartDate: v }))} aria-label="Schedule week start" /></div>
                        <div className="gf"><label className="gl">Employee IDs (comma-sep)</label><Input className="gi" value={genParams.employeeIds} onChange={e => setGenParams(p => ({ ...p, employeeIds: e.target.value }))} aria-label="Employee IDs" /></div>
                        <div className="gf"><label className="gl">Max Hours / Employee</label><Input className="gi" type="number" value={genParams.maxHoursPerEmployee} onChange={e => setGenParams(p => ({ ...p, maxHoursPerEmployee: parseInt(e.target.value) || 40 }))} aria-label="Max hours per employee" /></div>
                        <div className="gf"><label className="gl">Shift Hours</label><Input className="gi" type="number" value={genParams.shiftHours} onChange={e => setGenParams(p => ({ ...p, shiftHours: parseInt(e.target.value) || 8 }))} aria-label="Hours per shift" /></div>
                    </div>
                    <button className="gen-btn" disabled={generateMutation.isPending}
                        onClick={() => generateMutation.mutate({
                            locationId: location,
                            weekStartDate: genParams.weekStartDate || weekStart,
                            shiftHours: genParams.shiftHours,
                            employeePool: genParams.employeeIds.split(',').map(id => ({ employeeId: id.trim(), maxHours: genParams.maxHoursPerEmployee })),
                        })} aria-label="Generate schedule">
                        <Zap size={13} /> {generateMutation.isPending ? 'Generating…' : 'Generate Schedule'}
                    </button>
                    {generateMutation.isSuccess && (
                        <div className="gen-result">
                            ✅ {generateMutation.data?.shiftsGenerated} shifts generated · {Math.round((generateMutation.data?.coverage ?? 0) * 100)}% week coverage
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .ps-container { font-family: 'Inter', sans-serif; }
                .ps-ctrl { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
                .ps-loc, .ps-wk { display: flex; flex-direction: column; gap: 3px; }
                .ll { font-size: 10px; font-weight: 600; color: #374151; }
                .li { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .pub-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #059669; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .pub-btn:disabled { background: #9ca3af; }
                .tab-bar { display: flex; gap: 4px; margin-bottom: 16px; }
                .tab-btn { display: flex; align-items: center; gap: 5px; padding: 7px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; color: #6b7280; }
                .tab-btn.active { background: #111827; color: #fff; border-color: #111827; }
                .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
                .day-col { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; min-height: 200px; }
                .day-header { padding: 8px 10px; background: #f9fafb; font-size: 11px; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; }
                .day-shifts { padding: 6px; display: flex; flex-direction: column; gap: 4px; }
                .shift-chip { padding: 6px 8px; border-radius: 6px; }
                .sc-time { font-size: 10px; font-family: monospace; font-weight: 700; }
                .sc-emp { font-size: 10px; color: #6b7280; display: flex; align-items: center; gap: 3px; margin: 2px 0; }
                .sc-stat { font-size: 9px; font-weight: 700; }
                .no-shift { padding: 10px; text-align: center; color: #d1d5db; font-size: 11px; }
                .forecast-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .fc-ctrl { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 16px; }
                .pf { display: flex; flex-direction: column; gap: 4px; }
                .pl { font-size: 11px; font-weight: 600; color: #374151; }
                .pi { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .run-fc-btn { padding: 8px 14px; background: #7c3aed; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .cov-summary { display: flex; gap: 12px; margin-bottom: 14px; }
                .cs-kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 16px; }
                .ck-v { font-size: 22px; font-weight: 800; font-family: monospace; color: #111827; }
                .ck-l { font-size: 11px; color: #9ca3af; }
                .demand-chart { background: #f9fafb; border-radius: 8px; padding: 14px; }
                .dc-title { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 10px; }
                .bars { display: flex; align-items: flex-end; gap: 2px; height: 100px; }
                .bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; }
                .bar-wrap { display: flex; align-items: flex-end; height: 84px; }
                .bar { width: 100%; min-height: 2px; border-radius: 2px 2px 0 0; transition: height 0.3s ease; }
                .bar-h { font-size: 9px; color: #9ca3af; margin-top: 2px; }
                .bar-legend { display: flex; gap: 12px; margin-top: 8px; font-size: 11px; }
                .legend-item.blue { color: #93c5fd; } .legend-item.red { color: #fca5a5; }
                .empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 40px; }
                .gen-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
                .gp-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 14px; }
                .gp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
                .gf { display: flex; flex-direction: column; gap: 4px; }
                .gl { font-size: 11px; font-weight: 600; color: #374151; }
                .gi { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .gen-btn { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .gen-btn:disabled { background: #9ca3af; }
                .gen-result { margin-top: 12px; padding: 10px 14px; background: #d1fae5; color: #059669; border-radius: 8px; font-size: 12px; font-weight: 600; }
            `}</style>
        </StandardPage>
    );
}
