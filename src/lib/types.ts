// User & Auth
export type UserRole = 'owner' | 'admin' | 'accountant' | 'hr' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  employeeId?: string; // link to employee record for employee role
  createdAt: string;
}

// Employee
export interface BankInfo {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'savings' | 'checking';
}

export interface Employee {
  id: string;
  employeeId: string; // display ID like EMP-001
  fullName: string;
  email: string;
  phone: string;
  photo?: string;
  department: string;
  designation: string;
  joiningDate: string;
  basicSalary: number;
  allowances: number;
  bonus: number;
  overtime: number;
  deductions: number;
  tax: number;
  bankInfo: BankInfo;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Department
export interface Department {
  id: string;
  name: string;
  head?: string;
  description?: string;
  createdAt: string;
}

// Payroll
export type PayrollStatus = 'draft' | 'approved' | 'paid';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'check' | 'mobile_banking';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  month: number; // 1-12
  year: number;
  basicSalary: number;
  allowances: number;
  bonus: number;
  overtime: number;
  grossSalary: number;
  deductions: number;
  tax: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  paidBy?: string;
  paidAt?: string;
  notes?: string;
}

// Company Settings
export interface CompanySettings {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  currencySymbol: string;
  fiscalYearStart: number; // month 1-12
  defaultAllowancePercent: number;
  defaultTaxPercent: number;
  paymentMethods: PaymentMethod[];
}

// Dashboard
export interface DashboardStats {
  totalEmployees: number;
  totalMonthlyPayroll: number;
  totalPaid: number;
  totalPending: number;
  activeEmployees: number;
}

export interface SalaryTrend {
  month: string;
  year: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
}

export interface DepartmentSalary {
  department: string;
  totalSalary: number;
  employeeCount: number;
}
