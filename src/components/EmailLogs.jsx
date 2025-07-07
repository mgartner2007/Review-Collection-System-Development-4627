import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useEmailLog } from '../context/EmailLogContext';

const { FiMail, FiCheck, FiX, FiEye, FiMousePointer, FiClock, FiAlertCircle, FiFilter } = FiIcons;

const EmailLogs = () => {
  const { emailLogs, getEmailStats, getRateLimitStatus } = useEmailLog();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const stats = getEmailStats();
  const rateLimitStatus = getRateLimitStatus();

  // Filter logs based on selected filters
  const filteredLogs = emailLogs.filter(log => {
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'sent' && log.deliveryStatus === 'Sent') ||
      (filterStatus === 'bounced' && log.bounced) ||
      (filterStatus === 'opened' && log.opened) ||
      (filterStatus === 'clicked' && log.clicked);
    
    const typeMatch = filterType === 'all' || log.emailType === filterType;
    
    return statusMatch && typeMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (log) => {
    if (log.bounced) return { icon: FiX, color: 'text-accent-red' };
    if (log.clicked) return { icon: FiMousePointer, color: 'text-accent-purple' };
    if (log.opened) return { icon: FiEye, color: 'text-accent-green' };
    if (log.deliveryStatus === 'Sent') return { icon: FiCheck, color: 'text-accent-green' };
    return { icon: FiClock, color: 'text-neutral-400' };
  };

  const getStatusText = (log) => {
    if (log.bounced) return 'Bounced';
    if (log.clicked) return 'Clicked';
    if (log.opened) return 'Opened';
    return log.deliveryStatus || 'Pending';
  };

  const getStatusBadgeColor = (log) => {
    if (log.bounced) return 'bg-red-100 text-accent-red';
    if (log.clicked) return 'bg-purple-100 text-accent-purple';
    if (log.opened) return 'bg-green-100 text-accent-green';
    if (log.deliveryStatus === 'Sent') return 'bg-blue-100 text-primary-600';
    return 'bg-neutral-100 text-neutral-600';
  };

  const emailTypes = [...new Set(emailLogs.map(log => log.emailType))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-neutral-900">Email Logs</h1>
        <p className="text-neutral-600 mt-2">
          Monitor email delivery status and engagement metrics for all outbound emails.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Emails</p>
              <p className="text-2xl font-display font-bold text-neutral-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiMail} className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Sent</p>
              <p className="text-2xl font-display font-bold text-neutral-900">{stats.sent}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiCheck} className="w-6 h-6 text-accent-green" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Open Rate</p>
              <p className="text-2xl font-display font-bold text-neutral-900">{stats.openRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiEye} className="w-6 h-6 text-accent-green" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Click Rate</p>
              <p className="text-2xl font-display font-bold text-neutral-900">{stats.clickRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiMousePointer} className="w-6 h-6 text-accent-purple" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Bounce Rate</p>
              <p className="text-2xl font-display font-bold text-neutral-900">{stats.bounceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-accent-red" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rate Limiting Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-soft p-6 mb-8"
      >
        <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
          Rate Limiting Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-neutral-900">
              {rateLimitStatus.currentCount}
            </p>
            <p className="text-sm text-neutral-600">Emails This Hour</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-neutral-900">
              {rateLimitStatus.maxCount}
            </p>
            <p className="text-sm text-neutral-600">Hourly Limit</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-neutral-900">
              {rateLimitStatus.queueSize}
            </p>
            <p className="text-sm text-neutral-600">Queued Emails</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-neutral-900">
              {rateLimitStatus.minutesUntilReset}
            </p>
            <p className="text-sm text-neutral-600">Minutes Until Reset</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Usage This Hour</span>
            <span>{rateLimitStatus.currentCount} / {rateLimitStatus.maxCount}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                rateLimitStatus.currentCount >= rateLimitStatus.maxCount * 0.9 
                  ? 'bg-accent-red' 
                  : rateLimitStatus.currentCount >= rateLimitStatus.maxCount * 0.7 
                  ? 'bg-accent-orange' 
                  : 'bg-primary-500'
              }`}
              style={{ width: `${(rateLimitStatus.currentCount / rateLimitStatus.maxCount) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Filters and Email Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-soft"
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-display font-semibold text-neutral-900">
              Email Activity Log
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiFilter} className="w-4 h-4 text-neutral-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-neutral-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-300 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="opened">Opened</option>
                  <option value="clicked">Clicked</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-neutral-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-300 focus:outline-none"
              >
                <option value="all">All Types</option>
                {emailTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">
                    No email logs found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, index) => {
                  const statusInfo = getStatusIcon(log);
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {log.recipientEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {log.emailType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {log.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <SafeIcon icon={statusInfo.icon} className={`w-4 h-4 mr-2 ${statusInfo.color}`} />
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(log)}`}>
                            {getStatusText(log)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-neutral-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                Previous
              </button>
              <span className="text-sm text-neutral-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-neutral-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmailLogs;