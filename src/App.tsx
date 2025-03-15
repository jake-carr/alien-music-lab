import React from 'react';
import Fretboard from './components/Fretboard';
import './App.css'
import Metronome from './components/Metronome';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Alien Guitar Lab</h1>
        <Fretboard />
        <Metronome />
      </div>
      <footer className="footer">
        <p>
          <a href="https://github.com/yourusername/alien-guitar-studio" className="ml-2" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
