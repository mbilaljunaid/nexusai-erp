
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function CostComponentManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Component State
    const [newComponent, setNewComponent] = useState({
        name: "",
        componentType: "FREIGHT",
        allocationBasis: "VALUE",
        absorptionAccountCcid: "",
        varianceAccountCcid: ""
    });

    const { data: components = [], isLoading } = useQuery({
        queryKey: ['lcmComponents'],
        queryFn: async () => {
            const res = await fetch(`/api/lcm/components`);
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/lcm/components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComponent)
            });
            if (!res.ok) throw new Error("Failed to create");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lcmComponents'] });
            setNewComponent({
                name: "", componentType: "FREIGHT", allocationBasis: "VALUE",
                absorptionAccountCcid: "", varianceAccountCcid: ""
            });
            toast({ title: "Cost Component Created", description: "Master data updated." });
        }
    });

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5" /> Cost Component Configuration
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Creation Form */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 bg-muted/50 rounded-lg items-end">
                    <div className="md:col-span-1">
                        <Label className="text-xs font-medium">Name</Label>
                        <Input
                            value={newComponent.name}
                            onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                            placeholder="e.g. Ocean Freight"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Label className="text-xs font-medium">Type</Label>
                        <Select
                            value={newComponent.componentType}
                            onValueChange={(val) => setNewComponent({ ...newComponent, componentType: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FREIGHT">Freight</SelectItem>
                                <SelectItem value="INSURANCE">Insurance</SelectItem>
                                <SelectItem value="DUTY">Duty</SelectItem>
                                <SelectItem value="OTHERS">Others</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-1">
                        <Label className="text-xs font-medium">Basis</Label>
                        <Select
                            value={newComponent.allocationBasis}
                            onValueChange={(val) => setNewComponent({ ...newComponent, allocationBasis: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VALUE">Value</SelectItem>
                                <SelectItem value="QUANTITY">Quantity</SelectItem>
                                <SelectItem value="WEIGHT">Weight</SelectItem>
                                <SelectItem value="VOLUME">Volume</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-1">
                        <Label className="text-xs font-medium">Absorption Account</Label>
                        <Input
                            value={newComponent.absorptionAccountCcid}
                            onChange={(e) => setNewComponent({ ...newComponent, absorptionAccountCcid: e.target.value })}
                            placeholder="CCID (e.g. 2000)"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Label className="text-xs font-medium">Variance Account</Label>
                        <Input
                            value={newComponent.varianceAccountCcid}
                            onChange={(e) => setNewComponent({ ...newComponent, varianceAccountCcid: e.target.value })}
                            placeholder="CCID (e.g. 5000)"
                        />
                    </div>
                    <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newComponent.name}>
                        <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                </div>

                {/* List Table */}
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Component Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Alloc Basis</TableHead>
                                <TableHead>Absorption Acct</TableHead>
                                <TableHead>Variance Acct</TableHead>
                                <TableHead>Active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {components.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.componentType}</TableCell>
                                    <TableCell>{c.allocationBasis}</TableCell>
                                    <TableCell>{c.absorptionAccountCcid || <span className="text-muted-foreground italic">None</span>}</TableCell>
                                    <TableCell>{c.varianceAccountCcid || <span className="text-muted-foreground italic">None</span>}</TableCell>
                                    <TableCell>
                                        <Badge variant={c.isActive ? "secondary" : "outline"}>
                                            {c.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {components.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No cost components defined. Add one above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
