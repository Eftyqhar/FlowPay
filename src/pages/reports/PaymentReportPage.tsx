import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { usePayrollStore } from '@/stores/payrollStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { formatCurrency, getMonthName, formatDate } from '@/lib/utils';
import { DataTable } from '@/components/shared/DataTable';
import { exportToExcel } from '@/lib/export';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS = { paid: '#10b981', pending: '#f59e0b', draft: '#64748b' };

export default function PaymentReportPage() {
  const { payrollRecords: payrolls } = usePayrollStore();
  const { employees } = useEmployeeStore();

  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredData = useMemo(() => {
    return payrolls.filter(p => p.month.toString() === month && p.year.toString() === year && (methodFilter === 'all' || p.paymentMethod === methodFilter));
  }, [payrolls, month, year, methodFilter]);

  const summary = useMemo(() => {
    const s = { paid: 0, pending: 0, draft: 0, total: 0 };
    filteredData.forEach(p => {
      s[p.status as keyof typeof s] += p.netSalary;
      s.total += p.netSalary;
    });
    return s;
  }, [filteredData]);

  const methodSummary = useMemo(() => {
    const m: Record<string, number> = {};
    filteredData.filter(p => p.status === 'paid').forEach(p => {
      const method = p.paymentMethod || 'Unknown';
      m[method] = (m[method] || 0) + p.netSalary;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const tableData = useMemo(() => {
    return filteredData.map(p => {
      const emp = employees.find(e => e.id === p.employeeId);
      return {
        id: p.id,
        name: emp ? emp.fullName : 'Unknown',
        month: `${getMonthName(p.month)} ${p.year}`,
        net: p.netSalary,
        status: p.status,
        method: p.paymentMethod || '-',
        date: p.paymentDate ? formatDate(p.paymentDate) : '-'
      };
    });
  }, [filteredData, employees]);

  const columns = [
    { header: 'Employee', key: 'name' },
    { header: 'Month', key: 'month' },
    { header: 'Net Salary', key: 'net', cell: (item: any) => formatCurrency(item.net) },
    { header: 'Status', key: 'status', cell: (item: any) => <Badge variant={item.status === 'paid' ? 'default' : 'secondary'}>{item.status}</Badge> },
    { header: 'Payment Method', key: 'method' },
    { header: 'Payment Date', key: 'date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Payment Report" description="Paid vs Pending salary report" />
        <Button variant="outline" onClick={() => exportToExcel(tableData, 'payment-report')}><Download className="w-4 h-4 mr-2"/> Export</Button>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-4">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {Array.from({length: 12}).map((_, i) => (
                <SelectItem key={i+1} value={(i+1).toString()}>{getMonthName(i+1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Check">Check</SelectItem>
              <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader><CardTitle className="text-emerald-800">Total Paid</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-emerald-600">{formatCurrency(summary.paid)}</p></CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader><CardTitle className="text-amber-800">Total Pending</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-amber-600">{formatCurrency(summary.pending)}</p></CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader><CardTitle className="text-slate-800">Total Draft</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-slate-600">{formatCurrency(summary.draft)}</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Status Overview</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Paid', value: summary.paid },
                  { name: 'Pending', value: summary.pending },
                  { name: 'Draft', value: summary.draft }
                ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                  <Cell fill={STATUS_COLORS.paid} />
                  <Cell fill={STATUS_COLORS.pending} />
                  <Cell fill={STATUS_COLORS.draft} />
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Detailed Payments</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={tableData} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
