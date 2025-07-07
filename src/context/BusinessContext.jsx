import React, { createContext, useContext, useState, useEffect } from 'react';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState(() => {
    const saved = localStorage.getItem('business');
    return saved ? JSON.parse(saved) : {
      id: null,
      name: '',
      logo: '',
      primaryColor: '#3D82FF',
      secondaryColor: '#64748b',
      googleReviewUrl: '',
      facebookReviewUrl: '',
      trustpilotReviewUrl: '',
      email: '',
      phone: '',
      address: '',
      isSetup: false
    };
  });

  useEffect(() => {
    localStorage.setItem('business', JSON.stringify(business));
  }, [business]);

  const updateBusiness = (updates) => {
    setBusiness(prev => ({ ...prev, ...updates }));
  };

  const completeBusiness = () => {
    setBusiness(prev => ({ ...prev, isSetup: true }));
  };

  return (
    <BusinessContext.Provider value={{
      business,
      updateBusiness,
      completeBusiness
    }}>
      {children}
    </BusinessContext.Provider>
  );
};