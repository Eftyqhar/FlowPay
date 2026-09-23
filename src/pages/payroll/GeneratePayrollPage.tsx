import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useEmployeeStore } from '@/stores/employeeStore';
import { usePayrollStore } from '@/stores/payrollStore';
import { useAuthStore } from '@/stores/authStore';
import { calculateGross, calculateNet, calculateTotalDeductions } from '@/lib/salary';
import { getMonthName } from '@/lib/utils';
import { toast } from 'sonner';

export default function GeneratePayrollPage() {
  const navigate = useNavigate();
  const { employees } = useEmployeeStore();
  const { generatePayroll, getPayrollByMonth } = usePayrollStore();
  const { currentUser } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());
  
  // Per-employee adjustments
  const [adjustments, setAdjustments] = useState<Record<string, { bonus: number; overtime: number }>>({});
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // Step 1 check
  const existingPayrolls = getPayrollByMonth(parseInt(selectedMonth), parseInt(selectedYear));
  const hasExisting = existingPayrolls.length > 0;

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'active'), [employees]);

  // Initialize selected employees when step 2 loads
  const handleNextStep1 = () => {
    if (activeEmployees.length === 0) {
      toast.error('No active employees found to generate payroll');
      return;
    }
    setSelectedEmployees(activeEmployees.map(e => e.id));
    setStep(2);
  };

  const handleAdjustmentChange = (employeeId: string, field: 'bonus' | 'overtime', value: string) => {
    const numValue = Math.max(0, Number(value) || 0); // No negative values
    setAdjustments(prev => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || { bonus: 0, overtime: 0 }),
        [field]: numValue
      }
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(activeEmployees.map(e => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, id]);
    } else {
      setSelectedEmployees(prev => prev.filter(empId => empId !== id));
    }
  };

  const calculatedSalaries = useMemo(() => {
    return activeEmployees.map(emp => {
      const adj = adjustments[emp.id] || { bonus: 0, overtime: 0 };
      const gross = calculateGross(emp.basicSalary, emp.allowances, adj.bonus, adj.overtime);
      const deductions = calculateTotalDeductions(emp.deductions, emp.tax);
      const net = calculateNet(gross, deductions);

      return {
        employee: emp,
        gross,
        deductions,
        net,
        bonus: adj.bonus,
        overtime: adj.overtime
      };
    });
  }, [activeEmployees, adjustments]);

  const selectedCalculations = calculatedSalaries.filter(c => selectedEmployees.includes(c.employee.id));
  
  const summaryTotals = useMemo(() => {
    return selectedCalculations.reduce((acc, curr) => ({
      gross: acc.gross + curr.gross,
      deductions: acc.deductions + curr.deductions,
      net: acc.net + curr.net
    }), { gross: 0, deductions: 0, net: 0 });
  }, [selectedCalculations]);

  const handleGenerate = () => {
    if (selectedCalculations.length === 0) {
      toast.error('No employees selected');
      return;
    }

    try {
      const selectedEmployees = selectedCalculations.map(c => c.employee);
      generatePayroll(
        parseInt(selectedMonth),
        parseInt(selectedYear),
        selectedEmployees,
        currentUser?.name || 'Admin'
      );
      
      toast.success('Payroll generated successfully');
      navigate('/payroll');
    } catch (error) {
      toast.error('Failed to generate payroll');
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="space-y-6">
      <PageHeader title="Generate Payroll" />

      {/* Progress Indicator */}
      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6 bg-white p-4 rounded-lg shadow-sm">
        <span className={step >= 1 ? 'font-bold text-indigo-600' : ''}>1. Select Period</span>
        <span>→</span>
        <span className={step >= 2 ? 'font-bold text-indigo-600' : ''}>2. Review & Adjust</span>
        <span>→</span>
        <span className={step >= 3 ? 'font-bold text-indigo-600' : ''}>3. Confirm</span>
      </div>

      {step === 1 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-xl">
          <h3 className="text-lg font-medium mb-4">Select Payroll Period</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m} value={m.toString()}>{getMonthName(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {hasExisting && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6 text-sm">
              Warning: There are already payroll records for this period. Generating again will create additional records unless you delete the existing ones first.
            </div>
          )}
          
          <Button onClick={handleNextStep1} className="w-full">Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Review Employees & Adjustments</h3>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={selectedEmployees.length === 0}>Review & Confirm</Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedEmployees.length > 0 && selectedEmployees.length === activeEmployees.length}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead className="w-24">Bonus</TableHead>
                  <TableHead className="w-24">Overtime</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right font-bold">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculatedSalaries.map(({ employee, gross, deductions, net, bonus, overtime }) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{employee.fullName}</div>
                      <div className="text-xs text-slate-500">{employee.department}</div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      <CurrencyDisplay amount={employee.basicSalary} />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        className="h-8 text-right"
                        value={bonus}
                        onChange={(e) => handleAdjustmentChange(employee.id, 'bonus', e.target.value)}
                        disabled={!selectedEmployees.includes(employee.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        className="h-8 text-right"
                        value={overtime}
                        onChange={(e) => handleAdjustmentChange(employee.id, 'overtime', e.target.value)}
                        disabled={!selectedEmployees.includes(employee.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <CurrencyDisplay amount={gross} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-600">
                      -<CurrencyDisplay amount={deductions} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-bold">
                      <CurrencyDisplay amount={net} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex justify-end gap-6 text-sm bg-slate-50 p-4 rounded-md">
            <div>Total Selected: <span className="font-semibold">{selectedEmployees.length}</span></div>
            <div>Total Gross: <span className="font-semibold"><CurrencyDisplay amount={summaryTotals.gross} /></span></div>
            <div>Total Deductions: <span className="font-semibold text-red-600">-<CurrencyDisplay amount={summaryTotals.deductions} /></span></div>
            <div className="text-lg">Total Net: <span className="font-bold text-indigo-600"><CurrencyDisplay amount={summaryTotals.net} /></span></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">Confirm Payroll Generation</h3>
          <p className="text-slate-500 mb-8">
            You are about to generate draft payroll records for {getMonthName(parseInt(selectedMonth))} {selectedYear}.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="text-sm text-slate-500">Employees</div>
              <div className="text-xl font-bold">{selectedEmployees.length}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="text-sm text-slate-500">Gross Payroll</div>
              <div className="text-xl font-bold"><CurrencyDisplay amount={summaryTotals.gross} /></div>
            </div>
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="text-sm text-slate-500">Deductions</div>
              <div className="text-xl font-bold text-red-600"><CurrencyDisplay amount={summaryTotals.deductions} /></div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
              <div className="text-sm text-indigo-600 font-medium">Net Payroll</div>
              <div className="text-xl font-bold text-indigo-700"><CurrencyDisplay amount={summaryTotals.net} /></div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => setStep(2)}>Back to Edit</Button>
            <Button size="lg" onClick={handleGenerate}>Generate Draft Payroll</Button>
          </div>
        </div>
      )}
    </div>
  );
}
