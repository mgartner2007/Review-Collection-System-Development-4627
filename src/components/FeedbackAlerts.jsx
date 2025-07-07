import React from 'react';
import { motion } from 'framer-motion';
import FeedbackAlert from './FeedbackAlert';
import { useReview } from '../context/ReviewContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheckCircle } = FiIcons;

const FeedbackAlerts = () => {
  const { pendingFeedbacks, resolveFeedback } = useReview();
  
  if (!pendingFeedbacks || pendingFeedbacks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 rounded-lg border border-green-200 p-5 flex items-center"
      >
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
          <SafeIcon icon={FiCheckCircle} className="w-6 h-6 text-accent-green" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold text-neutral-900">
            All caught up!
          </h3>
          <p className="text-sm text-neutral-600">
            No pending feedback responses needed at this time.
          </p>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-display font-semibold text-neutral-900 mb-2">
        Feedback Requiring Attention ({pendingFeedbacks.length})
      </h3>
      
      {pendingFeedbacks.map((feedback, index) => (
        <motion.div
          key={feedback.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <FeedbackAlert 
            feedback={feedback} 
            onResolve={resolveFeedback} 
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeedbackAlerts;