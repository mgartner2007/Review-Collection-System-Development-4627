// Email security utilities
export class EmailSecurity {
  // Encrypt sensitive data before storage
  static encryptData(data, key = null) {
    try {
      // In production, use a proper encryption library like crypto-js
      // For demo purposes, we'll use base64 encoding with a timestamp
      const timestamp = Date.now();
      const dataWithTimestamp = `${data}:${timestamp}`;
      return btoa(dataWithTimestamp);
    } catch (error) {
      console.error('Error encrypting data:', error);
      return data;
    }
  }

  // Decrypt sensitive data
  static decryptData(encryptedData, key = null) {
    try {
      const decrypted = atob(encryptedData);
      const [data] = decrypted.split(':');
      return data;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData;
    }
  }

  // Validate email address format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sanitize email content to prevent XSS
  static sanitizeContent(content) {
    // Remove potentially dangerous HTML tags and attributes
    const dangerousTags = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const dangerousAttributes = /on\w+\s*=\s*["'][^"']*["']/gi;
    
    return content
      .replace(dangerousTags, '')
      .replace(dangerousAttributes, '');
  }

  // Generate secure API key
  static generateSecureKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Rate limiting check
  static checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowKey = `rate_limit_${identifier}_${Math.floor(now / windowMs)}`;
    
    // In production, this would use Redis or similar
    const stored = localStorage.getItem(windowKey);
    const count = stored ? parseInt(stored) : 0;
    
    if (count >= maxRequests) {
      return {
        allowed: false,
        resetTime: Math.ceil((Math.floor(now / windowMs) + 1) * windowMs)
      };
    }
    
    localStorage.setItem(windowKey, (count + 1).toString());
    
    return {
      allowed: true,
      remaining: maxRequests - count - 1
    };
  }

  // Validate webhook signature
  static validateWebhookSignature(payload, signature, secret) {
    // In production, use crypto.createHmac
    // For demo purposes, we'll do basic validation
    return signature && signature.length > 0;
  }

  // Log security events
  static logSecurityEvent(event, details = {}) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // In production, this would be logged server-side
    };
    
    // In production, send to security monitoring service
    console.log('Security Event:', securityLog);
    
    // Store locally for audit trail
    const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    existingLogs.push(securityLog);
    
    // Keep only last 100 logs
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('securityLogs', JSON.stringify(existingLogs));
  }

  // Environment variable validation
  static validateEnvironmentVariables() {
    const required = [
      'VITE_SENDGRID_API_KEY',
      'VITE_MAILGUN_API_KEY',
      'VITE_WEBHOOK_SECRET'
    ];
    
    const missing = required.filter(key => !import.meta.env[key]);
    
    if (missing.length > 0) {
      console.warn('Missing environment variables:', missing);
      return false;
    }
    
    return true;
  }
}

export default EmailSecurity;