import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    User,
    FileText,
    Calendar,
    Clock,
    CreditCard,
    Briefcase,
    ChevronRight,
    TrendingUp,
    Award,
    FileCheck,
    Shield
} from "lucide-react";
import { Link } from "wouter";

export default function ESSDashboard() {
    const quickActions = [
        { name: "Personal Information", icon: User, color: "text-blue-500", bg: "bg-blue-500/10", path: "/me/profile" },
        { name: "Document Records", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", path: "/me/documents" },
        { name: "Payslips", icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10", path: "/me/payslips" },
        { name: "Absence", icon: Calendar, color: "text-orange-500", bg: "bg-orange-500/10", path: "/wfm/my-time" },
        { name: "Employment Verification", icon: Shield, color: "text-teal-500", bg: "bg-teal-500/10", path: "/api/hr-self-service/me/documents/verification/pdf", external: true },
        { name: "Tax Forms", icon: FileCheck, color: "text-red-500", bg: "bg-red-500/10", path: "/me/statutory-forms" },
    ];

    const pendingTasks = [
        { title: "Review Performance Goal", date: "Due in 2 days", priority: "High" },
        { title: "Complete Compliance Training", date: "Due in 5 days", priority: "Medium" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 rounded-3xl text-white shadow-2xl border border-white/10">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                        <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back, John Doe</h1>
                        <p className="text-zinc-400 mt-1 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Senior Product Engineer • Global Operations
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white px-3 py-1">
                        Emp ID: 10425
                    </Badge>
                    <Badge variant="outline" className="bg-teal-500/20 border-teal-500/30 text-teal-300 px-3 py-1">
                        Active
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    action.external ? (
                        <Card key={action.name} className="hover:shadow-lg transition-all cursor-pointer group border-zinc-200/50 dark:border-zinc-800/50 hover:border-teal-500/30 overflow-hidden" onClick={() => window.open(action.path, '_blank')}>
                            <CardContent className="p-6">
                                <div className={`p-3 rounded-2xl ${action.bg} ${action.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg">{action.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">Compliance utilities</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Link key={action.name} href={action.path}>
                            <Card className="hover:shadow-lg transition-all cursor-pointer group border-zinc-200/50 dark:border-zinc-800/50 hover:border-teal-500/30 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className={`p-3 rounded-2xl ${action.bg} ${action.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg">{action.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Manage your details</p>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Clock className="h-5 w-5 text-teal-600" /> What's New & Tasks
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-teal-600">View All</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingTasks.map((task, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 group hover:border-teal-500/20 transition-all">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                                        <div>
                                            <p className="font-medium">{task.title}</p>
                                            <p className="text-sm text-muted-foreground">{task.date}</p>
                                        </div>
                                    </div>
                                    <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium tracking-wide uppercase">My Performance</p>
                                        <p className="text-2xl font-bold">Exceeds Expectations</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-600 font-medium tracking-wide uppercase">Learning Points</p>
                                        <p className="text-2xl font-bold">1,240 pts</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <CardTitle className="text-lg">My Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" />
                                        <AvatarFallback>SM</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">Sarah Miller</p>
                                        <p className="text-xs text-muted-foreground">My Manager</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <p className="text-sm font-medium mb-3">Peers (5)</p>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                                <AvatarFallback>{i}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-teal-600 text-white border-none shadow-lg shadow-teal-500/20">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                            <p className="text-teal-100/80 text-sm mb-4">Ask our AI Assistant any HR policy questions or request time off.</p>
                            <Button variant="secondary" className="w-full bg-white text-teal-600 hover:bg-zinc-100">
                                Launch AI Chat
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
