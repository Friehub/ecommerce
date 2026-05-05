'use client';

import React, { useState } from 'react';
import { api } from '../../../../../trpc/react';
import { ArrowLeft, Send, Upload, ShieldAlert, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function SellerDisputeDetailPage() {
  const { data: session } = useSession();
  const { id: disputeId } = useParams() as { id: string };
  const [message, setMessage] = useState('');
  
  const utils = api.useUtils();
  const { data: dispute, isLoading } = api.dispute.getById.useQuery({ disputeId });
  
  const respondMutation = api.dispute.respond.useMutation({
    onSuccess: () => {
      setMessage('');
      utils.dispute.getById.invalidate({ disputeId });
    }
  });

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Dispute...</div>;
  }

  if (!dispute) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold mb-4">Dispute not found</h2>
        <Link href="/seller/disputes" className="text-[#F68B1E] font-bold">Back to Disputes</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container py-8 max-w-5xl">
        <Link href="/seller/disputes" className="inline-flex items-center text-gray-500 hover:text-[#f68b1e] text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
          <ArrowLeft size={14} className="mr-1" /> Back to Disputes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-red-500" size={20} />
                  <h1 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Dispute Thread</h1>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    dispute.status === 'OPEN' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200'
                  }`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Ref</p>
                  <p className="text-xs font-bold text-gray-900">#{dispute.orderId.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="p-6 bg-white min-h-[400px] max-h-[600px] overflow-y-auto flex flex-col gap-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-1">Original Reason</p>
                  <p className="text-sm text-orange-900">{dispute.reason}</p>
                </div>

                {dispute.messages.map((msg) => {
                  const isMe = msg.senderId === session?.user?.id;
                  const isModerator = msg.senderId !== dispute.buyerId && msg.senderId !== dispute.sellerId;
                  
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {isModerator ? 'Admin Moderator' : msg.senderId === dispute.buyerId ? 'Buyer' : 'You'}
                        </span>
                        <span className="text-gray-300 text-[10px]">•</span>
                        <span className="text-gray-400 text-[9px]">{format(new Date(msg.createdAt), 'dd MMM, HH:mm')}</span>
                      </div>
                      <div className={`p-3 rounded-lg text-sm shadow-sm ${
                        isModerator ? 'bg-blue-50 border border-blue-100 text-blue-900' :
                        isMe ? 'bg-[#282828] text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {dispute.status !== 'RESOLVED' && (
                <div className="p-4 border-t bg-gray-50 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide a professional response..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#f68b1e]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        respondMutation.mutate({ disputeId, content: message });
                      }
                    }}
                  />
                  <button 
                    onClick={() => message.trim() && respondMutation.mutate({ disputeId, content: message })}
                    disabled={respondMutation.isLoading || !message.trim()}
                    className="bg-[#282828] text-white px-6 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    Reply <Send size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Dispute Details</h2>
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Customer</p>
                  <p className="font-bold text-gray-900">{dispute.buyer.firstName} {dispute.buyer.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Opened On</p>
                  <p className="font-bold text-gray-900">{format(new Date(dispute.createdAt), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Last Update</p>
                  <p className="font-bold text-gray-900">{format(new Date(dispute.updatedAt), 'PPP')}</p>
                </div>
                <div className="pt-4 border-t">
                  <Link href={`/seller/orders/${dispute.orderId}`} className="text-[#f68b1e] font-bold hover:underline flex items-center gap-1 uppercase tracking-widest">
                    View Order <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
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
