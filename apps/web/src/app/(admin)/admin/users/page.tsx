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
 title: 'PROTOCOL UPDATED',
 description: 'User access status has been synchronized across the registry.',
 });
 },
 onError: (err) => {
 toast({
 title: 'MODIFICATION FAILED',
 description: err.message || 'System failed to finalize status update.',
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
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-12 animate-pulse bg-background min-h-screen">
 <div className="flex justify-between items-end mb-16">
 <div className="space-y-4">
 <div className="h-4 w-48 bg-surface-container-low rounded-full" />
 <div className="h-16 w-96 bg-surface-container-low rounded-2xl" />
 </div>
 <div className="h-12 w-48 bg-surface-container-low rounded-xl" />
 </div>
 <div className="bg-surface-container-low rounded h-[600px] border border-surface-container-lowest" />
 </div>
 );
 }

 return (
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30 shadow-inner">
 <ShieldCheck size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">User Access Protocol & Directory Registry</span>
 </div>
 <h1 className="text-5xl md:text-7xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 User <br />
 <span className="text-jumia-orange italic">Registry.</span>
 </h1>
 </div>

 <button className="bg-jumia-orange text-white px-10 py-5 rounded-2xl font-semibold text-[11px] hover:bg-jumia-orange-dark transition-all duration-700 shadow-3xl uppercase  italic flex items-center gap-4 group animate-in slide-in-from-right-8 duration-1000">
 <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> 
 Append Staff Entity
 </button>
 </div>

 {/* Registry Matrix */}
 <div className="bg-surface-container-lowest border border-surface-container-low rounded-[56px] shadow-soft overflow-hidden group">
 <div className="p-10 border-b-4 border-surface-container-low flex flex-col lg:flex-row gap-8 items-center bg-surface-container-low/20">
 <div className="relative flex-1 w-full group/search">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/search:text-jumia-orange transition-colors" size={20} />
 <input 
 type="text" 
 placeholder="SEARCH BY IDENTITY, PROTOCOL OR EMAIL..."
 className="w-full pl-16 pr-8 py-5 bg-surface-container-low border border-surface-container-lowest rounded focus:outline-none focus:border-jumia-orange/20 focus:ring-[20px] focus:ring-primary-container/5 text-xs font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 shadow-inner transition-all duration-700 uppercase tracking-widest"
 />
 </div>
 <div className="flex gap-4 w-full lg:w-auto">
 <div className="relative flex-1 lg:flex-none">
 <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={16} />
 <select className="bg-surface-container-low border border-surface-container-lowest rounded-2xl pl-12 pr-10 py-4 text-[10px] font-semibold focus:outline-none focus:border-jumia-orange/20 text-on-surface-variant appearance-none cursor-pointer uppercase  shadow-inner w-full">
 <option>ALL ROLES</option>
 <option>ADMIN</option>
 <option>STAFF</option>
 <option>AGENT</option>
 </select>
 </div>
 </div>
 </div>

 <div className="overflow-x-auto custom-scrollbar">
 <table className="w-full text-left border-collapse min-w-[900px]">
 <thead>
 <tr className="bg-surface-container-low/10 text-[10px] font-semibold uppercase  text-on-surface-variant/30 border-b-4 border-surface-container-low">
 <th className="px-10 py-8 italic">Entity Identity</th>
 <th className="px-10 py-8 italic">Protocol Role</th>
 <th className="px-10 py-8 italic">Registry Status</th>
 <th className="px-10 py-8 text-right italic">Access Control</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
 {users?.map((user) => (
 <tr key={user.id} className="hover:bg-jumia-orange-dark/5 transition-all duration-700 group/row">
 <td className="px-10 py-8">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 bg-surface-container-low rounded-sm border-2 border-surface-container-lowest flex items-center justify-center text-on-surface-variant group-hover/row:bg-jumia-orange/10 group-hover/row:text-jumia-orange transition-all duration-700 shadow-inner">
 <User size={24} />
 </div>
 <div>
 <div className="font-semibold text-sm md:text-base text-on-surface uppercase tracking-tight leading-none mb-1 group-hover/row:translate-x-2 transition-transform duration-700">
 {user.firstName} {user.lastName}
 </div>
 <div className="flex items-center gap-2 text-[9px] font-semibold text-on-surface-variant/30 uppercase  italic">
 <Mail size={10} /> {user.email}
 </div>
 </div>
 </div>
 </td>
 <td className="px-10 py-8">
 <span className={`text-[10px] px-4 py-1.5 rounded-full font-semibold border-2 uppercase  italic transition-all duration-700 ${
 user.role === 'ADMIN' ? 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20 shadow-[0_0_15px_rgba(246,139,30,0.2)]' :
 user.role === 'MODERATOR' ? 'bg-jumia-orange text-white border-on-surface' :
 user.role === 'SELLER' ? 'bg-surface-container-low text-on-surface-variant border-surface-container-lowest' :
 'bg-surface-container-low text-on-surface-variant/40 border-surface-container-lowest'
 }`}>
 {user.role}
 </span>
 </td>
 <td className="px-10 py-8">
 <div className="flex items-center gap-4">
 <div className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.5)]'} animate-pulse`} />
 <span className={`text-[10px] font-semibold uppercase  italic ${
 user.isActive ? 'text-green-500 opacity-60' : 'text-error opacity-60'
 }`}>
 {user.isActive ? 'LIVE ACCESS' : 'SUSPENDED'}
 </span>
 </div>
 </td>
 <td className="px-10 py-8 text-right">
 <div className="flex justify-end gap-3">
 <button 
 onClick={() => toggleUserStatus(user.id, user.isActive ? 'ACTIVE' : 'SUSPENDED')}
 disabled={updateStatusMutation.isPending}
 className={`p-4 rounded-2xl border duration-500 transition-all cursor-pointer shadow-soft group/btn ${
 user.isActive 
 ? 'text-error bg-error/5 border-error/10 hover:bg-error hover:text-white' 
 : 'text-green-500 bg-green-500/5 border-green-500/10 hover:bg-green-500 hover:text-white'
 }`}
 title={user.isActive ? 'REVOKE ACCESS' : 'RESTORE ACCESS'}
 >
 {user.isActive ? <ShieldAlert size={20} className="group-hover/btn:rotate-12 transition-transform" /> : <CheckCircle size={20} className="group-hover/btn:scale-110 transition-transform" />}
 </button>
 <button className="p-4 bg-surface-container-low text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-lowest rounded-2xl border border-surface-container-lowest transition-all duration-500 shadow-soft">
 <MoreVertical size={20} />
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
 );
}
