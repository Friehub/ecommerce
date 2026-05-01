'use client';

import { api } from "@/trpc/react";
import { useState } from "react";

export default function AgentDashboard() {
  const { data: shipments, refetch: refetchShipments } = api.logistics.getMyShipments.useQuery();
  const updateStatus = api.logistics.updateShipmentStatus.useMutation({
    onSuccess: () => refetchShipments(),
  });
  const getPresignedUrl = api.logistics.getPresignedUrl.useMutation();

  const [uploading, setUploading] = useState<string | null>(null);

  const handleStatusUpdate = async (shipmentId: string, nextStatus: string) => {
    if (nextStatus === 'DELIVERED') {
      // Trigger file upload flow
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        setUploading(shipmentId);
        try {
          const { url, key } = await getPresignedUrl.mutateAsync({
            fileName: file.name,
            contentType: file.type
          });

          await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });

          await updateStatus.mutateAsync({
            shipmentId,
            status: 'DELIVERED' as any,
            proofUrl: url // Using the public URL for the contest
          });
        } finally {
          setUploading(null);
        }
      };
      input.click();
    } else {
      updateStatus.mutate({ shipmentId, status: nextStatus as any });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '1rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>Agent Dashboard</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Your active deliveries</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {shipments?.map((shipment) => (
          <div key={shipment.id} style={{ 
            background: 'white', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem', 
            boxShadow: 'var(--shadow-sm)',
            borderLeft: `4px solid ${shipment.status === 'DELIVERED' ? 'var(--success)' : 'var(--primary)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)' }}>
                #{shipment.id.slice(0, 8)}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: shipment.status === 'DELIVERED' ? 'var(--success)' : 'var(--primary)' 
              }}>
                {shipment.status}
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>Lagos Delivery</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                {(shipment.package.order as any).address?.streetAddress || (shipment.package.order as any).shippingAddress?.street || 'No address provided'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {shipment.status === 'PENDING' && (
                <button 
                  onClick={() => handleStatusUpdate(shipment.id, 'PICKED_UP')}
                  style={{ flex: 1, padding: '0.75rem', background: 'var(--secondary)', color: 'white', borderRadius: 'var(--radius)', fontWeight: 600 }}
                >
                  Confirm Pickup
                </button>
              )}
              {['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(shipment.status) && (
                <>
                  <button 
                    onClick={() => handleStatusUpdate(shipment.id, 'IN_TRANSIT')}
                    style={{ flex: 1, padding: '0.75rem', background: 'var(--gray-100)', borderRadius: 'var(--radius)', fontSize: '0.75rem' }}
                  >
                    Transit
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(shipment.id, 'DELIVERED')}
                    disabled={uploading === shipment.id}
                    style={{ 
                      flex: 2, 
                      padding: '0.75rem', 
                      background: 'var(--primary)', 
                      color: 'white', 
                      borderRadius: 'var(--radius)', 
                      fontWeight: 600,
                      opacity: uploading === shipment.id ? 0.5 : 1
                    }}
                  >
                    {uploading === shipment.id ? 'Uploading...' : 'Mark Delivered'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        
        {shipments?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gray-400)' }}>
            <p>No shipments assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
