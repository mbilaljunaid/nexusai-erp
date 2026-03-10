import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Globe2, Wind, Droplets, Zap, ArrowRight, Share2, Download, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SustainabilityPublicDashboard() {
    // Fetch live metrics from the new public API
    const { data, isLoading } = useQuery({
        queryKey: ["/api/epm/public/sustainability-metrics"],
        queryFn: () => fetch("/api/epm/public/sustainability-metrics").then(res => res.json()),
        refetchInterval: 30000 // Refresh every 30s for public board
    });

    if (isLoading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    // This component renders a public-facing style dashboard
    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-900">
            {/* Embedded Admin Toolbar */}
            <div className="bg-slate-900 text-white p-3 flex justify-between items-center px-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-none px-2 rounded-sm text-[10px] uppercase font-bold tracking-wider">Preview Mode</Badge>
                    <span className="text-sm font-medium">Public Sustainability Dashboard ({data.year})</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white"><Share2 className="h-3 w-3 mr-2" /> Copy Link</Button>
                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700"><Download className="h-3 w-3 mr-2" /> Export ESG Report</Button>
                </div>
            </div>

            {/* Public Page Layout */}
            <main className="max-w-6xl mx-auto py-12 px-6">

                <header className="text-center mb-16 space-y-4">
                    <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Leaf className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Pathway to Net-Zero</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        NexusAI is committed to full carbon neutrality by 2030. Here is our transparent, real-time progress across all global operations and supply chains.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Hero Metric 1 */}
                    <Card className="border-0 shadow-xl overflow-hidden group">
                        <div className="h-2 bg-emerald-500 w-full transform origin-left transition-transform group-hover:scale-105"></div>
                        <CardContent className="p-8 text-center">
                            <Wind className="h-10 w-10 text-emerald-500 mx-auto mb-4 opacity-80" />
                            <h3 className="text-4xl font-black text-slate-900 mb-2">-42%</h3>
                            <p className="font-bold text-slate-800">Scope 1 & 2 Emissions</p>
                            <p className="text-sm text-slate-500 mt-2">Reduction against 2020 baseline baseline.</p>
                        </CardContent>
                    </Card>

                    {/* Hero Metric 2 */}
                    <Card className="border-0 shadow-xl overflow-hidden group">
                        <div className="h-2 bg-blue-500 w-full transform origin-left transition-transform group-hover:scale-105"></div>
                        <CardContent className="p-8 text-center">
                            <Zap className="h-10 w-10 text-blue-500 mx-auto mb-4 opacity-80" />
                            <h3 className="text-4xl font-black text-slate-900 mb-2">100%</h3>
                            <p className="font-bold text-slate-800">Renewable Energy</p>
                            <p className="text-sm text-slate-500 mt-2">Powering all primary global data centers.</p>
                        </CardContent>
                    </Card>

                    {/* Hero Metric 3 */}
                    <Card className="border-0 shadow-xl overflow-hidden group">
                        <div className="h-2 bg-sky-500 w-full transform origin-left transition-transform group-hover:scale-105"></div>
                        <CardContent className="p-8 text-center">
                            <Droplets className="h-10 w-10 text-sky-500 mx-auto mb-4 opacity-80" />
                            <h3 className="text-4xl font-black text-slate-900 mb-2">Neutral</h3>
                            <p className="font-bold text-slate-800">Water Footprint</p>
                            <p className="text-sm text-slate-500 mt-2">Achieved via localized offset projects.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-24">
                    <div className="space-y-8">
                        <div>
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none mb-3">Goal Progress</Badge>
                            <h2 className="text-3xl font-black mb-4">The 2030 Roadmap</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We measure our environmental impact daily using the core metrics defined by the Greenhouse Gas Protocol. Our trajectory remains ahead of schedule for our Scope 1 and 2 targets.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Direct Emissions (Scope 1)</h4>
                                    <span className="font-bold text-emerald-600">{Number(data.scope1).toLocaleString()} mtCO2e</span>
                                </div>
                                <Progress value={30} className="h-3 bg-slate-200" indicatorClassName="bg-emerald-500" />
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Indirect Energy (Scope 2)</h4>
                                    <span className="font-bold text-blue-600">{Number(data.scope2).toLocaleString()} mtCO2e</span>
                                </div>
                                <Progress value={20} className="h-3 bg-slate-200" indicatorClassName="bg-blue-500" />
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><Globe2 className="h-4 w-4 text-amber-500" /> Supply Chain (Scope 3)</h4>
                                    <span className="font-bold text-amber-600">{Number(data.scope3).toLocaleString()} mtCO2e</span>
                                </div>
                                <Progress value={50} className="h-3 bg-slate-200" indicatorClassName="bg-amber-500" />
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-bold text-slate-900 mt-2 text-lg">Total Carbon Footprint</h4>
                                    <span className="font-black text-slate-900 text-xl">{Number(data.totalEmissions).toLocaleString()} mtCO2e</span>
                                </div>
                                <p className="text-xs font-semibold text-emerald-600 text-right uppercase tracking-widest">{data.status} for {data.year}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>
                        <h3 className="text-2xl font-black mb-6">Audited Transparency</h3>
                        <p className="text-slate-600 mb-8">
                            Trust requires verification. Our ESG data pipeline is cryptographically verifiable and audited annually by third-party compliance agencies.
                        </p>

                        <div className="space-y-4">
                            <a href="#" className="block p-5 rounded-xl border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-800">FY2025 Global Sustainability Report</h4>
                                        <p className="text-xs text-slate-500 mt-1">PDF Document • 4.2 MB</p>
                                    </div>
                                    <Download className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
                                </div>
                            </a>
                            <a href="#" className="block p-5 rounded-xl border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-800">ISO-14001 Certification Letter</h4>
                                        <p className="text-xs text-slate-500 mt-1">Status: Valid • Exp: 2028</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
