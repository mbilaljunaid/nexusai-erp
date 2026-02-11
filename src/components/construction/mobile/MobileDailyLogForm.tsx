import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Users, Clock, CloudRain, ThermometerSun, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DailyLogEntry {
    date: string;
    projectId: string;
    weather: {
        condition: string;
        temperature: number;
        precipitation: boolean;
    };
    workforce: {
        contractors: number;
        subcontractors: number;
        visitors: number;
    };
    workPerformed: string;
    equipment: string;
    materials: string;
    issues: string;
    photos: File[];
    location?: {
        latitude: number;
        longitude: number;
    };
}

interface MobileDailyLogFormProps {
    projectId: string;
    onSubmit?: (entry: DailyLogEntry) => void;
    onCancel?: () => void;
}

export function MobileDailyLogForm({ projectId, onSubmit, onCancel }: MobileDailyLogFormProps) {
    const { toast } = useToast();
    const [photos, setPhotos] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const handlePhotoCapture = async () => {
        // In production, this would use the device camera
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment"; // Use rear camera on mobile
        input.multiple = true;

        input.onchange = (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            setPhotos(prev => [...prev, ...files]);
            toast({ title: "Photos Added", description: `${files.length} photo(s) added to log entry.` });
        };

        input.click();
    };

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    toast({ title: "Location Captured", description: "GPS coordinates added to log." });
                },
                (error) => {
                    toast({
                        title: "Location Error",
                        description: "Could not get location. Please enable GPS.",
                        variant: "destructive"
                    });
                }
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        const entry: DailyLogEntry = {
            date: formData.get("date") as string,
            projectId,
            weather: {
                condition: formData.get("weather") as string,
                temperature: Number(formData.get("temperature")),
                precipitation: formData.get("precipitation") === "yes"
            },
            workforce: {
                contractors: Number(formData.get("contractors")),
                subcontractors: Number(formData.get("subcontractors")),
                visitors: Number(formData.get("visitors"))
            },
            workPerformed: formData.get("workPerformed") as string,
            equipment: formData.get("equipment") as string,
            materials: formData.get("materials") as string,
            issues: formData.get("issues") as string,
            photos,
            location: location || undefined
        };

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (onSubmit) {
                onSubmit(entry);
            }

            toast({
                title: "Log Entry Saved",
                description: "Daily log submitted successfully."
            });

            // Reset form for next entry
            e.currentTarget.reset();
            setPhotos([]);
            setLocation(null);
        } catch (error) {
            toast({
                title: "Submission Failed",
                description: "Could not save log entry. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
                <div className="container max-w-2xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">Daily Log Entry</h1>
                            <p className="text-sm opacity-90">{new Date().toLocaleDateString()}</p>
                        </div>
                        {onCancel && (
                            <Button variant="ghost" size="icon" onClick={onCancel} className="text-primary-foreground">
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="container max-w-2xl px-4 py-6 space-y-6">
                {/* Date & Time */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Date & Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            type="date"
                            name="date"
                            defaultValue={new Date().toISOString().split("T")[0]}
                            required
                            className="text-base h-12"
                        />
                    </CardContent>
                </Card>

                {/* Weather Conditions */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CloudRain className="h-4 w-4" />
                            Weather Conditions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weather">Condition</Label>
                                <Select name="weather" defaultValue="clear" required>
                                    <SelectTrigger id="weather" className="h-12 text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="clear">Clear</SelectItem>
                                        <SelectItem value="cloudy">Cloudy</SelectItem>
                                        <SelectItem value="rain">Rain</SelectItem>
                                        <SelectItem value="snow">Snow</SelectItem>
                                        <SelectItem value="wind">Windy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="temperature">Temp (°F)</Label>
                                <Input
                                    type="number"
                                    id="temperature"
                                    name="temperature"
                                    placeholder="72"
                                    className="text-base h-12"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="precipitation">Precipitation?</Label>
                            <Select name="precipitation" defaultValue="no">
                                <SelectTrigger id="precipitation" className="h-12 text-base">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="yes">Yes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Workforce */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Workforce on Site
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="contractors" className="text-xs">Contractors</Label>
                                <Input
                                    type="number"
                                    id="contractors"
                                    name="contractors"
                                    placeholder="0"
                                    min="0"
                                    className="text-base h-12 text-center"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subcontractors" className="text-xs">Subs</Label>
                                <Input
                                    type="number"
                                    id="subcontractors"
                                    name="subcontractors"
                                    placeholder="0"
                                    min="0"
                                    className="text-base h-12 text-center"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="visitors" className="text-xs">Visitors</Label>
                                <Input
                                    type="number"
                                    id="visitors"
                                    name="visitors"
                                    placeholder="0"
                                    min="0"
                                    className="text-base h-12 text-center"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Work Performed */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Work Performed Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            name="workPerformed"
                            placeholder="Describe the work completed today..."
                            rows={4}
                            className="text-base resize-none"
                            required
                        />
                    </CardContent>
                </Card>

                {/* Equipment Used */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Equipment Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            name="equipment"
                            placeholder="List equipment and machinery used..."
                            rows={3}
                            className="text-base resize-none"
                        />
                    </CardContent>
                </Card>

                {/* Materials Delivered */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Materials Delivered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            name="materials"
                            placeholder="List materials received today..."
                            rows={3}
                            className="text-base resize-none"
                        />
                    </CardContent>
                </Card>

                {/* Issues & Delays */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Issues & Delays</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            name="issues"
                            placeholder="Note any problems, delays, or safety concerns..."
                            rows={3}
                            className="text-base resize-none"
                        />
                    </CardContent>
                </Card>

                {/* Photos & Location */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Attachments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-14 text-base"
                                onClick={handlePhotoCapture}
                            >
                                <Camera className="h-5 w-5 mr-2" />
                                Add Photos ({photos.length})
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "h-14 text-base",
                                    location && "bg-green-50 border-green-500"
                                )}
                                onClick={handleGetLocation}
                            >
                                <MapPin className={cn("h-5 w-5 mr-2", location && "text-green-600")} />
                                {location ? "Location Set" : "Get Location"}
                            </Button>
                        </div>
                        {photos.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                                {photos.map((photo, index) => (
                                    <div key={index} className="flex items-center justify-between py-1">
                                        <span className="truncate">{photo.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Button - Fixed at bottom */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
                    <div className="container max-w-2xl">
                        <Button
                            type="submit"
                            className="w-full h-14 text-base font-semibold"
                            disabled={isSubmitting}
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {isSubmitting ? "Saving..." : "Save Daily Log"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
