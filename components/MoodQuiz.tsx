
import React, { useState } from 'react';
import { MoodAnalysisResult } from '../types';

interface MoodCheckProps {
  onSubmit: (answers: {
    feeling: number;
    activities: string[];
    triggers: string[];
    notes: string;
  }) => Promise<MoodAnalysisResult | null>;
  onClose: () => void;
  onContinueToChat: (result: MoodAnalysisResult) => void;
}

const Tag: React.FC<{ label: string; selected: boolean; onClick: () => void; }> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
      selected
        ? 'bg-brand-blue text-white border-brand-blue'
        : 'bg-white text-brand-gray-dark border-brand-gray-light hover:border-brand-blue'
    }`}
  >
    {label}
  </button>
);

const MoodCheck: React.FC<MoodCheckProps> = ({ onSubmit, onClose, onContinueToChat }) => {
  const [feeling, setFeeling] = useState(5);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  type View = 'form' | 'loading' | 'results' | 'error';
  const [view, setView] = useState<View>('form');
  const [result, setResult] = useState<MoodAnalysisResult | null>(null);

  const activityOptions = ['Exercise', 'Work', 'Social', 'Family Time', 'Reading', 'Music', 'Meditation', 'Gaming', 'Cooking', 'Nature'];
  const triggerOptions = ['Stress', 'Work Pressure', 'Relationship Issues', 'Health Concerns', 'Financial Worries', 'Sleep Problems', 'Social Anxiety', 'Weather'];

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };
  
  const handleSubmit = async () => {
      setView('loading');
      const analysisResult = await onSubmit({
          feeling,
          activities: selectedActivities,
          triggers: selectedTriggers,
          notes
      });

      if (analysisResult) {
          setResult(analysisResult);
          setView('results');
      } else {
          setView('error');
      }
  }

  const renderContent = () => {
    switch(view) {
        case 'loading':
            return (
                <div className="p-6 flex flex-col items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-brand-gray-light border-t-brand-blue rounded-full animate-spin"></div>
                    <p className="text-brand-gray-dark mt-4 text-lg font-semibold">Analyzing your mood...</p>
                </div>
            );
        case 'results':
            return (
                <>
                    <div className="p-6 border-b text-center">
                        <h2 className="text-xl font-bold text-brand-gray-darkest">Your Mood Analysis</h2>
                    </div>
                    <div className="p-10 text-center space-y-4">
                        <p className="text-brand-gray text-lg">Your current mood is:</p>
                        <h3 className="text-4xl font-bold text-brand-blue">{result?.moodName}</h3>
                        <p className="text-5xl font-bold text-brand-gray-darkest">{result?.moodScore.toFixed(1)}<span className="text-2xl text-brand-gray">/10</span></p>
                    </div>
                    <div className="p-4 bg-white rounded-b-2xl border-t space-y-2">
                         <button
                            onClick={() => onContinueToChat(result!)}
                            className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span>Discuss with AI Chat</span>
                        </button>
                        <button onClick={onClose} className="w-full py-2 px-4 text-brand-gray-dark font-medium rounded-lg hover:bg-brand-gray-light transition-colors">
                            Done
                        </button>
                    </div>
                </>
            );
        case 'error':
            return (
                <>
                    <div className="p-6 border-b text-center">
                        <h2 className="text-xl font-bold text-red-600">Analysis Failed</h2>
                    </div>
                    <div className="p-10 text-center space-y-4">
                        <p className="text-brand-gray-dark">We couldn't analyze your mood at the moment. Please try again later.</p>
                    </div>
                     <div className="p-4 bg-white rounded-b-2xl border-t">
                        <button onClick={onClose} className="w-full py-3 px-4 bg-brand-gray text-white font-semibold rounded-lg hover:bg-brand-gray-dark transition-colors">
                            Close
                        </button>
                    </div>
                </>
            );
        case 'form':
        default:
            return (
                <>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-brand-gray-darkest">Mood Check</h2>
                        <p className="text-sm text-brand-gray">Help us understand how you're feeling right now</p>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Feeling Slider */}
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <label htmlFor="feeling-slider" className="block text-base font-semibold text-brand-gray-darkest mb-3">How are you feeling? (1-10)</label>
                            <input
                                id="feeling-slider"
                                type="range"
                                min="1"
                                max="10"
                                value={feeling}
                                onChange={(e) => setFeeling(Number(e.target.value))}
                                className="w-full h-2 bg-brand-gray-light rounded-lg appearance-none cursor-pointer accent-brand-blue"
                            />
                            <div className="flex justify-between text-xs text-brand-gray mt-2">
                                <span>Very Low</span>
                                <span className="font-bold text-brand-blue text-base">{feeling}</span>
                                <span>Excellent</span>
                            </div>
                        </div>

                        {/* Activities */}
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <h3 className="text-base font-semibold text-brand-gray-darkest mb-3">Recent Activities</h3>
                            <div className="flex flex-wrap gap-2">
                                {activityOptions.map(activity => (
                                    <Tag key={activity} label={activity} selected={selectedActivities.includes(activity)} onClick={() => toggleSelection(activity, selectedActivities, setSelectedActivities)} />
                                ))}
                            </div>
                        </div>

                        {/* Triggers */}
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <h3 className="text-base font-semibold text-brand-gray-darkest mb-3">Potential Triggers</h3>
                            <div className="flex flex-wrap gap-2">
                                {triggerOptions.map(trigger => (
                                    <Tag key={trigger} label={trigger} selected={selectedTriggers.includes(trigger)} onClick={() => toggleSelection(trigger, selectedTriggers, setSelectedTriggers)} />
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <h3 className="text-base font-semibold text-brand-gray-darkest mb-3">Additional Notes</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Anything else you'd like to share?"
                                className="w-full h-24 p-2 border border-brand-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue placeholder:text-brand-gray text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.stopPropagation();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded-b-2xl border-t">
                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors"
                        >
                            Analyze My Mood
                        </button>
                    </div>
                </>
            );
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-brand-gray-lightest rounded-2xl shadow-2xl w-full max-w-lg transform transition-all relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-brand-gray hover:bg-brand-gray-light transition-colors z-10" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default MoodCheck;
