import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Brain,
    Shield,
    Box,
    ChevronDown,
    ChevronRight,
    Filter
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface NexusTool {
    name: string;
    permission: string;
    description: string;
    parameters: Record<string, any>;
    module: string;
}

export default function NexusAIToolRegistrySection() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

    const { data: tools = [], isLoading } = useQuery<NexusTool[]>({
        queryKey: ["/api/nexus-ai/tools/registry"],
    });

    const filteredTools = tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesModule = !selectedModule || tool.module === selectedModule;
        return matchesSearch && matchesModule;
    });

    const toolsByModule = filteredTools.reduce((acc, tool) => {
        if (!acc[tool.module]) acc[tool.module] = [];
        acc[tool.module].push(tool);
        return acc;
    }, {} as Record<string, NexusTool[]>);

    const modules = Array.from(new Set(tools.map(t => t.module))).sort();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-/15 text-violet-600">
                                <Brain className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Registered Tools</p>
                                <p className="text-3xl font-bold text-violet-600">{tools.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-/15 text-blue-600">
                                <Box className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Modules</p>
                                <p className="text-3xl font-bold text-blue-600">{modules.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-/15 text-emerald-600">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Secure Execution</p>
                                <p className="text-3xl font-bold text-emerald-600">RBAC Enabled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registry Explorer */}
            <Card className="border-muted/40 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                NexusAI Capability Registry
                            </CardTitle>
                            <CardDescription>
                                Detailed overview of all deterministic tools available to the LLM agent.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tools or descriptors..."
                                    className="pl-9 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[650px]">
                        <div className="p-6">
                            <Accordion type="multiple" className="space-y-4">
                                {Object.entries(toolsByModule).sort(([a], [b]) => a.localeCompare(b)).map(([moduleName, moduleTools]) => (
                                    <AccordionItem
                                        key={moduleName}
                                        value={moduleName}
                                        className="border rounded-lg px-4 bg-muted/5 hover:bg-muted/10 transition-colors"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-4 text-left">
                                                <Badge variant="outline" className="bg-background font-mono text-violet-600">
                                                    {moduleTools.length}
                                                </Badge>
                                                <span className="font-semibold text-base">{moduleName}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-4 pt-1">
                                            <div className="grid grid-cols-1 gap-3">
                                                {moduleTools.map((tool) => (
                                                    <div
                                                        key={tool.name}
                                                        className="p-4 rounded-md border bg-background group hover:border-violet-500/30 transition-all shadow-sm"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h4 className="font-mono text-sm font-bold text-violet-600 group-hover:text-violet-700">
                                                                    {tool.name}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {tool.description}
                                                                </p>
                                                            </div>
                                                            <Badge variant="secondary" className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                                                                <Shield className="h-3 w-3" />
                                                                {tool.permission}
                                                            </Badge>
                                                        </div>

                                                        {Object.keys(tool.parameters).length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-dashed">
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-widest">Parameters</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {Object.entries(tool.parameters).map(([param, config]: [string, any]) => (
                                                                        <div key={param} className="flex flex-col">
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="outline" className="text-[10px] bg-muted/30">
                                                                                    {param}
                                                                                    {config.required && <span className="text-red-500 ml-1">*</span>}
                                                                                </Badge>
                                                                            </div>
                                                                            <span className="text-[10px] text-muted-foreground pl-1 mt-0.5 max-w-48 truncate italic">
                                                                                {config.description}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
