import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PayrollRecord, Employee, PaymentMethod } from '@/lib/types';
import { calculateGross, calculateTotalDeductions, calculateNet, calculateFullSalary } from '@/lib/salary';
import { generateId } from '@/lib/utils';

export interface SalaryTrend {
  month: string;
  total: number;
}

export interface DepartmentSalary {
  department: string;
  total: number;
}

interface PayrollState {
  payrollRecords: PayrollRecord[];
  generatePayroll: (month: number, year: number, employees: Employee[], createdBy: string) => PayrollRecord[];
  approvePayroll: (ids: string[], approvedBy: string) => void;
  markAsPaid: (ids: string[], paidBy: string, paymentMethod: PaymentMethod) => void;
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => void;
  deletePayrollRecord: (id: string) => void;
  getPayrollByMonth: (month: number, year: number) => PayrollRecord[];
  getPayrollByEmployee: (employeeId: string) => PayrollRecord[];
  getPayrollByStatus: (status: PayrollRecord['status']) => PayrollRecord[];
  getPayrollById: (id: string) => PayrollRecord | undefined;
  getMonthlyStats: (month: number, year: number) => { total: number; paid: number; pending: number; draft: number };
  getSalaryTrends: (months: number) => SalaryTrend[];
  getDepartmentSalary: (month: number, year: number) => DepartmentSalary[];
}

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      payrollRecords: [],
      generatePayroll: (month, year, employees, createdBy) => {
        const now = new Date().toISOString();
        const records: PayrollRecord[] = employees.map((emp) => {
          const { grossSalary, totalDeductions, netSalary } = calculateFullSalary(emp);
          return {
            id: generateId(),
            employeeId: emp.id,
            employeeName: emp.fullName,
            department: emp.department,
            designation: emp.designation,
            month,
            year,
            basicSalary: emp.basicSalary,
            allowances: emp.allowances,
            bonus: emp.bonus,
            overtime: emp.overtime,
            grossSalary,
            deductions: emp.deductions,
            tax: emp.tax,
            totalDeductions,
            netSalary,
            status: 'draft',
            createdAt: now,
            createdBy,
          };
        });

        set((state) => ({
          payrollRecords: [...state.payrollRecords, ...records],
        }));

        return records;
      },
      approvePayroll: (ids, approvedBy) => {
        const now = new Date().toISOString();
        set((state) => ({
          payrollRecords: state.payrollRecords.map((record) =>
            ids.includes(record.id) && record.status === 'draft'
              ? { ...record, status: 'approved', approvedBy, approvedAt: now }
              : record
          ),
        }));
      },
      markAsPaid: (ids, paidBy, paymentMethod) => {
        const now = new Date().toISOString();
        set((state) => ({
          payrollRecords: state.payrollRecords.map((record) =>
            ids.includes(record.id) && record.status === 'approved'
              ? { ...record, status: 'paid', paidBy, paidAt: now, paymentMethod }
              : record
          ),
        }));
      },
      updatePayrollRecord: (id, updates) => {
        set((state) => {
          return {
            payrollRecords: state.payrollRecords.map((record) => {
              if (record.id === id && record.status === 'draft') {
                const newRecord = { ...record, ...updates };
                
                const grossSalary = calculateGross(newRecord.basicSalary, newRecord.allowances, newRecord.bonus, newRecord.overtime);
                const totalDeductions = calculateTotalDeductions(newRecord.deductions, newRecord.tax);
                const netSalary = calculateNet(grossSalary, totalDeductions);

                return {
                  ...newRecord,
                  grossSalary,
                  totalDeductions,
                  netSalary,
                };
              }
              return record;
            }),
          };
        });
      },
      deletePayrollRecord: (id) => {
        set((state) => ({
          payrollRecords: state.payrollRecords.filter(
            (record) => record.id !== id || record.status !== 'draft'
          ),
        }));
      },
      getPayrollByMonth: (month, year) => {
        return get().payrollRecords.filter(
          (record) => record.month === month && record.year === year
        );
      },
      getPayrollByEmployee: (employeeId) => {
        return get().payrollRecords.filter((record) => record.employeeId === employeeId);
      },
      getPayrollByStatus: (status) => {
        return get().payrollRecords.filter((record) => record.status === status);
      },
      getPayrollById: (id) => {
        return get().payrollRecords.find((record) => record.id === id);
      },
      getMonthlyStats: (month, year) => {
        const records = get().getPayrollByMonth(month, year);
        let total = 0, paid = 0, pending = 0, draft = 0;
        records.forEach((r) => {
          total += r.netSalary;
          if (r.status === 'paid') paid += r.netSalary;
          else if (r.status === 'approved') pending += r.netSalary;
          else if (r.status === 'draft') draft += r.netSalary;
        });
        return { total, paid, pending, draft };
      },
      getSalaryTrends: (monthsCount) => {
        const trends: SalaryTrend[] = [];
        const records = get().payrollRecords;
        
        let d = new Date();
        d.setMonth(d.getMonth() - monthsCount + 1);

        for (let i = 0; i < monthsCount; i++) {
          const m = d.getMonth() + 1;
          const y = d.getFullYear();
          const monthRecords = records.filter((r) => r.month === m && r.year === y);
          const total = monthRecords.reduce((acc, r) => acc + r.netSalary, 0);
          trends.push({ month: `${m}/${y}`, total });
          d.setMonth(d.getMonth() + 1);
        }
        return trends;
      },
      getDepartmentSalary: (month, year) => {
        const records = get().getPayrollByMonth(month, year);
        const deptTotals: Record<string, number> = {};
        records.forEach(r => {
            if (!deptTotals[r.department]) {
                deptTotals[r.department] = 0;
            }
            deptTotals[r.department] += r.netSalary;
        });
        return Object.entries(deptTotals).map(([department, total]) => ({ department, total }));
      },
    }),
    {
      name: 'payscale-payroll',
    }
  )
);
