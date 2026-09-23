import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
}

export function CurrencyDisplay({ amount, className, showSign = false }: CurrencyDisplayProps) {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Format with BDT currency symbol
  const formatted = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absoluteAmount);

  // Replace default symbol if needed or ensure it's correct
  const displayString = formatted.replace('BDT', '৳').trim();

  return (
    <span className={cn('font-mono tabular-nums', isNegative && 'text-red-600', className)}>
      {isNegative ? '-' : showSign && amount > 0 ? '+' : ''}
      {displayString}
    </span>
  );
}
