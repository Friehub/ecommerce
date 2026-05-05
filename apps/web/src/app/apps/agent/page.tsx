'use client';

import React, { useState } from 'react';
import { api } from '../../../trpc/react';
import { Truck, Package, MapPin, Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AgentDashboard() {
  const utils = api.useUtils();
  const { data: shipments, isLoading } = api.logistics.getMyShipments.useQuery();
  
  const updateStatus = api.logistics.updateShipmentStatus.useMutation({
    onSuccess: () => utils.logistics.getMyShipments.invalidate()
  });

  const getUploadUrl = api.logistics.getPresignedUrl.useMutation();

  const [uploading, setUploading] = useState<string | null>(null);

  const handleDelivery = async (shipmentId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(shipmentId);
      try {
        const { url, key } = await getUploadUrl.mutateAsync({
          fileName: `proof_${shipmentId}_${Date.now()}.jpg`,
          contentType: file.type
        });

        await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });

        // The URL returned from getUploadUrl is the presigned PUT URL.
        // In a real app, we'd store the public GET URL or the key.
        // For the contest, we'll use a simplified path.
        const publicUrl = url.split('?')[0];

        await updateStatus.mutateAsync({
          shipmentId,
          status: 'DELIVERED',
          proofUrl: publicUrl
        });
      } catch (err) {
        alert('Upload failed. Please try again.');
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <div className="bg-[#282828] text-white p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight">Agent Portal</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Delivery Executive</p>
          </div>
          <Truck size={28} className="text-[#f68b1e]" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-bold uppercase tracking-widest">Loading Task List...</p>
          </div>
        ) : shipments && shipments.length > 0 ? (
          shipments.map((shipment) => (
            <div key={shipment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                <span className="text-[10px] font-mono font-bold text-gray-400">#{shipment.id.slice(-8).toUpperCase()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {shipment.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#f68b1e] mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-gray-900">Delivery Address</p>
                    <p className="text-gray-600 leading-snug mt-1">
                      {/* Address detail would normally come from the order */}
                      Lagos Island, Custom Street, No 12.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package size={18} className="text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-gray-900">Package Items</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {shipment.package.lines.length} items • Standard Package
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 flex gap-2">
                {shipment.status === 'PENDING' && (
                  <button 
                    onClick={() => updateStatus.mutate({ shipmentId: shipment.id, status: 'PICKED_UP' })}
                    className="flex-1 bg-[#282828] text-white py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    Confirm Pickup
                  </button>
                )}
                {['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(shipment.status) && (
                  <>
                    <button 
                      onClick={() => updateStatus.mutate({ shipmentId: shipment.id, status: 'OUT_FOR_DELIVERY' })}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                      Out for Delivery
                    </button>
                    <button 
                      onClick={() => handleDelivery(shipment.id)}
                      disabled={uploading === shipment.id}
                      className="flex-[1.5] bg-[#f68b1e] text-white py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#e07a1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading === shipment.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Camera size={16} />
                      )}
                      {uploading === shipment.id ? 'Uploading...' : 'Complete Delivery'}
                    </button>
                  </>
                )}
                {shipment.status === 'DELIVERED' && (
                  <div className="flex-1 text-center py-2 text-green-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    Job Completed
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">All Done!</h3>
            <p className="text-gray-500 text-sm mt-1">No active shipments assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
