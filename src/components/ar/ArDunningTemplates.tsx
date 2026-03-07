import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Label } from "@/components/ui/label";

type Template = {
    id: string;
    name: string;
    subject: string;
    content: string;
    daysOverdueMin: number;
    daysOverdueMax: number;
    severity: string;
};

export function ArDunningTemplates() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Partial<Template>>({
        name: "",
        subject: "",
        content: "",
        daysOverdueMin: 0,
        daysOverdueMax: 1000,
        severity: "Medium"
    });

    const { data: templates } = useQuery<Template[]>({
        queryKey: ["/api/ar/dunning/templates"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.ar.dunning.templates.create(data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/dunning/templates"] });
            toast({ title: "Success", description: "Template created" });
            setFormData({ name: "", subject: "", content: "", daysOverdueMin: 0, daysOverdueMax: 1000, severity: "Medium" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create Dunning Template</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Severity</Label>
                                <Input value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Days Overdue</Label>
                                <Input type="number" value={formData.daysOverdueMin} onChange={e => setFormData({ ...formData, daysOverdueMin: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Days Overdue</Label>
                                <Input type="number" value={formData.daysOverdueMax} onChange={e => setFormData({ ...formData, daysOverdueMax: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Content Template</Label>
                                    <Textarea
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        className="h-48 font-mono text-sm"
                                        placeholder="Dear {{customer_name}}, your invoice {{invoice_number}} is overdue..."
                                    />
                                </div>
                                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {createMutation.isPending ? "Creating..." : "Save Template"}
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-sm font-medium">Template Preview</Label>
                                <div className="h-48 p-4 rounded-md border border-slate-200 bg-slate-500/10 overflow-y-auto text-sm whitespace-pre-wrap">
                                    <div className="font-bold border-b pb-2 mb-2">Subject: {formData.subject || "(No Subject)"}</div>
                                    {formData.content || "(No Content)"}
                                </div>
                                <p className="text-xs text-muted-foreground">Supported variables: {'{{customer_name}}, {{invoice_number}}, {{due_date}}, {{overdue_amount}}'}</p>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Templates</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Range (Days)</TableHead>
                                <TableHead>Subject</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates?.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.name}</TableCell>
                                    <TableCell>{t.severity}</TableCell>
                                    <TableCell>{t.daysOverdueMin} - {t.daysOverdueMax}</TableCell>
                                    <TableCell>{t.subject}</TableCell>
                                </TableRow>
                            ))}
                            {!templates?.length && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">No templates defined.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
