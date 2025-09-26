
import React, { useState } from 'react';
import { Achievement } from '../types';

interface AchievementInputScreenProps {
  onComplete: () => void;
}

const AchievementInputScreen: React.FC<AchievementInputScreenProps> = ({ onComplete }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const handleAddAchievement = () => {
    if (currentInput.trim()) {
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        text: currentInput.trim(),
        date: new Date().toISOString().split('T')[0],
      };
      setAchievements(prev => [newAchievement, ...prev]);
      setCurrentInput('');
    }
  };
  
  const handleDeleteAchievement = (id: string) => {
      setAchievements(prev => prev.filter(ach => ach.id !== id));
  };

  const handleSaveAndContinue = () => {
    try {
      localStorage.setItem('userAchievements', JSON.stringify(achievements));
    } catch (error) {
      console.error("Failed to save achievements:", error);
    }
    onComplete();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-blue-light to-brand-teal-light p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-brand-gray-darkest">Let’s Celebrate Your Wins!</h2>
          <p className="mt-2 text-sm text-brand-gray-dark">What are some achievements, big or small, that you’re proud of?</p>
        </div>

        <div className="flex items-center gap-2">
            <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="e.g., Learned a new skill"
                className="flex-1 px-4 py-2 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                onKeyPress={(e) => e.key === 'Enter' && handleAddAchievement()}
            />
            <button
                onClick={handleAddAchievement}
                className="px-4 py-2 bg-brand-teal text-white font-semibold rounded-lg hover:bg-brand-teal-dark transition-colors"
            >
                Add
            </button>
        </div>
        
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {achievements.map(ach => (
                <div key={ach.id} className="bg-brand-gray-lightest p-3 rounded-lg flex justify-between items-center text-left">
                    <p className="text-sm font-medium text-brand-gray-darkest">{ach.text}</p>
                    <button onClick={() => handleDeleteAchievement(ach.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
        </div>

        <div>
          <button
            onClick={handleSaveAndContinue}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-dark transition-colors duration-300"
          >
            Save & Continue
          </button>
          <button
            onClick={onComplete}
            className="w-full mt-3 text-sm font-medium text-brand-gray hover:text-brand-gray-darkest"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementInputScreen;
