import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Tag, Layers } from "lucide-react";

interface ExpenditureType {
    id: string;
    name: string;
    unitOfMeasure: string;
    description: string;
}

export default function ExpenditureTypeManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", unitOfMeasure: "Currency", description: "" });

    const { data: types, isLoading } = useQuery<ExpenditureType[]>({
        queryKey: ['/api/ppm/expenditure-types'],
    });

    const mutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/ppm/expenditure-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Expenditure Type created" });
            queryClient.invalidateQueries({ queryKey: ['/api/ppm/expenditure-types'] });
            setIsOpen(false);
            setFormData({ name: "", unitOfMeasure: "Currency", description: "" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const columns: Column<ExpenditureType>[] = [
        { header: "Name", accessorKey: "name", cell: (item) => <div className="font-medium">{item.name}</div> },
        { header: "UOM", accessorKey: "unitOfMeasure" },
        { header: "Description", accessorKey: "description" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Expenditure Types</h2>
                    <p className="text-muted-foreground">Manage classification of project costs and units of measure</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" /> New Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Expenditure Type</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    placeholder="e.g. Professional Services"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit of Measure</Label>
                                <Select
                                    value={formData.unitOfMeasure}
                                    onValueChange={(v) => setFormData({ ...formData, unitOfMeasure: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Currency">Currency (Financial)</SelectItem>
                                        <SelectItem value="Hours">Hours (Labor)</SelectItem>
                                        <SelectItem value="Each">Each (Material)</SelectItem>
                                        <SelectItem value="Miles">Miles (Travel)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Optional description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending} className="w-full">
                                {mutation.isPending ? "Creating..." : "Create Type"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">Active Types</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{types?.length || 0}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4"><CardTitle className="text-sm text-muted-foreground">UOM Variants</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Layers className="h-4 w-4" /> {new Set(types?.map(t => t.unitOfMeasure)).size}</div></CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <StandardTable
                    data={types || []}
                    columns={columns}
                    isLoading={isLoading}
                    pageSize={20}
                />
            </Card>
        </div>
    );
}
