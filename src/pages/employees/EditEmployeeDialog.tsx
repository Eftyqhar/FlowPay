import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useDepartmentStore } from '@/stores/departmentStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateGross, calculateTotalDeductions, calculateNet } from '@/lib/salary';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  status: z.enum(['active', 'inactive']),
  basicSalary: z.coerce.number().min(0, 'Must be positive'),
  allowances: z.coerce.number().min(0, 'Must be positive'),
  bonus: z.coerce.number().min(0, 'Must be positive'),
  overtime: z.coerce.number().min(0, 'Must be positive'),
  deductions: z.coerce.number().min(0, 'Must be positive'),
  tax: z.coerce.number().min(0, 'Must be positive'),
  bankInfo: z.object({
    bankName: z.string().min(1, 'Required'),
    accountNumber: z.string().min(1, 'Required'),
    routingNumber: z.string().min(1, 'Required'),
    accountType: z.enum(['savings', 'checking'])
  })
});

type FormData = z.infer<typeof schema>;

export default function EditEmployeeDialog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees, updateEmployee } = useEmployeeStore();
  const { departments } = useDepartmentStore();

  const employee = employees.find(e => e.id === id);

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'active',
      basicSalary: 0,
      allowances: 0,
      bonus: 0,
      overtime: 0,
      deductions: 0,
      tax: 0,
    }
  });

  useEffect(() => {
    if (employee) {
      reset({
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone || '',
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        status: employee.status,
        basicSalary: employee.basicSalary,
        allowances: employee.allowances,
        bonus: employee.bonus,
        overtime: employee.overtime,
        deductions: employee.deductions,
        tax: employee.tax,
        bankInfo: employee.bankInfo || { bankName: '', accountNumber: '', routingNumber: '', accountType: 'savings' as any }
      });
    } else {
      navigate('/employees');
    }
  }, [employee, reset, navigate]);

  const basic = watch('basicSalary') || 0;
  const allowances = watch('allowances') || 0;
  const bonus = watch('bonus') || 0;
  const overtime = watch('overtime') || 0;
  const deductions = watch('deductions') || 0;
  const tax = watch('tax') || 0;
  
  const currentGross = useMemo(() => calculateGross(basic, allowances, bonus, overtime), [basic, allowances, bonus, overtime]);
  const currentTotalDeductions = useMemo(() => calculateTotalDeductions(deductions, tax), [deductions, tax]);
  const currentNet = useMemo(() => calculateNet(currentGross, currentTotalDeductions), [currentGross, currentTotalDeductions]);

  const onSubmit = (data: FormData) => {
    if (!id) return;
    updateEmployee(id, data);
    toast.success('Employee updated successfully');
    navigate(`/employees/${id}`);
  };

  if (!employee) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader 
        title="Edit Employee" 
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input value={employee.employeeId} disabled className="bg-slate-50 font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input id="designation" {...register('designation')} />
              {errors.designation && <p className="text-xs text-red-500">{errors.designation.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              Salary Components
              <div className="flex gap-4 text-sm font-normal">
                <span className="text-slate-500">Gross: <span className="font-mono text-slate-900 font-medium">{formatCurrency(currentGross)}</span></span>
                <span className="text-slate-500">Net: <span className="font-mono text-emerald-600 font-bold">{formatCurrency(currentNet)}</span></span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary *</Label>
              <Input id="basicSalary" type="number" min="0" {...register('basicSalary')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowances">Allowances</Label>
              <Input id="allowances" type="number" min="0" {...register('allowances')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus</Label>
              <Input id="bonus" type="number" min="0" {...register('bonus')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime</Label>
              <Input id="overtime" type="number" min="0" {...register('overtime')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions</Label>
              <Input id="deductions" type="number" min="0" {...register('deductions')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" type="number" min="0" {...register('tax')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankInfo.bankName">Bank Name *</Label>
              <Input id="bankInfo.bankName" {...register('bankInfo.bankName')} />
              {errors.bankInfo?.bankName && <p className="text-xs text-red-500">{errors.bankInfo.bankName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankInfo.accountNumber">Account Number *</Label>
              <Input id="bankInfo.accountNumber" {...register('bankInfo.accountNumber')} />
              {errors.bankInfo?.accountNumber && <p className="text-xs text-red-500">{errors.bankInfo.accountNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankInfo.routingNumber">Routing Number *</Label>
              <Input id="bankInfo.routingNumber" {...register('bankInfo.routingNumber')} />
              {errors.bankInfo?.routingNumber && <p className="text-xs text-red-500">{errors.bankInfo.routingNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankInfo.accountType">Account Type *</Label>
              <Controller
                name="bankInfo.accountType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={() => navigate(`/employees/${id}`)}>Cancel</Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
