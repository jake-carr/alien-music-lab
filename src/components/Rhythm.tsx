import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  }
};

const MetronomeSequencer: React.FC = () => {
  const [mode, setMode] = useState<MetronomeMode>('sequencer');
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [noteDivision, setNoteDivision] = useState<NoteDivision>('8n');
  const [simpleMetronomeFreq, setSimpleMetronomeFreq] = useState(880);
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
    setCurrentBeat(0);
  };

  const createSequence = () => {
    if (sequencerRef.current) {
      sequencerRef.current.dispose();
    }

    if (mode === 'simple') {
      const seq = new Tone.Sequence(
        (time) => {
          instruments.simpleMetronome.triggerAttackRelease(
            currentBeat === 0 ? simpleMetronomeFreq * 2 : simpleMetronomeFreq, 
            '32n',
            time,
            currentBeat === 0 ? 0.7 : 0.5
          );
          
          Tone.getDraw().schedule(() => {
            setCurrentBeat((prev) => (prev + 1) % 4);
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

  // Recreate sequence when beats change while playing
  useEffect(() => {
    if (isPlaying) {
      createSequence();
    }
  }, [beats, mode, noteDivision]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            mode === 'simple' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => {
            setMode('simple')
            setCurrentPreset('')
            setNoteDivision('4n')
          }}
        >
          Simple Metronome
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === 'sequencer' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => setMode('sequencer')}
        >
          Beat Sequencer
        </button>
      </div>

      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={isPlaying ? stopSequence : startSequence}
          className={`px-4 py-2 rounded ${
            isPlaying ? 'bg-red-600' : 'bg-green-600'
          } text-white`}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-white">BPM:</span>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-16 bg-gray-700 text-white rounded px-2 py-1"
            min="30"
            max="300"
          />
        </div>

        {mode === 'sequencer' && (
          <div className="flex items-center space-x-2">
            <span className="text-white">Note Division:</span>
            <select
              value={noteDivision}
              onChange={(e) => setNoteDivision(e.target.value as NoteDivision)}
              className="bg-gray-700 text-white rounded px-2 py-1"
              disabled={isPlaying}
            >
              <option value="4n">Quarter Notes</option>
              <option value="8n">Eighth Notes</option>
              <option value="16n">Sixteenth Notes</option>
            </select>
          </div>
        )}

        {mode === 'simple' && (
          <div className="flex items-center space-x-2">
            <span className="text-white">Frequency:</span>
            <select
              value={simpleMetronomeFreq}
              onChange={(e) => setSimpleMetronomeFreq(Number(e.target.value))}
              className="bg-gray-700 text-white rounded px-2 py-1"
            >
              <option value="440">440 Hz (A4)</option>
              <option value="880">880 Hz (A5)</option>
              <option value="1760">1760 Hz (A6)</option>
            </select>
          </div>
        )}

        {mode === 'sequencer' && (
          <div className="flex items-center space-x-2">
            <span className="text-white">Preset:</span>
            <select
              onChange={(e) => loadPreset(e.target.value)}
              className="bg-gray-700 text-white rounded px-2 py-1"
              disabled={isPlaying}
              value={currentPreset}
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
        <div className="mt-8 flex justify-center space-x-4">
          {[0, 1, 2, 3].map((beat) => (
            <div
              key={beat}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                currentBeat === beat
                  ? beat === 0 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : beat === 0
                    ? 'bg-green-900 text-gray-300'
                    : 'bg-gray-700 text-gray-400'
              }`}
            >
              {beat + 1}
            </div>
          ))}
        </div>
      )}

      {mode === 'sequencer' && (
        <div className="grid gap-2">
          {Object.keys(beats[0].instruments).map((instrument) => (
            <div key={instrument} className="flex items-center space-x-2">
              <div className="w-20 text-white capitalize text-left">{instrument.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${beats.length}, minmax(0, 1fr))` }}>
                {beats.map((beat, i) => (
                  <button
                    key={beat.id}
                    onClick={() => toggleInstrument(i, instrument as keyof Beat['instruments'])}
                    className={`w-full h-10 rounded-sm
                      ${
                      beat.instruments[instrument as keyof Beat['instruments']]
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                    } ${currentBeat === i && isPlaying ? beat.instruments[instrument as keyof Beat['instruments']]
                        ? 'bg-green-400' : 'bg-gray-500' : ''}`}
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
