import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    actions: Array<{
        label: string;
        onClick: () => void;
        variant?: 'default' | 'destructive';
    }>;
}

export function BulkActionBar({ selectedCount, onClear, actions }: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
            <span className="font-medium">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                        Bulk Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {actions.map((action, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={action.onClick}
                            className={action.variant === 'destructive' ? 'text-destructive' : ''}
                        >
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-primary-foreground hover:text-primary-foreground/80"
            >
                <X className="w-4 h-4 mr-1" />
                Clear
            </Button>
        </div>
    );
}
