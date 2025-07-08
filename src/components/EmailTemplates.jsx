import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useBusiness } from '../context/BusinessContext';

const { FiMail, FiClock, FiEye, FiLock } = FiIcons;

const EmailTemplates = () => {
  const { business } = useBusiness();
  const [selectedTemplate, setSelectedTemplate] = useState('initial');

  const templates = {
    initial: {
      subject: 'Quick favor? How was your experience with {{business.name}}?',
      content: `Hi {{customer.name}},

Hope you're doing well! I wanted to personally reach out and thank you for choosing {{business.name}} for your recent service.

Your trust means everything to us, and I'd love to hear about your experience. Would you mind taking just 30 seconds to share your thoughts?

{{review.link}}

Your honest feedback helps us continue to improve and also helps other customers make confident decisions when choosing a service provider.

If you had a great experience, we'd be incredibly grateful if you could share it publicly. If there's anything we could have done better, please don't hesitate to let us know directly.

Thank you again for your business and for taking the time to help us grow.

Best regards,
The {{business.name}} Team

P.S. - We read every single review and truly appreciate your time!

---
This email was sent from notifications@oholla.ai on behalf of {{business.name}}.
If you no longer wish to receive these emails, please contact us directly.`
    },
    reminder: {
      subject: 'Just following up - Your experience with {{business.name}}',
      content: `Hi {{customer.name}},

I hope this message finds you well! I wanted to follow up on my previous email about your recent experience with {{business.name}}.

I know life gets busy (trust me, I get it!), but if you have just a quick minute, we'd still love to hear your thoughts about our service.

{{review.link}}

Whether your experience was fantastic or if there's something we could have done better, your honest feedback is invaluable to us. It helps us serve you and future customers better.

No pressure at all - just hoping to learn from your experience!

Thank you for choosing {{business.name}}, and thanks in advance for your time.

Warm regards,
The {{business.name}} Team

---
This email was sent from notifications@oholla.ai on behalf of {{business.name}}.
If you no longer wish to receive these emails, please contact us directly.`
    },
    thankyou: {
      subject: 'Thank you! Your review means the world to us',
      content: `Hi {{customer.name}},

WOW! Thank you so much for taking the time to leave us such a wonderful review! 🌟

Your kind words absolutely made our day (and probably our week!). Reviews like yours remind us why we love what we do and motivate us to keep delivering exceptional service.

Your feedback not only helps us know we're on the right track, but it also helps other customers feel confident in choosing {{business.name}}. We can't thank you enough for that.

We're so grateful for customers like you, and we look forward to serving you again in the future.

If you ever need our services again or have any questions, please don't hesitate to reach out. You're always welcome here!

With heartfelt appreciation,
The {{business.name}} Team

P.S. - Your review has been shared with our entire team. Everyone is smiling! 😊

---
This email was sent from notifications@oholla.ai on behalf of {{business.name}}.`
    },
    negative_feedback: {
      subject: 'Thank you for your honest feedback - Let\'s make this right',
      content: `Hi {{customer.name}},

Thank you for taking the time to share your honest feedback about your recent experience with {{business.name}}. I genuinely appreciate your candor.

I'm truly sorry that we didn't meet your expectations. Your experience is not the standard we strive for, and I want to personally make this right.

Your feedback is incredibly valuable to us, and we take all concerns very seriously. Every piece of feedback helps us identify areas where we can improve and better serve our customers.

I would love the opportunity to discuss your experience personally and see how we can turn this around. Please feel free to reply to this email or call us directly at {{business.phone}} at your convenience.

We're committed to learning from this experience and using your feedback to improve our services for you and all our customers.

Thank you for giving us the chance to make things right. We truly value your business and hope to earn back your trust.

Sincerely,
The {{business.name}} Team

P.S. - Your feedback will be shared with our team to ensure we continue to improve our service quality.

---
This email was sent from notifications@oholla.ai on behalf of {{business.name}}.
If you have any concerns about this email, please contact us directly.`
    },
    welcome: {
      subject: 'Welcome to {{business.name}} - We\'re excited to serve you!',
      content: `Hi {{customer.name}},

Welcome to the {{business.name}} family! We're absolutely thrilled to have you as our customer.

We wanted to take a moment to personally thank you for choosing us for your needs. We don't take your trust lightly, and we're committed to providing you with exceptional service every step of the way.

Here's what you can expect from us:
• Professional, reliable service
• Clear communication throughout the process
• Attention to detail in everything we do
• A team that genuinely cares about your satisfaction

If you have any questions, concerns, or special requests, please don't hesitate to reach out. We're here to make your experience as smooth and positive as possible.

Thank you again for choosing {{business.name}}. We look forward to exceeding your expectations!

Warm regards,
The {{business.name}} Team

---
This email was sent from notifications@oholla.ai on behalf of {{business.name}}.`
    },
    follow_up: {
      subject: 'How did we do? Your experience matters to us',
      content: `Hi {{customer.name}},

I hope you're pleased with the service we recently provided! It was a pleasure working with you.

At {{business.name}}, we're always looking for ways to improve and ensure our customers have the best possible experience. Your feedback is crucial in helping us achieve this goal.

If you have a few moments, we'd love to hear about your experience:

{{review.link}}

Your honest review helps us in two important ways:
1. It lets us know what we're doing well and where we can improve
2. It helps other customers make informed decisions about our services

We truly appreciate customers like you who take the time to share their experiences. It makes a real difference to our business and our team.

Thank you again for choosing {{business.name}}. We hope to have the opportunity to serve you again soon!

Best regards,
The {{business.name}} Team

---
This email was sent from notifications@oholla.ai on behalf of {{business.name}}.
If you no longer wish to receive these emails, please contact us directly.`
    }
  };

  const templateTypes = [
    {
      key: 'initial',
      name: 'Initial Review Request',
      description: 'Sent immediately after service completion',
      icon: FiMail,
      color: 'primary'
    },
    {
      key: 'reminder',
      name: 'Follow-up Reminder',
      description: 'Sent 3-5 days after initial request if no response',
      icon: FiClock,
      color: 'accent-orange'
    },
    {
      key: 'thankyou',
      name: 'Thank You Response',
      description: 'Sent after customer submits positive review',
      icon: FiEye,
      color: 'accent-green'
    },
    {
      key: 'negative_feedback',
      name: 'Negative Feedback Response',
      description: 'Sent when customer provides critical feedback',
      icon: FiIcons.FiAlertCircle,
      color: 'accent-red'
    },
    {
      key: 'welcome',
      name: 'Welcome Email',
      description: 'Sent to new customers upon service booking',
      icon: FiIcons.FiHeart,
      color: 'accent-purple'
    },
    {
      key: 'follow_up',
      name: 'General Follow-up',
      description: 'Sent 1-2 weeks after service for ongoing relationships',
      icon: FiIcons.FiMessageCircle,
      color: 'accent-green'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-50 text-primary-600 border-primary-200',
      'accent-green': 'bg-green-50 text-accent-green border-green-200',
      'accent-orange': 'bg-orange-50 text-accent-orange border-orange-200',
      'accent-purple': 'bg-purple-50 text-accent-purple border-purple-200',
      'accent-red': 'bg-red-50 text-accent-red border-red-200'
    };
    return colors[color] || colors.primary;
  };

  const renderTemplate = (templateContent) => {
    return templateContent
      .replace(/\{\{business\.name\}\}/g, business.name || '[Business Name]')
      .replace(/\{\{customer\.name\}\}/g, 'John Smith')
      .replace(/\{\{review\.link\}\}/g, 'https://review.oholla.ai/review/abc123')
      .replace(/\{\{business\.phone\}\}/g, business.phone || '[Business Phone]');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-neutral-900">Email Templates</h1>
        <p className="text-neutral-600 mt-2">
          Professional, conversion-optimized email templates for your review automation workflow.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template List */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-soft p-6"
          >
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiLock} className="w-5 h-5 text-neutral-500 mr-2" />
              <h2 className="text-lg font-display font-semibold text-neutral-900">Templates</h2>
            </div>
            <p className="text-sm text-neutral-600 mb-6">
              These templates are professionally crafted and optimized for maximum response rates.
            </p>
            
            <div className="space-y-3">
              {templateTypes.map((template) => (
                <button
                  key={template.key}
                  onClick={() => setSelectedTemplate(template.key)}
                  className={`w-full text-left p-4 rounded-md border-2 transition-all ${
                    selectedTemplate === template.key 
                      ? getColorClasses(template.color)
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start">
                    <SafeIcon icon={template.icon} className="w-5 h-5 mt-1 mr-3 text-neutral-500" />
                    <div>
                      <h3 className="font-medium text-neutral-900 font-display">{template.name}</h3>
                      <p className="text-sm text-neutral-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Template Preview */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-soft"
          >
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-neutral-900">
                  {templateTypes.find(t => t.key === selectedTemplate)?.name} Template
                </h2>
                <div className="flex items-center text-sm text-neutral-500">
                  <SafeIcon icon={FiLock} className="w-4 h-4 mr-1" />
                  Professional Template
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Subject Line
                </label>
                <div className="bg-neutral-50 rounded-md p-3 border">
                  <code className="text-sm font-mono">
                    {renderTemplate(templates[selectedTemplate].subject)}
                  </code>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Content
                </label>
                <div className="bg-neutral-50 rounded-md p-4 border max-h-96 overflow-y-auto">
                  <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">
                    {renderTemplate(templates[selectedTemplate].content)}
                  </pre>
                </div>
              </div>

              <div className="bg-blue-50 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2 font-display">Available Variables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded font-mono">business.name</code>
                    <p className="text-blue-700 mt-1">Your business name</p>
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded font-mono">customer.name</code>
                    <p className="text-blue-700 mt-1">Customer's name</p>
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded font-mono">review.link</code>
                    <p className="text-blue-700 mt-1">Unique review link</p>
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded font-mono">business.phone</code>
                    <p className="text-blue-700 mt-1">Business phone number</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <h4 className="font-medium text-green-900 mb-2">Template Features</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Conversational, personal tone that builds trust</li>
                  <li>• Clear call-to-action with minimal friction</li>
                  <li>• Optimized for both positive and constructive feedback</li>
                  <li>• Mobile-friendly formatting</li>
                  <li>• Professional yet approachable language</li>
                  <li>• Includes proper unsubscribe and privacy information</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-md">
                <h4 className="font-medium text-amber-900 mb-2">Best Practices</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Send initial request within 24-48 hours of service completion</li>
                  <li>• Use follow-up reminders sparingly (max 1-2 times)</li>
                  <li>• Always respond promptly to negative feedback</li>
                  <li>• Personalize with customer name and service details</li>
                  <li>• Monitor response rates and adjust timing accordingly</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;