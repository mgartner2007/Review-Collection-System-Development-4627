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
      subject: 'How was your experience with {{ business.name }}?',
      content: `Hi {{ customer.name }},

I hope this email finds you well. I wanted to personally reach out to thank you for choosing {{ business.name }} for your recent project. Your trust in our services means the world to us.

We're always striving to provide the best possible experience for our customers, and your feedback is invaluable in helping us achieve that goal. Would you mind taking a moment to share your thoughts about our service?

{{ review.link }}

Your honest review helps us improve and also helps other customers make informed decisions when choosing a service provider.

If you had a great experience, we'd be grateful if you could share it publicly. If there's anything we could have done better, please don't hesitate to let us know privately.

Thank you again for your business and for taking the time to help us grow.

Best regards,
{{ business.name }} Team

---
This email was sent from notifications@oholla.ai on behalf of {{ business.name }}.`
    },
    reminder: {
      subject: 'Quick reminder: Share your experience with {{ business.name }}',
      content: `Hi {{ customer.name }},

I hope you're doing well! I wanted to follow up on my previous email about your recent experience with {{ business.name }}.

We understand how busy life can get, but if you have just a minute, we'd still love to hear your feedback about our service. Your input is incredibly valuable to us and helps us continue to improve.

{{ review.link }}

Whether your experience was fantastic or if there's something we could have done better, we genuinely want to hear from you. Your honest feedback helps us serve you and other customers better.

Thank you so much for your time and for choosing {{ business.name }}.

Best regards,
{{ business.name }} Team

---
This email was sent from notifications@oholla.ai on behalf of {{ business.name }}.`
    },
    thankyou: {
      subject: 'Thank you for your review!',
      content: `Hi {{ customer.name }},

Thank you so much for taking the time to leave us a review! Your feedback means everything to us.

We're thrilled to hear about your positive experience with {{ business.name }}. Reviews like yours help us know we're on the right track and encourage us to keep delivering excellent service.

Your review also helps other customers feel confident in choosing our services, and we can't thank you enough for that.

We truly appreciate your business and look forward to serving you again in the future. If you ever need our services again or have any questions, please don't hesitate to reach out.

Best regards,
{{ business.name }} Team

---
This email was sent from notifications@oholla.ai on behalf of {{ business.name }}.`
    },
    negative_feedback: {
      subject: 'Thank you for your feedback - We want to make this right',
      content: `Hi {{ customer.name }},

Thank you for taking the time to share your feedback about your recent experience with {{ business.name }}. We sincerely appreciate your honesty.

I'm sorry to hear that we didn't meet your expectations. Your feedback is incredibly valuable to us, and we take all concerns seriously. We want to make this right and ensure you have a positive experience with us.

I would love the opportunity to discuss your concerns personally and see how we can improve. Please feel free to reply to this email or call us directly at {{ business.phone }} at your convenience.

We're committed to learning from this experience and using your feedback to improve our services for you and all our customers.

Thank you again for giving us the chance to make things right.

Best regards,
{{ business.name }} Team

---
This email was sent from notifications@oholla.ai on behalf of {{ business.name }}.`
    }
  };

  const templateTypes = [
    {
      key: 'initial',
      name: 'Initial Request',
      description: 'Sent immediately after job completion',
      icon: FiMail,
      color: 'primary'
    },
    {
      key: 'reminder',
      name: 'Follow-up Reminder',
      description: 'Sent 48 hours after initial request if no response',
      icon: FiClock,
      color: 'accent-orange'
    },
    {
      key: 'thankyou',
      name: 'Thank You',
      description: 'Sent after customer submits positive review',
      icon: FiEye,
      color: 'accent-green'
    },
    {
      key: 'negative_feedback',
      name: 'Negative Feedback Response',
      description: 'Sent when customer provides negative feedback',
      icon: FiIcons.FiAlertCircle,
      color: 'accent-red'
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
      .replace(/\{\{ business\.name \}\}/g, business.name || '[Business Name]')
      .replace(/\{\{ customer\.name \}\}/g, 'John Doe')
      .replace(/\{\{ review\.link \}\}/g, 'https://review.oholla.ai/review/abc123')
      .replace(/\{\{ business\.phone \}\}/g, business.phone || '[Business Phone]');
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
          Professional email templates for your review automation workflow.
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
              These templates are managed by Oholla and optimized for maximum response rates.
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
                  Managed Template
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
                  <li>• Personalized and professional tone</li>
                  <li>• Optimized for higher response rates</li>
                  <li>• Handles both positive and negative feedback</li>
                  <li>• Automated follow-up sequences</li>
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