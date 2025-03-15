export type Note = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';
export type BaseNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = 'natural' | 'sharp' | 'flat';
export type ScaleType = 'Ionian' | 'Dorian' | 'Phrygian' | 'Lydian' | 'Mixolydian' | 'Aeolian' | 'Locrian';
export type ChordType = 'Major' | 'Minor' | 'Dominant 7' | 'Major 7' | 'Minor 7' | 'Diminished';
export type LabelType = 'Notes' | 'Degrees' | 'None';

const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES: Note[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const SCALE_PATTERNS = {
  Ionian: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
};

export const CHORD_PATTERNS = {
  Major: [0, 4, 7],
  Minor: [0, 3, 7],
  'Dominant 7': [0, 4, 7, 10],
  'Major 7': [0, 4, 7, 11],
  'Minor 7': [0, 3, 7, 10],
  Diminished: [0, 3, 6],
};

export function getNoteWithAccidental(baseNote: BaseNote, accidental: Accidental): Note {
  if (accidental === 'natural') return baseNote;
  const noteIndex = NOTES.indexOf(baseNote);
  return accidental === 'sharp' ? NOTES[(noteIndex + 1) % 12] : FLAT_NOTES[(noteIndex + 11) % 12];
}

export function getScaleNotes(root: Note, scaleType: ScaleType): Note[] {
  const pattern = SCALE_PATTERNS[scaleType];
  const rootIndex = NOTES.indexOf(root);
  return pattern.map(interval => NOTES[(rootIndex + interval) % 12]);
}

export function getChordNotes(root: Note, chordType: ChordType): Note[] {
  const pattern = CHORD_PATTERNS[chordType];
  const rootIndex = NOTES.indexOf(root);
  return pattern.map(interval => NOTES[(rootIndex + interval) % 12]);
}

export function getNoteAtFret(string: Note, fret: number): Note {
  const startIndex = NOTES.indexOf(string);
  return NOTES[(startIndex + fret) % 12];
}

export function getFrequency(note: Note, octave: number): number {
  const noteIndex = NOTES.indexOf(note);
  const a4Index = NOTES.indexOf('A');
  const halfStepsFromA4 = noteIndex - a4Index + (octave - 4) * 12;
  return 440 * Math.pow(2, halfStepsFromA4 / 12);
}
