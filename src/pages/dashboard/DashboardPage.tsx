import React, { useState, useMemo } from 'react';
import { useEmployeeStore } from '@/stores/employeeStore';
import { usePayrollStore } from '@/stores/payrollStore';
import { useDepartmentStore } from '@/stores/departmentStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { 
  Users, 
  Wallet, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatCurrency, getMonthName, formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const { employees } = useEmployeeStore();
  const { payrollRecords } = usePayrollStore();
  const { departments } = useDepartmentStore();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'active'), [employees]);

  // Current month stats
  const currentMonthRecords = useMemo(() => 
    payrollRecords.filter(r => r.month === selectedMonth && r.year === selectedYear),
  [payrollRecords, selectedMonth, selectedYear]);

  const totalGross = useMemo(() => 
    currentMonthRecords.reduce((sum, record) => sum + record.grossSalary, 0),
  [currentMonthRecords]);

  const totalPaid = useMemo(() => 
    currentMonthRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.netSalary, 0),
  [currentMonthRecords]);

  const totalPending = useMemo(() => 
    currentMonthRecords.filter(r => r.status !== 'paid').reduce((sum, record) => sum + record.netSalary, 0),
  [currentMonthRecords]);

  // Salary Trend (last 6 months)
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const monthRecords = payrollRecords.filter(r => r.month === m && r.year === y && r.status === 'paid');
      const gross = monthRecords.reduce((sum, r) => sum + r.grossSalary, 0);
      const net = monthRecords.reduce((sum, r) => sum + r.netSalary, 0);
      
      data.push({
        name: getMonthName(m).substring(0, 3),
        Gross: gross,
        Net: net
      });
    }
    return data;
  }, [payrollRecords, selectedMonth, selectedYear]);

  // Department Distribution
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
  const departmentData = useMemo(() => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept.name);
      // Rough approximation using basicSalary since net relies on full payroll computation
      const value = deptEmployees.reduce((sum, e) => sum + e.basicSalary, 0);
      return { name: dept.name, value };
    }).filter(d => d.value > 0);
  }, [departments, employees]);

  // Paid vs Pending by Department
  const paidPendingData = useMemo(() => {
    return departments.map(dept => {
      const deptRecords = currentMonthRecords.filter(r => r.department === dept.name);
      
      const paid = deptRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.netSalary, 0);
      const pending = deptRecords.filter(r => r.status !== 'paid').reduce((sum, r) => sum + r.netSalary, 0);
      
      return {
        name: dept.name,
        Paid: paid,
        Pending: pending
      };
    }).filter(d => d.Paid > 0 || d.Pending > 0);
  }, [departments, currentMonthRecords]);

  // Recent Activity
  const recentActivity = useMemo(() => {
    return [...payrollRecords].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  }, [payrollRecords]);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your payroll and employee statistics.</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m.toString()}>{getMonthName(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={activeEmployees.length.toString()}
          icon={Users}
        />
        <StatCard
          title="Total Monthly Payroll"
          value={formatCurrency(totalGross)}
          icon={Wallet}
        />
        <StatCard
          title="Salary Paid"
          value={formatCurrency(totalPaid)}
          icon={CheckCircle}
        />
        <StatCard
          title="Salary Pending"
          value={formatCurrency(totalPending)}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              Salary Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b'}}
                    tickFormatter={(value: number) => `৳${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Gross" stroke="#818cf8" fill="#c7d2fe" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="Net" stroke="#4f46e5" fill="#818cf8" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="w-5 h-5 text-slate-500" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChartIcon className="w-5 h-5 text-slate-500" />
              Paid vs Pending by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paidPendingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(v: number) => `৳${v/1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="Paid" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Current Month Summary</CardTitle>
            <CardDescription>{getMonthName(selectedMonth)} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                <span className="font-medium text-slate-700">Total Records</span>
                <span className="font-bold">{currentMonthRecords.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <StatusBadge status="draft" />
                  <span className="text-sm text-slate-600">Draft</span>
                </div>
                <span className="font-medium">{currentMonthRecords.filter(r => r.status === 'draft').length}</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <StatusBadge status="approved" />
                  <span className="text-sm text-slate-600">Approved</span>
                </div>
                <span className="font-medium">{currentMonthRecords.filter(r => r.status === 'approved').length}</span>
              </div>
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status="paid" />
                  <span className="text-sm text-slate-600">Paid</span>
                </div>
                <span className="font-medium">{currentMonthRecords.filter(r => r.status === 'paid').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Recent Payroll Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((record, i) => {
                return (
                  <div key={record.id}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{record.employeeName}</p>
                        <p className="text-xs text-slate-500">
                          {getMonthName(record.month)} {record.year} • {formatDate(record.paidAt || record.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium tabular-nums font-mono">{formatCurrency(record.netSalary)}</span>
                        <StatusBadge status={record.status} />
                      </div>
                    </div>
                    {i < recentActivity.length - 1 && <Separator className="my-3" />}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm">No recent activity found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
