import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Wallet, FileText, 
  BarChart3, Settings, ChevronDown, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NavItem = {
  title: string;
  icon: React.ElementType;
  path?: string;
  roles?: string[];
  subItems?: { title: string; path: string }[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      {
        title: 'Employees',
        icon: Users,
        roles: ['owner', 'admin', 'hr', 'accountant'],
        subItems: [
          { title: 'All Employees', path: '/employees' },
          { title: 'Add Employee', path: '/employees/add' },
          { title: 'Departments', path: '/departments' },
        ],
      },
      {
        title: 'Payroll',
        icon: Wallet,
        roles: ['owner', 'admin', 'accountant', 'hr'],
        subItems: [
          { title: 'Current Payroll', path: '/payroll' },
          { title: 'Payroll History', path: '/payroll/history' },
          { title: 'Generate Payroll', path: '/payroll/generate' },
        ],
      },
      { title: 'Payslips', icon: FileText, path: '/payslips' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      {
        title: 'Reports',
        icon: BarChart3,
        roles: ['owner', 'admin', 'accountant', 'hr'],
        subItems: [
          { title: 'Salary Report', path: '/reports/salary' },
          { title: 'Department Report', path: '/reports/department' },
          { title: 'Payment Report', path: '/reports/payment' },
          { title: 'Yearly Summary', path: '/reports/yearly' },
        ],
      },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      {
        title: 'Settings',
        icon: Settings,
        roles: ['owner', 'admin'],
        subItems: [
          { title: 'Company', path: '/settings/company' },
          { title: 'Users & Roles', path: '/settings/users' },
          { title: 'Salary Settings', path: '/settings/salary' },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const { currentUser: user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = (user?.role || '').toLowerCase();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <span className="text-xl font-semibold text-slate-800">PayScale</span>
      </div>

      <div className="h-[calc(100vh-8rem)] overflow-y-auto px-4 py-4 scrollbar-thin">
        {navGroups.map((group) => {
          const groupItems = group.items.filter(item => {
            if (!item.roles) return true;
            if (userRole === 'owner') return true;
            return item.roles.some(r => r.toLowerCase() === userRole);
          });

          if (groupItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </h3>
              <ul className="space-y-1">
                {groupItems.map((item) => {
                  const isActive = item.path 
                    ? location.pathname === item.path 
                    : item.subItems?.some(sub => location.pathname === sub.path);
                  const isOpen = openGroups[item.title] || isActive;

                  return (
                    <li key={item.title}>
                      {item.subItems ? (
                        <div>
                          <button
                            onClick={() => toggleGroup(item.title)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                              isActive ? "text-slate-900" : "text-slate-600"
                            )}
                          >
                            <div className="flex items-center">
                              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
                              {item.title}
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isOpen ? "rotate-180" : ""
                              )}
                            />
                          </button>
                          
                          {isOpen && (
                            <ul className="mt-1 space-y-1 pl-10 pr-2">
                              {item.subItems.map((subItem) => (
                                <li key={subItem.path}>
                                  <NavLink
                                    to={subItem.path}
                                    className={({ isActive }) =>
                                      cn(
                                        "block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-100",
                                        isActive
                                          ? "bg-primary/10 font-medium text-primary border-l-2 border-primary -ml-[2px]"
                                          : "text-slate-600"
                                      )
                                    }
                                  >
                                    {subItem.title}
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <NavLink
                          to={item.path!}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                              isActive
                                ? "bg-primary/10 text-primary border-l-2 border-primary -ml-[2px]"
                                : "text-slate-600"
                            )
                          }
                        >
                          <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.path ? "text-primary" : "text-slate-400")} />
                          {item.title}
                        </NavLink>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 flex h-16 w-full items-center justify-between border-t border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-slate-900">{user?.name || 'User Name'}</span>
            <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500 rounded bg-slate-100 px-1.5 py-0.5 w-fit">
              {user?.role || 'Role'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-red-600" title="Sign Out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
}
