class EmailService {
  constructor(smtpConfig) {
    this.config = smtpConfig;
  }

  async sendReviewRequest(customerData, reviewUrl) {
    const emailData = {
      to: customerData.email,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: `How was your experience with ${customerData.businessName}?`,
      html: this.generateReviewRequestTemplate(customerData, reviewUrl),
      text: this.generateReviewRequestText(customerData, reviewUrl)
    };

    return await this.sendEmail(emailData);
  }

  async sendReviewReminder(customerData, reviewUrl) {
    const emailData = {
      to: customerData.email,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: `Quick reminder: Share your experience with ${customerData.businessName}`,
      html: this.generateReminderTemplate(customerData, reviewUrl),
      text: this.generateReminderText(customerData, reviewUrl)
    };

    return await this.sendEmail(emailData);
  }

  async sendThankYou(customerData) {
    const emailData = {
      to: customerData.email,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'Thank you for your review!',
      html: this.generateThankYouTemplate(customerData),
      text: this.generateThankYouText(customerData)
    };

    return await this.sendEmail(emailData);
  }

  async sendNegativeFeedbackResponse(customerData) {
    const emailData = {
      to: customerData.email,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'Thank you for your feedback - We want to make this right',
      html: this.generateNegativeFeedbackTemplate(customerData),
      text: this.generateNegativeFeedbackText(customerData)
    };

    return await this.sendEmail(emailData);
  }

  async sendEmail(emailData) {
    if (this.config.serviceName === 'SendGrid') {
      return await this.sendViaSendGrid(emailData);
    } else if (this.config.serviceName === 'Mailgun') {
      return await this.sendViaMailgun(emailData);
    } else {
      throw new Error('Unsupported email service');
    }
  }

  async sendViaSendGrid(emailData) {
    try {
      // In a real implementation, this would use the SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.decryptApiKey(this.config.apiKey)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: emailData.to }],
              subject: emailData.subject
            }
          ],
          from: emailData.from,
          content: [
            {
              type: 'text/plain',
              value: emailData.text
            },
            {
              type: 'text/html',
              value: emailData.html
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.status}`);
      }

      return { success: true, messageId: response.headers.get('X-Message-Id') };
    } catch (error) {
      throw new Error(`SendGrid send failed: ${error.message}`);
    }
  }

  async sendViaMailgun(emailData) {
    try {
      // In a real implementation, this would use the Mailgun API
      const formData = new FormData();
      formData.append('from', `${emailData.from.name} <${emailData.from.email}>`);
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('text', emailData.text);
      formData.append('html', emailData.html);

      const response = await fetch(`https://api.mailgun.net/v3/${this.config.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.decryptApiKey(this.config.apiKey)}`)}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Mailgun API error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, messageId: result.id };
    } catch (error) {
      throw new Error(`Mailgun send failed: ${error.message}`);
    }
  }

  decryptApiKey(encryptedKey) {
    try {
      return atob(encryptedKey);
    } catch (error) {
      return encryptedKey;
    }
  }

  generateReviewRequestTemplate(customerData, reviewUrl) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3D82FF;">Hi ${customerData.name},</h2>
            
            <p>I hope this email finds you well. I wanted to personally reach out to thank you for choosing ${customerData.businessName} for your recent project.</p>
            
            <p>Your trust in our services means the world to us. We're always striving to provide the best possible experience for our customers, and your feedback is invaluable in helping us achieve that goal.</p>
            
            <p>Would you mind taking a moment to share your thoughts about our service?</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" style="background-color: #3D82FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Share Your Experience</a>
            </div>
            
            <p>Your honest review helps us improve and also helps other customers make informed decisions when choosing a service provider.</p>
            
            <p>Thank you again for your business and for taking the time to help us grow.</p>
            
            <p>Best regards,<br>${customerData.businessName} Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.</p>
          </div>
        </body>
      </html>
    `;
  }

  generateReviewRequestText(customerData, reviewUrl) {
    return `Hi ${customerData.name},

I hope this email finds you well. I wanted to personally reach out to thank you for choosing ${customerData.businessName} for your recent project.

Your trust in our services means the world to us. We're always striving to provide the best possible experience for our customers, and your feedback is invaluable in helping us achieve that goal.

Would you mind taking a moment to share your thoughts about our service?

${reviewUrl}

Your honest review helps us improve and also helps other customers make informed decisions when choosing a service provider.

Thank you again for your business and for taking the time to help us grow.

Best regards,
${customerData.businessName} Team

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.`;
  }

  generateReminderTemplate(customerData, reviewUrl) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3D82FF;">Hi ${customerData.name},</h2>
            
            <p>I hope you're doing well! I wanted to follow up on my previous email about your recent experience with ${customerData.businessName}.</p>
            
            <p>We understand how busy life can get, but if you have just a minute, we'd still love to hear your feedback about our service.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" style="background-color: #3D82FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Share Your Experience</a>
            </div>
            
            <p>Whether your experience was fantastic or if there's something we could have done better, we genuinely want to hear from you.</p>
            
            <p>Thank you so much for your time and for choosing ${customerData.businessName}.</p>
            
            <p>Best regards,<br>${customerData.businessName} Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.</p>
          </div>
        </body>
      </html>
    `;
  }

  generateReminderText(customerData, reviewUrl) {
    return `Hi ${customerData.name},

I hope you're doing well! I wanted to follow up on my previous email about your recent experience with ${customerData.businessName}.

We understand how busy life can get, but if you have just a minute, we'd still love to hear your feedback about our service.

${reviewUrl}

Whether your experience was fantastic or if there's something we could have done better, we genuinely want to hear from you.

Thank you so much for your time and for choosing ${customerData.businessName}.

Best regards,
${customerData.businessName} Team

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.`;
  }

  generateThankYouTemplate(customerData) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #30A46C;">Hi ${customerData.name},</h2>
            
            <p>Thank you so much for taking the time to leave us a review! Your feedback means everything to us.</p>
            
            <p>We're thrilled to hear about your positive experience with ${customerData.businessName}. Reviews like yours help us know we're on the right track and encourage us to keep delivering excellent service.</p>
            
            <p>Your review also helps other customers feel confident in choosing our services, and we can't thank you enough for that.</p>
            
            <p>We truly appreciate your business and look forward to serving you again in the future.</p>
            
            <p>Best regards,<br>${customerData.businessName} Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.</p>
          </div>
        </body>
      </html>
    `;
  }

  generateThankYouText(customerData) {
    return `Hi ${customerData.name},

Thank you so much for taking the time to leave us a review! Your feedback means everything to us.

We're thrilled to hear about your positive experience with ${customerData.businessName}. Reviews like yours help us know we're on the right track and encourage us to keep delivering excellent service.

Your review also helps other customers feel confident in choosing our services, and we can't thank you enough for that.

We truly appreciate your business and look forward to serving you again in the future.

Best regards,
${customerData.businessName} Team

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.`;
  }

  generateNegativeFeedbackTemplate(customerData) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #F76808;">Hi ${customerData.name},</h2>
            
            <p>Thank you for taking the time to share your feedback about your recent experience with ${customerData.businessName}. We sincerely appreciate your honesty.</p>
            
            <p>I'm sorry to hear that we didn't meet your expectations. Your feedback is incredibly valuable to us, and we take all concerns seriously.</p>
            
            <p>We want to make this right and ensure you have a positive experience with us. I would love the opportunity to discuss your concerns personally and see how we can improve.</p>
            
            <p>Please feel free to reply to this email or call us directly at ${customerData.businessPhone} at your convenience.</p>
            
            <p>We're committed to learning from this experience and using your feedback to improve our services for you and all our customers.</p>
            
            <p>Thank you again for giving us the chance to make things right.</p>
            
            <p>Best regards,<br>${customerData.businessName} Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.</p>
          </div>
        </body>
      </html>
    `;
  }

  generateNegativeFeedbackText(customerData) {
    return `Hi ${customerData.name},

Thank you for taking the time to share your feedback about your recent experience with ${customerData.businessName}. We sincerely appreciate your honesty.

I'm sorry to hear that we didn't meet your expectations. Your feedback is incredibly valuable to us, and we take all concerns seriously.

We want to make this right and ensure you have a positive experience with us. I would love the opportunity to discuss your concerns personally and see how we can improve.

Please feel free to reply to this email or call us directly at ${customerData.businessPhone} at your convenience.

We're committed to learning from this experience and using your feedback to improve our services for you and all our customers.

Thank you again for giving us the chance to make things right.

Best regards,
${customerData.businessName} Team

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.`;
  }
}

export default EmailService;