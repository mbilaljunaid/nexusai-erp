
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    description?: string;
    className?: string;
}

export function MetricCard({ title, value, trend, trendValue, description, className }: MetricCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                {trend === "up" && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                {trend === "down" && <ArrowDownRight className="h-4 w-4 text-red-500" />}
                {trend === "neutral" && <Minus className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(trendValue || description) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trendValue && (
                            <span className={
                                trend === "up" ? "text-green-500 font-medium mr-1" :
                                    trend === "down" ? "text-red-500 font-medium mr-1" : ""
                            }>
                                {trendValue}
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
