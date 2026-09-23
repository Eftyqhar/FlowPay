import { PayrollRecord } from '@/lib/types';
import { useSettingsStore } from '@/stores/settingsStore';
import { getMonthName, formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

interface PayslipTemplateProps {
  payrollRecord: PayrollRecord;
}

export function PayslipTemplate({ payrollRecord }: PayslipTemplateProps) {
  const { settings } = useSettingsStore();

  return (
    <div id="payslip-content" className="bg-white p-8 text-slate-900 w-full max-w-3xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{settings.name || 'Company Name'}</h1>
          <p className="text-sm text-slate-500">{settings.address || 'Company Address'}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-indigo-700 uppercase tracking-wider">Payslip</h2>
          <p className="text-sm text-slate-500">
            {getMonthName(payrollRecord.month)} {payrollRecord.year}
          </p>
        </div>
      </div>

      <hr className="border-slate-200 mb-6" />

      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div>
          <p><span className="font-semibold text-slate-600">Employee Name:</span> {payrollRecord.employeeName}</p>
          <p><span className="font-semibold text-slate-600">Employee ID:</span> {payrollRecord.employeeId}</p>
        </div>
        <div>
          <p><span className="font-semibold text-slate-600">Department:</span> {payrollRecord.department}</p>
          <p><span className="font-semibold text-slate-600">Period:</span> Salary for the month of {getMonthName(payrollRecord.month)} {payrollRecord.year}</p>
        </div>
      </div>

      {/* Salary Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Earnings */}
        <div>
          <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">Earnings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.basicSalary} /></span>
            </div>
            <div className="flex justify-between">
              <span>Allowances</span>
              <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.allowances} /></span>
            </div>
            {payrollRecord.bonus > 0 && (
              <div className="flex justify-between">
                <span>Bonus</span>
                <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.bonus} /></span>
              </div>
            )}
            {payrollRecord.overtime > 0 && (
              <div className="flex justify-between">
                <span>Overtime</span>
                <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.overtime} /></span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t mt-2">
              <span>Gross Salary</span>
              <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.grossSalary} /></span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">Deductions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Deductions</span>
              <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.deductions} /></span>
            </div>
            {payrollRecord.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.tax} /></span>
              </div>
            )}
            {payrollRecord.totalDeductions === 0 && (
              <div className="flex justify-between text-slate-500 italic">
                <span>No deductions</span>
                <span>-</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t mt-2">
              <span>Total Deductions</span>
              <span className="tabular-nums"><CurrencyDisplay amount={payrollRecord.totalDeductions} /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Salary Box */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-8 flex justify-between items-center">
        <div>
          <h4 className="text-indigo-900 font-bold text-lg">Net Payable</h4>
          <p className="text-sm text-indigo-700">Amount transferred to employee</p>
        </div>
        <div className="text-3xl font-bold text-indigo-700 tabular-nums">
          <CurrencyDisplay amount={payrollRecord.netSalary} />
        </div>
      </div>

      {/* Payment Info */}
      <div className="text-sm text-slate-600 mb-12">
        <p><span className="font-semibold">Payment Status:</span> {payrollRecord.status === 'paid' ? 'Paid' : 'Pending'}</p>
        {payrollRecord.paymentDate && (
          <p><span className="font-semibold">Payment Date:</span> {formatDate(payrollRecord.paymentDate)}</p>
        )}
        {payrollRecord.paymentMethod && (
          <p><span className="font-semibold">Payment Method:</span> {payrollRecord.paymentMethod}</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t">
        <p>This is a system-generated payslip and does not require a signature.</p>
        <p>Generated on {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
