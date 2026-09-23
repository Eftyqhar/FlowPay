import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Search, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
  const location = useLocation();
  const { currentUser: user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ name: 'Dashboard', path: '/' }];

    const breadcrumbs = [{ name: 'Home', path: '/' }];
    let currentPath = '';

    paths.forEach((path) => {
      currentPath += `/${path}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ name, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center text-sm text-slate-500">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-slate-900">{crumb.name}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-primary transition-colors">
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-[200px] rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
          >
            {user?.name?.charAt(0) || 'U'}
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User Name'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings/company"
                  className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
