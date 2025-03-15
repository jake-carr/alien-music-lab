import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

interface Beat {
  id: string;
  instruments: {
    hihat: boolean;
    snare: boolean;
    kick: boolean;
    cymbal: boolean;
    highTom: boolean;
    midTom: boolean;
    lowTom: boolean;
    clap: boolean;
  };
}

type NoteDivision = '4n' | '8n' | '16n';
type MetronomeMode = 'simple' | 'sequencer';

interface BeatPreset {
  name: string;
  pattern: Beat[];
  noteDivision: NoteDivision;
}

const PRESETS: Record<string, BeatPreset> = {
  'Basic Rock': {
    name: 'Basic Rock',
    noteDivision: '8n',
    pattern: Array.from({ length: 8 }, (_, i) => ({
      id: `beat-${i}`,
      instruments: {
        hihat: true,
        snare: i === 2 || i === 6,
        kick: i === 0 || i === 3 || i === 5,
        cymbal: false,
        highTom: false,
        midTom: false,
        lowTom: false,
        clap: false
      }
    }))
  },
  'Simple Backbeat': {
    name: 'Simple Backbeat',
    noteDivision: '4n',
    pattern: Array.from({ length: 4 }, (_, i) => ({
      id: `beat-${i}`,
      instruments: {
        hihat: true,
        snare: i % 2 === 1,
        kick: i % 2 === 0,
        cymbal: false,
        highTom: false,
        midTom: false,
        lowTom: false,
        clap: false
      }
    }))
  },
  'Latin Groove': {
    name: 'Latin Groove',
    noteDivision: '16n',
    pattern: Array.from({ length: 16 }, (_, i) => ({
      id: `beat-${i}`,
      instruments: {
        hihat: i % 2 === 0,
        snare: i === 4 || i === 12,
        kick: i === 0 || i === 6 || i === 10,
        cymbal: false,
        highTom: i === 7,
        midTom: i === 8,
        lowTom: i === 9,
        clap: i === 14
      }
    }))
  },
};

const MetronomeSequencer: React.FC = () => {
  const [mode, setMode] = useState<MetronomeMode>('simple');
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [noteDivision, setNoteDivision] = useState<NoteDivision>('8n');
  const sequencerRef = useRef<any>(null);

  // Store patterns for each note division
  const [patternStore, setPatternStore] = useState<Record<NoteDivision, Beat[]>>({
    '4n': Array.from({ length: 4 }, createEmptyBeat),
    '8n': Array.from({ length: 8 }, createEmptyBeat),
    '16n': Array.from({ length: 16 }, createEmptyBeat)
  });

  const [beats, setBeats] = useState<Beat[]>(() => patternStore[noteDivision]);

  // Effect to update beats when note division changes
  useEffect(() => {
    setBeats(patternStore[noteDivision]);
  }, [noteDivision]);

  // Save pattern when beats change, but only if it's from user interaction
  const savePattern = useCallback((newBeats: Beat[]) => {
    setBeats(newBeats);
    setPatternStore(prev => ({
      ...prev,
      [noteDivision]: newBeats
    }));
  }, [noteDivision]);

  function createEmptyBeat(_: unknown, i: number): Beat {
    return {
      id: `beat-${i}`,
      instruments: {
        hihat: false,
        snare: false,
        kick: false,
        cymbal: false,
        highTom: false,
        midTom: false,
        lowTom: false,
        clap: false
      }
    };
  }

  const toggleInstrument = (beatIndex: number, instrument: keyof Beat['instruments']) => {
    const newBeats = beats.map((beat, i) => 
      i === beatIndex
        ? {
          ...beat,
          instruments: {
            ...beat.instruments,
            [instrument]: !beat.instruments[instrument]
          }
        }
        : beat
    );

    savePattern(newBeats);
    setCurrentPreset('');
  };

  const [currentPreset, setCurrentPreset] = useState('');
  const loadPreset = (presetName: string) => {
    if (isPlaying) return;
    const preset = PRESETS[presetName];
    setCurrentPreset(presetName);
    setNoteDivision(preset.noteDivision);
    setPatternStore(prev => ({
      ...prev,
      [preset.noteDivision]: preset.pattern
    }));
    setBeats(preset.pattern);
  };

  // Initialize Tone.js instruments with more realistic sound design
  const [instruments] = useState(() => {
    const reverb = new Tone.Reverb({ decay: 0.5, wet: 0.1 }).toDestination();
    const compressor = new Tone.Compressor(-30, 3).toDestination();
    
    const highTom = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 2,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).connect(new Tone.Volume(-5)).connect(reverb);
    highTom.frequency.value = 280;

    const midTom = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 3,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.25, sustain: 0 }
    }).connect(new Tone.Volume(-4)).connect(reverb);
    midTom.frequency.value = 180;

    const lowTom = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0 }
    }).connect(new Tone.Volume(-3)).connect(reverb);
    lowTom.frequency.value = 100;

    return {
      hihat: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      }).connect(new Tone.Filter(8000, "highpass"))
        .connect(new Tone.Volume(-10))
        .connect(reverb),

      snare: new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 }
      }).connect(new Tone.Filter(2000, "highpass"))
        .connect(compressor)
        .connect(reverb),

      kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        oscillator: { type: 'triangle4' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0 }
      }).connect(new Tone.Filter(100, "lowpass"))
        .connect(compressor),

      cymbal: new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.8, release: 0.8 },
        harmonicity: 5.1,
        modulationIndex: 40,
        octaves: 1.5,
        resonance: 4000
      }).connect(new Tone.Volume(-20))
        .connect(reverb),

      highTom,
      midTom,
      lowTom,

      clap: new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
      }).connect(new Tone.Filter(2500, "bandpass"))
        .connect(new Tone.Volume(-8))
        .connect(reverb),

      simpleMetronome: new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0,
          release: 0.1
        }
      }).connect(new Tone.Volume(-10))
        .connect(reverb)
    } as const;
  });

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  const startSequence = async () => {
    await Tone.start();
    setCurrentBeat(0);
    createSequence();
    Tone.getTransport().start();
    setIsPlaying(true);
  };

  const stopSequence = () => {
    if (sequencerRef.current) {
      sequencerRef.current.stop();
      sequencerRef.current.dispose();
    }
    Tone.getTransport().stop();
    setIsPlaying(false);
    setCurrentBeat(0);  // Reset beat to 1 when stopping
  };

  const createSequence = () => {
    if (sequencerRef.current) {
      sequencerRef.current.dispose();
    }

    if (mode === 'simple') {
      const seq = new Tone.Sequence(
        (time) => {
          const subBeats = noteDivision === '4n' ? 1 : noteDivision === '8n' ? 2 : 4;
          const subBeat = currentBeat % 1 * subBeats;
          // Only play sound on main beats and 'and' beats for 8th/16th notes
          if (
            subBeat === 0 || // Main beat
            (noteDivision === '8n' && subBeat === 1) || // '&' for 8th notes
            (noteDivision === '16n' && (subBeat === 1 || subBeat === 2 || subBeat === 3)) // 'e', '&', 'a' for 16th notes
          ) {
            instruments.simpleMetronome.triggerAttackRelease(
              440,
              '32n',
              time,
              0.5,
            );
          }
          
          Tone.getDraw().schedule(() => {
            setCurrentBeat((prev) => {
              const increment = 1 / subBeats;
              const next = prev + increment;
              return next >= 4 ? 0 : next;
            });
          }, time);
        },
        [0],
        noteDivision
      );

      sequencerRef.current = seq;
      seq.start(0);
    } else {
      const seq = new Tone.Sequence(
        (time, step) => {
          Object.entries(beats[step].instruments).forEach(([instrument, isActive]) => {
            if (isActive) {
              const slight = (Math.random() - 0.5) * 0.01;
              if (instrument === 'kick') {
                instruments.kick.triggerAttackRelease('C1', '8n', time + slight);
              } else if (instrument === 'highTom') {
                instruments.highTom.triggerAttackRelease('G3', '16n', time + slight);
              } else if (instrument === 'midTom') {
                instruments.midTom.triggerAttackRelease('D3', '16n', time + slight);
              } else if (instrument === 'lowTom') {
                instruments.lowTom.triggerAttackRelease('A2', '16n', time + slight);
              } else if (instrument === 'hihat') {
                instruments.hihat.triggerAttackRelease('32n', time + slight);
              } else if (instrument === 'snare') {
                instruments.snare.triggerAttackRelease('32n', time + slight);
              } else if (instrument === 'cymbal') {
                instruments.cymbal.triggerAttackRelease('32n', time + slight);
              } else if (instrument === 'clap') {
                instruments.clap.triggerAttackRelease('32n', time + slight);
              }
            }
          });

          Tone.getDraw().schedule(() => {
            setCurrentBeat(step);
          }, time);
        },
        [...Array(beats.length).keys()],
        noteDivision
      );

      sequencerRef.current = seq;
      seq.start(0);
    }
  };

  // Recreate sequence when note division changes
  useEffect(() => {
    if (isPlaying) {
      stopSequence();
      startSequence();
    }
  }, [noteDivision]);

  // Recreate sequence when beats change while playing
  useEffect(() => {
    if (isPlaying) {
      createSequence();
    }
  }, [beats, mode, noteDivision]);

  // Add keyboard handler for spacebar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target as HTMLElement).matches('input, select, textarea')) {
        e.preventDefault();
        isPlaying ? stopSequence() : startSequence();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-6" style={{
      minWidth: '910px'
    }}>
      <div className="flex mb-8">
        <div
          className={`flex-1 py-4 text-lg transition-colors duration-300 ease-in-out cursor-pointer select-none text-center ${
            mode === 'simple' 
              ? 'text-white border-b-2 border-green-500' 
              : 'text-gray-500 hover:text-gray-300 border-b border-gray-700'
          }`}
          onClick={() => setMode('simple')}
        >
          Simple Metronome
        </div>
        <div
          className={`flex-1 py-4 text-lg transition-colors duration-300 ease-in-out cursor-pointer select-none text-center ${
            mode === 'sequencer' 
              ? 'text-white border-b-2 border-green-500' 
              : 'text-gray-500 hover:text-gray-300 border-b border-gray-700'
          }`}
          onClick={() => setMode('sequencer')}
        >
          Beat Sequencer
        </div>
      </div>

      <div className="flex items-end justify-center space-x-4 ">
        <button
          onClick={() => isPlaying ? stopSequence() : startSequence()}
          className="h-[42px] px-4 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 flex items-center justify-center"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="4" width="4" height="16" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" fill="currentColor" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          )}
        </button>

        <div className="space-y-2 min-w-[120px] ">
          <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide text-left">BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Math.min(300, Math.max(30, Number(e.target.value))))}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-300"
          />
        </div>

        <div className="space-y-2 min-w-[160px]">
          <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide text-left">Note Division</label>
          <select
            value={noteDivision}
            onChange={(e) => setNoteDivision(e.target.value as NoteDivision)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-300 appearance-none cursor-pointer pr-8 relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px'
            }}
          >
            <option value="4n">Quarter Notes (♩)</option>
            <option value="8n">Eighth Notes (♪)</option>
            <option value="16n">Sixteenth Notes (♬)</option>
          </select>
        </div>

        {mode === 'sequencer' && (
          <div className="space-y-2 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide text-left">Preset (Optional)</label>
            <select
              onChange={(e) => loadPreset(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-300 appearance-none cursor-pointer pr-8 relative"
              disabled={isPlaying}
              value={currentPreset}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '16px'
              }}
            >
              <option value="">Select Preset</option>
              {Object.keys(PRESETS).map(preset => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {mode === 'simple' && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center" style={{ gap: noteDivision === '4n' ? '2rem' : '1rem' }}>
            {Array.from({ length: noteDivision === '4n' ? 4 : noteDivision === '8n' ? 8 : 16 }, (_, i) => {
              const isMainBeat = i % (noteDivision === '4n' ? 1 : noteDivision === '8n' ? 2 : 4) === 0;
              const subBeatIndex = i % (noteDivision === '8n' ? 2 : 4);
              const label = isMainBeat ? Math.floor(i / (noteDivision === '4n' ? 1 : noteDivision === '8n' ? 2 : 4)) + 1 :
                          noteDivision === '8n' ? '&' :
                          subBeatIndex === 1 ? 'e' :
                          subBeatIndex === 2 ? '&' :
                          'a';
              
              const size = isMainBeat ? 'w-10 h-10 text-lg' :
                         (noteDivision === '8n' || subBeatIndex === 2) ? 'w-7 h-7 text-sm' :
                         'w-5 h-5 text-xs';
              
              const showBeat = isPlaying && Math.floor(currentBeat * (noteDivision === '4n' ? 1 : noteDivision === '8n' ? 2 : 4)) === i;

              return (
                <div
                  key={i}
                  className={`${size} rounded-full flex items-center justify-center font-medium transition-all duration-150
                    ${showBeat
                      ? `bg-green-500 text-white ${isMainBeat ? 'scale-110' : 'scale-105'}`
                      : `${isMainBeat ? 'bg-gray-700/50' : 'bg-gray-700/30'} ${isMainBeat ? 'text-gray-400' : 'text-gray-500/50'}`
                    }
                  `}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'sequencer' && (
        <div className="grid gap-2">
          {Object.keys(beats[0].instruments).map((instrument) => (
            <div key={instrument} className="flex items-center space-x-2">
              <div className="w-20 text-sm font-medium text-gray-400 uppercase tracking-wide text-left">
                {instrument === 'hihat' ? 'Hi-Hat' : 
                 instrument === 'highTom' ? 'High Tom' :
                 instrument === 'midTom' ? 'Mid Tom' :
                 instrument === 'lowTom' ? 'Low Tom' :
                 instrument.charAt(0).toUpperCase() + instrument.slice(1)}
              </div>
              <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${beats.length}, minmax(0, 1fr))` }}>
                {beats.map((beat, i) => (
                  <button
                    key={beat.id}
                    onClick={() => toggleInstrument(i, instrument as keyof Beat['instruments'])}
                    className={`w-full h-10 rounded-sm transition-colors duration-300 ease-in-out
                      ${
                      beat.instruments[instrument as keyof Beat['instruments']]
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                    } ${currentBeat === i && isPlaying ? 'opacity-80 ring-2 ring-white ring-opacity-50' : ''}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetronomeSequencer;
