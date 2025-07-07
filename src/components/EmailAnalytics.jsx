import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { format, subDays, startOfDay } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useEmailLog } from '../context/EmailLogContext';

const { 
  FiMail, FiTrendingUp, FiClock, FiSmartphone, FiMonitor, FiTablet,
  FiMapPin, FiMousePointer, FiEye, FiAlertCircle, FiActivity
} = FiIcons;

const EmailAnalytics = () => {
  const { getAdvancedEmailAnalytics, emailLogs } = useEmailLog();
  const [timeRange, setTimeRange] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('openRate');

  useEffect(() => {
    setAnalytics(getAdvancedEmailAnalytics(timeRange));
  }, [timeRange, emailLogs, getAdvancedEmailAnalytics]);

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const prepareTimeSeriesData = () => {
    const dates = [];
    const openRates = [];
    const clickRates = [];
    const bounceRates = [];
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dates.push(format(subDays(new Date(), i), 'MMM d'));
      
      const dayData = analytics.dailyData[date];
      if (dayData) {
        const openRate = dayData.sent > 0 ? ((dayData.opened / dayData.sent) * 100) : 0;
        const clickRate = dayData.sent > 0 ? ((dayData.clicked / dayData.sent) * 100) : 0;
        const bounceRate = dayData.sent > 0 ? ((dayData.bounced / dayData.sent) * 100) : 0;
        
        openRates.push(openRate.toFixed(1));
        clickRates.push(clickRate.toFixed(1));
        bounceRates.push(bounceRate.toFixed(1));
      } else {
        openRates.push(0);
        clickRates.push(0);
        bounceRates.push(0);
      }
    }
    
    return { dates, openRates, clickRates, bounceRates };
  };

  const prepareHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourlyOpenRates = hours.map(hour => {
      const data = analytics.hourlyData[hour];
      return data && data.sent > 0 ? ((data.opened / data.sent) * 100).toFixed(1) : 0;
    });
    
    return {
      hours: hours.map(h => `${h}:00`),
      openRates: hourlyOpenRates
    };
  };

  const timeSeriesData = prepareTimeSeriesData();
  const hourlyData = prepareHourlyData();

  // Chart configurations
  const performanceChartOptions = {
    title: {
      text: 'Email Performance Trends',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['Open Rate (%)', 'Click Rate (%)', 'Bounce Rate (%)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeSeriesData.dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'Open Rate (%)',
        type: 'line',
        data: timeSeriesData.openRates,
        smooth: true,
        lineStyle: { color: '#30A46C' },
        itemStyle: { color: '#30A46C' }
      },
      {
        name: 'Click Rate (%)',
        type: 'line',
        data: timeSeriesData.clickRates,
        smooth: true,
        lineStyle: { color: '#3D82FF' },
        itemStyle: { color: '#3D82FF' }
      },
      {
        name: 'Bounce Rate (%)',
        type: 'line',
        data: timeSeriesData.bounceRates,
        smooth: true,
        lineStyle: { color: '#E5484D' },
        itemStyle: { color: '#E5484D' }
      }
    ]
  };

  const hourlyChartOptions = {
    title: {
      text: 'Best Times to Send (Open Rate by Hour)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}% open rate'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hourlyData.hours
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      type: 'bar',
      data: hourlyData.openRates,
      itemStyle: {
        color: function(params) {
          // Highlight best performing hours
          const value = parseFloat(params.value);
          const avgOpenRate = parseFloat(analytics.totalMetrics.openRate);
          return value >= avgOpenRate ? '#30A46C' : '#94A3B8';
        }
      }
    }]
  };

  const templatePerformanceChartOptions = {
    title: {
      text: 'Template Performance Comparison',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Open Rate (%)', 'Click Rate (%)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Object.keys(analytics.templatePerformance)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'Open Rate (%)',
        type: 'bar',
        data: Object.values(analytics.templatePerformance).map(t => t.openRate),
        itemStyle: { color: '#30A46C' }
      },
      {
        name: 'Click Rate (%)',
        type: 'bar',
        data: Object.values(analytics.templatePerformance).map(t => t.clickRate),
        itemStyle: { color: '#3D82FF' }
      }
    ]
  };

  const deviceChartOptions = {
    title: {
      text: 'Device Usage Distribution',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: Object.entries(analytics.deviceStats).map(([device, stats]) => ({
        value: stats.opens,
        name: device,
        itemStyle: {
          color: device === 'mobile' ? '#F59E0B' : 
                device === 'desktop' ? '#3D82FF' : 
                device === 'tablet' ? '#6E56CF' : '#94A3B8'
        }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return FiSmartphone;
      case 'tablet': return FiTablet;
      case 'desktop': return FiMonitor;
      default: return FiMonitor;
    }
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
            <h1 className="text-3xl font-display font-bold text-neutral-900">Email Analytics</h1>
            <p className="text-neutral-600 mt-2">
              Advanced insights into email performance and engagement
            </p>
          </div>
          <div className="flex space-x-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === days
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Engagement Score</p>
              <p className="text-2xl font-display font-bold text-neutral-900">
                {analytics.engagementScore}%
              </p>
              <p className="text-sm text-accent-green mt-1">
                Overall engagement quality
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiActivity} className="w-6 h-6 text-accent-purple" />
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
              <p className="text-sm font-medium text-neutral-600">Open Rate</p>
              <p className="text-2xl font-display font-bold text-neutral-900">
                {analytics.totalMetrics.openRate}%
              </p>
              <p className="text-sm text-accent-green mt-1">
                {analytics.totalMetrics.opened} opens
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiEye} className="w-6 h-6 text-accent-green" />
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
              <p className="text-sm font-medium text-neutral-600">Click Rate</p>
              <p className="text-2xl font-display font-bold text-neutral-900">
                {analytics.totalMetrics.clickRate}%
              </p>
              <p className="text-sm text-primary-600 mt-1">
                {analytics.totalMetrics.clicked} clicks
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiMousePointer} className="w-6 h-6 text-primary-600" />
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
              <p className="text-sm font-medium text-neutral-600">Bounce Rate</p>
              <p className="text-2xl font-display font-bold text-neutral-900">
                {analytics.totalMetrics.bounceRate}%
              </p>
              <p className="text-sm text-accent-red mt-1">
                {analytics.totalMetrics.bounced} bounces
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-md flex items-center justify-center">
              <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-accent-red" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <ReactECharts option={performanceChartOptions} style={{ height: '400px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <ReactECharts option={hourlyChartOptions} style={{ height: '400px' }} />
        </motion.div>
      </div>

      {/* Template Performance and Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-soft p-6"
        >
          <ReactECharts option={templatePerformanceChartOptions} style={{ height: '400px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <ReactECharts option={deviceChartOptions} style={{ height: '400px' }} />
        </motion.div>
      </div>

      {/* Device Breakdown and Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
            Device Engagement Details
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.deviceStats).map(([device, stats]) => (
              <div key={device} className="flex items-center justify-between p-4 bg-neutral-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-3">
                    <SafeIcon icon={getDeviceIcon(device)} className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 capitalize">{device}</p>
                    <p className="text-sm text-neutral-600">{stats.opens} opens, {stats.clicks} clicks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-neutral-900">
                    {stats.opens > 0 ? ((stats.clicks / stats.opens) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-sm text-neutral-600">CTR</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
            Top Performing Locations
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.locationStats)
              .sort(([,a], [,b]) => (b.opens + b.clicks) - (a.opens + a.clicks))
              .slice(0, 5)
              .map(([location, stats]) => (
                <div key={location} className="flex items-center justify-between p-4 bg-neutral-50 rounded-md">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-3">
                      <SafeIcon icon={FiMapPin} className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{location}</p>
                      <p className="text-sm text-neutral-600">{stats.opens} opens, {stats.clicks} clicks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-neutral-900">
                      {stats.opens + stats.clicks}
                    </p>
                    <p className="text-sm text-neutral-600">Total</p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">
          📊 Analytics Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-md p-4">
            <h4 className="font-medium text-neutral-900 mb-2">Best Send Time</h4>
            <p className="text-sm text-neutral-600">
              {(() => {
                const bestHour = Object.entries(analytics.hourlyData)
                  .sort(([,a], [,b]) => {
                    const aRate = a.sent > 0 ? (a.opened / a.sent) : 0;
                    const bRate = b.sent > 0 ? (b.opened / b.sent) : 0;
                    return bRate - aRate;
                  })[0];
                return bestHour ? `${bestHour[0]}:00 shows highest engagement` : 'Insufficient data';
              })()}
            </p>
          </div>
          
          <div className="bg-white rounded-md p-4">
            <h4 className="font-medium text-neutral-900 mb-2">Top Template</h4>
            <p className="text-sm text-neutral-600">
              {(() => {
                const bestTemplate = Object.entries(analytics.templatePerformance)
                  .sort(([,a], [,b]) => parseFloat(b.openRate) - parseFloat(a.openRate))[0];
                return bestTemplate ? `${bestTemplate[0]} (${bestTemplate[1].openRate}% open rate)` : 'No data available';
              })()}
            </p>
          </div>
          
          <div className="bg-white rounded-md p-4">
            <h4 className="font-medium text-neutral-900 mb-2">Mobile Optimization</h4>
            <p className="text-sm text-neutral-600">
              {(() => {
                const mobileStats = analytics.deviceStats.mobile;
                const totalOpens = Object.values(analytics.deviceStats).reduce((sum, stats) => sum + stats.opens, 0);
                const mobilePercent = mobileStats && totalOpens > 0 ? ((mobileStats.opens / totalOpens) * 100).toFixed(0) : 0;
                return `${mobilePercent}% of opens are on mobile devices`;
              })()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailAnalytics;