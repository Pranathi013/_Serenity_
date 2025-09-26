import React, { useState, useCallback, useEffect } from 'react';
import BottomNav, { View } from './Sidebar'; // NOTE: Sidebar.tsx is repurposed as BottomNav.tsx
import HomeScreen from './WellnessHub';     // NOTE: WellnessHub.tsx is repurposed as HomeScreen.tsx
import Chatbot from './Chatbot';
import GamesScreen from './Journal';         // NOTE: Journal.tsx is repurposed as GamesScreen.tsx
import MusicScreen from './MoodGraph';      // NOTE: MoodGraph.tsx is repurposed as MusicScreen.tsx
import ProfileScreen from './Support';      // NOTE: Support.tsx is repurposed as ProfileScreen.tsx
import MoodCheck from './MoodQuiz';         // NOTE: MoodQuiz.tsx is updated to be MoodCheck.tsx
import BooksScreen from './BooksScreen';
import VideosScreen from './VideosScreen';
import Scheduler from './Scheduler';
import { analyzeMood } from '../services/geminiService';
import { MoodAnalysisResult, Achievement, ParentalControlsSettings } from '../types';
import YearlyReviewModal from './YearlyReviewModal';

// --- New Timer Control Icons ---
const PlayIconTimer = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" /></svg>;
const PauseIconTimer = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg>;
const ResetIconTimer = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>;

// --- PosePlayer Component with Instructions ---
const PosePlayer: React.FC<{ pose: YogaPose; onClose: () => void }> = ({ pose, onClose }) => {
  const getDurationInSeconds = useCallback((duration: string) => {
    const numbers = duration.match(/\d+/g);
    if (!numbers) return 60;
    const maxMinutes = parseInt(numbers[numbers.length - 1], 10);
    return isNaN(maxMinutes) ? 60 : maxMinutes * 60;
  }, []);
  
  const durationInSeconds = getDurationInSeconds(pose.duration);
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    if (isPaused || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  const handlePlayPause = () => {
    if (timeLeft > 0) {
      setIsPaused(prev => !prev);
    }
  };

  const handleReset = () => {
    setTimeLeft(durationInSeconds);
    setIsPaused(true);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl text-center p-6 sm:p-8 my-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-gray-darkest">{pose.title}</h2>
        <p className="text-brand-gray mb-4">{pose.sanskrit}</p>
        <div className="my-4 font-mono text-7xl font-bold text-brand-blue">
          {formatTime(timeLeft)}
        </div>
        
        <div className="my-4 flex flex-col md:flex-row md:gap-6 items-center">
            <img 
                src={pose.imageUrl} 
                alt={`Illustration of ${pose.title}`}
                className="w-full md:w-1/2 h-auto object-contain rounded-lg shadow-md"
            />
            <div className="flex-1 text-left bg-brand-gray-lightest p-4 rounded-lg border border-brand-gray-light mt-4 md:mt-0">
                <p className="font-semibold text-md mb-2 text-brand-gray-darkest">Instructions:</p>
                <ol className="list-decimal list-inside text-sm text-brand-gray-dark space-y-2">
                    {pose.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
            </div>
        </div>
        
        <div className="flex justify-center items-center space-x-8 my-5">
            <button
                onClick={handlePlayPause}
                className="p-3 bg-brand-gray-light rounded-full text-brand-gray-darkest hover:bg-brand-gray-light/70 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue"
                aria-label={isPaused ? "Play" : "Pause"}
            >
                {isPaused ? <PlayIconTimer /> : <PauseIconTimer />}
            </button>
            <button
                onClick={handleReset}
                className="p-3 bg-brand-gray-light rounded-full text-brand-gray-darkest hover:bg-brand-gray-light/70 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue"
                aria-label="Reset"
            >
               <ResetIconTimer />
            </button>
        </div>


        <button onClick={onClose} className="w-full mt-2 py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors">
          End Pose
        </button>
      </div>
    </div>
  );
};


// --- YogaScreen Component Definition ---
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface YogaPose {
  icon: string;
  title: string;
  sanskrit: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  benefits: string[];
  instructions: string[];
  category: 'Grounding & Calming' | 'Mood-Boosting & Energizing' | 'Anxiety-Reducing Twists & Inversions';
  imageUrl: string;
}

const PoseCard: React.FC<{ pose: YogaPose; onStart: () => void }> = ({ pose, onStart }) => {
  const levelColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-gray-light flex flex-col">
      <h3 className="font-bold text-lg text-brand-gray-darkest flex items-center">
        <span className="text-2xl mr-2">{pose.icon}</span>
        <div>
          {pose.title}
          <span className="block text-sm font-normal text-brand-gray">{pose.sanskrit}</span>
        </div>
      </h3>
      <div className="flex items-center space-x-2 my-2">
        <span className={`px-2 py-0.5 font-semibold rounded-full text-xs ${levelColors[pose.level]}`}>{pose.level}</span>
        <span className="text-sm text-brand-gray">{pose.duration}</span>
      </div>
      <div className="my-3 flex-1">
        <p className="font-semibold text-sm mb-1.5 text-brand-gray-darkest">Benefits:</p>
        <p className="text-sm text-brand-gray-dark">{pose.benefits.join(' ')}</p>
      </div>
      <button onClick={onStart} className="w-full mt-3 py-2.5 px-4 text-brand-blue font-semibold rounded-lg bg-brand-blue-light/50 hover:bg-brand-blue-light transition-colors flex items-center justify-center">
        <PlayIcon /> Start Pose
      </button>
    </div>
  );
};


const YogaScreen: React.FC = () => {
    const [activePose, setActivePose] = useState<YogaPose | null>(null);

    const poses: YogaPose[] = [
      // Grounding & Calming Asanas
      { icon: '👶', title: "Child's Pose", sanskrit: 'Balasana', level: 'Beginner', duration: '2-3 min', benefits: ['Gently releases tension in the back, neck, and shoulders, promoting a sense of safety and calm.'], instructions: ['Kneel on the floor with knees hip-width apart and big toes touching.', 'Sit back on your heels and fold forward, resting your torso between your thighs.', 'Rest your forehead on the ground and extend your arms forward or rest them alongside your body, palms up.', 'Breathe deeply into your back, holding the pose and releasing stress with each exhale.'], category: 'Grounding & Calming', imageUrl: 'https://pocketyoga.com/assets/images/full/ChildTraditional.png' },
      { icon: '🧘', title: 'Corpse Pose', sanskrit: 'Shavasana', level: 'Beginner', duration: '5-10 min', benefits: ['Promotes deep relaxation, calms the nervous system, and helps integrate the benefits of the practice.'], instructions: ['Lie flat on your back with your legs straight and arms at your sides, palms facing up.', 'Allow your feet to fall open naturally.', 'Close your eyes and release control of your breath.', 'Bring your awareness to each part of your body, consciously releasing any tension.'], category: 'Grounding & Calming', imageUrl: 'https://pocketyoga.com/assets/images/full/Corpse.png' },
      { icon: '🔄', title: 'Supine Spinal Twist', sanskrit: 'Supta Matsyendrasana', level: 'Beginner', duration: '1-2 min per side', benefits: ['Releases spinal tension, calms the mind, and aids in digestion.'], instructions: ['Lie on your back and draw both knees into your chest.', 'Extend your left leg long and keep your right knee hugged in.', 'Extend your right arm out to the side.', 'Gently guide your right knee across your body to the left, keeping your shoulders on the floor.', 'Hold the stretch, then repeat on the other side.'], category: 'Grounding & Calming', imageUrl: 'https://pocketyoga.com/assets/images/full/SupineSpinalTwist_L.png' },
      { icon: '😄', title: 'Happy Baby', sanskrit: 'Ananda Balasana', level: 'Beginner', duration: '1-2 min', benefits: ['Gently stretches the inner thighs and groin, relieves lower back pain, and can evoke a playful sense of joy.'], instructions: ['Lie on your back and draw your knees toward your chest.', 'Grasp the outsides of your feet with your hands, opening your knees wider than your torso.', 'Gently rock from side to side to massage your spine.', 'Keep your lower back pressed into the floor.'], category: 'Grounding & Calming', imageUrl: 'https://pocketyoga.com/assets/images/full/BlissfulBaby.png' },
      { icon: '🧎', title: 'Seated Forward Bend', sanskrit: 'Paschimottanasana', level: 'Beginner', duration: '2-3 min', benefits: ['Stretches the spine and hamstrings, calms the brain, and helps relieve stress and mild depression.'], instructions: ['Sit on the floor with your legs extended in front of you.', 'Inhale and lengthen your spine.', 'Exhale and hinge at your hips, folding your torso over your legs.', 'Hold onto your shins, ankles, or feet, keeping your back as straight as possible.', 'Breathe deeply into the stretch.'], category: 'Grounding & Calming', imageUrl: 'https://pocketyoga.com/assets/images/full/SeatedForwardBend.png' },
      
      // Mood-Boosting & Energizing Asanas
      { icon: '🌉', title: 'Bridge Pose', sanskrit: 'Setu Bandhasana', level: 'Beginner', duration: '1-2 min', benefits: ['Gently opens the chest and heart, which can alleviate mild depression and anxiety and boost energy.'], instructions: ['Lie on your back with knees bent, feet flat on the floor hip-width apart.', 'Place your arms alongside your body, palms down.', 'Press into your feet and lift your hips off the floor.', 'Clasp your hands together underneath your back, rolling your shoulders under.', 'Hold the pose, breathing steadily.'], category: 'Mood-Boosting & Energizing', imageUrl: 'https://pocketyoga.com/assets/images/full/Bridge.png' },
      { icon: '🐍', title: 'Cobra Pose', sanskrit: 'Bhujangasana', level: 'Beginner', duration: '1 min', benefits: ['Opens the heart and lungs, energizes the body, and helps to relieve stress and fatigue.'], instructions: ['Lie on your stomach with your forehead on the floor and hands under your shoulders.', 'Keep the tops of your feet pressed into the mat.', 'Inhale and lift your chest off the floor, keeping your lower ribs on the ground.', 'Keep your shoulders relaxed and away from your ears.', 'Exhale to release back down.'], category: 'Mood-Boosting & Energizing', imageUrl: 'https://pocketyoga.com/assets/images/full/CobraFull.png' },
      { icon: '🌙', title: 'Half Moon', sanskrit: 'Ardha Chandrasana', level: 'Intermediate', duration: '1 min per side', benefits: ['Improves balance and coordination, energizes the body, and builds confidence.'], instructions: ['From Triangle Pose, bend your front knee and place your fingertips on the floor in front of you.', 'Straighten your front leg as you lift your back leg parallel to the floor.', 'Rotate your chest open to the side and extend your top arm towards the sky.', 'Hold your balance, then repeat on the other side.'], category: 'Mood-Boosting & Energizing', imageUrl: 'https://pocketyoga.com/assets/images/full/HalfMoon_L.png' },
      { icon: '🌳', title: 'Tree Pose', sanskrit: 'Vrikshasana', level: 'Beginner', duration: '1 min per side', benefits: ['Builds focus and concentration, improves balance, and promotes a sense of stability and grounding.'], instructions: ['Stand tall and shift your weight onto one foot.', 'Place the sole of your other foot on your inner thigh, calf, or ankle (avoid the knee).', 'Bring your hands to your heart in a prayer position.', 'Find a focal point to gaze at to maintain balance.', 'Hold, then switch sides.'], category: 'Mood-Boosting & Energizing', imageUrl: 'https://pocketyoga.com/assets/images/full/TreePrayer_R.png' },
      { icon: '⛰️', title: 'Mountain Pose', sanskrit: 'Tadasana', level: 'Beginner', duration: '1-2 min', benefits: ['Improves posture, firms muscles, and establishes a foundation of stillness and focus for your practice.'], instructions: ['Stand with your big toes touching and heels slightly apart.', 'Ground down through all four corners of your feet.', 'Engage your thighs and lengthen your tailbone toward the floor.', 'Roll your shoulders back and down, keeping arms by your sides.', 'Breathe steadily and stand tall.'], category: 'Mood-Boosting & Energizing', imageUrl: 'https://pocketyoga.com/assets/images/full/MountainArmsUp.png' },
      
      // Anxiety-Reducing Twists & Inversions
      { icon: '🔺', title: 'Revolved Triangle', sanskrit: 'Parivritta Trikonasana', level: 'Intermediate', duration: '1 min per side', benefits: ['A deep twist that can release nervous tension and improve focus and balance.'], instructions: ['Step your feet wide apart, turning your front foot out 90 degrees.', 'Hinge at your hips and bring your opposite hand to the floor or a block, inside or outside your front foot.', 'Extend your other arm toward the sky, twisting your torso.', 'Gaze up at your top hand if comfortable.', 'Hold, then repeat on the other side.'], category: 'Anxiety-Reducing Twists & Inversions', imageUrl: 'https://pocketyoga.com/assets/images/full/TriangleRevolved_L.png' },
      { icon: '🕯️', title: 'Supported Shoulder Stand', sanskrit: 'Salamba Sarvangasana', level: 'Advanced', duration: '2-5 min', benefits: ['Calms the nervous system, reduces fatigue, and can help alleviate symptoms of anxiety.'], instructions: ['Lie on your back with a folded blanket under your shoulders.', 'Lift your legs and hips off the floor, supporting your lower back with your hands.', 'Walk your hands up your back towards your shoulders, lifting your torso perpendicular to the floor.', 'Keep your neck relaxed and gaze toward your chest.', 'To release, slowly roll down one vertebra at a time.'], category: 'Anxiety-Reducing Twists & Inversions', imageUrl: 'https://pocketyoga.com/assets/images/full/ShoulderstandSupported.png' },
      { icon: '🚜', title: 'Plow Pose', sanskrit: 'Halasana', level: 'Advanced', duration: '2-5 min', benefits: ['Reduces stress and fatigue by calming the brain and stimulating the parasympathetic nervous system.'], instructions: ['From Shoulder Stand, slowly lower your legs over your head until your toes touch the floor behind you.', 'Keep your legs straight and your torso perpendicular to the floor.', 'You can keep your hands on your back for support or clasp them on the floor.', 'Breathe deeply into your back.', 'To release, slowly roll out of the pose.'], category: 'Anxiety-Reducing Twists & Inversions', imageUrl: 'https://pocketyoga.com/assets/images/full/Plow.png' },
      { icon: '🧱', title: 'Legs-Up-the-Wall Pose', sanskrit: 'Viparita Karani', level: 'Beginner', duration: '5-10 min', benefits: ['A deeply restorative pose that calms the nervous system, relieves tired legs, and reduces anxiety.'], instructions: ['Sit sideways next to a wall.', 'Swing your legs up the wall as you lie back on the floor.', 'Adjust your position so your sitting bones are close to the wall.', 'Rest your arms by your sides, palms up.', 'Close your eyes and relax completely.'], category: 'Anxiety-Reducing Twists & Inversions', imageUrl: 'https://pocketyoga.com/assets/images/full/Hero.png' },
      { icon: '🧘‍♀️', title: 'Hero Pose', sanskrit: 'Virasana', level: 'Intermediate', duration: '2-3 min', benefits: ['Stretches the thighs and ankles while promoting a meditative state of calm and introspection.'], instructions: ['Kneel on the floor with your knees together and your feet slightly wider than your hips.', 'Sit back between your feet. Use a block or cushion if this is uncomfortable.', 'Rest your hands on your thighs, palms down.', 'Sit tall, lengthen your spine, and breathe deeply.', 'Hold the pose, focusing on your breath.'], category: 'Anxiety-Reducing Twists & Inversions', imageUrl: 'https://pocketyoga.com/assets/images/full/WarriorIIReverse_L.png' },
    ];
    
    const categories: YogaPose['category'][] = [
        'Grounding & Calming',
        'Mood-Boosting & Energizing',
        'Anxiety-Reducing Twists & Inversions'
    ];

    const categoryEmojis = {
        'Grounding & Calming': '🌿',
        'Mood-Boosting & Energizing': '🌞',
        'Anxiety-Reducing Twists & Inversions': '🌀'
    };
    
    return (
        <div className="p-5 space-y-8 bg-brand-sky-blue min-h-full">
            <header className="px-2 text-center">
                <h1 className="text-2xl font-bold text-brand-gray-darkest">Yoga for Mental Health</h1>
                <p className="text-brand-gray max-w-xl mx-auto">Select a practice to align your mind and body.</p>
            </header>
            
            {categories.map(category => (
                 <section key={category}>
                    <h2 className="text-xl font-bold text-brand-gray-darkest mb-4 px-2">{categoryEmojis[category]} {category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {poses.filter(p => p.category === category).map(pose => (
                            <PoseCard key={pose.title} pose={pose} onStart={() => setActivePose(pose)} />
                        ))}
                    </div>
                </section>
            ))}
            
            {activePose && <PosePlayer pose={activePose} onClose={() => setActivePose(null)} />}
        </div>
    );
};
// --- End of YogaScreen Definition ---

// --- Emergency Alert Modal ---
const EmergencyAlertModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [contacts, setContacts] = useState<{ name: string, phone: string }[]>([]);
    const [parentalSettings, setParentalSettings] = useState<ParentalControlsSettings | null>(null);
    const prewrittenMessage = "I'm using the Serenity app and I'm not feeling well. My mood score was very low. Could you please check in on me?";
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        try {
            const savedContacts = localStorage.getItem('emergencyContacts');
            if (savedContacts) {
                setContacts(JSON.parse(savedContacts).filter((c: { name: string, phone: string }) => c.phone.trim() !== ''));
            }
            const savedParentalSettings = localStorage.getItem('parentalControls');
            if (savedParentalSettings) {
                const parsed = JSON.parse(savedParentalSettings);
                if (parsed.enabled) {
                    setParentalSettings(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to load emergency data:", error);
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(prewrittenMessage).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
        });
    };
    
    const handleNotifyParent = () => {
        if (parentalSettings) {
            alert(`An alert has been sent to ${parentalSettings.parentName} at ${parentalSettings.parentContact}. They will be encouraged to check in with you.`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-red-50 rounded-2xl shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-red-700 hover:bg-red-200 transition-colors z-10" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-6 text-center border-b border-red-200">
                    <h2 className="text-xl font-bold text-red-600">You Are Not Alone</h2>
                    <p className="text-red-800 mt-2">It looks like you're going through a very tough time. Please reach out for support.</p>
                </div>

                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Professional Help */}
                    <div className="bg-red-100 p-4 rounded-lg text-center">
                        <h3 className="font-semibold text-red-800">Professional Help Is Available</h3>
                        <p className="text-sm text-red-700 mt-1">If you are in crisis, please call or text for immediate support.</p>
                        <a href="tel:988" className="mt-3 inline-block w-full py-2.5 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                            Call 988 Crisis & Suicide Lifeline
                        </a>
                    </div>
                    
                    {/* Parent/Guardian Alert */}
                    {parentalSettings && (
                        <div className="bg-red-100 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-red-800">Notify Parent/Guardian</h3>
                            <p className="text-sm text-red-700 mt-1">You can alert your linked parent/guardian that you are struggling.</p>
                            <button onClick={handleNotifyParent} className="mt-3 inline-block w-full py-2.5 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                                Notify {parentalSettings.parentName}
                            </button>
                        </div>
                    )}
                    
                    {/* User's Contacts */}
                    {contacts.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-red-800 mb-2">Your Emergency SOS Contacts</h3>
                            <div className="space-y-2">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="bg-red-100 p-3 rounded-lg flex justify-between items-center">
                                        <span className="font-medium text-red-900">{contact.name || `Contact #${index + 1}`}</span>
                                        <a href={`tel:${contact.phone}`} className="py-1 px-3 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700">
                                            Call
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Pre-written Message */}
                    <div>
                        <h3 className="font-semibold text-red-800 mb-2">Send a Message</h3>
                        <div className="p-3 bg-red-100 text-sm text-red-900 rounded-lg">
                            {prewrittenMessage}
                        </div>
                        <button onClick={handleCopy} className="w-full mt-2 py-2 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">
                            {copySuccess || 'Copy Message to Clipboard'}
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-red-200">
                    <button onClick={onClose} className="w-full py-2.5 px-4 text-red-800 font-medium rounded-lg hover:bg-red-200 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isMoodCheckOpen, setIsMoodCheckOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isEmergencyAlertOpen, setIsEmergencyAlertOpen] = useState(false);
  const [mood, setMood] = useState<{ name: string; score: number }>({
    name: 'Calm & Focused',
    score: 8.2,
  });
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isYearlyReviewOpen, setIsYearlyReviewOpen] = useState(false);
  const [reviewAchievements, setReviewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Load achievements and handle yearly review
    try {
      const savedAchievements = localStorage.getItem('userAchievements');
      if (savedAchievements) {
        const allAchievements: Achievement[] = JSON.parse(savedAchievements);
        setAchievements(allAchievements);

        // Yearly Review Logic
        if (allAchievements.length > 0) {
            const now = new Date().getTime();
            const oneYearInMillis = 365 * 24 * 60 * 60 * 1000;
            
            let reminderData;
            try {
                const savedData = localStorage.getItem('yearlyReminderData');
                reminderData = savedData ? JSON.parse(savedData) : null;
            } catch (e) {
                console.error("Failed to parse yearlyReminderData", e);
                reminderData = null;
            }

            if (!reminderData || !reminderData.lastShownTimestamp) {
                // First time logic: set the baseline timestamp for the next check.
                localStorage.setItem('yearlyReminderData', JSON.stringify({ lastShownTimestamp: now }));
            } else {
                const lastShown = reminderData.lastShownTimestamp;
                if (now - lastShown >= oneYearInMillis) {
                    const lastYearAchievements = allAchievements.filter((ach: Achievement) => {
                        const achDate = new Date(ach.date).getTime();
                        return (now - achDate) <= oneYearInMillis;
                    });

                    if (lastYearAchievements.length > 0) {
                        setReviewAchievements(lastYearAchievements);
                        setIsYearlyReviewOpen(true);
                        localStorage.setItem('yearlyReminderData', JSON.stringify({ lastShownTimestamp: now }));
                    } else {
                        // If no new achievements, still update timestamp to avoid re-checking on every load
                        localStorage.setItem('yearlyReminderData', JSON.stringify({ lastShownTimestamp: now }));
                    }
                }
            }
        }
      } else {
          setAchievements([]);
      }
    } catch (error) {
      console.error("Failed to load achievements:", error);
    }

    // Load streak data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const savedData = localStorage.getItem('streakData');
        if (savedData) {
            const { currentStreak, lastActivityTimestamp } = JSON.parse(savedData);
            if (lastActivityTimestamp) {
                const lastActivityDate = new Date(lastActivityTimestamp);
                lastActivityDate.setHours(0, 0, 0, 0);

                const diffTime = today.getTime() - lastActivityDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 1) {
                    setStreak(0);
                    localStorage.setItem('streakData', JSON.stringify({ currentStreak: 0, lastActivityTimestamp: null }));
                } else {
                    setStreak(currentStreak);
                }
            } else {
                 setStreak(0);
            }
        }
    } catch (error) {
        console.error("Failed to parse streak data:", error);
        setStreak(0);
    }
  }, []);

  const handleMoodCheckSubmit = useCallback(async (answers: {
    feeling: number;
    activities: string[];
    triggers: string[];
    notes: string;
  }): Promise<MoodAnalysisResult | null> => {
    try {
      const result = await analyzeMood(answers);
      if (result) {
        setMood({ name: result.moodName, score: result.moodScore });
        
        // Trigger Emergency SOS if mood is critically low
        if (result.moodScore <= 1) {
            setIsEmergencyAlertOpen(true);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let newStreak = 1;
        const savedData = localStorage.getItem('streakData');

        if (savedData) {
            const { currentStreak, lastActivityTimestamp } = JSON.parse(savedData);
            if (lastActivityTimestamp) {
                const lastActivityDate = new Date(lastActivityTimestamp);
                lastActivityDate.setHours(0, 0, 0, 0);

                const diffTime = today.getTime() - lastActivityDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    newStreak = currentStreak + 1;
                } else if (diffDays === 0) {
                    newStreak = currentStreak; // No change if already checked in today
                }
            }
        }
        
        setStreak(newStreak);
        localStorage.setItem('streakData', JSON.stringify({ currentStreak: newStreak, lastActivityTimestamp: new Date().getTime() }));
        return result;
      }
      return null;
    } catch (error) {
      console.error("Mood analysis failed:", error);
      return null;
    }
  }, []);
  
  const handleContinueToChat = useCallback((result: MoodAnalysisResult) => {
    const message = `I just did a mood check-in. The analysis says my mood is "${result.moodName}" with a score of ${result.moodScore.toFixed(1)}/10. Can we talk about this?`;
    setChatInitialMessage(message);
    setIsMoodCheckOpen(false);
    setCurrentView('chat');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-brand-sky-blue">
      <main className="flex-1 overflow-y-auto pb-20" style={{ display: currentView === 'chat' ? 'none' : 'block' }}>
        <div style={{ display: currentView === 'home' ? 'block' : 'none' }}>
            <HomeScreen mood={mood} streak={streak} setCurrentView={setCurrentView} openMoodCheck={() => setIsMoodCheckOpen(true)} />
        </div>
        <div style={{ display: currentView === 'games' ? 'block' : 'none' }}>
            <GamesScreen />
        </div>
        <div style={{ display: currentView === 'yoga' ? 'block' : 'none' }}>
            <YogaScreen />
        </div>
        <div style={{ display: currentView === 'music' ? 'block' : 'none' }}>
            <MusicScreen />
        </div>
        <div style={{ display: currentView === 'books' ? 'block' : 'none' }}>
            <BooksScreen />
        </div>
        <div style={{ display: currentView === 'videos' ? 'block' : 'none' }}>
            <VideosScreen />
        </div>
        <div style={{ display: currentView === 'profile' ? 'block' : 'none' }}>
            <ProfileScreen onLogout={onLogout} />
        </div>
      </main>

      {currentView === 'chat' && (
        <Chatbot 
            initialMessage={chatInitialMessage} 
            onTriggerEmergency={() => setIsEmergencyAlertOpen(true)}
            achievements={achievements}
        />
      )}

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} openScheduler={() => setIsSchedulerOpen(true)} />
      {isMoodCheckOpen && <MoodCheck onSubmit={handleMoodCheckSubmit} onClose={() => setIsMoodCheckOpen(false)} onContinueToChat={handleContinueToChat} />}
      {isEmergencyAlertOpen && <EmergencyAlertModal onClose={() => setIsEmergencyAlertOpen(false)} />}
      {isSchedulerOpen && <Scheduler onClose={() => setIsSchedulerOpen(false)} />}
      {isYearlyReviewOpen && <YearlyReviewModal achievements={reviewAchievements} onClose={() => setIsYearlyReviewOpen(false)} />}
    </div>
  );
};

export default Dashboard;