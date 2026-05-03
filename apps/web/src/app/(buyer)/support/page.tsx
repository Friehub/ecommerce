'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, ChevronRight, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ContactSupportPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: 'Hello! I am your Jumia virtual assistant. How can I assist you with your order today?',
      time: '09:00'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
    setMessage('');

    // Dynamic simulated agent response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'agent',
          text: 'Thank you for reaching out! One of our human live agents is connecting to help resolve this.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12 select-none">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 font-bold text-gray-500 text-xs">
          <Link href="/" className="hover:text-[#F68B1E] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link href="/help" className="hover:text-[#F68B1E] transition-colors">Help Center</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">Support</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Connection Panel */}
          <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-6 h-fit">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-[#F68B1E] flex-shrink-0 border border-orange-100">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-base leading-tight">Live Support</h2>
                <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100/50 w-fit mt-1">Agent Available</p>
              </div>
            </div>
            <div className="space-y-4 text-xs md:text-sm font-medium text-gray-600">
              <p>Direct communication channels are monitored 24/7 by human specialists.</p>
              <div className="flex items-center gap-2 bg-gray-50/60 p-3 rounded-xl border border-gray-100/50">
                <ShieldCheck className="text-[#F68B1E] flex-shrink-0" size={18} />
                <span className="text-gray-700 text-xs font-bold">Encrypted connection</span>
              </div>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="lg:col-span-2 flex flex-col h-[500px] bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-orange-100 text-[#F68B1E] rounded-full flex items-center justify-center border border-orange-200">
                    <User size={18} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm md:text-base leading-tight tracking-tight">Virtual Assistant</h3>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400">Resolutions Specialist</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/20">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] select-text ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.sender === 'user' ? 'bg-orange-50 text-[#F68B1E] border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    <User size={14} />
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs md:text-sm font-medium ${msg.sender === 'user' ? 'bg-[#F68B1E] text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none shadow-sm text-gray-800'}`}>
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <span className={`text-[10px] font-bold block mt-1.5 ${msg.sender === 'user' ? 'text-white/75' : 'text-gray-400'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-11 px-4 border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
              />
              <button 
                type="submit"
                className="w-11 h-11 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 duration-200 flex items-center justify-center flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
