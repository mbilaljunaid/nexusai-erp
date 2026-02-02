
import React, { useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, addDays, parseISO } from 'date-fns';

interface TimesheetGridProps {
    startDate: string; // ISO Date YYYY-MM-DD
    entries: any[];
    onEntryChange: (date: string, type: string, minutes: number) => void;
    readOnly?: boolean;
}

const DAYS = [
    { label: "Mon", offset: 0 },
    { label: "Tue", offset: 1 },
    { label: "Wed", offset: 2 },
    { label: "Thu", offset: 3 },
    { label: "Fri", offset: 4 },
    { label: "Sat", offset: 5 },
    { label: "Sun", offset: 6 }
];

const TIME_TYPES = ["REGULAR", "OVERTIME", "VACATION", "SICK"];

export const TimesheetGrid: React.FC<TimesheetGridProps> = ({ startDate, entries, onEntryChange, readOnly }) => {

    // Memoize the map of Date+Type -> Minutes
    const entryMap = useMemo(() => {
        const map = new Map<string, number>();
        entries.forEach(e => {
            const key = `${e.date}_${e.timeType}`;
            map.set(key, e.durationMinutes);
        });
        return map;
    }, [entries]);

    const getMinutes = (offset: number, type: string) => {
        const dateStr = format(addDays(parseISO(startDate), offset), 'yyyy-MM-dd');
        return entryMap.get(`${dateStr}_${type}`) || 0;
    };

    const getHours = (minutes: number) => (minutes / 60).toFixed(2);
    const getHoursValue = (minutes: number) => minutes === 0 ? '' : (minutes / 60).toString(); // Blank if 0 for cleaner UI

    const handleInputChange = (offset: number, type: string, value: string) => {
        const num = parseFloat(value);
        const minutes = isNaN(num) ? 0 : Math.round(num * 60);
        const dateStr = format(addDays(parseISO(startDate), offset), 'yyyy-MM-dd');
        onEntryChange(dateStr, type, minutes);
    };

    // Calculate Totals
    const rowTotals = TIME_TYPES.map(type => {
        let sum = 0;
        DAYS.forEach(d => sum += getMinutes(d.offset, type));
        return sum;
    });

    const colTotals = DAYS.map(d => {
        let sum = 0;
        TIME_TYPES.forEach(t => sum += getMinutes(d.offset, t));
        return sum;
    });

    const grandTotal = useMemo(() => {
        return entries.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    }, [entries]);



    return (
        <>
            {/* DESKTOP VIEW */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Time Type</TableHead>
                            {DAYS.map(d => (
                                <TableHead key={d.label} className="text-center text-xs">
                                    <div>{d.label}</div>
                                    <div className="text-muted-foreground font-normal">
                                        {format(addDays(parseISO(startDate), d.offset), 'd')}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-right w-[100px]">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {TIME_TYPES.map((type, idx) => (
                            <TableRow key={type}>
                                <TableCell className="font-medium bg-muted/20">
                                    <Badge variant="secondary" className="w-full justify-center">{type}</Badge>
                                </TableCell>
                                {DAYS.map(day => (
                                    <TableCell key={day.label} className="p-1">
                                        <Input
                                            type="number"
                                            step="0.25"
                                            className={`h-9 text-center border-none focus-visible:ring-1 ${getMinutes(day.offset, type) > 0 ? "bg-accent/20" : ""}`}
                                            placeholder="-"
                                            min={0}
                                            max={24}
                                            disabled={readOnly}
                                            value={getHoursValue(getMinutes(day.offset, type))}
                                            onChange={(e) => handleInputChange(day.offset, type, e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </TableCell>
                                ))}
                                <TableCell className="text-right font-medium">
                                    {getHours(rowTotals[idx])}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-muted font-bold border-t-2">
                            <TableCell>Daily Total</TableCell>
                            {colTotals.map((total, i) => (
                                <TableCell key={i} className={`text-center ${total > 480 ? "text-red-600" : ""}`}>
                                    {getHours(total)}
                                </TableCell>
                            ))}
                            <TableCell className="text-right text-lg">{getHours(grandTotal)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* MOBILE VIEW (CARDS) */}
            <div className="md:hidden space-y-4">
                {DAYS.map((day, dayIdx) => (
                    <div key={day.label} className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <div>
                                <span className="font-bold text-lg">{format(addDays(parseISO(startDate), day.offset), 'EEEE')}</span>
                                <span className="text-muted-foreground text-sm ml-2">{format(addDays(parseISO(startDate), day.offset), 'MMM d')}</span>
                            </div>
                            <Badge variant={colTotals[dayIdx] > 0 ? "default" : "outline"}>
                                {getHours(colTotals[dayIdx])} hrs
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {TIME_TYPES.map((type) => (
                                <div key={type} className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium w-24 text-muted-foreground">{type}</span>
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.25"
                                        className={`h-12 text-right text-lg ${getMinutes(day.offset, type) > 0 ? "bg-accent/10 font-bold" : ""}`}
                                        placeholder="0"
                                        min={0}
                                        max={24}
                                        disabled={readOnly}
                                        value={getHoursValue(getMinutes(day.offset, type))}
                                        onChange={(e) => handleInputChange(day.offset, type, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between items-center text-lg font-bold">
                    <span>Weekly Total:</span>
                    <span>{getHours(grandTotal)} hrs</span>
                </div>
            </div>
        </>
    );
};
