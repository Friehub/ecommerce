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
  SELLER_SUSPENDED: (payload: { sellerId: string; reason?: string }) => ({
    subject: `Seller Account Suspended`,
    html: `<p>Your seller account (${payload.sellerId}) has been suspended.${payload.reason ? ` Reason: ${payload.reason}` : ''} Please contact support for more information.</p>`
  }),
  SELLER_DOCUMENT_REJECTED: (payload: { documentType: string; reason: string }) => ({
    subject: `Seller Document Rejected`,
    html: `<p>Your ${payload.documentType} document was rejected. Reason: ${payload.reason}</p>`
  }),
  DISPUTE_OPENED: (payload: { disputeId: string; reason: string }) => ({
    subject: `New Dispute Opened #${payload.disputeId}`,
    html: `<p>A new dispute has been opened for one of your orders. Dispute ID: <strong>#${payload.disputeId}</strong>. Reason: ${payload.reason}</p>`
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
  }),
  SELLER_TIER_CHANGED: (payload: { sellerId: string; oldTier: string; newTier: string }) => ({
    subject: `Seller Tier Updated: Welcome to ${payload.newTier}!`,
    html: `<p>Congratulations! Your seller tier has been updated from <strong>${payload.oldTier}</strong> to <strong>${payload.newTier}</strong>. Your account metrics met the criteria for this upgrade.</p>`
  }),
  ORDER_COMPLETED: (payload: { orderId: string }) => ({
    subject: `Order Completed #${payload.orderId}`,
    html: `<p>Your order <strong>#${payload.orderId}</strong> is now complete. Thank you for shopping with us! Don't forget to leave a review.</p>`
  }),
  PASSWORD_RESET: (payload: { email: string; token: string; baseUrl: string }) => ({
    subject: `Reset Your Password`,
    html: `
      <p>Hello,</p>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <p><a href="${payload.baseUrl}/auth/reset-password?token=${payload.token}" style="display:inline-block;padding:12px 24px;background-color:#F68B1E;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `
  })
} satisfies Record<string, (p: any) => { subject: string; html: string }>;
