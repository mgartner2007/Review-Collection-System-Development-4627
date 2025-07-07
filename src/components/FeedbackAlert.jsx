import React from 'react';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiAlertCircle, FiMail, FiClock } = FiIcons;

const FeedbackAlert = ({ feedback, onResolve }) => {
  const isOverdue = () => {
    const currentTime = new Date().getTime();
    const feedbackTime = new Date(feedback.submittedAt).getTime();
    const hoursElapsed = (currentTime - feedbackTime) / (1000 * 60 * 60);
    return hoursElapsed >= 72;
  };

  return (
    <div className={`border rounded-lg p-5 mb-4 ${isOverdue() ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
      <div className="flex items-start">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isOverdue() ? 'bg-red-100' : 'bg-orange-100'}`}>
          <SafeIcon 
            icon={isOverdue() ? FiClock : FiAlertCircle} 
            className={`w-6 h-6 ${isOverdue() ? 'text-accent-red' : 'text-accent-orange'}`} 
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-display font-semibold text-neutral-900">
                {isOverdue() ? 'Overdue Response Needed' : 'Feedback Needs Response'}
              </h3>
              <p className="text-sm text-neutral-600">
                From {feedback.customerName} • {format(new Date(feedback.submittedAt), 'MMM d, yyyy')}
              </p>
            </div>
            
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${isOverdue() ? 'bg-red-100 text-accent-red' : 'bg-orange-100 text-accent-orange'}`}>
              {isOverdue() ? 'Overdue (72+ hours)' : '3-Star Feedback'}
            </span>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-md border border-neutral-200">
            <div className="mb-3">
              <span className="text-sm font-medium text-neutral-700">Issue:</span>
              <span className="ml-2 text-neutral-800">{feedback.issueDetails}</span>
            </div>
            
            <div className="mb-3">
              <span className="text-sm font-medium text-neutral-700">Details:</span>
              <p className="mt-1 text-neutral-800 whitespace-pre-wrap">{feedback.details}</p>
            </div>
            
            {feedback.email && (
              <div className="flex items-center mt-4">
                <SafeIcon icon={FiMail} className="w-4 h-4 text-neutral-500 mr-2" />
                <a href={`mailto:${feedback.email}`} className="text-primary-600 hover:underline">
                  {feedback.email}
                </a>
              </div>
            )}
          </div>
          
          {isOverdue() && (
            <div className="mt-3 p-3 bg-red-100 rounded-md text-sm text-red-800">
              <strong>Follow up with this customer to repair the relationship and ask for a second-chance review.</strong>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => onResolve(feedback.id)}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium text-sm"
            >
              Mark as Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAlert;