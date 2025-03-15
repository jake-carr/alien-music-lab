import React from 'react';
import { BaseNote, Accidental, ScaleType, ChordType, LabelType, Note } from '../utils/music';

interface ControlPanelProps {
  selectedNote: BaseNote;
  selectedAccidental: Accidental;
  selectedScaleType: ScaleType | null;
  selectedChordType: ChordType | null;
  labelType: LabelType;
  showTriads: boolean;
  showAllNotes: boolean;
  showRoot: boolean;
  tuning: string[];
  onNoteChange: (note: BaseNote) => void;
  onAccidentalChange: (accidental: Accidental) => void;
  onScaleTypeChange: (scaleType: ScaleType | null) => void;
  onChordTypeChange: (chordType: ChordType | null) => void;
  onLabelTypeChange: (labelType: LabelType) => void;
  onTriadsChange: (show: boolean) => void;
  onAllNotesChange: (show: boolean) => void;
  onRootChange: (show: boolean) => void;
  onTuningChange: (stringIndex: number, note: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedNote,
  selectedAccidental,
  selectedScaleType,
  selectedChordType,
  labelType,
  showTriads,
  showAllNotes,
  showRoot,
  tuning,
  onNoteChange,
  onAccidentalChange,
  onScaleTypeChange,
  onChordTypeChange,
  onLabelTypeChange,
  onTriadsChange,
  onAllNotesChange,
  onRootChange,
  onTuningChange,
}) => {
  const notes: BaseNote[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const accidentals: Accidental[] = ['natural', 'sharp', 'flat'];
  const scaleTypes: ScaleType[] = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];
  const chordTypes: ChordType[] = ['Major', 'Minor', 'Dominant 7', 'Major 7', 'Minor 7', 'Diminished'];
  const labelTypes: LabelType[] = ['Notes', 'Degrees', 'None'];

  const handleTuningStep = (stringIndex: number, step: 1 | -1) => {
    const currentNote = tuning[stringIndex] as Note;
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const currentIndex = allNotes.indexOf(currentNote);
    const newIndex = (currentIndex + step + 12) % 12;
    onTuningChange(stringIndex, allNotes[newIndex]);
  };

  const handleHarmonyChange = (type: 'scale' | 'chord', value: string) => {
    if (type === 'scale') {
      const scaleValue = value ? value as ScaleType : null;
      onScaleTypeChange(scaleValue);
      if (scaleValue) onChordTypeChange(null);
    } else {
      const chordValue = value ? value as ChordType : null;
      onChordTypeChange(chordValue);
      if (chordValue) onScaleTypeChange(null);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Note</label>
          <select
            value={selectedNote}
            onChange={(e) => onNoteChange(e.target.value as BaseNote)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            {notes.map((note) => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Accidental</label>
          <select
            value={selectedAccidental}
            onChange={(e) => onAccidentalChange(e.target.value as Accidental)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            {accidentals.map((acc) => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Scale</label>
          <select
            value={selectedScaleType || ''}
            onChange={(e) => handleHarmonyChange('scale', e.target.value)}
            className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${selectedChordType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">None</option>
            {scaleTypes.map((scale) => (
              <option key={scale} value={scale}>{scale}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Chord</label>
          <select
            value={selectedChordType || ''}
            onChange={(e) => handleHarmonyChange('chord', e.target.value)}
            className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${selectedScaleType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">None</option>
            {chordTypes.map((chord) => (
              <option key={chord} value={chord}>{chord}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Label Type</label>
          <select
            value={labelType}
            onChange={(e) => onLabelTypeChange(e.target.value as LabelType)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            {labelTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Display Options</label>
          <div className="flex space-x-4 justify-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTriads}
                onChange={(e) => onTriadsChange(e.target.checked)}
                className="mr-2"
              />
              Triads
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showAllNotes}
                onChange={(e) => onAllNotesChange(e.target.checked)}
                className="mr-2"
              />
              All Notes
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showRoot}
                onChange={(e) => onRootChange(e.target.checked)}
                className="mr-2"
              />
              Root
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-center">Tuning</label>
        <div className="flex justify-center space-x-2">
          {tuning.map((note, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => handleTuningStep(index, 1)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-t"
              >
                ▲
              </button>
              <div className="w-12 bg-gray-700 text-white py-2 text-center">
                {note}
              </div>
              <button
                onClick={() => handleTuningStep(index, -1)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-b"
              >
                ▼
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
