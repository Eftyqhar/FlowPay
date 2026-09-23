import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useSettingsStore } from '@/stores/settingsStore';
import { PaymentMethod } from '@/lib/types';

const salarySettingsSchema = z.object({
  defaultAllowancePercent: z.number().min(0).max(100),
  defaultTaxPercent: z.number().min(0).max(100),
  minimumWage: z.number().min(0),
  overtimeMultiplier: z.number().min(1),
  paymentMethods: z.object({
    bankTransfer: z.boolean(),
    cash: z.boolean(),
    check: z.boolean(),
    mobileBanking: z.boolean()
  })
});

type SalarySettingsFormValues = z.infer<typeof salarySettingsSchema>;

export default function SalarySettingsPage() {
  const { settings, updateSettings } = useSettingsStore();

  const form = useForm<SalarySettingsFormValues>({
    resolver: zodResolver(salarySettingsSchema),
    defaultValues: {
      defaultAllowancePercent: settings?.defaultAllowancePercent || 0,
      defaultTaxPercent: settings?.defaultTaxPercent || 0,
      minimumWage: 0,
      overtimeMultiplier: 1.5,
      paymentMethods: {
        bankTransfer: settings?.paymentMethods?.includes('bank_transfer') ?? true,
        cash: settings?.paymentMethods?.includes('cash') ?? true,
        check: settings?.paymentMethods?.includes('check') ?? true,
        mobileBanking: settings?.paymentMethods?.includes('mobile_banking') ?? true,
      }
    }
  });

  const onSubmit = (data: SalarySettingsFormValues) => {
    const paymentMethods: PaymentMethod[] = [];
    if (data.paymentMethods.bankTransfer) paymentMethods.push('bank_transfer');
    if (data.paymentMethods.cash) paymentMethods.push('cash');
    if (data.paymentMethods.check) paymentMethods.push('check');
    if (data.paymentMethods.mobileBanking) paymentMethods.push('mobile_banking');

    updateSettings({
      defaultAllowancePercent: data.defaultAllowancePercent,
      defaultTaxPercent: data.defaultTaxPercent,
      paymentMethods
    });
    toast.success('Salary settings updated successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Salary Settings" description="Configure payroll defaults and rules" />
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Default Salary Components</CardTitle>
            <CardDescription>These values will be applied by default to new employees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultAllowancePercent">Default Allowance (%)</Label>
                <Input 
                  id="defaultAllowancePercent" 
                  type="number" 
                  {...form.register('defaultAllowancePercent', { valueAsNumber: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTaxPercent">Default Tax (%)</Label>
                <Input 
                  id="defaultTaxPercent" 
                  type="number" 
                  {...form.register('defaultTaxPercent', { valueAsNumber: true })} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumWage">Minimum Wage</Label>
                <Input 
                  id="minimumWage" 
                  type="number" 
                  {...form.register('minimumWage', { valueAsNumber: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overtimeMultiplier">Overtime Rate Multiplier</Label>
                <Input 
                  id="overtimeMultiplier" 
                  type="number" step="0.1" 
                  {...form.register('overtimeMultiplier', { valueAsNumber: true })} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Enable or disable payment methods available during payroll processing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <Label className="text-base">Bank Transfer</Label>
                <p className="text-sm text-muted-foreground">Direct deposit to employee bank account</p>
              </div>
              <Switch 
                checked={form.watch('paymentMethods.bankTransfer')}
                onCheckedChange={(c) => form.setValue('paymentMethods.bankTransfer', c)}
              />
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <Label className="text-base">Cash</Label>
                <p className="text-sm text-muted-foreground">Physical cash payment</p>
              </div>
              <Switch 
                checked={form.watch('paymentMethods.cash')}
                onCheckedChange={(c) => form.setValue('paymentMethods.cash', c)}
              />
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <Label className="text-base">Check</Label>
                <p className="text-sm text-muted-foreground">Company check payment</p>
              </div>
              <Switch 
                checked={form.watch('paymentMethods.check')}
                onCheckedChange={(c) => form.setValue('paymentMethods.check', c)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Mobile Banking</Label>
                <p className="text-sm text-muted-foreground">Payment via mobile financial services</p>
              </div>
              <Switch 
                checked={form.watch('paymentMethods.mobileBanking')}
                onCheckedChange={(c) => form.setValue('paymentMethods.mobileBanking', c)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save All Settings</Button>
        </div>
      </form>
    </div>
  );
}
