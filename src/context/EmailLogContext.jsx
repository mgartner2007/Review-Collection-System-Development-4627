import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const EmailLogContext = createContext();

export const useEmailLog = () => {
  const context = useContext(EmailLogContext);
  if (!context) {
    throw new Error('useEmailLog must be used within an EmailLogProvider');
  }
  return context;
};

export const EmailLogProvider = ({ children }) => {
  const [emailLogs, setEmailLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('emailLogs');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading email logs:', error);
      return [];
    }
  });

  const [rateLimitConfig, setRateLimitConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('rateLimitConfig');
      return saved ? JSON.parse(saved) : {
        maxEmailsPerHour: 300,
        currentHourCount: 0,
        hourStartTime: new Date().toISOString(),
        queuedEmails: []
      };
    } catch (error) {
      console.error('Error loading rate limit config:', error);
      return {
        maxEmailsPerHour: 300,
        currentHourCount: 0,
        hourStartTime: new Date().toISOString(),
        queuedEmails: []
      };
    }
  });

  const [emailCampaigns, setEmailCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('emailCampaigns');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading email campaigns:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('emailLogs', JSON.stringify(emailLogs));
    } catch (error) {
      console.error('Error saving email logs:', error);
    }
  }, [emailLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('rateLimitConfig', JSON.stringify(rateLimitConfig));
    } catch (error) {
      console.error('Error saving rate limit config:', error);
    }
  }, [rateLimitConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('emailCampaigns', JSON.stringify(emailCampaigns));
    } catch (error) {
      console.error('Error saving email campaigns:', error);
    }
  }, [emailCampaigns]);

  // Check if we need to reset the hourly counter
  useEffect(() => {
    const checkHourlyReset = () => {
      const now = new Date();
      const hourStart = new Date(rateLimitConfig.hourStartTime);
      const hoursDiff = (now - hourStart) / (1000 * 60 * 60);
      
      if (hoursDiff >= 1) {
        setRateLimitConfig(prev => ({
          ...prev,
          currentHourCount: 0,
          hourStartTime: now.toISOString()
        }));
      }
    };

    const interval = setInterval(checkHourlyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [rateLimitConfig.hourStartTime]);

  const logEmail = (emailData) => {
    try {
      const logEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        recipientEmail: emailData.to,
        subject: emailData.subject,
        emailType: emailData.type || 'Unknown',
        provider: emailData.provider || 'Unknown',
        deliveryStatus: 'Sent',
        messageId: emailData.messageId,
        opened: false,
        clicked: false,
        bounced: false,
        error: null,
        campaignId: emailData.campaignId || null,
        businessId: emailData.businessId || null,
        customerId: emailData.customerId || null,
        reviewId: emailData.reviewId || null,
        templateUsed: emailData.templateUsed || null,
        deviceType: null, // Will be populated by tracking pixels
        location: null, // Will be populated by tracking
        userAgent: null // Will be populated by tracking
      };

      setEmailLogs(prev => [logEntry, ...prev]);
      return logEntry;
    } catch (error) {
      console.error('Error logging email:', error);
      return null;
    }
  };

  const updateEmailStatus = (messageId, status, timestamp = new Date().toISOString()) => {
    try {
      setEmailLogs(prev => prev.map(log => 
        log.messageId === messageId 
          ? { ...log, deliveryStatus: status, lastUpdated: timestamp }
          : log
      ));
    } catch (error) {
      console.error('Error updating email status:', error);
    }
  };

  const trackEmailEvent = (messageId, eventType, eventData = {}, timestamp = new Date().toISOString()) => {
    try {
      setEmailLogs(prev => prev.map(log => 
        log.messageId === messageId 
          ? { 
              ...log, 
              [eventType]: true,
              lastUpdated: timestamp,
              deliveryStatus: eventType === 'bounced' ? 'Bounced' : 
                           eventType === 'opened' ? 'Opened' : 
                           eventType === 'clicked' ? 'Clicked' : log.deliveryStatus,
              // Store additional tracking data
              deviceType: eventData.deviceType || log.deviceType,
              location: eventData.location || log.location,
              userAgent: eventData.userAgent || log.userAgent,
              clickedLinks: eventType === 'clicked' ? 
                [...(log.clickedLinks || []), { url: eventData.url, timestamp }] : 
                log.clickedLinks || []
            }
          : log
      ));
    } catch (error) {
      console.error('Error tracking email event:', error);
    }
  };

  const canSendEmail = () => {
    const now = new Date();
    const hourStart = new Date(rateLimitConfig.hourStartTime);
    const hoursDiff = (now - hourStart) / (1000 * 60 * 60);
    
    // Reset if more than an hour has passed
    if (hoursDiff >= 1) {
      return { canSend: true, resetNeeded: true };
    }
    
    return { 
      canSend: rateLimitConfig.currentHourCount < rateLimitConfig.maxEmailsPerHour,
      resetNeeded: false
    };
  };

  const incrementEmailCount = () => {
    setRateLimitConfig(prev => ({
      ...prev,
      currentHourCount: prev.currentHourCount + 1
    }));
  };

  const queueEmail = (emailData) => {
    setRateLimitConfig(prev => ({
      ...prev,
      queuedEmails: [...prev.queuedEmails, { ...emailData, queuedAt: new Date().toISOString() }]
    }));
  };

  const processQueue = () => {
    const { canSend } = canSendEmail();
    if (canSend && rateLimitConfig.queuedEmails.length > 0) {
      const emailToSend = rateLimitConfig.queuedEmails[0];
      setRateLimitConfig(prev => ({
        ...prev,
        queuedEmails: prev.queuedEmails.slice(1)
      }));
      return emailToSend;
    }
    return null;
  };

  const getRateLimitStatus = () => {
    const now = new Date();
    const hourStart = new Date(rateLimitConfig.hourStartTime);
    const minutesElapsed = (now - hourStart) / (1000 * 60);
    const minutesRemaining = Math.max(0, 60 - minutesElapsed);
    
    return {
      currentCount: rateLimitConfig.currentHourCount,
      maxCount: rateLimitConfig.maxEmailsPerHour,
      queueSize: rateLimitConfig.queuedEmails.length,
      minutesUntilReset: Math.ceil(minutesRemaining),
      canSend: rateLimitConfig.currentHourCount < rateLimitConfig.maxEmailsPerHour
    };
  };

  const getEmailStats = () => {
    const total = emailLogs.length;
    const sent = emailLogs.filter(log => log.deliveryStatus === 'Sent').length;
    const bounced = emailLogs.filter(log => log.bounced).length;
    const opened = emailLogs.filter(log => log.opened).length;
    const clicked = emailLogs.filter(log => log.clicked).length;
    
    return {
      total,
      sent,
      bounced,
      opened,
      clicked,
      bounceRate: total > 0 ? ((bounced / total) * 100).toFixed(1) : 0,
      openRate: total > 0 ? ((opened / total) * 100).toFixed(1) : 0,
      clickRate: total > 0 ? ((clicked / total) * 100).toFixed(1) : 0
    };
  };

  // Enhanced analytics functions
  const getAdvancedEmailAnalytics = (days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentLogs = emailLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
    
    // Template performance analysis
    const templatePerformance = {};
    recentLogs.forEach(log => {
      const template = log.templateUsed || 'Unknown';
      if (!templatePerformance[template]) {
        templatePerformance[template] = {
          sent: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0
        };
      }
      
      templatePerformance[template].sent++;
      if (log.opened) templatePerformance[template].opened++;
      if (log.clicked) templatePerformance[template].clicked++;
      if (log.bounced) templatePerformance[template].bounced++;
    });

    // Calculate rates for each template
    Object.keys(templatePerformance).forEach(template => {
      const stats = templatePerformance[template];
      stats.openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0;
      stats.clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : 0;
      stats.bounceRate = stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(1) : 0;
    });

    // Time-based analysis
    const hourlyData = {};
    const dailyData = {};
    
    recentLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const hour = logDate.getHours();
      const dayKey = logDate.toISOString().split('T')[0];
      
      // Hourly data
      if (!hourlyData[hour]) {
        hourlyData[hour] = { sent: 0, opened: 0, clicked: 0 };
      }
      hourlyData[hour].sent++;
      if (log.opened) hourlyData[hour].opened++;
      if (log.clicked) hourlyData[hour].clicked++;
      
      // Daily data
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { sent: 0, opened: 0, clicked: 0, bounced: 0 };
      }
      dailyData[dayKey].sent++;
      if (log.opened) dailyData[dayKey].opened++;
      if (log.clicked) dailyData[dayKey].clicked++;
      if (log.bounced) dailyData[dayKey].bounced++;
    });

    // Device type analysis
    const deviceStats = {};
    recentLogs.filter(log => log.deviceType).forEach(log => {
      if (!deviceStats[log.deviceType]) {
        deviceStats[log.deviceType] = { opens: 0, clicks: 0 };
      }
      if (log.opened) deviceStats[log.deviceType].opens++;
      if (log.clicked) deviceStats[log.deviceType].clicks++;
    });

    // Geographic analysis
    const locationStats = {};
    recentLogs.filter(log => log.location).forEach(log => {
      const location = log.location.country || 'Unknown';
      if (!locationStats[location]) {
        locationStats[location] = { opens: 0, clicks: 0 };
      }
      if (log.opened) locationStats[location].opens++;
      if (log.clicked) locationStats[location].clicks++;
    });

    // Link click analysis
    const linkClickData = [];
    recentLogs.forEach(log => {
      if (log.clickedLinks && log.clickedLinks.length > 0) {
        log.clickedLinks.forEach(link => {
          linkClickData.push({
            url: link.url,
            timestamp: link.timestamp,
            emailType: log.emailType,
            templateUsed: log.templateUsed
          });
        });
      }
    });

    // Calculate engagement scores
    const totalSent = recentLogs.length;
    const totalOpened = recentLogs.filter(log => log.opened).length;
    const totalClicked = recentLogs.filter(log => log.clicked).length;
    const totalBounced = recentLogs.filter(log => log.bounced).length;

    const engagementScore = totalSent > 0 ? 
      ((totalOpened * 1 + totalClicked * 2) / (totalSent * 2) * 100).toFixed(1) : 0;

    return {
      templatePerformance,
      hourlyData,
      dailyData,
      deviceStats,
      locationStats,
      linkClickData,
      engagementScore,
      totalMetrics: {
        sent: totalSent,
        opened: totalOpened,
        clicked: totalClicked,
        bounced: totalBounced,
        openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0,
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : 0,
        bounceRate: totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : 0
      }
    };
  };

  const createEmailCampaign = (campaignData) => {
    try {
      const campaign = {
        id: uuidv4(),
        name: campaignData.name,
        description: campaignData.description,
        templateId: campaignData.templateId,
        targetAudience: campaignData.targetAudience,
        scheduledTime: campaignData.scheduledTime,
        status: 'draft', // draft, scheduled, sending, completed, paused
        createdAt: new Date().toISOString(),
        createdBy: campaignData.createdBy || 'admin',
        metrics: {
          totalRecipients: 0,
          emailsSent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        }
      };

      setEmailCampaigns(prev => [...prev, campaign]);
      return campaign;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  };

  const updateCampaignMetrics = (campaignId, metrics) => {
    try {
      setEmailCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, metrics: { ...campaign.metrics, ...metrics } }
          : campaign
      ));
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
    }
  };

  const getCampaignAnalytics = (campaignId) => {
    try {
      const campaign = emailCampaigns.find(c => c.id === campaignId);
      if (!campaign) return null;

      const campaignEmails = emailLogs.filter(log => log.campaignId === campaignId);
      
      const analytics = {
        campaign,
        emailsSent: campaignEmails.length,
        delivered: campaignEmails.filter(log => log.deliveryStatus === 'Delivered').length,
        opened: campaignEmails.filter(log => log.opened).length,
        clicked: campaignEmails.filter(log => log.clicked).length,
        bounced: campaignEmails.filter(log => log.bounced).length,
        openRate: campaignEmails.length > 0 ? 
          ((campaignEmails.filter(log => log.opened).length / campaignEmails.length) * 100).toFixed(1) : 0,
        clickRate: campaignEmails.length > 0 ? 
          ((campaignEmails.filter(log => log.clicked).length / campaignEmails.length) * 100).toFixed(1) : 0,
        bounceRate: campaignEmails.length > 0 ? 
          ((campaignEmails.filter(log => log.bounced).length / campaignEmails.length) * 100).toFixed(1) : 0,
        timeline: campaignEmails.map(log => ({
          timestamp: log.timestamp,
          event: log.opened ? 'opened' : log.clicked ? 'clicked' : log.bounced ? 'bounced' : 'sent',
          recipientEmail: log.recipientEmail
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };

      return analytics;
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      return null;
    }
  };

  return (
    <EmailLogContext.Provider value={{
      emailLogs,
      rateLimitConfig,
      emailCampaigns,
      logEmail,
      updateEmailStatus,
      trackEmailEvent,
      canSendEmail,
      incrementEmailCount,
      queueEmail,
      processQueue,
      getRateLimitStatus,
      getEmailStats,
      getAdvancedEmailAnalytics,
      createEmailCampaign,
      updateCampaignMetrics,
      getCampaignAnalytics
    }}>
      {children}
    </EmailLogContext.Provider>
  );
};