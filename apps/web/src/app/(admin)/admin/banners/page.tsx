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
  Settings,
  Image as ImageIcon,
  Loader2,
  ArrowRight
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
  const [placement, setPlacement] = useState('HERO');
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createBannerMutation = api.admin.createBanner.useMutation({
    onSuccess: () => {
      utils.admin.listBanners.invalidate();
      resetForm();
      toast({
        title: 'Banner Created',
        description: 'New promotional banner has been successfully added.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
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
        title: 'Banner Updated',
        description: 'Banner settings have been successfully saved.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  });

  const deleteBannerMutation = api.admin.deleteBanner.useMutation({
    onSuccess: () => {
      utils.admin.listBanners.invalidate();
      toast({
        title: 'Banner Removed',
        description: 'Banner has been successfully deleted.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
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
    setPlacement('HERO');
    setEditingId(null);
  };

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setImageUrl(banner.imageUrl);
    setLink(banner.link || '');
    setPosition(banner.position.toString());
    setPlacement(banner.placement || 'HERO');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast({
        title: 'Missing Fields',
        description: 'Title and Image are required.',
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
        position: parseInt(position, 10),
        placement
      });
    } else {
      createBannerMutation.mutate({
        title,
        imageUrl,
        link,
        position: parseInt(position, 10),
        placement
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
      });
      
      if (!res.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, publicUrl } = await res.json();

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      setImageUrl(publicUrl);
      toast({
        title: 'Upload Successful',
        description: 'Banner image has been uploaded.',
      });
    } catch (err) {
      toast({
        title: 'Upload Failed',
        description: 'Could not upload banner image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-10 w-96 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] w-full rounded-sm" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-sm" />
            <Skeleton className="h-64 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-j-text text-white rounded-sm shadow-sm">
                <Layout size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Marketing CMS</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Banner <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage promotional banners and campaign assets</p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Active Banners: {banners?.filter(b => b.isActive).length || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Banner Form */}
          <div className="bg-white p-8 rounded-sm border border-j-border shadow-sm h-fit sticky top-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-j-border">
              <div className="p-2 bg-j-background rounded-sm text-jumia-orange border border-j-border">
                {editingId ? <Settings size={18} /> : <Plus size={18} />}
              </div>
              <h2 className="text-xs font-black text-j-text uppercase tracking-tight">
                {editingId ? 'Edit Banner' : 'Create Banner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.G. FLASH SALES AUGUST"
                  className="w-full bg-j-background border border-j-border rounded-sm px-4 py-3 text-xs font-black focus:outline-none focus:border-jumia-orange uppercase shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                  Banner Image
                </label>
                <div className="relative w-full h-40 bg-j-background border border-dashed border-j-border rounded-sm overflow-hidden flex flex-col items-center justify-center group hover:border-jumia-orange/50 transition-all">
                  {imageUrl ? (
                    <>
                      <Image src={imageUrl} alt="Preview" fill className="object-cover opacity-80" />
                      <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-j-text/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white text-j-text px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-lg">Change Image</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    </>
                  ) : (
                    <label className="flex flex-col items-center gap-3 cursor-pointer w-full h-full justify-center">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-jumia-orange" size={24} />
                      ) : (
                        <>
                          <ImagePlus size={24} className="text-j-text-muted/30" />
                          <span className="text-[9px] font-black text-j-text-muted/40 uppercase tracking-widest">Select Asset</span>
                        </>
                      )}
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                  Link / URL
                </label>
                <div className="relative">
                  <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 text-j-text-muted/20" size={14} />
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="E.G. /FLASH-SALES"
                    className="w-full bg-j-background border border-j-border rounded-sm px-4 py-3 text-xs font-black focus:outline-none focus:border-jumia-orange uppercase shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                  Display Order
                </label>
                <input
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-j-background border border-j-border rounded-sm px-4 py-3 text-xs font-black focus:outline-none focus:border-jumia-orange shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                  Placement Section
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full bg-j-background border border-j-border rounded-sm px-4 py-3 text-xs font-black focus:outline-none focus:border-jumia-orange shadow-sm"
                >
                  <option value="HERO">HERO CAROUSEL</option>
                  <option value="AD">MID-PAGE AD STRIP</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-j-border">
                {editingId && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-white border border-j-border text-j-text py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-j-background transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                  className="flex-[2] bg-jumia-orange text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-jumia-orange/90 transition-all shadow-md disabled:opacity-50"
                >
                  {editingId ? 'Update Banner' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>

          {/* Banner List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black text-j-text uppercase tracking-widest opacity-40 px-2">Banner Inventory</h3>

            <div className="grid gap-6">
              {banners?.map((banner) => (
                <div key={banner.id} className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden group hover:border-jumia-orange/30 transition-all">
                  <div className="relative h-48 w-full">
                    <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-j-text/80 to-transparent opacity-60" />
                    
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="bg-jumia-orange text-white px-2 py-0.5 rounded-sm text-[9px] font-black shadow-lg">
                            POS {banner.position}
                          </span>
                          <span className="bg-j-text text-white px-2 py-0.5 rounded-sm text-[9px] font-black shadow-lg">
                            {banner.placement || 'HERO'}
                          </span>
                          <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none">{banner.title}</h4>
                        </div>
                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest truncate max-w-md">{banner.link || 'No Link Assigned'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateBannerMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                          className={`p-2 rounded-sm border transition-all ${
                            banner.isActive 
                              ? 'bg-green-50 text-j-success border-green-100 hover:bg-j-success hover:text-white' 
                              : 'bg-red-50 text-j-error border-red-100 hover:bg-j-error hover:text-white'
                          }`}
                          title={banner.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          onClick={() => handleEdit(banner)}
                          className="p-2 bg-j-background text-j-text border border-j-border rounded-sm hover:border-jumia-orange hover:text-jumia-orange transition-all"
                          title="Edit"
                        >
                          <Settings size={16} />
                        </button>
                        <button 
                          onClick={() => deleteBannerMutation.mutate({ id: banner.id })}
                          className="p-2 bg-red-50 text-j-error border border-red-100 rounded-sm hover:bg-j-error hover:text-white transition-all"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(!banners || banners.length === 0) && (
                <div className="bg-white p-24 rounded-sm border border-j-border text-center space-y-4 opacity-20">
                  <ImageIcon size={48} className="mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No banners found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
