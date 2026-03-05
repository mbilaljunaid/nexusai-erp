import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalLineRuleTable } from "@/components/sla/JournalLineRuleTable";
import { Settings, ShieldCheck, Database, GitBranch, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventClass {
    id: string;
    name: string;
    description?: string;
}

export default function SlaRules() {
    const [, setLocation] = useLocation();
    const [eventClasses, setEventClasses] = useState<EventClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");

    useEffect(() => {
        fetch("/api/sla/event-classes")
            .then(res => res.json())
            .then(data => {
                setEventClasses(data);
                if (data.length > 0) setSelectedClassId(data[0].id);
            });
    }, []);

    const selectedClass = eventClasses.find(c => c.id === selectedClassId);

    return (
        <StandardPage
            title="Subledger Accounting Rules"
            description="Enterprise-grade accounting derivation engine configuration."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "General Ledger", href: "/finance" }, { label: "SLA Config" }]}
        >
            <div className="flex flex-col gap-8">
                {/* Header Configuration Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation("/finance/sla/mapping-sets")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Database className="h-4 w-4" /> Mapping Sets
                            </CardTitle>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12 Active Sets</div>
                            <p className="text-xs text-muted-foreground mt-1 text-balance">Define translation rules between source values and account segments.</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation("/gl/config/sla/adr")}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <GitBranch className="h-4 w-4" /> Derivation Rules
                            </CardTitle>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45 Rules (ADR)</div>
                            <p className="text-xs text-muted-foreground mt-1 text-balance">Configure hierarchical logic to determine account combinations.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Engine Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-2xl font-bold">V-Tier Active</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-balance">High-performance rule engine ready for transaction events.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Event Model Navigator */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-md flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-muted-foreground" />
                                    Event Model
                                </CardTitle>
                                <CardDescription>Select a subledger object.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Event Class</label>
                                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Event Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eventClasses.map(cls => (
                                                <SelectItem key={cls.id} value={cls.id}>
                                                    {cls.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedClass && (
                                    <div className="pt-4 border-t space-y-3">
                                        <div className="text-xs font-bold text-muted-foreground uppercase">Metadata Details</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-muted/50 p-2 rounded text-[10px]">
                                                <div className="text-muted-foreground">Internal Code</div>
                                                <div className="font-mono mt-0.5">{selectedClass.id}</div>
                                            </div>
                                            <div className="bg-muted/50 p-2 rounded text-[10px]">
                                                <div className="text-muted-foreground">Entity Table</div>
                                                <div className="font-mono mt-0.5">ap_invoices</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Journal Templates Panel */}
                    <Card className="lg:col-span-3 shadow-md border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-3">
                                    Journal Line Rule Designer
                                    {selectedClass && <Badge variant="secondary">{selectedClass.name}</Badge>}
                                </CardTitle>
                                <CardDescription>Define how transaction events transform into GL journal lines.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {selectedClassId ? (
                                <JournalLineRuleTable eventClassId={selectedClassId} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                                    <Settings className="h-12 w-12 mb-4 opacity-20" />
                                    <div className="text-lg font-medium">No Event Class Selected</div>
                                    <p className="text-sm">Please select a class from the left navigator to manage rules.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
