import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { LineChart, TrendingUp, Plus, BarChart4 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/dateUtils";

export default function StrategicModeling() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: models = [], isLoading } = useQuery({
        queryKey: ["/api/epm/strategic-models"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/epm/strategic-models");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/epm/strategic-models", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Strategic Model created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/epm/strategic-models"] });
        }
    });

    const [newModel, setNewModel] = useState({
        name: "",
        description: "",
        baseYear: new Date().getFullYear(),
        timeHorizonYears: 5
    });

    const columns = [
        {
            id: "name",
            header: "Model Name",
            width: "250px",
            cell: (row: any) => <span className="font-semibold text-primary">{row.name}</span>
        },
        {
            id: "description",
            header: "Description",
            width: "300px",
            cell: (row: any) => <span className="text-muted-foreground line-clamp-1">{row.description}</span>
        },
        {
            id: "baseYear",
            header: "Base Year",
            width: "120px",
            cell: (row: any) => <span>{row.baseYear}</span>
        },
        {
            id: "timeHorizonYears",
            header: "Horizon",
            width: "120px",
            cell: (row: any) => <span>{row.timeHorizonYears} Years</span>
        },
        {
            id: "status",
            header: "Status",
            width: "120px",
            cell: (row: any) => (
                <Badge variant={row.status === 'Active' ? 'default' : 'secondary'} className={row.status === 'Active' ? 'bg-green-500' : ''}>
                    {row.status}
                </Badge>
            )
        },
        {
            id: "createdAt",
            header: "Created",
            width: "150px",
            cell: (row: any) => <span>{formatDate(row.createdAt)}</span>
        }
    ];

    return (
        <StandardPage
            title="Strategic Modeling"
            description="Multi-year macro forecasting and scenario planning."
            breadcrumbs={[
                { label: 'EPM Dashboard', href: '/epm' },
                { label: 'Planning', href: '/epm/planning' },
                { label: 'Strategic Modeling' }
            ]}
            actions={
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-semibold shadcn-button-premium">
                            <Plus className="mr-2 h-4 w-4" />
                            New Model
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Strategic Model</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Model Name</Label>
                                <Input
                                    value={newModel.name}
                                    onChange={e => setNewModel(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. 2026-2030 Growth Plan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={newModel.description}
                                    onChange={e => setNewModel(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Brief description of the model's assumptions..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Base Year</Label>
                                    <Input
                                        type="number"
                                        value={newModel.baseYear}
                                        onChange={e => setNewModel(p => ({ ...p, baseYear: parseInt(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Horizon (Years)</Label>
                                    <Input
                                        type="number"
                                        value={newModel.timeHorizonYears}
                                        onChange={e => setNewModel(p => ({ ...p, timeHorizonYears: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => createMutation.mutate(newModel)}
                                disabled={!newModel.name || !newModel.baseYear || createMutation.isPending}
                            >
                                <TrendingUp className="mr-2 h-4 w-4" /> Initialize Model
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            }
        >
            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="col-span-1 border rounded-lg p-6 bg-card flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                        <LineChart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                        <h3 className="text-2xl font-bold tracking-tight">{models.filter((m: any) => m.status === 'Active').length}</h3>
                    </div>
                </div>
                <div className="col-span-1 border rounded-lg p-6 bg-card flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                        <BarChart4 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                        <h3 className="text-2xl font-bold tracking-tight">{models.length}</h3>
                    </div>
                </div>
            </div>

            <div className="h-[600px] border rounded-lg bg-background overflow-hidden relative shadow-sm">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : models.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                        <TrendingUp className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No Strategic Models</p>
                        <p className="text-sm opacity-70">Create a new model to begin macro forecasting.</p>
                    </div>
                ) : (
                    <InteractiveSpreadsheet
                        data={models}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="600px"
                    />
                )}
            </div>
        </StandardPage>
    );
}
