import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Calendar, CloudRain, Sun, Cloud, Users, HardHat, Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyLogFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    onSubmit: (data: any) => Promise<void>;
}

export function DailyLogForm({ open, onOpenChange, projectId, onSubmit }: DailyLogFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [laborLines, setLaborLines] = useState<any[]>([{ craft: "", hours: "", workers: "" }]);
    const [equipmentLines, setEquipmentLines] = useState<any[]>([{ equipment: "", hours: "" }]);

    const weatherIcons: Record<string, any> = {
        "sunny": Sun,
        "cloudy": Cloud,
        "rainy": CloudRain
    };

    const addLaborLine = () => {
        setLaborLines([...laborLines, { craft: "", hours: "", workers: "" }]);
    };

    const removeLaborLine = (index: number) => {
        setLaborLines(laborLines.filter((_, i) => i !== index));
    };

    const addEquipmentLine = () => {
        setEquipmentLines([...equipmentLines, { equipment: "", hours: "" }]);
    };

    const removeEquipmentLine = (index: number) => {
        setEquipmentLines(equipmentLines.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            projectId,
            logDate: formData.get("logDate"),
            weather: formData.get("weather"),
            temperature: formData.get("temperature"),
            workPerformed: formData.get("workPerformed"),
            notes: formData.get("notes"),
            safetyIncidents: formData.get("safetyIncidents"),
            laborLines: laborLines.filter(l => l.craft && l.hours),
            equipmentLines: equipmentLines.filter(e => e.equipment && e.hours)
        };

        try {
            await onSubmit(data);
            toast({ title: "Daily Log Created", description: "Log entry has been saved successfully." });
            onOpenChange(false);
            // Reset form
            setLaborLines([{ craft: "", hours: "", workers: "" }]);
            setEquipmentLines([{ equipment: "", hours: "" }]);
        } catch (error) {
            toast({ title: "Error", description: "Failed to create daily log.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Create Daily Log
                    </DialogTitle>
                    <DialogDescription>
                        Record daily site activities, weather conditions, labor, and equipment usage.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Date & Weather */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Date & Weather Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="logDate">Log Date *</Label>
                                    <Input
                                        id="logDate"
                                        name="logDate"
                                        type="date"
                                        required
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weather">Weather *</Label>
                                    <Select name="weather" required>
                                        <SelectTrigger id="weather">
                                            <SelectValue placeholder="Select weather" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sunny">☀️ Sunny</SelectItem>
                                            <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                                            <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                                            <SelectItem value="snow">❄️ Snow</SelectItem>
                                            <SelectItem value="windy">💨 Windy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="temperature">Temperature (°F)</Label>
                                    <Input
                                        id="temperature"
                                        name="temperature"
                                        type="number"
                                        placeholder="70"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Labor Lines */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-row justify-between items-center">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Labor
                            </CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={addLaborLine}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Labor
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {laborLines.map((line, index) => (
                                <div key={index} className="flex gap-3 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label>Craft/Trade</Label>
                                        <Input
                                            placeholder="e.g., Carpenter, Electrician"
                                            value={line.craft}
                                            onChange={(e) => {
                                                const newLines = [...laborLines];
                                                newLines[index].craft = e.target.value;
                                                setLaborLines(newLines);
                                            }}
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Label>Hours</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="8"
                                            value={line.hours}
                                            onChange={(e) => {
                                                const newLines = [...laborLines];
                                                newLines[index].hours = e.target.value;
                                                setLaborLines(newLines);
                                            }}
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Label>Workers</Label>
                                        <Input
                                            type="number"
                                            placeholder="4"
                                            value={line.workers}
                                            onChange={(e) => {
                                                const newLines = [...laborLines];
                                                newLines[index].workers = e.target.value;
                                                setLaborLines(newLines);
                                            }}
                                        />
                                    </div>
                                    {laborLines.length > 1 && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeLaborLine(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Equipment Lines */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-row justify-between items-center">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <HardHat className="h-4 w-4" />
                                Equipment
                            </CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={addEquipmentLine}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Equipment
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {equipmentLines.map((line, index) => (
                                <div key={index} className="flex gap-3 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label>Equipment Type</Label>
                                        <Input
                                            placeholder="e.g., Excavator, Crane, Truck"
                                            value={line.equipment}
                                            onChange={(e) => {
                                                const newLines = [...equipmentLines];
                                                newLines[index].equipment = e.target.value;
                                                setEquipmentLines(newLines);
                                            }}
                                        />
                                    </div>
                                    <div className="w-40 space-y-2">
                                        <Label>Hours Used</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="6"
                                            value={line.hours}
                                            onChange={(e) => {
                                                const newLines = [...equipmentLines];
                                                newLines[index].hours = e.target.value;
                                                setEquipmentLines(newLines);
                                            }}
                                        />
                                    </div>
                                    {equipmentLines.length > 1 && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeEquipmentLine(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Work Description */}
                    <div className="space-y-2">
                        <Label htmlFor="workPerformed">Work Performed Today *</Label>
                        <Textarea
                            id="workPerformed"
                            name="workPerformed"
                            placeholder="Describe the work completed today..."
                            rows={4}
                            required
                        />
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Site conditions, delays, visitors, etc..."
                            rows={3}
                        />
                    </div>

                    {/* Safety */}
                    <div className="space-y-2">
                        <Label htmlFor="safetyIncidents">Safety Incidents/Near Misses</Label>
                        <Textarea
                            id="safetyIncidents"
                            name="safetyIncidents"
                            placeholder="Describe any safety incidents or near misses (leave blank if none)"
                            rows={2}
                        />
                    </div>

                    <Separator />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Saving..." : "Save Daily Log"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
