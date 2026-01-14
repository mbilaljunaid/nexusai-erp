
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, ArrowRight, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardTable } from "@/components/ui/StandardTable";
import { format } from "date-fns";

export default function RevenueAuditConsole() {
    const [searchId, setSearchId] = useState("");
    const [auditTrace, setAuditTrace] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!searchId) return;
        setError("");
        setAuditTrace(null);

        try {
            const res = await fetch(`/api/revenue/audit/trace/${searchId}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Source Event ID not found.");
                throw new Error("Failed to fetch audit trace.");
            }
            const data = await res.json();
            setAuditTrace(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Revenue Audit Center</h1>
                <p className="text-muted-foreground">Trace transactions from source system to GL.</p>
            </div>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Transaction Trace</CardTitle>
                    <CardDescription>Enter Source Event ID (e.g., ORDER-123) to view lifecycle.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input
                        placeholder="Enter Source ID..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={!searchId}>
                        <Search className="h-4 w-4 mr-2" />
                        Trace
                    </Button>
                </CardContent>
            </Card>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            {auditTrace && (
                <div className="space-y-8">
                    {/* Visual Flow */}
                    <div className="flex items-center justify-between max-w-4xl mx-auto py-8">
                        <StepIcon icon={Database} label="Source Event" active={!!auditTrace.sourceEvent} />
                        <ArrowRight className="text-slate-300 h-6 w-6" />
                        <StepIcon icon={FileText} label="Revenue Contract" active={!!auditTrace.contract} />
                        <ArrowRight className="text-slate-300 h-6 w-6" />
                        <StepIcon icon={FileText} label="Performance Obs" active={!!auditTrace.pobs?.length} />
                        <ArrowRight className="text-slate-300 h-6 w-6" />
                        <StepIcon icon={Database} label="GL Posted" active={!!auditTrace.recognitions?.some((r: any) => r.status === "Posted")} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Source Event Card */}
                        <Card>
                            <CardHeader className="bg-slate-100/50 pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Database className="h-4 w-4" /> Source Event
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Source System:</span> <span className="font-medium">{auditTrace.sourceEvent.sourceSystem}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Source ID:</span> <span className="font-mono">{auditTrace.sourceEvent.sourceId}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span> <span className="font-medium">{auditTrace.sourceEvent.amount} {auditTrace.sourceEvent.currency}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Event Date:</span> <span>{new Date(auditTrace.sourceEvent.eventDate).toLocaleDateString()}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <Badge>{auditTrace.sourceEvent.processingStatus}</Badge></div>
                            </CardContent>
                        </Card>

                        {/* Contract Card */}
                        <Card className={auditTrace.contract ? "" : "opacity-50"}>
                            <CardHeader className="bg-indigo-50/50 pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Revenue Contract
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2 text-sm">
                                {auditTrace.contract ? (
                                    <>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Contract #:</span> <span className="font-bold text-indigo-700">{auditTrace.contract.contractNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Customer:</span> <span>{auditTrace.contract.customerId}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Total Value:</span> <span>{auditTrace.contract.totalAllocatedPrice}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Version:</span> <Badge variant="outline">{auditTrace.contract.versionNumber}</Badge></div>
                                    </>
                                ) : <div className="text-muted-foreground italic">No contract linked.</div>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recognition Schedules */}
                    {auditTrace.recognitions?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Recognition Entries</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <StandardTable
                                    data={auditTrace.recognitions}
                                    columns={[
                                        { header: "Period", accessorKey: "periodName" },
                                        { header: "Date", accessorKey: "scheduleDate", cell: (info: any) => format(new Date(info.getValue()), "MMM dd, yyyy") },
                                        { header: "Amount", accessorKey: "amount", cell: (info: any) => parseFloat(info.getValue()).toFixed(2) },
                                        { header: "Event", accessorKey: "eventType" },
                                        { header: "Status", accessorKey: "status", cell: (info: any) => <Badge variant={info.getValue() === "Posted" ? "default" : "secondary"}>{info.getValue()}</Badge> }
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

function StepIcon({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) {
    return (
        <div className={`flex flex-col items-center gap-2 ${active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${active ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold">{label}</span>
        </div>
    );
}
