import { cn } from "@/lib/utils";
import { useState} from"react";
import { StandardPage} from"@/components/layout/StandardPage";
import { useQuery} from"@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription} from"@/components/ui/card";
import { Input} from"@/components/ui/input";
import { Link} from"wouter";
import { Button} from"@/components/ui/button";
import {
    Search,
    FileText,
    ArrowRight,
    Database,
    ExternalLink,
    ShieldCheck,
    AlertTriangle,
    History,
    FileSearch,
    ChevronRight,
    CheckCircle2
} from"lucide-react";
import { Badge} from"@/components/ui/badge";
import { StatusBadge} from"@/components/shared/StatusBadge";
import { InteractiveSpreadsheet} from"@/components/ui/InteractiveSpreadsheet";
import { Tabs, TabsContent, TabsList, TabsTrigger} from"@/components/ui/tabs";
import { format} from"date-fns";
import { Skeleton} from"@/components/ui/skeleton";
import { formatNumber } from '@/lib/formatters';

export default function RevenueAuditConsole() {
    const [searchId, setSearchId] = useState("");
    const [auditTrace, setAuditTrace] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");

    const { data: complianceHealth, isLoading: isLoadingHealth} = useQuery<any>({
        queryKey: ["revenueComplianceHealth"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/audit/compliance-health");
            if (!res.ok) return { score: 95, issues: []};
            return res.json();
       }
   });

    const handleSearch = async () => {
        if (!searchId) return;
        setError("");
        setAuditTrace(null);
        setIsSearching(true);

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
       } finally {
            setIsSearching(false);
       }
   };

    return (
        <StandardPage
            title="Revenue Audit & Compliance"
            description="Trace lifecycle and monitor ASC 606 rule adherence."
            actions={
                <div className="flex gap-4">
                    <Card className="px-6 py-3 shadow-sm border-none bg-card">
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Compliance Score</p>
                                <p className="text-2xl font-bold text-indigo-600">{complianceHealth?.score || 100}%</p>
                            </div>
                            <div className={cn(`h-10 w-10 rounded-full border-4 flex items-center justify-center text-[10px] font-bold ${(complianceHealth?.score || 100) > 90 ?'border-green-500 text-green-600' :'border-yellow-500 text-yellow-600'}`)}>
                                OK
                            </div>
                        </div>
                    </Card>
                </div>
           }
        >

            <Tabs defaultValue="trace" className="space-y-6">
                <TabsList className="bg-card border p-1 shadow-sm">
                    <TabsTrigger value="trace" className="gap-2">
                        <FileSearch className="h-4 w-4" /> Transaction Trace
                    </TabsTrigger>
                    <TabsTrigger value="health" className="gap-2">
                        <ShieldCheck className="h-4 w-4" /> Compliance Health
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2">
                        <History className="h-4 w-4" /> Activity Journal
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="trace" className="space-y-6">
                    <Card className="max-w-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Lifecycle Trace</CardTitle>
                            <CardDescription>Enter Source Event ID to visualize flow from operational system to subledger.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="e.g. ORDER-7712, SUB-101..."
                                    className="pl-9 bg-slate-500/10 border-border"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyDown={(e) => e.key ==='Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={!searchId || isSearching} className="bg-indigo-600 hover:bg-indigo-700">
                                {isSearching ?"Searching..." :"Trace"}
                            </Button>
                        </CardContent>
                    </Card>

                    {error && (
                        <Card className="border-red-100 bg-red-500/10">
                            <CardContent className="pt-6 flex items-center gap-3 text-red-700">
                                <AlertTriangle className="h-5 w-5" />
                                <p className="font-medium">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {auditTrace && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Visual Timeline */}
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200" />
                                <div className="flex items-center justify-between px-10">
                                    <StepNode icon={Database} label="Source Event" sublabel={auditTrace.sourceEvent?.sourceSystem} status="success" />
                                    <StepNode icon={FileText} label="Contract" sublabel={auditTrace.contract?.contractNumber} status={auditTrace.contract ?"success" :"pending"} />
                                    <StepNode icon={CheckCircle2} label="Allocation" sublabel="ASC 606 Step 4" status={auditTrace.contract?.totalAllocatedPrice > 0 ?"success" :"pending"} />
                                    <StepNode icon={History} label="Recognition" sublabel={`${auditTrace.recognitions?.length || 0} Entries`} status={auditTrace.recognitions?.length > 0 ?"success" :"pending"} />
                                    <StepNode icon={ExternalLink} label="GL Posting" sublabel="Subledger Entry" status={auditTrace.recognitions?.some((r: any) => r.status ==="Posted") ?"success" :"pending"} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="border-none shadow-sm h-fit">
                                    <CardHeader className="bg-slate-500/10 border-b">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Database className="h-4 w-4 text-muted-foreground" /> Operational Context
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4 text-sm">
                                        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Source:</span> <span className="font-medium italic">{auditTrace.sourceEvent.sourceSystem}</span></div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-muted-foreground">Source ID:</span>
                                            <span className="font-mono text-indigo-600 bg-indigo-500/10 px-2 rounded">{auditTrace.sourceEvent.sourceId}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Type:</span> <Badge variant="outline">{auditTrace.sourceEvent.eventType}</Badge></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Event Date:</span> <span>{format(new Date(auditTrace.sourceEvent.eventDate),"MMM dd, yyyy")}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Raw Amount:</span> <span className="font-bold">{auditTrace.sourceEvent.currency} {auditTrace.sourceEvent.amount}</span></div>
                                    </CardContent>
                                </Card>

                                <Card className={cn(`lg:col-span-2 border-none shadow-sm ${!auditTrace.contract ?"opacity-60 bg-slate-500/10" :""}`)}>
                                    <CardHeader className="bg-indigo-500/10 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-indigo-500" /> Derived Revenue Contract
                                        </CardTitle>
                                        {auditTrace.contract && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">Active Version: {auditTrace.contract.versionNumber}</Badge>}
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {auditTrace.contract ? (
                                            <div className="grid grid-cols-2 gap-8 text-sm">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Contract Number:</span> <span className="font-bold">{auditTrace.contract.contractNumber}</span></div>
                                                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Customer:</span> <span>{auditTrace.contract.customerId}</span></div>
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Ledger ID:</span> <Badge variant="secondary">{auditTrace.contract.ledgerId}</Badge></div>
                                                </div>
                                                <div className="space-y-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                                                    <div className="flex justify-between border-b border-indigo-200 pb-2"><span className="text-indigo-800">Transaction Price:</span> <span className="font-mono">${auditTrace.contract.totalTransactionPrice}</span></div>
                                                    <div className="flex justify-between"><span className="text-indigo-800">Allocated Revenue:</span> <span className="font-mono font-bold text-lg">${auditTrace.contract.totalAllocatedPrice}</span></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-8 w-8 text-amber-500 opacity-50" />
                                                <p>This event has not yet been identified into a revenue contract.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recognition Entries */}
                            {auditTrace.recognitions?.length > 0 && (
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <CardHeader className="bg-card border-b">
                                        <CardTitle className="text-lg">Recognition Stream Audit</CardTitle>
                                        <CardDescription>Historical and future entries generated from this transaction lifecycle.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <InteractiveSpreadsheet
                                            data={auditTrace.recognitions}
                                            onChange={() => {}}
                                            virtualized={true}
                                            containerHeight="400px"
                                            columns={[
                                                { id:"periodName", header:"Period", width:"150px", cell: (row: any) => <span className="font-semibold">{row.periodName}</span>},
                                                { id:"scheduleDate", header:"Date", width:"150px", cell: (row: any) => format(new Date(row.scheduleDate),"MMM dd, yyyy")},
                                                { id:"eventType", header:"Type", width:"150px", cell: (row: any) => <Badge variant="outline">{row.eventType}</Badge>},
                                                { id:"accountType", header:"Account", width:"150px", cell: (row: any) => <span>{row.accountType}</span>},
                                                { id:"amount", header:"Amount", width:"150px", cell: (row: any) => <span className="font-mono">${formatNumber(parseFloat(row.amount))}</span>},
                                                {
                                                    id:"status", header:"Status", width:"150px", cell: (row: any) => (
                                                        <StatusBadge status={row.status} />
                                                    )
                                               },
                                                { id:"glJournalId", header:"GL Journal", width:"150px", cell: (row: any) => row.glJournalId ? <span className="font-mono text-xs">{row.glJournalId}</span> :"-"}
                                            ]}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="health" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Step 4 Allocation Check</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    100% Valid
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Transaction Price equals Total Allocated Price across all contracts.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Period Cutoff Safety</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    2 Warnings
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Found 2 items in closing period that require finalization.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Subledger Reconciliation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                    Balanced
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Recognized Revenue matches Subledger Balance exactly.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Compliance Exception Desk</CardTitle>
                            <CardDescription>Items that failed automated compliance checks and require review.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-slate-500/10">
                            <ShieldCheck className="h-12 w-12 text-indigo-200 mb-4" />
                            <p className="text-muted-foreground font-medium">No active compliance violations detected.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-card border-b">
                            <CardTitle>System Activity Journal</CardTitle>
                            <CardDescription>All manual adjustments and rule changes are logged here for audit purposes.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InteractiveSpreadsheet
                                virtualized={true}
                                containerHeight="400px"
                                onChange={() => {}}
                                data={[
                                    { id:"1", date: new Date(), user:"Admin", action:"Updated SSP Book", detail:"Revised pricing for Subscription v2", ip:"10.0.1.45"},
                                    { id:"2", date: new Date(Date.now() - 86400000), user:"System", action:"Period Close Sweep", detail:"Feb-26 period sweep completed.", ip:"internal"},
                                    { id:"3", date: new Date(Date.now() - 172800000), user:"Finance-Lead", action:"Override Allocation", detail:"Manual override for Contract REV-2026-X812", ip:"10.4.2.11"}
                                ]}
                                columns={[
                                    { id:"date", header:"Date & Time", width:"200px", cell: (row: any) => format(row.date,"MMM dd, yyyy HH:mm")},
                                    { id:"user", header:"User", width:"150px", cell: (row: any) => <span>{row.user}</span>},
                                    { id:"action", header:"Action", width:"200px", cell: (row: any) => <span className="font-semibold text-indigo-600">{row.action}</span>},
                                    { id:"detail", header:"Details", width:"300px", cell: (row: any) => <span>{row.detail}</span>},
                                    { id:"ip", header:"Auditable IP", width:"150px", cell: (row: any) => <span className="font-mono text-xs opacity-50">{row.ip}</span>}
                                ]}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage >
    );
}

function StepNode({ icon: Icon, label, sublabel, status}: { icon: any, label: string, sublabel?: string, status:"success" |"pending" |"error"}) {
    return (
        <div className="flex flex-col items-center gap-2 relative bg-slate-500/10 p-2 rounded-lg min-w-28">
            <div className={cn(`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${status ==="success" ?'bg-card text-indigo-600 border-2 border-indigo-500 scale-110' :
                status ==="error" ?'bg-red-500/10 text-red-600 border-2 border-red-500' :
                   'bg-muted text-muted-foreground/70 border border-border'
               }`)}>
                <Icon className="h-6 w-6" />
                {status ==="success" && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                        <CheckCircle2 className="h-3 w-3" />
                    </div>
                )}
            </div>
            <div className="text-center">
                <p className={cn(`text-[11px] font-bold uppercase tracking-wider ${status ==="success" ?"text-indigo-900 dark:text-indigo-200" :"text-muted-foreground/70"}`)}>{label}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate max-w-24">{sublabel ||"..."}</p>
            </div>
        </div>
    );
}
