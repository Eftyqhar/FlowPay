import { useState, useMemo } from 'react';
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
import { FileText, Download } from 'lucide-react';
import { usePayrollStore } from '@/stores/payrollStore';
import { PayrollRecord } from '@/lib/types';
import { getMonthName, formatDate } from '@/lib/utils';
import { exportToPDF } from '@/lib/export';
import { PayslipPreviewDialog } from '@/components/payslip/PayslipPreviewDialog';

export default function AllPayslipsPage() {
  const { payrollRecords: payrolls } = usePayrollStore();
  
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Only paid records have payslips
  const paidPayrolls = useMemo(() => payrolls.filter(p => p.status === 'paid'), [payrolls]);

  const filteredPayrolls = useMemo(() => {
    return paidPayrolls.filter(p => {
      const matchSearch = p.employeeName.toLowerCase().includes(search.toLowerCase()) || 
                          p.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchMonth = filterMonth === 'all' || p.month.toString() === filterMonth;
      const matchYear = filterYear === 'all' || p.year.toString() === filterYear;
      
      return matchSearch && matchMonth && matchYear;
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return a.employeeName.localeCompare(b.employeeName);
    });
  }, [paidPayrolls, search, filterMonth, filterYear]);

  const uniqueYears = Array.from(new Set(paidPayrolls.map(p => p.year))).sort((a, b) => b - a);

  const handlePreview = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setPreviewOpen(true);
  };

  const handleDownloadPdf = (record: PayrollRecord) => {
    // This is a simplified direct download attempt. In reality, we'd render a hidden template.
    // For this app, we could open the preview and the user can download from there,
    // or we can implement a headless PDF generation.
    // To keep it simple, we'll open preview and let them download.
    handlePreview(record);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payslips" description="View and download finalized payslips" />

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input 
            placeholder="Search employee..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="md:col-span-2"
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
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No payslips found. Only 'Paid' payroll records generate payslips.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayrolls.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.employeeName}</div>
                      <div className="text-xs text-slate-500">{record.employeeId} - {record.department}</div>
                    </TableCell>
                    <TableCell>{getMonthName(record.month)} {record.year}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">
                      <CurrencyDisplay amount={record.netSalary} />
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {record.paymentDate ? formatDate(record.paymentDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreview(record)}>
                        <FileText className="h-4 w-4 mr-1" /> Preview
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDownloadPdf(record)}>
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {previewOpen && selectedRecord && (
        <PayslipPreviewDialog
          payrollRecord={selectedRecord}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  );
}
