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
    const saved = localStorage.getItem('reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [emailCampaigns, setEmailCampaigns] = useState(() => {
    const saved = localStorage.getItem('emailCampaigns');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('emailCampaigns', JSON.stringify(emailCampaigns));
  }, [emailCampaigns]);

  const createReviewRequest = (customerData) => {
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
    return reviewRequest;
  };

  const submitReview = (reviewId, rating, comment) => {
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

    // Simulate sending appropriate email based on rating
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      if (rating >= 4) {
        // Send thank you email for positive reviews
        console.log('Sending thank you email for positive review');
      } else {
        // Send negative feedback response email
        console.log('Sending negative feedback response email');
      }
    }
  };

  const trackClick = (reviewId) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, clicks: review.clicks + 1 }
        : review
    ));
  };

  const trackOpen = (reviewId) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, opened: true }
        : review
    ));
  };

  const addEmailCampaign = (campaignData) => {
    const campaign = {
      id: uuidv4(),
      ...campaignData,
      createdAt: new Date().toISOString()
    };
    setEmailCampaigns(prev => [...prev, campaign]);
    return campaign;
  };

  const getReviewById = (reviewId) => {
    return reviews.find(review => review.id === reviewId);
  };

  const getAnalytics = () => {
    const totalRequests = reviews.length;
    const completedReviews = reviews.filter(r => r.status === 'completed').length;
    const publicReviews = reviews.filter(r => r.isPublic).length;
    const privateReviews = reviews.filter(r => r.status === 'completed' && !r.isPublic).length;
    const totalClicks = reviews.reduce((sum, r) => sum + r.clicks, 0);
    const totalOpens = reviews.filter(r => r.opened).length;

    return {
      totalRequests,
      completedReviews,
      publicReviews,
      privateReviews,
      totalClicks,
      totalOpens,
      clickThroughRate: totalRequests > 0 ? (totalClicks / totalRequests * 100).toFixed(1) : 0,
      completionRate: totalRequests > 0 ? (completedReviews / totalRequests * 100).toFixed(1) : 0
    };
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      emailCampaigns,
      createReviewRequest,
      submitReview,
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