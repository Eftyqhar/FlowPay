import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee } from '@/lib/types';
import { generateEmployeeId } from '@/lib/utils';

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'employeeId'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  toggleEmployeeStatus: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByDepartment: (dept: string) => Employee[];
  getActiveEmployees: () => Employee[];
  searchEmployees: (query: string) => Employee[];
  getNextEmployeeId: () => string;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],
      addEmployee: (employeeData) =>
        set((state) => {
          const newId = generateEmployeeId(state.employees.length);
          const now = new Date().toISOString();
          const newEmployee: Employee = {
            ...employeeData,
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            employeeId: newId,
            createdAt: now,
            updatedAt: now,
          };
          return {
            employees: [...state.employees, newEmployee],
          };
        }),
      updateEmployee: (id, updates) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString() } : emp
          ),
        })),
      toggleEmployeeStatus: (id) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id
              ? {
                  ...emp,
                  status: emp.status === 'active' ? 'inactive' : 'active',
                  updatedAt: new Date().toISOString(),
                }
              : emp
          ),
        })),
      getEmployeeById: (id) => {
        return get().employees.find((emp) => emp.id === id);
      },
      getEmployeesByDepartment: (dept) => {
        return get().employees.filter((emp) => emp.department === dept);
      },
      getActiveEmployees: () => {
        return get().employees.filter((emp) => emp.status === 'active');
      },
      searchEmployees: (query) => {
        const q = query.toLowerCase();
        return get().employees.filter(
          (emp) =>
            emp.fullName.toLowerCase().includes(q) ||
            emp.email.toLowerCase().includes(q) ||
            emp.employeeId.toLowerCase().includes(q) ||
            emp.department.toLowerCase().includes(q)
        );
      },
      getNextEmployeeId: () => {
        return generateEmployeeId(get().employees.length);
      },
    }),
    {
      name: 'payscale-employees',
    }
  )
);
