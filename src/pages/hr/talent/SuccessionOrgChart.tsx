import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, AlertTriangle, ShieldCheck, ChevronDown, Award } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function SuccessionOrgChart() {
    const { toast } = useToast();

    const handleExpand = () => {
        toast({
            title: "Expanding Hierarchy",
            description: "Loading deeper organizational levels."
        });
    };

    return (
        <StandardPage
            title="Succession Organization Chart"
            description="Visualize leadership continuity with primary and secondary successor overlays directly on the reporting hierarchy."
        >
            <Card className="min-h-[600px] border-border bg-muted/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Leadership continuity view (VP Level and above)</CardTitle>
                        <CardDescription>Hover over nodes to view detailed readiness metrics</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Simulated Org Chart Tree */}
                    <div className="flex flex-col items-center justify-start space-y-8 pt-8">

                        {/* CEO Node */}
                        <div className="relative flex flex-col items-center">
                            <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-[300px] flex flex-col items-center text-center relative z-10">
                                <Avatar className="h-16 w-16 mb-2 border-2 border-primary">
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div className="font-bold text-lg">Jane Doe</div>
                                <div className="text-sm text-muted-foreground">Chief Executive Officer</div>
                                <div className="mt-3 w-full border-t border-border pt-3">
                                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider text-left">Successors</div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-primary" />
                                            <span>M. Smith (CFO)</span>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-0">Ready Now</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>S. Lee (COO)</span>
                                        </div>
                                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">1-2 Years</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Line connecting down */}
                            <div className="h-8 w-px bg-border -mb-8"></div>
                        </div>

                        {/* Direct Reports Row */}
                        <div className="flex gap-12 relative pt-8">
                            {/* Horizontal connecting line */}
                            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-border"></div>

                            {/* Node 1 */}
                            <div className="relative flex flex-col items-center pt-8">
                                <div className="absolute top-0 w-px h-8 bg-border"></div>
                                <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-[280px] flex flex-col items-center text-center">
                                    <Avatar className="h-14 w-14 mb-2">
                                        <AvatarFallback>MS</AvatarFallback>
                                    </Avatar>
                                    <div className="font-bold">Michael Smith</div>
                                    <div className="text-sm text-muted-foreground">Chief Financial Officer</div>
                                    <div className="mt-3 w-full border-t border-border pt-3">
                                        <div className="text-xs font-semibold text-muted-foreground mb-2 text-left">SUCCESSORS</div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>T. Bell (VP Fin)</span>
                                            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">1-2 Years</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={handleExpand}>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Node 2 - Critical Risk */}
                            <div className="relative flex flex-col items-center pt-8">
                                <div className="absolute top-0 w-px h-8 bg-border"></div>
                                <div className="bg-card border-2 border-destructive/50 rounded-xl p-4 shadow-sm w-[280px] flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-bl-lg">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <Avatar className="h-14 w-14 mb-2">
                                        <AvatarFallback>SL</AvatarFallback>
                                    </Avatar>
                                    <div className="font-bold">Sarah Lee</div>
                                    <div className="text-sm text-muted-foreground">Chief Operating Officer</div>
                                    <div className="mt-3 w-full border-t border-border pt-3 bg-destructive/5 -mx-4 px-4 pb-2">
                                        <div className="text-xs font-semibold text-destructive mb-2 text-left flex items-center gap-1">
                                            NO IDENTIFIED SUCCESSORS
                                        </div>
                                        <Button variant="link" className="text-xs text-primary h-auto p-0 justify-start w-full">Find candidates in talent pool →</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Node 3 */}
                            <div className="relative flex flex-col items-center pt-8">
                                <div className="absolute top-0 w-px h-8 bg-border"></div>
                                <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-[280px] flex flex-col items-center text-center">
                                    <Avatar className="h-14 w-14 mb-2">
                                        <AvatarFallback>RJ</AvatarFallback>
                                    </Avatar>
                                    <div className="font-bold">Robert Jones</div>
                                    <div className="text-sm text-muted-foreground">Chief HR Officer</div>
                                    <div className="mt-3 w-full border-t border-border pt-3">
                                        <div className="text-xs font-semibold text-muted-foreground mb-2 text-left">SUCCESSORS</div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>L. Wang (VP Talent)</span>
                                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-0">Ready Now</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={handleExpand}>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
