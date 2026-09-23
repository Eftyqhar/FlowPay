import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'draft' | 'approved' | 'paid' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<StatusType, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-amber-200' },
    approved: { label: 'Approved', class: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200' },
    paid: { label: 'Paid', class: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-emerald-200' },
    active: { label: 'Active', class: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-emerald-200' },
    inactive: { label: 'Inactive', class: 'bg-slate-100 text-slate-800 hover:bg-slate-100/80 border-slate-200' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge variant="outline" className={cn('px-2.5 py-0.5 font-medium border shadow-none', config.class, className)}>
      {config.label}
    </Badge>
  );
}
