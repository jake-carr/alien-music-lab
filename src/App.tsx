import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { logAnalyticsEvent } from './firebase';
import Fretboard from './components/Fretboard';
import './App.css'
import Rhythm from './components/Rhythm';
import MobileNotice from './components/MobileNotice';
import NotFound from './components/NotFound';
import About from './components/About';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [showAbout, setShowAbout] = useLocalStorage('showAboutModal', false);

  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_title: 'Home',
      page_location: window.location.href,
    });
  }, []);

  const handleResize = () => {
    setIsMobileView(window.innerWidth < 1024);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleGitHubClick = () => {
    logAnalyticsEvent('github_link_click');
  };

  const handleAboutClick = () => {
    logAnalyticsEvent('about_modal_open');
    setShowAbout(true);
  };

  if (isMobileView) {
    logAnalyticsEvent('mobile_view_redirect');
    return <MobileNotice />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-4xl font-bold text-center mb-12 font-['Space_Grotesk']">
                <span className="text-green-500">Alien</span>
                <span className="text-white"> Music Lab</span>
              </h1>
              <div className="space-y-8">
                <section className="bg-gray-800/50 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4 text-white">Fretboard</h2>
                  <Fretboard />
                </section>
                <section className="bg-gray-800/50 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4 text-white">Rhythm</h2>
                  <Rhythm />
                </section>
              </div>
              <footer className="mt-12 text-center pt-8 space-x-6">
                <a 
                  href="https://github.com/jake-carr/alien-music-lab" 
                  className="text-gray-400 hover:text-green-500 transition-colors duration-300 text-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleGitHubClick}
                >
                  View on GitHub
                </a>
                <a 
                  onClick={handleAboutClick}
                  className="text-gray-400 hover:text-green-500 transition-colors duration-300 cursor-pointer text-md" 
                >
                  About
                </a>
              </footer>
            </div>
          </div>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <About isOpen={showAbout} onClose={() => {
        logAnalyticsEvent('about_modal_close');
        setShowAbout(false);
      }} />
    </Router>
  );
};

export default App;
