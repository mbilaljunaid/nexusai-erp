import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Briefcase } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const basisSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    frequency: z.enum(["ANNUALLY", "HOURLY", "MONTHLY"]).default("ANNUALLY"),
});


export default function CompensationDashboard() {
    const [activeTab, setActiveTab] = useState("salary-bases");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isBasisOpen, setIsBasisOpen] = useState(false);

    const form = useForm<z.infer<typeof basisSchema>>({
        resolver: zodResolver(basisSchema),
        defaultValues: {
            name: "",
            code: "",
            frequency: "ANNUALLY"
        }
    });

    // === QUERIES ===
    const { data: salaryBases, isLoading: isBasesLoading } = useQuery<any>({
        queryKey: ["salary-bases"],
        queryFn: async () => {
            const res = await fetch("/api/rewards/salary-bases");
            if (!res.ok) throw new Error("Failed to fetch salary bases");
            return res.json();
        }
    });

    // Example Query for Recent Salary Changes (Future Implementation)
    // const { data: salaryChanges } = useQuery(...)

    // === MUTATIONS ===
    const createBasisMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/rewards/salary-bases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create salary basis");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salary-bases"] });
            setIsBasisOpen(false);
            form.reset();
            toast({ title: "Salary Basis Created" });
        },
    });

    const onSubmit = (values: z.infer<typeof basisSchema>) => {
        createBasisMutation.mutate({
            ...values,
            currency: "USD", // Default for V1
            annualizationFactor: values.frequency === "HOURLY" ? "2080" : "1.0",
            status: "ACTIVE"
        });
    };

    if (isBasesLoading) return <div className="p-8">Loading Compensation Data...</div>;

    return (
        <StandardPage title="Compensation Management">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground mt-1">Manage salary structures, plans, and worker pay.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Salary Concept</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salaryBases?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Defined Bases</p>
                    </CardContent>
                </Card>
                {/* Placeholders for future metrics */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payroll Cost</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$ --</div>
                        <p className="text-xs text-muted-foreground">Annualized (Est.)</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="salary-bases">Salary Bases</TabsTrigger>
                    <TabsTrigger value="grades">Pay Grades</TabsTrigger>
                    <TabsTrigger value="assignments">Worker Assignments</TabsTrigger>
                </TabsList>

                <TabsContent value="grades" className="space-y-4">
                    <div className="flex justify-end">
                        <Button><Plus className="mr-2 h-4 w-4" /> New Pay Grade</Button>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader><TableRow><TableHead>Grade Name</TableHead><TableHead>Code</TableHead><TableHead>Min</TableHead><TableHead>Mid</TableHead><TableHead>Max</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                <TableRow><TableCell>IC-1 Junior Engineer</TableCell><TableCell>IC1_SWE</TableCell><TableCell>$60,000</TableCell><TableCell>$75,000</TableCell><TableCell>$90,000</TableCell><TableCell><Badge variant="outline">Active</Badge></TableCell></TableRow>
                                <TableRow><TableCell>IC-2 Engineer</TableCell><TableCell>IC2_SWE</TableCell><TableCell>$85,000</TableCell><TableCell>$105,000</TableCell><TableCell>$125,000</TableCell><TableCell><Badge variant="outline">Active</Badge></TableCell></TableRow>
                                <TableRow><TableCell>IC-3 Senior Engineer</TableCell><TableCell>IC3_SWE</TableCell><TableCell>$120,000</TableCell><TableCell>$150,000</TableCell><TableCell>$180,000</TableCell><TableCell><Badge variant="outline">Active</Badge></TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="salary-bases" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isBasisOpen} onOpenChange={(open) => {
                            setIsBasisOpen(open);
                            if (!open) form.reset();
                        }}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> New Basis</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Salary Basis</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. US Annual Salaried" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="US_ANN_SAL" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="frequency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Frequency</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="ANNUALLY">Annually</SelectItem>
                                                            <SelectItem value="HOURLY">Hourly</SelectItem>
                                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full">Create</Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Currency</TableHead>
                                    <TableHead>Factor</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salaryBases?.map((base: any) => (
                                    <TableRow key={base.id}>
                                        <TableCell className="font-medium">{base.name}</TableCell>
                                        <TableCell>{base.code}</TableCell>
                                        <TableCell><Badge variant="outline">{base.frequency}</Badge></TableCell>
                                        <TableCell>{base.currency}</TableCell>
                                        <TableCell>{base.annualizationFactor}</TableCell>
                                        <TableCell><StatusBadge status={base.status === 'ACTIVE' ? 'active' : 'info'} label={base.status} /></TableCell>
                                    </TableRow>
                                ))}
                                {salaryBases?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No Salary Bases defined.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments">
                    <Card className="p-8 text-center text-muted-foreground">
                        Worker Salary Assignment View coming soon.
                        <br />
                        Use "Recruitment {'>'} Offers" to create initial salary records.
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
