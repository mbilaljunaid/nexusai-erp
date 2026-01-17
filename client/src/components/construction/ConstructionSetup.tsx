import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Settings2,
    ShieldCheck,
    ArrowRightLeft,
    Plus,
    Save,
    RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface SetupEntry {
    id: string;
    configKey: string;
    configValue: string;
    category: string;
    description: string;
    updatedAt: string;
}

export default function ConstructionSetup() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newEntry, setNewEntry] = useState({ configKey: "", configValue: "", category: "GENERAL", description: "" });

    const { data: configs = [], isLoading } = useQuery<SetupEntry[]>({
        queryKey: ["construction-setup"],
        queryFn: async () => {
            const res = await fetch("/api/construction/setup");
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (entry: Partial<SetupEntry>) => {
            const res = await fetch("/api/construction/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-setup"] });
            toast({ title: "Configuration Updated", description: "Your changes have been saved." });
            setNewEntry({ configKey: "", configValue: "", category: "GENERAL", description: "" });
        }
    });

    const handleUpdate = (key: string, value: string, category: string, description: string) => {
        updateMutation.mutate({ configKey: key, configValue: value, category, description });
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <Breadcrumbs items={[
                { label: "ERP", path: "/erp" },
                { label: "Construction", path: "/construction/insights" },
                { label: "Setup", path: "/construction/setup" }
            ]} />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Construction Setup</h1>
                    <p className="text-muted-foreground italic">Manage global retention rules, variation categories, and billing logic.</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Rules Table */}
                <Card className="col-span-8 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Global Parameters</CardTitle>
                        <CardDescription>Enterprise settings for construction projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10">Loading configuration...</TableCell></TableRow>
                                ) : configs.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">No configurations found.</TableCell></TableRow>
                                ) : (
                                    configs.map(config => (
                                        <TableRow key={config.id}>
                                            <TableCell>
                                                <Badge variant="outline">{config.category}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{config.configKey}</TableCell>
                                            <TableCell>
                                                <Input
                                                    className="h-8"
                                                    defaultValue={config.configValue}
                                                    onBlur={(e) => handleUpdate(config.configKey, e.target.value, config.category, config.description)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{config.description}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <RotateCcw className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Add New Rule */}
                <Card className="col-span-4 shadow-sm border-l-4 border-l-blue-600">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Create New Rule
                        </CardTitle>
                        <CardDescription>Define a new parameter for the module.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Parameter Key (SNAKE_CASE)</Label>
                            <Input
                                placeholder="DEFAULT_RETENTION_PERCENT"
                                value={newEntry.configKey}
                                onChange={(e) => setNewEntry({ ...newEntry, configKey: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                                placeholder="10.00"
                                value={newEntry.configValue}
                                onChange={(e) => setNewEntry({ ...newEntry, configValue: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <select
                                className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm"
                                value={newEntry.category}
                                title="Select Parameter Category"
                                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                            >
                                <option value="GENERAL">General</option>
                                <option value="BILLING">Billing</option>
                                <option value="VARIATIONS">Variations</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Default retention applied to contracts."
                                value={newEntry.description}
                                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                            />
                        </div>
                        <Button
                            className="w-full gap-2"
                            onClick={() => updateMutation.mutate(newEntry)}
                            disabled={!newEntry.configKey || !newEntry.configValue}
                        >
                            <Save className="h-4 w-4" /> Save Configuration
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Logical Groups */}
            <div className="grid grid-cols-3 gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                        <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                        <div>
                            <CardTitle className="text-base font-bold">Variation Mapping</CardTitle>
                            <CardDescription className="text-xs">Map status codes to workflow tiers.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <div>
                            <CardTitle className="text-base font-bold">Retention Policy</CardTitle>
                            <CardDescription className="text-xs">Configure release thresholds.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                        <Settings2 className="h-5 w-5 text-slate-600" />
                        <div>
                            <CardTitle className="text-base font-bold">Billing Cycles</CardTitle>
                            <CardDescription className="text-xs">Define standard period ends.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
