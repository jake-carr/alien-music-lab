import React from 'react';
import Fretboard from './components/Fretboard';
import './App.css'
import Rhythm from './components/Rhythm';

const App: React.FC = () => {
  return (
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
          <a href="https://github.com/yourusername/alien-guitar-studio" className="ml-2" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
      </div>
    
    </div>
  );
};

export default App;
