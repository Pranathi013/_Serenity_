import React, { useState, useEffect } from 'react';
import type { View } from './Sidebar';
import Scheduler from './Scheduler';

interface HomeScreenProps {
    mood: { name: string; score: number };
    streak: number;
    setCurrentView: (view: View) => void;
    openMoodCheck: () => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isMounted: boolean;
  delay: number;
}> = ({ icon, title, description, onClick, isMounted, delay }) => (
  <div
    onClick={onClick}
    className={`bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="p-3 bg-white/70 rounded-full text-brand-charcoal">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-brand-charcoal">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
  </div>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ mood, streak, setCurrentView, openMoodCheck }) => {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        { icon: <MoodIcon/>, title: "Mood Check", description: "Quick assessment", action: openMoodCheck },
        { icon: <ChatIcon/>, title: "AI Support", description: "Chat with care", action: () => setCurrentView('chat') },
        { icon: <GameIcon/>, title: "Mindful Games", description: "Reduce stress", action: () => setCurrentView('games') },
        { icon: <YogaIcon/>, title: "Yoga & Stretch", description: "Find your flow", action: () => setCurrentView('yoga') },
        { icon: <MusicIcon/>, title: "Calming Sounds", description: "Relax & unwind", action: () => setCurrentView('music') },
        { icon: <BookIcon/>, title: "Wellness Library", description: "Read and reflect", action: () => setCurrentView('books') },
        { icon: <VideoIcon/>, title: "Guided Videos", description: "Watch and relax", action: () => setCurrentView('videos') },
    ];
    
    const streakGoal = 7;
    const currentStreakProgress = streak > 0 ? ((streak - 1) % streakGoal) + 1 : 0;
    const daysRemaining = streakGoal - currentStreakProgress;
    const progressPercent = (currentStreakProgress / streakGoal) * 100;
    
    let streakDescription;
    if (streak === 0) {
        streakDescription = "Complete a mood check to start your streak!";
    } else if (daysRemaining === 0) {
        streakDescription = "Great job! You've earned a new badge.";
    } else {
        streakDescription = `${daysRemaining} more day${daysRemaining > 1 ? 's' : ''} to earn a new badge!`;
    }


    return (
        <div className="p-5 space-y-6 bg-brand-sky-blue min-h-full">
            <header className={`transition-all duration-500 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <h1 className="text-3xl font-bold text-brand-charcoal">Welcome to Serenity! 👋</h1>
                <p className="text-gray-500 mt-1">Let's take care of your wellbeing today</p>
            </header>

            {/* Today's Mood */}
            <div className={`p-4 rounded-xl shadow-sm bg-white transition-all duration-500 ease-out flex items-center space-x-4 ${isMounted ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}>
                 <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                    <p className="text-sm font-medium text-gray-500">Today's Mood</p>
                    <p className="text-xl font-bold text-brand-charcoal">{mood.name}</p>
                 </div>
                 <div className="flex-1 text-right">
                    <p className="font-bold text-2xl text-yellow-500">{mood.score.toFixed(1)}<span className="text-base text-gray-400">/10</span></p>
                 </div>
            </div>

            {/* Streak Tracker */}
            <div className={`bg-white p-4 rounded-xl shadow-sm transition-all duration-500 ease-out ${isMounted ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 -translate-y-4'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                        <StreakIcon />
                        <div>
                            <h3 className="font-semibold text-brand-charcoal">Streak Tracker</h3>
                             <p className="text-sm text-gray-500">{streakDescription}</p>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-brand-blue">{currentStreakProgress}/{streakGoal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-brand-blue h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        onClick={feature.action}
                        isMounted={isMounted}
                        delay={300 + index * 50}
                    />
                ))}
            </div>
        </div>
    );
};

// Icons for Feature Cards
const MoodIcon = () => (
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="10" fill="url(#mood-gradient)"/>
<path d="M8 14C8.913 15.222 10.362 16 12 16C13.638 16 15.087 15.222 16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
<circle cx="9" cy="10" r="1" fill="white"/>
<circle cx="15" cy="10" r="1" fill="white"/>
<defs>
<linearGradient id="mood-gradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
<stop stopColor="#FBBF24"/>
<stop offset="1" stopColor="#F59E0B"/>
</linearGradient>
</defs>
</svg>
);

const ChatIcon = () => (
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 14.5L4 19V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V13C20 14.1046 19.1046 15 18 15H9.5C9.13392 15 8.78253 14.8159 8.58579 14.5858L8.5 14.5Z" fill="url(#chat-gradient)"/>
<defs>
<linearGradient id="chat-gradient" x1="4" y1="3" x2="20" y2="19" gradientUnits="userSpaceOnUse">
<stop stopColor="#38BDF8"/>
<stop offset="1" stopColor="#3B82F6"/>
</linearGradient>
</defs>
</svg>
);

const GameIcon = () => (
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 2L12 6L15 2L18 6L21 2V9L17 12L21 15V22L18 18L15 22L12 18L9 22L6 18L3 22V15L7 12L3 9V2L6 6L9 2Z" stroke="url(#game-stroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<defs>
<linearGradient id="game-stroke" x1="3" y1="2" x2="21" y2="22">
<stop stopColor="#EC4899"/>
<stop offset="1" stopColor="#8B5CF6"/>
</linearGradient>
</defs>
</svg>
);

const YogaIcon = () => (
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="url(#yoga-gradient)"/>
<path d="M12 6C13.1046 6 14 6.89543 14 8C14 9.10457 13.1046 10 12 10C10.8954 10 10 9.10457 10 8C10 6.89543 10.8954 6 12 6Z" fill="white"/>
<path d="M16 11H8C7.44772 11 7 11.4477 7 12V13C7 14.1046 7.89543 15 9 15H15C16.1046 15 17 14.1046 17 13V12C17 11.4477 16.5523 11 16 11Z" fill="white"/>
<path d="M9 15V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
<path d="M15 15V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
<defs>
<linearGradient id="yoga-gradient" x1="2" y1="2" x2="22" y2="22">
<stop stopColor="#22C55E"/>
<stop offset="1" stopColor="#10B981"/>
</linearGradient>
</defs>
</svg>
);

const MusicIcon = () => (
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="8" cy="18" r="3" fill="url(#music-grad-1)"/>
<circle cx="18" cy="16" r="3" fill="url(#music-grad-2)"/>
<path d="M11 18V5.5C11 5.07143 11 4.85714 11.0526 4.68963C11.1448 4.38928 11.3893 4.14483 11.6896 4.05263C11.8571 4 12.0714 4 12.5 4L21 2V13" stroke="url(#music-grad-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<defs>
<linearGradient id="music-grad-1" x1="5" y1="18" x2="11" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#F97316"/><stop offset="1" stopColor="#EA580C"/></linearGradient>
<linearGradient id="music-grad-2" x1="15" y1="16" x2="21" y2="16" gradientUnits="userSpaceOnUse"><stop stopColor="#6366F1"/><stop offset="1" stopColor="#4F46E5"/></linearGradient>
<linearGradient id="music-grad-3" x1="11" y1="2" x2="21" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#D946EF"/></linearGradient>
</defs>
</svg>
);

const BookIcon = () => (
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="5" y="3" width="14" height="18" rx="2" fill="url(#book-gradient)"/>
<path d="M9 7H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
<path d="M9 11H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
<defs>
<linearGradient id="book-gradient" x1="5" y1="3" x2="19" y2="21">
<stop stopColor="#A78BFA"/>
<stop offset="1" stopColor="#F472B6"/>
</linearGradient>
</defs>
</svg>
);

const VideoIcon = () => (
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="3" y="5" width="18" height="14" rx="2" fill="url(#video-gradient)"/>
<path d="M10 9L15 12L10 15V9Z" fill="white"/>
<defs>
<linearGradient id="video-gradient" x1="3" y1="5" x2="21" y2="19">
<stop stopColor="#F43F5E"/>
<stop offset="1" stopColor="#FB923C"/>
</linearGradient>
</defs>
</svg>
);

const StreakIcon = () => (
<svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0122 12c0 3.771-2.583 6.94-6.014 7.743A11.97 11.97 0 0115 20c-1 0-2 .5-2 1.5s1 1.5 2 1.5c2.652 0 5.052-1.018 6.94-2.743" />
</svg>
);

export default HomeScreen;
