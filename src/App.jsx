import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import ReviewForm from './components/ReviewForm';
import BusinessSetup from './components/BusinessSetup';
import EmailTemplates from './components/EmailTemplates';
import Analytics from './components/Analytics';
import Navigation from './components/Navigation';
import { BusinessProvider } from './context/BusinessContext';
import { ReviewProvider } from './context/ReviewContext';

function App() {
  return (
    <BusinessProvider>
      <ReviewProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="pt-16"
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/setup" element={<BusinessSetup />} />
                <Route path="/templates" element={<EmailTemplates />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/review/:reviewId" element={<ReviewForm />} />
              </Routes>
            </motion.main>
          </div>
        </Router>
      </ReviewProvider>
    </BusinessProvider>
  );
}

export default App;