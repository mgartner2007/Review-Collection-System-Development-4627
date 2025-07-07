import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useBusiness } from '../context/BusinessContext';
import { useReview } from '../context/ReviewContext';
import ReviewRequestForm from './ReviewRequestForm';
import QuickStats from './QuickStats';
import RecentReviews from './RecentReviews';

const { FiPlus, FiSettings, FiAlertCircle } = FiIcons;

const Dashboard = () => {
  const { business } = useBusiness();
  const { reviews, getAnalytics } = useReview();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    setAnalytics(getAnalytics());
  }, [reviews, getAnalytics]);

  if (!business.isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4"
        >
          <div className="bg-white rounded-lg shadow-medium p-8 text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-warning-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Setup Required</h2>
            <p className="text-neutral-600 mb-6">
              Please complete your business setup to start collecting reviews.
            </p>
            <Link
              to="/setup"
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
            >
              <SafeIcon icon={FiSettings} className="w-5 h-5 mr-2" />
              Complete Setup
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600 mt-1">Welcome back, {business.name}</p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
            New Review Request
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <QuickStats analytics={analytics} />
          <RecentReviews reviews={reviews.slice(0, 10)} />
        </div>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-soft p-6"
          >
            <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowRequestForm(true)}
                className="w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5 inline mr-2" />
                Create Review Request
              </button>
              <Link
                to="/analytics"
                className="block w-full text-left px-4 py-3 bg-neutral-50 text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <SafeIcon icon={FiIcons.FiBarChart3} className="w-5 h-5 inline mr-2" />
                View Analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {showRequestForm && (
        <ReviewRequestForm onClose={() => setShowRequestForm(false)} />
      )}
    </div>
  );
};

export default Dashboard;