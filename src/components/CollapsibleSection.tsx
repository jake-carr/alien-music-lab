import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CollapsibleSectionProps {
  title: string;
  storageKey: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  summary?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  storageKey,
  defaultOpen = true,
  children,
  summary
}) => {
  const [isOpen, setIsOpen] = useLocalStorage(`section-${storageKey}`, defaultOpen);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-white font-medium">{title}</h3>
          {!isOpen && summary && (
            <span className="text-gray-400 text-sm">{summary}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 border-t border-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
