import React, { useState, useEffect, useRef } from 'react';

export type View = 'home' | 'chat' | 'games' | 'yoga' | 'music' | 'books' | 'videos' | 'profile' | 'scheduler';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  openScheduler: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-brand-blue' : 'text-brand-gray hover:text-brand-blue-dark'
    }`}
    aria-label={label}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, openScheduler }) => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setIsResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResourceClick = (view: 'books' | 'videos') => {
    setCurrentView(view);
    setIsResourcesOpen(false);
  };
  
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon isActive={currentView === 'home'} /> },
    { id: 'chat', label: 'Chat', icon: <ChatIcon isActive={currentView === 'chat'} /> },
    { id: 'games', label: 'Games', icon: <GameIcon isActive={currentView === 'games'} /> },
    { id: 'yoga', label: 'Yoga', icon: <YogaIcon isActive={currentView === 'yoga'} /> },
  ];

  const isResourcesActive = currentView === 'books' || currentView === 'videos';

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
        
        <NavItem
            key="scheduler"
            icon={<SchedulerIcon isActive={false} />}
            label="Schedule"
            isActive={false} // It's a modal, not a view, so it's never "active"
            onClick={openScheduler}
        />

        <div className="relative" ref={resourcesRef}>
          {isResourcesOpen && (
            <div className="absolute bottom-full mb-3 w-40 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl border border-brand-gray-light p-2 space-y-1 z-10">
              <button 
                onClick={() => handleResourceClick('books')} 
                className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-brand-gray-lightest ${currentView === 'books' ? 'text-brand-blue font-semibold' : 'text-brand-gray-darkest'}`}
              >
                <BookIcon isActive={currentView === 'books'} />
                <span>Books</span>
              </button>
              <button 
                onClick={() => handleResourceClick('videos')} 
                className={`w-full text-left flex items-center space-x-3 p-2 rounded-md hover:bg-brand-gray-lightest ${currentView === 'videos' ? 'text-brand-blue font-semibold' : 'text-brand-gray-darkest'}`}
              >
                <VideoIcon isActive={currentView === 'videos'} />
                <span>Videos</span>
              </button>
            </div>
          )}
          <NavItem
            icon={<ResourcesIcon isActive={isResourcesActive} />}
            label="Resources"
            isActive={isResourcesActive}
            onClick={() => setIsResourcesOpen(prev => !prev)}
          />
        </div>
        
        <NavItem
          key="profile"
          icon={<ProfileIcon isActive={currentView === 'profile'} />}
          label="Profile"
          isActive={currentView === 'profile'}
          onClick={() => setCurrentView('profile')}
        />
      </div>
    </div>
  );
};

// SVG Icons with isActive prop for fill/stroke changes
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const GameIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill={isActive ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);
const YogaIcon = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill={isActive ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M9 15.75a3.75 3.75 0 1 0 6 0"></path>
        <path d="M9 12h6"></path>
        <path d="M11.25 12a1.5 1.5 0 1 0 -3 0a1.5 1.5 0 0 0 3 0z"></path>
        <path d="M12.75 12a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1 -3 0z"></path>
    </svg>
);
const SchedulerIcon = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill={isActive ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
const BookIcon = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const VideoIcon = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8l-6 4 6 4V8z"></path><path d="M14 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"></path></svg>
);
const ResourcesIcon = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
);
const ProfileIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export default BottomNav;
