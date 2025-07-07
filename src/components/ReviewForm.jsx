import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useReview } from '../context/ReviewContext';
import { useBusiness } from '../context/BusinessContext';
import DetailedFeedbackForm from './DetailedFeedbackForm';
import ThankYouFeedback from './ThankYouFeedback';

const { FiStar, FiSend, FiCheckCircle, FiExternalLink } = FiIcons;

const ReviewForm = () => {
  const { reviewId } = useParams();
  const { getReviewById, submitReview, trackClick, submitDetailedFeedback } = useReview();
  const { business } = useBusiness();
  
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const reviewData = getReviewById(reviewId);
    if (reviewData) {
      setReview(reviewData);
      trackClick(reviewId);
    }
  }, [reviewId, getReviewById, trackClick]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // If rating is 3, show detailed feedback form instead of submitting
      if (rating === 3) {
        setShowDetailedFeedback(true);
        setIsSubmitting(false);
        return;
      }
      
      await submitReview(reviewId, rating, comment);
      setIsSubmitted(true);
      
      // If high rating, redirect to public review platforms
      if (rating >= 4) {
        setTimeout(() => {
          if (business.googleReviewUrl) {
            window.open(business.googleReviewUrl, '_blank');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedFeedbackSubmit = async (feedbackData) => {
    try {
      await submitDetailedFeedback(reviewId, rating, comment, feedbackData);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoveredStar(starRating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading review form...</p>
        </div>
      </div>
    );
  }

  if (feedbackSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <ThankYouFeedback onClose={() => setFeedbackSubmitted(false)} />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-medium p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiCheckCircle} className="w-8 h-8 text-accent-green" />
          </div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Thank You!</h2>
          <p className="text-neutral-600 mb-6">
            Your feedback has been submitted successfully.
          </p>
          
          {rating >= 4 && business.googleReviewUrl && (
            <div className="bg-primary-50 rounded-md p-4 mb-6">
              <p className="text-sm text-primary-700 mb-3">
                We'd love if you could share your experience publicly!
              </p>
              <a
                href={business.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
              >
                <SafeIcon icon={FiExternalLink} className="w-4 h-4 mr-2" />
                Leave Google Review
              </a>
            </div>
          )}
          
          <p className="text-sm text-neutral-500">
            This window will close automatically.
          </p>
        </motion.div>
      </div>
    );
  }

  if (showDetailedFeedback) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <DetailedFeedbackForm
            onSubmit={handleDetailedFeedbackSubmit}
            onCancel={() => setShowDetailedFeedback(false)}
            customerEmail={review.customerEmail}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-medium overflow-hidden"
        >
          {/* Header with business branding */}
          <div
            className="p-6 text-white text-center"
            style={{ backgroundColor: business.primaryColor || '#3D82FF' }}
          >
            {business.logo && (
              <img
                src={business.logo}
                alt={business.name}
                className="w-16 h-16 rounded-full mx-auto mb-4 bg-white p-2"
              />
            )}
            <h1 className="text-xl font-display font-bold">{business.name}</h1>
            <p className="text-sm opacity-90 mt-1">How was your experience?</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="text-center mb-6">
              <p className="text-neutral-700 mb-4 font-medium">Hi {review.customerName}!</p>
              <p className="text-neutral-600 text-sm mb-6">
                We'd love to hear about your experience with our service.
              </p>

              {/* Star Rating */}
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <SafeIcon
                      icon={FiStar}
                      className={`w-8 h-8 ${
                        star <= (hoveredStar || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <p className="text-sm text-neutral-600 mb-4">
                  You rated us {rating} out of 5 stars
                </p>
              )}
            </div>

            {/* Comment Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tell us more about your experience (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                placeholder="Share your thoughts..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="w-full px-4 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <SafeIcon icon={FiSend} className="w-5 h-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>

            {rating === 0 && (
              <p className="text-sm text-neutral-500 text-center mt-2">
                Please select a rating to continue
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewForm;