import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
import { FileText, Download } from 'lucide-react';
import { usePayrollStore } from '@/stores/payrollStore';
import { getMonthName, formatDate } from '@/lib/utils';
import { useExport } from '@/hooks/useExport';

export default function PayrollHistoryPage() {
  const { payrollRecords: payrolls } = usePayrollStore();
  const { downloadExcel, downloadCSV } = useExport();
  
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDept, setFilterDept] = useState('all');

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const matchSearch = p.employeeName.toLowerCase().includes(search.toLowerCase()) || 
                          p.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchMonth = filterMonth === 'all' || p.month.toString() === filterMonth;
      const matchYear = filterYear === 'all' || p.year.toString() === filterYear;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchDept = filterDept === 'all' || p.department === filterDept;
      
      return matchSearch && matchMonth && matchYear && matchStatus && matchDept;
    }).sort((a, b) => {
      // Sort by year, then month, then name descending
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return a.employeeName.localeCompare(b.employeeName);
    });
  }, [payrolls, search, filterMonth, filterYear, filterStatus, filterDept]);

  // Group by month/year for separators
  const groupedPayrolls = useMemo(() => {
    const groups = new Map<string, typeof payrolls>();
    filteredPayrolls.forEach(p => {
      const key = `${getMonthName(p.month)} ${p.year}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    });
    return groups;
  }, [filteredPayrolls]);

  const uniqueDepartments = Array.from(new Set(payrolls.map(p => p.department)));
  const uniqueYears = Array.from(new Set(payrolls.map(p => p.year))).sort((a, b) => b - a);

  const handleExportCSV = () => {
    downloadCSV(filteredPayrolls as unknown as Record<string, unknown>[], 'payroll_history');
  };

  const handleExportExcel = () => {
    downloadExcel(filteredPayrolls as unknown as Record<string, unknown>[], 'payroll_history');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Payroll History" description="View past and current payroll records" />
        <div className="space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <Input 
            placeholder="Search employee..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {Array.from({length: 12}).map((_, i) => (
                <SelectItem key={i} value={i.toString()}>{getMonthName(i)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {uniqueYears.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Gross Salary</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No payroll records match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                Array.from(groupedPayrolls.entries()).map(([groupName, records]) => (
                  <React.Fragment key={groupName}>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableCell colSpan={7} className="font-semibold text-slate-700 py-2">
                        {groupName} - Total: <CurrencyDisplay amount={records.reduce((s, r) => s + r.netSalary, 0)} />
                      </TableCell>
                    </TableRow>
                    {records.map(payroll => (
                      <TableRow key={payroll.id}>
                        <TableCell>
                          <div className="font-medium">{payroll.employeeName}</div>
                          <div className="text-xs text-slate-500">{payroll.employeeId}</div>
                        </TableCell>
                        <TableCell>{payroll.department}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          <CurrencyDisplay amount={payroll.grossSalary} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-bold">
                          <CurrencyDisplay amount={payroll.netSalary} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payroll.status} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {payroll.paymentDate ? formatDate(payroll.paymentDate) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/payroll/${payroll.id}`}>
                              <FileText className="h-4 w-4 mr-1" /> View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
