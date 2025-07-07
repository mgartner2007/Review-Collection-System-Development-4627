import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useBusiness } from '../context/BusinessContext';

const { FiSave, FiUpload, FiExternalLink, FiMail, FiPhone, FiMapPin } = FiIcons;

const BusinessSetup = () => {
  const navigate = useNavigate();
  const { business, updateBusiness, completeBusiness } = useBusiness();
  const [formData, setFormData] = useState({
    name: business.name || '',
    logo: business.logo || '',
    primaryColor: business.primaryColor || '#3D82FF',
    secondaryColor: business.secondaryColor || '#64748b',
    googleReviewUrl: business.googleReviewUrl || '',
    facebookReviewUrl: business.facebookReviewUrl || '',
    trustpilotReviewUrl: business.trustpilotReviewUrl || '',
    email: business.email || '',
    phone: business.phone || '',
    address: business.address || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      updateBusiness(formData);
      completeBusiness();
      navigate('/');
    } catch (error) {
      console.error('Error saving business setup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-neutral-900">Business Setup</h1>
        <p className="text-neutral-600 mt-2">
          Configure your business information and branding for the review system.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-soft"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Business Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-neutral-900">Business Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="business@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiPhone} className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-1" />
                  Business Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="Enter your business address"
                />
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-neutral-900">Branding</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiUpload} className="w-4 h-4 inline mr-1" />
                  Business Logo
                </label>
                <div className="flex items-center space-x-4">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="w-16 h-16 rounded-md object-cover border"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-full h-10 border border-neutral-300 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-full h-10 border border-neutral-300 rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Review Platform URLs */}
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <h2 className="text-xl font-display font-semibold text-neutral-900 mb-6">Review Platform URLs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4 inline mr-1" />
                  Google Reviews URL
                </label>
                <input
                  type="url"
                  name="googleReviewUrl"
                  value={formData.googleReviewUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="https://g.page/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4 inline mr-1" />
                  Facebook Reviews URL
                </label>
                <input
                  type="url"
                  name="facebookReviewUrl"
                  value={formData.facebookReviewUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4 inline mr-1" />
                  Trustpilot URL
                </label>
                <input
                  type="url"
                  name="trustpilotReviewUrl"
                  value={formData.trustpilotReviewUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:outline-none"
                  placeholder="https://trustpilot.com/..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
              )}
              Save Configuration
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BusinessSetup;