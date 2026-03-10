import { useState, useRef, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Mail, Clock, GitBranch, Webhook, Play, Save, Settings,
    MousePointer2, Trash2, ChevronRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type NodeType = "trigger" | "email" | "wait" | "condition" | "webhook";

interface FlowNode {
    id: string;
    type: NodeType;
    x: number;
    y: number;
    title: string;
    config?: any;
}

export default function CampaignFlowBuilder() {
    const [nodes, setNodes] = useState<FlowNode[]>([
        { id: "trigger-1", type: "trigger", x: 400, y: 100, title: "New Lead Added" },
        { id: "email-1", type: "email", x: 400, y: 250, title: "Welcome Email" }
    ]);
    const [connections, setConnections] = useState([{ from: "trigger-1", to: "email-1" }]);
    const [draggingNode, setDraggingNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const nodeTypes = [
        { type: "email" as NodeType, icon: Mail, label: "Send Email", color: "bg-blue-500", text: "text-blue-500", border: "border-blue-200" },
        { type: "wait" as NodeType, icon: Clock, label: "Time Delay", color: "bg-amber-500", text: "text-amber-500", border: "border-amber-200" },
        { type: "condition" as NodeType, icon: GitBranch, label: "Condition", color: "bg-purple-500", text: "text-purple-500", border: "border-purple-200" },
        { type: "webhook" as NodeType, icon: Webhook, label: "Webhook", color: "bg-slate-700", text: "text-slate-700", border: "border-slate-300" },
    ];

    const handleDragStart = (e: React.DragEvent, type: NodeType) => {
        e.dataTransfer.setData("nodeType", type);
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("nodeType") as NodeType;
        if (!type || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 100; // rough center offset
        const y = e.clientY - rect.top - 40;

        const newNode: FlowNode = {
            id: `${type}-${Date.now()}`,
            type,
            x,
            y,
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`
        };

        setNodes([...nodes, newNode]);
    };

    const handleCanvasDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    // Simple drag logic for existing nodes
    const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDraggingNode(id);
        setSelectedNode(id);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!draggingNode || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 100;
        const y = e.clientY - rect.top - 40;

        setNodes(nodes.map(n => n.id === draggingNode ? { ...n, x, y } : n));
    };

    const handleCanvasMouseUp = () => {
        setDraggingNode(null);
    };

    const getNodeConfig = (type: NodeType) => {
        if (type === "trigger") return { icon: Play, color: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200" };
        return nodeTypes.find(t => t.type === type) || nodeTypes[0];
    };

    // Calculate lines between connections
    const renderConnections = () => {
        return connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            // Simple line from bottom of 'from' to top of 'to'
            const startX = fromNode.x + 100; // half of 200px width
            const startY = fromNode.y + 80;  // height of node
            const endX = toNode.x + 100;
            const endY = toNode.y;

            // Draw a curved path
            const path = `M ${startX} ${startY} C ${startX} ${startY + 50}, ${endX} ${endY - 50}, ${endX} ${endY}`;

            return (
                <svg key={i} className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
                    <path
                        d={path}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="3"
                        className="transition-all duration-300"
                        strokeDasharray="4 4"
                    />
                    {/* Arrow head */}
                    <circle cx={endX} cy={endY} r="4" fill="#94a3b8" />
                </svg>
            );
        });
    };

    return (
        <StandardPage
            title="Campaign Flow Builder"
            description="Visually design omnichannel marketing automation sequences."
            className="flex flex-col h-[calc(100vh-80px)]"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline"><Play className="h-4 w-4 mr-2 text-emerald-600" /> Test Flow</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"><Save className="h-4 w-4 mr-2" /> Save Journey</Button>
                </div>
            }
        >
            <div className="flex flex-1 overflow-hidden border rounded-xl shadow-sm bg-background mt-4">

                {/* Tools Palette Grid */}
                <div className="w-64 border-r bg-muted/20 p-4 flex flex-col shadow-inner z-10">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Components</h3>
                    <div className="space-y-3">
                        {nodeTypes.map((node) => (
                            <div
                                key={node.type}
                                draggable
                                onDragStart={(e) => handleDragStart(e, node.type)}
                                className={cn(
                                    "p-3 bg-card border rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-3 hover:border-primary/50 hover:shadow-sm transition-all shadow-sm",
                                    node.border
                                )}
                            >
                                <div className={cn("p-2 rounded-md", node.color.replace('bg-', 'bg-opacity-10 text-').replace('text-', 'text-'))}>
                                    <node.icon className={cn("h-4 w-4", node.color.replace('bg-', 'text-'))} />
                                </div>
                                <span className="text-sm font-semibold">{node.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <h4 className="text-xs font-bold text-primary flex items-center gap-2"><MousePointer2 className="h-3.5 w-3.5" /> How to use</h4>
                        <p className="text-[11px] text-muted-foreground mt-2 font-medium leading-relaxed">Drag components onto the canvas.<br />Click a component to configure it.</p>
                    </div>
                </div>

                {/* Unlimited Canvas Area */}
                <div
                    className="flex-1 relative overflow-auto bg-slate-50/50 dot-pattern"
                    ref={canvasRef}
                    onDrop={handleCanvasDrop}
                    onDragOver={handleCanvasDragOver}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    style={{
                        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                >
                    {/* SVG Layer for connecting lines */}
                    {renderConnections()}

                    {/* Nodes Layer */}
                    {nodes.map(node => {
                        const config = getNodeConfig(node.type);
                        const isSelected = selectedNode === node.id;

                        return (
                            <div
                                key={node.id}
                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                className={cn(
                                    "absolute w-[200px] bg-card rounded-xl shadow-sm border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
                                    isSelected ? "border-primary ring-4 ring-primary/10 z-20" : "border-border z-10"
                                )}
                                style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                            >
                                <div className={cn("h-2 w-full rounded-t-lg", config.color)} />
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={cn("p-1.5 rounded-md bg-muted", config.text)}>
                                            <config.icon className="h-4 w-4" />
                                        </div>
                                        <div className="font-bold text-sm tracking-tight">{node.title}</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {node.type === 'trigger' ? 'When an event occurs' : 'Perform action'}
                                    </p>
                                </div>
                                {/* Node Ports */}
                                {node.type !== 'trigger' && (
                                    <div className="absolute top-[-6px] left-[calc(50%-6px)] w-3 h-3 rounded-full bg-background border-2 border-muted-foreground input-port" />
                                )}
                                <div className="absolute bottom-[-6px] left-[calc(50%-6px)] w-3 h-3 rounded-full bg-background border-2 border-muted-foreground output-port" />
                            </div>
                        );
                    })}
                </div>

                {/* Contextual Properties Panel */}
                {selectedNode && (
                    <div className="w-80 border-l bg-card p-6 shadow-xl flex flex-col z-30 animate-in slide-in-from-right-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2"><Settings className="h-4 w-4" /> Node Settings</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => {
                                setNodes(nodes.filter(n => n.id !== selectedNode));
                                setConnections(connections.filter(c => c.from !== selectedNode && c.to !== selectedNode));
                                setSelectedNode(null);
                            }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Node Label</label>
                                <Input
                                    className="font-medium"
                                    value={nodes.find(n => n.id === selectedNode)?.title || ''}
                                    onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode ? { ...n, title: e.target.value } : n))}
                                />
                            </div>

                            {/* Dynamic settings based on type */}
                            {nodes.find(n => n.id === selectedNode)?.type === 'email' && (
                                <div className="space-y-2 pt-4 border-t">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Select Template</label>
                                    <select className="w-full border rounded-md h-10 px-3 text-sm bg-background font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option>Welcome Series 1</option>
                                        <option>Cart Abandonment</option>
                                        <option>Newsletter Template</option>
                                    </select>

                                    <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                        <div className="flex gap-2 text-blue-800 text-sm font-semibold mb-1">
                                            <AlertCircle className="h-4 w-4" /> A/B Testing
                                        </div>
                                        <p className="text-xs text-blue-600 font-medium">Enable split testing to optimize open rates.</p>
                                        <Button variant="outline" size="sm" className="w-full mt-3 h-8 bg-white text-xs font-bold">Configure Variant</Button>
                                    </div>
                                </div>
                            )}

                            {nodes.find(n => n.id === selectedNode)?.type === 'wait' && (
                                <div className="space-y-2 pt-4 border-t">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Delay Duration</label>
                                    <div className="flex gap-2">
                                        <Input type="number" defaultValue="2" className="w-20 font-bold text-center" />
                                        <select className="flex-1 border rounded-md h-10 px-3 text-sm bg-background font-medium">
                                            <option>Hours</option>
                                            <option>Days</option>
                                            <option>Weeks</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
