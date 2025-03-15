import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth] = useState(new Tone.Synth().toDestination());

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
    return () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    };
  }, [bpm]);

  const toggleMetronome = async () => {
    if (!isPlaying) {
      await Tone.start();
      const repeat = (time: number) => {
        synth.triggerAttackRelease('C5', '32n', time);
      };
      Tone.getTransport().scheduleRepeat(repeat, '4n');
      Tone.getTransport().start();
    } else {
      Tone.getTransport().stop();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
      <button
        onClick={toggleMetronome}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="40"
          max="208"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-32"
        />
        <span className="text-sm">{bpm} BPM</span>
      </div>
    </div>
  );
};

export default Metronome;
