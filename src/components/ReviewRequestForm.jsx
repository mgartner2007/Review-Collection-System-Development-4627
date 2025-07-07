import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useReview } from '../context/ReviewContext';
import { useBusiness } from '../context/BusinessContext';
import QRCodeGenerator from './QRCodeGenerator';

const { FiX, FiSend, FiUser, FiMail, FiPhone, FiFileText, FiCheck } = FiIcons;

const ReviewRequestForm = ({ onClose }) => {
  const { createReviewRequest } = useReview();
  const { business } = useBusiness();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reviewRequest = createReviewRequest(formData);
      setCreatedRequest(reviewRequest);
      
      // Simulate email sending
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating review request:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (createdRequest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-medium max-w-md w-full"
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCheck} className="w-8 h-8 text-accent-green" />
            </div>
            <h3 className="text-lg font-display font-semibold text-neutral-900 mb-2">Review Request Created!</h3>
            <p className="text-neutral-600 mb-6">
              A review request has been sent to {createdRequest.customerName}.
            </p>
            
            <div className="bg-neutral-50 rounded-md p-4 mb-6">
              <p className="text-sm text-neutral-600 mb-2">Review Link:</p>
              <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                {createdRequest.reviewUrl}
              </p>
            </div>

            <QRCodeGenerator url={createdRequest.reviewUrl} />
            
            <button
              onClick={onClose}
              className="w-full mt-6 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-medium max-w-md w-full"
      >
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h2 className="text-xl font-display font-semibold text-neutral-900">New Review Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-2" />
              Customer Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <SafeIcon icon={FiPhone} className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <SafeIcon icon={FiFileText} className="w-4 h-4 inline mr-2" />
              Job Description
            </label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              placeholder="Brief description of the job/service"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancel
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
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReviewRequestForm;