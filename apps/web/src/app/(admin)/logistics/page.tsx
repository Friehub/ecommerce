'use client';

import { api } from "@/utils/api";
import { useState } from "react";

export default function LogisticsAdminPage() {
  const { data: shipments, refetch: refetchShipments } = api.logistics.listAllShipments.useQuery();
  const { data: agents } = api.logistics.listAgents.useQuery();
  const assignAgent = api.logistics.assignAgent.useMutation({
    onSuccess: () => refetchShipments(),
  });

  const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});

  const handleAssign = (shipmentId: string) => {
    const agentId = selectedAgent[shipmentId];
    if (!agentId) return;
    assignAgent.mutate({ shipmentId, agentId });
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)' }}>Logistics Management</h1>
        <p style={{ color: 'var(--gray-500)' }}>Assign agents and track shipments</p>
      </header>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Package ID</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Destination</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Agent</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {shipments?.map((shipment) => (
              <tr key={shipment.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{shipment.packageId.slice(0, 8)}...</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  Lagos, Nigeria
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: shipment.status === 'DELIVERED' ? 'var(--success)' : 'var(--warning)',
                    color: 'white'
                  }}>
                    {shipment.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {shipment.agent ? (
                    <span style={{ fontSize: '0.875rem' }}>{shipment.agentId.slice(0, 8)}</span>
                  ) : (
                    <select 
                      value={selectedAgent[shipment.id] || ''}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, [shipment.id]: e.target.value })}
                      style={{ padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-300)' }}
                    >
                      <option value="">Select Agent</option>
                      {agents?.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.id.slice(0, 8)}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  {!shipment.agent && (
                    <button 
                      onClick={() => handleAssign(shipment.id)}
                      disabled={!selectedAgent[shipment.id] || assignAgent.isLoading}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        opacity: (!selectedAgent[shipment.id] || assignAgent.isLoading) ? 0.5 : 1
                      }}
                    >
                      {assignAgent.isLoading ? 'Assigning...' : 'Assign'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
