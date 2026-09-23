import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, CreditCard, FileText, Trash } from 'lucide-react';
import { usePayrollStore } from '@/stores/payrollStore';
import { useAuthStore } from '@/stores/authStore';
import { getMonthName, formatDate } from '@/lib/utils';
import { PayslipPreviewDialog } from '@/components/payslip/PayslipPreviewDialog';
import { toast } from 'sonner';

export default function PayrollDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { payrollRecords, approvePayroll, markAsPaid } = usePayrollStore();
  const { currentUser } = useAuthStore();
  const [showPayslip, setShowPayslip] = useState(false);

  const record = payrollRecords.find(p => p.id === id);

  if (!record) {
    return (
      <EmptyState
        title="Record Not Found"
        description="The payroll record you are looking for does not exist."
        action={{ label: "Back to Payroll", onClick: () => navigate('/payroll') }}
      />
    );
  }

  const handleApprove = () => {
    approvePayroll([record.id], currentUser?.name || 'Admin');
    toast.success('Payroll record approved');
  };

  const handleMarkPaid = () => {
    markAsPaid([record.id], currentUser?.name || 'Admin', 'bank_transfer');
    toast.success('Payroll marked as paid');
  };

  const periodString = `${getMonthName(record.month)} ${record.year}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Payroll Details" description={`Details for ${record.employeeName} - ${periodString}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold text-slate-700 mb-2">Earnings</h4>
              <Table className="mb-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell className="text-right tabular-nums"><CurrencyDisplay amount={record.basicSalary} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Allowances</TableCell>
                    <TableCell className="text-right tabular-nums"><CurrencyDisplay amount={record.allowances} /></TableCell>
                  </TableRow>
                  {record.bonus > 0 && (
                    <TableRow>
                      <TableCell>Bonus</TableCell>
                      <TableCell className="text-right tabular-nums"><CurrencyDisplay amount={record.bonus} /></TableCell>
                    </TableRow>
                  )}
                  {record.overtime > 0 && (
                    <TableRow>
                      <TableCell>Overtime</TableCell>
                      <TableCell className="text-right tabular-nums"><CurrencyDisplay amount={record.overtime} /></TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-slate-50 font-semibold">
                    <TableCell>Gross Salary</TableCell>
                    <TableCell className="text-right tabular-nums"><CurrencyDisplay amount={record.grossSalary} /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h4 className="font-semibold text-slate-700 mb-2">Deductions</h4>
              <Table className="mb-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Deductions</TableCell>
                    <TableCell className="text-right tabular-nums text-red-600">-<CurrencyDisplay amount={record.deductions} /></TableCell>
                  </TableRow>
                  {record.tax > 0 && (
                    <TableRow>
                      <TableCell>Tax</TableCell>
                      <TableCell className="text-right tabular-nums text-red-600">-<CurrencyDisplay amount={record.tax} /></TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-slate-50 font-semibold">
                    <TableCell>Total Deductions</TableCell>
                    <TableCell className="text-right tabular-nums text-red-600">-<CurrencyDisplay amount={record.totalDeductions} /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="flex justify-between items-center p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <span className="text-lg font-bold text-indigo-900">Net Salary</span>
                <span className="text-2xl font-bold text-indigo-700 tabular-nums"><CurrencyDisplay amount={record.netSalary} /></span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-slate-500">Name</span>
                <div className="font-medium">{record.employeeName}</div>
              </div>
              <div>
                <span className="text-sm text-slate-500">Employee ID</span>
                <div>{record.employeeId}</div>
              </div>
              <div>
                <span className="text-sm text-slate-500">Department</span>
                <div>{record.department}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-sm text-slate-500 block mb-1">Current Status</span>
                <StatusBadge status={record.status} />
              </div>
              
              {record.paymentDate && (
                <div>
                  <span className="text-sm text-slate-500 block mb-1">Payment Info</span>
                  <div className="text-sm font-medium">Paid on: {formatDate(record.paymentDate)}</div>
                  <div className="text-sm text-slate-600">Method: {record.paymentMethod}</div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 space-y-2 flex flex-col">
                {record.status === 'draft' && (
                  <>
                    <Button onClick={handleApprove} className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve Payroll
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash className="mr-2 h-4 w-4" /> Delete Draft
                    </Button>
                  </>
                )}
                {record.status === 'approved' && (
                  <Button onClick={handleMarkPaid} className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" /> Mark as Paid
                  </Button>
                )}
                {record.status === 'paid' && (
                  <Button onClick={() => setShowPayslip(true)} className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Generate Payslip
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showPayslip && (
        <PayslipPreviewDialog
          payrollRecord={record}
          open={showPayslip}
          onOpenChange={setShowPayslip}
        />
      )}
    </div>
  );
}
