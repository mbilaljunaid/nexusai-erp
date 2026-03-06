import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Eye, Check, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
type ConfigurationTemplate = any;
type TemplatePreviewResponse = any;
interface TemplateSelectionProps {
    industryId: string;
    selectedModules: string[];
    onTemplatesSelected: (templateIds: string[]) => void;
}

export function TemplateSelection({
    industryId,
    selectedModules,
    onTemplatesSelected,
}: TemplateSelectionProps) {
    const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
    const [previewTemplate, setPreviewTemplate] = useState<ConfigurationTemplate | null>(null);
    const [previewData, setPreviewData] = useState<TemplatePreviewResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, [industryId, selectedModules]);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            // Fetch templates for this industry
            const response = await fetch(`/api/templates/industry/${industryId}`);
            const data = await response.json();

            // Filter templates to only show those for selected modules
            const filteredTemplates = data.filter((template: ConfigurationTemplate) =>
                template.moduleId && selectedModules.includes(template.moduleId)
            );

            setTemplates(filteredTemplates);

            // Auto-select default templates
            const defaultTemplateIds = filteredTemplates
                .filter((t: ConfigurationTemplate) => t.isDefault)
                .map((t: ConfigurationTemplate) => t.id);

            setSelectedTemplates(defaultTemplateIds);
            onTemplatesSelected(defaultTemplateIds);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setIsLoading(false);
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

    const toggleTemplate = (templateId: string) => {
        const newSelection = selectedTemplates.includes(templateId)
            ? selectedTemplates.filter((id) => id !== templateId)
            : [...selectedTemplates, templateId];

        setSelectedTemplates(newSelection);
        onTemplatesSelected(newSelection);
    };

    const getCategoryBadgeColor = (category: string | null) => {
        const colors: Record<string, string> = {
            finance: 'bg-green-100 text-green-800',
            healthcare: 'bg-red-100 text-red-800',
            inventory: 'bg-blue-100 text-blue-800',
            saas: 'bg-purple-100 text-purple-800',
            hr: 'bg-yellow-100 text-yellow-800',
        };
        return colors[category || 'other'] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No configuration templates available for your selected modules.</p>
                    <p className="text-sm mt-2">You can configure everything manually after onboarding.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Configuration Templates</h3>
                    <p className="text-sm text-muted-foreground">
                        Select templates to pre-populate your system with industry-standard configurations
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => {
                        const isSelected = selectedTemplates.includes(template.id);

                        return (
                            <Card
                                key={template.id}
                                className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
                                    }`}
                                onClick={() => toggleTemplate(template.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-base">{template.name}</CardTitle>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-primary" />
                                                )}
                                            </div>
                                            {template.templateCategory && (
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getCategoryBadgeColor(template.templateCategory)}`}
                                                >
                                                    {template.templateCategory}
                                                </Badge>
                                            )}
                                        </div>
                                        {template.isDefault && (
                                            <Badge variant="outline" className="text-xs">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-sm">
                                        {template.description || 'No description available'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePreview(template);
                                        }}
                                        className="w-full"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <FileText className="w-4 h-4" />
                    <span>
                        {selectedTemplates.length} {selectedTemplates.length === 1 ? 'template' : 'templates'} selected
                    </span>
                </div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{previewTemplate?.name}</DialogTitle>
                        <DialogDescription>
                            {previewData?.itemCount || 0} items will be created
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {previewData && (
                            <div className="border rounded-md p-4 bg-muted/30">
                                <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(previewData.preview, null, 2)}
                                </pre>
                            </div>
                        )}

                        {previewData?.warnings && previewData.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Warnings:</h4>
                                {previewData.warnings.map((warning, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm text-yellow-600">
                                        <AlertCircle className="w-4 h-4 mt-0.5" />
                                        <span>{warning}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
