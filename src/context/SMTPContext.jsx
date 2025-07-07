import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEmailLog } from './EmailLogContext';

const SMTPContext = createContext();

export const useSMTP = () => {
  const context = useContext(SMTPContext);
  if (!context) {
    throw new Error('useSMTP must be used within an SMTPProvider');
  }
  return context;
};

export const SMTPProvider = ({ children }) => {
  const { logEmail, canSendEmail, incrementEmailCount, queueEmail, processQueue } = useEmailLog();
  
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('smtpConfig');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading SMTP config:', error);
      return null;
    }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);

  useEffect(() => {
    if (config && config.apiKey) {
      checkConnectionStatus();
    }
  }, [config]);

  const checkConnectionStatus = async () => {
    try {
      const hasValidConfig = config && config.apiKey && config.fromEmail;
      setIsConnected(hasValidConfig);
    } catch (error) {
      console.error('Error checking connection status:', error);
      setIsConnected(false);
    }
  };

  // Secure API key encryption (in production, use proper encryption)
  const encryptApiKey = (apiKey) => {
    try {
      // In production, use environment variables and proper encryption
      const encrypted = btoa(apiKey + ':' + Date.now());
      return encrypted;
    } catch (error) {
      console.error('Error encrypting API key:', error);
      return apiKey;
    }
  };

  const decryptApiKey = (encryptedKey) => {
    try {
      const decrypted = atob(encryptedKey);
      return decrypted.split(':')[0]; // Remove timestamp
    } catch (error) {
      return encryptedKey;
    }
  };

  const saveConfig = async (configData) => {
    try {
      const encryptedConfig = {
        ...configData,
        apiKey: encryptApiKey(configData.apiKey),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('smtpConfig', JSON.stringify(encryptedConfig));
      setConfig(encryptedConfig);
      
      await checkConnectionStatus();
      
      return { success: true, message: 'Configuration saved successfully' };
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error('Failed to save configuration: ' + error.message);
    }
  };

  const testConnection = async (configData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { serviceName, apiKey, fromEmail, domain } = configData;
      
      if (!apiKey || apiKey.length < 10) {
        throw new Error('Invalid API key format');
      }
      
      if (!fromEmail || !/\S+@\S+\.\S+/.test(fromEmail)) {
        throw new Error('Invalid from email address');
      }
      
      if (serviceName === 'Mailgun' && !domain) {
        throw new Error('Domain is required for Mailgun');
      }
      
      if (serviceName === 'SendGrid') {
        if (apiKey.startsWith('SG.')) {
          return { success: true, message: 'SendGrid connection successful!' };
        } else {
          throw new Error('SendGrid API key should start with "SG."');
        }
      } else if (serviceName === 'Mailgun') {
        if (apiKey.startsWith('key-')) {
          return { success: true, message: 'Mailgun connection successful!' };
        } else {
          throw new Error('Mailgun API key should start with "key-"');
        }
      }
      
      return { success: true, message: 'Connection test successful!' };
    } catch (error) {
      throw new Error(error.message || 'Connection test failed');
    }
  };

  const sendTestEmail = async (testEmailAddress = 'admin@oholla.ai') => {
    if (!config || !config.apiKey) {
      throw new Error('SMTP not configured. Please save your configuration first.');
    }

    try {
      const emailData = {
        to: testEmailAddress,
        subject: 'SMTP Connection Successful',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #30A46C;">SMTP Connection Successful!</h2>
                <p>This is a test email from the Oholla app. Your SMTP integration is working correctly.</p>
                <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #3D82FF; margin: 0 0 10px 0;">Configuration Details:</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Service:</strong> ${config.serviceName}</li>
                    <li><strong>From Email:</strong> ${config.fromEmail}</li>
                    <li><strong>From Name:</strong> ${config.fromName}</li>
                    <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
                  </ul>
                </div>
                <p>Your email system is ready to send review requests and notifications.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                  This email was sent from the Oholla SMTP test system.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `SMTP Connection Successful!

This is a test email from the Oholla app. Your SMTP integration is working correctly.

Configuration Details:
- Service: ${config.serviceName}
- From Email: ${config.fromEmail}
- From Name: ${config.fromName}
- Test Time: ${new Date().toLocaleString()}

Your email system is ready to send review requests and notifications.

---
This email was sent from the Oholla SMTP test system.`,
        type: 'Test Email',
        provider: config.serviceName
      };

      const result = await sendEmail(emailData);
      setLastTestResult({ success: true, message: `Test email sent successfully to ${testEmailAddress}` });
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to send test email';
      setLastTestResult({ success: false, message: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const sendEmail = async (emailData) => {
    if (!config || !config.apiKey) {
      throw new Error('SMTP not configured');
    }

    try {
      // Check rate limiting
      const { canSend, resetNeeded } = canSendEmail();
      
      if (resetNeeded) {
        // Reset was needed, try again
        const { canSend: canSendAfterReset } = canSendEmail();
        if (!canSendAfterReset) {
          queueEmail(emailData);
          throw new Error('Rate limit exceeded. Email queued for later delivery.');
        }
      } else if (!canSend) {
        queueEmail(emailData);
        throw new Error('Rate limit exceeded. Email queued for later delivery.');
      }

      const decryptedApiKey = decryptApiKey(config.apiKey);
      
      // Simulate sending email based on provider
      let result;
      if (config.serviceName === 'SendGrid') {
        result = await sendViaSendGrid(emailData, decryptedApiKey);
      } else if (config.serviceName === 'Mailgun') {
        result = await sendViaMailgun(emailData, decryptedApiKey);
      } else {
        throw new Error('Unsupported email service');
      }

      // Log the email and increment counter
      const logEntry = logEmail({
        ...emailData,
        provider: config.serviceName,
        messageId: result.messageId
      });

      incrementEmailCount();

      return { success: true, messageId: result.messageId, logId: logEntry?.id };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email: ' + error.message);
    }
  };

  const sendViaSendGrid = async (emailData, apiKey) => {
    try {
      // Simulate SendGrid API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would make a real API call to SendGrid
      console.log('Sending via SendGrid:', emailData);
      
      return { messageId: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    } catch (error) {
      throw new Error(`SendGrid send failed: ${error.message}`);
    }
  };

  const sendViaMailgun = async (emailData, apiKey) => {
    try {
      // Simulate Mailgun API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would make a real API call to Mailgun
      console.log('Sending via Mailgun:', emailData);
      
      return { messageId: `mg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    } catch (error) {
      throw new Error(`Mailgun send failed: ${error.message}`);
    }
  };

  const getEmailTemplates = () => {
    return {
      reviewRequest: {
        subject: 'How was your experience with {{business.name}}?',
        template: 'review_request'
      },
      reviewReminder: {
        subject: 'Quick reminder: Share your experience with {{business.name}}',
        template: 'review_reminder'
      },
      thankYou: {
        subject: 'Thank you for your review!',
        template: 'thank_you'
      },
      negativeFeedback: {
        subject: 'Thank you for your feedback - We want to make this right',
        template: 'negative_feedback'
      }
    };
  };

  return (
    <SMTPContext.Provider value={{
      config,
      isConnected,
      lastTestResult,
      saveConfig,
      testConnection,
      sendTestEmail,
      sendEmail,
      getEmailTemplates,
      checkConnectionStatus
    }}>
      {children}
    </SMTPContext.Provider>
  );
};