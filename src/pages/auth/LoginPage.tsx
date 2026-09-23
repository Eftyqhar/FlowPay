import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Please enter an email address' }),
  password: z.string().min(1, { message: 'Please enter a password' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { role: 'Owner', email: 'owner@payscale.com', label: 'Owner', desc: 'Full System Access' },
  { role: 'Admin', email: 'admin@payscale.com', label: 'Admin', desc: 'Payroll & HR Admin' },
  { role: 'Accountant', email: 'accountant@payscale.com', label: 'Accountant', desc: 'Finance & Payments' },
  { role: 'HR', email: 'hr@payscale.com', label: 'HR', desc: 'Employee Management' },
  { role: 'Employee', email: 'employee@payscale.com', label: 'Employee', desc: 'My Payslips & Profile' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: 'password123',
    },
  });

  const performLogin = (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const ok = login(email, pass);
      if (ok) {
        toast.success(`Signed in successfully`);
        navigate(from, { replace: true });
      } else {
        toast.error('Invalid credentials. Please select a demo account or use password123.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    performLogin(data.email, data.password);
  };

  const handleQuickLogin = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
    performLogin(email, 'password123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col items-center bg-slate-900 px-8 py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">PayScale</h1>
          <p className="mt-1 text-sm text-slate-300">Enterprise Salary & Payroll Management</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address or Role</Label>
              <Input
                id="email"
                type="text"
                placeholder="e.g. admin@payscale.com, owner, hr"
                {...register('email')}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                <span className="text-xs text-slate-400">Default: password123</span>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Accounts Section */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                1-Click Demo Logins
              </h3>
              <span className="inline-flex items-center text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleQuickLogin(account.email)}
                  disabled={isLoading}
                  className="flex flex-col text-left rounded-md border border-slate-200 bg-white p-2.5 transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                      {account.label}
                    </span>
                    <span className="text-[10px] text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Log In →
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {account.email}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {account.desc}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              Click any role above to instantly authenticate as that user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
