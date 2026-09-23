import { useState } from 'react';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export';

export function useExport() {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const downloadCSV = async (data: Record<string, unknown>[], filename: string) => {
    try {
      setIsExportingCSV(true);
      exportToCSV(data, filename);
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExportingCSV(false);
    }
  };

  const downloadExcel = async (data: Record<string, unknown>[], filename: string, sheetName?: string) => {
    try {
      setIsExportingExcel(true);
      exportToExcel(data, filename, sheetName);
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const downloadPDF = async (elementId: string, filename: string) => {
    try {
      setIsExportingPDF(true);
      await exportToPDF(elementId, filename);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return {
    downloadCSV,
    downloadExcel,
    downloadPDF,
    isExportingCSV,
    isExportingExcel,
    isExportingPDF,
  };
}
