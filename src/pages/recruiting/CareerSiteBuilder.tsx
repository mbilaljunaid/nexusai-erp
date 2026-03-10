import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Upload, MoveUp, MoveDown, Settings2, Eye, Save, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CareerSiteBuilder() {
    const { toast } = useToast();
    const [blocks, setBlocks] = useState([
        { id: "hero", type: "Hero Banner", visible: true, title: "Join Our Mission" },
        { id: "values", type: "Core Values", visible: true, title: "What We Stand For" },
        { id: "jobs", type: "Open Roles List", visible: true, title: "Current Opportunities" },
        { id: "testimonials", type: "Testimonials", visible: false, title: "Employee Stories" }
    ]);

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        const target = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleSave = () => {
        toast({ title: "Site Updated", description: "Career site layout saved successfully." });
    };

    return (
        <StandardPage title="Career Site Builder">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Configure the layout and branding for your public careers portal.</p>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" /> Preview Portal</Button>
                    <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Publish Changes</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">

                {/* Editor Panel */}
                <Card className="md:col-span-8">
                    <CardHeader>
                        <CardTitle>Page Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="brand">
                            <TabsList className="mb-4">
                                <TabsTrigger value="brand">Brand Assets</TabsTrigger>
                                <TabsTrigger value="layout">Page Layout Manager</TabsTrigger>
                            </TabsList>

                            <TabsContent value="brand" className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input defaultValue="NexusAI Innovations" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tagline</Label>
                                    <Input defaultValue="Shaping the Future of Enterprise Systems" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Brand Colors (Hex)</Label>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded border bg-[#2563eb]"></div>
                                            <Input defaultValue="#2563eb" className="w-[120px] font-mono text-xs" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded border bg-[#1e40af]"></div>
                                            <Input defaultValue="#1e40af" className="w-[120px] font-mono text-xs" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>About Us Description</Label>
                                    <Textarea rows={4} defaultValue="We are a fast-growing tech company focused on building intelligent systems. Join us to make a difference." />
                                </div>
                                <div>
                                    <Label className="mb-2 block">Logo & Favicon</Label>
                                    <div className="border border-dashed p-6 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                                        <Upload className="h-6 w-6 mb-2" />
                                        <p className="text-sm">Drag and drop brand assets or Browse</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="layout" className="space-y-4 mt-4">
                                <p className="text-sm text-muted-foreground mb-4">Reorder, enable, or configure layout blocks for the careers page.</p>
                                <div className="space-y-3">
                                    {blocks.map((block, i) => (
                                        <div key={block.id} className={`flex items-center p-3 border rounded-lg justify-between ${!block.visible ? 'opacity-50 bg-muted/50' : 'bg-card'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(i, 'up')} disabled={i === 0}><MoveUp className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1}><MoveDown className="h-3 w-3" /></Button>
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{block.type}</div>
                                                    <div className="text-xs text-muted-foreground">{block.title}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    const n = [...blocks];
                                                    n[i].visible = !n[i].visible;
                                                    setBlocks(n);
                                                }}>
                                                    {block.visible ? 'Hide' : 'Show'}
                                                </Button>
                                                <Button variant="ghost" size="icon"><Settings2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-4 border-dashed"><Plus className="h-4 w-4 mr-2" /> Add Block</Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Wireframe Preview Tool */}
                <Card className="md:col-span-4 bg-muted/20 border-l">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" /> Mini Preview</CardTitle>
                        <CardDescription>Live wireframe structure</CardDescription>
                    </CardHeader>
                    <CardContent className="h-full">
                        <div className="border bg-background rounded-b-xl shadow-lg w-full min-h-[400px] flex flex-col overflow-hidden text-center rounded-t-lg">
                            {/* Browser frame */}
                            <div className="bg-muted px-3 py-2 flex items-center gap-1.5 border-b">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                            </div>
                            {/* CMS Blocks */}
                            <div className="flex flex-col flex-1 p-2 gap-2 bg-[#fafafa] dark:bg-zinc-950">
                                {blocks.filter(b => b.visible).map(block => (
                                    <div key={'prev-' + block.id} className="bg-card border rounded p-4 text-xs font-medium text-muted-foreground flex items-center justify-center min-h-[60px]">
                                        {block.type}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
