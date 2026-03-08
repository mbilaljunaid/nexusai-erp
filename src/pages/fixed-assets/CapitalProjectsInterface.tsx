import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, FolderOpen, Rocket, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ProjectStatus = "In Progress" | "Placed in Service" | "Cancelled" | "On Hold";

interface CIPProject {
    id: string;
    projectName: string;
    description: string;
    budget: number;
    spentToDate: number;
    status: ProjectStatus;
    startDate: string;
    manager: string;
}

const MOCK_PROJECTS: CIPProject[] = [
    { id: "CIP-001", projectName: "HQ Building Renovation", description: "Leasehold improvements — main lobby and conference rooms renovation", budget: 2400000, spentToDate: 1850000, status: "In Progress", startDate: "2025-06-01", manager: "Sarah Chen" },
    { id: "CIP-002", projectName: "ERP System Implementation", description: "IT infrastructure for new ERP platform", budget: 890000, spentToDate: 890000, status: "Placed in Service", startDate: "2024-01-15", manager: "Raj Patel" },
    { id: "CIP-003", projectName: "Singapore Data Center", description: "Server racks, cooling, and UPS for Singapore Hub", budget: 1500000, spentToDate: 320000, status: "In Progress", startDate: "2025-09-01", manager: "Min Lee" },
    { id: "CIP-004", projectName: "Fleet Vehicle Electrification", description: "5× electric delivery vehicles CIP", budget: 350000, spentToDate: 0, status: "On Hold", startDate: "2026-01-01", manager: "James Walker" },
];

const newProjectSchema = z.object({
    projectName: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    budget: z.string().min(1, "Budget is required"),
    startDate: z.string().min(1, "Start date is required"),
    manager: z.string().min(1, "Manager is required"),
});

const placeInServiceSchema = z.object({
    assetCategory: z.string().min(1, "Asset category is required"),
    assetDescription: z.string().min(1, "Description is required"),
    datePlacedInService: z.string().min(1, "Date is required"),
});

export default function CapitalProjectsInterface() {
    const { toast } = useToast();
    const formatCurrency = (v: number) => formatNumber(v);
    const [projects, setProjects] = useState<CIPProject[]>(MOCK_PROJECTS);
    const [newProjectOpen, setNewProjectOpen] = useState(false);
    const [placeInServiceProject, setPlaceInServiceProject] = useState<CIPProject | null>(null);

    const newProjectForm = useForm<z.infer<typeof newProjectSchema>>({
        resolver: zodResolver(newProjectSchema),
        defaultValues: { projectName: "", description: "", budget: "", startDate: new Date().toISOString().split("T")[0], manager: "" },
    });

    const placeInServiceForm = useForm<z.infer<typeof placeInServiceSchema>>({
        resolver: zodResolver(placeInServiceSchema),
        defaultValues: { assetCategory: "", assetDescription: "", datePlacedInService: new Date().toISOString().split("T")[0] },
    });

    const onNewProject = (values: z.infer<typeof newProjectSchema>) => {
        const newProject: CIPProject = {
            id: `CIP-${String(projects.length + 1).padStart(3, "0")}`,
            projectName: values.projectName,
            description: values.description || "",
            budget: parseFloat(values.budget) || 0,
            spentToDate: 0,
            status: "In Progress",
            startDate: values.startDate,
            manager: values.manager,
        };
        setProjects(prev => [...prev, newProject]);
        newProjectForm.reset();
        setNewProjectOpen(false);
        toast({ title: "CIP Project Created", description: `"${values.projectName}" added to capital projects.` });
    };

    const onPlaceInService = (values: z.infer<typeof placeInServiceSchema>) => {
        if (!placeInServiceProject) return;
        setProjects(prev => prev.map(p => p.id === placeInServiceProject.id ? { ...p, status: "Placed in Service" as ProjectStatus } : p));
        placeInServiceForm.reset();
        setPlaceInServiceProject(null);
        toast({
            title: "Asset Placed in Service",
            description: `${placeInServiceProject.projectName} → FA Record created under "${values.assetCategory}".`,
        });
    };

    const statusColors: Record<ProjectStatus, string> = {
        "In Progress": "default",
        "Placed in Service": "secondary",
        "Cancelled": "destructive",
        "On Hold": "outline",
    };

    const columns: SpreadsheetColumn<CIPProject>[] = useMemo(() => [
        {
            id: "id", header: "CIP ID", width: "100px",
            cellClassName: "font-mono text-xs text-muted-foreground",
            cell: (r) => r.id,
        },
        {
            id: "projectName", header: "Project Name", width: "250px",
            cellClassName: "font-medium",
            cell: (r) => r.projectName,
        },
        {
            id: "description", header: "Description", width: "280px",
            cellClassName: "text-sm text-muted-foreground",
            cell: (r) => r.description,
        },
        {
            id: "budget", header: "Budget", width: "130px",
            cellClassName: "text-right font-mono",
            cell: (r) => formatCurrency(r.budget),
        },
        {
            id: "spentToDate", header: "Spent to Date", width: "130px",
            cell: (r) => {
                const pct = r.budget > 0 ? (r.spentToDate / r.budget) * 100 : 0;
                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm">{formatCurrency(r.spentToDate)}</span>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className={[
                                    "h-1.5 rounded-full",
                                    pct > 90 ? "bg-destructive" : pct > 70 ? "bg-amber-500" : "bg-primary",
                                    pct >= 100 ? "w-full" : pct >= 75 ? "w-3/4" : pct >= 50 ? "w-1/2" : pct >= 25 ? "w-1/4" : "w-[10%]"
                                ].join(" ")}
                            />
                        </div>
                    </div>
                );
            },
        },
        {
            id: "manager", header: "Manager", width: "150px",
            cell: (r) => r.manager,
        },
        {
            id: "status", header: "Status", width: "150px",
            cell: (r) => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge>,
        },
        {
            id: "actions", header: "Action", width: "160px",
            cell: (r) => r.status === "In Progress" ? (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                    onClick={() => { setPlaceInServiceProject(r); placeInServiceForm.reset(); }}
                >
                    <Rocket className="mr-1 h-3.5 w-3.5" /> Place in Service
                </Button>
            ) : r.status === "Placed in Service" ? (
                <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Done</span>
            ) : null,
        },
    ], [formatCurrency]);

    const totals = useMemo(() => ({
        budget: projects.reduce((s, p) => s + p.budget, 0),
        spent: projects.reduce((s, p) => s + p.spentToDate, 0),
        active: projects.filter(p => p.status === "In Progress").length,
    }), [projects]);

    return (
        <StandardPage
            title="Capital Projects (CIP)"
            description="Manage construction-in-progress assets. Track budgets and place projects in service to automatically create Fixed Asset records."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Fixed Assets", href: "/finance/fixed-assets" },
                { label: "Capital Projects" },
            ]}
            actions={
                <Button size="sm" onClick={() => setNewProjectOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New CIP Project
                </Button>
            }
        >
            {/* KPI Row */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Total CIP Budget</p>
                        <p className="text-2xl font-bold font-mono">{formatCurrency(totals.budget)}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Spent to Date</p>
                        <p className="text-2xl font-bold font-mono">{formatCurrency(totals.spent)}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Active Projects</p>
                        <p className="text-2xl font-bold font-mono">{totals.active}</p>
                    </CardContent>
                </Card>
            </div>

            <InteractiveSpreadsheet<CIPProject>
                data={projects}
                columns={columns}
                onChange={setProjects}
                containerHeight="480px"
            />

            {/* New CIP Project Dialog */}
            <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-primary" /> New Capital Project
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...newProjectForm}>
                        <form onSubmit={newProjectForm.handleSubmit(onNewProject)} className="space-y-4 py-2">
                            <FormField control={newProjectForm.control} name="projectName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name *</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. Singapore Office Fit-out" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={newProjectForm.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Input {...field} placeholder="Brief description..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={newProjectForm.control} name="budget" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Budget *</FormLabel>
                                        <FormControl><Input {...field} type="number" placeholder="0.00" className="font-mono" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={newProjectForm.control} name="startDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date *</FormLabel>
                                        <FormControl><Input {...field} type="date" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={newProjectForm.control} name="manager" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Manager *</FormLabel>
                                    <FormControl><Input {...field} placeholder="Full name" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">Create Project</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Place in Service Dialog */}
            <Dialog open={!!placeInServiceProject} onOpenChange={() => setPlaceInServiceProject(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-green-600" /> Place in Service
                        </DialogTitle>
                        {placeInServiceProject && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Converting <strong>{placeInServiceProject.projectName}</strong> to a Fixed Asset record.
                            </p>
                        )}
                    </DialogHeader>
                    <Form {...placeInServiceForm}>
                        <form onSubmit={placeInServiceForm.handleSubmit(onPlaceInService)} className="space-y-4 py-2">
                            <FormField control={placeInServiceForm.control} name="assetCategory" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Category *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Computer Equipment">Computer Equipment</SelectItem>
                                            <SelectItem value="Office Furniture">Office Furniture</SelectItem>
                                            <SelectItem value="Leasehold Improvements">Leasehold Improvements</SelectItem>
                                            <SelectItem value="Vehicles">Vehicles</SelectItem>
                                            <SelectItem value="Machinery">Machinery</SelectItem>
                                            <SelectItem value="Buildings">Buildings</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={placeInServiceForm.control} name="assetDescription" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Description *</FormLabel>
                                    <FormControl><Input {...field} placeholder="Description for the new FA record" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={placeInServiceForm.control} name="datePlacedInService" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date Placed in Service *</FormLabel>
                                    <FormControl><Input {...field} type="date" /></FormControl>
                                    <FormDescription className="text-xs">Depreciation starts from this date based on the prorate convention of the asset category.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">Place in Service</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
