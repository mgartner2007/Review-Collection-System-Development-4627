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
      subject: `Quick favor? How was your experience with ${customerData.businessName}?`,
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
      subject: `Just following up - Your experience with ${customerData.businessName}`,
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
      subject: 'Thank you! Your review means the world to us',
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
      subject: 'Thank you for your honest feedback - Let\'s make this right',
      html: this.generateNegativeFeedbackTemplate(customerData),
      text: this.generateNegativeFeedbackText(customerData)
    };

    return await this.sendEmail(emailData);
  }

  async sendWelcomeEmail(customerData) {
    const emailData = {
      to: customerData.email,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: `Welcome to ${customerData.businessName} - We're excited to serve you!`,
      html: this.generateWelcomeTemplate(customerData),
      text: this.generateWelcomeText(customerData)
    };

    return await this.sendEmail(emailData);
  }

  async sendFollowUp(customerData, reviewUrl) {
    const emailData = {
      to: customerData.email,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'How did we do? Your experience matters to us',
      html: this.generateFollowUpTemplate(customerData, reviewUrl),
      text: this.generateFollowUpText(customerData, reviewUrl)
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

      return {
        success: true,
        messageId: response.headers.get('X-Message-Id')
      };
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
      return {
        success: true,
        messageId: result.id
      };
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #3D82FF; margin: 0;">Hi ${customerData.name},</h2>
          </div>
          
          <p>Hope you're doing well! I wanted to personally reach out and thank you for choosing ${customerData.businessName} for your recent service.</p>
          
          <p>Your trust means everything to us, and I'd love to hear about your experience. Would you mind taking just 30 seconds to share your thoughts?</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewUrl}" 
               style="background-color: #3D82FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Share Your Experience
            </a>
          </div>
          
          <p>Your honest feedback helps us continue to improve and also helps other customers make confident decisions when choosing a service provider.</p>
          
          <p>If you had a great experience, we'd be incredibly grateful if you could share it publicly. If there's anything we could have done better, please don't hesitate to let us know directly.</p>
          
          <p>Thank you again for your business and for taking the time to help us grow.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0;"><strong>Best regards,</strong><br>The ${customerData.businessName} Team</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              P.S. - We read every single review and truly appreciate your time!
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.<br>
            If you no longer wish to receive these emails, please contact us directly.
          </p>
        </body>
      </html>
    `;
  }

  generateReviewRequestText(customerData, reviewUrl) {
    return `Hi ${customerData.name},

Hope you're doing well! I wanted to personally reach out and thank you for choosing ${customerData.businessName} for your recent service.

Your trust means everything to us, and I'd love to hear about your experience. Would you mind taking just 30 seconds to share your thoughts?

${reviewUrl}

Your honest feedback helps us continue to improve and also helps other customers make confident decisions when choosing a service provider.

If you had a great experience, we'd be incredibly grateful if you could share it publicly. If there's anything we could have done better, please don't hesitate to let us know directly.

Thank you again for your business and for taking the time to help us grow.

Best regards,
The ${customerData.businessName} Team

P.S. - We read every single review and truly appreciate your time!

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.
If you no longer wish to receive these emails, please contact us directly.`;
  }

  generateReminderTemplate(customerData, reviewUrl) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <h2 style="color: #856404; margin: 0;">Hi ${customerData.name},</h2>
          </div>
          
          <p>I hope this message finds you well! I wanted to follow up on my previous email about your recent experience with ${customerData.businessName}.</p>
          
          <p>I know life gets busy (trust me, I get it!), but if you have just a quick minute, we'd still love to hear your thoughts about our service.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewUrl}" 
               style="background-color: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Share Your Experience
            </a>
          </div>
          
          <p>Whether your experience was fantastic or if there's something we could have done better, your honest feedback is invaluable to us. It helps us serve you and future customers better.</p>
          
          <p>No pressure at all - just hoping to learn from your experience!</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0;"><strong>Warm regards,</strong><br>The ${customerData.businessName} Team</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.<br>
            If you no longer wish to receive these emails, please contact us directly.
          </p>
        </body>
      </html>
    `;
  }

  generateReminderText(customerData, reviewUrl) {
    return `Hi ${customerData.name},

I hope this message finds you well! I wanted to follow up on my previous email about your recent experience with ${customerData.businessName}.

I know life gets busy (trust me, I get it!), but if you have just a quick minute, we'd still love to hear your thoughts about our service.

${reviewUrl}

Whether your experience was fantastic or if there's something we could have done better, your honest feedback is invaluable to us. It helps us serve you and future customers better.

No pressure at all - just hoping to learn from your experience!

Thank you for choosing ${customerData.businessName}, and thanks in advance for your time.

Warm regards,
The ${customerData.businessName} Team

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.
If you no longer wish to receive these emails, please contact us directly.`;
  }

  generateThankYouTemplate(customerData) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h2 style="color: #155724; margin: 0;">Hi ${customerData.name},</h2>
          </div>
          
          <p><strong>WOW!</strong> Thank you so much for taking the time to leave us such a wonderful review! 🌟</p>
          
          <p>Your kind words absolutely made our day (and probably our week!). Reviews like yours remind us why we love what we do and motivate us to keep delivering exceptional service.</p>
          
          <p>Your feedback not only helps us know we're on the right track, but it also helps other customers feel confident in choosing ${customerData.businessName}. We can't thank you enough for that.</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; text-align: center; font-style: italic;">
              "We're so grateful for customers like you, and we look forward to serving you again in the future."
            </p>
          </div>
          
          <p>If you ever need our services again or have any questions, please don't hesitate to reach out. You're always welcome here!</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0;"><strong>With heartfelt appreciation,</strong><br>The ${customerData.businessName} Team</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              P.S. - Your review has been shared with our entire team. Everyone is smiling! 😊
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.
          </p>
        </body>
      </html>
    `;
  }

  generateThankYouText(customerData) {
    return `Hi ${customerData.name},

WOW! Thank you so much for taking the time to leave us such a wonderful review! 🌟

Your kind words absolutely made our day (and probably our week!). Reviews like yours remind us why we love what we do and motivate us to keep delivering exceptional service.

Your feedback not only helps us know we're on the right track, but it also helps other customers feel confident in choosing ${customerData.businessName}. We can't thank you enough for that.

We're so grateful for customers like you, and we look forward to serving you again in the future.

If you ever need our services again or have any questions, please don't hesitate to reach out. You're always welcome here!

With heartfelt appreciation,
The ${customerData.businessName} Team

P.S. - Your review has been shared with our entire team. Everyone is smiling! 😊

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.`;
  }

  generateNegativeFeedbackTemplate(customerData) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
            <h2 style="color: #721c24; margin: 0;">Hi ${customerData.name},</h2>
          </div>
          
          <p>Thank you for taking the time to share your honest feedback about your recent experience with ${customerData.businessName}. I genuinely appreciate your candor.</p>
          
          <p><strong>I'm truly sorry that we didn't meet your expectations.</strong> Your experience is not the standard we strive for, and I want to personally make this right.</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;">
              <strong>Your feedback is incredibly valuable to us,</strong> and we take all concerns very seriously. Every piece of feedback helps us identify areas where we can improve and better serve our customers.
            </p>
          </div>
          
          <p>I would love the opportunity to discuss your experience personally and see how we can turn this around. Please feel free to reply to this email or call us directly at ${customerData.businessPhone} at your convenience.</p>
          
          <p>We're committed to learning from this experience and using your feedback to improve our services for you and all our customers.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0;"><strong>Sincerely,</strong><br>The ${customerData.businessName} Team</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              P.S. - Your feedback will be shared with our team to ensure we continue to improve our service quality.
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.<br>
            If you have any concerns about this email, please contact us directly.
          </p>
        </body>
      </html>
    `;
  }

  generateNegativeFeedbackText(customerData) {
    return `Hi ${customerData.name},

Thank you for taking the time to share your honest feedback about your recent experience with ${customerData.businessName}. I genuinely appreciate your candor.

I'm truly sorry that we didn't meet your expectations. Your experience is not the standard we strive for, and I want to personally make this right.

Your feedback is incredibly valuable to us, and we take all concerns very seriously. Every piece of feedback helps us identify areas where we can improve and better serve our customers.

I would love the opportunity to discuss your experience personally and see how we can turn this around. Please feel free to reply to this email or call us directly at ${customerData.businessPhone} at your convenience.

We're committed to learning from this experience and using your feedback to improve our services for you and all our customers.

Thank you for giving us the chance to make things right. We truly value your business and hope to earn back your trust.

Sincerely,
The ${customerData.businessName} Team

P.S. - Your feedback will be shared with our team to ensure we continue to improve our service quality.

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.
If you have any concerns about this email, please contact us directly.`;
  }

  generateWelcomeTemplate(customerData) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3D82FF;">
            <h2 style="color: #1e4d72; margin: 0;">Hi ${customerData.name},</h2>
          </div>
          
          <p><strong>Welcome to the ${customerData.businessName} family!</strong> We're absolutely thrilled to have you as our customer.</p>
          
          <p>We wanted to take a moment to personally thank you for choosing us for your needs. We don't take your trust lightly, and we're committed to providing you with exceptional service every step of the way.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3D82FF; margin: 0 0 15px 0;">Here's what you can expect from us:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              <li style="margin-bottom: 8px;">Professional, reliable service</li>
              <li style="margin-bottom: 8px;">Clear communication throughout the process</li>
              <li style="margin-bottom: 8px;">Attention to detail in everything we do</li>
              <li style="margin-bottom: 8px;">A team that genuinely cares about your satisfaction</li>
            </ul>
          </div>
          
          <p>If you have any questions, concerns, or special requests, please don't hesitate to reach out. We're here to make your experience as smooth and positive as possible.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0;"><strong>Warm regards,</strong><br>The ${customerData.businessName} Team</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.
          </p>
        </body>
      </html>
    `;
  }

  generateWelcomeText(customerData) {
    return `Hi ${customerData.name},

Welcome to the ${customerData.businessName} family! We're absolutely thrilled to have you as our customer.

We wanted to take a moment to personally thank you for choosing us for your needs. We don't take your trust lightly, and we're committed to providing you with exceptional service every step of the way.

Here's what you can expect from us:
• Professional, reliable service
• Clear communication throughout the process
• Attention to detail in everything we do
• A team that genuinely cares about your satisfaction

If you have any questions, concerns, or special requests, please don't hesitate to reach out. We're here to make your experience as smooth and positive as possible.

Thank you again for choosing ${customerData.businessName}. We look forward to exceeding your expectations!

Warm regards,
The ${customerData.businessName} Team

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.`;
  }

  generateFollowUpTemplate(customerData, reviewUrl) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #30A46C;">
            <h2 style="color: #1e5631; margin: 0;">Hi ${customerData.name},</h2>
          </div>
          
          <p>I hope you're pleased with the service we recently provided! It was a pleasure working with you.</p>
          
          <p>At ${customerData.businessName}, we're always looking for ways to improve and ensure our customers have the best possible experience. Your feedback is crucial in helping us achieve this goal.</p>
          
          <p>If you have a few moments, we'd love to hear about your experience:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewUrl}" 
               style="background-color: #30A46C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Share Your Experience
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #30A46C; margin: 0 0 15px 0;">Your honest review helps us in two important ways:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #555;">
              <li style="margin-bottom: 8px;">It lets us know what we're doing well and where we can improve</li>
              <li style="margin-bottom: 8px;">It helps other customers make informed decisions about our services</li>
            </ol>
          </div>
          
          <p>We truly appreciate customers like you who take the time to share their experiences. It makes a real difference to our business and our team.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0;"><strong>Best regards,</strong><br>The ${customerData.businessName} Team</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.<br>
            If you no longer wish to receive these emails, please contact us directly.
          </p>
        </body>
      </html>
    `;
  }

  generateFollowUpText(customerData, reviewUrl) {
    return `Hi ${customerData.name},

I hope you're pleased with the service we recently provided! It was a pleasure working with you.

At ${customerData.businessName}, we're always looking for ways to improve and ensure our customers have the best possible experience. Your feedback is crucial in helping us achieve this goal.

If you have a few moments, we'd love to hear about your experience:

${reviewUrl}

Your honest review helps us in two important ways:
1. It lets us know what we're doing well and where we can improve
2. It helps other customers make informed decisions about our services

We truly appreciate customers like you who take the time to share their experiences. It makes a real difference to our business and our team.

Thank you again for choosing ${customerData.businessName}. We hope to have the opportunity to serve you again soon!

Best regards,
The ${customerData.businessName} Team

---
This email was sent from ${this.config.fromEmail} on behalf of ${customerData.businessName}.
If you no longer wish to receive these emails, please contact us directly.`;
  }
}

export default EmailService;