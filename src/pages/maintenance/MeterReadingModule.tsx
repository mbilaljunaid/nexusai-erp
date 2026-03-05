import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { meterService, type Meter as MeterType, type MeterReading as MeterReadingType } from "@/services/maintenance.service";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Gauge,
    TrendingUp,
    AlertTriangle,
    Plus,
    Camera,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Local types (differ from API types - see mappers below)
interface Meter {
    id: string;
    assetId: string;
    assetName: string;
    meterName: string;
    uom: string;
    currentValue: number;
    lastReadingDate: string;
    readingFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ON_DEMAND";
    lowThreshold?: number;
    highThreshold?: number;
    pmTriggerValue?: number;
    status: "NORMAL" | "WARNING" | "CRITICAL" | "OVERDUE";
}

interface MeterReading {
    id: string;
    meterId: string;
    value: number;
    timestamp: string;
    source: "MANUAL" | "AUTOMATIC" | "MOBILE";
    readBy?: string;
    notes?: string;
}

// Mapper functions: API types → Component types
const mapApiMeter = (apiMeter: MeterType): Meter => ({
    id: apiMeter.id,
    assetId: apiMeter.assetId,
    assetName: apiMeter.assetName,
    meterName: apiMeter.meterName,
    uom: apiMeter.uom,
    currentValue: apiMeter.currentReading,
    lastReadingDate: apiMeter.lastReadingDate,
    readingFrequency: "WEEKLY", // Default - API doesn't provide this
    highThreshold: apiMeter.criticalThreshold,
    pmTriggerValue: apiMeter.warningThreshold,
    status: apiMeter.status
});

const mapApiReading = (apiReading: MeterReadingType): MeterReading => ({
    id: apiReading.id,
    meterId: apiReading.meterId,
    value: apiReading.readingValue,
    timestamp: apiReading.readingDate,
    source: "MANUAL", // Default - API doesn't provide this field
    readBy: apiReading.readBy,
    notes: apiReading.notes
});

const readingSchema = z.object({
    meterId: z.string().min(1, "Select a meter"),
    value: z.string().min(1, "Reading value is required"),
    notes: z.string().optional(),
    captureLocation: z.boolean().default(true),
});

export function MeterReadingModule() {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
    const [readings, setReadings] = useState<MeterReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<z.infer<typeof readingSchema>>({
        resolver: zodResolver(readingSchema),
        defaultValues: {
            meterId: "",
            value: "",
            notes: "",
            captureLocation: true
        }
    });

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadMeters();
    }, []);

    useEffect(() => {
        if (selectedMeter) {
            loadReadings(selectedMeter.id);
        }
    }, [selectedMeter]);

    const loadMeters = async () => {
        setLoading(true);
        try {
            // ✅ LIVE API CALL - Get meters from service layer
            const apiMeters = await meterService.getMeters();
            setMeters(apiMeters.map(mapApiMeter));
        } catch (error) {
            console.error("Failed to load meters:", error);
            setMeters([]); // Fallback to empty array
        } finally {
            setLoading(false);
        }
    };

    const loadReadings = async (meterId: string) => {
        try {
            // ✅ LIVE API CALL - Get meter readings from service layer
            const apiReadings = await meterService.getMeterReadings(meterId);
            setReadings(apiReadings.map(mapApiReading));
        } catch (error) {
            console.error("Failed to load readings:", error);
            setReadings([]); // Fallback to empty array
        }
    };

    const handleSubmitReading = async (data: z.infer<typeof readingSchema>) => {
        setSubmitting(true);

        try {
            // Capture GPS location if requested
            let gpsLocation;
            if (data.captureLocation && navigator.geolocation) {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                gpsLocation = `${position.coords.latitude},${position.coords.longitude}`;
            }

            // ✅ LIVE API CALL - Submit meter reading
            await meterService.submitReading({
                meterId: data.meterId,
                readingValue: parseFloat(data.value),
                readingDate: new Date().toISOString(),
                notes: data.notes || undefined,
                gpsLocation
            });

            // Refresh meters and readings
            await loadMeters();
            if (selectedMeter) {
                await loadReadings(selectedMeter.id);
            }

            // Reset form
            form.reset();
        } catch (error) {
            console.error("Failed to submit reading:", error);
            // TODO: Show error toast
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (status: Meter["status"]) => {
        switch (status) {
            case "CRITICAL":
                return { icon: XCircle, color: "text-red-600", bg: "bg-red-100", badge: "bg-red-100 text-red-800" };
            case "WARNING":
                return { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100", badge: "bg-orange-100 text-orange-800" };
            case "OVERDUE":
                return { icon: Clock, color: "text-purple-600", bg: "bg-purple-100", badge: "bg-purple-100 text-purple-800" };
            default:
                return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", badge: "bg-green-100 text-green-800" };
        }
    };

    const filteredMeters = meters.filter(m => {
        if (statusFilter !== "all" && m.status !== statusFilter) return false;
        if (searchTerm && !m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !m.meterName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const chartData = readings.map(r => ({
        date: format(new Date(r.timestamp), "MMM dd"),
        value: r.value
    })).reverse();

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Meter Reading</h1>
                <p className="text-muted-foreground">Track equipment meters and trigger condition-based maintenance</p>
            </div>

            <Tabs defaultValue="meters" className="w-full">
                <TabsList>
                    <TabsTrigger value="meters">Meter List</TabsTrigger>
                    <TabsTrigger value="record">Record Reading</TabsTrigger>
                    {selectedMeter && <TabsTrigger value="history">Reading History</TabsTrigger>}
                </TabsList>

                {/* Meter List Tab */}
                <TabsContent value="meters" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Search asset or meter..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="NORMAL">Normal</SelectItem>
                                        <SelectItem value="WARNING">Warning</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meter Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredMeters.map(meter => {
                            const statusConfig = getStatusConfig(meter.status);
                            const StatusIcon = statusConfig.icon;
                            const percentToThreshold = meter.highThreshold
                                ? (meter.currentValue / meter.highThreshold) * 100
                                : 0;

                            return (
                                <Card
                                    key={meter.id}
                                    className={cn(
                                        "border-2 cursor-pointer transition-all hover:border-primary",
                                        selectedMeter?.id === meter.id && "border-primary bg-primary/5"
                                    )}
                                    onClick={() => setSelectedMeter(meter)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-1">{meter.assetName}</h3>
                                                    <p className="text-sm text-muted-foreground">{meter.meterName}</p>
                                                </div>
                                                <Badge variant="outline" className={statusConfig.badge}>
                                                    {meter.status}
                                                </Badge>
                                            </div>

                                            {/* Current Value */}
                                            <div className="flex items-baseline gap-2">
                                                <Gauge className={cn("h-5 w-5", statusConfig.color)} />
                                                <span className="text-3xl font-bold">{meter.currentValue.toLocaleString()}</span>
                                                <span className="text-muted-foreground">{meter.uom}</span>
                                            </div>

                                            {/* Thresholds */}
                                            {meter.highThreshold && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Threshold Progress</span>
                                                        <span className={cn("font-medium", statusConfig.color)}>
                                                            {percentToThreshold.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                                                        <svg width={`${Math.min(percentToThreshold, 100)}%`} height="100%" className="transition-all">
                                                            <rect width="100%" height="100%" className={cn(statusConfig.bg.replace("bg-", "fill-"))} />
                                                        </svg>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>0</span>
                                                        {meter.pmTriggerValue && (
                                                            <span>PM: {meter.pmTriggerValue.toLocaleString()}</span>
                                                        )}
                                                        <span>Max: {meter.highThreshold.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Last Reading */}
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Last reading: {format(new Date(meter.lastReadingDate), "MMM dd, yyyy HH:mm")}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Record Reading Tab */}
                <TabsContent value="record">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Record Meter Reading</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmitReading)} className="space-y-4">
                                    <FormField control={form.control} name="meterId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Meter</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose meter..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {meters.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>
                                                            {m.assetName} - {m.meterName} ({m.currentValue} {m.uom})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="value" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reading Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="Enter current meter value..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="notes" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Any additional notes..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="captureLocation" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    id="location"
                                                    title="Capture GPS location"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="h-4 w-4"
                                                />
                                            </FormControl>
                                            <FormLabel htmlFor="location" className="text-sm flex items-center gap-1 font-normal cursor-pointer">
                                                <MapPin className="h-4 w-4" />
                                                Capture GPS location
                                            </FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={submitting} className="flex-1">
                                            {submitting ? "Submitting..." : "Submit Reading"}
                                        </Button>
                                        <Button type="button" variant="outline" className="px-8">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Photo
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reading History Tab */}
                {selectedMeter && (
                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {selectedMeter.assetName} - {selectedMeter.meterName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                        {selectedMeter.pmTriggerValue && (
                                            <ReferenceLine
                                                y={selectedMeter.pmTriggerValue}
                                                stroke="#f59e0b"
                                                strokeDasharray="5 5"
                                                label="PM Trigger"
                                            />
                                        )}
                                        {selectedMeter.highThreshold && (
                                            <ReferenceLine
                                                y={selectedMeter.highThreshold}
                                                stroke="#ef4444"
                                                strokeDasharray="5 5"
                                                label="Max Threshold"
                                            />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Reading History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {readings.map(reading => (
                                        <div key={reading.id} className="flex items-center justify-between p-3 border rounded">
                                            <div>
                                                <div className="font-medium">{reading.value.toLocaleString()} {selectedMeter.uom}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {format(new Date(reading.timestamp), "MMM dd, yyyy HH:mm")}
                                                    {reading.readBy && ` • ${reading.readBy}`}
                                                </div>
                                            </div>
                                            <Badge variant="outline">{reading.source}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

export default MeterReadingModule;
