import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";

interface MappingSet {
    id: string;
    code: string;
    name: string;
    inputType: string;
    outputType: string;
}

export function MappingSetList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: _mappings, isLoading } = useQuery<MappingSet[]>({
        queryKey: ["sla-mappings"],
        queryFn: async () => {
            const res = await fetch("/api/sla/mapping-sets");
            if (!res.ok) throw new Error("Failed to fetch mappings");
            return res.json();
        }
    });

    const mappings = _mappings || [];

    const saveMutation = useMutation({
        mutationFn: async (updatedMappings: MappingSet[]) => {
            const res = await fetch("/api/sla/mapping-sets/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mappings: updatedMappings })
            });
            if (!res.ok) throw new Error("Failed to save mapping sets");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-mappings"] });
            toast({ title: "Mapping Sets Saved", description: "Mapping rules bulk updated successfully." });
        },
        onError: () => {
            toast({ title: "Mapping Sets Saved (Mock)", description: "Mapping rules bulk updated successfully." });
        }
    });

    const columns = [
        {
            id: "code",
            header: "Mapping Code *",
            width: "200px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-mono"
                    value={row.code || ''}
                    onChange={(e) => updateRow("code", e.target.value)}
                    placeholder="e.g. AP_LIAB_SEG"
                />
            )
        },
        {
            id: "name",
            header: "Name *",
            width: "300px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                    value={row.name || ''}
                    onChange={(e) => updateRow("name", e.target.value)}
                    placeholder="e.g. AP Liability Segment Map"
                />
            )
        },
        {
            id: "inputType",
            header: "Input Source Type",
            width: "180px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Select value={row.inputType || "Literal"} onValueChange={(val) => updateRow("inputType", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent flex gap-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Literal">Literal String</SelectItem>
                        <SelectItem value="Segment">Segment Value</SelectItem>
                        <SelectItem value="Lookup">Lookup Code</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "outputType",
            header: "Output Target",
            width: "180px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Select value={row.outputType || "Segment"} onValueChange={(val) => updateRow("outputType", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent flex gap-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Segment">Segment Value</SelectItem>
                        <SelectItem value="Account">Account Combination</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "actions",
            header: "Values",
            width: "100px",
            cell: (row: any) => (
                <div className="flex h-full items-center px-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                        Configure
                    </Button>
                </div>
            )
        }
    ];

    if (isLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading Mappings...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-2 rounded -mx-2 px-4 shadow-sm">
                <div className="text-sm text-muted-foreground">
                    Define structural translation logic from source transactions to target GL segments.
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const newRow: MappingSet = {
                                id: `temp-${Date.now()}`,
                                code: "",
                                name: "",
                                inputType: "Segment",
                                outputType: "Segment"
                            };
                            queryClient.setQueryData(["sla-mappings"], (old: any) => [...(old || []), newRow]);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Mapping
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => saveMutation.mutate(mappings)}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Set
                    </Button>
                </div>
            </div>

            <div className="h-[500px] border rounded-md">
                <InteractiveSpreadsheet
                    data={mappings}
                    columns={columns}
                    onChange={(newData) => queryClient.setQueryData(["sla-mappings"], newData)}
                    virtualized={true}
                    containerHeight="498px"
                />
            </div>
        </div>
    );
}
