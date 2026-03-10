import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Send, Bell, BellOff, CheckCircle, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const NOTIFICATIONS = [
    { id: '1', successor: 'Michael Smith', role: 'CEO', incumbent: 'Jane Doe', readiness: 'Ready Now', sent: true, sentDate: 'Mar 05, 2026', type: 'email' },
    { id: '2', successor: 'Layla Wang', role: 'CHRO', incumbent: 'Robert Jones', readiness: '1-2 Years', sent: false, sentDate: null, type: 'email' },
    { id: '3', successor: 'Tom Bell', role: 'CFO', incumbent: 'Michael Smith', readiness: '1-2 Years', sent: true, sentDate: 'Mar 01, 2026', type: 'portal' },
];

export default function SuccessionNotification() {
    const { toast } = useToast();
    const [notifications, setNotifications] = useState(NOTIFICATIONS);

    const handleSend = (id: string, successor: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, sent: true, sentDate: 'Today' } : n));
        toast({ title: 'Notification Sent', description: `${successor} has been notified of their succession plan status.` });
    };

    const handleRevoke = (id: string, successor: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, sent: false, sentDate: null } : n));
        toast({ title: 'Notification Revoked', description: `Access to succession visibility revoked for ${successor}.`, variant: 'destructive' });
    };

    return (
        <StandardPage
            title="Succession Plan Notifications"
            description="Control when and how successors are notified of their designation for key positions. Configure access to succession data visibility."
            actions={
                <Button onClick={() => toast({ title: 'Bulk Notify', description: 'All pending successor notifications have been queued.' })}>
                    <Send className="mr-2 h-4 w-4" /> Send All Pending
                </Button>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Policy</CardTitle>
                        <CardDescription>Global rules for when successors are automatically informed of their designation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Auto-notify threshold</Label>
                                <Select defaultValue="ready-now">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Successors</SelectItem>
                                        <SelectItem value="ready-now">Ready Now Only</SelectItem>
                                        <SelectItem value="never">Manual Only (Never Auto)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Notification Channel</Label>
                                <Select defaultValue="email">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="portal">Internal Portal Alert</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Show Position Name to Successor</Label>
                                <div className="flex items-center gap-3 pt-2">
                                    <Switch defaultChecked />
                                    <span className="text-sm text-muted-foreground">Reveal the role they are named for</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Successor Notification Roster</CardTitle>
                        <CardDescription>All named successors and the status of their notification</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Successor</TableHead>
                                    <TableHead>Named For Role</TableHead>
                                    <TableHead>Incumbent</TableHead>
                                    <TableHead>Readiness</TableHead>
                                    <TableHead>Notification Status</TableHead>
                                    <TableHead>Date Sent</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.map((n) => (
                                    <TableRow key={n.id}>
                                        <TableCell className="font-medium">{n.successor}</TableCell>
                                        <TableCell>{n.role}</TableCell>
                                        <TableCell className="text-muted-foreground">{n.incumbent}</TableCell>
                                        <TableCell>
                                            {n.readiness === 'Ready Now'
                                                ? <Badge className="bg-green-500/10 text-green-500 border-0 shadow-none">{n.readiness}</Badge>
                                                : <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">{n.readiness}</Badge>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {n.sent ? (
                                                <div className="flex items-center gap-1.5 text-green-500 text-sm">
                                                    <CheckCircle className="h-4 w-4" /> Notified
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                    <Clock className="h-4 w-4" /> Pending
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{n.sentDate ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            {n.sent ? (
                                                <Button variant="ghost" size="sm" onClick={() => handleRevoke(n.id, n.successor)}>
                                                    <BellOff className="h-4 w-4 mr-1 text-destructive" /> Revoke
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => handleSend(n.id, n.successor)}>
                                                    <Bell className="h-4 w-4 mr-1" /> Notify
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
