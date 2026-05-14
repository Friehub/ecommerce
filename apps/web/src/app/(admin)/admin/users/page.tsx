'use client';

import { api } from '@/trpc/react';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Search, 
  Edit2, 
  ShieldAlert, 
  CheckCircle, 
  Loader2,
  ChevronRight,
  ShieldCheck,
  User,
  Mail,
  Zap,
  MoreVertical,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data: users, isLoading } = api.admin.listAllUsers.useQuery();

  const updateStatusMutation = api.admin.updateUserStatus.useMutation({
    onSuccess: () => {
      utils.admin.listAllUsers.invalidate();
      toast({
        title: 'Status Updated',
        description: 'User access status has been successfully updated.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Update Failed',
        description: err.message || 'Could not update user status.',
        variant: 'destructive',
      });
    }
  });

  const toggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateStatusMutation.mutate({ userId, status: newStatus as any });
  };

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-j-border">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-10 w-96 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-sm" />
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-j-text text-white rounded-sm shadow-sm">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Administrator</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              User <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage system users, roles and access permissions</p>
          </div>

          <button className="bg-jumia-orange text-white px-8 py-3 rounded-sm font-black text-[10px] hover:bg-jumia-orange/90 transition-all shadow-md uppercase tracking-widest flex items-center gap-3 group">
            <UserPlus size={16} className="group-hover:scale-110 transition-transform" /> 
            Add New User
          </button>
        </div>

        {/* User Table Card */}
        <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-j-border flex flex-col lg:flex-row gap-6 items-center bg-j-background/30">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30 group-focus-within:text-jumia-orange transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="SEARCH BY NAME, EMAIL OR ROLE..."
                className="w-full pl-12 pr-6 py-3 bg-white border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange text-[11px] font-black text-j-text placeholder:font-black placeholder:text-j-text-muted/30 transition-all uppercase tracking-widest"
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30" size={14} />
                <select className="bg-white border border-j-border rounded-sm pl-10 pr-8 py-3 text-[10px] font-black focus:outline-none focus:border-jumia-orange text-j-text appearance-none cursor-pointer uppercase tracking-widest shadow-sm w-full lg:w-48">
                  <option>ALL ROLES</option>
                  <option>ADMIN</option>
                  <option>STAFF</option>
                  <option>SELLER</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-j-background text-[10px] font-black uppercase text-j-text-muted/50 tracking-widest border-b border-j-border">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {users?.map((user) => (
                  <tr key={user.id} className="hover:bg-j-background transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-j-background rounded-sm border border-j-border flex items-center justify-center text-j-text-muted group-hover:text-jumia-orange group-hover:border-jumia-orange/30 transition-all shadow-inner">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-black text-xs text-j-text uppercase tracking-tight">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-j-text-muted uppercase tracking-widest mt-1 opacity-60">
                            <Mail size={10} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] px-3 py-1 rounded-sm font-black uppercase tracking-widest border transition-all ${
                        user.role === 'ADMIN' ? 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20' :
                        user.role === 'MODERATOR' ? 'bg-j-text text-white border-j-text' :
                        'bg-j-background text-j-text-muted border-j-border'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-j-success shadow-[0_0_8px_rgba(40,167,69,0.3)]' : 'bg-j-error shadow-[0_0_8px_rgba(220,53,69,0.3)]'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          user.isActive ? 'text-j-success' : 'text-j-error'
                        }`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user.id, user.isActive ? 'ACTIVE' : 'SUSPENDED')}
                          disabled={updateStatusMutation.isPending}
                          className={`p-2 rounded-sm border transition-all shadow-sm ${
                            user.isActive 
                              ? 'text-j-error bg-red-50 border-red-100 hover:bg-j-error hover:text-white' 
                              : 'text-j-success bg-green-50 border-green-100 hover:bg-j-success hover:text-white'
                          }`}
                          title={user.isActive ? 'Suspend Access' : 'Restore Access'}
                        >
                          {user.isActive ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button className="p-2 bg-white text-j-text-muted border border-j-border rounded-sm hover:border-j-text hover:text-j-text transition-all shadow-sm">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
