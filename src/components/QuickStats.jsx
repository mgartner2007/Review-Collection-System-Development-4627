import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSend, FiStar, FiEye, FiMessageCircle } = FiIcons;

const QuickStats = ({ analytics }) => {
  const stats = [
    {
      label: 'Requests Sent',
      value: analytics.totalRequests || 0,
      icon: FiSend,
      color: 'primary'
    },
    {
      label: 'Public Reviews',
      value: analytics.publicReviews || 0,
      icon: FiStar,
      color: 'accent-green'
    },
    {
      label: 'Click Rate',
      value: `${analytics.clickThroughRate || 0}%`,
      icon: FiEye,
      color: 'accent-purple'
    },
    {
      label: 'Private Feedback',
      value: analytics.privateReviews || 0,
      icon: FiMessageCircle,
      color: 'accent-orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-50 text-primary-600',
      'accent-green': 'bg-green-50 text-accent-green',
      'accent-purple': 'bg-purple-50 text-accent-purple',
      'accent-orange': 'bg-orange-50 text-accent-orange',
      'accent-red': 'bg-red-50 text-accent-red'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-neutral-900 mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-md flex items-center justify-center ${getColorClasses(stat.color)}`}>
              <SafeIcon icon={stat.icon} className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;