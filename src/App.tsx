import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { initializeSeedData } from '@/lib/seedData';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Employees
import AllEmployeesPage from '@/pages/employees/AllEmployeesPage';
import AddEmployeePage from '@/pages/employees/AddEmployeePage';
import EmployeeProfilePage from '@/pages/employees/EmployeeProfilePage';
import DepartmentsPage from '@/pages/employees/DepartmentsPage';

// Payroll
import CurrentPayrollPage from '@/pages/payroll/CurrentPayrollPage';
import GeneratePayrollPage from '@/pages/payroll/GeneratePayrollPage';
import PayrollHistoryPage from '@/pages/payroll/PayrollHistoryPage';
import PayrollDetailPage from '@/pages/payroll/PayrollDetailPage';

// Payslips
import AllPayslipsPage from '@/pages/payslips/AllPayslipsPage';

// Reports
import SalaryReportPage from '@/pages/reports/SalaryReportPage';
import DepartmentReportPage from '@/pages/reports/DepartmentReportPage';
import PaymentReportPage from '@/pages/reports/PaymentReportPage';
import YearlySummaryPage from '@/pages/reports/YearlySummaryPage';

// Settings
import CompanySettingsPage from '@/pages/settings/CompanySettingsPage';
import UsersRolesPage from '@/pages/settings/UsersRolesPage';
import SalarySettingsPage from '@/pages/settings/SalarySettingsPage';

export function App() {
  useEffect(() => {
    initializeSeedData();
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Employee Management */}
            <Route path="employees">
              <Route index element={<AllEmployeesPage />} />
              <Route path="add" element={<AddEmployeePage />} />
              <Route path=":id" element={<EmployeeProfilePage />} />
            </Route>
            <Route path="departments" element={<DepartmentsPage />} />

            {/* Payroll Management */}
            <Route path="payroll">
              <Route index element={<CurrentPayrollPage />} />
              <Route path="generate" element={<GeneratePayrollPage />} />
              <Route path="history" element={<PayrollHistoryPage />} />
              <Route path=":id" element={<PayrollDetailPage />} />
            </Route>

            <Route path="payslips" element={<AllPayslipsPage />} />

            {/* Analytics & Reports */}
            <Route path="reports">
              <Route path="salary" element={<SalaryReportPage />} />
              <Route path="department" element={<DepartmentReportPage />} />
              <Route path="payment" element={<PaymentReportPage />} />
              <Route path="yearly" element={<YearlySummaryPage />} />
            </Route>

            {/* System Settings */}
            <Route path="settings">
              <Route path="company" element={<CompanySettingsPage />} />
              <Route path="users" element={<UsersRolesPage />} />
              <Route path="salary" element={<SalarySettingsPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
