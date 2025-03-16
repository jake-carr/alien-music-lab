import React, { useMemo, useState, useCallback } from 'react';
import * as Tone from 'tone';
import ControlPanel from './ControlPanel';
import {
  BaseNote,
  Accidental,
  ScaleType,
  ChordType,
  LabelType,
  Note,
  getNoteWithAccidental,
  getScaleNotes,
  getChordNotes,
  getNoteAtFret,
  getFrequency,
  STANDARD_TUNING
} from '../utils/music';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { logAnalyticsEvent } from '../firebase';

const Fretboard: React.FC = () => {
  const [selectedNote, setSelectedNote] = useLocalStorage<BaseNote>('selectedNote', 'C');
  const [selectedAccidental, setSelectedAccidental] = useLocalStorage<Accidental>('selectedAccidental', 'natural');
  const [selectedScaleType, setSelectedScaleType] = useLocalStorage<ScaleType | null>('selectedScaleType', 'Ionian (Major)');
  const [selectedChordType, setSelectedChordType] = useLocalStorage<ChordType | null>('selectedChordType', null);
  const [labelType, setLabelType] = useLocalStorage<LabelType>('labelType', 'Notes');
  const [showTriads, setShowTriads] = useLocalStorage<boolean>('showTriads', false);
  const [showAllNotes, setShowAllNotes] = useLocalStorage<boolean>('showAllNotes', false);
  const [showRoot, setShowRoot] = useLocalStorage<boolean>('showRoot', true);
  const [tuning, setTuning] = useLocalStorage<Note[]>('tuning', STANDARD_TUNING);
  const [synth] = useState(new Tone.Synth().toDestination());

  // Changed to 12 frets
  const FRETS = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentNote = getNoteWithAccidental(selectedNote, selectedAccidental);
  
  const activeNotes = React.useMemo(() => {
    if (selectedScaleType) {
      return getScaleNotes(currentNote, selectedScaleType);
    }
    if (selectedChordType) {
      return getChordNotes(currentNote, selectedChordType);
    }
    return showAllNotes ? [] : [currentNote];
  }, [currentNote, selectedScaleType, selectedChordType, showAllNotes]);

  const getTriadNotes = (notes: Note[]): Note[] => {
    if (!showTriads) return [];
    return notes.filter((_, index) => index % 2 === 0);
  };

  const handleFretClick = useCallback((stringIndex: number, fret: number) => {
    const note = getNoteAtFret(tuning[stringIndex] as Note, fret);
    const baseNote = note.charAt(0) as BaseNote;
    const accidental = note.length > 1 ? (note.charAt(1) === '#' ? 'sharp' : 'flat') : 'natural';
    
    setSelectedNote(baseNote);
    setSelectedAccidental(accidental);

    // Calculate octave based on string and fret position
    const baseOctave = 4;
    const octave = baseOctave + stringIndex;
    
    // Play the note
    const frequency = getFrequency(note, octave);
    synth.triggerAttackRelease(frequency, '8n');

    logAnalyticsEvent('fret_click', {
      string_index: stringIndex,
      fret_number: fret,
      note: note,
      octave: octave
    });
  }, [tuning, setSelectedNote, setSelectedAccidental, synth]);

  const handleTuningChange = useCallback((stringIndex: number, note: Note) => {
    const newTuning = [...tuning];
    newTuning[stringIndex] = note;
    setTuning(newTuning);
    logAnalyticsEvent('tuning_change', {
      string_index: stringIndex,
      new_note: note,
      full_tuning: newTuning.join(',')
    });
  }, [tuning, setTuning]);

  const getNoteLabel = (note: Note): string => {
    if (labelType === 'None') return '';
    if (labelType === 'Notes') return note;
    
    if (!selectedScaleType && !selectedChordType) return '';
    
    const notes = selectedScaleType 
      ? getScaleNotes(currentNote, selectedScaleType)
      : getChordNotes(currentNote, selectedChordType!);
    
    const index = notes.indexOf(note);
    
    if (index === -1) return '';
    
    // degrees
    return (index + 1).toString();
  };

  const resetTuning = () => {
    setTuning(STANDARD_TUNING);
  };

  return (
    <div className="space-y-6">
      <ControlPanel
        selectedNote={selectedNote}
        selectedAccidental={selectedAccidental}
        selectedScaleType={selectedScaleType}
        selectedChordType={selectedChordType}
        labelType={labelType}
        showTriads={showTriads}
        showAllNotes={showAllNotes}
        showRoot={showRoot}
        tuning={tuning}
        onNoteChange={setSelectedNote}
        onAccidentalChange={setSelectedAccidental}
        onScaleTypeChange={setSelectedScaleType}
        onChordTypeChange={setSelectedChordType}
        onLabelTypeChange={setLabelType}
        onTriadsChange={setShowTriads}
        onAllNotesChange={setShowAllNotes}
        onRootChange={setShowRoot}
        onTuningChange={handleTuningChange}
        onResetTuning={resetTuning}
      />

      <div className="w-full overflow-x-hidden">
        <div className="relative w-full" style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Fret markers */}
          <div className="flex h-8 relative">
            <div className="w-16" /> {/* Space for string labels */}
            {FRETS.map((fret) => (
              <div key={`marker-${fret}`} className="w-[calc((100%-4rem)/12)] flex justify-center">
                {[1, 3, 5, 7, 9, 12].includes(fret) && (
                  <span className="text-white text-sm">{fret}</span>
                )}
              </div>
            ))}
          </div>
          
          {tuning.map((string, stringIndex) => (
            <div key={string + stringIndex} className="flex h-16 relative">
              {/* String label on the left */}
              <div className="w-16 flex justify-center items-center">
                <span className="text-white text-sm">{string}</span>
              </div>
              
              <div className="string absolute left-16 right-0 top-1/2" />
              
              {FRETS.map((fret) => {
                const note = getNoteAtFret(string as Note, fret);
                const isActive = activeNotes.includes(note);
                const isRoot = note === currentNote;
                const isTriad = getTriadNotes(activeNotes).includes(note);
                const isLastFret = fret === FRETS.length;
                
                return (
                  <div
                    key={`${stringIndex}-${fret}`}
                    className={`fret w-[calc((100%-4rem)/12)] h-full ${isLastFret ? 'border-r-0' : ''}`}
                    onClick={() => handleFretClick(stringIndex, fret)}
                  >
                    {(isActive || showAllNotes) && (
                      <div 
                        className={`cursor-pointer note-marker transition-all duration-300 ease-in-out ${
                          isRoot && showRoot
                            ? 'bg-green-500 text-white'
                            : isTriad
                            ? 'bg-blue-500 text-white'
                            : isActive
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-gray-800 text-gray-300'
                        } hover:opacity-90`}
                      >
                        {getNoteLabel(note)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )).reverse()}
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
