import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ReviewContext = createContext();

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('reviews');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading reviews:', error);
      return [];
    }
  });

  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem('feedbacks');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      return [];
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
      localStorage.setItem('reviews', JSON.stringify(reviews));
    } catch (error) {
      console.error('Error saving reviews:', error);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    } catch (error) {
      console.error('Error saving feedbacks:', error);
    }
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('emailCampaigns', JSON.stringify(emailCampaigns));
    } catch (error) {
      console.error('Error saving email campaigns:', error);
    }
  }, [emailCampaigns]);

  // Get pending feedbacks that need response (3-star ratings)
  const pendingFeedbacks = feedbacks.filter(feedback => !feedback.resolved);

  const createReviewRequest = async (customerData) => {
    try {
      const reviewId = uuidv4();
      const reviewRequest = {
        id: reviewId,
        customerId: customerData.id || uuidv4(),
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
        jobDescription: customerData.jobDescription,
        status: 'pending',
        rating: null,
        comment: '',
        isPublic: false,
        createdAt: new Date().toISOString(),
        submittedAt: null,
        reviewUrl: `${window.location.origin}/#/review/${reviewId}`,
        qrCode: null,
        emailsSent: [],
        clicks: 0,
        opened: false
      };

      setReviews(prev => [...prev, reviewRequest]);
      
      console.log('Review request created successfully');
      return reviewRequest;
    } catch (error) {
      console.error('Error creating review request:', error);
      throw error;
    }
  };

  const submitReview = async (reviewId, rating, comment) => {
    try {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? {
              ...review,
              rating,
              comment,
              status: 'completed',
              submittedAt: new Date().toISOString(),
              isPublic: rating >= 4
            }
          : review
      ));
      
      console.log('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const submitDetailedFeedback = (reviewId, rating, comment, feedbackData) => {
    try {
      // First update the review with the rating
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? {
              ...review,
              rating,
              comment,
              status: 'completed',
              submittedAt: new Date().toISOString(),
              isPublic: false
            }
          : review
      ));
      
      // Then create a detailed feedback entry
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        const feedback = {
          id: uuidv4(),
          reviewId,
          customerId: review.customerId,
          customerName: review.customerName,
          customerEmail: feedbackData.email || review.customerEmail,
          issueDetails: feedbackData.issueDetails,
          details: feedbackData.details,
          resolved: false,
          submittedAt: new Date().toISOString(),
          resolvedAt: null
        };
        
        setFeedbacks(prev => [...prev, feedback]);
        
        console.log('Detailed 3-star feedback submitted and flagged for follow-up');
        return feedback;
      }
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
      throw error;
    }
  };

  const resolveFeedback = (feedbackId) => {
    try {
      setFeedbacks(prev => prev.map(feedback => 
        feedback.id === feedbackId
          ? {
              ...feedback,
              resolved: true,
              resolvedAt: new Date().toISOString()
            }
          : feedback
      ));
    } catch (error) {
      console.error('Error resolving feedback:', error);
    }
  };

  const trackClick = (reviewId) => {
    try {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, clicks: review.clicks + 1 }
          : review
      ));
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const trackOpen = (reviewId) => {
    try {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, opened: true }
          : review
      ));
    } catch (error) {
      console.error('Error tracking open:', error);
    }
  };

  const addEmailCampaign = (campaignData) => {
    try {
      const campaign = {
        id: uuidv4(),
        ...campaignData,
        createdAt: new Date().toISOString()
      };
      setEmailCampaigns(prev => [...prev, campaign]);
      return campaign;
    } catch (error) {
      console.error('Error adding email campaign:', error);
      throw error;
    }
  };

  const getReviewById = (reviewId) => {
    try {
      return reviews.find(review => review.id === reviewId);
    } catch (error) {
      console.error('Error getting review by ID:', error);
      return null;
    }
  };

  const getAnalytics = () => {
    try {
      const totalRequests = reviews.length;
      const completedReviews = reviews.filter(r => r.status === 'completed').length;
      const publicReviews = reviews.filter(r => r.isPublic).length;
      const privateReviews = reviews.filter(r => r.status === 'completed' && !r.isPublic).length;
      const threeStarReviews = reviews.filter(r => r.rating === 3).length;
      const totalClicks = reviews.reduce((sum, r) => sum + r.clicks, 0);
      const totalOpens = reviews.filter(r => r.opened).length;
      const resolvedIssues = feedbacks.filter(f => f.resolved).length;
      const pendingIssues = feedbacks.filter(f => !f.resolved).length;

      return {
        totalRequests,
        completedReviews,
        publicReviews,
        privateReviews,
        threeStarReviews,
        totalClicks,
        totalOpens,
        resolvedIssues,
        pendingIssues,
        clickThroughRate: totalRequests > 0 ? (totalClicks / totalRequests * 100).toFixed(1) : 0,
        completionRate: totalRequests > 0 ? (completedReviews / totalRequests * 100).toFixed(1) : 0,
        issueResolutionRate: (feedbacks.length > 0) ? (resolvedIssues / feedbacks.length * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalRequests: 0,
        completedReviews: 0,
        publicReviews: 0,
        privateReviews: 0,
        threeStarReviews: 0,
        totalClicks: 0,
        totalOpens: 0,
        resolvedIssues: 0,
        pendingIssues: 0,
        clickThroughRate: 0,
        completionRate: 0,
        issueResolutionRate: 0
      };
    }
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      feedbacks,
      pendingFeedbacks,
      emailCampaigns,
      createReviewRequest,
      submitReview,
      submitDetailedFeedback,
      resolveFeedback,
      trackClick,
      trackOpen,
      addEmailCampaign,
      getReviewById,
      getAnalytics
    }}>
      {children}
    </ReviewContext.Provider>
  );
};