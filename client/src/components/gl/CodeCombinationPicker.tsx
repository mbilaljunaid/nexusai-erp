import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Grid, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CodeCombinationPickerProps {
    value: string; // The account ID (CCID) or concatenated string
    onChange: (value: string) => void;
    ledgerId?: string; // e.g. "primary-ledger-001"
}

export function CodeCombinationPicker({ value, onChange, ledgerId = "primary-ledger-001" }: CodeCombinationPickerProps) {
    const [open, setOpen] = useState(false);
    const [segments, setSegments] = useState<string[]>([]);

    // Fetch Structure
    const { data: structure, isLoading } = useQuery({
        queryKey: [`/api/gl/ledgers/${ledgerId}/structure`],
        enabled: open // Fetch when opened
    });

    // Initialize segments array size based on structure
    useEffect(() => {
        if (structure) {
            const parts = value ? value.split("-") : Array(structure.length).fill("");
            // Only update if the new parts are different or if segments haven't been initialized yet
            if (segments.length === 0 || parts.join("-") !== segments.join("-")) {
                setSegments(parts);
            }
        }
    }, [structure, value]); // Removed segments.length from dependency array to avoid infinite loop

    const handleSegmentChange = (index: number, val: string) => {
        const newSegments = [...segments];
        newSegments[index] = val;
        setSegments(newSegments);
    };

    const handleApply = () => {
        const newValue = segments.join("-");
        onChange(newValue);
        setOpen(false);
    };

    const handleClear = () => {
        if (!structure) return;
        const cleared = Array(structure.length).fill("");
        setSegments(cleared);
        onChange("");
        setOpen(false);
    };

    // Check if all segments are filled
    const isValid = segments.every(s => s && s.length > 0);

    if (!structure && open && isLoading) return <div>Loading segments...</div>;

    return (
        <div className="flex items-center gap-2">
            <Input
                value={value}
                readOnly
                placeholder="01-000-11000-000"
                className="w-full font-mono bg-muted"
                onClick={() => setOpen(true)}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Grid className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-4" align="start">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-semibold">Account String Builder</h4>
                            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {structure?.map((seg: any, idx: number) => (
                                <div key={seg.name} className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">{seg.name}</Label>
                                    <select
                                        value={segments[idx] || ""}
                                        onChange={(e) => handleSegmentChange(idx, e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select...</option>
                                        {seg.options.map((opt: any) => (
                                            <option key={opt.val} value={opt.val}>
                                                {opt.val}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="text-[10px] text-gray-400 truncate">
                                        {seg.options.find((o: any) => o.val === segments[idx])?.desc || "Select a value"}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between pt-2">
                            <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-500 hover:text-red-600">Clear</Button>
                            <Button size="sm" onClick={handleApply} disabled={!isValid}>Apply</Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
