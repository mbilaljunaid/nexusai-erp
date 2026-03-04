import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Shield, Eye, Star, DollarSign, BarChart3, CheckCircle2, X } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
interface BenefitPlan {
    id: string;
    name: string;
    benefit_type: string;
    provider_name: string;
    employee_cost: number;
    employer_cost: number;
    currency_code: string;
}

interface Enrollment {
    id: string;
    plan_id: string;
    plan_name: string;
    benefit_type: string;
    employee_cost: number;
    employer_cost: number;
    currency_code: string;
    status: string;
    waived: boolean;
    effective_from: string;
}

interface SummaryRow {
    benefit_type: string;
    enrolled: number;
    waived: number;
    employee_cost_total: number;
    employer_cost_total: number;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
    Medical: <Heart size={18} />,
    Dental: <Shield size={18} />,
    Vision: <Eye size={18} />,
    Life: <Star size={18} />,
    '401k': <BarChart3 size={18} />,
    FSA: <DollarSign size={18} />,
    HSA: <DollarSign size={18} />,
};

const TYPE_CLASSES: Record<string, { bg: string; text: string; lightBg: string }> = {
    Medical: { bg: 'bg-red-600', text: 'text-red-600', lightBg: 'bg-red-600/20' },
    Dental: { bg: 'bg-blue-700', text: 'text-blue-700', lightBg: 'bg-blue-700/20' },
    Vision: { bg: 'bg-purple-600', text: 'text-purple-600', lightBg: 'bg-purple-600/20' },
    Life: { bg: 'bg-amber-600', text: 'text-amber-600', lightBg: 'bg-amber-600/20' },
    '401k': { bg: 'bg-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-600/20' },
    FSA: { bg: 'bg-cyan-600', text: 'text-cyan-600', lightBg: 'bg-cyan-600/20' },
    HSA: { bg: 'bg-cyan-600', text: 'text-cyan-600', lightBg: 'bg-cyan-600/20' },
};

const fmt = (n: number, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n);

export default function BenefitsEnrollment() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'enrollments' | 'summary'>('catalog');
    const [employeeId, setEmployeeId] = useState('');
    const [enrollingPlan, setEnrollingPlan] = useState<BenefitPlan | null>(null);
    const [dependents, setDependents] = useState<Array<{ name: string; dob: string; relationship: string }>>([]);

    const qc = useQueryClient();

    const { data: plans = [] } = useQuery<BenefitPlan[]>({
        queryKey: ['benefit-plans'],
        queryFn: () => fetch('/api/hr/benefits/plans').then(r => r.json()),
    });

    const { data: enrollments = [], refetch: refetchEnrollments } = useQuery<Enrollment[]>({
        queryKey: ['benefit-enrollments', employeeId],
        queryFn: () => employeeId
            ? fetch(`/api/hr/benefits/employees/${employeeId}/enrollments`).then(r => r.json())
            : Promise.resolve([]),
        enabled: !!employeeId,
    });

    const { data: summary = [] } = useQuery<SummaryRow[]>({
        queryKey: ['benefits-summary'],
        queryFn: () => fetch('/api/hr/benefits/summary').then(r => r.json()),
    });

    const enrollMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/hr/benefits/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['benefit-enrollments'] }); setEnrollingPlan(null); setDependents([]); },
    });

    const waiveMutation = useMutation({
        mutationFn: ({ planId }: { planId: string }) =>
            fetch('/api/hr/benefits/waive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, planId }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['benefit-enrollments'] }),
    });

    const terminateMutation = useMutation({
        mutationFn: (id: string) =>
            fetch(`/api/hr/benefits/enrollments/${id}/terminate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ effectiveTo: new Date().toISOString().slice(0, 10) }) }).then(r => r.json()),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['benefit-enrollments'] }),
    });

    const enrolledPlanIds = new Set(enrollments.filter(e => !e.waived).map(e => e.plan_id));

    const enrollmentColumns: SpreadsheetColumn<any>[] = [
        { id: "plan", header: "Plan", width: "150px", cell: (row) => <span className="plan-cell">{row.plan_name}</span> },
        {
            id: "type", header: "Type", width: "100px", cell: (row) => {
                const cls = TYPE_CLASSES[row.benefit_type] ?? { lightBg: 'bg-gray-100', text: 'text-gray-500' };
                return <span className={`type-badge ${cls.lightBg} ${cls.text}`}>{row.benefit_type}</span>;
            }
        },
        { id: "emp_cost", header: "Employee Cost", width: "120px", cell: (row) => <span>{fmt(row.employee_cost, row.currency_code)}</span> },
        { id: "empr_cost", header: "Employer Cost", width: "120px", cell: (row) => <span>{fmt(row.employer_cost, row.currency_code)}</span> },
        { id: "effective", header: "Effective", width: "100px", cell: (row) => <span className="date-cell">{row.effective_from}</span> },
        { id: "status", header: "Status", width: "100px", cell: (row) => row.waived ? <span className="waived-badge">Waived</span> : <span className="active-badge">Active</span> },
        {
            id: "actions", header: "Actions", width: "150px", cell: (row) => !row.waived ? (
                <>
                    <button className="waive-btn" onClick={() => waiveMutation.mutate({ planId: row.plan_id })} aria-label={`Waive ${row.plan_name}`}>Waive</button>
                    <button className="term-btn" onClick={() => terminateMutation.mutate(row.id)} aria-label={`Terminate ${row.plan_name}`}>Terminate</button>
                </>
            ) : null
        }
    ];

    const summaryColumns: SpreadsheetColumn<any>[] = [
        {
            id: "type", header: "Benefit Type", width: "150px", cell: (row) => {
                const cls = TYPE_CLASSES[row.benefit_type] ?? { lightBg: 'bg-gray-100', text: 'text-gray-500' };
                return <span className={`type-badge ${cls.lightBg} ${cls.text}`}>{row.benefit_type}</span>;
            }
        },
        { id: "enrolled", header: "Enrolled", width: "100px", cell: (row) => <span className="num-cell block w-full text-right">{Number(row.enrolled).toLocaleString()}</span> },
        { id: "waived", header: "Waived", width: "100px", cell: (row) => <span className="num-cell block w-full text-right">{Number(row.waived).toLocaleString()}</span> },
        { id: "emp_cost", header: "Employee Cost", width: "120px", cell: (row) => <span className="amt-cell block w-full text-right">{fmt(row.employee_cost_total ?? 0)}</span> },
        { id: "empr_cost", header: "Employer Cost", width: "120px", cell: (row) => <span className="amt-cell block w-full text-right">{fmt(row.employer_cost_total ?? 0)}</span> },
        {
            id: "participation", header: "Participation %", width: "150px", cell: (row) => {
                const total = Number(row.enrolled) + Number(row.waived);
                const pct = total > 0 ? Math.round(Number(row.enrolled) / total * 100) : 0;
                const cls = TYPE_CLASSES[row.benefit_type] ?? { bg: 'bg-gray-500' };
                return (
                    <div className="pct-row flex items-center gap-2">
                        <div className="pct-bar-bg flex-1 h-1.5 bg-gray-200 rounded-full">
                            <style>{`.pct-bar-fill-${row.benefit_type.replace(/\\W/g, '')} { width: ${pct}%; }`}</style>
                            <div className={`pct-bar-fill pct-bar-fill-${row.benefit_type.replace(/\\W/g, '')} h-full rounded-full ${cls.bg}`} />
                        </div>
                        <span className="pct-label text-xs min-w-[30px]">{pct}%</span>
                    </div>
                );
            }
        }
    ];

    return (
        <StandardPage
            title="Benefits Enrollment"
            description="Open enrollment, life-event changes, and benefits catalog management"
        >
            {/* Tabs */}
            <div className="be-tabs">
                {(['catalog', 'enrollments', 'summary'] as const).map(t => (
                    <button key={t} className={`be-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'catalog' && (
                <div className="plan-grid">
                    {plans.map(plan => {
                        const cls = TYPE_CLASSES[plan.benefit_type] ?? { bg: 'bg-gray-500' };
                        const icon = TYPE_ICONS[plan.benefit_type] ?? <Star size={18} />;
                        return (
                            <div key={plan.id} className="plan-card">
                                <div className={`plan-type-header ${cls.bg}`}>
                                    <span className="text-white">{icon}</span>
                                    <span className="plan-type-label text-white">{plan.benefit_type}</span>
                                </div>
                                <div className="plan-body">
                                    <div className="plan-name">{plan.name}</div>
                                    {plan.provider_name && <div className="plan-provider">{plan.provider_name}</div>}
                                    <div className="plan-costs">
                                        <span>Employee: <strong>{fmt(plan.employee_cost, plan.currency_code)}/period</strong></span>
                                        <span>Employer: <strong>{fmt(plan.employer_cost, plan.currency_code)}/period</strong></span>
                                    </div>
                                    {enrolledPlanIds.has(plan.id) ? (
                                        <span className="enrolled-badge"><CheckCircle2 size={13} /> Enrolled</span>
                                    ) : (
                                        <button className="enroll-btn" onClick={() => setEnrollingPlan(plan)} aria-label={`Enroll in ${plan.name}`}>
                                            Enroll
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {plans.length === 0 && <div className="empty-plans">No benefit plans available during current enrollment period</div>}
                </div>
            )}

            {activeTab === 'enrollments' && (
                <div className="be-card">
                    <div className="emp-lookup">
                        <input
                            className="emp-input"
                            placeholder="Enter Employee ID to view enrollments"
                            value={employeeId}
                            onChange={e => setEmployeeId(e.target.value)}
                            aria-label="Employee ID"
                        />
                    </div>
                    {enrollments.length > 0 ? (
                        <div className="h-[400px]">
                            <InteractiveSpreadsheet
                                columns={enrollmentColumns}
                                data={enrollments}
                                onChange={() => { }}
                                containerHeight="100%"
                            />
                        </div>
                    ) : employeeId ? (
                        <div className="empty-plans">No active enrollments for this employee</div>
                    ) : null}
                </div>
            )}

            {activeTab === 'summary' && (
                <div className="be-card pb-0 !p-0">
                    <h2 className="section-title pt-4 px-4 pb-2 m-0 bg-white">Benefits Participation Summary</h2>
                    <div className="h-[400px] bg-white">
                        {summary.length === 0 ? (
                            <div className="empty-plans h-full flex items-center justify-center">No data available</div>
                        ) : (
                            <InteractiveSpreadsheet
                                columns={summaryColumns}
                                data={summary}
                                onChange={() => { }}
                                containerHeight="100%"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Enrollment Modal */}
            {enrollingPlan && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-box">
                        <div className="modal-head">
                            <h2 className="modal-title">Enroll: {enrollingPlan.name}</h2>
                            <button className="modal-close" onClick={() => setEnrollingPlan(null)} aria-label="Close"><X size={20} /></button>
                        </div>
                        <div className="enroll-costs">
                            Employee: <strong>{fmt(enrollingPlan.employee_cost, enrollingPlan.currency_code)}/period</strong>
                            &nbsp;·&nbsp;
                            Employer: <strong>{fmt(enrollingPlan.employer_cost, enrollingPlan.currency_code)}/period</strong>
                        </div>
                        <div className="mf">
                            <label className="ml" htmlFor="enroll-emp-id">Employee ID</label>
                            <input id="enroll-emp-id" className="mi" value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
                        </div>
                        <div className="deps-section">
                            <div className="deps-header">
                                Dependents
                                <button className="add-dep-btn" onClick={() => setDependents(d => [...d, { name: '', dob: '', relationship: 'Spouse' }])} aria-label="Add dependent">+ Add</button>
                            </div>
                            {dependents.map((d, i) => (
                                <div key={i} className="dep-row">
                                    <input className="dep-input" placeholder="Name" value={d.name} onChange={e => { const n = [...dependents]; n[i].name = e.target.value; setDependents(n); }} aria-label="Dependent name" />
                                    <input className="dep-input" type="date" value={d.dob} onChange={e => { const n = [...dependents]; n[i].dob = e.target.value; setDependents(n); }} aria-label="Dependent Date of Birth" />
                                    <select className="dep-input" value={d.relationship} onChange={e => { const n = [...dependents]; n[i].relationship = e.target.value; setDependents(n); }} aria-label="Dependent Relationship">
                                        {['Spouse', 'Child', 'Parent', 'Domestic Partner'].map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <button className="dep-remove" onClick={() => setDependents(d => d.filter((_, j) => j !== i))} aria-label="Remove dependent"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="mcancel" onClick={() => { setEnrollingPlan(null); setDependents([]); }}>Cancel</button>
                            <button className="msubmit" disabled={enrollMutation.isPending || !employeeId} onClick={() =>
                                enrollMutation.mutate({
                                    planId: enrollingPlan.id,
                                    employeeId,
                                    enrollmentDate: new Date().toISOString().slice(0, 10),
                                    effectiveFrom: new Date().toISOString().slice(0, 10),
                                    dependents,
                                })
                            } aria-label="Confirm enrollment">
                                {enrollMutation.isPending ? 'Enrolling…' : 'Confirm Enrollment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .be-container { font-family: 'Inter', sans-serif; }
                .be-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .be-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
                .be-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
                .be-tabs { display: flex; gap: 2px; background: #f3f4f6; border-radius: 10px; padding: 3px; margin-bottom: 20px; width: fit-content; }
                .be-tab { padding: 8px 20px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; background: transparent; color: #6b7280; transition: all 0.2s; }
                .be-tab.active { background: #fff; color: #1d4ed8; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
                .plan-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
                .plan-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s; }
                .plan-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .plan-type-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; }
                .plan-type-label { font-size: 14px; font-weight: 700; color: #fff; }
                .plan-body { padding: 14px 16px; }
                .plan-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
                .plan-provider { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
                .plan-costs { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #374151; margin-bottom: 12px; }
                .enroll-btn { width: 100%; padding: 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; }
                .enrolled-badge { display: flex; align-items: center; gap: 6px; color: #059669; font-size: 13px; font-weight: 600; padding: 6px 0; }
                .empty-plans { text-align: center; padding: 60px; color: #9ca3af; font-size: 14px; }
                .be-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
                .emp-lookup { padding: 16px; border-bottom: 1px solid #e5e7eb; }
                .emp-input { width: 300px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; }
                .be-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .be-table th { padding: 10px 16px; text-align: left; font-weight: 600; color: #374151; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
                .be-row:hover { background: #f9fafb; }
                .be-table td { padding: 10px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
                .plan-cell { font-weight: 600; color: #111827; }
                .type-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .date-cell { font-family: monospace; font-size: 12px; color: #6b7280; }
                .num-cell, .amt-cell { text-align: right; font-family: monospace; }
                .active-badge { background: #d1fae5; color: #059669; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .waived-badge { background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .waive-btn { padding: 3px 10px; background: #fef3c7; color: #d97706; border: 1px solid #fde68a; border-radius: 6px; font-size: 11px; cursor: pointer; margin-right: 4px; }
                .term-btn { padding: 3px 10px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; font-size: 11px; cursor: pointer; }
                .section-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0; padding: 16px 16px 8px; }
                .pct-row { display: flex; align-items: center; gap: 8px; min-width: 120px; }
                .pct-bar-bg { flex: 1; height: 6px; background: #e5e7eb; border-radius: 3px; }
                .pct-bar-fill { height: 6px; border-radius: 3px; }
                .pct-label { font-size: 11px; color: #374151; min-width: 30px; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 480px; max-width: 90vw; max-height: 80vh; overflow-y: auto; }
                .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .modal-title { font-size: 18px; font-weight: 700; margin: 0; }
                .modal-close { background: none; border: none; cursor: pointer; color: #6b7280; padding: 4px; }
                .enroll-costs { font-size: 13px; color: #374151; margin-bottom: 16px; }
                .mf { margin-bottom: 12px; }
                .ml { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
                .mi { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
                .deps-section { margin-top: 16px; }
                .deps-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
                .add-dep-btn { padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; border-radius: 6px; font-size: 12px; cursor: pointer; }
                .dep-row { display: flex; gap: 6px; margin-bottom: 6px; }
                .dep-input { flex: 1; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
                .dep-remove { padding: 4px 6px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
                .mcancel { padding: 8px 16px; border: 1px solid #d1d5db; background: #fff; border-radius: 8px; cursor: pointer; }
                .msubmit { padding: 8px 20px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .msubmit:disabled { background: #9ca3af; }
            `}</style>
        </StandardPage>
    );
}
