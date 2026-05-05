'use client';

import { api } from '../../../../../trpc/react';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateCampaign() {
  const router = useRouter();
  const utils = api.useUtils();
  
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const createMutation = api.advertising.createCampaign.useMutation({
    onSuccess: () => {
      utils.advertising.getCampaigns.invalidate();
      router.push('/seller/advertising');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !budget || !startDate) return;
    
    createMutation.mutate({
      name,
      budget: Number(budget),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined
    });
  };

  return (
    <div className="max-w-2xl">
      <Link href="/seller/advertising" className="inline-flex items-center text-gray-500 hover:text-[#f68b1e] text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
        <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Create Ad Campaign</h1>
          <p className="text-gray-500 text-sm mt-1">Set up a new sponsored campaign.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Campaign Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
              placeholder="e.g. Summer Electronics Sale"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Total Budget (₦)</label>
            <input 
              type="number" 
              required
              min="1000"
              step="100"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
              placeholder="5000"
            />
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Campaign will automatically pause when budget is exhausted.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Start Date</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">End Date (Optional)</label>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit"
              disabled={createMutation.isLoading}
              className="bg-[#f68b1e] text-white px-8 py-2.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#e07a1a] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
