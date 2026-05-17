'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ArrowLeft, Mail, Save, Smartphone, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/trpc/react';

type PrefId = 'daily' | 'flash' | 'mobile';

export default function NewsletterPage() {
  const { data: dbPreferences, isLoading: isLoadingPrefs, error: fetchError } = api.notification.getPreferences.useQuery();
  const updatePreferencesMutation = api.notification.updatePreferences.useMutation();

  const [preferences, setPreferences] = useState<Record<PrefId, boolean>>({
    daily: true,
    flash: true,
    mobile: true,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (dbPreferences && !isInitialized) {
      const dailyPref = dbPreferences.find((p) => p.type === 'daily');
      const flashPref = dbPreferences.find((p) => p.type === 'flash');
      const mobilePref = dbPreferences.find((p) => p.type === 'mobile');

      setPreferences({
        daily: dailyPref ? dailyPref.email : true,
        flash: flashPref ? (flashPref.email || flashPref.push) : true,
        mobile: mobilePref ? mobilePref.push : true,
      });
      setIsInitialized(true);
    }
  }, [dbPreferences, isInitialized]);

  const handleToggle = (id: PrefId, action: 'subscribe' | 'unsubscribe') => {
    setPreferences((prev) => ({
      ...prev,
      [id]: action === 'subscribe',
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // 1. Save Daily Preferences
      await updatePreferencesMutation.mutateAsync({
        type: 'daily',
        email: preferences.daily,
        sms: false,
        push: preferences.daily,
      });

      // 2. Save Flash Preferences
      await updatePreferencesMutation.mutateAsync({
        type: 'flash',
        email: preferences.flash,
        sms: false,
        push: preferences.flash,
      });

      // 3. Save Mobile Preferences
      await updatePreferencesMutation.mutateAsync({
        type: 'mobile',
        email: false,
        sms: false,
        push: preferences.mobile,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save newsletter preferences:', err);
      setSaveError(err.message || 'An error occurred while saving your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
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
            {isLoadingPrefs ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-jumia-orange" size={40} />
                <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest">Loading Preferences...</p>
              </div>
            ) : fetchError ? (
              <div className="p-6 bg-red-50 border-2 border-j-error/20 rounded-sm text-j-error flex items-start gap-4">
                <AlertCircle size={22} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-[11px] uppercase tracking-wider mb-1">Failed to retrieve preferences</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tight opacity-90">{fetchError.message}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {[
                    { id: 'daily' as PrefId, label: 'Daily Jumia News', icon: Mail, desc: 'Get the best deals delivered every morning' },
                    { id: 'flash' as PrefId, label: 'Flash Sale Alerts', icon: Bell, desc: 'Instant notifications when high-demand sales start' },
                    { id: 'mobile' as PrefId, label: 'Mobile Push Notifications', icon: Smartphone, desc: 'Real-time updates directly to your device' },
                  ].map((pref) => {
                    const isSubscribed = preferences[pref.id];
                    return (
                      <div 
                        key={pref.id} 
                        className={`flex items-start gap-6 p-6 rounded-sm border-2 transition-all bg-j-background/50 ${
                          isSubscribed ? 'border-jumia-orange/30 shadow-sm bg-orange-50/5' : 'border-j-border hover:border-j-text-muted'
                        }`}
                      >
                        <div className={`w-12 h-12 bg-white rounded-sm border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSubscribed ? 'border-jumia-orange text-jumia-orange' : 'border-j-border text-j-text-muted'
                        }`}>
                          <pref.icon size={22} />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">{pref.label}</h4>
                          <p className="text-[9px] font-bold text-j-text-muted uppercase tracking-tighter opacity-70 leading-relaxed mb-4">{pref.desc}</p>
                          <div className="flex items-center gap-4">
                            {isSubscribed ? (
                              <>
                                <span className="h-8 px-6 bg-jumia-orange text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-orange-600 transition-all flex items-center justify-center cursor-default shadow-sm border border-jumia-orange">
                                  Subscribed
                                </span>
                                <button 
                                  onClick={() => handleToggle(pref.id, 'unsubscribe')}
                                  className="text-[9px] font-black text-j-text-muted uppercase tracking-widest hover:text-j-error transition-colors"
                                >
                                  Unsubscribe
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleToggle(pref.id, 'subscribe')}
                                className="h-8 px-6 bg-white border-2 border-j-border text-j-text text-[9px] font-black uppercase tracking-widest rounded-sm hover:border-jumia-orange hover:text-jumia-orange transition-all flex items-center justify-center shadow-soft"
                              >
                                Subscribe
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {saveError && (
                  <div className="p-6 bg-red-50 border-2 border-j-error/20 rounded-sm text-j-error flex items-start gap-4">
                    <AlertCircle size={22} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-[11px] uppercase tracking-wider mb-1">Save Failure</h4>
                      <p className="text-[10px] font-bold uppercase tracking-tight opacity-90">{saveError}</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-16 bg-j-text text-white font-black text-xs uppercase tracking-widest rounded-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 group overflow-hidden relative disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin text-white" size={20} />
                      <span>Saving Changes...</span>
                    </div>
                  ) : saved ? (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
