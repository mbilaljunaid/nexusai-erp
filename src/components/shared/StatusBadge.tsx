import { Badge } from "@/components/ui/badge";
import { getStatusVariant, formatStatusLabel } from "@/lib/statusUtils";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    /** The raw status string from the data model (e.g. "ACTIVE", "in_progress") */
    status: string | null | undefined;
    /** Override the display label. Defaults to auto-formatted status. */
    label?: string;
    /** Additional Tailwind classes to pass through to the underlying Badge */
    className?: string;
}

// StatusBadge — renders a Shadcn <Badge> with the correct semantic variant
// for the given status string. Replaces all local getStatus/getColor helpers.
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
    const variant = getStatusVariant(status);
    const displayLabel = label ?? formatStatusLabel(status);

    return (
        <Badge variant={variant} className={cn(className)}>
            {displayLabel}
        </Badge>
    );
}
