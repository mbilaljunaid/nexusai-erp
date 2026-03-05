import * as React from 'react';
import { DatePicker, type DatePickerProps } from '@/components/ui/DatePicker';

export interface DatePickerFieldProps
    extends Omit<DatePickerProps, 'onChange'> {
    /** Called with a YYYY-MM-DD string — matches react-hook-form field.onChange signature */
    onChange: (value: string) => void;
    /** Called on blur — forwards react-hook-form field.onBlur */
    onBlur?: () => void;
    name?: string;
}

/**
 * React-hook-form compatible date picker.
 * Spread a form field object directly: <DatePickerField {...field} />
 *
 * Usage inside FormControl:
 *   <FormField
 *     control={form.control}
 *     name="startDate"
 *     render={({ field }) => (
 *       <FormItem>
 *         <FormLabel>Start Date</FormLabel>
 *         <FormControl>
 *           <DatePickerField {...field} placeholder="Select date" />
 *         </FormControl>
 *         <FormMessage />
 *       </FormItem>
 *     )}
 *   />
 */
export function DatePickerField({
    value,
    onChange,
    onBlur,
    name,
    placeholder,
    disabled,
    className,
    'aria-label': ariaLabel,
}: DatePickerFieldProps) {
    const handleChange = (dateStr: string) => {
        onChange(dateStr);
        // Notify react-hook-form that the field has been interacted with
        onBlur?.();
    };

    return (
        <DatePicker
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            aria-label={ariaLabel ?? name}
        />
    );
}
