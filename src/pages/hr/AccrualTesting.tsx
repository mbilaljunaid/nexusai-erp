import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    Calculator,
    PlayCircle,
    CalendarDays,
    Clock,
    UserCircle,
    CheckCircle2,
    RefreshCw
} from "lucide-react";

type SimResult = {
    planName: string;
    applicableTier: string;
    accrualRate: number;
    hoursEarned: number;
    annualProjection: number;
    carryoverLimit: number;
};

export default function AccrualTesting() {
    const { toast } = useToast();
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<SimResult | null>(null);

    // Simulation Inputs
    const [hireDate, setHireDate] = useState("2021-06-15");
    const [simDate, setSimDate] = useState(new Date().toISOString().split("T")[0]);
    const [hoursWorked, setHoursWorked] = useState("80");
    const [planId, setPlanId] = useState("pto-us");
    const [fte, setFte] = useState("1.0");

    const runSimulation = () => {
        setIsSimulating(true);
        setResult(null);

        // Calculate fake tenure in months for simulation logic
        const hire = new Date(hireDate);
        const sim = new Date(simDate);
        const diffMonths = (sim.getFullYear() - hire.getFullYear()) * 12 + (sim.getMonth() - hire.getMonth());
        const tenureYears = diffMonths / 12;

        setTimeout(() => {
            let tier = "Tier 1 (0-2 Years)";
            let rate = 0.0461; // per hour worked
            let carryover = 80;

            if (tenureYears >= 5) {
                tier = "Tier 3 (5+ Years)";
                rate = 0.0769;
                carryover = 160;
            } else if (tenureYears >= 2) {
                tier = "Tier 2 (2-4 Years)";
                rate = 0.0576;
                carryover = 120;
            }

            const hrs = parseFloat(hoursWorked) || 0;
            const fteVal = parseFloat(fte) || 1.0;

            // Adjust rate for FTE if salaried logic (mocked as hourly driven here for complexity)
            const earned = hrs * rate * fteVal;

            setResult({
                planName: planId === 'pto-us' ? "US PTO Core" : "US Sick Safe Leave",
                applicableTier: tier,
                accrualRate: rate,
                hoursEarned: earned,
                annualProjection: 2080 * rate * fteVal,
                carryoverLimit: carryover
            });

            setIsSimulating(false);
            toast({ title: "Simulation Complete" });
        }, 800);
    };

    return (
        <StandardPage
            title="Accrual Testing Simulator"
            description="Validate absence plan calculations, tenure tiers, and FTE proration before deployment."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'WFM Setup', href: '/hr/time-setup' },
                { label: 'Absence Plans' },
                { label: 'Simulation' }
            ]}
        >
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Simulation Matrix */}
                <Card className="border-indigo-500/20 shadow-sm overflow-hidden">
                    <CardHeader className="bg-indigo-500/5 pb-4 border-b">
                        <CardTitle className="text-lg text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                            <Calculator className="h-5 w-5" /> Test Parameters
                        </CardTitle>
                        <CardDescription>Input employee demographics and period data to test accrual rule execution.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <div className="space-y-4 col-span-1 lg:col-span-2 bg-muted/20 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><UserCircle className="h-4 w-4" /> Subject Data</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">Plan to Test</Label>
                                        <Select value={planId} onValueChange={setPlanId}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pto-us">US PTO Core (Accrued)</SelectItem>
                                                <SelectItem value="sick-ny">NY State Sick Safe Leave</SelectItem>
                                                <SelectItem value="vacation-uk">UK Annual Leave (Frontloaded)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">FTE (Proration)</Label>
                                        <Input type="number" step="0.1" max="1.0" min="0.1" value={fte} onChange={e => setFte(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">Hire / Seniority Date</Label>
                                        <Input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Period Data</h3>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Simulation Date</Label>
                                    <Input type="date" value={simDate} onChange={e => setSimDate(e.target.value)} />
                                    <p className="text-[10px] text-muted-foreground">Used to calculate tenure.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Hours Worked (Period)</Label>
                                    <Input type="number" value={hoursWorked} onChange={e => setHoursWorked(e.target.value)} />
                                </div>
                            </div>

                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto" onClick={runSimulation} disabled={isSimulating}>
                                {isSimulating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                                {isSimulating ? "Running Engine..." : "Execute Simulation"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className={`transition-all duration-500 ease-in-out ${result ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none hidden'}`}>
                    <Card className="border-teal-500/30 overflow-hidden shadow-md">
                        <div className="bg-teal-500/10 px-6 py-3 border-b border-teal-500/20 flex justify-between items-center">
                            <h3 className="font-semibold text-teal-900 dark:text-teal-300 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-teal-600" /> Calculation Results
                            </h3>
                            <Badge variant="outline" className="border-teal-500 text-teal-700 bg-white dark:bg-zinc-900">Success</Badge>
                        </div>
                        <CardContent className="p-0">

                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">

                                <div className="p-6 space-y-4 bg-muted/5">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Evaluated Tier</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300">{result?.applicableTier}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Base Accrual Rate</p>
                                        <p className="font-mono text-lg">{result?.accrualRate} <span className="text-sm text-muted-foreground">hrs / hr worked</span></p>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Projected Annual</p>
                                        <p className="font-semibold">{result?.annualProjection.toFixed(2)} hours</p>
                                    </div>
                                </div>

                                <div className="p-6 md:col-span-2 flex flex-col justify-center items-center bg-gradient-to-br from-white to-teal-50/30 dark:from-zinc-950 dark:to-teal-950/10">
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-2">
                                            <Clock className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Calculated Award</p>
                                        <p className="text-6xl font-black text-teal-700 dark:text-teal-400 tracking-tighter">
                                            {result?.hoursEarned.toFixed(4)}
                                            <span className="text-xl font-medium text-teal-600/60 ml-2 tracking-normal">hrs</span>
                                        </p>
                                        <div className="mt-4 inline-flex items-center gap-2 text-xs bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border shadow-sm">
                                            <span className="font-semibold text-muted-foreground">Carryover Math Limit:</span>
                                            <span className="font-mono">{result?.carryoverLimit} hrs</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <Separator />

                            {/* Calculation Trace Log */}
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50">
                                <details className="text-sm group cursor-pointer">
                                    <summary className="font-medium text-muted-foreground hover:text-foreground list-none flex items-center gap-2">
                                        <span className="text-xs bg-zinc-200 dark:bg-zinc-800 rounded px-1.5 py-0.5 group-open:rotate-90 transition-transform">▶</span>
                                        View Engine Execution Trace
                                    </summary>
                                    <div className="mt-3 p-3 bg-zinc-950 rounded-md border border-zinc-800 font-mono text-xs text-green-400 overflow-x-auto space-y-1.5">
                                        <p>[SYS] Initializing Plan: {result?.planName}</p>
                                        <p>[EVAL] Context Date: {simDate}</p>
                                        <p className="text-zinc-400">{'>>'} Calculating Seniority Base: {hireDate}</p>
                                        <p className="text-zinc-400">{'>>'} Exact Tenure: {(new Date(simDate).getTime() - new Date(hireDate).getTime()) / (1000 * 3600 * 24 * 365.25)} years</p>
                                        <p>[RULE] Matched Eligibility Band ID: ELIG_BND_3</p>
                                        <p>[RULE] Matched Rate Tier ID: TIER_{result?.applicableTier.charAt(5)}</p>
                                        <p className="text-cyan-400">{'>>'} Formula: ({hoursWorked} HRS_WRKD) * ({result?.accrualRate} RT_MULT) * ({fte} FTE_PRORT)</p>
                                        <p>[CALC] Result = {result?.hoursEarned}</p>
                                        <p>[POST] Applying plan limits... Max Carryover: {result?.carryoverLimit}</p>
                                        <p>[DONE] Payload ready for ledger.</p>
                                    </div>
                                </details>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </StandardPage>
    );
}
