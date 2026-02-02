import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { useDebounce } from "@/hooks/use-debounce";

interface VendorPickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function VendorPicker({ value, onChange, placeholder = "Select vendor..." }: VendorPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const { data, isLoading } = useQuery<any>({
        queryKey: ["/api/procurement/suppliers", debouncedSearch],
        queryFn: () => fetch(`/api/procurement/suppliers?limit=20&search=${debouncedSearch}`).then(r => r.json()),
        // Keep previous data while fetching new data to avoid flickering
        placeholderData: (previousData: any) => previousData,
    });

    const vendors = Array.isArray(data) ? data : (data?.data || []);

    const selectedVendor = vendors.find((v: any) => String(v.id) === value)
        || (value ? { name: "Loading...", id: value, supplierName: "Selected Vendor" } : null);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {selectedVendor ? (selectedVendor.supplierName || selectedVendor.name) : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search vendors..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isLoading ? "Loading..." : "No vendor found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {vendors.map((vendor: any) => (
                                <CommandItem
                                    key={vendor.id}
                                    value={String(vendor.id)}
                                    // Keywords are less relevant when server filtering, but good practice
                                    keywords={[vendor.supplierName]}
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
                                        <p>{vendor.supplierName || vendor.name}</p>
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
