import { Injectable } from '@nestjs/common';

export interface ProcessStep {
  id: string;
  name: string;
  type: 'task' | 'decision' | 'subprocess' | 'end';
  duration: number;
  owner: string;
  rules?: Record<string, any>;
}

export interface ProcessModel {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdDate: Date;
  executionCount: number;
}

export interface ProcessExecution {
  id: string;
  processId: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentStep: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  bottlenecks: string[];
}

@Injectable()
export class BPMAdvancedService {
  private processes: Map<string, ProcessModel> = new Map();
  private executions: ProcessExecution[] = [];
  private processCounter = 1;

  createProcess(process: Omit<ProcessModel, 'id'>): ProcessModel {
    const id = `PROC-${this.processCounter++}`;
    const newProcess: ProcessModel = {
      id,
      ...process,
      executionCount: 0,
    };
    this.processes.set(id, newProcess);
    return newProcess;
  }

  validateProcess(processId: string): { valid: boolean; errors: string[] } {
    const process = this.processes.get(processId);
    if (!process) {
      return { valid: false, errors: ['Process not found'] };
    }

    const errors: string[] = [];

    // Check for required fields
    if (!process.name || process.steps.length === 0) {
      errors.push('Process must have a name and at least one step');
    }

    // Check for start step
    const hasStart = process.steps.some((s) => s.type === 'task' || s.type === 'subprocess');
    if (!hasStart) {
      errors.push('Process must have at least one executable step');
    }

    // Check for end step
    const hasEnd = process.steps.some((s) => s.type === 'end');
    if (!hasEnd) {
      errors.push('Process must have an end step');
    }

    return { valid: errors.length === 0, errors };
  }

  executeProcess(processId: string): ProcessExecution | undefined {
    const process = this.processes.get(processId);
    if (!process || process.status === 'archived') {
      return undefined;
    }

    const execution: ProcessExecution = {
      id: `EXE-${Date.now()}`,
      processId,
      status: 'running',
      currentStep: process.steps[0]?.id || '',
      startTime: new Date(),
      bottlenecks: [],
    };

    this.executions.push(execution);
    process.executionCount++;

    return execution;
  }

  getExecutionDetails(executionId: string): ProcessExecution | undefined {
    return this.executions.find((e) => e.id === executionId);
  }

  completeExecution(executionId: string): ProcessExecution | undefined {
    const execution = this.executions.find((e) => e.id === executionId);
    if (!execution) return undefined;

    execution.status = 'completed';
    execution.endTime = new Date();
    execution.duration = (execution.endTime.getTime() - execution.startTime.getTime()) / 1000;

    return execution;
  }

  analyzeBottlenecks(processId: string): { bottlenecks: string[]; recommendations: string[] } {
    const process = this.processes.get(processId);
    if (!process) {
      return { bottlenecks: [], recommendations: [] };
    }

    const processExecutions = this.executions.filter((e) => e.processId === processId && e.status === 'completed');
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    // Analyze average step duration
    for (const step of process.steps) {
      if (step.type === 'task' && step.duration > 60) {
        bottlenecks.push(`${step.name} takes ${step.duration} minutes (high duration)`);
        recommendations.push(`Consider automating ${step.name} or assigning to faster resources`);
      }
    }

    return { bottlenecks, recommendations };
  }

  simulateProcess(processId: string): {
    totalDuration: number;
    criticalPath: string[];
    parallelizableSteps: string[];
  } {
    const process = this.processes.get(processId);
    if (!process) {
      return { totalDuration: 0, criticalPath: [], parallelizableSteps: [] };
    }

    const totalDuration = process.steps.reduce((sum, step) => sum + step.duration, 0);
    const criticalPath = process.steps
      .filter((s) => s.type === 'task' && s.duration > 30)
      .map((s) => s.name);
    const parallelizableSteps = process.steps
      .filter((s) => s.type === 'task' && s.duration < 10)
      .map((s) => s.name);

    return { totalDuration, criticalPath, parallelizableSteps };
  }
}
