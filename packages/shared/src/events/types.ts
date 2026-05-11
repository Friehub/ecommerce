export type EventType = 
  | 'user.created'
  | 'order.created'
  | 'order.status_updated'
  | 'order.paid'
  | 'order.shipped'
  | 'order.delivered'
  | 'order.cancelled'
  | 'package.pending_confirmation'
  | 'package.status_updated'
  | 'shipment.agent_assigned'
  | 'shipment.status_updated'
  | 'shipment.delivered'
  | 'product.created'
  | 'product.updated'
  | 'stock.updated'
  | 'inventory.updated'
  | 'payment.failed'
  | 'payment.confirmed'
  | 'order.completed'
  | 'refund.processed'
  | 'stock.low'
  | 'stock.reserved'
  | 'stock.released'
  | 'dispute.opened'
  | 'dispute.resolved'
  | 'referral.clicked'
  | 'commission.earned'
  | 'ad.impression'
  | 'ad.click'
  | 'ad.conversion'
  | 'user.registered'
  | 'seller.approved'
  | 'seller.document_rejected'
  | 'payout.failed'
  | 'dispute.escalated'
  | 'seller.suspended'
  | 'seller.status_updated';

export interface BaseEvent<T = any> {
  id: string;
  type: EventType;
  payload: T;
  timestamp: number;
  metadata?: Record<string, any>;
}
