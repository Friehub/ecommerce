'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { 
  ShieldCheck, 
  ImagePlus, 
  Layout, 
  Trash, 
  Plus, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  ChevronRight,
  MoveVertical,
  Loader2,
  Settings2,
  Monitor
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminBannersPage() {
  const utils = api.useUtils();
  const { toast } = useToast();
  
  const { data: banners, isLoading } = api.admin.listBanners.useQuery();
  
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [position, setPosition] = useState('0');
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createBannerMutation = api.admin.createBanner.useMutation({
    onSuccess: () => {
      utils.admin.listBanners.invalidate();
      resetForm();
      toast({
        title: 'ASSET DEPLOYED',
        description: 'Promotional banner has been successfully integrated into the CMS.',
      });
    },
    onError: (err) => {
      toast({
        title: 'DEPLOYMENT FAILED',
        description: err.message,
        variant: 'destructive',
      });
    }
  });

  const updateBannerMutation = api.admin.updateBanner.useMutation({
    onSuccess: () => {
      utils.admin.listBanners.invalidate();
      resetForm();
      toast({
        title: 'ASSET SYNCHRONIZED',
        description: 'Banner configuration has been updated successfully.',
      });
    },
    onError: (err) => {
      toast({
        title: 'UPDATE FAILED',
        description: err.message,
        variant: 'destructive',
      });
    }
  });

  const deleteBannerMutation = api.admin.deleteBanner.useMutation({
    onSuccess: () => {
      utils.admin.listBanners.invalidate();
      toast({
        title: 'ASSET PURGED',
        description: 'Banner has been permanently removed from the registry.',
      });
    },
    onError: (err) => {
      toast({
        title: 'PURGE FAILED',
        description: err.message,
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setTitle('');
    setImageUrl('');
    setLink('');
    setPosition('0');
    setEditingId(null);
  };

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setImageUrl(banner.imageUrl);
    setLink(banner.link || '');
    setPosition(banner.position.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast({
        title: 'MISSING CRITICAL DATA',
        description: 'Title and Image URL are mandatory for deployment.',
        variant: 'destructive',
      });
      return;
    }

    if (editingId) {
      updateBannerMutation.mutate({
        id: editingId,
        title,
        imageUrl,
        link,
        position: parseInt(position, 10)
      });
    } else {
      createBannerMutation.mutate({
        title,
        imageUrl,
        link,
        position: parseInt(position, 10)
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get presigned URL from TRPC
      // We assume there's a media router for this, similar to the review system
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
      });
      
      if (!res.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, publicUrl } = await res.json();

      // 2. Upload directly to S3/R2
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      setImageUrl(publicUrl);
      toast({
        title: 'UPLINK ESTABLISHED',
        description: 'Media asset has been successfully cached.',
      });
    } catch (err) {
      toast({
        title: 'UPLINK FAILURE',
        description: 'Failed to synchronize media asset.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-12 animate-pulse bg-background min-h-screen">
        <div className="h-20 w-1/3 bg-surface-container-low rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="h-[500px] bg-surface-container-low rounded-[48px]" />
          <div className="lg:col-span-2 h-[500px] bg-surface-container-low rounded-[48px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30 shadow-inner">
              <Monitor size={24} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-jumia-orange italic">CMS Control & Visual Matrix</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
            Banner <br />
            <span className="text-jumia-orange italic">Management.</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-3 bg-jumia-orange border border-surface-container-low rounded-2xl shadow-3xl">
          <Layout size={16} className="text-jumia-orange" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Active Nodes: {banners?.filter(b => b.isActive).length || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Management Form */}
        <div className="bg-surface-container-lowest p-10 rounded-[48px] border border-surface-container-low shadow-soft h-fit sticky top-8">
          <div className="flex items-center justify-between mb-10 pb-6 border-b-4 border-surface-container-low">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-jumia-orange/10 text-jumia-orange rounded-2xl border-2 border-jumia-orange/20 shadow-inner">
                {editingId ? <Settings2 size={20} /> : <Plus size={20} />}
              </div>
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-[0.3em] italic">
                {editingId ? 'Modify Node' : 'Deploy Node'}
              </h2>
            </div>
            {editingId && (
              <button 
                onClick={resetForm}
                className="text-[9px] font-semibold uppercase tracking-widest text-error hover:underline"
              >
                Abort
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
                Identity Label
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="CAMPAIGN TITLE"
                className="w-full bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl px-5 py-4 text-[10px] font-semibold focus:outline-none focus:border-jumia-orange/20 text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 uppercase tracking-widest shadow-inner"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
                Visual Payload (Image)
              </label>
              <div className="group relative w-full h-48 bg-surface-container-low border border-dashed border-surface-container-low rounded overflow-hidden flex flex-col items-center justify-center transition-all hover:border-jumia-orange/30">
                {imageUrl ? (
                  <>
                    <Image src={imageUrl} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-jumia-orange/80 text-white px-6 py-3 rounded-xl text-[9px] font-semibold uppercase tracking-widest backdrop-blur-md">Change Node</div>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center gap-4 cursor-pointer w-full h-full justify-center">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-jumia-orange" size={32} />
                    ) : (
                      <>
                        <ImagePlus size={32} className="text-on-surface-variant/20" />
                        <span className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-widest">Connect Visual</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
                Routing Link
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={16} />
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/category/fashion"
                  className="w-full pl-12 pr-5 py-4 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl focus:outline-none focus:border-jumia-orange/20 text-[10px] font-semibold text-on-surface shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
                Matrix Position
              </label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl px-5 py-4 text-[10px] font-semibold focus:outline-none focus:border-jumia-orange/20 text-on-surface shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
              className="w-full bg-jumia-orange text-white py-6 rounded text-[11px] font-semibold uppercase tracking-[0.4em] italic hover:bg-jumia-orange-dark transition-all duration-700 shadow-3xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {(createBannerMutation.isPending || updateBannerMutation.isPending) && <Loader2 size={18} className="animate-spin text-jumia-orange" />}
              {editingId ? 'Update Node' : 'Deploy Node'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-[0.4em] italic opacity-40">Visual Node Registry</h3>
          </div>

          <div className="grid gap-8">
            {banners?.map((banner) => (
              <div key={banner.id} className="bg-surface-container-lowest rounded-[48px] border border-surface-container-low shadow-soft overflow-hidden group hover:border-jumia-orange/20 transition-all duration-700">
                <div className="relative h-64 w-full">
                  <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-jumia-orange text-white flex items-center justify-center rounded-lg text-[10px] font-semibold italic shadow-3xl">
                          {banner.position}
                        </span>
                        <h4 className="text-2xl font-semibold text-white uppercase tracking-tighter italic">{banner.title}</h4>
                      </div>
                      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.3em] italic">{banner.link || 'Internal Route Unassigned'}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => updateBannerMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                        className={`p-4 rounded-2xl border transition-all duration-500 shadow-soft ${
                          banner.isActive 
                            ? 'bg-white text-on-surface border-white/20 hover:bg-jumia-orange-dark hover:text-white' 
                            : 'bg-error/10 text-error border-error/20 hover:bg-error hover:text-white'
                        }`}
                      >
                        {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(banner)}
                        className="p-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl hover:bg-white hover:text-on-surface transition-all duration-500 shadow-soft"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteBannerMutation.mutate({ id: banner.id })}
                        className="p-4 bg-error/10 text-error border border-error/20 rounded-2xl hover:bg-error hover:text-white transition-all duration-500 shadow-soft"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!banners || banners.length === 0) && (
              <div className="bg-surface-container-lowest p-32 rounded-[56px] border border-surface-container-low text-center select-none space-y-8">
                <div className="w-24 h-24 bg-surface-container-low rounded border border-surface-container-lowest flex items-center justify-center mx-auto text-on-surface-variant/10">
                  <Monitor size={48} />
                </div>
                <div className="space-y-2">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.6em] text-on-surface-variant/20 italic">Visual Registry Clear</p>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/10 italic">No nodes currently active in the matrix</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
