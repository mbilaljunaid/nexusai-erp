import React from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Route, Save, ArrowRight, UserCheck, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function DocumentRoutingConfig() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Routing Configuration Saved",
            description: "Performance document routing states have been updated successfully."
        });
    };

    return (
        <StandardPage
            title="Performance Document Routing"
            description="Configure the state machine for performance document lifecycles and required approvals."
            actions={
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>State Machine Flow</CardTitle>
                        <CardDescription>Sequence of steps required for a performance document</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border border-border">
                                <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="font-medium">1. Not Started</div>
                                    <div className="text-xs text-muted-foreground">Document is created but no content entered</div>
                                </div>
                            </div>
                            <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" /></div>

                            <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-border">
                                <UserCheck className="h-5 w-5 text-primary" />
                                <div className="flex-1">
                                    <div className="font-medium">2. Worker Self-Evaluation</div>
                                    <div className="text-xs text-muted-foreground">Employee completes their portion</div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" /></div>

                            <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-border">
                                <UserCheck className="h-5 w-5 text-primary" />
                                <div className="flex-1">
                                    <div className="font-medium">3. Manager Evaluation</div>
                                    <div className="text-xs text-muted-foreground">Direct manager completes their portion</div>
                                </div>
                                <Switch defaultChecked disabled />
                            </div>
                            <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" /></div>

                            <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-border">
                                <UserCheck className="h-5 w-5 text-primary" />
                                <div className="flex-1">
                                    <div className="font-medium">4. Manager Meeting</div>
                                    <div className="text-xs text-muted-foreground">Manager acknowledges meeting occurred</div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" /></div>

                            <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border border-border">
                                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="font-medium">5. Completed</div>
                                    <div className="text-xs text-muted-foreground">Locked document, ready for compensation parsing</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transition Rules</CardTitle>
                            <CardDescription>Rules permitting document movement between states</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Allow Manager Concurrent Edit</Label>
                                        <div className="text-sm text-muted-foreground">Manager can edit while employee is filling self-evaluation</div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Bypass Self-Evaluation</Label>
                                        <div className="text-sm text-muted-foreground">If employee fails to submit by deadline, manager can override</div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Require AME Approval</Label>
                                        <div className="text-sm text-muted-foreground">Route performance ratings to skip-level manager before completion</div>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Role Permissions per State</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>State</TableHead>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Manager</TableHead>
                                        <TableHead>HR Admin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Self-Evaluation</TableCell>
                                        <TableCell><Badge variant="secondary">Update</Badge></TableCell>
                                        <TableCell><Badge variant="outline">View Only</Badge></TableCell>
                                        <TableCell><Badge variant="outline">View Only</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Manager Eval</TableCell>
                                        <TableCell><Badge variant="outline">View Prev</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">Update</Badge></TableCell>
                                        <TableCell><Badge variant="outline">View Only</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Completed</TableCell>
                                        <TableCell><Badge variant="outline">View Only</Badge></TableCell>
                                        <TableCell><Badge variant="outline">View Only</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">Audit Override</Badge></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
