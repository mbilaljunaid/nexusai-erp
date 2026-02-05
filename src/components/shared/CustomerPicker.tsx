
import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";

interface CustomerPickerProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

export function CustomerPicker({ value, onChange, className }: CustomerPickerProps) {
    const [open, setOpen] = React.useState(false);

    const { data: customers = [] } = useQuery<any[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            const res = await fetch('/api/ar/customers');
            if (!res.ok) throw new Error("Failed to fetch customers");
            return res.json();
        }
    });

    const selectedCustomer = customers.find((c) => c.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedCustomer ? selectedCustomer.name : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search customers..." />
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                        {customers.map((customer) => (
                            <CommandItem
                                key={customer.id}
                                value={customer.name}
                                onSelect={() => {
                                    onChange(customer.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === customer.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {customer.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
