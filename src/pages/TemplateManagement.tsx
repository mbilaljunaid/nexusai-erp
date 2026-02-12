import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    FileText,
    Search,
    Eye,
    Play,
    Loader2,
    CheckCircle2,
    XCircle,
    History,
} from 'lucide-react';
import type {
    ConfigurationTemplate,
    TemplateApplication,
    TemplatePreviewResponse,
} from '@shared/types/industry';

export default function TemplateManagement() {
    const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
    const [applications, setApplications] = useState<TemplateApplication[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [previewTemplate, setPreviewTemplate] = useState<ConfigurationTemplate | null>(null);
    const [previewData, setPreviewData] = useState<TemplatePreviewResponse | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);

    useEffect(() => {
        document.title = 'Template Management | NexusAI ERP';
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/templates');
            const data = await response.json();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchApplications = async (tenantId?: string) => {
        try {
            const url = tenantId
                ? `/api/templates/applications/${tenantId}`
                : '/api/templates/applications/all'; // Would need this endpoint
            const response = await fetch(url);
            const data = await response.json();
            setApplications(data);
            setIsApplicationsOpen(true);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        }
    };

    const handlePreview = async (template: ConfigurationTemplate) => {
        try {
            const response = await fetch('/api/templates/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: template.id }),
            });
            const data = await response.json();

            setPreviewTemplate(template);
            setPreviewData(data);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Failed to preview template:', error);
        }
    };

    const getCategoryBadgeColor = (category: string | null) => {
        const colors: Record<string, string> = {
            finance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            healthcare: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            inventory: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            saas: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            subscriptions: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            hr: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            scheduling: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        };
        return colors[category || 'other'] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const filteredTemplates = templates.filter((template) => {
        const matchesCategory = selectedCategory === 'all' || template.templateCategory === selectedCategory;
        const matchesSearch =
            searchQuery === '' ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = Array.from(new Set(templates.map((t) => t.templateCategory).filter(Boolean)));
    const templateStats = {
        total: templates.length,
        active: templates.filter((t) => t.isActive).length,
        byCategory: categories.reduce((acc, cat) => {
            acc[cat!] = templates.filter((t) => t.templateCategory === cat).length;
            return acc;
        }, {} as Record<string, number>),
    };

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Template Management</h1>
                <p className="text-muted-foreground">
                    Manage configuration templates for industry-specific onboarding
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Templates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{templateStats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{templateStats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Default Templates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{templates.filter((t) => t.isDefault).length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category!}>
                                        {category} ({templateStats.byCategory[category!]})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => fetchApplications()}
                            className="w-full md:w-auto"
                        >
                            <History className="w-4 h-4 mr-2" />
                            View History
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Templates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
                    <CardDescription>
                        Configure and manage templates for automated onboarding
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Version</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTemplates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No templates found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{template.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {template.description || 'No description'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {template.templateCategory && (
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getCategoryBadgeColor(template.templateCategory)}`}
                                                >
                                                    {template.templateCategory}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {template.industryId ? 'Industry-specific' : 'Generic'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {template.isActive ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                )}
                                                {template.isDefault && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{template.version}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handlePreview(template)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{previewTemplate?.name}</DialogTitle>
                        <DialogDescription>
                            {previewData?.itemCount || 0} items • Version {previewTemplate?.version}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="metadata">Metadata</TabsTrigger>
                        </TabsList>

                        <TabsContent value="preview" className="space-y-4">
                            <div className="border rounded-md p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
                                <pre className="text-xs">
                                    {JSON.stringify(previewData?.preview, null, 2)}
                                </pre>
                            </div>
                        </TabsContent>

                        <TabsContent value="metadata" className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <p className="text-sm text-muted-foreground">
                                        {previewTemplate?.templateCategory || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Dependencies</label>
                                    <p className="text-sm text-muted-foreground">
                                        {previewTemplate?.dependencies?.join(', ') || 'None'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <p className="text-sm text-muted-foreground">
                                        {previewTemplate?.description || 'No description provided'}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Applications History Dialog */}
            <Dialog open={isApplicationsOpen} onOpenChange={setIsApplicationsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Template Application History</DialogTitle>
                        <DialogDescription>
                            {applications.length} applications recorded
                        </DialogDescription>
                    </DialogHeader>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Applied At</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Items</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        {new Date(app.appliedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{app.templateId}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                app.status === 'applied'
                                                    ? 'default'
                                                    : app.status === 'failed'
                                                        ? 'destructive'
                                                        : 'secondary'
                                            }
                                        >
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {app.metadata && typeof app.metadata === 'object' && 'appliedItems' in app.metadata
                                            ? String(app.metadata.appliedItems)
                                            : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApplicationsOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
