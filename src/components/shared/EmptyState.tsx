import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon = FileQuestion, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed rounded-lg bg-slate-50/50">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-slate-100">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
