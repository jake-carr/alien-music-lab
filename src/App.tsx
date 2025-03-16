import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  const handleResize = () => {
    setIsMobileView(window.innerWidth < 1024);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isMobileView) {
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
                >
                  View on GitHub
                </a>
                <a 
                  onClick={() => setShowAbout(true)}
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
      <About isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </Router>
  );
};

export default App;
