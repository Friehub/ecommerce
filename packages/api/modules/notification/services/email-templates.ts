export const emailTemplates = {
  ORDER_CREATED: (payload: { orderId: string; total: number }) => ({
    subject: `Order Created #${payload.orderId}`,
    html: `<p>Your order <strong>#${payload.orderId}</strong> has been created with total: <strong>₦${payload.total}</strong>.</p>`
  }),
  PAYMENT_CONFIRMED: (payload: { orderId: string; amount: number }) => ({
    subject: `Payment Confirmed #${payload.orderId}`,
    html: `<p>We have received your payment of ₦${payload.amount} for order <strong>#${payload.orderId}</strong>.</p>`
  }),
  ORDER_SHIPPED: (payload: { orderId: string; trackingNumber?: string }) => ({
    subject: `Order Shipped #${payload.orderId}`,
    html: `<p>Good news! Your order <strong>#${payload.orderId}</strong> has been shipped.${payload.trackingNumber ? ` Tracking number: ${payload.trackingNumber}` : ''}</p>`
  }),
  SELLER_APPROVED: (payload: { sellerId: string }) => ({
    subject: `Seller Approved`,
    html: `<p>Congratulations! Your seller profile (${payload.sellerId}) has been approved. You can now sell on our platform.</p>`
  }),
  SELLER_DOCUMENT_REJECTED: (payload: { documentType: string; reason: string }) => ({
    subject: `Seller Document Rejected`,
    html: `<p>Your ${payload.documentType} document was rejected. Reason: ${payload.reason}</p>`
  }),
  DISPUTE_RESOLVED: (payload: { disputeId: string; resolution: string }) => ({
    subject: `Dispute Resolved #${payload.disputeId}`,
    html: `<p>Your dispute #${payload.disputeId} has been resolved: <strong>${payload.resolution}</strong>.</p>`
  }),
  PRICE_DROP_ALERT: (payload: { productTitle: string; oldPrice: number; newPrice: number }) => ({
    subject: `Price Drop Alert: ${payload.productTitle}`,
    html: `<p>Awesome news! A variant of <strong>${payload.productTitle}</strong> on your wishlist dropped from ₦${payload.oldPrice} to <strong>₦${payload.newPrice}</strong>.</p>`
  }),
  ORDER_DELIVERED: (payload: { orderId: string }) => ({
    subject: `Order Delivered #${payload.orderId}`,
    html: `<p>Your order <strong>#${payload.orderId}</strong> has been delivered. We hope you enjoy your purchase!</p>`
  }),
  REFUND_PROCESSED: (payload: { orderId: string; amount: number; reason?: string }) => ({
    subject: `Refund Processed #${payload.orderId}`,
    html: `<p>A refund of <strong>₦${payload.amount}</strong> for order <strong>#${payload.orderId}</strong> has been processed to your wallet.${payload.reason ? ` Reason: ${payload.reason}` : ''}</p>`
  })
} satisfies Record<string, (p: any) => { subject: string; html: string }>;
