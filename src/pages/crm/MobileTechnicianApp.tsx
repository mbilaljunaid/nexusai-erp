import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, CheckCircle, Navigation, Camera, Edit3, CheckSquare, Clock, ArrowRight, UserCheck, ShieldAlert, Package, Thermometer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/formatters";

export default function MobileTechnicianApp() {
    const [activeTab, setActiveTab] = useState("JOBS");

    // PWA layout container
    return (
        <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-100 dark:bg-slate-900 p-6 overflow-hidden">

            {/* Context/Explanation Panel for the App */}
            <div className="hidden lg:block w-[400px] mr-12 space-y-4">
                <Badge className="bg-primary/20 text-primary border-none">Module 31: Field Service</Badge>
                <h2 className="text-3xl font-black">Technician Mobile App</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    A dedicated PWA interface for field service execution, routing, and sign-offs.
                </p>
                <ul className="space-y-3 mt-6 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <b>Turn-by-Turn:</b> Integrated with Google Maps for optimized routing between jobs.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <b>Parts Capture:</b> Barcode/manual entry for van stock consumption syncing directly to SCM.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <b>E-Signature:</b> Customer sign-off screen upon job completion.</li>
                </ul>
            </div>

            {/* Simulated Rugged Tablet/Phone Device Frame */}
            <div className="w-full max-w-[390px] h-[844px] bg-black rounded-[40px] shadow-2xl overflow-hidden relative border-[16px] border-[#2C3E50] shrink-0">
                {/* Simulated rugged bumper corners */}
                <div className="absolute top-0 left-0 w-8 h-8 bg-slate-700/50 rounded-br-2xl pointer-events-none z-50"></div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-slate-700/50 rounded-bl-2xl pointer-events-none z-50"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 bg-slate-700/50 rounded-tr-2xl pointer-events-none z-50"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700/50 rounded-tl-2xl pointer-events-none z-50"></div>

                {/* App Content */}
                <div className="w-full h-full bg-slate-100 dark:bg-slate-950 flex flex-col pt-4 relative overflow-y-auto overflow-x-hidden no-scrollbar">

                    {/* Header */}
                    <header className="px-5 pb-4 pt-4 flex flex-col gap-2 sticky top-0 bg-slate-900 text-white z-40 border-b border-slate-800">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-amber-500" />
                                <span className="font-bold tracking-wider">NEXUS FIELD OPS</span>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Online</Badge>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <div>
                                <h1 className="text-xl font-bold">Marcus Johnson</h1>
                                <p className="text-xs text-slate-400 font-mono">ID: TECH-01 • Master Lvl</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase">Next Job</p>
                                <p className="font-bold text-emerald-400 flex items-center gap-1"><Clock className="h-3 w-3" /> 14 Mins</p>
                            </div>
                        </div>
                    </header>

                    {/* Content Body */}
                    <div className="px-4 py-5 space-y-5 pb-24">

                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Current Assignment</h3>

                        {/* Active Work Order Card */}
                        <Card className="rounded-2xl border bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                            <div className="h-2 bg-amber-500 w-full"></div>
                            <CardContent className="p-0">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">WO-11942</Badge>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">HVAC Check</span>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Industrial Chiller Maintenance #4</h2>
                                    <p className="font-medium text-slate-600 dark:text-slate-400 mt-1">Globex Manufacturing Plant</p>
                                </div>

                                <div className="p-5 grid grid-cols-2 gap-4">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-xl shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                                        <div className="flex flex-col items-center">
                                            <Navigation className="h-5 w-5 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">Navigate</span>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="w-full h-14 rounded-xl border-2 border-slate-300 hover:bg-slate-50 active:translate-y-1 transition-all">
                                        <div className="flex flex-col items-center text-slate-700">
                                            <Wrench className="h-5 w-5 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">Begin Work</span>
                                        </div>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mt-6">Execution Tasks</h3>

                        {/* Checklist */}
                        <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                <div className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                    <Checkbox id="t1" className="mt-1 w-6 h-6 rounded border-2" />
                                    <div>
                                        <label htmlFor="t1" className="font-bold text-slate-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Lockout/Tagout procedures verified</label>
                                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[250px]">Ensure main power to chiller unit #4 is completely disconnected.</p>
                                    </div>
                                </div>
                                <div className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                    <Checkbox id="t2" className="mt-1 w-6 h-6 rounded border-2" />
                                    <div>
                                        <label htmlFor="t2" className="font-bold text-slate-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Inspect condenser coils</label>
                                        <div className="mt-2 flex gap-2">
                                            <Button size="sm" variant="outline" className="h-8 text-[10px] bg-slate-50"><Camera className="h-3 w-3 mr-1" /> Add Photo</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                    <Checkbox id="t3" className="mt-1 w-6 h-6 rounded border-2" />
                                    <div className="w-full">
                                        <label htmlFor="t3" className="font-bold text-slate-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Record return temperature</label>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Input type="number" placeholder="0.0" className="w-24 h-9" />
                                            <span className="text-sm font-medium text-slate-500">°F</span>
                                            <Thermometer className="h-4 w-4 text-amber-500 ml-auto" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Parts & Materials */}
                        <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 mt-4">
                            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Van Stock Used</CardTitle>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-primary bg-primary/10">Add Part</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-3 bg-slate-50 border-t flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold">Filter Cartridge AC-99</p>
                                        <p className="text-[10px] text-muted-foreground">Qty: 2 • SK-00192</p>
                                    </div>
                                    <span className="font-bold text-sm text-slate-800">$45.00</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Completion Block */}
                        <div className="pt-4">
                            <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all">
                                <Edit3 className="h-5 w-5 mr-2" /> Capture Sign-Off
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Utility Bar (PWA style) */}
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-around pb-6 px-4 z-50">
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-white hover:bg-slate-800 hover:text-white">
                            <CheckSquare className="h-6 w-6" />
                            <span className="text-[10px] font-medium">My Jobs</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                            <Package className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Van Stock</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                            <UserCheck className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Profile</span>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Dummy icons to satisfy react requirement for the explanatory column */}
            <CheckCircle className="hidden" />
        </div>
    );
}
