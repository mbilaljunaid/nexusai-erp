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

interface VendorPickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function VendorPicker({ value, onChange, placeholder = "Select vendor..." }: VendorPickerProps) {
    const [open, setOpen] = useState(false);

    const { data: vendors = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/ap/suppliers"],
        queryFn: () => fetch("/api/ap/suppliers").then(r => r.json()),
    });

    const selectedVendor = vendors.find((v) => String(v.id) === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {selectedVendor ? selectedVendor.name : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search vendors..." />
                    <CommandList>
                        <CommandEmpty>No vendor found.</CommandEmpty>
                        <CommandGroup>
                            {vendors.map((vendor) => (
                                <CommandItem
                                    key={vendor.id}
                                    value={vendor.name}
                                    onSelect={() => {
                                        onChange(String(vendor.id));
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === String(vendor.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div>
                                        <p>{vendor.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{vendor.supplierNumber}</p>
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
