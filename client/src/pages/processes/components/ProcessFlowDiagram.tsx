import React from 'react';
import { Card } from '@/components/ui/card';

interface Step {
  id: number;
  label: string;
  type: 'input' | 'approval' | 'posting' | 'notification' | 'completion';
}

interface ProcessFlowDiagramProps {
  steps: Step[];
  title?: string;
}

const stepIcons = {
  input: '📝',
  approval: '✓',
  posting: '💾',
  notification: '🔔',
  completion: '🎯'
};

const stepColors = {
  input: 'bg-blue-50 border-blue-200 text-blue-900',
  approval: 'bg-green-50 border-green-200 text-green-900',
  posting: 'bg-purple-50 border-purple-200 text-purple-900',
  notification: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  completion: 'bg-indigo-50 border-indigo-200 text-indigo-900'
};

export function ProcessFlowDiagram({ steps, title = "Process Flow" }: ProcessFlowDiagramProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`p-4 rounded-lg border-2 min-w-max ${stepColors[step.type]}`}>
              <div className="text-2xl mb-2">{stepIcons[step.type]}</div>
              <div className="text-sm font-medium">{step.label}</div>
              <div className="text-xs mt-1">Step {step.id}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="text-2xl text-muted-foreground flex-shrink-0">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}
