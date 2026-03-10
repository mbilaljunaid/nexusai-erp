import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, GitBranch, Plus, Save, Play, ChevronRight, Settings } from "lucide-react";

interface ScriptNode {
    id: string;
    text: string;
    type: "QUESTION" | "STATEMENT" | "ACTION";
    options?: { id: string; label: string; nextNodeId: string | null }[];
}

export default function AgentScriptBuilder() {
    const [scriptName, setScriptName] = useState("Password Reset Troubleshooting");

    // Simple state simulating a visual flow graph
    const [nodes, setNodes] = useState<ScriptNode[]>([
        {
            id: "node-1",
            text: "Hi, thank you for calling support. Can I confirm you are calling about resetting your application password?",
            type: "QUESTION",
            options: [
                { id: "opt-1", label: "Yes", nextNodeId: "node-2" },
                { id: "opt-2", label: "No", nextNodeId: "node-3" }
            ]
        },
        {
            id: "node-2",
            text: "Great. Have you already tried clicking the 'Forgot Password' link on the login screen?",
            type: "QUESTION",
            options: [
                { id: "opt-3", label: "Yes, didn't receive email", nextNodeId: "node-4" },
                { id: "opt-4", label: "No, let me try that", nextNodeId: "node-5" }
            ]
        },
        {
            id: "node-3",
            text: "I understand. Please tell me what issue you are experiencing.",
            type: "STATEMENT",
            options: [] // End node for this simple demo
        },
        {
            id: "node-4",
            text: "[ACTION] Send manual password reset link to verified email address.",
            type: "ACTION",
            options: []
        },
        {
            id: "node-5",
            text: "Please wait 5 minutes to receive the email. Is there anything else I can help with?",
            type: "STATEMENT",
            options: []
        }
    ]);

    const [selectedNodeId, setSelectedNodeId] = useState<string>("node-1");

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <StandardPage
            title="Agent Script Builder"
            description="Design step-by-step interactive troubleshooting scripts for support agents."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Service", href: "/crm/service" },
                { label: "Agent Scripts" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline"><Play className="h-4 w-4 mr-2" /> Test Script</Button>
                    <Button><Save className="h-4 w-4 mr-2" /> Publish Script</Button>
                </div>
            }
        >
            <div className="flex flex-col lg:flex-row gap-6 h-[70vh]">

                {/* Visual Flow / Node List */}
                <Card className="flex-1 overflow-y-auto">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <Input
                                value={scriptName}
                                onChange={(e) => setScriptName(e.target.value)}
                                className="font-semibold text-lg border-none hover:bg-muted focus-visible:ring-1 h-9 px-2 w-[300px]"
                            />
                            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Node</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 bg-muted/10 min-h-full">
                        {nodes.map(node => (
                            <Card
                                key={node.id}
                                className={`cursor-pointer transition-all border-l-4 ${selectedNodeId === node.id ? 'border-l-primary shadow-md ring-1 ring-primary/20' : 'border-l-muted hover:border-l-primary/50'}`}
                                onClick={() => setSelectedNodeId(node.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="mt-1">
                                                {node.type === 'QUESTION' ? <MessageSquare className="h-4 w-4 text-blue-500" /> :
                                                    node.type === 'ACTION' ? <Settings className="h-4 w-4 text-amber-500" /> :
                                                        <ChevronRight className="h-4 w-4 text-slate-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <Badge variant="outline" className="text-[10px] h-5 tracking-wider bg-background">{node.type}</Badge>
                                                    <span className="text-xs text-muted-foreground font-mono">{node.id}</span>
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed">{node.text}</p>

                                                {node.options && node.options.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {node.options.map(opt => (
                                                            <div key={opt.id} className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded border border-muted">
                                                                <GitBranch className="h-3 w-3 text-muted-foreground" />
                                                                <span className="font-semibold">{opt.label}</span>
                                                                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
                                                                <span className="text-muted-foreground font-mono bg-background px-1 rounded border">{opt.nextNodeId}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                {/* Node Editor */}
                <Card className="w-full lg:w-[400px] shrink-0 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center justify-between">
                            Edit Node
                            <Badge variant="outline" className="font-mono bg-background">{selectedNode?.id}</Badge>
                        </CardTitle>
                    </CardHeader>
                    {selectedNode ? (
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Agent Dialog / Text</label>
                                <Textarea
                                    rows={4}
                                    value={selectedNode.text}
                                    className="bg-background shadow-sm resize-none"
                                />
                                <p className="text-xs text-muted-foreground">This is exactly what the agent will read to the customer.</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-primary/10">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Branching Options</label>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Plus className="h-3 w-3 mr-1" /> Add</Button>
                                </div>

                                {selectedNode.options?.length === 0 ? (
                                    <div className="text-center p-4 bg-background rounded border border-dashed border-primary/20 text-xs text-muted-foreground">
                                        No branches. This acts as an end node or requires manual agent transition.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedNode.options?.map((opt, i) => (
                                            <div key={opt.id} className="bg-background p-3 rounded shadow-sm border space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Customer Response</label>
                                                    <Input value={opt.label} className="h-8 text-sm" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                                        <GitBranch className="h-3 w-3" /> Go To Node
                                                    </label>
                                                    <Input value={opt.nextNodeId || ""} className="h-8 text-sm font-mono" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    ) : (
                        <CardContent className="flex items-center justify-center p-12 text-muted-foreground h-full">
                            Select a node to edit.
                        </CardContent>
                    )}
                </Card>

            </div>
        </StandardPage>
    );
}

// Ensure isolated module
const ArrowRight = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
