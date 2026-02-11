import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, FileUp, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";

interface MappingValue {
    id?: string;
    inputValue: string;
    outputValue: string;
    description?: string;
}

export function MappingSetEditor({ setId, onBack }: { setId: string, onBack: () => void }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [localValues, setLocalValues] = useState<MappingValue[]>([]);

    // Fetch Set Metadata
    const { data: setDetails } = useQuery({
        queryKey: ["sla-mapping-set", setId],
        queryFn: async () => {
            const res = await fetch(`/api/sla/mapping-sets`);
            const sets = await res.json();
            return sets.find((s: any) => s.id === setId);
        }
    });

    // Fetch Values
    const { isLoading } = useQuery({
        queryKey: ["sla-mapping-values", setId],
        queryFn: async () => {
            const res = await fetch(`/api/sla/mapping-sets/${setId}/values`);
            const data = await res.json();
            setLocalValues(data);
            return data;
        },
        enabled: !!setId
    });

    const saveMutation = useMutation({
        mutationFn: async (values: MappingValue[]) => {
            const res = await fetch(`/api/sla/mapping-sets/${setId}/values`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });
            if (!res.ok) throw new Error("Failed to save values");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-mapping-values", setId] });
            toast({ title: "Mapping Values Saved", description: "All changes persisted successfully." });
        }
    });

    const addRow = () => {
        setLocalValues([...localValues, { inputValue: "", outputValue: "", description: "" }]);
    };

    const removeRow = (index: number) => {
        setLocalValues(localValues.filter((_, i) => i !== index));
    };

    const updateRow = (index: number, field: keyof MappingValue, value: string) => {
        const newValues = [...localValues];
        newValues[index] = { ...newValues[index], [field]: value };
        setLocalValues(newValues);
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{setDetails?.name || "Mapping Set Details"}</h2>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{setDetails?.code}</Badge>
                            <Badge variant="secondary">{setDetails?.inputType} ➜ {setDetails?.outputType}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        id="csv-import"
                        className="hidden"
                        accept=".csv"
                        title="CSV Mapping Import"
                        aria-label="Import mapping values from CSV"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const text = event.target?.result as string;
                                const lines = text.split("\n").filter(l => l.trim());
                                const newRows: MappingValue[] = lines.slice(1).map(line => {
                                    const [input, output, desc] = line.split(",").map(part => part.trim());
                                    return { inputValue: input || "", outputValue: output || "", description: desc || "" };
                                });
                                setLocalValues([...localValues, ...newRows]);
                                toast({ title: "CSV Imported", description: `${newRows.length} rows added.` });
                            };
                            reader.readAsText(file);
                        }}
                    />
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => document.getElementById('csv-import')?.click()}>
                        <FileUp className="h-4 w-4" /> Import CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors">
                        <Sparkles className="h-4 w-4" /> AI Suggest
                    </Button>
                    <Button size="sm" className="gap-2" onClick={() => saveMutation.mutate(localValues)} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Translation Registry</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead className="w-[30%]">Input Value ({setDetails?.inputType})</TableHead>
                                <TableHead className="w-[10px]"></TableHead>
                                <TableHead className="w-[35%]">Output Value ({setDetails?.outputType})</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[70px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localValues.map((val, idx) => (
                                <TableRow key={idx} className="hover:bg-muted/5 transition-colors">
                                    <TableCell>
                                        <Input
                                            value={val.inputValue}
                                            onChange={(e) => updateRow(idx, "inputValue", e.target.value)}
                                            placeholder="Enter source value..."
                                            className="h-9 font-mono text-sm"
                                        />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground px-0">➔</TableCell>
                                    <TableCell>
                                        <Input
                                            value={val.outputValue}
                                            onChange={(e) => updateRow(idx, "outputValue", e.target.value)}
                                            placeholder={setDetails?.outputType === 'Account' ? "CCID or Segments..." : "Segment value..."}
                                            className="h-9 font-mono text-sm"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={val.description || ""}
                                            onChange={(e) => updateRow(idx, "description", e.target.value)}
                                            placeholder="Notes..."
                                            className="h-9 text-sm"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeRow(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {localValues.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                        No values defined. High-volume mappings should be imported via CSV.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Button variant="outline" className="w-full border-dashed border-2 py-6 hover:bg-muted/50 transition-all" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" /> Add Selection Row
            </Button>
        </div>
    );
}

// Full Page Wrapper for Routing
export default function MappingSetEditorPage({ params }: { params: { id: string } }) {
    return (
        <StandardPage
            title="Mapping Set Detail"
            description="Fine-tune accounting translation logic."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "SLA Configuration", href: "/gl/config" },
                { label: "Mapping Sets", href: "/finance/sla/mapping-sets" },
                { label: "Editor" }
            ]}
        >
            <MappingSetEditor setId={params.id} onBack={() => window.history.back()} />
        </StandardPage>
    );
}
