/**
 * Workflow Engine - Phase 4
 * Orchestrates form status transitions and workflow logic
 */

import type { FormMetadataAdvanced } from "@shared/types/metadata";

export interface WorkflowTransition {
  fromStatus: string;
  toStatus: string;
  permissions: string[];
  conditions?: { field: string; value: any }[];
  actions?: { type: string; config: any }[];
}

export interface WorkflowState {
  id: string;
  formId: string;
  recordId: string;
  currentStatus: string;
  previousStatus?: string;
  transitions: WorkflowTransition[];
  allowedNextStatuses: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class WorkflowEngine {
  private workflowStates: Map<string, WorkflowState> = new Map();

  /**
   * Initialize workflow for a form record
   */
  initializeWorkflow(
    formId: string,
    recordId: string,
    metadata: FormMetadataAdvanced,
    userId?: string
  ): WorkflowState {
    const initialStatus = metadata.statusWorkflow?.[0]?.fromStatus || "draft";
    const transitions = (metadata.statusWorkflow || []).map(t => ({
      ...t,
      permissions: t.permissions || []
    }));

    const state: WorkflowState = {
      id: `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      formId,
      recordId,
      currentStatus: initialStatus,
      transitions,
      allowedNextStatuses: this.getAllowedTransitions(initialStatus, transitions).map(
        (t) => t.toStatus
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };

    const key = `${formId}-${recordId}`;
    this.workflowStates.set(key, state);
    return state;
  }

  /**
   * Transition to next status
   */
  async transitionStatus(
    formId: string,
    recordId: string,
    toStatus: string,
    userId?: string,
    metadata?: FormMetadataAdvanced
  ): Promise<{ success: boolean; newState?: WorkflowState; error?: string }> {
    const key = `${formId}-${recordId}`;
    const currentState = this.workflowStates.get(key);

    if (!currentState) {
      return { success: false, error: "Workflow state not found" };
    }

    // Check if transition is allowed
    if (!currentState.allowedNextStatuses.includes(toStatus)) {
      return {
        success: false,
        error: `Cannot transition from ${currentState.currentStatus} to ${toStatus}`,
      };
    }

    // Check permissions
    const transition = currentState.transitions.find(
      (t) => t.fromStatus === currentState.currentStatus && t.toStatus === toStatus
    );

    if (transition && userId && !this.hasPermission(userId, transition.permissions)) {
      return { success: false, error: "User does not have permission to perform this transition" };
    }

    // Update state
    currentState.previousStatus = currentState.currentStatus;
    currentState.currentStatus = toStatus;
    currentState.updatedAt = new Date();
    currentState.updatedBy = userId;

    // Update allowed next statuses
    currentState.allowedNextStatuses = this.getAllowedTransitions(toStatus, currentState.transitions).map(
      (t) => t.toStatus
    );

    return { success: true, newState: currentState };
  }

  /**
   * Get allowed transitions from current status
   */
  private getAllowedTransitions(fromStatus: string, transitions: WorkflowTransition[]): WorkflowTransition[] {
    return transitions.filter((t) => t.fromStatus === fromStatus);
  }

  /**
   * Check user permissions
   */
  private hasPermission(userId: string, permissions: string[]): boolean {
    // In a real system, this would check actual user roles
    // For now, accept if any permission is required or admin/manager
    return permissions.length === 0 || permissions.includes("*") || userId.includes("admin");
  }

  /**
   * Get workflow state
   */
  getWorkflowState(formId: string, recordId: string): WorkflowState | null {
    return this.workflowStates.get(`${formId}-${recordId}`) || null;
  }

  /**
   * Get all workflow states for form
   */
  getWorkflowStatesForForm(formId: string): WorkflowState[] {
    const states: WorkflowState[] = [];
    for (const [key, state] of this.workflowStates) {
      if (key.startsWith(`${formId}-`)) {
        states.push(state);
      }
    }
    return states;
  }

  /**
   * Get workflow history
   */
  getWorkflowHistory(formId: string, recordId: string): { status: string; updatedAt: Date; updatedBy?: string }[] {
    // In a real system, this would query an audit log
    const state = this.getWorkflowState(formId, recordId);
    if (!state) return [];

    return [
      {
        status: state.currentStatus,
        updatedAt: state.updatedAt,
        updatedBy: state.updatedBy,
      },
    ];
  }
}

export const workflowEngine = new WorkflowEngine();
