// Email tracking pixel service
class TrackingPixelService {
  constructor() {
    this.trackingEndpoint = '/api/tracking';
  }

  // Generate tracking pixel URL
  generateTrackingPixel(emailId, eventType = 'open') {
    const params = new URLSearchParams({
      email_id: emailId,
      event: eventType,
      timestamp: Date.now()
    });
    
    return `${window.location.origin}${this.trackingEndpoint}/pixel.gif?${params}`;
  }

  // Generate click tracking URL
  generateClickTrackingUrl(emailId, originalUrl, linkId = null) {
    const params = new URLSearchParams({
      email_id: emailId,
      url: encodeURIComponent(originalUrl),
      link_id: linkId || 'default',
      timestamp: Date.now()
    });
    
    return `${window.location.origin}${this.trackingEndpoint}/click?${params}`;
  }

  // Inject tracking pixel into email HTML
  injectTrackingPixel(emailHTML, emailId) {
    const trackingPixelUrl = this.generateTrackingPixel(emailId, 'open');
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
    
    // Insert before closing body tag or at the end if no body tag
    if (emailHTML.includes('</body>')) {
      return emailHTML.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return emailHTML + trackingPixel;
    }
  }

  // Convert links to tracking links in email HTML
  injectClickTracking(emailHTML, emailId) {
    // Regex to find all href attributes
    const linkRegex = /href="([^"]+)"/g;
    let linkCounter = 0;
    
    return emailHTML.replace(linkRegex, (match, url) => {
      // Skip tracking pixels and relative links
      if (url.includes('pixel.gif') || url.includes('tracking') || url.startsWith('#') || url.startsWith('mailto:')) {
        return match;
      }
      
      linkCounter++;
      const trackingUrl = this.generateClickTrackingUrl(emailId, url, `link_${linkCounter}`);
      return `href="${trackingUrl}"`;
    });
  }

  // Process email for tracking before sending
  processEmailForTracking(emailHTML, emailId) {
    let processedHTML = emailHTML;
    
    // Add click tracking
    processedHTML = this.injectClickTracking(processedHTML, emailId);
    
    // Add open tracking pixel
    processedHTML = this.injectTrackingPixel(processedHTML, emailId);
    
    return processedHTML;
  }

  // Handle tracking pixel request (would be server-side in production)
  handleTrackingPixel(params) {
    const { email_id, event, timestamp } = params;
    
    // In production, this would update the database
    if (window.emailLogContext) {
      const eventData = {
        timestamp: new Date(parseInt(timestamp)).toISOString(),
        userAgent: navigator.userAgent,
        deviceType: this.detectDeviceType(),
        location: null // Would be populated by IP geolocation
      };
      
      window.emailLogContext.trackEmailEvent(email_id, event, eventData);
    }
    
    // Return 1x1 transparent GIF
    return this.generateTransparentGif();
  }

  // Handle click tracking (would be server-side in production)
  handleClickTracking(params) {
    const { email_id, url, link_id, timestamp } = params;
    
    // Track the click event
    if (window.emailLogContext) {
      const eventData = {
        url: decodeURIComponent(url),
        linkId: link_id,
        timestamp: new Date(parseInt(timestamp)).toISOString(),
        userAgent: navigator.userAgent,
        deviceType: this.detectDeviceType()
      };
      
      window.emailLogContext.trackEmailEvent(email_id, 'clicked', eventData);
    }
    
    // Redirect to original URL
    window.location.href = decodeURIComponent(url);
  }

  // Detect device type from user agent
  detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad|android(?!.*mobile)/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // Generate 1x1 transparent GIF for tracking pixel
  generateTransparentGif() {
    // Base64 encoded 1x1 transparent GIF
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }

  // Get geolocation from IP (would be server-side in production)
  async getLocationFromIP(ip) {
    try {
      // In production, use a service like MaxMind or IP-API
      const response = await fetch(`https://ip-api.com/json/${ip}`);
      const data = await response.json();
      
      return {
        country: data.country,
        region: data.regionName,
        city: data.city,
        timezone: data.timezone
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // Analyze email engagement patterns
  analyzeEngagementPatterns(emailLogs) {
    const patterns = {
      timeOfDay: {},
      dayOfWeek: {},
      deviceType: {},
      location: {}
    };

    emailLogs.forEach(log => {
      if (log.opened) {
        const openTime = new Date(log.timestamp);
        const hour = openTime.getHours();
        const dayOfWeek = openTime.getDay();

        // Time of day analysis
        patterns.timeOfDay[hour] = (patterns.timeOfDay[hour] || 0) + 1;

        // Day of week analysis
        patterns.dayOfWeek[dayOfWeek] = (patterns.dayOfWeek[dayOfWeek] || 0) + 1;

        // Device type analysis
        if (log.deviceType) {
          patterns.deviceType[log.deviceType] = (patterns.deviceType[log.deviceType] || 0) + 1;
        }

        // Location analysis
        if (log.location && log.location.country) {
          patterns.location[log.location.country] = (patterns.location[log.location.country] || 0) + 1;
        }
      }
    });

    return patterns;
  }

  // Generate recommendations based on engagement patterns
  generateRecommendations(patterns) {
    const recommendations = [];

    // Best time to send analysis
    const bestHour = Object.entries(patterns.timeOfDay)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (bestHour) {
      recommendations.push({
        type: 'timing',
        title: 'Optimal Send Time',
        message: `Your emails get the most opens at ${bestHour[0]}:00. Consider scheduling campaigns around this time.`,
        priority: 'high'
      });
    }

    // Device optimization
    const totalOpens = Object.values(patterns.deviceType).reduce((sum, count) => sum + count, 0);
    const mobileOpens = patterns.deviceType.mobile || 0;
    const mobilePercent = totalOpens > 0 ? (mobileOpens / totalOpens) * 100 : 0;

    if (mobilePercent > 60) {
      recommendations.push({
        type: 'design',
        title: 'Mobile Optimization',
        message: `${mobilePercent.toFixed(0)}% of your emails are opened on mobile. Ensure your templates are mobile-first.`,
        priority: 'high'
      });
    }

    // Geographic insights
    const topLocation = Object.entries(patterns.location)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topLocation) {
      recommendations.push({
        type: 'targeting',
        title: 'Geographic Focus',
        message: `Most of your engagement comes from ${topLocation[0]}. Consider localizing content for this region.`,
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

export default new TrackingPixelService();