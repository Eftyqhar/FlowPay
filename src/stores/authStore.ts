import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/lib/types';

interface AuthState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  getUsersByRole: (role: UserRole) => User[];
}

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Rahim Ahmed',
    email: 'owner@payscale.com',
    role: 'owner',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'USR-002',
    name: 'Fatima Khan',
    email: 'admin@payscale.com',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'USR-003',
    name: 'Karim Islam',
    email: 'accountant@payscale.com',
    role: 'accountant',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'USR-004',
    name: 'Nasrin Akter',
    email: 'hr@payscale.com',
    role: 'hr',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'USR-005',
    name: 'Tanvir Hasan',
    email: 'employee@payscale.com',
    role: 'employee',
    employeeId: 'EMP-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  // Aliases for compatibility
  {
    id: 'USR-006',
    name: 'Habib Finance',
    email: 'finance@payscale.com',
    role: 'accountant',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'USR-007',
    name: 'Shamim Manager',
    email: 'manager@payscale.com',
    role: 'hr',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: INITIAL_USERS[0],
      users: INITIAL_USERS,
      isAuthenticated: true,
      login: (email, password) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        
        // Accept password123, admin123, or any non-empty password in demo mode
        if (password !== undefined && password !== 'password123' && password !== 'admin123' && password.trim() === '') {
          return false;
        }

        const currentUsers = get().users && get().users.length > 0 ? get().users : INITIAL_USERS;

        // Try exact match, domain interchange (@payscale.com <-> @company.com), or role name shortcut
        const user = currentUsers.find((u) => {
          if (!u.isActive) return false;
          const uEmail = u.email.toLowerCase();
          
          if (uEmail === cleanEmail) return true;
          if (uEmail.replace('@payscale.com', '@company.com') === cleanEmail) return true;
          if (uEmail.replace('@company.com', '@payscale.com') === cleanEmail) return true;
          
          // Role name shortcut (e.g. typing "admin" or "owner" as email)
          if (u.role.toLowerCase() === cleanEmail) return true;
          if (cleanEmail === 'finance' && u.role === 'accountant') return true;
          if (cleanEmail === 'manager' && u.role === 'hr') return true;

          return false;
        });

        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      addUser: (user) =>
        set((state) => ({
          users: [...state.users, user],
        })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
          currentUser:
            state.currentUser?.id === id
              ? { ...state.currentUser, ...updates }
              : state.currentUser,
        })),
      toggleUserStatus: (id) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id
              ? { ...user, isActive: !user.isActive }
              : user
          ),
        })),
      getUsersByRole: (role) => {
        return get().users.filter((user) => user.role === role);
      },
    }),
    {
      name: 'payscale-auth',
      merge: (persistedState: any, currentState: AuthState) => {
        // Ensure all INITIAL_USERS exist even if an older state was persisted
        const mergedUsers = [...INITIAL_USERS];
        if (persistedState && Array.isArray(persistedState.users)) {
          persistedState.users.forEach((u: User) => {
            if (!mergedUsers.some(mu => mu.id === u.id || mu.email.toLowerCase() === u.email.toLowerCase())) {
              mergedUsers.push(u);
            }
          });
        }
        return {
          ...currentState,
          ...persistedState,
          users: mergedUsers,
        };
      },
    }
  )
);
