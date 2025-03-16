import React from 'react';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/90 text-white p-8 rounded-lg max-w-2xl w-full mx-4 border border-gray-700/50">
        <h2 className="text-2xl mb-6 font-spaceGrotesk text-left">
          <span className="text-green-400">Alien</span> Music Lab
        </h2>
        
        <div className="space-y-6 text-left">

        <section>
          <p>Free practice tool made by a programmer who plays guitar.</p>
          </section>
      
          <section>
            <h3 className="text-lg font-medium text-white mb-2">Features</h3>
            <ul className="list-disc ml-5 text-gray-300 space-y-1.5">
              <li>Interactive guitar fretboard visualization</li>
              <li>Scale and chord exploration with audio feedback</li>
              <li>Customizable tuning with easy reset</li>
              <li>Rhythm sequencer with multiple instruments</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium text-white mb-2">Coming soon</h3>
            <ul className="list-disc ml-5 text-gray-300 space-y-1.5">
              <li>Mobile support</li>
              <li>Additional time signatures and note divisions</li>
              <li>Piano view for keyboard players</li>
              <li>Customizable sounds in rhythm sequencer</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
