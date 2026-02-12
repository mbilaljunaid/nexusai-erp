import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Calculator,
    MapPin,
    Car,
    Calendar,
    DollarSign,
    Coffee,
    Utensils,
    Moon,
    Copy,
    CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MILEAGE_RATES = {
    BUSINESS: { rate: 0.67, label: "Business (IRS 2026)" },
    MEDICAL: { rate: 0.21, label: "Medical/Moving" },
    CHARITY: { rate: 0.14, label: "Charitable" }
};

const PER_DIEM_RATES = {
    "New York, NY": { breakfast: 15, lunch: 25, dinner: 40, lodging: 200 },
    "San Francisco, CA": { breakfast: 18, lunch: 28, dinner: 45, lodging: 250 },
    "Chicago, IL": { breakfast: 12, lunch: 20, dinner: 35, lodging: 180 },
    "Boston, MA": { breakfast: 14, lunch: 22, dinner: 38, lodging: 190 },
    "Los Angeles, CA": { breakfast: 16, lunch: 24, dinner: 42, lodging: 220 },
    "Standard (Domestic)": { breakfast: 10, lunch: 15, dinner: 25, lodging: 100 }
};

export default function ExpenseCalculators() {
    const { toast } = useToast();

    // Mileage Calculator State
    const [mileageType, setMileageType] = useState<keyof typeof MILEAGE_RATES>("BUSINESS");
    const [distance, setDistance] = useState("");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [mileageResult, setMileageResult] = useState<number | null>(null);

    // Per Diem Calculator State
    const [location, setLocation] = useState<keyof typeof PER_DIEM_RATES>("Standard (Domestic)");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [meals, setMeals] = useState({ breakfast: true, lunch: true, dinner: true });
    const [perDiemResult, setPerDiemResult] = useState<any>(null);

    const calculateMileage = () => {
        const dist = parseFloat(distance);
        if (isNaN(dist) || dist <= 0) {
            toast({
                title: "Invalid Distance",
                description: "Please enter a valid distance in miles",
                variant: "destructive"
            });
            return;
        }

        const rate = MILEAGE_RATES[mileageType].rate;
        const total = dist * rate;
        setMileageResult(total);
    };

    const calculatePerDiem = () => {
        if (!startDate || !endDate) {
            toast({
                title: "Invalid Dates",
                description: "Please select both start and end dates",
                variant: "destructive"
            });
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) {
            toast({
                title: "Invalid Date Range",
                description: "End date must be after start date",
                variant: "destructive"
            });
            return;
        }

        const rates = PER_DIEM_RATES[location];
        let mealTotal = 0;

        if (meals.breakfast) mealTotal += rates.breakfast * days;
        if (meals.lunch) mealTotal += rates.lunch * days;
        if (meals.dinner) mealTotal += rates.dinner * days;

        const lodgingTotal = rates.lodging * (days - 1); // Usually lodging is days - 1

        setPerDiemResult({
            days,
            mealTotal,
            lodgingTotal,
            total: mealTotal + lodgingTotal,
            breakdown: {
                breakfast: meals.breakfast ? rates.breakfast * days : 0,
                lunch: meals.lunch ? rates.lunch * days : 0,
                dinner: meals.dinner ? rates.dinner * days : 0,
                lodging: lodgingTotal
            }
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: `${label} copied to clipboard`,
        });
    };

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Expense Calculators</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Auto-calculate mileage reimbursement and per diem allowances
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mileage Calculator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Mileage Reimbursement Calculator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Mileage Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(MILEAGE_RATES).map(([key, { label, rate }]) => (
                                    <Button
                                        key={key}
                                        variant={mileageType === key ? "default" : "outline"}
                                        onClick={() => setMileageType(key as keyof typeof MILEAGE_RATES)}
                                        className="h-auto flex flex-col items-start p-3"
                                    >
                                        <span className="text-xs font-bold">{label.split("(")[0]}</span>
                                        <span className="text-[10px] text-muted-foreground">${rate}/mi</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Origin
                                </label>
                                <Input
                                    placeholder="Starting location"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Destination
                                </label>
                                <Input
                                    placeholder="Ending location"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Distance (miles)</label>
                            <Input
                                type="number"
                                placeholder="e.g., 125.5"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                step="0.1"
                            />
                        </div>

                        <Button onClick={calculateMileage} className="w-full">
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculate Mileage
                        </Button>

                        {mileageResult !== null && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 animate-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-green-900">Total Reimbursement</p>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <p className="text-3xl font-bold text-green-900 font-mono">
                                        ${mileageResult.toFixed(2)}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(mileageResult.toFixed(2), "Amount")}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="text-xs text-green-700 space-y-1">
                                    <p>{distance} miles × ${MILEAGE_RATES[mileageType].rate}/mi</p>
                                    {origin && destination && (
                                        <p className="text-[10px]">{origin} → {destination}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Per Diem Calculator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="h-5 w-5" />
                            Per Diem Allowance Calculator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Travel Location</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={location}
                                onChange={(e) => setLocation(e.target.value as keyof typeof PER_DIEM_RATES)}
                            >
                                {Object.keys(PER_DIEM_RATES).map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Start Date
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    End Date
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Meals Included</label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={meals.breakfast ? "default" : "outline"}
                                    onClick={() => setMeals({ ...meals, breakfast: !meals.breakfast })}
                                    className="h-auto flex flex-col items-center p-3"
                                    size="sm"
                                >
                                    <Coffee className="h-4 w-4 mb-1" />
                                    <span className="text-xs">Breakfast</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        ${PER_DIEM_RATES[location].breakfast}/day
                                    </span>
                                </Button>
                                <Button
                                    variant={meals.lunch ? "default" : "outline"}
                                    onClick={() => setMeals({ ...meals, lunch: !meals.lunch })}
                                    className="h-auto flex flex-col items-center p-3"
                                    size="sm"
                                >
                                    <Utensils className="h-4 w-4 mb-1" />
                                    <span className="text-xs">Lunch</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        ${PER_DIEM_RATES[location].lunch}/day
                                    </span>
                                </Button>
                                <Button
                                    variant={meals.dinner ? "default" : "outline"}
                                    onClick={() => setMeals({ ...meals, dinner: !meals.dinner })}
                                    className="h-auto flex flex-col items-center p-3"
                                    size="sm"
                                >
                                    <Moon className="h-4 w-4 mb-1" />
                                    <span className="text-xs">Dinner</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        ${PER_DIEM_RATES[location].dinner}/day
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <Button onClick={calculatePerDiem} className="w-full">
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculate Per Diem
                        </Button>

                        {perDiemResult && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-blue-900">Total Per Diem</p>
                                    <Badge variant="secondary">{perDiemResult.days} days</Badge>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <p className="text-3xl font-bold text-blue-900 font-mono">
                                        ${perDiemResult.total.toFixed(2)}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(perDiemResult.total.toFixed(2), "Amount")}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {perDiemResult.breakdown.breakfast > 0 && (
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-muted-foreground">Breakfast</p>
                                            <p className="font-bold">${perDiemResult.breakdown.breakfast.toFixed(2)}</p>
                                        </div>
                                    )}
                                    {perDiemResult.breakdown.lunch > 0 && (
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-muted-foreground">Lunch</p>
                                            <p className="font-bold">${perDiemResult.breakdown.lunch.toFixed(2)}</p>
                                        </div>
                                    )}
                                    {perDiemResult.breakdown.dinner > 0 && (
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-muted-foreground">Dinner</p>
                                            <p className="font-bold">${perDiemResult.breakdown.dinner.toFixed(2)}</p>
                                        </div>
                                    )}
                                    <div className="bg-white p-2 rounded">
                                        <p className="text-muted-foreground">Lodging</p>
                                        <p className="font-bold">${perDiemResult.breakdown.lodging.toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-blue-700">
                                    Location: {location} • {perDiemResult.days} travel days
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Usage Instructions */}
            <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                    <CardTitle className="text-base">💡 How to Use</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><strong>Mileage:</strong> Enter origin, destination, and distance. The calculator will compute reimbursement based on IRS 2026 rates.</p>
                    <p><strong>Per Diem:</strong> Select location and travel dates. Toggle meal types to calculate daily allowances including lodging.</p>
                    <p><strong>Copy to Clipboard:</strong> Click the copy icon to use amounts when creating expense reports.</p>
                    <p className="text-muted-foreground italic text-xs">These calculators use standard rates. Always verify with your company's expense policy.</p>
                </CardContent>
            </Card>
        </div>
    );
}
