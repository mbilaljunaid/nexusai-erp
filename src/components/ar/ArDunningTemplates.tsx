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
                                <label>Name</label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label>Severity</label>
                                <Input value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label>Email Subject</label>
                            <Input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label>Min Days Overdue</label>
                                <Input type="number" value={formData.daysOverdueMin} onChange={e => setFormData({ ...formData, daysOverdueMin: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <label>Max Days Overdue</label>
                                <Input type="number" value={formData.daysOverdueMax} onChange={e => setFormData({ ...formData, daysOverdueMax: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label>Content Template</label>
                            <Textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                        </div>
                        <Button type="submit" disabled={createMutation.isPending}>
                            <Plus className="w-4 h-4 mr-2" />
                            {createMutation.isPending ? "Creating..." : "Save Template"}
                        </Button>
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
