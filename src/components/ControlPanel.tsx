import React from 'react';
import { BaseNote, Accidental, ScaleType, ChordType, LabelType, Note, STANDARD_TUNING } from '../utils/music';
import CollapsibleSection from './CollapsibleSection';
interface ControlPanelProps {
  selectedNote: BaseNote;
  selectedAccidental: Accidental;
  selectedScaleType: ScaleType | null;
  selectedChordType: ChordType | null;
  labelType: LabelType;
  showTriads: boolean;
  showAllNotes: boolean;
  showRoot: boolean;
  tuning: Note[];
  onNoteChange: (note: BaseNote) => void;
  onAccidentalChange: (accidental: Accidental) => void;
  onScaleTypeChange: (scale: ScaleType | null) => void;
  onChordTypeChange: (chord: ChordType | null) => void;
  onLabelTypeChange: (type: LabelType) => void;
  onTriadsChange: (show: boolean) => void;
  onAllNotesChange: (show: boolean) => void;
  onRootChange: (show: boolean) => void;
  onTuningChange: (stringIndex: number, note: Note) => void;
  onResetTuning: () => void;
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
  onResetTuning
}) => {
  const isStandardTuning = JSON.stringify(tuning) === JSON.stringify(STANDARD_TUNING);

  const notes: BaseNote[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const scaleTypes: ScaleType[] = ['Ionian (Major)', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian (Minor)', 'Locrian'];
  const chordTypes: ChordType[] = ['Major', 'Minor', 'Dominant 7', 'Major 7', 'Minor 7', 'Diminished'];
  const labelTypes: LabelType[] = ['Notes', 'Degrees', 'None'];

  return (
    <div className="space-y-4">
      {/* Root Note Selection */}
      <CollapsibleSection 
        title="Root Note" 
        storageKey="root-note"
        summary={selectedNote}
      >
        <div className="relative w-56 h-56 mx-auto mt-6 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-gray-700 opacity-50" 
               style={{ 
                 width: '224px',  
                 height: '224px',
                 left: '0px',
                 top: '0px'
               }} 
          />
          {notes.map((note) => {
            const angle = (notes.indexOf(note) * 360) / 7;
            const radius = 112; 
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius + radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius + radius;
            
            return (
              <button
                key={note}
                onClick={() => onNoteChange(note)}
                className={`absolute w-14 h-14 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  selectedNote === note
                    ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-500/20'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              >
                <span className="text-xl font-medium">{note}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Accidental Selection */}
      <CollapsibleSection title="Accidental" storageKey="accidental" summary={selectedAccidental}>
        <div className="flex gap-2">
          {[
            { value: 'natural' as Accidental, symbol: '♮', label: 'Natural' },
            { value: 'sharp' as Accidental, symbol: '♯', label: 'Sharp' },
            { value: 'flat' as Accidental, symbol: '♭', label: 'Flat' }
          ].map(({ value, symbol, label }) => (
            <button
              key={value}
              onClick={() => onAccidentalChange(value)}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                selectedAccidental === value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">{symbol}</span>
              <span className="ml-2 text-sm">({label})</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Scale/Chord Selection */}
      <CollapsibleSection 
        title="Scale or Chord" 
        storageKey="harmony"
        summary={selectedScaleType || selectedChordType || 'None'}
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <span className="w-16">Scale</span>
              <div className="flex-1 h-px bg-gray-700 ml-2" />
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[...scaleTypes, null].map((scale) => (
                <label key={scale ?? 'none'} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="scale"
                      checked={selectedScaleType === scale}
                      onChange={() => {
                        onScaleTypeChange(scale);
                        onChordTypeChange(null);
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
                      selectedScaleType === scale
                        ? 'border-green-500 bg-green-500 scale-110'
                        : 'border-gray-400 group-hover:border-green-400'
                    }`}>
                      {selectedScaleType === scale && (
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                    {scale ?? 'None'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <span className="w-16">Chord</span>
              <div className="flex-1 h-px bg-gray-700 ml-2" />
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[...chordTypes, null].map((chord) => (
                <label key={chord ?? 'none'} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="chord"
                      checked={selectedChordType === chord}
                      onChange={() => {
                        onChordTypeChange(chord);
                        onScaleTypeChange(null);
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
                      selectedChordType === chord
                        ? 'border-green-500 bg-green-500 scale-110'
                        : 'border-gray-400 group-hover:border-green-400'
                    }`}>
                      {selectedChordType === chord && (
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                    {chord ?? 'None'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Display Options */}
      <CollapsibleSection 
        title="Display Options" 
        storageKey="display"
        summary={`${labelType}${(showTriads || showAllNotes || showRoot) ? ', ' : ''}${[
          showTriads && 'Triads',
          showAllNotes && 'All Notes',
          showRoot && 'Root'
        ].filter(Boolean).join(', ')}`}
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <span className="w-24">Note Labels</span>
              <div className="flex-1 h-px bg-gray-700 ml-2" />
            </h4>
            <div className="space-y-2">
              {labelTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="labelType"
                      checked={labelType === type}
                      onChange={() => onLabelTypeChange(type)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
                      labelType === type
                        ? 'border-green-500 bg-green-500 scale-110'
                        : 'border-gray-400 group-hover:border-green-400'
                    }`}>
                      {labelType === type && (
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <span className="w-24">Show Notes</span>
              <div className="flex-1 h-px bg-gray-700 ml-2" />
            </h4>
            <div className="space-y-2">
              {[
                { label: 'All Notes', checked: showAllNotes, onChange: onAllNotesChange },
                { label: 'Triads', checked: showTriads, onChange: onTriadsChange },
                { label: 'Root', checked: showRoot, onChange: onRootChange },
              ].map(({ label, checked, onChange }) => (
                <label key={label} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onChange(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                      checked
                        ? 'border-green-500 bg-green-500 scale-110'
                        : 'border-gray-400 group-hover:border-green-400'
                    }`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Tuning */}
      <CollapsibleSection 
        title="Tuning" 
        storageKey="tuning"
        summary={tuning.join(' ')}
      >
        <div>
          <div className="grid grid-cols-6 gap-2">
            {tuning.map((note, i) => {
              const stringNumber = tuning.length - i;
              const isLowest = i === 0;
              const isHighest = i === tuning.length - 1;
              
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">
                    String {stringNumber}
                    {isLowest && <span className="ml-1">(Lowest)</span>}
                    {isHighest && <span className="ml-1">(Highest)</span>}
                  </div>
                  <select
                    value={note}
                    onChange={(e) => onTuningChange(i, e.target.value as Note)}
                    className="bg-gray-700 text-white rounded px-2 py-1 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-center"
                  >
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          {!isStandardTuning && (
            <button
              onClick={onResetTuning}
              className="w-auto mt-3 px-3 py-1.5 text-sm text-green-500 hover:text-green-400 border border-green-500/30 hover:border-green-400/30 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset to Standard
            </button>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ControlPanel;
