import React from 'react';
import { Achievement } from '../types';

interface YearlyReviewModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

const YearlyReviewModal: React.FC<YearlyReviewModalProps> = ({ achievements, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all flex flex-col h-[80vh] bg-gradient-to-br from-yellow-50 to-orange-100" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-yellow-200">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-brand-gray-darkest">A Year in Review!</h2>
          <p className="text-brand-gray-dark mt-2">Look how far you've come! Here are some of the wins you've recorded this past year.</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {achievements.length > 0 ? (
            <ul className="space-y-3">
              {achievements.map(ach => (
                <li key={ach.id} className="bg-white/70 p-3 rounded-lg flex items-center space-x-3 shadow-sm">
                  <div className="text-xl">🏆</div>
                  <div>
                    <p className="font-semibold text-brand-gray-darkest">{ach.text}</p>
                    <p className="text-xs text-brand-gray">Achieved on: {new Date(ach.date).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-brand-gray mt-8">No achievements recorded in the past year. Keep going!</p>
          )}
        </div>
        <div className="p-4 border-t border-yellow-200">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Continue Your Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default YearlyReviewModal;
