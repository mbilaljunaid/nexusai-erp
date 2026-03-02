import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import {
    History,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    CalendarClock,
    DollarSign,
    Calculator,
    ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RetroactivePayEngine() {
    const { toast } = useToast();
    const [isSimulating, setIsSimulating] = useState(false);
    const [hasSimulated, setHasSimulated] = useState(false);

    const runSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            setHasSimulated(true);
            toast({
                title: "Simulation Complete",
                description: "Retroactive pay differences calculated for 3 employees.",
            });
        }, 2000);
    };

    return (
        <StandardPage
            title="Retroactive Pay Engine"
            description="Identify, calculate, and process backdated changes to compensation and benefits."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Payroll', href: '/hr/payroll/workbench' },
                { label: 'Retro Pay' }
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Configuration Panel */}
                <Card className="border-teal-500/20 shadow-sm bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 text-teal-600" />
                            Simulation Parameters
                        </CardTitle>
                        <CardDescription>
                            Select the processing period and event group to identify retroactive changes that need processing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Payroll Group</label>
                            <Select defaultValue="US_SALARY">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Payroll Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US_SALARY">US Salaried - BiWeekly</SelectItem>
                                    <SelectItem value="US_HOURLY">US Hourly - Weekly</SelectItem>
                                    <SelectItem value="UK_STANDARD">UK Standard - Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Event Group</label>
                            <Select defaultValue="SALARY_CHANGES">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Event Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL_EVENTS">All Retroactive Events</SelectItem>
                                    <SelectItem value="SALARY_CHANGES">Salary Changes Only</SelectItem>
                                    <SelectItem value="BENEFIT_UPDATES">Benefit Rate Updates</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                className="w-full bg-teal-600 hover:bg-teal-700 h-10 shadow-md"
                                onClick={runSimulation}
                                disabled={isSimulating}
                            >
                                {isSimulating ? (
                                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
                                ) : (
                                    <><Calculator className="mr-2 h-4 w-4" /> Run Simulation</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                {hasSimulated && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <History className="h-5 w-5 text-indigo-500" /> Calculated Variances
                                </h3>
                                <p className="text-muted-foreground text-sm">Review the calculated differences before pushing to the next payroll run.</p>
                            </div>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                                Submit to Next Run <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        {/* Mock Employee 1 */}
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold flex items-center gap-2">Sarah Jenkins <span className="text-xs font-normal text-muted-foreground font-mono">ID: N2091</span></h4>
                                    <p className="text-xs text-muted-foreground">Late Promotion Entry (Effective 01-Feb-2026)</p>
                                </div>
                                <div className="text-right">
                                    <Badge className="bg-red-500/10 text-red-700 border-red-500/20 shadow-none hover:bg-red-500/10">Underpaid</Badge>
                                    <p className="text-lg font-black text-red-600 mt-1">+$1,250.00</p>
                                </div>
                            </div>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Period</th>
                                            <th className="px-4 py-2 text-left">Element</th>
                                            <th className="px-4 py-2 text-right">Original Value</th>
                                            <th className="px-4 py-2 text-right">Recalculated</th>
                                            <th className="px-4 py-2 text-right font-bold">Variance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        <tr>
                                            <td className="px-4 py-3 font-medium">Feb 01 - Feb 15</td>
                                            <td className="px-4 py-3">Regular Salary</td>
                                            <td className="px-4 py-3 text-right text-zinc-500">$4,000.00</td>
                                            <td className="px-4 py-3 text-right text-zinc-500">$4,625.00</td>
                                            <td className="px-4 py-3 text-right text-teal-600 font-semibold">+$625.00</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-medium">Feb 16 - Feb 28</td>
                                            <td className="px-4 py-3">Regular Salary</td>
                                            <td className="px-4 py-3 text-right text-zinc-500">$4,000.00</td>
                                            <td className="px-4 py-3 text-right text-zinc-500">$4,625.00</td>
                                            <td className="px-4 py-3 text-right text-teal-600 font-semibold">+$625.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Mock Employee 2 */}
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden opacity-80">
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold flex items-center gap-2">Michael Torres <span className="text-xs font-normal text-muted-foreground font-mono">ID: N1834</span></h4>
                                    <p className="text-xs text-muted-foreground">Retroactive FSA Contribution Change</p>
                                </div>
                                <div className="text-right">
                                    <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 shadow-none hover:bg-amber-500/10">Overpaid</Badge>
                                    <p className="text-lg font-black text-amber-600 mt-1">-$120.00</p>
                                </div>
                            </div>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Period</th>
                                            <th className="px-4 py-2 text-left">Element</th>
                                            <th className="px-4 py-2 text-right">Original Value</th>
                                            <th className="px-4 py-2 text-right">Recalculated</th>
                                            <th className="px-4 py-2 text-right font-bold">Variance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        <tr>
                                            <td className="px-4 py-3 font-medium">Feb 16 - Feb 28</td>
                                            <td className="px-4 py-3">FSA Deduction</td>
                                            <td className="px-4 py-3 text-right text-zinc-500">$0.00</td>
                                            <td className="px-4 py-3 text-right text-zinc-500">-$120.00</td>
                                            <td className="px-4 py-3 text-right text-amber-600 font-semibold">-$120.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Alerts */}
                        <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 p-4 rounded-xl flex items-start gap-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Regulatory Warning</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    Overpayments (e.g. for Michael Torres) may be subject to state-specific deduction limits. The payroll engine will automatically apply maximum recovery rules during the next processing phase.
                                </p>
                            </div>
                        </div>

                    </div>
                )}

                {/* Empty State */}
                {!hasSimulated && !isSimulating && (
                    <div className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <History className="h-16 w-16 text-zinc-200 dark:text-zinc-800 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400 dark:text-zinc-600">No Simulation Data</h3>
                        <p className="max-w-md mt-2 text-muted-foreground">Select your parameters and click "Run Simulation" to calculate retroactive variances.</p>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
