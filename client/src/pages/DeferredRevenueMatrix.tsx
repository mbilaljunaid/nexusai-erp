import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar as CalendarIcon, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export default function DeferredRevenueMatrix() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const { data: matrixData, isLoading, error } = useQuery({
        queryKey: ['deferred-revenue', date],
        queryFn: async () => {
            const dateStr = date ? date.toISOString() : new Date().toISOString();
            const res = await fetch(`/api/revenue/reporting/deferred?date=${dateStr}`);
            if (!res.ok) throw new Error("Failed to fetch deferred revenue data");
            return res.json();
        }
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        Deferred Revenue Matrix
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Track unearned revenue liability as of a specific date.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">As of Date:</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-[240px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load deferred revenue data. Please try again.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Bookings Card */}
                <Card className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">
                            Total Allocated Amount
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-[100px]" /> : (
                            <>
                                <div className="text-2xl font-bold">
                                    ${matrixData?.totalBookings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total value of all active contracts
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Total Recognized Card */}
                <Card className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">
                            Recognized Revenue
                        </CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-[100px]" /> : (
                            <>
                                <div className="text-2xl font-bold">
                                    ${matrixData?.totalRecognized?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Revenue recognized to date
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Deferred Balance Card */}
                <Card className="shadow-md border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow bg-orange-50/50 dark:bg-orange-950/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">
                            Deferred Revenue Liability
                        </CardTitle>
                        <Activity className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-[100px]" /> : (
                            <>
                                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                                    ${matrixData?.deferredBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Remaining unearned revenue
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Detailed Breakdown</CardTitle>
                    <CardDescription>
                        Contract-level detail for the deferred revenue balance (Top 10 by value)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-12 bg-muted/20 border-2 border-dashed rounded-lg">
                        <div className="text-center text-muted-foreground">
                            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Detailed contract breakdown is coming in the next iteration.</p>
                            <p className="text-sm">This will allow you to drill down into specific contract liabilities.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
