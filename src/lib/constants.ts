import { UserRole, PaymentMethod, PayrollStatus, CompanySettings } from './types';

export const ROLES: { value: UserRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'hr', label: 'HR' },
  { value: 'employee', label: 'Employee' },
];

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'mobile_banking', label: 'Mobile Banking' },
];

export const PAYROLL_STATUSES: Record<PayrollStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
};

export const EMPLOYEE_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Acme Corp',
  address: '123 Business Rd, City, Country',
  phone: '+1 234 567 8900',
  email: 'info@acmecorp.com',
  currency: 'BDT',
  currencySymbol: '৳',
  fiscalYearStart: 7, // July
  defaultAllowancePercent: 10,
  defaultTaxPercent: 5,
  paymentMethods: ['bank_transfer', 'cash', 'check', 'mobile_banking'],
};

export const PERMISSIONS: Record<UserRole, string[]> = {
  owner: ['all'],
  admin: ['view_dashboard', 'manage_users', 'manage_employees', 'manage_payroll', 'manage_settings', 'view_reports', 'manage_departments'],
  accountant: ['view_dashboard', 'view_employees', 'manage_payroll', 'view_reports'],
  hr: ['view_dashboard', 'manage_employees', 'view_payroll', 'view_reports', 'manage_departments'],
  employee: ['view_dashboard', 'view_own_payroll', 'view_own_profile'],
};
