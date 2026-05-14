'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, ChevronRight, User, ShieldCheck, ArrowRight, Activity, Zap } from 'lucide-react';
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
 text: message.toUpperCase(),
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
 text: 'THANK YOU FOR REACHING OUT. A HUMAN RESOLUTIONS SPECIALIST IS CONNECTING TO YOUR SECURE SESSION.',
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 }
 ]);
 }, 1200);
 };

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-6xl mx-auto px-6">
 {/* Breadcrumbs */}
 <div className="flex items-center gap-3 mb-12 font-semibold text-on-surface-variant text-[10px] uppercase tracking-[0.4em]">
 <Link href="/" className="hover:text-jumia-orange transition-colors">Hub</Link>
 <ChevronRight size={14} className="opacity-30" />
 <Link href="/help" className="hover:text-jumia-orange transition-colors">Intelligence</Link>
 <ChevronRight size={14} className="opacity-30" />
 <span className="text-on-surface">Secure Session</span>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Agent Connection Panel */}
 <div className="lg:col-span-4 space-y-6">
 <div className="bg-surface-container-lowest rounded border border-surface-container-low shadow-soft p-10 animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="flex items-center gap-4 border-b-2 border-surface-container-low pb-8 mb-8">
 <div className="w-16 h-16 bg-jumia-orange text-white rounded flex items-center justify-center shadow-xl shadow-primary-container/20 border border-white/10 shrink-0">
 <Zap size={32} />
 </div>
 <div>
 <h2 className="font-semibold text-on-surface text-xl uppercase tracking-tighter leading-none">Real-Time <span className="text-jumia-orange">Link</span></h2>
 <div className="flex items-center gap-2 mt-3">
 <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
 <p className="text-[10px] font-semibold text-success uppercase tracking-widest italic">Node Active</p>
 </div>
 </div>
 </div>
 
 <div className="space-y-6">
 <div className="p-6 bg-surface-container-low/30 rounded border-2 border-surface-container-low">
 <div className="flex items-center gap-4 mb-4">
 <ShieldCheck size={18} className="text-jumia-orange" />
 <h4 className="text-[10px] font-semibold text-on-surface uppercase tracking-widest">Encryption Status</h4>
 </div>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em] leading-relaxed italic">
 YOUR SESSION IS PROTECTED BY END-TO-END CRYPTOGRAPHIC PROTOCOLS. DATA INTEGRITY VERIFIED.
 </p>
 </div>

 <div className="p-6 bg-surface-container-low/30 rounded border-2 border-surface-container-low">
 <div className="flex items-center gap-4 mb-4">
 <Activity size={18} className="text-jumia-orange" />
 <h4 className="text-[10px] font-semibold text-on-surface uppercase tracking-widest">Queue Latency</h4>
 </div>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em] leading-relaxed italic">
 EXPECTED HANDSHAKE TIME: &lt; 2 MINUTES.
 </p>
 </div>
 </div>
 </div>

 <div className="bg-jumia-orange text-white rounded p-8 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-jumia-orange/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
 <p className="text-[9px] font-semibold uppercase tracking-[0.4em] mb-4 opacity-40">Security Advisory</p>
 <p className="text-[10px] font-semibold uppercase tracking-[0.2em] leading-relaxed italic relative z-10">
 DO NOT DISCLOSE AUTHORIZATION TOKENS OR TEMPORAL PASSWORDS DURING THIS SESSION.
 </p>
 </div>
 </div>

 {/* Messages Flow */}
 <div className="lg:col-span-8 flex flex-col h-[700px] bg-surface-container-lowest rounded-[48px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000">
 {/* Header */}
 <div className="p-8 bg-surface-container-low/30 border-b-2 border-surface-container-low flex items-center justify-between">
 <div className="flex items-center gap-5">
 <div className="relative">
 <div className="w-14 h-14 bg-surface-container-lowest border-2 border-surface-container-low rounded-sm flex items-center justify-center text-on-surface-variant/40 shadow-sm">
 <User size={24} />
 </div>
 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success border border-surface-container-lowest rounded-full shadow-sm" />
 </div>
 <div>
 <h3 className="font-semibold text-on-surface text-2xl tracking-tighter uppercase leading-none">Virtual <span className="text-jumia-orange">Core</span></h3>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-2 italic">Automated Resolutions Node v8.4</p>
 </div>
 </div>
 </div>

 {/* Chat Area */}
 <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-surface-container-low/5">
 {messages.map((msg) => (
 <div key={msg.id} className={`flex gap-6 max-w-[85%] select-text animate-in slide-in-from-bottom-4 duration-500 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
 <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 border-2 transition-all ${msg.sender === 'user' ? 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20' : 'bg-surface-container-lowest border-surface-container-low text-on-surface-variant/20'}`}>
 <User size={18} />
 </div>
 <div className={`p-6 rounded text-[11px] font-semibold uppercase tracking-widest leading-relaxed shadow-soft border-2 ${msg.sender === 'user' ? 'bg-jumia-orange text-white border-on-surface rounded-tr-none' : 'bg-surface-container-lowest border-surface-container-low rounded-tl-none text-on-surface'}`}>
 <p className="break-words">{msg.text}</p>
 <div className={`flex items-center gap-2 mt-4 opacity-30 text-[9px]`}>
 <Activity size={10} />
 {msg.time}
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Input Area */}
 <form onSubmit={handleSendMessage} className="p-8 border-t-2 border-surface-container-low bg-surface-container-low/30 flex items-center gap-6">
 <div className="flex-1 relative group">
 <input
 type="text"
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder="INJECT COMMUNICATION DATA..."
 className="w-full h-16 pl-8 pr-8 border-2 border-surface-container-low focus:border-jumia-orange rounded-2xl outline-none font-semibold text-[10px] uppercase tracking-widest text-on-surface bg-surface-container-lowest transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 </div>
 <button 
 type="submit"
 disabled={!message.trim()}
 className="w-16 h-16 bg-jumia-orange hover:bg-jumia-orange-dark text-white rounded-2xl font-semibold transition-all shadow-xl hover:shadow-primary-container/20 active:scale-90 duration-300 flex items-center justify-center flex-shrink-0 disabled:opacity-10 group"
 >
 <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
 </button>
 </form>
 </div>
 </div>
 </div>
 </div>
 );
}
