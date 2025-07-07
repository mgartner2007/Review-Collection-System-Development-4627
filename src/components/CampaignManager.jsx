import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useEmailLog } from '../context/EmailLogContext';

const { FiPlus, FiEdit, FiTrash2, FiPlay, FiPause, FiEye, FiCalendar } = FiIcons;

const CampaignManager = () => {
  const { emailCampaigns, createEmailCampaign, getCampaignAnalytics } = useEmailLog();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: 'review_request',
    targetAudience: 'all',
    scheduledTime: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEmailCampaign({
        ...formData,
        createdBy: 'admin'
      });
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        templateId: 'review_request',
        targetAudience: 'all',
        scheduledTime: ''
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: FiEdit,
      scheduled: FiCalendar,
      sending: FiPlay,
      completed: FiEye,
      paused: FiPause
    };
    return icons[status] || FiEdit;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">Campaign Manager</h1>
            <p className="text-neutral-600 mt-2">
              Create and manage email campaigns with advanced tracking
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
            New Campaign
          </button>
        </div>
      </motion.div>

      {/* Campaign List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-soft"
      >
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-display font-semibold text-neutral-900">
            Email Campaigns ({emailCampaigns.length})
          </h2>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {emailCampaigns.length === 0 ? (
            <div className="p-8 text-center">
              <SafeIcon icon={FiCalendar} className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500">No campaigns yet. Create your first campaign!</p>
            </div>
          ) : (
            emailCampaigns.map((campaign, index) => {
              const analytics = getCampaignAnalytics(campaign.id);
              const StatusIcon = getStatusIcon(campaign.status);
              
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                          campaign.status === 'completed' ? 'bg-green-100' : 
                          campaign.status === 'sending' ? 'bg-yellow-100' : 
                          campaign.status === 'scheduled' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <SafeIcon 
                            icon={StatusIcon} 
                            className={`w-5 h-5 ${
                              campaign.status === 'completed' ? 'text-green-600' : 
                              campaign.status === 'sending' ? 'text-yellow-600' : 
                              campaign.status === 'scheduled' ? 'text-blue-600' : 'text-gray-600'
                            }`} 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900">{campaign.name}</h3>
                          <p className="text-sm text-neutral-600">{campaign.description}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">Created</p>
                          <p className="text-sm font-medium text-neutral-900">
                            {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">Template</p>
                          <p className="text-sm font-medium text-neutral-900">{campaign.templateId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">Target</p>
                          <p className="text-sm font-medium text-neutral-900">{campaign.targetAudience}</p>
                        </div>
                      </div>

                      {analytics && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-neutral-50 rounded-md">
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Sent</p>
                            <p className="text-lg font-semibold text-neutral-900">{analytics.emailsSent}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Delivered</p>
                            <p className="text-lg font-semibold text-neutral-900">{analytics.delivered}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Opened</p>
                            <p className="text-lg font-semibold text-accent-green">{analytics.opened}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Clicked</p>
                            <p className="text-lg font-semibold text-primary-600">{analytics.clicked}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">Open Rate</p>
                            <p className="text-lg font-semibold text-neutral-900">{analytics.openRate}%</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      >
                        <SafeIcon icon={FiEye} className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors">
                        <SafeIcon icon={FiEdit} className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-medium max-w-md w-full"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-200">
              <h2 className="text-xl font-display font-semibold text-neutral-900">Create New Campaign</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <SafeIcon icon={FiIcons.FiX} className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="Enter campaign name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="Describe the campaign purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Template
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                >
                  <option value="review_request">Review Request</option>
                  <option value="review_reminder">Review Reminder</option>
                  <option value="thank_you">Thank You</option>
                  <option value="negative_feedback">Negative Feedback Response</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                >
                  <option value="all">All Customers</option>
                  <option value="new">New Customers</option>
                  <option value="returning">Returning Customers</option>
                  <option value="high_value">High Value Customers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Scheduled Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;