import { Employee } from './types';

export function validateSalaryComponents(components: Record<string, number>): void {
  for (const [key, value] of Object.entries(components)) {
    if (value < 0) {
      throw new Error(`${key} cannot be negative.`);
    }
  }
}

export function calculateGross(basic: number, allowances: number, bonus: number, overtime: number): number {
  validateSalaryComponents({ basic, allowances, bonus, overtime });
  return basic + allowances + bonus + overtime;
}

export function calculateTotalDeductions(deductions: number, tax: number): number {
  validateSalaryComponents({ deductions, tax });
  return deductions + tax;
}

export function calculateNet(grossSalary: number, totalDeductions: number): number {
  if (grossSalary < totalDeductions) {
    throw new Error('Total deductions cannot exceed gross salary.');
  }
  return grossSalary - totalDeductions;
}

export function calculateFullSalary(employee: Pick<Employee, 'basicSalary' | 'allowances' | 'bonus' | 'overtime' | 'deductions' | 'tax'>): { grossSalary: number; totalDeductions: number; netSalary: number } {
  const grossSalary = calculateGross(
    employee.basicSalary,
    employee.allowances,
    employee.bonus,
    employee.overtime
  );
  
  const totalDeductions = calculateTotalDeductions(
    employee.deductions,
    employee.tax
  );
  
  const netSalary = calculateNet(grossSalary, totalDeductions);
  
  return {
    grossSalary,
    totalDeductions,
    netSalary
  };
}
