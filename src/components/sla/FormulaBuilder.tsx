
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Plus, Trash2, Check } from "lucide-react";

interface FormulaBuilderProps {
    value: string;
    onChange: (val: string) => void;
}

interface ConditionPart {
    id: number;
    source: string;
    operator: string;
    value: string;
    logic: "AND" | "OR";
}

export function FormulaBuilder({ value, onChange }: FormulaBuilderProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Parse initial value roughly or start empty
    // Simplified parser for demo (assumes "source.field op 'val'")
    const [parts, setParts] = useState<ConditionPart[]>([
        { id: 1, source: "source.amount", operator: ">", value: "0", logic: "AND" }
    ]);

    const buildFormula = () => {
        // Reconstruct string
        const formula = parts.map((p, i) => {
            const prefix = i > 0 ? ` ${p.logic} ` : "";
            const val = isNaN(Number(p.value)) ? `'${p.value}'` : p.value;
            return `${prefix}${p.source} ${p.operator} ${val}`;
        }).join("");
        onChange(formula);
        setIsOpen(false);
    };

    const addPart = () => {
        setParts([...parts, { id: Date.now(), source: "source.field", operator: "=", value: "", logic: "AND" }]);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal truncate">
                    <Calculator className="mr-2 h-4 w-4" />
                    {value ? value : <span className="text-muted-foreground">Set Condition...</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-4">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Condition Builder</h4>
                    <p className="text-sm text-muted-foreground">Define rules for when this line matches.</p>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {parts.map((part, index) => (
                            <div key={part.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                                {index > 0 && (
                                    <Select value={part.logic} onValueChange={v => setParts(parts.map(p => p.id === part.id ? { ...p, logic: v as any } : p))}>
                                        <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AND">AND</SelectItem>
                                            <SelectItem value="OR">OR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                                <Select value={part.source} onValueChange={v => setParts(parts.map(p => p.id === part.id ? { ...p, source: v } : p))}>
                                    <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="source.amount">Amount</SelectItem>
                                        <SelectItem value="source.invoiceType">Invoice Type</SelectItem>
                                        <SelectItem value="source.vendorType">Vendor Type</SelectItem>
                                        <SelectItem value="source.currency">Currency</SelectItem>
                                        <SelectItem value="source.projectId">Project ID</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={part.operator} onValueChange={v => setParts(parts.map(p => p.id === part.id ? { ...p, operator: v } : p))}>
                                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="=">=</SelectItem>
                                        <SelectItem value="!=">!=</SelectItem>
                                        <SelectItem value=">">&gt;</SelectItem>
                                        <SelectItem value="<">&lt;</SelectItem>
                                        <SelectItem value="includes">Contains</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    className="h-8 flex-1"
                                    placeholder="Value"
                                    value={part.value}
                                    onChange={e => setParts(parts.map(p => p.id === part.id ? { ...p, value: e.target.value } : p))}
                                />
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setParts(parts.filter(p => p.id !== part.id))} aria-label="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={addPart}><Plus className="h-4 w-4 mr-2" /> Add Rule</Button>
                        <Button size="sm" onClick={buildFormula}><Check className="h-4 w-4 mr-2" /> Apply Condition</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
