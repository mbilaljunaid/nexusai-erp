import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Play } from 'lucide-react';
import { supabase } from '@/lib/db';
import { CSPlaybook, PlaybookAction } from '@/services/customerSuccessService';
import { StandardPage } from "@/components/layout/StandardPage";


export default function PlaybookBuilder() {
    const [playbooks, setPlaybooks] = useState<CSPlaybook[]>([]);
    const [selectedPlaybook, setSelectedPlaybook] = useState<CSPlaybook | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadPlaybooks();
    }, []);

    const loadPlaybooks = async () => {
        const { data, error } = await supabase
            .from('cs_playbooks')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPlaybooks(data);
        }
    };

    const createNewPlaybook = () => {
        const newPlaybook: Partial<CSPlaybook> = {
            name: '',
            description: '',
            trigger_type: 'health_decline',
            trigger_conditions: {},
            actions: [],
            priority: 0,
            is_active: true
        };
        setSelectedPlaybook(newPlaybook as CSPlaybook);
        setIsCreating(true);
    };

    const savePlaybook = async () => {
        if (!selectedPlaybook) return;

        const { data, error } = await supabase
            .from('cs_playbooks')
            .upsert(selectedPlaybook)
            .select()
            .single();

        if (!error) {
            await loadPlaybooks();
            setIsCreating(false);
            alert('Playbook saved successfully!');
        } else {
            alert('Error saving playbook: ' + error.message);
        }
    };

    const deletePlaybook = async (id: string) => {
        if (!confirm('Are you sure you want to delete this playbook?')) return;

        const { error } = await supabase
            .from('cs_playbooks')
            .delete()
            .eq('id', id);

        if (!error) {
            await loadPlaybooks();
            setSelectedPlaybook(null);
        }
    };

    const addAction = () => {
        if (!selectedPlaybook) return;

        const newAction: PlaybookAction = {
            type: 'email',
            delay_days: 0
        };

        setSelectedPlaybook({
            ...selectedPlaybook,
            actions: [...(selectedPlaybook.actions || []), newAction]
        });
    };

    const removeAction = (index: number) => {
        if (!selectedPlaybook) return;

        const updatedActions = selectedPlaybook.actions.filter((_, i) => i !== index);
        setSelectedPlaybook({
            ...selectedPlaybook,
            actions: updatedActions
        });
    };

    const updateAction = (index: number, field: keyof PlaybookAction, value: any) => {
        if (!selectedPlaybook) return;

        const updatedActions = [...selectedPlaybook.actions];
        updatedActions[index] = {
            ...updatedActions[index],
            [field]: value
        };

        setSelectedPlaybook({
            ...selectedPlaybook,
            actions: updatedActions
        });
    };

    return (
        <StandardPage title="Playbook Builder">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-gray-500 mt-1">
                        Create automated workflows for customer success
                    </p>
                </div>
                <Button onClick={createNewPlaybook}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Playbook
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Playbooks List */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Playbooks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {playbooks.map((playbook) => (
                                <div
                                    key={playbook.id}
                                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedPlaybook?.id === playbook.id ? 'bg-blue-50 border-blue-500' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedPlaybook(playbook);
                                        setIsCreating(false);
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium">{playbook.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {playbook.trigger_type.replace('_', ' ')}
                                            </div>
                                        </div>
                                        <Badge variant={playbook.is_active ? 'default' : 'secondary'}>
                                            {playbook.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {playbook.actions.length} actions · Executed {playbook.execution_count} times
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Playbook Editor */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>
                            {isCreating ? 'New Playbook' : selectedPlaybook?.name || 'Select a Playbook'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedPlaybook ? (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <Label>Playbook Name</Label>
                                        <Input
                                            value={selectedPlaybook.name}
                                            onChange={(e) => setSelectedPlaybook({ ...selectedPlaybook, name: e.target.value })}
                                            placeholder="e.g., Health Decline Response"
                                        />
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={selectedPlaybook.description || ''}
                                            onChange={(e) => setSelectedPlaybook({ ...selectedPlaybook, description: e.target.value })}
                                            placeholder="Describe when this playbook should execute"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Trigger Type</Label>
                                            <Select
                                                value={selectedPlaybook.trigger_type}
                                                onValueChange={(value) => setSelectedPlaybook({
                                                    ...selectedPlaybook,
                                                    trigger_type: value as any
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="health_decline">Health Decline</SelectItem>
                                                    <SelectItem value="churn_risk">Churn Risk</SelectItem>
                                                    <SelectItem value="milestone">Milestone</SelectItem>
                                                    <SelectItem value="renewal">Renewal</SelectItem>
                                                    <SelectItem value="onboarding">Onboarding</SelectItem>
                                                    <SelectItem value="expansion_opportunity">Expansion Opportunity</SelectItem>
                                                    <SelectItem value="usage_threshold">Usage Threshold</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Priority</Label>
                                            <Input
                                                type="number"
                                                value={selectedPlaybook.priority}
                                                onChange={(e) => setSelectedPlaybook({
                                                    ...selectedPlaybook,
                                                    priority: parseInt(e.target.value) || 0
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Trigger Conditions (JSON)</Label>
                                        <Textarea
                                            value={JSON.stringify(selectedPlaybook.trigger_conditions, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    const conditions = JSON.parse(e.target.value);
                                                    setSelectedPlaybook({ ...selectedPlaybook, trigger_conditions: conditions });
                                                } catch (error) {
                                                    // Invalid JSON, do nothing
                                                }
                                            }}
                                            placeholder='{"health_score_below": 60, "days_inactive": 14}'
                                            rows={3}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <Label className="text-lg">Actions</Label>
                                        <Button size="sm" onClick={addAction}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Action
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedPlaybook.actions.map((action, index) => (
                                            <Card key={index} className="bg-gray-50">
                                                <CardContent className="pt-4">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="flex-1 space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <Label className="text-xs">Action Type</Label>
                                                                    <Select
                                                                        value={action.type}
                                                                        onValueChange={(value) => updateAction(index, 'type', value)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="email">Send Email</SelectItem>
                                                                            <SelectItem value="task">Create Task</SelectItem>
                                                                            <SelectItem value="notification">Send Notification</SelectItem>
                                                                            <SelectItem value="webhook">Webhook</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div>
                                                                    <Label className="text-xs">Delay (days)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={action.delay_days || 0}
                                                                        onChange={(e) => updateAction(index, 'delay_days', parseInt(e.target.value) || 0)}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {action.type === 'email' && (
                                                                <div>
                                                                    <Label className="text-xs">Template ID</Label>
                                                                    <Input
                                                                        value={action.template_id || ''}
                                                                        onChange={(e) => updateAction(index, 'template_id', e.target.value)}
                                                                        placeholder="Email template ID"
                                                                    />
                                                                </div>
                                                            )}

                                                            {action.type === 'task' && (
                                                                <div>
                                                                    <Label className="text-xs">Task Description</Label>
                                                                    <Textarea
                                                                        value={action.description || ''}
                                                                        onChange={(e) => updateAction(index, 'description', e.target.value)}
                                                                        placeholder="What should the task say?"
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                            )}

                                                            {action.type === 'notification' && (
                                                                <div>
                                                                    <Label className="text-xs">Message</Label>
                                                                    <Input
                                                                        value={action.message || ''}
                                                                        onChange={(e) => updateAction(index, 'message', e.target.value)}
                                                                        placeholder="Notification message"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => removeAction(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between pt-4 border-t">
                                    <div className="space-x-2">
                                        <Button variant="outline" onClick={() => setSelectedPlaybook(null)}>
                                            Cancel
                                        </Button>
                                        {!isCreating && (
                                            <Button variant="destructive" onClick={() => deletePlaybook(selectedPlaybook.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-x-2">
                                        <Button variant="outline">
                                            <Play className="h-4 w-4 mr-2" />
                                            Test
                                        </Button>
                                        <Button onClick={savePlaybook}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Playbook
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                Select a playbook to edit or create a new one
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
