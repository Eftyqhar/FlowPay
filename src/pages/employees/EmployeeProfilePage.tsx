import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '@/stores/employeeStore';
import { usePayrollStore } from '@/stores/payrollStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, UserX, UserCheck, FileText, ArrowLeft, Download, Eye } from 'lucide-react';
import { getInitials, formatDate, getMonthName, formatCurrency } from '@/lib/utils';
import { calculateFullSalary } from '@/lib/salary';
import { toast } from 'sonner';

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { employees, updateEmployee } = useEmployeeStore();
  const { getPayrollByEmployee } = usePayrollStore();

  const employee = employees.find(e => e.id === id);
  const history = id ? getPayrollByEmployee(id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
  const payslips = history.filter(h => h.status === 'paid');

  if (!employee) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/employees')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
        </Button>
        <EmptyState 
          title="Employee not found" 
          description="The employee you are looking for does not exist or has been removed." 
        />
      </div>
    );
  }

  const handleToggleStatus = () => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    updateEmployee(employee.id, { status: newStatus });
    toast.success(`Employee marked as ${newStatus}`);
  };

  const { grossSalary, totalDeductions, netSalary } = calculateFullSalary(employee);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/employees')} className="-ml-4 text-slate-500">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
      </Button>

      {/* Header Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-white">
                <AvatarImage src={employee.photo} />
                <AvatarFallback className="text-2xl font-bold">{getInitials(employee.fullName)}</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-slate-900">{employee.fullName}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-slate-600 font-medium">{employee.designation}</span>
                  <span className="text-slate-300">•</span>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">{employee.department}</Badge>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-sm">{employee.employeeId}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => navigate(`/employees/edit/${employee.id}`)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button 
                variant={employee.status === 'active' ? 'destructive' : 'default'}
                onClick={handleToggleStatus}
              >
                {employee.status === 'active' ? (
                  <><UserX className="w-4 h-4 mr-2" /> Deactivate</>
                ) : (
                  <><UserCheck className="w-4 h-4 mr-2" /> Activate</>
                )}
              </Button>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <StatusBadge status={employee.status} />
            <span className="text-sm text-slate-500">Joined {formatDate(employee.joiningDate)}</span>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Salary History</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Email Address</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone Number</p>
                    <p className="font-medium">{employee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Joining Date</p>
                    <p className="font-medium">{formatDate(employee.joiningDate)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bank Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.bankInfo ? (
                    <>
                      <div>
                        <p className="text-sm text-slate-500">Bank Name</p>
                        <p className="font-medium">{employee.bankInfo.bankName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Account Number</p>
                        <p className="font-mono font-medium">{employee.bankInfo.accountNumber || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Routing Number</p>
                          <p className="font-mono">{employee.bankInfo.routingNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Account Type</p>
                          <p className="capitalize">{employee.bankInfo.accountType || 'N/A'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm">No bank information provided.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex justify-between">
                  <span>Current Salary Details</span>
                  <CurrencyDisplay amount={netSalary} className="text-emerald-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-900 bg-slate-50 p-2 rounded">Earnings</h4>
                    <div className="flex justify-between px-2 text-sm">
                      <span className="text-slate-600">Basic</span>
                      <CurrencyDisplay amount={employee.basicSalary} />
                    </div>
                    <div className="flex justify-between px-2 text-sm">
                      <span className="text-slate-600">Allowances</span>
                      <CurrencyDisplay amount={employee.allowances} />
                    </div>
                    <div className="flex justify-between px-2 text-sm">
                      <span className="text-slate-600">Bonus</span>
                      <CurrencyDisplay amount={employee.bonus} />
                    </div>
                    <div className="flex justify-between px-2 text-sm">
                      <span className="text-slate-600">Overtime</span>
                      <CurrencyDisplay amount={employee.overtime} />
                    </div>
                    <div className="flex justify-between px-2 pt-2 border-t font-medium text-sm">
                      <span>Gross Earnings</span>
                      <CurrencyDisplay amount={grossSalary} />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 bg-slate-50 p-2 rounded">Deductions</h4>
                    <div className="flex justify-between px-2 text-sm">
                      <span className="text-slate-600">Tax</span>
                      <CurrencyDisplay amount={employee.tax} className="text-red-500" />
                    </div>
                    <div className="flex justify-between px-2 text-sm">
                      <span className="text-slate-600">Other Deductions</span>
                      <CurrencyDisplay amount={employee.deductions} className="text-red-500" />
                    </div>
                    <div className="flex justify-between px-2 pt-2 border-t font-medium text-sm">
                      <span>Total Deductions</span>
                      <CurrencyDisplay amount={totalDeductions} className="text-red-500" />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg flex justify-between items-center border border-indigo-100">
                    <span className="font-semibold text-indigo-900">Net Salary</span>
                    <CurrencyDisplay amount={netSalary} className="text-lg font-bold text-indigo-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salary History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <div className="font-medium text-slate-900">
                          {getMonthName(record.month)} {record.year}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          Gross: {formatCurrency(record.grossSalary)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {formatCurrency(record.netSalary)}
                          </div>
                          <div className="mt-1">
                            <StatusBadge status={record.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No salary history" description="This employee doesn't have any generated salary records yet." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Payslips</CardTitle>
            </CardHeader>
            <CardContent>
              {payslips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {payslips.map(record => (
                    <div key={record.id} className="border rounded-lg p-4 flex flex-col justify-between h-[140px] bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{getMonthName(record.month)} {record.year}</p>
                          <p className="text-xs text-slate-500 mt-1">Payslip #{record.id.substring(0,8).toUpperCase()}</p>
                        </div>
                        <FileText className="text-slate-400 w-5 h-5" />
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="font-mono font-bold">{formatCurrency(record.netSalary)}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No payslips available" description="Payslips will appear here once salaries are marked as paid." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
