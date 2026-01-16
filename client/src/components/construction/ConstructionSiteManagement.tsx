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
    Plus, Sun, Cloud, CloudRain, Thermometer
} from "lucide-react";
import { format } from "date-fns";

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
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>RFI #</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Importance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rfis.map(rfi => (
                                    <TableRow key={rfi.id}>
                                        <TableCell className="font-mono">{rfi.rfiNumber}</TableCell>
                                        <TableCell className="font-medium">{rfi.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={rfi.importance === "URGENT" ? "destructive" : "outline"}>
                                                {rfi.importance}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={rfi.status === "OPEN" ? "default" : "secondary"}>
                                                {rfi.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(rfi.createdAt), "PP")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="submittals" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Project Submittals</h2>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Submittal</Button>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Submittal #</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Received</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submittals.map(sub => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-mono">{sub.submittalNumber}</TableCell>
                                        <TableCell className="font-medium">{sub.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={sub.status === "APPROVED" ? "default" : "outline"}>
                                                {sub.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(sub.createdAt), "PP")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Contractual Compliance Audit</h2>
                        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> New Entry</Button>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contract</TableHead>
                                    <TableHead>Document Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead>Compliance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {compliance.map(c => {
                                    const isExpired = new Date(c.expiryDate) < new Date();
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.contractNumber}</TableCell>
                                            <TableCell>{c.documentType}</TableCell>
                                            <TableCell>
                                                <Badge variant={c.status === "ACTIVE" ? "default" : "secondary"}>
                                                    {c.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={isExpired ? "text-destructive font-bold" : ""}>
                                                {format(new Date(c.expiryDate), "PP")}
                                            </TableCell>
                                            <TableCell>
                                                {isExpired && c.isMandatoryForPayment ? (
                                                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                        <AlertTriangle className="h-3 w-3" /> Payment Blocked
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Compliant</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
