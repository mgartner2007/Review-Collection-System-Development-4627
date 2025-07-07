import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiStar, FiMessageCircle, FiClock, FiCheckCircle } = FiIcons;

const RecentReviews = ({ reviews }) => {
  const getStatusIcon = (status, isPublic) => {
    if (status === 'completed') {
      return isPublic ? FiStar : FiMessageCircle;
    }
    return FiClock;
  };

  const getStatusColor = (status, isPublic) => {
    if (status === 'completed') {
      return isPublic ? 'text-accent-green' : 'text-accent-orange';
    }
    return 'text-neutral-400';
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <SafeIcon
        key={i}
        icon={FiStar}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-lg shadow-soft"
    >
      <div className="p-6 border-b border-neutral-200">
        <h3 className="text-lg font-display font-semibold text-neutral-900">Recent Reviews</h3>
      </div>
      
      <div className="divide-y divide-neutral-200">
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <SafeIcon icon={FiMessageCircle} className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-500">No reviews yet. Create your first review request!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <SafeIcon
                      icon={getStatusIcon(review.status, review.isPublic)}
                      className={`w-5 h-5 ${getStatusColor(review.status, review.isPublic)}`}
                    />
                    <h4 className="font-medium text-neutral-900">{review.customerName}</h4>
                    <span className="text-sm text-neutral-500">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  {review.rating && (
                    <div className="flex items-center mt-2">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-neutral-600">
                        {review.rating}/5 stars
                      </span>
                    </div>
                  )}
                  
                  {review.comment && (
                    <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                      "{review.comment}"
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-3 text-sm text-neutral-500">
                    <span>Clicks: {review.clicks}</span>
                    {review.opened && (
                      <span className="flex items-center">
                        <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mr-1 text-accent-green" />
                        Opened
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    review.status === 'completed'
                      ? review.isPublic
                        ? 'bg-green-100 text-accent-green'
                        : 'bg-orange-100 text-accent-orange'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {review.status === 'completed'
                      ? review.isPublic
                        ? 'Public Review'
                        : 'Private Feedback'
                      : 'Pending'
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RecentReviews;