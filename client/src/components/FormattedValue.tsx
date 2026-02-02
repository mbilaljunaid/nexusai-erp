import React, { useEffect, useState } from "react";
import { FormatterType, FormattedData } from "@/types/formatter";
import { uiFormatter } from "@/services/uiFormatterService";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

interface FormattedValueProps {
    value: string | number;
    type: FormatterType;
    showIcon?: boolean; // Optional: show icon based on type (not implemented yet)
    className?: string;
}

export function FormattedValue({ value, type, className }: FormattedValueProps) {
    const [data, setData] = useState<FormattedData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // For simple types, use sync to avoid flicker
        if (["date", "datetime", "currency"].includes(type)) {
            setData(uiFormatter.formatSync(value, type));
            setLoading(false);
            return;
        }

        // Async fetch for others
        uiFormatter.format(value, type).then((res) => {
            if (mounted) {
                setData(res);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
        };
    }, [value, type]);

    if (loading) {
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    }

    if (!data) return <span>{value}</span>;

    // If it's just formatting (date/currency), no need for tooltip of raw value usually, 
    // unless strictly requested. Plan says "displaying raw IDs in tooltips".
    // For Dates/Currency, raw value might be timestamp which is useful but maybe not critical.
    // For IDs (ledger, account), definitely need tooltip.

    const isIdType = !["date", "datetime", "currency", "status"].includes(type);

    if (isIdType) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className={`cursor-help border-b border-dotted border-muted-foreground/50 ${className}`}>
                            {data.formatted}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-mono text-xs">Raw ID: {data.raw}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return <span className={className}>{data.formatted}</span>;
}
