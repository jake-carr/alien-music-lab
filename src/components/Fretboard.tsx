import React, { useState } from 'react';
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
  getFrequency
} from '../utils/music';

const Fretboard: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<BaseNote>('C');
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');
  const [selectedScaleType, setSelectedScaleType] = useState<ScaleType | null>('Ionian');
  const [selectedChordType, setSelectedChordType] = useState<ChordType | null>(null);
  const [labelType, setLabelType] = useState<LabelType>('Notes');
  const [showTriads, setShowTriads] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showRoot, setShowRoot] = useState(true);
  const [tuning, setTuning] = useState<string[]>(['E', 'B', 'G', 'D', 'A', 'E']);
  const [synth] = useState(new Tone.Synth().toDestination());

  const FRETS = Array.from({ length: 12 }, (_, i) => i);
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

  const handleFretClick = (stringIndex: number, fret: number) => {
    const note = getNoteAtFret(tuning[stringIndex] as Note, fret);
    const baseNote = note.charAt(0) as BaseNote;
    const accidental = note.length > 1 ? (note.charAt(1) === '#' ? 'sharp' : 'flat') : 'natural';
    
    setSelectedNote(baseNote);
    setSelectedAccidental(accidental);

    // Calculate octave based on string and fret position
    const baseOctave = 4 - Math.floor(stringIndex / 2);
    const octave = baseOctave + Math.floor((stringIndex * 5 + fret) / 12);
    
    // Play the note
    const frequency = getFrequency(note, octave);
    synth.triggerAttackRelease(frequency, '8n');
  };

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

  const handleTuningChange = (stringIndex: number, note: string) => {
    const newTuning = [...tuning];
    newTuning[stringIndex] = note;
    setTuning(newTuning);
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
      />

      <div className="w-full overflow-x-auto">
        <div className="relative w-full min-w-[800px]">
          {tuning.map((string, stringIndex) => (
            <div key={string + stringIndex} className="flex h-16 relative">
              <div className="string top-1/2" />
              
              {FRETS.map((fret) => {
                const note = getNoteAtFret(string as Note, fret);
                const isActive = activeNotes.includes(note);
                const isRoot = note === currentNote;
                const isTriad = getTriadNotes(activeNotes).includes(note);
                
                return (
                  <div
                    key={`${stringIndex}-${fret}`}
                    className="fret w-16 h-full"
                    onClick={() => handleFretClick(stringIndex, fret)}
                  >
                    {(isActive || showAllNotes) && (
                      <div 
                        className={`note-marker ${
                          isRoot && showRoot
                            ? 'bg-blue-500'
                            : isTriad
                            ? 'bg-green-500'
                            : isActive
                            ? 'bg-gray-600'
                            : 'bg-gray-700'
                        } hover:bg-gray-700/30`}
                      >
                        {getNoteLabel(note)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
