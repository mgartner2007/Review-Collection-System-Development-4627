import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSMTP } from '../context/SMTPContext';
import { useEmailLog } from '../context/EmailLogContext';

const { FiMail, FiSave, FiCheck, FiX, FiAlertCircle, FiEye, FiEyeOff, FiSettings, FiSend } = FiIcons;

const SMTPConfiguration = () => {
  const { config, saveConfig, testConnection, sendTestEmail, isConnected, lastTestResult } = useSMTP();
  const { getRateLimitStatus } = useEmailLog();
  
  const [formData, setFormData] = useState({
    serviceName: 'SendGrid',
    apiKey: '',
    fromEmail: 'notifications@oholla.ai',
    fromName: 'Oholla Notifications',
    domain: '',
    region: 'US'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@oholla.ai');
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState({});

  const rateLimitStatus = getRateLimitStatus();

  useEffect(() => {
    if (config) {
      setFormData({
        serviceName: config.serviceName || 'SendGrid',
        apiKey: config.apiKey || '',
        fromEmail: config.fromEmail || 'notifications@oholla.ai',
        fromName: config.fromName || 'Oholla Notifications',
        domain: config.domain || '',
        region: config.region || 'US'
      });
    }
  }, [config]);

  useEffect(() => {
    if (lastTestResult) {
      setTestEmailResult(lastTestResult);
    }
  }, [lastTestResult]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.apiKey) {
      newErrors.apiKey = 'API Key is required';
    }
    
    if (!formData.fromEmail) {
      newErrors.fromEmail = 'From Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.fromEmail)) {
      newErrors.fromEmail = 'Please enter a valid email address';
    }
    
    if (!formData.fromName) {
      newErrors.fromName = 'From Name is required';
    }
    
    if (formData.serviceName === 'Mailgun' && !formData.domain) {
      newErrors.domain = 'Domain is required for Mailgun';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTestResult(null);
    setTestEmailResult(null);

    try {
      await saveConfig(formData);
      setTestResult({ success: true, message: 'SMTP configuration saved successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: error.message || 'Failed to save configuration' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!validate()) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testConnection(formData);
      setTestResult({ success: result.success, message: result.message });
    } catch (error) {
      setTestResult({ success: false, message: error.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!isConnected) {
      setTestEmailResult({ success: false, message: 'Please save and test your configuration first' });
      return;
    }

    setIsSendingTest(true);
    setTestEmailResult(null);

    try {
      await sendTestEmail(testEmailAddress);
      setTestEmailResult({ success: true, message: `Test email sent successfully to ${testEmailAddress}` });
    } catch (error) {
      setTestEmailResult({ success: false, message: error.message || 'Failed to send test email' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getFieldsForService = () => {
    if (formData.serviceName === 'SendGrid') {
      return ['apiKey', 'fromEmail', 'fromName'];
    } else if (formData.serviceName === 'Mailgun') {
      return ['apiKey', 'domain', 'region', 'fromEmail', 'fromName'];
    }
    return [];
  };

  const renderField = (fieldName) => {
    const fieldConfig = {
      apiKey: {
        label: 'API Key',
        type: showApiKey ? 'text' : 'password',
        placeholder: 'Enter your API key',
        required: true,
        icon: FiSettings
      },
      fromEmail: {
        label: 'From Email Address',
        type: 'email',
        placeholder: 'notifications@oholla.ai',
        required: true,
        icon: FiMail,
        readonly: true
      },
      fromName: {
        label: 'From Name',
        type: 'text',
        placeholder: 'Oholla Notifications',
        required: true,
        icon: FiSettings,
        readonly: true
      },
      domain: {
        label: 'Domain Name',
        type: 'text',
        placeholder: 'mg.yourdomain.com',
        required: formData.serviceName === 'Mailgun',
        icon: FiSettings
      },
      region: {
        label: 'Region',
        type: 'select',
        options: [
          { value: 'US', label: 'United States' },
          { value: 'EU', label: 'Europe' }
        ],
        required: false,
        icon: FiSettings
      }
    };

    const field = fieldConfig[fieldName];
    if (!field) return null;

    return (
      <div key={fieldName} className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          <SafeIcon icon={field.icon} className="w-4 h-4 inline mr-2" />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
          {field.readonly && <span className="text-amber-600 text-xs ml-2">(Managed by Oholla)</span>}
        </label>
        
        {field.type === 'select' ? (
          <select
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors[fieldName] ? 'border-red-300 bg-red-50' : 'border-neutral-300'} rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none`}
          >
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              type={field.type}
              name={fieldName}
              value={formData[fieldName]}
              onChange={handleChange}
              readOnly={field.readonly}
              className={`w-full px-3 py-2 border ${errors[fieldName] ? 'border-red-300 bg-red-50' : 'border-neutral-300'} rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none ${fieldName === 'apiKey' ? 'pr-10' : ''} ${field.readonly ? 'bg-neutral-50 text-neutral-600' : ''}`}
              placeholder={field.placeholder}
            />
            {fieldName === 'apiKey' && (
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <SafeIcon
                  icon={showApiKey ? FiEyeOff : FiEye}
                  className="w-5 h-5 text-neutral-400 hover:text-neutral-600"
                />
              </button>
            )}
          </div>
        )}
        
        {errors[fieldName] && (
          <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-neutral-900">SMTP Configuration</h1>
        <p className="text-neutral-600 mt-2">
          Configure your SMTP service for sending transactional and review emails system-wide.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-neutral-900">
                Email Service Configuration
              </h2>
              {isConnected && (
                <div className="flex items-center text-accent-green">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-2" />
                  Email Service Provider <span className="text-red-500">*</span>
                </label>
                <select
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                >
                  <option value="SendGrid">SendGrid</option>
                  <option value="Mailgun">Mailgun</option>
                </select>
              </div>

              {/* Dynamic Fields Based on Service */}
              {getFieldsForService().map(fieldName => renderField(fieldName))}

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    <SafeIcon
                      icon={testResult.success ? FiCheck : FiX}
                      className={`w-5 h-5 mr-2 ${testResult.success ? 'text-accent-green' : 'text-accent-red'}`}
                    />
                    <span className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !formData.apiKey}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {isTesting ? (
                    <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <SafeIcon icon={FiSettings} className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Test Email Section */}
            {isConnected && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
                  Send Test Email
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Test Email Address
                    </label>
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                      placeholder="admin@oholla.ai"
                    />
                  </div>
                  
                  {testEmailResult && (
                    <div className={`p-4 rounded-md ${testEmailResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center">
                        <SafeIcon
                          icon={testEmailResult.success ? FiCheck : FiX}
                          className={`w-5 h-5 mr-2 ${testEmailResult.success ? 'text-accent-green' : 'text-accent-red'}`}
                        />
                        <span className={`text-sm font-medium ${testEmailResult.success ? 'text-green-800' : 'text-red-800'}`}>
                          {testEmailResult.message}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSendTestEmail}
                    disabled={isSendingTest || !testEmailAddress}
                    className="w-full px-4 py-2 bg-accent-green text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {isSendingTest ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <SafeIcon icon={FiSend} className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Information Panel */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-soft p-6"
          >
            <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
              Configuration Guide
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">SendGrid Setup</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Create API key in SendGrid dashboard</li>
                  <li>• Use "Full Access" or "Mail Send" permissions</li>
                  <li>• Verify your sending domain</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-md">
                <h4 className="font-medium text-purple-900 mb-2">Mailgun Setup</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Get API key from Mailgun control panel</li>
                  <li>• Add and verify your domain</li>
                  <li>• Choose correct region (US/EU)</li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 rounded-md">
                <h4 className="font-medium text-amber-900 mb-2">Security Notes</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• API keys are encrypted in storage</li>
                  <li>• Only admin users can access this page</li>
                  <li>• Test connection before saving</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Rate Limiting Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-soft p-6"
          >
            <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
              Rate Limiting
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Emails This Hour</span>
                <span className="text-sm font-medium text-neutral-900">
                  {rateLimitStatus.currentCount} / {rateLimitStatus.maxCount}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(rateLimitStatus.currentCount / rateLimitStatus.maxCount) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Queued Emails</span>
                <span className="text-sm font-medium text-neutral-900">
                  {rateLimitStatus.queueSize}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Reset In</span>
                <span className="text-sm font-medium text-neutral-900">
                  {rateLimitStatus.minutesUntilReset} min
                </span>
              </div>
            </div>
          </motion.div>

          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-soft p-6"
          >
            <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
              Current Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Service</span>
                <span className="text-sm font-medium text-neutral-900">
                  {config?.serviceName || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">From Email</span>
                <span className="text-sm font-medium text-neutral-900">
                  {config?.fromEmail || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Connection</span>
                <div className="flex items-center">
                  <SafeIcon
                    icon={isConnected ? FiCheck : FiAlertCircle}
                    className={`w-4 h-4 mr-1 ${isConnected ? 'text-accent-green' : 'text-accent-orange'}`}
                  />
                  <span className={`text-sm font-medium ${isConnected ? 'text-accent-green' : 'text-accent-orange'}`}>
                    {isConnected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SMTPConfiguration;