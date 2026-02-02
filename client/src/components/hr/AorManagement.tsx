import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// This component determines WHAT data this person can see/manage
export function AorManagement({ personId }: { personId: string }) {
    const queryClient = useQueryClient();
    // const { data: aors, isLoading } = useQuery(...) // Need API endpoint

    // Stub data for MVP since API isn't fully wired for AOR CRUD yet
    const aors: any[] = [];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" /> Area of Responsibility
                        </CardTitle>
                        <CardDescription>
                            Define the data scope this user has access to.
                        </CardDescription>
                    </div>
                    <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Scope</Button>
                </div>
            </CardHeader>
            <CardContent>
                {aors.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        No specific responsibilities assigned. This user has basic access.
                    </div>
                ) : (
                    <div>List of AORs</div>
                )}
            </CardContent>
        </Card>
    );
}
