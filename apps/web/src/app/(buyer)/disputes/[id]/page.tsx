'use client';

import { api } from '@/trpc/react';
import { useState } from 'react';
import { ArrowLeft, Send, Upload, ShieldAlert, User, Store } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DisputeThread({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const disputeId = params.id;
  
  const { data: dispute, isLoading, refetch } = api.dispute.getById.useQuery({ disputeId });
  const respondMutation = api.dispute.respond.useMutation({
    onSuccess: () => {
      setMessage('');
      refetch();
    }
  });

  const [message, setMessage] = useState('');

  if (isLoading) {
    return <div className="container py-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Thread...</div>;
  }

  if (!dispute) {
    return <div className="container py-12 text-center text-red-500 font-bold">Dispute not found.</div>;
  }

  const isBuyer = session?.user?.id === dispute.buyerId;

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/disputes" className="inline-flex items-center text-gray-500 hover:text-[#f68b1e] text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
        <ArrowLeft size={14} className="mr-1" /> Back to Disputes
      </Link>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="text-red-500" size={20} />
              <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Dispute Thread</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                dispute.status === 'OPEN' ? 'bg-red-50 text-red-600 border-red-100' :
                dispute.status === 'UNDER_REVIEW' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                'bg-green-50 text-green-600 border-green-100'
              }`}>
                {dispute.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-900 font-medium">{dispute.reason}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Reference</p>
            <p className="text-sm font-bold text-gray-900">#{dispute.orderId.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="p-6 bg-white min-h-[300px] flex flex-col gap-6">
          {dispute.messages.map((msg) => {
            const isMe = msg.senderId === session?.user?.id;
            const isModerator = msg.senderId !== dispute.buyerId && msg.senderId !== dispute.sellerId;
            
            return (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {isModerator ? 'Admin Moderator' : msg.senderId === dispute.buyerId ? 'Buyer' : 'Seller'}
                  </span>
                  <span className="text-gray-300 text-[10px]">•</span>
                  <span className="text-gray-400 text-[10px]">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`p-4 rounded-lg text-sm ${
                  isModerator ? 'bg-blue-50 border border-blue-100 text-blue-900' :
                  isMe ? 'bg-[#282828] text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          {dispute.messages.length === 0 && (
            <div className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest my-auto py-12">
              No messages yet. Start the conversation.
            </div>
          )}
        </div>

        {dispute.status !== 'RESOLVED' && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#f68b1e]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) {
                  respondMutation.mutate({ disputeId, content: message });
                }
              }}
            />
            <button 
              className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 transition-colors flex items-center justify-center"
              title="Upload Evidence"
            >
              <Upload size={18} />
            </button>
            <button 
              onClick={() => message.trim() && respondMutation.mutate({ disputeId, content: message })}
              disabled={respondMutation.isLoading || !message.trim()}
              className="bg-[#f68b1e] text-white px-6 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#e07a1a] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Send <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
