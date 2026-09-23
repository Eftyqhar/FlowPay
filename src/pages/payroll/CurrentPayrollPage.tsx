import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FileText, CheckCircle, CreditCard, Edit } from 'lucide-react';
import { usePayrollStore } from '@/stores/payrollStore';
import { useAuthStore } from '@/stores/authStore';
import { getMonthName, getMonthYear, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CurrentPayrollPage() {
  const navigate = useNavigate();
  const { getPayrollByMonth, approvePayroll, markAsPaid } = usePayrollStore();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Current month logic
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const periodString = getMonthYear(currentMonth, currentYear);
  
  const payrolls = getPayrollByMonth(currentMonth, currentYear) || [];
  
  const filteredPayrolls = useMemo(() => {
    if (activeTab === 'all') return payrolls;
    return payrolls.filter(p => p.status === activeTab);
  }, [payrolls, activeTab]);

  const stats = useMemo(() => {
    return {
      totalAmount: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
      draftCount: payrolls.filter(p => p.status === 'draft').length,
      approvedCount: payrolls.filter(p => p.status === 'approved').length,
      paidCount: payrolls.filter(p => p.status === 'paid').length,
    };
  }, [payrolls]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPayrolls.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (status: 'approved' | 'paid') => {
    if (selectedIds.length === 0) return;
    
    const approverName = currentUser?.name || 'Admin';
    if (status === 'approved') {
      const draftIds = selectedIds.filter(id => payrolls.find(p => p.id === id)?.status === 'draft');
      if (draftIds.length) approvePayroll(draftIds, approverName);
    } else if (status === 'paid') {
      const approvedIds = selectedIds.filter(id => payrolls.find(p => p.id === id)?.status === 'approved');
      if (approvedIds.length) markAsPaid(approvedIds, approverName, 'bank_transfer');
    }
    
    toast.success(`Successfully updated records`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Current Payroll" description={`Payroll for ${periodString}`} />
        <Button onClick={() => navigate('/payroll/generate')}>
          Generate Payroll
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Payroll Amount"
          value={formatCurrency(stats.totalAmount)}
          icon={CreditCard}
        />
        <StatCard
          title="Draft Count"
          value={stats.draftCount.toString()}
          icon={FileText}
        />
        <StatCard
          title="Approved Count"
          value={stats.approvedCount.toString()}
          icon={CheckCircle}
        />
        <StatCard
          title="Paid Count"
          value={stats.paidCount.toString()}
          icon={CheckCircle}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-x-2">
            {selectedIds.length > 0 && (
              <>
                <Button variant="outline" onClick={() => handleBulkAction('approved')}>
                  Approve Selected
                </Button>
                <Button variant="outline" onClick={() => handleBulkAction('paid')}>
                  Mark Selected as Paid
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === filteredPayrolls.length}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Gross Salary</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right font-bold">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No payroll records found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(payroll.id)}
                        onCheckedChange={(checked) => handleSelectRow(payroll.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payroll.employeeName}</div>
                      <div className="text-xs text-slate-500">{payroll.employeeId}</div>
                    </TableCell>
                    <TableCell>{payroll.department}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <CurrencyDisplay amount={payroll.grossSalary} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-600">
                      -<CurrencyDisplay amount={payroll.totalDeductions} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-bold">
                      <CurrencyDisplay amount={payroll.netSalary} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payroll.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/payroll/${payroll.id}`}>
                              <FileText className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          {payroll.status === 'draft' && (
                            <>
                              <DropdownMenuItem onClick={() => approvePayroll([payroll.id], currentUser?.name || 'Admin')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                            </>
                          )}
                          {payroll.status === 'approved' && (
                            <DropdownMenuItem onClick={() => markAsPaid([payroll.id], currentUser?.name || 'Admin', 'bank_transfer')}>
                              <CreditCard className="mr-2 h-4 w-4" /> Mark Paid
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
