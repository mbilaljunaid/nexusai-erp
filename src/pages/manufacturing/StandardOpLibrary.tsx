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
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const standardOpSchema = z.object({
    code: z.string().min(1, "Op Code is required"),
    name: z.string().min(1, "Operation Name is required"),
    description: z.string().optional(),
    defaultSetupTime: z.coerce.number().min(0),
    defaultRunTime: z.coerce.number().min(0),
    defaultWorkCenterId: z.string().optional(),
    status: z.enum(["active", "draft", "obsolete"]).default("active")
});

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

    const [searchTerm, setSearchTerm] = useState("");

    const form = useForm<z.infer<typeof standardOpSchema>>({
        resolver: zodResolver(standardOpSchema),
        defaultValues: {
            code: "",
            name: "",
            description: "",
            defaultSetupTime: 0,
            defaultRunTime: 0,
            defaultWorkCenterId: "",
            status: "active"
        }
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
            form.reset();
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

    const columns: SpreadsheetColumn<StandardOp>[] = [
        {
            header: "Op Code",
            id: "code", width: "150px",
            cell: (row: StandardOp) => <div className="font-mono font-bold text-xs">{row.code}</div>
        },
        {
            header: "Name",
            id: "name", width: "150px",
            cell: (row: StandardOp) => <div className="font-medium">{row.name}</div>
        },
        {
            header: "Default Work Center",
            id: "defaultWorkCenterId", width: "150px",
            cell: (row: StandardOp) => {
                const wc = workCenters.find((w) => w.id === row.defaultWorkCenterId);
                return wc ? <Badge variant="outline">{wc.name}</Badge> : <span className="text-muted-foreground">-</span>;
            }
        },
        {
            header: "Std Times (Setup / Run)",
            id: "defaultSetupTime", width: "150px",
            cell: (row: StandardOp) => (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{Number(row.defaultSetupTime || 0).toFixed(1)}m / {Number(row.defaultRunTime || 0).toFixed(1)}m</span>
                </div>
            )
        },
        {
            header: "Status",
            id: "status", width: "150px",
            cell: (row: StandardOp) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                </Badge>
            )
        }
    ];

    ];

    const onSubmit = (values: z.infer<typeof standardOpSchema>) => {
        createMutation.mutate(values);
    };

    return (
        <StandardPage
            title="Standard Operations Library"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Engineering" },
                { label: "Standard Operations" }
            ]}
            actions={
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Op Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. ASM-001" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="draft">Draft</SelectItem>
                                                            <SelectItem value="obsolete">Obsolete</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Operation Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Final Assembly" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="defaultWorkCenterId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Default Work Center</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Work Center" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {workCenters.map((wc) => (
                                                            <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="defaultSetupTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Setup Time (mins)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="defaultRunTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Run Time (mins)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                        </Form>
                    </SheetContent>
                </Sheet>
            }
        >

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
                    <InteractiveSpreadsheet
                        data={operations}
                        columns={columns}
                        isLoading={isLoading}
                        onChange={() => { }} containerHeight="600px" />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
