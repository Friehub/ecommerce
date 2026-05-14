'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { Truck, Package, MapPin, Camera, CheckCircle2, AlertCircle, Loader2, Activity, ShieldCheck, ArrowRight, Navigation, XCircle, ChevronDown, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AgentDashboard() {
 const utils = api.useUtils();
 const { data: shipments, isLoading } = api.logistics.getMyShipments.useQuery();
 
 const updateStatus = api.logistics.updateShipmentStatus.useMutation({
 onSuccess: () => utils.logistics.getMyShipments.invalidate()
 });

 const getUploadUrl = api.logistics.getPresignedUrl.useMutation();

 const [uploading, setUploading] = useState<string | null>(null);
 const [reportingFailure, setReportingFailure] = useState<string | null>(null);
 const [failureNote, setFailureNote] = useState('');

 const failureReasons = [
   'CUSTOMER_UNREACHABLE',
   'WRONG_ADDRESS',
   'ITEM_REJECTED',
   'VEHICLE_ISSUE',
   'ZONE_UNSAFE',
   'OTHER'
 ];

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

 const publicUrl = url.split('?')[0];

 await updateStatus.mutateAsync({
 shipmentId,
 status: 'DELIVERED',
 proofUrl: publicUrl
 });
 } catch (err) {
 console.error(err);
 } finally {
 setUploading(null);
 }
 };
 input.click();
 };

 const handleFailure = async (shipmentId: string) => {
   await updateStatus.mutateAsync({
     shipmentId,
     status: 'FAILED',
     note: failureNote
   });
   setReportingFailure(null);
   setFailureNote('');
 };

 const startNavigation = (address: string) => {
   window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
 };

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant opacity-40 animate-pulse">Syncing Mission Data</p>
 </div>
 </div>
 );
 }

 const activePayload = shipments?.filter(s => s.status !== 'DELIVERED') || [];
 const completedTasks = shipments?.filter(s => s.status === 'DELIVERED') || [];

 return (
    <div className="bg-background min-h-screen pb-32 select-none animate-in fade-in duration-1000">
      {/* HUD Header */}
      <div className="bg-jumia-orange text-white p-10 sticky top-0 z-[100] shadow-2xl border-b-4 border-jumia-orange/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-jumia-orange/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
        <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Operational Link: Active</span>
            </div>
            <h1 className="text-4xl font-semibold uppercase tracking-tighter leading-[0.8]">
              Agent <br />
              <span className="text-jumia-orange italic">Nexus.</span>
            </h1>
          </div>
          <div className="w-20 h-20 bg-white/5 rounded flex items-center justify-center border border-white/10 shadow-inner group">
            <Truck size={40} className="text-jumia-orange group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-12 mt-6">
        {/* Statistics HUD */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-6 rounded border border-surface-container-lowest shadow-soft">
            <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  mb-2 italic">Active Payload</p>
            <p className="text-3xl font-semibold text-on-surface tracking-tighter">{activePayload.length}</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded border border-surface-container-lowest shadow-soft">
            <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase  mb-2 italic">Mission Success</p>
            <p className="text-3xl font-semibold text-success tracking-tighter">{completedTasks.length}</p>
          </div>
        </div>

        {/* SHIPMENT MATRIX */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-semibold text-on-surface uppercase ">Operational Queue</h2>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant/30 uppercase tracking-widest italic">
              <Clock size={12} /> {format(new Date(), 'HH:mm')} Zulu
            </div>
          </div>

          {activePayload.length > 0 ? (
            activePayload.map((shipment, idx) => (
              <div key={shipment.id} className="bg-surface-container-lowest rounded border border-surface-container-low shadow-soft overflow-hidden group/card hover:border-jumia-orange/20 transition-all duration-700">
                <div className="p-8 border-b-4 border-surface-container-low flex items-center justify-between bg-surface-container-low/20">
                  <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-jumia-orange animate-pulse" />
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase ">UNIT-{(shipment as any).id.slice(-6).toUpperCase()}</span>
                  </div>
                  <span className={`text-[8px] px-3 py-1.5 rounded-lg font-semibold uppercase  border-2 ${
                    shipment.status === 'FAILED' ? 'bg-error/5 text-error border-error/10' : 'bg-jumia-orange/5 text-jumia-orange border-jumia-orange/10'
                  }`}>
                    {shipment.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-10 space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center border-2 border-surface-container-lowest shrink-0 group-hover:bg-jumia-orange-dark group-hover:text-white transition-all duration-500">
                      <MapPin size={28} className="text-jumia-orange group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  mb-2 italic">Delivery Node</p>
                      <p className="text-base font-semibold text-on-surface uppercase tracking-tighter leading-tight mb-4">
                        {(shipment as any).package?.order?.address?.address || "Lagos Island, Custom Street, No 12."}
                      </p>
                      <button 
                        onClick={() => startNavigation((shipment as any).package?.order?.address?.address || "Lagos Island, Custom Street, No 12.")}
                        className="flex items-center gap-3 text-jumia-orange text-[10px] font-semibold uppercase  hover:bg-jumia-orange-dark/5 px-4 py-2 rounded-xl transition-all"
                      >
                        <Navigation size={14} /> Protocol: Map Link
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center border-2 border-surface-container-lowest shrink-0">
                      <Package size={28} className="text-on-surface-variant/20" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  mb-2 italic">Cargo Specifications</p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-on-surface uppercase tracking-widest italic">Asset Payload Locked</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION HUD */}
                <div className="p-8 bg-surface-container-low/30 border-t-4 border-surface-container-low grid grid-cols-1 gap-4">
                  {shipment.status === 'PENDING' && (
                    <button 
                      onClick={() => updateStatus.mutate({ shipmentId: shipment.id, status: 'PICKED_UP' })}
                      className="h-20 bg-jumia-orange text-white rounded font-semibold text-[11px] uppercase  hover:bg-jumia-orange-dark transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 group"
                    >
                      Authorize Pickup <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  )}
                  
                  {['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'FAILED'].includes(shipment.status) && (
                    <>
                      {shipment.status !== 'OUT_FOR_DELIVERY' && (
                        <button 
                          onClick={() => updateStatus.mutate({ shipmentId: shipment.id, status: 'OUT_FOR_DELIVERY' })}
                          className="h-16 bg-surface-container-lowest border border-surface-container-low text-on-surface font-semibold text-[10px] uppercase  hover:border-jumia-orange/20 transition-all rounded"
                        >
                          Protocol: Set Out for Delivery
                        </button>
                      )}
                      
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleDelivery(shipment.id)}
                          disabled={uploading === shipment.id}
                          className="flex-1 h-24 bg-jumia-orange text-white rounded font-semibold text-[11px] uppercase  hover:bg-jumia-orange-dark transition-all disabled:opacity-20 flex items-center justify-center gap-6 shadow-2xl group"
                        >
                          {uploading === shipment.id ? <Loader2 className="animate-spin" size={24} /> : <Camera size={28} />}
                          {uploading === shipment.id ? 'TX...' : 'COMMIT'}
                        </button>
                        
                        <button 
                          onClick={() => setReportingFailure(shipment.id)}
                          className="w-24 h-24 bg-error/5 text-error border border-error/10 rounded flex flex-col items-center justify-center gap-2 hover:bg-error hover:text-white transition-all group"
                        >
                          <XCircle size={24} />
                          <span className="text-[8px] font-semibold uppercase tracking-widest italic opacity-60 group-hover:opacity-100">Out of Stock</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* FAILURE MODAL STUB (Slide Up) */}
                {reportingFailure === shipment.id && (
                  <div className="bg-surface-container-lowest p-10 border-t-8 border-error animate-in slide-in-from-bottom-full duration-500">
                    <h4 className="text-base font-semibold text-on-surface uppercase tracking-widest mb-8">Incident Report Matrix</h4>
                    <div className="grid grid-cols-1 gap-3 mb-8">
                      {failureReasons.map(reason => (
                        <button 
                          key={reason}
                          onClick={() => setFailureNote(reason)}
                          className={`p-4 rounded-2xl border text-[10px] font-semibold uppercase tracking-widest text-left transition-all ${
                            failureNote === reason ? 'bg-error text-white border-error shadow-xl' : 'bg-surface-container-low border-surface-container-lowest text-on-surface-variant'
                          }`}
                        >
                          {reason.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleFailure(shipment.id)}
                        disabled={!failureNote}
                        className="flex-1 h-16 bg-error text-white rounded-2xl font-semibold text-[10px] uppercase  shadow-xl disabled:opacity-20"
                      >
                        Transmit Final Void
                      </button>
                      <button 
                        onClick={() => setReportingFailure(null)}
                        className="px-8 h-16 bg-surface-container-low text-on-surface rounded-2xl font-semibold text-[10px] uppercase tracking-widest"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-surface-container-low rounded">
              <CheckCircle2 size={48} className="mx-auto text-success/20 mb-6" />
              <p className="text-[10px] font-semibold uppercase  text-on-surface-variant/20 italic">Queue Cleared: Operational Readiness Nominal.</p>
            </div>
          )}
        </div>

        {/* COMPLETED TASKS (Collapsed) */}
        {completedTasks.length > 0 && (
          <div className="space-y-6 pt-10 border-t-4 border-surface-container-low/30">
            <h3 className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  italic px-4">Archived Missions ({completedTasks.length})</h3>
            <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-surface-container-low/50 p-6 rounded border-2 border-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={16} className="text-success" />
                    <span className="text-[10px] font-semibold text-on-surface uppercase tracking-widest">UNIT-{task.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <span className="text-[8px] font-semibold text-success uppercase tracking-widest italic">DELIVERED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER HUD */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-[110] pointer-events-none">
        <div className="max-w-md mx-auto bg-jumia-orange/90 backdrop-blur-2xl p-6 rounded border-2 border-white/10 shadow-3xl pointer-events-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-jumia-orange/20 rounded-xl flex items-center justify-center border border-jumia-orange/30">
              <Activity size={20} className="text-jumia-orange animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest italic">System Latency</p>
              <p className="text-xs font-semibold text-white tracking-tighter">0.02ms Protocol Link</p>
            </div>
          </div>
          <button className="bg-white text-on-surface px-6 py-3 rounded-xl text-[10px] font-semibold uppercase  hover:bg-jumia-orange-dark hover:text-white transition-all shadow-xl">
            Audit Logs
          </button>
        </div>
      </div>
    </div>
 );
}
