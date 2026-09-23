import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType; // Lucide icon
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold tabular-nums">{value}</h3>
              {trend && (
                <div
                  className={cn(
                    'flex items-center text-sm font-medium',
                    trend.value > 0 ? 'text-emerald-600' : trend.value < 0 ? 'text-red-600' : 'text-slate-600'
                  )}
                >
                  {trend.value > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : trend.value < 0 ? (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  ) : null}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {trend?.label && (
              <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
