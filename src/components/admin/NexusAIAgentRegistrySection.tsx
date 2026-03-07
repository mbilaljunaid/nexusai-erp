import { formatDateTime } from "@/lib/dateUtils";
import { useState, useEffect } from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2, Plus, Edit, Trash2, Shield, Sparkles, Activity, Search, RefreshCw, ChevronRight, Wrench
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface AIAgent {
    id: string;
    moduleId: string;
    moduleName: string;
    name: string;
    description: string;
    routes: string[];
    insights: string[];
    systemPrompt: string;
    isActive: boolean;
    tools?: any[];
    quickActions?: any[];
}

export function NexusAIAgentRegistrySection() {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAgent, setCurrentAgent] = useState<Partial<AIAgent> | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            const resp = await fetch("/api/nexus-ai/capabilities");
            if (!resp.ok) throw new Error("Failed to fetch agents");
            const data = await resp.json();
            setAgents(data);
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogs = async () => {
        setIsLogsLoading(true);
        try {
            const resp = await fetch("/api/nexus-ai/governance/logs");
            if (!resp.ok) throw new Error("Failed to fetch logs");
            const data = await resp.json();
            setLogs(data);
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message
            });
        } finally {
            setIsLogsLoading(false);
        }
    };

    const handleSaveAgent = async () => {
        if (!currentAgent?.name || !currentAgent?.moduleId) return;

        try {
            const isEdit = !!currentAgent.id;
            const url = isEdit ? `/api/nexus-ai/capabilities/${currentAgent.id}` : "/api/nexus-ai/capabilities";
            const method = isEdit ? "PATCH" : "POST";

            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentAgent)
            });

            if (!resp.ok) throw new Error("Failed to save agent");

            toast({
                title: "Success",
                description: `Agent ${isEdit ? "updated" : "created"} successfully`
            });
            setIsDialogOpen(false);
            fetchAgents();
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message
            });
        }
    };

    const handleDeleteAgent = async (id: string) => {
        if (!confirm("Are you sure you want to delete this agent? This will also delete associated tools and actions.")) return;

        try {
            const resp = await fetch(`/api/nexus-ai/capabilities/${id}`, { method: "DELETE" });
            if (!resp.ok) throw new Error("Failed to delete agent");

            toast({
                title: "Success",
                description: "Agent deleted successfully"
            });
            fetchAgents();
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message
            });
        }
    };

    const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.moduleName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">AI Agent Registry</h2>
                    <p className="text-muted-foreground">Manage dynamic AI agents, their personas, and governance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAgents} disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setCurrentAgent({ name: "", moduleId: "", moduleName: "", description: "", systemPrompt: "", isActive: true })}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Agent
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{currentAgent?.id ? "Edit AI Agent" : "Create AI Agent"}</DialogTitle>
                                <DialogDescription>Define the agent's identity, context, and behavior.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Agent Name</Label>
                                        <Input
                                            placeholder="e.g. Finance Assistant"
                                            value={currentAgent?.name || ""}
                                            onChange={e => setCurrentAgent({ ...currentAgent, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Module ID</Label>
                                        <Input
                                            placeholder="e.g. finance"
                                            value={currentAgent?.moduleId || ""}
                                            onChange={e => setCurrentAgent({ ...currentAgent, moduleId: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Module Display Name</Label>
                                    <Input
                                        placeholder="e.g. Finance & Treasury"
                                        value={currentAgent?.moduleName || ""}
                                        onChange={e => setCurrentAgent({ ...currentAgent, moduleName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Textarea
                                        placeholder="What does this agent do?"
                                        value={currentAgent?.description || ""}
                                        onChange={e => setCurrentAgent({ ...currentAgent, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">System Prompt (Persona)</Label>
                                    <Textarea
                                        className="min-h-36 font-mono text-sm"
                                        placeholder="You are an expert financial analyst..."
                                        value={currentAgent?.systemPrompt || ""}
                                        onChange={e => setCurrentAgent({ ...currentAgent, systemPrompt: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={currentAgent?.isActive}
                                        onCheckedChange={checked => setCurrentAgent({ ...currentAgent, isActive: checked })}
                                    />
                                    <Label className="text-sm font-medium">Active</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveAgent}>Save Agent</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="agents" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="agents">Active Agents</TabsTrigger>
                    <TabsTrigger value="governance" onClick={fetchLogs}>Governance & Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="agents" className="mt-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Agent List</CardTitle>
                                    <CardDescription>View and manage all registered system agents.</CardDescription>
                                </div>
                                <div className="relative w-72">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search agents..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : filteredAgents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No agents found. Create your first agent to get started.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Agent</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tools/Actions</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAgents.map(agent => (
                                            <TableRow key={agent.id}>
                                                <TableCell>
                                                    <div className="font-medium">{agent.name}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{agent.description}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{agent.moduleName}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {agent.isActive ? (
                                                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Inactive</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <span className="text-xs flex items-center text-muted-foreground">
                                                            <Wrench className="h-3 w-3 mr-1" /> {agent.tools?.length || 0}
                                                        </span>
                                                        <span className="text-xs flex items-center text-muted-foreground">
                                                            <Sparkles className="h-3 w-3 mr-1" /> {agent.quickActions?.length || 0}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => { setCurrentAgent(agent); setIsDialogOpen(true); }} aria-label="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteAgent(agent.id)} aria-label="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="governance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Execution History</CardTitle>
                                    <CardDescription>Audit log of all AI agent interactions and performance.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLogsLoading}>
                                    <RefreshCw className={cn("h-4 w-4 mr-2", isLogsLoading && "animate-spin")} />
                                    Refresh Logs
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLogsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Agent</TableHead>
                                                <TableHead>Prompt</TableHead>
                                                <TableHead>Latency</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-xs whitespace-nowrap">
                                                        {formatDateTime(log.createdAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.status === "success" ? (
                                                            <Badge className="bg-green-100 text-green-800">OK</Badge>
                                                        ) : (
                                                            <Badge variant="destructive">Error</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium">
                                                        {agents.find(a => a.id === log.agentId)?.name || "General"}
                                                    </TableCell>
                                                    <TableCell className="max-w-48 truncate text-xs">
                                                        {log.prompt}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {log.latencyMs}ms
                                                    </TableCell>
                                                    <TableCell>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm">Details</Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-3xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Log Details</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Prompt</h4>
                                                                        <div className="p-3 bg-muted rounded-md text-sm mt-1 max-h-36 overflow-y-auto">
                                                                            {log.prompt}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Response</h4>
                                                                        <div className="p-3 bg-primary/5 border border-primary/10 rounded-md text-sm mt-1 max-h-48 overflow-y-auto">
                                                                            {log.response || (log.status === "error" ? log.errorMessage : "No response content")}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        <div>
                                                                            <h4 className="text-xs font-bold uppercase text-muted-foreground">Latency</h4>
                                                                            <div className="text-sm font-medium">{log.latencyMs}ms</div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xs font-bold uppercase text-muted-foreground">User ID</h4>
                                                                            <div className="text-sm font-medium">{log.userId}</div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xs font-bold uppercase text-muted-foreground">Context</h4>
                                                                            <div className="text-xs font-medium truncate">{JSON.stringify(log.metadata)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

