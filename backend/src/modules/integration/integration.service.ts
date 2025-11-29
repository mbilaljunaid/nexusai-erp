import { Injectable } from '@nestjs/common';

export interface Integration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'file' | 'database';
  status: 'active' | 'inactive' | 'error';
  endpoint?: string;
  credentials?: { apiKey?: string; username?: string };
  lastSyncDate?: Date;
  syncFrequency: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: { type: string; condition: Record<string, any> };
  actions: { type: string; config: Record<string, any> }[];
  status: 'active' | 'inactive';
  createdDate: Date;
  executionCount: number;
}

export interface WebhookEvent {
  id: string;
  source: string;
  eventType: string;
  payload: Record<string, any>;
  timestamp: Date;
  processed: boolean;
}

@Injectable()
export class IntegrationService {
  private integrations: Map<string, Integration> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private webhookEvents: WebhookEvent[] = [];
  private workflowCounter = 1;

  registerIntegration(integration: Integration): Integration {
    this.integrations.set(integration.id, integration);
    return integration;
  }

  getIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  testIntegration(integrationId: string): { success: boolean; message: string } {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    // Simulate API test
    const isHealthy = Math.random() > 0.1;

    if (isHealthy) {
      integration.status = 'active';
      integration.lastSyncDate = new Date();
      return { success: true, message: `Integration "${integration.name}" is healthy` };
    } else {
      integration.status = 'error';
      return { success: false, message: `Integration "${integration.name}" failed health check` };
    }
  }

  createWorkflow(workflow: Workflow): Workflow {
    const id = `WF-${this.workflowCounter++}`;
    workflow.id = id;
    this.workflows.set(id, workflow);
    return workflow;
  }

  executeWorkflow(workflowId: string): { success: boolean; executionId: string } {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status === 'inactive') {
      return { success: false, executionId: '' };
    }

    workflow.executionCount++;
    const executionId = `EXE-${Date.now()}`;

    return { success: true, executionId };
  }

  processWebhookEvent(event: WebhookEvent): { processed: boolean; message: string } {
    this.webhookEvents.push(event);

    // Find matching workflows
    let processed = false;
    for (const workflow of this.workflows.values()) {
      if (
        workflow.status === 'active' &&
        workflow.trigger.type === 'webhook' &&
        workflow.trigger.condition.source === event.source
      ) {
        this.executeWorkflow(workflow.id);
        processed = true;
      }
    }

    event.processed = true;
    return {
      processed,
      message: processed ? 'Event triggered workflows' : 'No matching workflows found',
    };
  }

  getWebhookHistory(source?: string): WebhookEvent[] {
    if (!source) {
      return this.webhookEvents;
    }
    return this.webhookEvents.filter((e) => e.source === source);
  }
}
