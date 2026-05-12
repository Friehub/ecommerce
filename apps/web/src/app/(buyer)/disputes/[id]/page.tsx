'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { 
  ChevronLeft, 
  Send, 
  User, 
  Store, 
  ShieldAlert, 
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DisputeThreadPage() {
  const { id } = useParams() as { id: string };
  const utils = api.useUtils();
  const [message, setMessage] = useState('');

  const { data: dispute, isLoading } = api.dispute.getThread.useQuery({ disputeId: id });
  
  const sendMessage = api.dispute.respond.useMutation({
    onSuccess: () => {
      setMessage('');
      utils.dispute.getThread.invalidate({ disputeId: id });
    }
  });

  const escalate = api.dispute.escalate.useMutation({
    onSuccess: () => {
      utils.dispute.getThread.invalidate({ disputeId: id });
      alert('Dispute escalated to support!');
    }
  });

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const resolveDispute = api.admin.resolveDispute.useMutation({
    onSuccess: () => {
      utils.dispute.getThread.invalidate({ disputeId: id });
      alert('Dispute resolved!');
    }
  });

  if (isLoading) {
    return <div className="container py-20 text-center font-bold text-gray-500 uppercase tracking-widest text-xs">Loading Thread...</div>;
  }

  if (!dispute) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-xl font-bold mb-4">Dispute not found</h2>
        <Link href="/disputes" className="text-[#F68B1E] font-bold hover:underline">Back to Dispute Center</Link>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate({ disputeId: id, content: message });
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-20">
      <div className="container py-12 max-w-4xl space-y-8">
        <Link href="/disputes" className="flex items-center gap-1 text-gray-500 hover:text-[#F68B1E] transition-colors font-bold text-xs mb-4 select-none">
          <ChevronLeft size={16} />
          Back to Dispute Center
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header / Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
               <div className="flex items-center justify-between mb-4">
                 <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                   dispute.status === 'OPEN' ? 'bg-red-50 text-red-600 border-red-100' :
                   dispute.status === 'UNDER_REVIEW' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                   'bg-green-50 text-green-600 border-green-100'
                 }`}>
                   {dispute.status.replace('_', ' ')}
                 </span>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   Order #{dispute.orderId.slice(-8).toUpperCase()}
                 </span>
               </div>
               <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-2 uppercase">{dispute.reason}</h1>
               <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-[#F68B1E]" />
                    {dispute.buyer.firstName} {dispute.buyer.lastName}
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Store size={14} className="text-[#264996]" />
                    {dispute.seller.businessName}
                  </div>
               </div>
            </div>

            {/* Message Thread */}
            <div className="space-y-4">
               {dispute.messages.map((msg: any) => {
                 const isMe = msg.senderId === dispute.buyerId;
                 return (
                   <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm border ${
                        isMe 
                          ? 'bg-[#282828] text-white border-transparent rounded-tr-none' 
                          : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        <p className={`text-[9px] font-bold uppercase mt-2 tracking-widest ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                          {format(new Date(msg.createdAt), 'HH:mm • dd MMM')}
                        </p>
                      </div>
                   </div>
                 );
               })}
            </div>

            {/* Reply Area */}
            {dispute.status !== 'RESOLVED' && (
              <form onSubmit={handleSend} className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex gap-3 items-end">
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the seller..."
                  rows={2}
                  className="flex-1 bg-gray-50 border border-transparent focus:border-[#F68B1E] focus:bg-white rounded-xl p-3 text-sm font-medium transition-all outline-none resize-none"
                />
                <button 
                  type="submit"
                  disabled={sendMessage.isLoading || !message.trim()}
                  className="bg-[#F68B1E] hover:bg-[#e07a1a] text-white p-3 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 select-none">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <AlertCircle size={16} className="text-[#F68B1E]" /> Dispute Actions
               </h3>
               
               {isAdmin && dispute.status !== 'RESOLVED' && (
                 <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight mb-3">Admin Panel</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-gray-400">Refund Amount (Optional)</label>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            id="refundAmount"
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold focus:border-blue-400 outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const amount = (document.getElementById('refundAmount') as HTMLInputElement)?.value;
                              resolveDispute.mutate({ 
                                disputeId: id, 
                                resolution: 'RESOLVED', 
                                refundAmount: amount ? parseFloat(amount) : undefined 
                              });
                            }}
                            disabled={resolveDispute.isLoading}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                          >
                            Approve Refund
                          </button>
                          <button 
                            onClick={() => resolveDispute.mutate({ disputeId: id, resolution: 'REJECTED' })}
                            disabled={resolveDispute.isLoading}
                            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                          >
                            Reject Claim
                          </button>
                        </div>
                      </div>
                    </div>
                 </div>
               )}

               {dispute.status === 'OPEN' && !isAdmin && (
                 <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                        Has the seller stopped responding? You can escalate this to support for manual intervention.
                      </p>
                      <button 
                        onClick={() => escalate.mutate({ disputeId: id })}
                        disabled={escalate.isLoading}
                        className="mt-3 w-full bg-[#282828] text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                      >
                        Escalate to Support
                      </button>
                    </div>
                 </div>
               )}

               {dispute.status === 'ESCALATED' && !isAdmin && (
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                    <Clock size={18} className="text-[#264996] shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-[#264996] uppercase tracking-tight">Under Support Review</p>
                      <p className="text-[10px] font-medium text-gray-600 mt-1">An agent is reviewing the logs and evidence.</p>
                    </div>
                 </div>
               )}

               {dispute.status === 'RESOLVED' && (
                 <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex gap-3">
                    <CheckCircle size={18} className="text-green-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Case Resolved</p>
                      <p className="text-[10px] font-medium text-gray-600 mt-1">This dispute has been closed.</p>
                    </div>
                 </div>
               )}

               {dispute.status === 'REJECTED' && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
                    <AlertCircle size={18} className="text-red-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-tight">Claim Rejected</p>
                      <p className="text-[10px] font-medium text-gray-600 mt-1">The resolution was in favor of the seller.</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="bg-[#282828] rounded-2xl p-6 text-white select-none">
               <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 opacity-80">
                 <FileText size={16} /> Buyer Protection
               </h3>
               <p className="text-[11px] font-medium opacity-70 leading-relaxed">
                 You are protected by the Jumia Guarantee. If the item is not as described or never arrived, you will get a full refund.
               </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
      `}</style>
    </div>
  );
}
