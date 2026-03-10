import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    Save,
    Settings,
    ShieldCheck,
    Clock,
    Plus,
    Trash2,
    FileImage,
    Lock,
    Users
} from "lucide-react";

type DocumentType = {
    id: string;
    name: string;
    category: string;
    requiresApproval: boolean;
    publishToWorker: boolean;
    trackExpiry: boolean;
};

export default function DocumentOfRecords() {
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const [docTypes, setDocTypes] = useState<DocumentType[]>([
        { id: "dt1", name: "Passport", category: "IDENTIFICATION", requiresApproval: true, publishToWorker: true, trackExpiry: true },
        { id: "dt2", name: "Annual Performance Review (Signed)", category: "PERFORMANCE", requiresApproval: false, publishToWorker: true, trackExpiry: false },
        { id: "dt3", name: "Disciplinary Action", category: "EMPLOYMENT", requiresApproval: true, publishToWorker: false, trackExpiry: true },
        { id: "dt4", name: "Proof of Address", category: "ONBOARDING", requiresApproval: true, publishToWorker: true, trackExpiry: false }
    ]);

    const addDocumentType = () => {
        const newType: DocumentType = {
            id: `dt${Date.now()}`,
            name: "New Document Type",
            category: "OTHER",
            requiresApproval: false,
            publishToWorker: true,
            trackExpiry: false
        };
        setDocTypes([...docTypes, newType]);
    };

    const removeDocumentType = (id: string) => {
        setDocTypes(docTypes.filter(d => d.id !== id));
    };

    const updateDocType = (id: string, field: keyof DocumentType, value: any) => {
        setDocTypes(docTypes.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const handleSave = () => {
        toast({
            title: "Configuration Saved",
            description: "Document of Record types have been updated and security policies applied."
        });
    };

    const filteredDocs = selectedCategory === "ALL"
        ? docTypes
        : docTypes.filter(d => d.category === selectedCategory);

    return (
        <StandardPage
            title="Document of Records (DoR) Setup"
            description="Manage document classifications, expiry tracking, and dynamic security access."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Core HR Setup', href: '/hr/setup/workforce-structures' },
                { label: 'Document of Records' }
            ]}
        >
            <div className="max-w-6xl mx-auto space-y-6 pb-12">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-card dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Document Categories & Types</h2>
                            <p className="text-sm text-muted-foreground mt-1">Configure global storage parameters for all uploaded artifacts.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={addDocumentType}><Plus className="h-4 w-4 mr-2" /> Add Document Type</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700"><Save className="h-4 w-4 mr-2" /> Save Config</Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* Left Sidebar - Filter & Analytics */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Filter Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-1 p-2">
                                {["ALL", "IDENTIFICATION", "ONBOARDING", "PERFORMANCE", "EMPLOYMENT", "BENEFITS", "OTHER"].map(cat => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? "secondary" : "ghost"}
                                        className={cn(`w-full justify-start ${selectedCategory === cat ? 'font-medium bg-muted text-foreground' : 'font-normal text-muted-foreground'}`)}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span>{cat === "ALL" ? "All Categories" : cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                                            <Badge variant="outline" className="text-xs">{cat === "ALL" ? docTypes.length : docTypes.filter(d => d.category === cat).length}</Badge>
                                        </div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-indigo-500/10 dark:bg-indigo-900/10 border-indigo-200/50 dark:border-indigo-800/50">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Global Retention Policy</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">Standard retention is set to 7 years post-termination. Exceptions are managed per type.</p>
                                <Select defaultValue="7YEARS">
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1YEAR">1 Year Post Term</SelectItem>
                                        <SelectItem value="7YEARS">7 Years Post Term</SelectItem>
                                        <SelectItem value="PERP">Perpetual (Never Delete)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Area - Document Types List */}
                    <div className="col-span-12 lg:col-span-9 space-y-4">

                        {filteredDocs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                                <FileImage className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No document types found for this category.</p>
                                <Button variant="link" onClick={addDocumentType}>Create one now</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredDocs.map((doc, index) => (
                                    <Card key={doc.id} className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm relative group transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                                        <div className="p-5 flex flex-col xl:flex-row gap-6 items-start xl:items-center">

                                            {/* Basic Info */}
                                            <div className="flex-1 space-y-3 min-w-72">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="bg-background text-[10px] tracking-wider font-semibold text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900">{doc.category}</Badge>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-600 xl:hidden" onClick={() => removeDocumentType(doc.id)} aria-label="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <Label className="text-xs text-muted-foreground">Document Type Name</Label>
                                                        <Input
                                                            value={doc.name}
                                                            onChange={(e) => updateDocType(doc.id, 'name', e.target.value)}
                                                            className="font-medium h-9"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Security Attributes */}
                                                <div className="pt-2 flex flex-wrap gap-4 border-t border-dashed mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={doc.requiresApproval} onCheckedChange={(val) => updateDocType(doc.id, 'requiresApproval', val)} id={`req-${doc.id}`} />
                                                        <Label htmlFor={`req-${doc.id}`} className="text-xs cursor-pointer flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-amber-500" /> HR Approval Required</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={doc.publishToWorker} onCheckedChange={(val) => updateDocType(doc.id, 'publishToWorker', val)} id={`pub-${doc.id}`} />
                                                        <Label htmlFor={`pub-${doc.id}`} className="text-xs cursor-pointer flex items-center gap-1"><Users className="h-3 w-3 text-blue-500" /> Visible to Worker (ESS)</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expiry Tracking Config */}
                                            <div className="w-full xl:w-72 border rounded-lg p-3 bg-zinc-500/10 dark:bg-zinc-900/50 shrink-0">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-3 w-3" /> Expiry Tracking</Label>
                                                    <Switch checked={doc.trackExpiry} onCheckedChange={(val) => updateDocType(doc.id, 'trackExpiry', val)} />
                                                </div>

                                                <div className={cn(`space-y-3 transition-opacity ${doc.trackExpiry ? 'opacity-100' : 'opacity-40 pointer-events-none'}`)}>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Notification Lead Time</Label>
                                                        <Select defaultValue="30">
                                                            <SelectTrigger className="h-8 text-xs bg-card dark:bg-zinc-950 mt-1"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="15">15 Days Before</SelectItem>
                                                                <SelectItem value="30">30 Days Before</SelectItem>
                                                                <SelectItem value="60">60 Days Before</SelectItem>
                                                                <SelectItem value="90">90 Days Before</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Lock className="h-3 w-3 text-red-500" />
                                                        <span className="text-[10px] text-muted-foreground">Blocks payroll processing if expired</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="hidden xl:flex items-center h-full pt-10 px-2 shrink-0">
                                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-900/20" onClick={() => removeDocumentType(doc.id)} aria-label="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </StandardPage>
    );
}
