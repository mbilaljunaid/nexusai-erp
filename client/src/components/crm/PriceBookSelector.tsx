import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PriceBook {
    id: string;
    name: string;
    description: string;
    isStandard: number;
}

interface PriceBookSelectorProps {
    value?: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function PriceBookSelector({ value, onChange, disabled }: PriceBookSelectorProps) {
    const { data: priceBooks = [], isLoading } = useQuery<PriceBook[]>({
        queryKey: ["/api/crm/price-books"],
    });

    return (
        <div className="space-y-2">
            <Label>Price Book</Label>
            <Select
                value={value || ""}
                onValueChange={onChange}
                disabled={disabled || isLoading}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Price Book" />
                </SelectTrigger>
                <SelectContent>
                    {priceBooks.map((pb) => (
                        <SelectItem key={pb.id} value={pb.id}>
                            {pb.name} {pb.isStandard ? "(Standard)" : ""}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
