// Email metrics calculation utilities
export class EmailMetrics {
  // Calculate engagement score (weighted metric)
  static calculateEngagementScore(opens, clicks, totalSent) {
    if (totalSent === 0) return 0;
    
    // Weight opens as 1 point, clicks as 2 points
    const engagementPoints = (opens * 1) + (clicks * 2);
    const maxPossiblePoints = totalSent * 2;
    
    return ((engagementPoints / maxPossiblePoints) * 100).toFixed(1);
  }

  // Calculate deliverability score
  static calculateDeliverabilityScore(sent, bounced, spamComplaints = 0) {
    if (sent === 0) return 100;
    
    const deliveredRate = ((sent - bounced) / sent) * 100;
    const spamRate = (spamComplaints / sent) * 100;
    
    // Penalize spam complaints more heavily
    const deliverabilityScore = deliveredRate - (spamRate * 2);
    
    return Math.max(0, deliverabilityScore).toFixed(1);
  }

  // Calculate list health score
  static calculateListHealthScore(totalContacts, activeContacts, bounceRate, unsubscribeRate) {
    const activeRate = (activeContacts / totalContacts) * 100;
    const healthPenalty = (bounceRate * 0.5) + (unsubscribeRate * 1.5);
    
    const healthScore = activeRate - healthPenalty;
    
    return Math.max(0, Math.min(100, healthScore)).toFixed(1);
  }

  // Analyze send time performance
  static analyzeSendTimePerformance(emailLogs) {
    const hourlyPerformance = {};
    const dailyPerformance = {};
    
    emailLogs.forEach(log => {
      const sendTime = new Date(log.timestamp);
      const hour = sendTime.getHours();
      const day = sendTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Initialize if not exists
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { sent: 0, opened: 0, clicked: 0 };
      }
      if (!dailyPerformance[day]) {
        dailyPerformance[day] = { sent: 0, opened: 0, clicked: 0 };
      }
      
      // Count metrics
      hourlyPerformance[hour].sent++;
      dailyPerformance[day].sent++;
      
      if (log.opened) {
        hourlyPerformance[hour].opened++;
        dailyPerformance[day].opened++;
      }
      
      if (log.clicked) {
        hourlyPerformance[hour].clicked++;
        dailyPerformance[day].clicked++;
      }
    });
    
    // Calculate rates
    Object.keys(hourlyPerformance).forEach(hour => {
      const data = hourlyPerformance[hour];
      data.openRate = data.sent > 0 ? ((data.opened / data.sent) * 100).toFixed(1) : 0;
      data.clickRate = data.sent > 0 ? ((data.clicked / data.sent) * 100).toFixed(1) : 0;
    });
    
    Object.keys(dailyPerformance).forEach(day => {
      const data = dailyPerformance[day];
      data.openRate = data.sent > 0 ? ((data.opened / data.sent) * 100).toFixed(1) : 0;
      data.clickRate = data.sent > 0 ? ((data.clicked / data.sent) * 100).toFixed(1) : 0;
    });
    
    return { hourlyPerformance, dailyPerformance };
  }

  // Calculate cohort analysis
  static calculateCohortAnalysis(emailLogs, cohortType = 'weekly') {
    const cohorts = {};
    
    emailLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      let cohortKey;
      
      if (cohortType === 'weekly') {
        const weekStart = new Date(logDate);
        weekStart.setDate(logDate.getDate() - logDate.getDay());
        cohortKey = weekStart.toISOString().split('T')[0];
      } else if (cohortType === 'monthly') {
        cohortKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        cohortKey = logDate.toISOString().split('T')[0];
      }
      
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = {
          sent: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          uniqueRecipients: new Set()
        };
      }
      
      cohorts[cohortKey].sent++;
      cohorts[cohortKey].uniqueRecipients.add(log.recipientEmail);
      
      if (log.opened) cohorts[cohortKey].opened++;
      if (log.clicked) cohorts[cohortKey].clicked++;
      if (log.bounced) cohorts[cohortKey].bounced++;
    });
    
    // Convert sets to counts and calculate rates
    Object.keys(cohorts).forEach(cohortKey => {
      const cohort = cohorts[cohortKey];
      cohort.uniqueRecipients = cohort.uniqueRecipients.size;
      cohort.openRate = cohort.sent > 0 ? ((cohort.opened / cohort.sent) * 100).toFixed(1) : 0;
      cohort.clickRate = cohort.sent > 0 ? ((cohort.clicked / cohort.sent) * 100).toFixed(1) : 0;
      cohort.bounceRate = cohort.sent > 0 ? ((cohort.bounced / cohort.sent) * 100).toFixed(1) : 0;
    });
    
    return cohorts;
  }

  // Calculate subscriber engagement segments
  static calculateEngagementSegments(emailLogs) {
    const subscriberMetrics = {};
    
    // Aggregate metrics by subscriber
    emailLogs.forEach(log => {
      const email = log.recipientEmail;
      
      if (!subscriberMetrics[email]) {
        subscriberMetrics[email] = {
          emailsReceived: 0,
          emailsOpened: 0,
          emailsClicked: 0,
          lastEngagement: null,
          firstEmail: log.timestamp
        };
      }
      
      subscriberMetrics[email].emailsReceived++;
      
      if (log.opened) {
        subscriberMetrics[email].emailsOpened++;
        subscriberMetrics[email].lastEngagement = log.timestamp;
      }
      
      if (log.clicked) {
        subscriberMetrics[email].emailsClicked++;
        subscriberMetrics[email].lastEngagement = log.timestamp;
      }
    });
    
    // Categorize subscribers
    const segments = {
      champions: [], // High open and click rates
      loyalists: [], // High open rate, moderate click rate
      potentialLoyalists: [], // Moderate engagement, recent subscribers
      newSubscribers: [], // Recent subscribers, limited data
      atRisk: [], // Declining engagement
      cannotLoseThemPotential: [], // Good historical engagement but recent decline
      hibernating: [] // Very low recent engagement
    };
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    Object.entries(subscriberMetrics).forEach(([email, metrics]) => {
      const openRate = metrics.emailsReceived > 0 ? (metrics.emailsOpened / metrics.emailsReceived) : 0;
      const clickRate = metrics.emailsReceived > 0 ? (metrics.emailsClicked / metrics.emailsReceived) : 0;
      const lastEngagement = metrics.lastEngagement ? new Date(metrics.lastEngagement) : null;
      const daysSinceFirstEmail = (now - new Date(metrics.firstEmail)) / (1000 * 60 * 60 * 24);
      
      const subscriber = {
        email,
        openRate: (openRate * 100).toFixed(1),
        clickRate: (clickRate * 100).toFixed(1),
        emailsReceived: metrics.emailsReceived,
        daysSinceLastEngagement: lastEngagement ? Math.floor((now - lastEngagement) / (1000 * 60 * 60 * 24)) : null,
        daysSinceFirstEmail: Math.floor(daysSinceFirstEmail)
      };
      
      // Segment logic
      if (openRate >= 0.8 && clickRate >= 0.3) {
        segments.champions.push(subscriber);
      } else if (openRate >= 0.6 && clickRate >= 0.1) {
        segments.loyalists.push(subscriber);
      } else if (daysSinceFirstEmail <= 30) {
        segments.newSubscribers.push(subscriber);
      } else if (openRate >= 0.4 && daysSinceFirstEmail <= 90) {
        segments.potentialLoyalists.push(subscriber);
      } else if (lastEngagement && lastEngagement < thirtyDaysAgo && openRate >= 0.3) {
        segments.cannotLoseThemPotential.push(subscriber);
      } else if (!lastEngagement || lastEngagement < thirtyDaysAgo) {
        segments.hibernating.push(subscriber);
      } else {
        segments.atRisk.push(subscriber);
      }
    });
    
    return segments;
  }

  // Generate performance insights
  static generatePerformanceInsights(emailLogs) {
    const insights = [];
    
    // Calculate overall metrics
    const totalSent = emailLogs.length;
    const totalOpened = emailLogs.filter(log => log.opened).length;
    const totalClicked = emailLogs.filter(log => log.clicked).length;
    const totalBounced = emailLogs.filter(log => log.bounced).length;
    
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
    
    // Industry benchmarks (example values)
    const benchmarks = {
      openRate: 21.33,
      clickRate: 2.62,
      bounceRate: 2.0
    };
    
    // Compare against benchmarks
    if (openRate > benchmarks.openRate) {
      insights.push({
        type: 'positive',
        metric: 'Open Rate',
        message: `Your open rate of ${openRate.toFixed(1)}% is above industry average (${benchmarks.openRate}%)`
      });
    } else if (openRate < benchmarks.openRate * 0.8) {
      insights.push({
        type: 'warning',
        metric: 'Open Rate',
        message: `Your open rate of ${openRate.toFixed(1)}% is below industry average. Consider improving subject lines.`
      });
    }
    
    if (clickRate > benchmarks.clickRate) {
      insights.push({
        type: 'positive',
        metric: 'Click Rate',
        message: `Your click rate of ${clickRate.toFixed(1)}% is above industry average (${benchmarks.clickRate}%)`
      });
    } else if (clickRate < benchmarks.clickRate * 0.8) {
      insights.push({
        type: 'warning',
        metric: 'Click Rate',
        message: `Your click rate of ${clickRate.toFixed(1)}% is below average. Focus on improving email content and CTAs.`
      });
    }
    
    if (bounceRate > benchmarks.bounceRate * 2) {
      insights.push({
        type: 'critical',
        metric: 'Bounce Rate',
        message: `Your bounce rate of ${bounceRate.toFixed(1)}% is high. Clean your email list to improve deliverability.`
      });
    }
    
    return insights;
  }
}

export default EmailMetrics;