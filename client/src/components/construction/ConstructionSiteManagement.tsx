import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    ClipboardList, MessageSquare, FileUp, AlertTriangle,
    Plus, Sun, Cloud, CloudRain, Thermometer, ShieldAlert
} from "lucide-react";
import { format } from "date-fns";
import { StandardTable, Column } from "../tables/StandardTable";
import ConstructionClaimsManager from "./ConstructionClaimsManager";

interface DailyLog {
    id: string;
    logDate: string;
    weatherCondition: string;
    status: string;
    reportedBy: string;
}

interface RFI {
    id: string;
    rfiNumber: string;
    subject: string;
    status: string;
    importance: string;
    createdAt: string;
}

interface Submittal {
    id: string;
    submittalNumber: string;
    description: string;
    status: string;
    createdAt: string;
}

export default function ConstructionSiteManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

    // --- Data Fetching ---
    const { data: projects = [] } = useQuery<any[]>({
        queryKey: ["ppm-projects"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/projects");
            return res.json();
        }
    });

    const { data: logs = [] } = useQuery<DailyLog[]>({
        queryKey: ["construction-daily-logs", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/daily-logs`);
            return res.json();
        }
    });

    const { data: rfis = [] } = useQuery<RFI[]>({
        queryKey: ["construction-rfis", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/rfis`);
            return res.json();
        }
    });

    const { data: submittals = [] } = useQuery<Submittal[]>({
        queryKey: ["construction-submittals", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/submittals`);
            return res.json();
        }
    });

    const { data: contracts = [] } = useQuery<any[]>({
        queryKey: ["construction-contracts", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/contracts`);
            return res.json();
        }
    });

    const { data: compliance = [] } = useQuery<any[]>({
        queryKey: ["construction-compliance", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            // Compliance is linked to contracts. In this view, we'll fetch all compliance 
            // records for all contracts in the project for a summary.
            const contractsRes = await fetch(`/api/construction/projects/${selectedProjectId}/contracts`);
            const contracts = await contractsRes.json();

            const allCompliance = await Promise.all(
                contracts.map(async (c: any) => {
                    const res = await fetch(`/api/construction/contracts/${c.id}/compliance`);
                    const data = await res.json();
                    return data.map((d: any) => ({ ...d, contractNumber: c.contractNumber }));
                })
            );
            return allCompliance.flat();
        }
    });

    // --- Mutations ---
    const createLogMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/daily-logs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-daily-logs"] });
            toast({ title: "Log Created", description: "Daily site report has been saved." });
        }
    });

    const createRFIMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/rfis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-rfis"] });
            toast({ title: "RFI Created", description: "Request for Information has been submitted." });
        }
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
                    <p className="text-muted-foreground">Field operations, daily logs, and compliance tracking.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.projectNumber} - {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="logs" className="space-y-4">
                <TabsList className="bg-background border-b rounded-none w-full justify-start h-auto p-0 gap-6">
                    <TabsTrigger value="logs" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 py-2">
                        <ClipboardList className="h-4 w-4 mr-2" /> Daily Logs
                    </TabsTrigger>
                    <TabsTrigger value="rfis" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 py-2">
                        <MessageSquare className="h-4 w-4 mr-2" /> RFIs
                    </TabsTrigger>
                    <TabsTrigger value="submittals" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 py-2">
                        <FileUp className="h-4 w-4 mr-2" /> Submittals
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 py-2">
                        <AlertTriangle className="h-4 w-4 mr-2" /> Compliance
                    </TabsTrigger>
                    <TabsTrigger value="claims" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 py-2">
                        <ShieldAlert className="h-4 w-4 mr-2" /> Claims & Disputes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Field Daily Reports</h2>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Log</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {logs.map(log => (
                            <Card key={log.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">
                                            {format(new Date(log.logDate), "PPP")}
                                        </CardTitle>
                                        <Badge variant={log.status === "SUBMITTED" ? "default" : "secondary"}>
                                            {log.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>Reported by {log.reportedBy}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            {log.weatherCondition === "Sunny" ? <Sun className="h-4 w-4 text-orange-400" /> : <Cloud className="h-4 w-4" />}
                                            {log.weatherCondition}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="rfis" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Requests for Information</h2>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New RFI</Button>
                    </div>
                    <StandardTable
                        data={rfis}
                        columns={[
                            { header: "RFI #", accessorKey: "rfiNumber", sortable: true },
                            { header: "Subject", accessorKey: "subject" },
                            {
                                header: "Importance",
                                accessorKey: "importance",
                                cell: (item: RFI) => (
                                    <Badge variant={item.importance === "URGENT" ? "destructive" : "outline"}>
                                        {item.importance}
                                    </Badge>
                                )
                            },
                            {
                                header: "Status",
                                accessorKey: "status",
                                cell: (item: RFI) => (
                                    <Badge variant={item.status === "OPEN" ? "default" : "secondary"}>
                                        {item.status}
                                    </Badge>
                                )
                            },
                            {
                                header: "Created At",
                                accessorKey: "createdAt",
                                cell: (item: RFI) => format(new Date(item.createdAt), "PP")
                            }
                        ]}
                    />
                </TabsContent>

                <TabsContent value="submittals" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Project Submittals</h2>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Submittal</Button>
                    </div>
                    <StandardTable
                        data={submittals}
                        columns={[
                            { header: "Submittal #", accessorKey: "submittalNumber", sortable: true },
                            { header: "Description", accessorKey: "description" },
                            {
                                header: "Status",
                                accessorKey: "status",
                                cell: (item: Submittal) => (
                                    <Badge variant={item.status === "APPROVED" ? "default" : "outline"}>
                                        {item.status}
                                    </Badge>
                                )
                            },
                            {
                                header: "Received",
                                accessorKey: "createdAt",
                                cell: (item: Submittal) => format(new Date(item.createdAt), "PP")
                            }
                        ]}
                    />
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Contractual Compliance Audit</h2>
                        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> New Entry</Button>
                    </div>
                    <StandardTable
                        data={compliance}
                        columns={[
                            { header: "Contract", accessorKey: "contractNumber" },
                            { header: "Document Type", accessorKey: "documentType" },
                            {
                                header: "Status",
                                accessorKey: "status",
                                cell: (item: any) => (
                                    <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                                        {item.status}
                                    </Badge>
                                )
                            },
                            {
                                header: "Expiry Date",
                                accessorKey: "expiryDate",
                                cell: (item: any) => {
                                    const isExpired = new Date(item.expiryDate) < new Date();
                                    return (
                                        <span className={isExpired ? "text-destructive font-bold" : ""}>
                                            {format(new Date(item.expiryDate), "PP")}
                                        </span>
                                    );
                                }
                            },
                            {
                                header: "Compliance",
                                accessorKey: "isMandatoryForPayment",
                                cell: (item: any) => {
                                    const isExpired = new Date(item.expiryDate) < new Date();
                                    return (isExpired && item.isMandatoryForPayment) ? (
                                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                            <AlertTriangle className="h-3 w-3" /> Payment Blocked
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Compliant</Badge>
                                    );
                                }
                            }
                        ]}
                    />
                </TabsContent>

                <TabsContent value="claims" className="space-y-4 pt-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Select value={selectedContractId || ""} onValueChange={setSelectedContractId}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Select Contract for Claims" />
                            </SelectTrigger>
                            <SelectContent>
                                {contracts.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.contractNumber} - {c.subject}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedContractId ? (
                        <ConstructionClaimsManager contractId={selectedContractId} />
                    ) : (
                        <Card className="h-48 flex items-center justify-center text-muted-foreground border-dashed">
                            Select a contract to manage project claims and disputes.
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
