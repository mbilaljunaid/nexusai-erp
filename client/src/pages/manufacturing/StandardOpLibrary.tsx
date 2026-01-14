import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Search, Receipt, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StandardOp {
    id: string;
    code: string;
    name: string;
    description?: string;
    defaultWorkCenterId?: string;
    defaultSetupTime?: string | number;
    defaultRunTime?: string | number;
    status: string;
    createdAt?: string;
}

interface WorkCenter {
    id: string;
    name: string;
}

export default function StandardOpLibrary() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        defaultSetupTime: "0",
        defaultRunTime: "0",
        defaultWorkCenterId: "",
        status: "active"
    });

    const { data: operations = [], isLoading } = useQuery<StandardOp[]>({
        queryKey: ["/api/manufacturing/standard-operations"],
    });

    const { data: workCenters = [] } = useQuery<WorkCenter[]>({
        queryKey: ["/api/manufacturing/work-centers"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/standard-operations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/standard-operations"] });
            setIsSheetOpen(false);
            setFormData({
                code: "", name: "", description: "",
                defaultSetupTime: "0", defaultRunTime: "0",
                defaultWorkCenterId: "", status: "active"
            });
            toast({ title: "Success", description: "Standard Operation created." });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const columns: Column<StandardOp>[] = [
        {
            header: "Op Code",
            accessorKey: "code",
            cell: (row: StandardOp) => <div className="font-mono font-bold text-xs">{row.code}</div>
        },
        {
            header: "Name",
            accessorKey: "name",
            cell: (row: StandardOp) => <div className="font-medium">{row.name}</div>
        },
        {
            header: "Default Work Center",
            accessorKey: "defaultWorkCenterId",
            cell: (row: StandardOp) => {
                const wc = workCenters.find((w) => w.id === row.defaultWorkCenterId);
                return wc ? <Badge variant="outline">{wc.name}</Badge> : <span className="text-muted-foreground">-</span>;
            }
        },
        {
            header: "Std Times (Setup / Run)",
            accessorKey: "defaultSetupTime",
            cell: (row: StandardOp) => (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{Number(row.defaultSetupTime || 0).toFixed(1)}m / {Number(row.defaultRunTime || 0).toFixed(1)}m</span>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: StandardOp) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            defaultSetupTime: parseFloat(formData.defaultSetupTime),
            defaultRunTime: parseFloat(formData.defaultRunTime)
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Standard Operations Library</h1>
                    <p className="text-muted-foreground mt-2">
                        Reusable operation templates to standardize manufacturing routings (L9).
                    </p>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Operation
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[540px]">
                        <SheetHeader>
                            <SheetTitle>Create Standard Operation</SheetTitle>
                            <SheetDescription>
                                Add a new operation to the corporate library.
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Op Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="e.g. ASM-001"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="obsolete">Obsolete</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Operation Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Final Assembly"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wc">Default Work Center</Label>
                                    <Select
                                        value={formData.defaultWorkCenterId}
                                        onValueChange={(val) => setFormData({ ...formData, defaultWorkCenterId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Work Center" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workCenters.map((wc) => (
                                                <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="setup">Setup Time (mins)</Label>
                                        <Input
                                            id="setup"
                                            type="number"
                                            value={formData.defaultSetupTime}
                                            onChange={(e) => setFormData({ ...formData, defaultSetupTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="run">Run Time (mins)</Label>
                                        <Input
                                            id="run"
                                            type="number"
                                            value={formData.defaultRunTime}
                                            onChange={(e) => setFormData({ ...formData, defaultRunTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create Operation"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Standard Operations</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{operations.length}</div>
                        <p className="text-xs text-muted-foreground">Certified process steps</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search standard ops..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        data={operations}
                        columns={columns}
                        isLoading={isLoading}
                        page={page}
                        pageSize={10}
                        totalItems={operations.length}
                        onPageChange={setPage}
                        filterColumn="name"
                        filterPlaceholder="Filter by Name..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
