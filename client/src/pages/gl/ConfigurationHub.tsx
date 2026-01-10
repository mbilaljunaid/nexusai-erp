import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Settings,
    Calendar,
    Globe,
    Link,
    Tags,
    Layers,
    ArrowRightLeft,
    ShieldCheck,
    Wand2,
    Calculator,
    Library
} from "lucide-react";
import { Link as RouterLink } from "wouter";

const configTiles = [
    {
        title: "Ledger Architecture",
        description: "Primary, Secondary, and Reporting ledgers setup",
        icon: Library,
        path: "/gl/ledgers",
        color: "text-blue-600",
        bgColor: "bg-blue-100/50"
    },
    {
        title: "Accounting Calendars",
        description: "Define fiscal years, periods, and status controls",
        icon: Calendar,
        path: "/gl/config/calendars",
        color: "text-purple-600",
        bgColor: "bg-purple-100/50"
    },
    {
        title: "Currencies & Rates",
        description: "Active currencies and exchange rate management",
        icon: Globe,
        path: "/gl/config/currencies",
        color: "text-teal-600",
        bgColor: "bg-teal-100/50"
    },
    {
        title: "Sources & Categories",
        description: "Journal origins and transaction types",
        icon: Tags,
        path: "/gl/config/sources",
        color: "text-amber-600",
        bgColor: "bg-amber-100/50"
    },
    {
        title: "Intercompany Rules",
        description: "Define balancing accounts for interco transactions",
        icon: ArrowRightLeft,
        path: "/gl/intercompany",
        color: "text-rose-600",
        bgColor: "bg-rose-100/50"
    },
    {
        title: "Allocations Engine",
        description: "Mass Allocation rules and pool definitions",
        icon: Calculator,
        path: "/gl/config/allocations",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100/50"
    },
    {
        title: "Security & Access",
        description: "Data Access Sets and Segment Security",
        icon: ShieldCheck,
        path: "/gl/config/security",
        color: "text-emerald-600",
        bgColor: "bg-emerald-100/50"
    },
    {
        title: "AI & Automation",
        description: "Auto-Post rules and anomaly detection settings",
        icon: Wand2,
        path: "/gl/config/automation",
        color: "text-fuchsia-600",
        bgColor: "bg-fuchsia-100/50"
    },
    {
        title: "Posting Controls",
        description: "Suspense, Rounding, and Netting rules",
        icon: Settings,
        path: "/gl/config/controls",
        color: "text-slate-600",
        bgColor: "bg-slate-100/50"
    }
];

export default function ConfigurationHub() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                    <Settings className="h-10 w-10 text-primary animate-spin-slow" />
                    Configuration & Setup
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl">
                    Comprehensive enterprise setup for the General Ledger. Achieve 100% parity with Oracle Fusion configuration standards.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configTiles.map((tile, idx) => (
                    <RouterLink key={idx} href={tile.path}>
                        <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 overflow-hidden relative">
                            <div className={`absolute top-0 right-0 p-8 ${tile.color} opacity-5 group-hover:scale-110 transition-transform`}>
                                <tile.icon className="h-24 w-24" />
                            </div>
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className={`p-3 rounded-xl ${tile.bgColor} ${tile.color}`}>
                                    <tile.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{tile.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed mb-4">
                                    {tile.description}
                                </CardDescription>
                                <Button variant="ghost" className="p-0 h-auto text-primary group-hover:gap-2 transition-all">
                                    Configure <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </Button>
                            </CardContent>
                        </Card>
                    </RouterLink>
                ))}
            </div>

            <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Wand2 className="h-40 w-40" />
                </div>
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Wand2 className="h-6 w-6 text-fuchsia-400" />
                            AI Assistant Setup
                        </h2>
                        <p className="text-slate-400 font-medium">
                            Let NexusAI help you generate a compliant Chart of Accounts or Fiscal Calendar standard.
                        </p>
                    </div>
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-lg shrink-0">
                        Launch QuickBuilder
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
