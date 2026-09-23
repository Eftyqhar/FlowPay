import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { usePayrollStore } from '@/stores/payrollStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useDepartmentStore } from '@/stores/departmentStore';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export';

export default function SalaryReportPage() {
  const { payrollRecords: payrolls } = usePayrollStore();
  const { employees } = useEmployeeStore();
  const { departments } = useDepartmentStore();

  const [month, setMonth] = useState<string>('all');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const emp = employees.find(e => e.id === p.employeeId);
      if (!emp) return false;
      
      const matchMonth = month === 'all' || p.month.toString() === month;
      const matchYear = p.year.toString() === year;
      const matchSearch = emp.fullName.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || emp.department === deptFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchMonth && matchYear && matchSearch && matchDept && matchStatus;
    });
  }, [payrolls, employees, month, year, search, deptFilter, statusFilter]);

  const stats = useMemo(() => {
    return filteredPayrolls.reduce((acc, curr) => ({
      gross: acc.gross + curr.grossSalary,
      deductions: acc.deductions + curr.totalDeductions,
      tax: acc.tax + curr.tax,
      net: acc.net + curr.netSalary
    }), { gross: 0, deductions: 0, tax: 0, net: 0 });
  }, [filteredPayrolls]);

  const chartData = useMemo(() => {
    const dataByMonth: Record<number, { name: string; gross: number; net: number }> = {};
    filteredPayrolls.forEach(p => {
      if (!dataByMonth[p.month]) {
        dataByMonth[p.month] = { name: getMonthName(p.month), gross: 0, net: 0 };
      }
      dataByMonth[p.month].gross += p.grossSalary;
      dataByMonth[p.month].net += p.netSalary;
    });
    return Object.values(dataByMonth).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.name) - months.indexOf(b.name);
    });
  }, [filteredPayrolls]);

  const tableData = useMemo(() => {
    return filteredPayrolls.map(p => {
      const emp = employees.find(e => e.id === p.employeeId);
      return {
        id: p.id,
        name: emp ? emp.fullName : 'Unknown',
        department: emp ? emp.department : 'N/A',
        period: `${getMonthName(p.month)} ${p.year}`,
        basic: p.basicSalary,
        allowances: p.allowances,
        bonus: p.bonus || 0,
        overtime: p.overtime,
        gross: p.grossSalary,
        deductions: p.totalDeductions,
        tax: p.tax,
        net: p.netSalary,
        status: p.status
      };
    });
  }, [filteredPayrolls, employees]);

  const columns = [
    { key: 'name', header: 'Employee' },
    { key: 'department', header: 'Department' },
    { key: 'period', header: 'Period' },
    { key: 'basic', header: 'Basic', cell: (item: any) => formatCurrency(item.basic) },
    { key: 'gross', header: 'Gross', cell: (item: any) => formatCurrency(item.gross) },
    { key: 'deductions', header: 'Deductions', cell: (item: any) => formatCurrency(item.deductions) },
    { key: 'net', header: 'Net', cell: (item: any) => formatCurrency(item.net) },
    { key: 'status', header: 'Status' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Salary Report" description="Comprehensive salary and payroll report" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(tableData, 'salary-report')}><FileText className="w-4 h-4 mr-2"/> CSV</Button>
          <Button variant="outline" onClick={() => exportToExcel(tableData, 'salary-report')}><FileSpreadsheet className="w-4 h-4 mr-2"/> Excel</Button>
          <Button variant="outline" onClick={() => exportToPDF('salary-report', 'salary-report')}><Download className="w-4 h-4 mr-2"/> PDF</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {Array.from({length: 12}).map((_, i) => (
                <SelectItem key={i+1} value={(i+1).toString()}>{getMonthName(i+1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Gross Salary" value={formatCurrency(stats.gross)} icon={FileText} />
        <StatCard title="Total Deductions" value={formatCurrency(stats.deductions)} icon={FileText} />
        <StatCard title="Total Tax" value={formatCurrency(stats.tax)} icon={FileText} />
        <StatCard title="Total Net Salary" value={formatCurrency(stats.net)} icon={FileText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Salary Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="gross" fill="#8884d8" name="Gross Salary" />
              <Bar dataKey="net" fill="#82ca9d" name="Net Salary" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card id="salary-report">
        <CardHeader>
          <CardTitle>Detailed Salary Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={tableData} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
