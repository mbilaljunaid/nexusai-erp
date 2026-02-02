import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface PurchaseOrderPickerProps {
    value: string;
    supplierId?: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function PurchaseOrderPicker({ value, supplierId, onChange, placeholder = "Select PO..." }: PurchaseOrderPickerProps) {
    const [open, setOpen] = useState(false);

    const { data: pos = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/procurement/purchase-orders", supplierId],
        queryFn: () => fetch("/api/procurement/purchase-orders" + (supplierId ? `?supplierId=${supplierId}` : "")).then(r => r.json()),
    });

    const selectedPO = pos.find((p) => String(p.id) === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {selectedPO ? selectedPO.orderNumber : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search POs..." />
                    <CommandList>
                        <CommandEmpty>No PO found.</CommandEmpty>
                        <CommandGroup>
                            {pos.map((po) => (
                                <CommandItem
                                    key={po.id}
                                    value={po.orderNumber}
                                    onSelect={() => {
                                        onChange(String(po.id));
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === String(po.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div>
                                        <p>{po.orderNumber}</p>
                                        <p className="text-[10px] text-muted-foreground">${po.totalAmount} - {po.status}</p>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
