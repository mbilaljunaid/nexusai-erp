import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DatePickerProps {
    /** ISO date string in YYYY-MM-DD format, or empty string / undefined */
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}

/**
 * Standalone date picker backed by Shadcn Calendar.
 * Works as a drop-in for controlled inputs that store dates as YYYY-MM-DD strings.
 *
 * Usage:
 *   <DatePicker value={dateStr} onChange={setDateStr} placeholder="Pick a date" />
 */
export function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    disabled = false,
    className,
    'aria-label': ariaLabel,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // Convert YYYY-MM-DD string → Date (or undefined)
    const selected: Date | undefined = React.useMemo(() => {
        if (!value) return undefined;
        const parsed = parse(value, 'yyyy-MM-dd', new Date());
        return isValid(parsed) ? parsed : undefined;
    }, [value]);

    const handleSelect = (day: Date | undefined) => {
        onChange(day ? format(day, 'yyyy-MM-dd') : '');
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    aria-label={ariaLabel ?? placeholder}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !selected && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {selected ? format(selected, 'MMM d, yyyy') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
