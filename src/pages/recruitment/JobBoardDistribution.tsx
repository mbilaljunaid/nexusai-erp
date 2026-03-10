import React from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Send, Link2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const boards = [
    { name: 'LinkedIn Jobs', logo: '🔵', status: 'active', postings: 14, apps: 312, lastSync: '2 min ago' },
    { name: 'Indeed', logo: '🔷', status: 'active', postings: 14, apps: 528, lastSync: '5 min ago' },
    { name: 'Glassdoor', logo: '🟢', status: 'active', postings: 10, apps: 97, lastSync: '12 min ago' },
    { name: 'Bayt.com', logo: '🔴', status: 'active', postings: 6, apps: 44, lastSync: '1 hr ago' },
    { name: 'Monster', logo: '🟣', status: 'inactive', postings: 0, apps: 0, lastSync: 'Not connected' },
    { name: 'ZipRecruiter', logo: '🟠', status: 'inactive', postings: 0, apps: 0, lastSync: 'Not connected' },
];

export default function JobBoardDistribution() {
    const { toast } = useToast();

    const handleSync = (board: string) => {
        toast({ title: `Sync Initiated`, description: `Publishing all open requisitions to ${board}.` });
    };

    return (
        <StandardPage
            title="Job Board Distribution Console"
            description="Publish and manage open requisitions across LinkedIn, Indeed, Glassdoor, and regional job boards from a single control panel."
            actions={
                <Button onClick={() => handleSync('all boards')}>
                    <Send className="mr-2 h-4 w-4" /> Publish All Open Reqs
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">44</div>
                            <div className="text-sm text-muted-foreground mt-1">Total Active Postings</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-green-500">981</div>
                            <div className="text-sm text-muted-foreground mt-1">Total Applications (30 days)</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">4</div>
                            <div className="text-sm text-muted-foreground mt-1">Boards Connected</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Board Connections &amp; Distribution Status</CardTitle>
                        <CardDescription>Toggle boards to automatically publish/unpublish open requisitions via standardized job feeds (HR-XML / JSON-LD)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Board</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Live Postings</TableHead>
                                    <TableHead className="text-right">Applications (30d)</TableHead>
                                    <TableHead>Last Sync</TableHead>
                                    <TableHead>Auto-Publish</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {boards.map((b) => (
                                    <TableRow key={b.name}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                <span className="text-xl">{b.logo}</span>
                                                {b.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {b.status === 'active' ? (
                                                <Badge className="bg-green-500/10 text-green-500 border-0 shadow-none flex items-center gap-1 w-fit">
                                                    <CheckCircle className="h-3 w-3" /> Connected
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground flex items-center gap-1 w-fit">
                                                    <XCircle className="h-3 w-3" /> Disconnected
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{b.postings}</TableCell>
                                        <TableCell className="text-right font-mono">{b.apps}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{b.lastSync}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch defaultChecked={b.status === 'active'} disabled={b.status !== 'active'} />
                                                <Label className="text-xs text-muted-foreground sr-only">Auto-publish</Label>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {b.status === 'active' ? (
                                                <Button variant="ghost" size="sm" onClick={() => handleSync(b.name)}>
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm">
                                                    <Link2 className="mr-1 h-3 w-3" /> Connect
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
