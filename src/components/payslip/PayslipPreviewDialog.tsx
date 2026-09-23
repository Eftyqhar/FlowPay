import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PayslipTemplate } from './PayslipTemplate';
import { PayrollRecord } from '@/lib/types';
import { Printer, Download } from 'lucide-react';
import { exportToPDF } from '@/lib/export';
import { getMonthName } from '@/lib/utils';
import { toast } from 'sonner';

interface PayslipPreviewDialogProps {
  payrollRecord: PayrollRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayslipPreviewDialog({ payrollRecord, open, onOpenChange }: PayslipPreviewDialogProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const elementId = 'payslip-content';
    if (!document.getElementById(elementId)) {
      toast.error('Could not find payslip content to generate PDF');
      return;
    }
    const filename = `Payslip_${payrollRecord.employeeName.replace(/\s+/g, '_')}_${getMonthName(payrollRecord.month)}_${payrollRecord.year}.pdf`;
    
    try {
      toast.info('Generating PDF...');
      await exportToPDF(elementId, filename);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:max-h-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Payslip Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center bg-slate-100 p-4 rounded-md print:bg-white print:p-0">
          <PayslipTemplate payrollRecord={payrollRecord} />
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
