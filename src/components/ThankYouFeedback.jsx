import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheckCircle } = FiIcons;

const ThankYouFeedback = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-medium p-8 text-center"
    >
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <SafeIcon icon={FiCheckCircle} className="w-8 h-8 text-primary-600" />
      </div>
      
      <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4">
        We really appreciate your honest feedback
      </h2>
      
      <p className="text-neutral-600 mb-6">
        Someone from our team will review this and follow up if needed.
        Your input helps us improve our service for everyone.
      </p>
      
      <button
        onClick={onClose}
        className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
      >
        Close
      </button>
    </motion.div>
  );
};

export default ThankYouFeedback;