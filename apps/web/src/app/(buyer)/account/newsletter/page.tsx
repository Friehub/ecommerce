'use client';

import React, { useState } from 'react';
import { Bell, ArrowLeft, Mail, Save, Smartphone, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NewsletterPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-12">
        <div className="bg-white rounded-sm border border-j-border shadow-soft overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="p-8 border-b border-j-border bg-j-background flex items-center gap-6">
            <Link href="/account" className="w-10 h-10 bg-white rounded-sm border-2 border-j-border flex items-center justify-center hover:text-jumia-orange hover:border-jumia-orange transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-j-text uppercase tracking-tight">Newsletter</h1>
              <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-60">Manage your subscription preferences</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            <div className="space-y-8">
              {[
                { id: 'daily', label: 'Daily Jumia News', icon: Mail, desc: 'Get the best deals delivered every morning' },
                { id: 'flash', label: 'Flash Sale Alerts', icon: Bell, desc: 'Instant notifications when high-demand sales start' },
                { id: 'mobile', label: 'Mobile Push Notifications', icon: Smartphone, desc: 'Real-time updates directly to your device' },
              ].map((pref) => (
                <div key={pref.id} className="flex items-start gap-6 p-6 rounded-sm border-2 border-j-border hover:border-j-text-muted transition-all bg-j-background/50">
                  <div className="w-12 h-12 bg-white rounded-sm border-2 border-j-border flex items-center justify-center shrink-0 text-j-text-muted group-hover:text-jumia-orange transition-colors">
                    <pref.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">{pref.label}</h4>
                    <p className="text-[9px] font-bold text-j-text-muted uppercase tracking-tighter opacity-70 leading-relaxed mb-4">{pref.desc}</p>
                    <div className="flex items-center gap-4">
                      <button className="h-8 px-6 bg-jumia-orange text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-orange-600 transition-all">Subscribed</button>
                      <button className="text-[9px] font-black text-j-text-muted uppercase tracking-widest hover:text-j-error transition-colors">Unsubscribe</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSave}
              className="w-full h-16 bg-j-text text-white font-black text-xs uppercase tracking-widest rounded-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 group overflow-hidden relative"
            >
              {saved ? (
                <div className="flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
                  <CheckCircle2 size={20} className="text-j-success" />
                  <span>Preferences Saved</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 group-hover:scale-105 transition-transform">
                  <Save size={20} />
                  <span>Save Changes</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
