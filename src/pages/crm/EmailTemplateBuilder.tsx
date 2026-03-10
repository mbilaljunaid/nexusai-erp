import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LayoutTemplate, Type, Image as ImageIcon, Link, Search,
    AlignLeft, AlignCenter, AlignRight, Bold, Italic, Palette,
    Save, Eye, Send, Code, Undo, Redo, LayoutGrid, Trash2, GripHorizontal, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

type BlockType = "text" | "image" | "button" | "divider" | "spacer";

interface TemplateBlock {
    id: string;
    type: BlockType;
    content: any;
}

export default function EmailTemplateBuilder() {
    const [blocks, setBlocks] = useState<TemplateBlock[]>([
        { id: "1", type: "image", content: { src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80", alt: "Header Image" } },
        { id: "2", type: "text", content: { text: "Welcome to NexusAI! \\\\nWe're thrilled to have you on board.", align: "center", size: "24px" } },
        { id: "3", type: "button", content: { text: "Get Started Now", url: "#", color: "#4f46e5" } }
    ]);

    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const blockLibrary = [
        { type: "text", icon: Type, label: "Text Block" },
        { type: "image", icon: ImageIcon, label: "Image" },
        { type: "button", icon: Link, label: "Button" },
        { type: "divider", icon: LayoutGrid, label: "Divider" },
        { type: "spacer", icon: LayoutTemplate, label: "Spacer" },
    ];

    const addBlock = (type: BlockType) => {
        const newBlock = { id: Date.now().toString(), type, content: {} };
        if (type === "text") newBlock.content = { text: "Add your text here" };
        if (type === "button") newBlock.content = { text: "Click Here", color: "#4f46e5" };
        if (type === "image") newBlock.content = { src: "https://placehold.co/600x200?text=Placeholder+Image" };

        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const updateBlock = (id: string, updates: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...updates } } : b));
    };

    const renderBlock = (block: TemplateBlock, isEditing: boolean) => {
        switch (block.type) {
            case "text":
                return (
                    <div style={{ textAlign: block.content.align || "left", fontSize: block.content.size || "16px", whiteSpace: "pre-wrap" }} className="text-slate-800">
                        {block.content.text}
                    </div>
                );
            case "image":
                return (
                    <img
                        src={block.content.src}
                        alt={block.content.alt || ""}
                        className="max-w-full h-auto rounded-md object-cover w-full"
                        style={{ maxHeight: block.content.height || "auto" }}
                    />
                );
            case "button":
                return (
                    <div style={{ textAlign: block.content.align || "center" }}>
                        <a
                            href={block.content.url || "#"}
                            style={{ backgroundColor: block.content.color || "#000", color: "#fff", padding: "12px 24px", borderRadius: "6px", display: "inline-block", textDecoration: "none", fontWeight: "bold" }}
                            onClick={(e) => { if (isEditing) e.preventDefault(); }}
                        >
                            {block.content.text}
                        </a>
                    </div>
                );
            case "divider":
                return <hr className="my-4 border-slate-200" />;
            case "spacer":
                return <div style={{ height: block.content.height || "40px" }} />;
            default:
                return null;
        }
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <StandardPage
            title="Email Template Builder"
            description="Design beautiful, responsive emails using a drag-and-drop WYSIWYG editor."
            className="flex flex-col h-[calc(100vh-80px)]"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" /> Preview</Button>
                    <Button variant="outline" size="sm"><Send className="h-4 w-4 mr-2" /> Send Test</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"><Save className="h-4 w-4 mr-2" /> Save Template</Button>
                </div>
            }
        >
            <div className="flexflex-1 h-full overflow-hidden border rounded-xl shadow-sm bg-background mt-4 grid grid-cols-12">

                {/* Left Sidebar - Block Library */}
                <div className="col-span-3 border-r bg-muted/20 flex flex-col h-full overflow-y-auto">
                    <div className="p-4 border-b">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Template Name</h3>
                        <Input defaultValue="Welcome Series - Step 1" className="mt-2 font-semibold h-9" />
                    </div>

                    <div className="p-4 flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Content Blocks</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {blockLibrary.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => addBlock(item.type as BlockType)}
                                    className="p-3 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all hover:shadow-sm"
                                >
                                    <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                    <span className="text-xs font-semibold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center - Canvas */}
                <div className="col-span-6 bg-slate-100/50 flex flex-col h-full overflow-y-auto items-center py-8">
                    {/* Toolbar */}
                    <div className="mb-4 bg-card border rounded-full px-4 py-2 shadow-sm flex gap-1 items-center sticky top-0 z-10 mx-auto">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Undo className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Redo className="h-4 w-4" /></Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Code className="h-4 w-4" /></Button>
                    </div>

                    {/* Email Container */}
                    <div className="w-[600px] max-w-full bg-white shadow-xl min-h-[800px] outline outline-1 outline-slate-200">
                        {blocks.map((block) => (
                            <div
                                key={block.id}
                                onClick={() => setSelectedBlockId(block.id)}
                                className={cn(
                                    "relative p-4 group cursor-pointer transition-all border-y-2 border-transparent",
                                    selectedBlockId === block.id ? "border-primary/50 bg-primary/[0.02]" : "hover:border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {/* Drag Handle & Controls */}
                                <div className={cn(
                                    "absolute top-0 right-0 -translate-y-1/2 flex gap-1 bg-white border shadow-sm rounded-md p-1 transition-opacity z-10",
                                    selectedBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
                                        <GripHorizontal className="h-3 w-3" />
                                    </div>
                                    <button
                                        className="p-1 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded"
                                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>

                                {renderBlock(block, true)}
                            </div>
                        ))}

                        {blocks.length === 0 && (
                            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground opacity-50 border-2 border-dashed m-8 rounded-xl">
                                <LayoutTemplate className="h-12 w-12 mb-4" />
                                <p className="font-semibold text-lg">Empty Template</p>
                                <p className="text-sm">Click blocks on the left to add them here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="col-span-3 border-l bg-card h-full overflow-y-auto">
                    {!selectedBlock ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-60">
                            <Palette className="h-12 w-12 mb-4 opacity-50" />
                            <p className="font-medium">No Block Selected</p>
                            <p className="text-xs mt-2">Select a block on the canvas to configure its properties.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-200">
                            <div className="p-4 border-b bg-muted/30">
                                <h3 className="text-sm font-bold flex items-center gap-2 capitalize">
                                    <Settings className="h-4 w-4 text-primary" /> {selectedBlock.type} Properties
                                </h3>
                            </div>

                            <div className="p-4 space-y-6">
                                {selectedBlock.type === "text" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Content</Label>
                                            <textarea
                                                className="w-full h-32 p-3 font-medium text-sm border rounded-md resize-none shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={selectedBlock.content.text}
                                                onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Alignment</Label>
                                            <div className="flex bg-muted p-1 rounded-md border">
                                                <Button size="sm" variant={selectedBlock.content.align === 'left' ? 'secondary' : 'ghost'} className="flex-1 shadow-none" onClick={() => updateBlock(selectedBlock.id, { align: 'left' })}><AlignLeft className="h-4 w-4" /></Button>
                                                <Button size="sm" variant={selectedBlock.content.align === 'center' || !selectedBlock.content.align ? 'secondary' : 'ghost'} className="flex-1 shadow-none" onClick={() => updateBlock(selectedBlock.id, { align: 'center' })}><AlignCenter className="h-4 w-4" /></Button>
                                                <Button size="sm" variant={selectedBlock.content.align === 'right' ? 'secondary' : 'ghost'} className="flex-1 shadow-none" onClick={() => updateBlock(selectedBlock.id, { align: 'right' })}><AlignRight className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedBlock.type === "button" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Button Text</Label>
                                            <Input value={selectedBlock.content.text} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} className="font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">URL / Link</Label>
                                            <Input value={selectedBlock.content.url} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} className="font-medium" placeholder="https://" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Button Color</Label>
                                            <div className="flex gap-2 items-center">
                                                <input type="color" value={selectedBlock.content.color || "#4f46e5"} onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                                                <Input value={selectedBlock.content.color || "#4f46e5"} onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })} className="font-mono text-sm uppercase flex-1" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedBlock.type === "image" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Image URL</Label>
                                            <Input value={selectedBlock.content.src} onChange={e => updateBlock(selectedBlock.id, { src: e.target.value })} className="font-medium" placeholder="https://" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Alt Text</Label>
                                            <Input value={selectedBlock.content.alt || ""} onChange={e => updateBlock(selectedBlock.id, { alt: e.target.value })} className="font-medium" />
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    )}
                </div>

            </div>
        </StandardPage>
    );
}
