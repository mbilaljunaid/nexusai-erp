import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Plus, Calendar, Settings2, Layers, Group, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_DEFINITIONS = [
    { id: "PD-001", name: "US Monthly Payroll", frequency: "MONTHLY", legalEntity: "NexusAI Corp (US)", cutOffType: "PERIOD_END", startDate: "2026-01-01", consolidationGroup: "US-CG-01", status: "ACTIVE", periods: 12 },
    { id: "PD-002", name: "US Bi-Weekly Payroll", frequency: "BIWEEKLY", legalEntity: "NexusAI Corp (US)", cutOffType: "DAYS_BEFORE", cutOffDays: 2, startDate: "2026-01-06", consolidationGroup: "US-CG-01", status: "ACTIVE", periods: 26 },
    { id: "PD-003", name: "UK Monthly Payroll", frequency: "MONTHLY", legalEntity: "NexusAI Ltd (UK)", cutOffType: "PERIOD_END", startDate: "2026-01-31", consolidationGroup: "UK-CG-01", status: "ACTIVE", periods: 12 },
];

const MOCK_CONSOLIDATION_GROUPS = [
    { id: "US-CG-01", name: "US Domestic Group", legalEntity: "NexusAI Corp (US)", payrollCount: 2, transferMode: "COMBINED" },
    { id: "UK-CG-01", name: "UK BACS Group", legalEntity: "NexusAI Ltd (UK)", payrollCount: 1, transferMode: "SEPARATE" },
];

const MOCK_CALENDAR = [
    { period: 1, name: "Jan 2026", startDate: "2026-01-01", endDate: "2026-01-31", cutOff: "2026-01-31", processDate: "2026-02-03", status: "PROCESSED" },
    { period: 2, name: "Feb 2026", startDate: "2026-02-01", endDate: "2026-02-28", cutOff: "2026-02-28", processDate: "2026-03-03", status: "OPEN" },
    { period: 3, name: "Mar 2026", startDate: "2026-03-01", endDate: "2026-03-31", cutOff: "2026-03-31", processDate: "2026-04-02", status: "FUTURE" },
];

export default function PayrollDefinitionSetup() {
    const { toast } = useToast();
    const [isDefOpen, setIsDefOpen] = useState(false);
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [selectedDef, setSelectedDef] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "", frequency: "MONTHLY", legalEntity: "us-corp", cutOffType: "PERIOD_END",
        cutOffDays: "2", startDate: "", consolidationGroup: "", autoGenPeriods: true
    });

    const handleCreate = () => {
        toast({ title: "Payroll Definition Created", description: `${form.name} has been defined and the payroll calendar has been auto-generated.` });
        setIsDefOpen(false);
    };

    return (
        <StandardPage title="Payroll Definition Setup" description="Define payroll frequencies, cut-off rules, consolidation groups, and auto-generate pay period calendars.">
            <Tabs defaultValue="definitions">
                <TabsList className="mb-6">
                    <TabsTrigger value="definitions" className="gap-2"><Settings2 className="h-4 w-4" /> Payroll Definitions</TabsTrigger>
                    <TabsTrigger value="consolidation" className="gap-2"><Group className="h-4 w-4" /> Consolidation Groups</TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2"><Calendar className="h-4 w-4" /> Period Calendar</TabsTrigger>
                    <TabsTrigger value="elementsets" className="gap-2"><Layers className="h-4 w-4" /> Element Sets</TabsTrigger>
                </TabsList>

                {/* Payroll Definitions Tab */}
                <TabsContent value="definitions">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Payroll Definitions</CardTitle>
                                <CardDescription>Each definition drives a payroll run schedule for a Legal Entity.</CardDescription>
                            </div>
                            <Button className="gap-2" onClick={() => setIsDefOpen(true)}><Plus className="h-4 w-4" /> New Definition</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Legal Entity</TableHead>
                                        <TableHead>Cut-Off Type</TableHead>
                                        <TableHead>Consolidation Group</TableHead>
                                        <TableHead>Periods/Year</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_DEFINITIONS.map(def => (
                                        <TableRow key={def.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedDef(def.id)}>
                                            <TableCell className="font-medium text-primary">{def.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{def.frequency}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{def.legalEntity}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{def.cutOffType === "PERIOD_END" ? "Period End" : `${def.cutOffDays} Days Before`}</TableCell>
                                            <TableCell className="text-sm">{def.consolidationGroup}</TableCell>
                                            <TableCell className="text-center font-mono">{def.periods}</TableCell>
                                            <TableCell>
                                                <Badge variant={def.status === "ACTIVE" ? "default" : "secondary"}>{def.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="gap-1">View Calendar <ChevronRight className="h-3 w-3" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Consolidation Groups Tab */}
                <TabsContent value="consolidation">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Consolidation Groups</CardTitle>
                                <CardDescription>Group payrolls for combined GL transfer and bank payment batching.</CardDescription>
                            </div>
                            <Button variant="outline" className="gap-2" onClick={() => setIsGroupOpen(true)}><Plus className="h-4 w-4" /> New Group</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Legal Entity</TableHead>
                                        <TableHead>Payrolls Linked</TableHead>
                                        <TableHead>GL Transfer Mode</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_CONSOLIDATION_GROUPS.map(g => (
                                        <TableRow key={g.id}>
                                            <TableCell className="font-mono text-sm">{g.id}</TableCell>
                                            <TableCell className="font-medium">{g.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{g.legalEntity}</TableCell>
                                            <TableCell className="text-center">{g.payrollCount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{g.transferMode}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Period Calendar Tab */}
                <TabsContent value="calendar">
                    <Card>
                        <CardHeader>
                            <CardTitle>Auto-Generated Period Calendar</CardTitle>
                            <CardDescription>Pay periods for US Monthly Payroll — 2026. Dates calculated automatically from definition start date and frequency.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Period #</TableHead>
                                        <TableHead>Period Name</TableHead>
                                        <TableHead>Period Start</TableHead>
                                        <TableHead>Period End</TableHead>
                                        <TableHead>Cut-Off Date</TableHead>
                                        <TableHead>Process Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_CALENDAR.map(p => (
                                        <TableRow key={p.period}>
                                            <TableCell className="font-mono text-center">{p.period}</TableCell>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell className="text-sm">{p.startDate}</TableCell>
                                            <TableCell className="text-sm">{p.endDate}</TableCell>
                                            <TableCell className="text-sm font-medium text-amber-600">{p.cutOff}</TableCell>
                                            <TableCell className="text-sm">{p.processDate}</TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === "PROCESSED" ? "default" : p.status === "OPEN" ? "secondary" : "outline"}>
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Element Sets Tab */}
                <TabsContent value="elementsets">
                    <Card className="p-12 text-center text-muted-foreground">
                        <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Element Sets</h3>
                        <p className="max-w-md mx-auto mb-6">Assign a default Element Set to each Payroll Definition to control which earnings and deductions are processed in each run by default.</p>
                        <Button variant="outline">Assign Element Set</Button>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* New Definition Dialog */}
            <Dialog open={isDefOpen} onOpenChange={setIsDefOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Payroll Definition</DialogTitle>
                        <DialogDescription>Define the pay schedule frequency and calendar generation rules for a Legal Entity.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Definition Name *</Label>
                                <Input placeholder="e.g., US Monthly — Technology BU" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Legal Entity *</Label>
                                <Select value={form.legalEntity} onValueChange={v => setForm(p => ({ ...p, legalEntity: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us-corp">NexusAI Corp (US)</SelectItem>
                                        <SelectItem value="uk-ltd">NexusAI Ltd (UK)</SelectItem>
                                        <SelectItem value="ae-llc">NexusAI LLC (UAE)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Pay Frequency *</Label>
                                <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WEEKLY">Weekly (52 periods/year)</SelectItem>
                                        <SelectItem value="BIWEEKLY">Bi-Weekly (26 periods/year)</SelectItem>
                                        <SelectItem value="SEMIMONTHLY">Semi-Monthly (24 periods/year)</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly (12 periods/year)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>First Period Start Date *</Label>
                                <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Consolidation Group</Label>
                                <Select value={form.consolidationGroup} onValueChange={v => setForm(p => ({ ...p, consolidationGroup: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select group..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US-CG-01">US Domestic Group</SelectItem>
                                        <SelectItem value="UK-CG-01">UK BACS Group</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cut-Off Date Type</Label>
                                <Select value={form.cutOffType} onValueChange={v => setForm(p => ({ ...p, cutOffType: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERIOD_END">Period End Date</SelectItem>
                                        <SelectItem value="DAYS_BEFORE">N Days Before Period End</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {form.cutOffType === "DAYS_BEFORE" && (
                                <div className="space-y-2">
                                    <Label>Days Before End</Label>
                                    <Input type="number" min="1" max="14" value={form.cutOffDays} onChange={e => setForm(p => ({ ...p, cutOffDays: e.target.value }))} />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
                            <div>
                                <p className="text-sm font-medium">Auto-Generate Period Calendar</p>
                                <p className="text-xs text-muted-foreground">Automatically create all pay periods for the current fiscal year.</p>
                            </div>
                            <Switch checked={form.autoGenPeriods} onCheckedChange={v => setForm(p => ({ ...p, autoGenPeriods: v }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDefOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={!form.name || !form.startDate}>Create Definition</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Consolidation Group Dialog */}
            <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Consolidation Group</DialogTitle>
                        <DialogDescription>Define a grouping for GL transfer and bank payment batching.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Group Name *</Label>
                            <Input placeholder="e.g., US Domestic Group" />
                        </div>
                        <div className="space-y-2">
                            <Label>Legal Entity</Label>
                            <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>
                                <SelectItem value="us">NexusAI Corp (US)</SelectItem>
                                <SelectItem value="uk">NexusAI Ltd (UK)</SelectItem>
                            </SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label>GL Transfer Mode</Label>
                            <Select defaultValue="COMBINED"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                                <SelectItem value="COMBINED">Combined (single journal)</SelectItem>
                                <SelectItem value="SEPARATE">Separate (per payroll)</SelectItem>
                            </SelectContent></Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGroupOpen(false)}>Cancel</Button>
                        <Button onClick={() => { toast({ title: "Consolidation Group Created" }); setIsGroupOpen(false); }}>Create Group</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
