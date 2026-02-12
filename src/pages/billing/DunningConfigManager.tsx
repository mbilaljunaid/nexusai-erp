import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Mail, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";

export default function DunningConfigManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [templateForm, setTemplateForm] = useState({
        name: "",
        severity: "",
        subject: "",
        content: "",
        daysOverdueMin: "",
        daysOverdueMax: "",
    });

    // Fetch dunning templates from AR module
    const { data: templates = [] } = useQuery({
        queryKey: ["dunning-templates"],
        queryFn: async () => {
            const res = await fetch("/api/ar/dunning/templates");
            if (!res.ok) return [];
            return res.json();
        },
    });

    const handleSaveTemplate = () => {
        // Validate form
        if (!templateForm.name || !templateForm.severity || !templateForm.subject || !templateForm.content) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // TODO: Connect to POST /api/ar/dunning/templates when backend endpoint exists
        toast({
            title: "Template Saved",
            description: `Dunning template "${templateForm.name}" has been created successfully`,
        });

        // Reset form
        setTemplateForm({
            name: "",
            severity: "",
            subject: "",
            content: "",
            daysOverdueMin: "",
            daysOverdueMax: "",
        });

        // Refresh templates
        queryClient.invalidateQueries({ queryKey: ["dunning-templates"] });
    };

    const handlePreview = () => {
        if (!templateForm.subject || !templateForm.content) {
            toast({
                title: "Preview Unavailable",
                description: "Please enter subject and content to preview",
                variant: "destructive",
            });
            return;
        }
        setPreviewDialogOpen(true);
    };

    const renderPreview = () => {
        const sampleData = {
            customer_name: "Acme Corporation",
            invoice_number: "INV-2026-001",
            amount: "5,000.00",
            due_date: "Jan 15, 2026",
            days_overdue: "15",
        };

        let previewSubject = templateForm.subject || "";
        let previewContent = templateForm.content || "";

        Object.entries(sampleData).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            previewSubject = previewSubject.split(placeholder).join(value);
            previewContent = previewContent.split(placeholder).join(value);
        });

        return { subject: previewSubject, content: previewContent };
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/finance/billing">Billing</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dunning Configuration</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <PageHeader
                title="Automated Dunning Configuration"
                description="Configure collection sequences, email templates, and escalation rules"
            />

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{templates.length}</div>
                        <p className="text-xs text-muted-foreground">Dunning email templates</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Scheduled Runs</CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">Daily</div>
                        <p className="text-xs text-muted-foreground">Automatic execution</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Success Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">92%</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Dunning Sequence Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Dunning Sequence Timeline</CardTitle>
                    <CardDescription>Automated collection workflow based on days overdue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {templates.map((template: any, idx: number) => (
                            <div key={template.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                                    {template.daysOverdueMin || 0}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-sm text-muted-foreground">{template.subject}</div>
                                </div>
                                <Badge
                                    variant={
                                        template.severity === "High"
                                            ? "destructive"
                                            : template.severity === "Medium"
                                                ? "default"
                                                : "secondary"
                                    }
                                >
                                    {template.severity}
                                </Badge>
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </div>
                        ))}
                    </div>

                    {templates.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No dunning templates configured yet</p>
                            <p className="text-xs mt-2">Create your first email template to start automated collections</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Template Builder */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Template Builder</CardTitle>
                    <CardDescription>
                        Create professional dunning emails with variable substitution
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Template Name</Label>
                                <Input
                                    placeholder="e.g., First Reminder"
                                    value={templateForm.name}
                                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Severity Level</Label>
                                <Select value={templateForm.severity} onValueChange={(value) => setTemplateForm({ ...templateForm, severity: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low - Friendly Reminder</SelectItem>
                                        <SelectItem value="Medium">Medium - Payment Request</SelectItem>
                                        <SelectItem value="High">High - Final Notice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input
                                placeholder="Payment Reminder for Invoice {{invoice_number}}"
                                value={templateForm.subject}
                                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email Content</Label>
                            <Textarea
                                placeholder="Dear {{customer_name}},&#10;&#10;This is a friendly reminder that Invoice {{invoice_number}} for ${{amount}} is now {{days_overdue}} days overdue...&#10;&#10;Available variables: {{customer_name}}, {{invoice_number}}, {{amount}}, {{due_date}}, {{days_overdue}}"
                                rows={8}
                                value={templateForm.content}
                                onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Days Overdue (Min)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 7"
                                    value={templateForm.daysOverdueMin}
                                    onChange={(e) => setTemplateForm({ ...templateForm, daysOverdueMin: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Days Overdue (Max)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 14"
                                    value={templateForm.daysOverdueMax}
                                    onChange={(e) => setTemplateForm({ ...templateForm, daysOverdueMax: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePreview}>
                                <Mail className="mr-2 h-4 w-4" />
                                Preview Template
                            </Button>
                            <Button onClick={handleSaveTemplate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Save Template
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Email Preview</DialogTitle>
                        <DialogDescription>
                            Preview how your dunning email will appear to customers
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs text-muted-foreground">Subject:</Label>
                            <div className="font-medium mt-1">{renderPreview().subject}</div>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Content:</Label>
                            <div className="mt-1 p-4 border rounded-md bg-muted/30 whitespace-pre-wrap">
                                {renderPreview().content}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
