
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface ServiceStatus {
    id: string; // AP, AR, GL
    name: string;
    status: 'Open' | 'Closed' | 'Pending' | 'Error';
    message?: string;
}

interface CloseDependencyGraphProps {
    statuses: ServiceStatus[];
    periodName: string;
}

const Node = ({ service, isCenter = false }: { service: ServiceStatus; isCenter?: boolean }) => {
    const getColor = (s: string) => {
        switch (s) {
            case 'Closed': return 'bg-green-100 border-green-500 text-green-700';
            case 'Open': return 'bg-blue-50 border-blue-400 text-blue-700';
            case 'Error': return 'bg-red-50 border-red-400 text-red-700';
            default: return 'bg-gray-50 border-gray-300 text-gray-500';
        }
    };

    const getIcon = (s: string) => {
        switch (s) {
            case 'Closed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'Open': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'Error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                relative flex flex-col items-center justify-center p-4 rounded-xl border-2 shadow-sm
                transition-all duration-300
                ${getColor(service.status)}
                ${isCenter ? 'w-48 h-32 ml-10 z-10' : 'w-36 h-24'}
            `}
        >
            <div className="absolute top-2 right-2">
                {getIcon(service.status)}
            </div>
            <h3 className={`font-bold ${isCenter ? 'text-xl' : 'text-lg'}`}>{service.id}</h3>
            <p className="text-xs font-medium uppercase mt-1">{service.status}</p>
            {service.message && <p className="text-[10px] mt-1 text-center leading-tight opacity-80">{service.message}</p>}
        </motion.div>
    );
};

export const CloseDependencyGraph: React.FC<CloseDependencyGraphProps> = ({ statuses, periodName }) => {
    const glStatus = statuses.find(s => s.id === 'GL') || { id: 'GL', name: 'General Ledger', status: 'Pending' };
    const subledgers = statuses.filter(s => s.id !== 'GL');

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Close Dependencies ({periodName})</CardTitle>
                    <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="border-green-500 text-green-600">Closed</Badge>
                        <Badge variant="outline" className="border-blue-500 text-blue-600">Open</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative flex items-center justify-center min-h-[400px] bg-slate-50/50 rounded-lg overflow-hidden">

                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                        </marker>
                    </defs>
                    {/* 
                      This is a simplified visualization. In a real app, we'd calculate positions.
                      Here we assume a fixed layout: Left Column (Subledgers) -> Right Center (GL)
                    */}
                </svg>

                <div className="flex w-full max-w-4xl items-center justify-between px-10 gap-x-20">

                    {/* Left Column: Subledgers */}
                    <div className="flex flex-col gap-6">
                        {subledgers.map((service, idx) => (
                            <div key={service.id} className="relative group flex items-center">
                                <Node service={service} />
                                {/* Quick Connector Logic: Line from Right of Node to Left of GL */}
                                <div className={`
                                    hidden md:block absolute left-full top-1/2 w-16 h-0.5 bg-slate-300
                                    group-hover:bg-blue-400 transition-colors
                                `} />
                                <div className="hidden md:block absolute left-full ml-16 transform -translate-x-1 top-1/2 -mt-1">
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: GL */}
                    <div className="flex items-center justify-center pl-10 border-l-2 border-dashed border-slate-200 ml-4 py-20">
                        <div className="relative">
                            <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-slate-300" />
                            <Node service={glStatus} isCenter={true} />
                            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground w-48 text-center">
                                {glStatus.status === 'Closed'
                                    ? "Period Finalized"
                                    : "Waiting for Subledgers"}
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
