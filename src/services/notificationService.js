/**
 * Notification Service for New Ratna Pan Shop
 * 
 * Handles customer order status alerts (SMS / WhatsApp).
 * Formats standardized messages for shop pickup notifications.
 * Securely designed to invoke backend webhooks or Cloud Functions without
 * exposing private SMS gateway credentials on the client.
 */

export const notificationService = {
  /**
   * Format message according to exact business requirements
   */
  formatMessage(order, status) {
    const tokenDisplay = `#${order.token || order.id}`;
    const cleanStatus = String(status || '').toLowerCase();
    
    switch (cleanStatus) {
      case 'placed':
      case 'received':
        return `New Ratna Pan Shop\nYour order has been received.\nToken: ${tokenDisplay}\nStatus: Order Received.`;
      
      case 'ready':
      case 'ready_for_pickup':
        return `New Ratna Pan Shop\nToken ${tokenDisplay} is READY FOR PICKUP.\nPlease collect your order from the shop counter.`;
        
      case 'accepted':
        return `New Ratna Pan Shop\nYour order Token: ${tokenDisplay} has been ACCEPTED by the shopkeeper.\nStatus: Queued for Fresh Preparation.`;
        
      case 'preparing':
        return `New Ratna Pan Shop\nToken ${tokenDisplay} is now BEING PREPARED FRESH at the counter.`;
        
      case 'completed':
      case 'collected':
        return `New Ratna Pan Shop\nToken ${tokenDisplay} has been COLLECTED & PAID.\nThank you for visiting New Ratna Pan Shop!`;
        
      case 'cancelled':
      case 'rejected':
        return `New Ratna Pan Shop\nToken ${tokenDisplay} has been CANCELLED.\nPlease check with the shop counter for assistance.`;
        
      default:
        return `New Ratna Pan Shop\nToken ${tokenDisplay}\nStatus: ${status}`;
    }
  },

  /**
   * Dispatches order status notification to customer mobile
   */
  async sendOrderStatusNotification(order, status) {
    if (!order || (!order.mobile && !order.phone && !order.mobileNumber)) return null;

    const phone = String(order.mobileNumber || order.mobile || order.phone).replace(/[^0-9]/g, '');
    const message = this.formatMessage(order, status);

    console.log(
      `%c[SMS/WhatsApp Gateway] → +91 ${phone}%c\n${message}`,
      'color: #166534; font-weight: bold; background: #dcfce7; padding: 2px 6px; border-radius: 4px;',
      'color: #1e293b; font-family: monospace;'
    );

    // Optional webhook trigger if configured
    const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
    const webhookUrl = env.VITE_NOTIFICATIONS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message, order, status })
        });
      } catch (e) {
        console.warn('Webhook dispatch skipped:', e.message);
      }
    }

    return {
      success: true,
      recipient: `+91 ${phone}`,
      message,
      timestamp: new Date().toISOString()
    };
  }
};

