import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Fretboard from './components/Fretboard';
import './App.css'
import Rhythm from './components/Rhythm';
import MobileNotice from './components/MobileNotice';
import NotFound from './components/NotFound';

const App: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

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
          <div className="min-h-screen bg-gray-900 text-white pb-16">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-center mb-8">Alien Guitar Lab</h1>
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Fretboard</h2>
                  <Fretboard />
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Rhythm</h2>
                  <Rhythm />
                </section>
              </div>
              <footer className="footer">
                <p>
                  <a href="https://github.com/yourusername/alien-guitar-studio" className="ml-2 text-green-500 hover:text-green-400" target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </p>
              </footer>
            </div>
          </div>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
