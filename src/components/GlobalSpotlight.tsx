import * as React from "react";
import { useLocation } from "wouter";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    LayoutDashboard,
    FileText,
    Briefcase,
    Users,
    DollarSign
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

export function GlobalSpotlight() {
    const [open, setOpen] = React.useState(false);
    const [location, setLocation] = useLocation();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => setLocation("/"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setLocation("/gl/journals"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Journals</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setLocation("/finance/ap/invoices"))}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>AP Invoices</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Modules">
                    <CommandItem onSelect={() => runCommand(() => setLocation("/finance"))}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Finance</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setLocation("/crm"))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>CRM</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setLocation("/projects"))}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Projects</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runCommand(() => setLocation("/settings/profile"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setLocation("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
