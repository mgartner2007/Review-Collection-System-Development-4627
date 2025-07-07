import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSend, FiAlertCircle } = FiIcons;

const DetailedFeedbackForm = ({ onSubmit, onCancel, customerEmail = '' }) => {
  const [formData, setFormData] = useState({
    issueType: '',
    otherIssue: '',
    details: '',
    email: customerEmail || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const issueTypes = [
    "Service wasn't up to expectations",
    "Wait time was too long",
    "Pricing felt too high",
    "Communication was poor",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.issueType) {
      newErrors.issueType = 'Please select what went wrong';
    }
    
    if (!formData.details || formData.details.trim().length < 5) {
      newErrors.details = 'Please provide more details about your experience';
    }
    
    if (formData.issueType === 'Other' && !formData.otherIssue) {
      newErrors.otherIssue = 'Please specify the issue';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const finalData = {
        ...formData,
        issueDetails: formData.issueType === 'Other' ? formData.otherIssue : formData.issueType,
        submittedAt: new Date().toISOString()
      };
      
      await onSubmit(finalData);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-medium p-6"
    >
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
          <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-accent-orange" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-neutral-900">
            Help us improve
          </h2>
          <p className="text-neutral-600 mt-1">
            Your honest feedback helps us get better
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            What went wrong?*
          </label>
          <select
            name="issueType"
            value={formData.issueType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.issueType ? 'border-red-300 bg-red-50' : 'border-neutral-300'} rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none`}
          >
            <option value="">Select an issue</option>
            {issueTypes.map(issue => (
              <option key={issue} value={issue}>{issue}</option>
            ))}
          </select>
          {errors.issueType && (
            <p className="mt-1 text-sm text-red-600">{errors.issueType}</p>
          )}
        </div>

        {formData.issueType === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Please specify*
            </label>
            <input
              type="text"
              name="otherIssue"
              value={formData.otherIssue}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.otherIssue ? 'border-red-300 bg-red-50' : 'border-neutral-300'} rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none`}
              placeholder="Tell us what went wrong"
            />
            {errors.otherIssue && (
              <p className="mt-1 text-sm text-red-600">{errors.otherIssue}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tell us more (we want to make this right)*
          </label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border ${errors.details ? 'border-red-300 bg-red-50' : 'border-neutral-300'} rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none`}
            placeholder="Please share more details about your experience so we can address your concerns"
          />
          {errors.details && (
            <p className="mt-1 text-sm text-red-600">{errors.details}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email (so we can follow up)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-300'} rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
          >
            Back
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
                <SafeIcon icon={FiSend} className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DetailedFeedbackForm;