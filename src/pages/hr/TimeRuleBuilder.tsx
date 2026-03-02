import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    Clock,
    Plus,
    Save,
    Trash2,
    Settings2,
    PlayCircle,
    Copy,
    AlertCircle
} from "lucide-react";

type RuleCondition = {
    id: string;
    field: string;
    operator: string;
    value: string;
};

type RuleOutcome = {
    id: string;
    resultElement: string;
    multiplier: string;
};

export default function TimeRuleBuilder() {
    const { toast } = useToast();

    const [ruleName, setRuleName] = useState("California Overtime Rule");
    const [conditions, setConditions] = useState<RuleCondition[]>([
        { id: "c1", field: "hoursWorkedDaily", operator: ">", value: "8" },
        { id: "c2", field: "hoursWorkedDaily", operator: "<=", value: "12" }
    ]);
    const [outcomes, setOutcomes] = useState<RuleOutcome[]>([
        { id: "o1", resultElement: "Overtime 1.5x", multiplier: "1.5" }
    ]);

    const addCondition = () => {
        setConditions([...conditions, { id: Date.now().toString(), field: "hoursWorkedDaily", operator: ">", value: "0" }]);
    };

    const removeCondition = (id: string) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const addOutcome = () => {
        setOutcomes([...outcomes, { id: Date.now().toString(), resultElement: "Overtime 1.5x", multiplier: "1.0" }]);
    };

    const removeOutcome = (id: string) => {
        setOutcomes(outcomes.filter(o => o.id !== id));
    };

    const handleSave = () => {
        toast({
            title: "Rule Configuration Saved",
            description: `Time calculation rule "${ruleName}" has been updated.`,
        });
    };

    return (
        <StandardPage
            title="Time Rule Builder"
            description="Configure complex time calculation logic, premiums, and automated overtime rules."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'WFM Setup', href: '/hr/time-setup' },
                { label: 'Rules Engine' }
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Action Bar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Select defaultValue="ca-ot">
                            <SelectTrigger className="w-[280px] font-semibold">
                                <SelectValue placeholder="Select Rule to Edit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ca-ot">California Overtime Rule</SelectItem>
                                <SelectItem value="ca-dt">California Double-Time Rule</SelectItem>
                                <SelectItem value="night-shift">Night Shift Differential</SelectItem>
                                <SelectItem value="holiday-prem">Holiday Premium Pay</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" /> Duplicate</Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline"><PlayCircle className="h-4 w-4 mr-2 text-indigo-600" /> Test Rule</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save Rule</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Rule Builder */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Rule Metadata */}
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <CardContent className="p-6 grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rule Name</Label>
                                    <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evaluation Sequence</Label>
                                    <Input type="number" defaultValue={10} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                                    <Input defaultValue="Pays 1.5x regular rate for daily hours between 8 and 12." />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conditions Builder (IF) */}
                        <Card className="border-indigo-500/20 shadow-sm overflow-hidden">
                            <CardHeader className="bg-indigo-500/5 border-b pb-4 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                        <Settings2 className="h-5 w-5" /> IF (Conditions)
                                    </CardTitle>
                                    <CardDescription>All conditions below must be true for the rule to apply.</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" className="text-indigo-700 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/50" onClick={addCondition}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Condition
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {conditions.map((condition, index) => (
                                    <div key={condition.id} className="flex items-center gap-3">
                                        {index > 0 ? (
                                            <Badge variant="secondary" className="font-mono bg-zinc-100 text-zinc-500 w-12 justify-center">AND</Badge>
                                        ) : (
                                            <div className="w-12"></div>
                                        )}

                                        <Select defaultValue={condition.field}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hoursWorkedDaily">Hours Worked (Daily)</SelectItem>
                                                <SelectItem value="hoursWorkedWeekly">Hours Worked (Weekly)</SelectItem>
                                                <SelectItem value="consecutiveDays">Consecutive Days Worked</SelectItem>
                                                <SelectItem value="shiftType">Shift Type</SelectItem>
                                                <SelectItem value="isHoliday">Is Public Holiday</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select defaultValue={condition.operator}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="=">Equals (=)</SelectItem>
                                                <SelectItem value=">">Greater Than (&gt;)</SelectItem>
                                                <SelectItem value="<">Less Than (&lt;)</SelectItem>
                                                <SelectItem value=">=">Grtr/Eq (&gt;=)</SelectItem>
                                                <SelectItem value="<=">Less/Eq (&lt;=)</SelectItem>
                                                <SelectItem value="IN">In List</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            value={condition.value}
                                            className="w-[120px]"
                                            onChange={(e) => {
                                                const newConds = [...conditions];
                                                newConds[index].value = e.target.value;
                                                setConditions(newConds);
                                            }}
                                        />

                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500" onClick={() => removeCondition(condition.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {conditions.length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No conditions defined. This rule will always evaluate to true.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Outcomes Builder (THEN) */}
                        <Card className="border-teal-500/20 shadow-sm overflow-hidden">
                            <CardHeader className="bg-teal-500/5 border-b pb-4 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-teal-700 dark:text-teal-400 flex items-center gap-2">
                                        <Clock className="h-5 w-5" /> THEN (Outcomes)
                                    </CardTitle>
                                    <CardDescription>If conditions are met, apply these time allocations or premiums.</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" className="text-teal-700 border-teal-200 hover:bg-teal-50 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-900/50" onClick={addOutcome}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Outcome
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {outcomes.map((outcome, index) => (
                                    <div key={outcome.id} className="flex items-center gap-4 bg-muted/20 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Allocate To Element</Label>
                                            <Select defaultValue={outcome.resultElement}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Regular Time">Regular Time</SelectItem>
                                                    <SelectItem value="Overtime 1.5x">Overtime 1.5x</SelectItem>
                                                    <SelectItem value="Overtime 2.0x">Overtime 2.0x</SelectItem>
                                                    <SelectItem value="Shift Differential">Shift Differential</SelectItem>
                                                    <SelectItem value="Meal Penalty">Meal Break Penalty</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="w-32 space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Rate Multiplier</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={outcome.multiplier}
                                                onChange={(e) => {
                                                    const newOutcs = [...outcomes];
                                                    newOutcs[index].multiplier = e.target.value;
                                                    setOutcomes(newOutcs);
                                                }}
                                            />
                                        </div>

                                        <div className="pt-5">
                                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500" onClick={() => removeOutcome(outcome.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                <div className="text-sm">
                                    <strong className="text-amber-900 dark:text-amber-200 block mb-1">Impact Analysis</strong>
                                    <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                                        Modifying this rule will affect <strong>1,245</strong> active time card profiles. Changes will take effect on the next open pay period unless a retroactive evaluation is triggered.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Assigned Profiles</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                                    <div className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                        <span className="font-medium">US West Coast (Hourly)</span>
                                        <Badge>850 Emp</Badge>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                        <span className="font-medium">California Tech Hub</span>
                                        <Badge>395 Emp</Badge>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/20 border-t text-center">
                                    <Button variant="link" className="h-auto p-0">Manage Assignments &rarr;</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </StandardPage>
    );
}
