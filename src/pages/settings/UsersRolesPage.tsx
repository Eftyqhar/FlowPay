import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/utils';
import { UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function UsersRolesPage() {
  const { currentUser: user } = useAuthStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Mock data for users since we don't have a specific users store mentioned
  const [users, setUsers] = useState([
    { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'Owner', status: 'active', createdDate: new Date().toISOString() },
    { id: '2', name: 'HR Manager', email: 'hr@company.com', role: 'HR', status: 'active', createdDate: new Date().toISOString() }
  ]);

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    toast.success('User status updated');
  };

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Role', key: 'role', cell: (item: any) => <Badge variant="outline">{item.role}</Badge> },
    { header: 'Status', key: 'status', cell: (item: any) => <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge> },
    { header: 'Created', key: 'createdDate', cell: (item: any) => formatDate(item.createdDate) },
    { header: 'Actions', key: 'actions', cell: (item: any) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => toggleStatus(item.id)}>
          Toggle Status
        </Button>
      </div>
    )}
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddOpen(false);
    toast.success('User added successfully');
    // In a real app, you would add the user to the store here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Users & Roles" description="Manage system access and permissions" />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select required defaultValue="Employee">
                  <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable data={users} columns={columns} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions Reference</CardTitle>
          <CardDescription>Understanding system access levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="p-3 border">Feature</th>
                  <th className="p-3 border">Owner/Admin</th>
                  <th className="p-3 border">HR</th>
                  <th className="p-3 border">Accountant</th>
                  <th className="p-3 border">Employee</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-3 border font-medium">Dashboard</td><td className="p-3 border">Full Access</td><td className="p-3 border">Full Access</td><td className="p-3 border">Full Access</td><td className="p-3 border">Own Data Only</td></tr>
                <tr><td className="p-3 border font-medium">Employees</td><td className="p-3 border">Full Access</td><td className="p-3 border">Full Access</td><td className="p-3 border">View Only</td><td className="p-3 border">Own Profile Only</td></tr>
                <tr><td className="p-3 border font-medium">Payroll</td><td className="p-3 border">Full Access</td><td className="p-3 border">View Only</td><td className="p-3 border">Full Access</td><td className="p-3 border">Own Payslips Only</td></tr>
                <tr><td className="p-3 border font-medium">Settings</td><td className="p-3 border">Full Access</td><td className="p-3 border">No Access</td><td className="p-3 border">No Access</td><td className="p-3 border">No Access</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
