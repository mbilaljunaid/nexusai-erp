import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Map, Cpu, Zap, Route, PlayCircle, Settings2, Car, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SpatialDispatchOptimizer() {

    // Optimizer Parameters
    const [travelWeight, setTravelWeight] = useState([70]);
    const [slaWeight, setSlaWeight] = useState([90]);
    const [skillWeight, setSkillWeight] = useState([100]);
    const { toast } = useToast();
    const [lastRunResult, setLastRunResult] = useState<any>(null);

    const optimizeMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/field-service/optimize-routes", {
                parameterId: null, // Default
                jobs: ["JOB-101", "JOB-102", "JOB-103", "JOB-104"],
                technicians: ["TECH-A", "TECH-B"]
            });
            return res.json();
        },
        onSuccess: (data) => {
            setLastRunResult(data.result);
            toast({
                title: "Optimization Complete",
                description: `Saved ${data.result.routeData.totalTravelTimeSavedMinutes} minutes of travel time.`,
            });
        }
    });

    return (
        <StandardPage
            title="Geo-Spatial Dispatch Optimizer"
            description="Configure the AI algorithms responsible for routing field service technicians and minimizing travel time."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Field Service", href: "/crm/field-service" },
                { label: "Dispatch Optimizer" }
            ]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Metrics & Map Sandbox Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="border shadow-sm border-blue-200">
                            <CardHeader className="bg-blue-50/50 pb-2 border-b">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-blue-600" /> Current Optimizer Output
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Jobs Scheduling (Next 48h)</span>
                                        <span className="font-bold text-blue-700">842 / 850 (99%)</span>
                                    </div>
                                    <Progress value={99} className="h-1.5" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">Avg Travel Distance</p>
                                        <p className="text-lg font-black text-slate-800">
                                            <Car className="h-3 w-3 inline text-slate-400 mr-1" />
                                            {lastRunResult ? '3.8 mi' : '4.2 mi'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">SLA Compliance Risk</p>
                                        <p className="text-lg font-black text-emerald-600">
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            {lastRunResult ? `Reduced ( avoided ${lastRunResult.routeData.slaViolationsAvoided} )` : 'Low (1.2%)'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm bg-slate-900 text-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="h-24 w-24" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-400" /> Real-Time Solver Engine
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-1 z-10 relative">
                                <p className="text-xs text-slate-400 font-mono">Status: <span className="text-emerald-400 font-bold">{optimizeMutation.isPending ? "Calculating..." : "Idle (Awaiting batch)"}</span></p>
                                <p className="text-xs text-slate-400 font-mono">Last Run: {lastRunResult ? "Just now" : "12 mins ago"}</p>
                                <p className="text-xs text-slate-400 font-mono">Solve Time: 1.42s (10,000 iter.)</p>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-100 border-none transition-all hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                                    onClick={() => optimizeMutation.mutate()}
                                    disabled={optimizeMutation.isPending}
                                >
                                    {optimizeMutation.isPending ? (
                                        <span className="flex items-center"><div className="h-3 w-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-2" /> Solving matrix...</span>
                                    ) : (
                                        <span className="flex items-center"><PlayCircle className="h-4 w-4 mr-2 text-amber-400" /> Force Re-Optimization Run</span>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border shadow-sm min-h-[400px] flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden group">
                        {/* Geographic Context Representation */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none grid grid-cols-6 grid-rows-6 gap-0">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <div key={i} className="border border-slate-300 transition-colors group-hover:border-blue-200" />
                            ))}
                        </div>
                        <div className="absolute inset-x-0 h-px top-1/2 bg-blue-500/20 -translate-y-1/2 pattern-diagonal-lines-sm" />
                        <div className="absolute inset-y-0 w-px left-1/2 bg-blue-500/20 -translate-x-1/2 pattern-diagonal-lines-sm" />

                        <div className="z-10 flex flex-col items-center bg-white/80 backdrop-blur px-8 py-6 rounded-2xl shadow-sm border border-slate-100">
                            <Map className="h-16 w-16 text-blue-500 mb-4" />
                            <h3 className="font-bold border-b pb-2 text-slate-800">Geospatial Router Active</h3>
                            <p className="text-sm text-center text-muted-foreground mt-2 max-w-sm">
                                Standard map view requires Fleet Engine API integration. Using schematic grid routing view for optimization calculation.
                            </p>
                            <Badge variant="outline" className="mt-4 bg-emerald-50 text-emerald-700 border-emerald-200">
                                <Settings2 className="h-3 w-3 mr-1.5" /> Matrix Active
                            </Badge>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Optimizer Cost Functions / Weightings */}
                <div className="lg:col-span-1">
                    <Card className="border shadow-sm h-full">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Route className="h-5 w-5 text-primary" /> Cost Function Weights
                            </CardTitle>
                            <CardDescription className="text-xs">Adjust the AI objectives used when building technician routes.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="font-bold text-sm">Minimize Travel Time</h4>
                                        <p className="text-xs text-muted-foreground">Prioritize shortest driving distance.</p>
                                    </div>
                                    <Badge className="bg-primary/10 text-primary border-none">{travelWeight}%</Badge>
                                </div>
                                <Slider
                                    value={travelWeight}
                                    onValueChange={setTravelWeight}
                                    max={100}
                                    step={1}
                                    className="cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="font-bold text-sm text-red-700">Strict SLA Compliance</h4>
                                        <p className="text-xs text-muted-foreground text-red-700/70">Willing to drive further to meet a tight deadline.</p>
                                    </div>
                                    <Badge className="bg-red-100 text-red-700 border-none">{slaWeight}%</Badge>
                                </div>
                                <Slider
                                    value={slaWeight}
                                    onValueChange={setSlaWeight}
                                    max={100}
                                    step={1}
                                    className="cursor-pointer [&>[role=slider]]:border-red-500 [&>[data-orientation=horizontal]]:bg-red-200"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="font-bold text-sm text-emerald-700">Skill Matching strictness</h4>
                                        <p className="text-xs text-muted-foreground text-emerald-700/70">Ensure technician is fully certified for task.</p>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none">{skillWeight}%</Badge>
                                </div>
                                <Slider
                                    value={skillWeight}
                                    onValueChange={setSkillWeight}
                                    max={100}
                                    step={1}
                                    className="cursor-pointer [&>[role=slider]]:border-emerald-500 [&>[data-orientation=horizontal]]:bg-emerald-200"
                                />
                            </div>

                            <div className="pt-6 border-t mt-4">
                                <h4 className="font-bold text-sm mb-3">Optimization Constraints</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Max Overtime per Tech</span>
                                        <span className="font-semibold px-2 py-1 bg-slate-100 rounded">2 Hours</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Break Duration</span>
                                        <span className="font-semibold px-2 py-1 bg-slate-100 rounded">45 Mins</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-6" variant="outline">Save Optimizations</Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
