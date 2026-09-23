import { useEmployeeStore } from '@/stores/employeeStore';
import { usePayrollStore } from '@/stores/payrollStore';
import { Employee } from '@/lib/types';
import { generateId } from '@/lib/utils';

export const initializeSeedData = () => {
  const { employees, addEmployee } = useEmployeeStore.getState();
  const { payrollRecords, generatePayroll, markAsPaid, approvePayroll } = usePayrollStore.getState();

  // Only seed if empty
  if (employees.length > 0 || payrollRecords.length > 0) {
    return;
  }

  const getBankInfo = () => {
    const banks = ['Sonali Bank', 'Dutch-Bangla Bank', 'BRAC Bank', 'Islami Bank', 'City Bank'];
    return {
      bankName: banks[Math.floor(Math.random() * banks.length)],
      accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      routingNumber: Math.floor(100000000 + Math.random() * 900000000).toString(),
      accountType: 'savings' as const,
    };
  };

  const seedEmployees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'employeeId'>[] = [
    // Engineering
    { fullName: 'Tanvir Hasan', email: 'tanvir@payscale.com', phone: '01711000001', designation: 'Senior Dev', department: 'Engineering', joiningDate: '2023-01-15', status: 'active', bankInfo: getBankInfo(), basicSalary: 75000, allowances: 15000, deductions: 2000, tax: 4000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Tanvir+Hasan&background=random' },
    { fullName: 'Arif Rahman', email: 'arif@payscale.com', phone: '01711000002', designation: 'Dev', department: 'Engineering', joiningDate: '2024-02-10', status: 'active', bankInfo: getBankInfo(), basicSalary: 45000, allowances: 9000, deductions: 1000, tax: 2000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Arif+Rahman&background=random' },
    { fullName: 'Nusrat Jahan', email: 'nusrat@payscale.com', phone: '01711000003', designation: 'Junior Dev', department: 'Engineering', joiningDate: '2025-06-01', status: 'active', bankInfo: getBankInfo(), basicSalary: 30000, allowances: 5000, deductions: 500, tax: 1000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Nusrat+Jahan&background=random' },
    { fullName: 'Mehedi Hasan', email: 'mehedi@payscale.com', phone: '01711000004', designation: 'QA', department: 'Engineering', joiningDate: '2024-08-20', status: 'active', bankInfo: getBankInfo(), basicSalary: 40000, allowances: 8000, deductions: 800, tax: 1500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Mehedi+Hasan&background=random' },
    { fullName: 'Shahriar Alam', email: 'shahriar@payscale.com', phone: '01711000005', designation: 'DevOps', department: 'Engineering', joiningDate: '2023-11-12', status: 'active', bankInfo: getBankInfo(), basicSalary: 60000, allowances: 12000, deductions: 1500, tax: 3000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Shahriar+Alam&background=random' },
    { fullName: 'Farhan Kabir', email: 'farhan@payscale.com', phone: '01711000006', designation: 'Tech Lead', department: 'Engineering', joiningDate: '2022-03-05', status: 'active', bankInfo: getBankInfo(), basicSalary: 100000, allowances: 20000, deductions: 3000, tax: 8000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Farhan+Kabir&background=random' },
    
    // Marketing
    { fullName: 'Sadia Afrin', email: 'sadia@payscale.com', phone: '01711000007', designation: 'Marketing Manager', department: 'Marketing', joiningDate: '2023-05-18', status: 'active', bankInfo: getBankInfo(), basicSalary: 65000, allowances: 13000, deductions: 1500, tax: 3500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Sadia+Afrin&background=random' },
    { fullName: 'Rakib Hossain', email: 'rakib@payscale.com', phone: '01711000008', designation: 'Content Writer', department: 'Marketing', joiningDate: '2024-09-01', status: 'active', bankInfo: getBankInfo(), basicSalary: 35000, allowances: 7000, deductions: 800, tax: 1500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Rakib+Hossain&background=random' },
    { fullName: 'Tariqul Islam', email: 'tariqul@payscale.com', phone: '01711000009', designation: 'SEO Specialist', department: 'Marketing', joiningDate: '2025-01-10', status: 'active', bankInfo: getBankInfo(), basicSalary: 40000, allowances: 8000, deductions: 1000, tax: 2000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Tariqul+Islam&background=random' },
    { fullName: 'Ayesha Siddiqua', email: 'ayesha@payscale.com', phone: '01711000010', designation: 'Social Media Manager', department: 'Marketing', joiningDate: '2024-11-22', status: 'active', bankInfo: getBankInfo(), basicSalary: 45000, allowances: 9000, deductions: 1000, tax: 2500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Ayesha+Siddiqua&background=random' },
    
    // Sales
    { fullName: 'Imran Khan', email: 'imran@payscale.com', phone: '01711000011', designation: 'Sales Manager', department: 'Sales', joiningDate: '2022-08-15', status: 'active', bankInfo: getBankInfo(), basicSalary: 70000, allowances: 14000, deductions: 1500, tax: 4000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Imran+Khan&background=random' },
    { fullName: 'Kamrul Hasan', email: 'kamrul@payscale.com', phone: '01711000012', designation: 'Sales Executive', department: 'Sales', joiningDate: '2025-03-10', status: 'active', bankInfo: getBankInfo(), basicSalary: 30000, allowances: 6000, deductions: 500, tax: 1000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Kamrul+Hasan&background=random' },
    { fullName: 'Rubel Mia', email: 'rubel@payscale.com', phone: '01711000013', designation: 'Sales Executive', department: 'Sales', joiningDate: '2025-04-05', status: 'active', bankInfo: getBankInfo(), basicSalary: 32000, allowances: 6000, deductions: 500, tax: 1200, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Rubel+Mia&background=random' },
    { fullName: 'Sanjida Akter', email: 'sanjida@payscale.com', phone: '01711000014', designation: 'Business Development', department: 'Sales', joiningDate: '2024-07-20', status: 'active', bankInfo: getBankInfo(), basicSalary: 50000, allowances: 10000, deductions: 1200, tax: 2500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Sanjida+Akter&background=random' },
    
    // Human Resources
    { fullName: 'Nasrin Akter', email: 'nasrin@payscale.com', phone: '01711000015', designation: 'HR Manager', department: 'Human Resources', joiningDate: '2022-10-10', status: 'active', bankInfo: getBankInfo(), basicSalary: 65000, allowances: 13000, deductions: 1500, tax: 3500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Nasrin+Akter&background=random' },
    { fullName: 'Shamim Ahmed', email: 'shamim@payscale.com', phone: '01711000016', designation: 'HR Executive', department: 'Human Resources', joiningDate: '2024-12-01', status: 'active', bankInfo: getBankInfo(), basicSalary: 35000, allowances: 7000, deductions: 800, tax: 1500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Shamim+Ahmed&background=random' },
    { fullName: 'Mitu Rahman', email: 'mitu@payscale.com', phone: '01711000017', designation: 'Recruiter', department: 'Human Resources', joiningDate: '2025-02-15', status: 'active', bankInfo: getBankInfo(), basicSalary: 40000, allowances: 8000, deductions: 1000, tax: 2000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Mitu+Rahman&background=random' },
    { fullName: 'Asif Iqbal', email: 'asif@payscale.com', phone: '01711000018', designation: 'Training Coordinator', department: 'Human Resources', joiningDate: '2024-05-20', status: 'active', bankInfo: getBankInfo(), basicSalary: 45000, allowances: 9000, deductions: 1000, tax: 2500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Asif+Iqbal&background=random' },
    
    // Finance
    { fullName: 'Fatima Khan', email: 'fatima@payscale.com', phone: '01711000019', designation: 'Finance Manager', department: 'Finance', joiningDate: '2022-12-05', status: 'active', bankInfo: getBankInfo(), basicSalary: 75000, allowances: 15000, deductions: 2000, tax: 4500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Fatima+Khan&background=random' },
    { fullName: 'Karim Islam', email: 'karim@payscale.com', phone: '01711000020', designation: 'Senior Accountant', department: 'Finance', joiningDate: '2023-09-15', status: 'active', bankInfo: getBankInfo(), basicSalary: 55000, allowances: 11000, deductions: 1200, tax: 3000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Karim+Islam&background=random' },
    { fullName: 'Habibullah Belali', email: 'habib@payscale.com', phone: '01711000021', designation: 'Junior Accountant', department: 'Finance', joiningDate: '2025-01-05', status: 'active', bankInfo: getBankInfo(), basicSalary: 30000, allowances: 6000, deductions: 500, tax: 1000, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Habibullah+Belali&background=random' },
    { fullName: 'Jannatul Ferdous', email: 'jannat@payscale.com', phone: '01711000022', designation: 'Payroll Specialist', department: 'Finance', joiningDate: '2024-11-10', status: 'active', bankInfo: getBankInfo(), basicSalary: 40000, allowances: 8000, deductions: 800, tax: 1500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Jannatul+Ferdous&background=random' },
    
    // Operations
    { fullName: 'Mahmudul Hasan', email: 'mahmudul@payscale.com', phone: '01711000023', designation: 'Operations Manager', department: 'Operations', joiningDate: '2023-04-12', status: 'active', bankInfo: getBankInfo(), basicSalary: 65000, allowances: 13000, deductions: 1500, tax: 3500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Mahmudul+Hasan&background=random' },
    { fullName: 'Sajid Ali', email: 'sajid@payscale.com', phone: '01711000024', designation: 'Office Admin', department: 'Operations', joiningDate: '2024-10-01', status: 'active', bankInfo: getBankInfo(), basicSalary: 25000, allowances: 5000, deductions: 400, tax: 500, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Sajid+Ali&background=random' },
    { fullName: 'Raju Ahmed', email: 'raju@payscale.com', phone: '01711000025', designation: 'Logistics Coordinator', department: 'Operations', joiningDate: '2025-05-20', status: 'active', bankInfo: getBankInfo(), basicSalary: 28000, allowances: 5500, deductions: 500, tax: 800, bonus: 0, overtime: 0, photo: 'https://ui-avatars.com/api/?name=Raju+Ahmed&background=random' },
  ];

  // Add all employees
  seedEmployees.forEach(emp => {
    addEmployee(emp);
  });

  const stateEmployees = useEmployeeStore.getState().employees;

  // Generate payroll for last 6 months (April 2026 - Sept 2026)
  const currentYear = 2026;
  const adminUserId = 'USR-002';
  
  for (let month = 4; month <= 9; month++) {
    // For each month add random bonus/overtime
    const employeesWithVariations = stateEmployees.map(emp => {
      return {
        ...emp,
        bonus: Math.random() > 0.7 ? Math.floor(Math.random() * 5) * 1000 : 0, // 30% chance for bonus up to 4000
        overtime: Math.random() > 0.5 ? Math.floor(Math.random() * 3000) : 0, // 50% chance for overtime up to 3000
      };
    });

    const records = generatePayroll(month, currentYear, employeesWithVariations, adminUserId);
    const ids = records.map(r => r.id);

    if (month < 9) {
      // April - August: Approve and mark as paid
      approvePayroll(ids, adminUserId);
      markAsPaid(ids, adminUserId, 'bank_transfer');
    } else {
      // September: Mix of draft, approved, and paid
      const draftIds = ids.slice(0, 8);
      const approvedIds = ids.slice(8, 16);
      const paidIds = ids.slice(16);

      approvePayroll([...approvedIds, ...paidIds], adminUserId);
      markAsPaid(paidIds, adminUserId, 'bank_transfer');
    }
  }
};
