
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Layers } from "lucide-react";

interface AllocationStep {
    sourceAccount: string;
    driver: string;
    targetDimension: string;
}

const AllocationRules = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<AllocationStep>({
        sourceAccount: '',
        driver: 'Headcount',
        targetDimension: 'Department'
    });

    const handleRunAllocation = () => {
        if (!step.sourceAccount) {
            toast({ title: "Validation Error", description: "Please select a source pool account.", variant: "destructive" });
            return;
        }

        toast({
            title: "Allocation Submitted",
            description: `Allocating ${step.sourceAccount} based on ${step.driver} to ${step.targetDimension}.`
        });
        // API call to backend would go here (FormulaService.allocate)
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Cost Allocation</CardTitle>
                <CardDescription>Distribute central costs to business units based on drivers.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 p-6 border rounded-lg bg-muted/20">

                    {/* Source */}
                    <div className="flex-1 space-y-2 w-full">
                        <Label>Source Pool (Account)</Label>
                        <Select onValueChange={(v) => setStep({ ...step, sourceAccount: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="90000 IT Overhead">90000 IT Overhead</SelectItem>
                                <SelectItem value="91000 Facilities">91000 Facilities</SelectItem>
                                <SelectItem value="92000 HR Training">92000 HR Training</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground mt-6" />

                    {/* Driver */}
                    <div className="flex-1 space-y-2 w-full">
                        <Label>Allocation Driver</Label>
                        <Select defaultValue="Headcount" onValueChange={(v) => setStep({ ...step, driver: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Headcount">Headcount Logic</SelectItem>
                                <SelectItem value="SquareFootage">Square Footage</SelectItem>
                                <SelectItem value="RevenueShare">Revenue Share</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground mt-6" />

                    {/* Target */}
                    <div className="flex-1 space-y-2 w-full">
                        <Label>Target Dimension</Label>
                        <Select defaultValue="Department" onValueChange={(v) => setStep({ ...step, targetDimension: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Department">Department</SelectItem>
                                <SelectItem value="Project">Project</SelectItem>
                                <SelectItem value="Entity">Legal Entity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleRunAllocation} className="w-full md:w-auto">
                        <Layers className="mr-2 h-4 w-4" /> Run Allocation
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AllocationRules;
