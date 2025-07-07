// Webhook service for handling email provider webhooks
class WebhookService {
  constructor() {
    this.webhookEndpoints = {
      sendgrid: '/api/webhooks/sendgrid',
      mailgun: '/api/webhooks/mailgun'
    };
  }

  // Handle SendGrid webhook events
  handleSendGridWebhook(eventData) {
    const events = Array.isArray(eventData) ? eventData : [eventData];
    
    events.forEach(event => {
      const { event: eventType, sg_message_id, email, timestamp } = event;
      
      switch (eventType) {
        case 'delivered':
          this.updateEmailStatus(sg_message_id, 'Delivered', timestamp);
          break;
        case 'open':
          this.trackEmailEvent(sg_message_id, 'opened', timestamp);
          break;
        case 'click':
          this.trackEmailEvent(sg_message_id, 'clicked', timestamp);
          break;
        case 'bounce':
        case 'blocked':
        case 'dropped':
          this.trackEmailEvent(sg_message_id, 'bounced', timestamp);
          break;
        case 'unsubscribe':
          this.trackEmailEvent(sg_message_id, 'unsubscribed', timestamp);
          break;
        case 'spamreport':
          this.trackEmailEvent(sg_message_id, 'spam', timestamp);
          break;
      }
    });
  }

  // Handle Mailgun webhook events
  handleMailgunWebhook(eventData) {
    const { event, message, timestamp } = eventData;
    const messageId = message?.headers?.['message-id'];
    
    if (!messageId) return;
    
    switch (event) {
      case 'delivered':
        this.updateEmailStatus(messageId, 'Delivered', timestamp);
        break;
      case 'opened':
        this.trackEmailEvent(messageId, 'opened', timestamp);
        break;
      case 'clicked':
        this.trackEmailEvent(messageId, 'clicked', timestamp);
        break;
      case 'bounced':
      case 'failed':
        this.trackEmailEvent(messageId, 'bounced', timestamp);
        break;
      case 'unsubscribed':
        this.trackEmailEvent(messageId, 'unsubscribed', timestamp);
        break;
      case 'complained':
        this.trackEmailEvent(messageId, 'spam', timestamp);
        break;
    }
  }

  // Update email status in the email log context
  updateEmailStatus(messageId, status, timestamp) {
    // This would typically update the database
    // For now, we'll use the context methods
    if (window.emailLogContext) {
      window.emailLogContext.updateEmailStatus(messageId, status, new Date(timestamp * 1000).toISOString());
    }
  }

  // Track email events
  trackEmailEvent(messageId, eventType, timestamp) {
    // This would typically update the database
    // For now, we'll use the context methods
    if (window.emailLogContext) {
      window.emailLogContext.trackEmailEvent(messageId, eventType, new Date(timestamp * 1000).toISOString());
    }
  }

  // Setup webhook endpoints (this would be done on the backend)
  setupWebhookEndpoints() {
    return {
      sendgrid: {
        url: `${window.location.origin}/api/webhooks/sendgrid`,
        events: ['delivered', 'open', 'click', 'bounce', 'blocked', 'dropped', 'unsubscribe', 'spamreport']
      },
      mailgun: {
        url: `${window.location.origin}/api/webhooks/mailgun`,
        events: ['delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed', 'complained']
      }
    };
  }

  // Validate webhook signature (security measure)
  validateWebhookSignature(provider, signature, payload, timestamp) {
    // This would implement signature validation based on the provider
    // SendGrid uses HMAC-SHA256
    // Mailgun uses HMAC-SHA256 with their webhook signing key
    
    switch (provider) {
      case 'sendgrid':
        return this.validateSendGridSignature(signature, payload, timestamp);
      case 'mailgun':
        return this.validateMailgunSignature(signature, payload, timestamp);
      default:
        return false;
    }
  }

  validateSendGridSignature(signature, payload, timestamp) {
    // Implementation would use crypto.createHmac with SendGrid's webhook key
    // For demo purposes, we'll return true
    return true;
  }

  validateMailgunSignature(signature, payload, timestamp) {
    // Implementation would use crypto.createHmac with Mailgun's webhook signing key
    // For demo purposes, we'll return true
    return true;
  }

  // Simulate webhook events for testing
  simulateWebhookEvent(provider, messageId, eventType) {
    const timestamp = Math.floor(Date.now() / 1000);
    
    if (provider === 'sendgrid') {
      this.handleSendGridWebhook({
        event: eventType,
        sg_message_id: messageId,
        email: 'test@example.com',
        timestamp
      });
    } else if (provider === 'mailgun') {
      this.handleMailgunWebhook({
        event: eventType,
        message: {
          headers: {
            'message-id': messageId
          }
        },
        timestamp
      });
    }
  }
}

export default new WebhookService();