export type EventType = 
  | 'user.created'
  | 'order.placed'
  | 'order.paid'
  | 'order.shipped'
  | 'product.created'
  | 'stock.updated'
  | 'payment.failed'
  | 'payout.triggered';

export interface BaseEvent<T = any> {
  id: string;
  type: EventType;
  payload: T;
  timestamp: number;
  metadata?: Record<string, any>;
}
