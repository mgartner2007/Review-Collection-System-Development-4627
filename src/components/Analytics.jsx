import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { format, subDays, startOfDay } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useReview } from '../context/ReviewContext';

const { FiTrendingUp, FiStar, FiMail, FiEye, FiMousePointer } = FiIcons;

const Analytics = () => {
  const { reviews, getAnalytics } = useReview();
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    setAnalytics(getAnalytics());
  }, [reviews, getAnalytics]);

  const getTimeRangeData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const dates = [];
    const requestsData = [];
    const reviewsData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      dates.push(format(date, 'MMM d'));
      
      const dayRequests = reviews.filter(r => 
        startOfDay(new Date(r.createdAt)).getTime() === date.getTime()
      ).length;
      
      const dayReviews = reviews.filter(r => 
        r.submittedAt && startOfDay(new Date(r.submittedAt)).getTime() === date.getTime()
      ).length;
      
      requestsData.push(dayRequests);
      reviewsData.push(dayReviews);
    }

    return { dates, requestsData, reviewsData };
  };

  const { dates, requestsData, reviewsData } = getTimeRangeData();

  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['Requests Sent', 'Reviews Received']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Requests Sent',
        type: 'line',
        data: requestsData,
        smooth: true,
        lineStyle: {
          color: '#3D82FF'
        },
        itemStyle: {
          color: '#3D82FF'
        }
      },
      {
        name: 'Reviews Received',
        type: 'line',
        data: reviewsData,
        smooth: true,
        lineStyle: {
          color: '#30A46C'
        },
        itemStyle: {
          color: '#30A46C'
        }
      }
    ]
  };

  const ratingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const ratings = ratingDistribution();

  const ratingChartOptions = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Rating Distribution',
        type: 'pie',
        radius: '50%',
        data: [
          { value: ratings[5], name: '5 Stars', itemStyle: { color: '#30A46C' } },
          { value: ratings[4], name: '4 Stars', itemStyle: { color: '#6E56CF' } },
          { value: ratings[3], name: '3 Stars', itemStyle: { color: '#F76808' } },
          { value: ratings[2], name: '2 Stars', itemStyle: { color: '#F59E0B' } },
          { value: ratings[1], name: '1 Star', itemStyle: { color: '#E5484D' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const statCards = [
    {
      title: 'Total Requests',
      value: analytics.totalRequests || 0,
      icon: FiMail,
      color: 'primary',
      change: '+12%'
    },
    {
      title: 'Public Reviews',
      value: analytics.publicReviews || 0,
      icon: FiStar,
      color: 'accent-green',
      change: '+8%'
    },
    {
      title: 'Click-Through Rate',
      value: `${analytics.clickThroughRate || 0}%`,
      icon: FiMousePointer,
      color: 'accent-purple',
      change: '+5%'
    },
    {
      title: 'Completion Rate',
      value: `${analytics.completionRate || 0}%`,
      icon: FiTrendingUp,
      color: 'accent-orange',
      change: '+3%'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">Analytics</h1>
            <p className="text-neutral-600 mt-2">
              Track your review collection performance and customer engagement.
            </p>
          </div>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.title}</p>
                <p className="text-2xl font-display font-bold text-neutral-900 mt-1">{stat.value}</p>
                <p className="text-sm text-accent-green mt-1">{stat.change} from last period</p>
              </div>
              <div className={`w-12 h-12 rounded-md flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <h2 className="text-lg font-display font-semibold text-neutral-900 mb-4">
            Requests & Reviews Over Time
          </h2>
          <ReactECharts option={chartOptions} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-soft p-6"
        >
          <h2 className="text-lg font-display font-semibold text-neutral-900 mb-4">
            Rating Distribution
          </h2>
          <ReactECharts option={ratingChartOptions} style={{ height: '300px' }} />
        </motion.div>
      </div>

      {/* Email Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-soft p-6 mt-8"
      >
        <h2 className="text-lg font-display font-semibold text-neutral-900 mb-6">Email Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiMail} className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-2xl font-display font-bold text-neutral-900">{analytics.totalRequests || 0}</p>
            <p className="text-sm text-neutral-600">Emails Sent</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiEye} className="w-8 h-8 text-accent-green" />
            </div>
            <p className="text-2xl font-display font-bold text-neutral-900">{analytics.totalOpens || 0}</p>
            <p className="text-sm text-neutral-600">Opens</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiMousePointer} className="w-8 h-8 text-accent-purple" />
            </div>
            <p className="text-2xl font-display font-bold text-neutral-900">{analytics.totalClicks || 0}</p>
            <p className="text-sm text-neutral-600">Clicks</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiStar} className="w-8 h-8 text-accent-orange" />
            </div>
            <p className="text-2xl font-display font-bold text-neutral-900">{analytics.completedReviews || 0}</p>
            <p className="text-sm text-neutral-600">Reviews</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;