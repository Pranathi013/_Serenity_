
import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Game Interfaces & Types ---
interface Game {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium';
  category: string;
  duration: string;
  benefits: string[];
}

type GameState = 'playing' | 'won' | 'completed' | 'lost';

// --- Reusable Game End State Component ---
const GameEndState: React.FC<{
    status: Exclude<GameState, 'playing'>;
    score?: number | string;
    message?: string;
    onRestart: () => void;
}> = ({ status, score, message, onRestart }) => {
    const content = {
        won: { icon: '🎉', title: 'Congratulations!', defaultMessage: 'You did a great job!' },
        completed: { icon: '🧘', title: 'Session Complete', defaultMessage: 'Well done for taking this time for yourself.' },
        lost: { icon: '💪', title: 'Nice Try!', defaultMessage: 'Practice makes progress. Keep going!' }
    };
    const { icon, title, defaultMessage } = content[status];

    return (
        <div className="text-center flex flex-col items-center justify-center h-full animate-fade-in p-4">
            <div className="text-6xl animate-bounce-in" style={{ animationDelay: '100ms' }}>{icon}</div>
            <h3 className="text-3xl font-bold text-brand-gray-darkest mt-4">{title}</h3>
            {score !== undefined && <p className="text-brand-gray text-lg mt-1">Your Score: {score}</p>}
            <p className="text-brand-gray-dark mt-2">{message || defaultMessage}</p>
            <button onClick={onRestart} className="mt-6 py-2.5 px-6 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors">
                Play Again
            </button>
        </div>
    );
};


// --- Individual Game Components ---
interface GameComponentProps {
    onComplete?: () => void;
}

// 1. Breathing Bubbles Game
const BreathingBubblesGame: React.FC = () => {
    const [phase, setPhase] = useState('in'); // 'in', 'hold', 'out'

    const instructions = {
        in: { text: 'Breathe In...', duration: 4000 },
        hold: { text: 'Hold', duration: 4000 },
        out: { text: 'Breathe Out...', duration: 6000 },
    };

    useEffect(() => {
        const cycleLogic = () => {
            setPhase(prev => {
                if (prev === 'in') return 'hold';
                if (prev === 'hold') return 'out';
                return 'in'; // Loop back to 'in'
            });
        };
        const timer = setTimeout(cycleLogic, instructions[phase as keyof typeof instructions].duration);
        return () => clearTimeout(timer);
    }, [phase]);

    const animationClass = phase === 'in' ? 'animate-inhale' : phase === 'out' ? 'animate-exhale' : 'animate-hold';
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <style>{`
                @keyframes inhale { 0% { transform: scale(0.8); } 100% { transform: scale(1.2); } }
                @keyframes exhale { 0% { transform: scale(1.2); } 100% { transform: scale(0.8); } }
                .animate-inhale { animation: inhale 4s ease-in-out forwards; }
                .animate-exhale { animation: exhale 6s ease-in-out forwards; }
                .animate-hold { transform: scale(1.2); }
            `}</style>
            <div className={`relative w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full flex items-center justify-center transition-transform duration-500 ${animationClass}`}>
                <div className="absolute w-full h-full bg-white/30 rounded-full animate-pulse"></div>
                <p className="text-2xl font-semibold text-white z-10">{instructions[phase as keyof typeof instructions].text}</p>
            </div>
            <p className="text-brand-gray-dark mt-6 font-medium">Follow the rhythm. Close the window when you feel ready.</p>
        </div>
    );
};


// 2. Mindful Memory Game
const MindfulMemoryGame: React.FC<GameComponentProps> = ({ onComplete }) => {
    const gameDuration = 45; // 45 seconds
    const symbols = ['🧘', '🌿', '💧', '☀️', '💖', '🕊️', '⭐', '🦋'];
    const createShuffledDeck = useCallback(() => {
        return [...symbols, ...symbols]
            .map((symbol, index) => ({ id: index, symbol, isFlipped: false, isMatched: false }))
            .sort(() => Math.random() - 0.5);
    }, []);
    
    const [cards, setCards] = useState(createShuffledDeck());
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameState, setGameState] = useState<GameState>('playing');
    const [timeLeft, setTimeLeft] = useState(gameDuration);

    useEffect(() => {
        if (flippedIndices.length === 2) {
            const [firstIndex, secondIndex] = flippedIndices;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.symbol === secondCard.symbol) {
                setCards(prev => prev.map(card => (card.id === firstCard.id || card.id === secondCard.id) ? { ...card, isMatched: true } : card));
                setFlippedIndices([]);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map((card, index) => (index === firstIndex || index === secondIndex) ? { ...card, isFlipped: false } : card));
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    }, [flippedIndices, cards]);
    
    useEffect(() => {
        if (gameState === 'playing' && cards.length > 0 && cards.every(c => c.isMatched)) {
            onComplete?.();
            setTimeout(() => setGameState('won'), 500);
        }
    }, [cards, onComplete, gameState]);
    
    useEffect(() => {
        if (gameState !== 'playing' || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timer);
                    if (!cards.every(c => c.isMatched)) {
                        setGameState('lost');
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [gameState, cards]);

    const handleCardClick = (index: number) => {
        if (flippedIndices.length < 2 && !cards[index].isFlipped && gameState === 'playing') {
            setMoves(m => m + 1);
            setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
            setFlippedIndices(prev => [...prev, index]);
        }
    };
    
    const handleRestart = () => {
        setCards(createShuffledDeck());
        setMoves(0);
        setFlippedIndices([]);
        setTimeLeft(gameDuration);
        setGameState('playing');
    };

    if (gameState !== 'playing') {
        const message = gameState === 'won' ? `You finished with ${timeLeft}s left!` : "Time's up! Give it another try.";
        return <GameEndState status={gameState} onRestart={handleRestart} message={message} />;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="flex justify-between w-full max-w-xs mb-4">
                <p className="text-brand-gray text-lg">Moves: {Math.floor(moves/2)}</p>
                <p className="text-brand-gray font-mono text-lg">Time: {timeLeft}s</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div key={card.id} onClick={() => handleCardClick(index)} className="w-20 h-20 cursor-pointer rounded-lg" style={{ perspective: '1000px' }}>
                        <div className={`relative w-full h-full transition-transform duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                            <div className="absolute w-full h-full backface-hidden bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold text-2xl">?</div>
                            <div className="absolute w-full h-full backface-hidden bg-brand-sky-blue rounded-lg flex items-center justify-center text-4xl rotate-y-180">{card.symbol}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Focus Flow Game
const FocusFlowGame: React.FC<GameComponentProps> = ({ onComplete }) => {
    const gameDuration = 50;
    const targetFocusTime = 40;

    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [focusTime, setFocusTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameDuration);
    const [gameState, setGameState] = useState<GameState>('playing');
    const [suggestedGame, setSuggestedGame] = useState<Game | null>(null);

    const isFollowingRef = useRef(false);
    const focusTimeRef = useRef(0); // Ref to use inside timer for accurate check

    useEffect(() => {
        focusTimeRef.current = focusTime;
    }, [focusTime]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        // Main game timer
        const gameTimer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(gameTimer);
                    if (focusTimeRef.current >= targetFocusTime) {
                        onComplete?.();
                        setGameState('won');
                        const otherGames = games.filter(g => g.id !== 'focus-flow');
                        const randomSuggestion = otherGames[Math.floor(Math.random() * otherGames.length)];
                        setSuggestedGame(randomSuggestion);
                    } else {
                        setGameState('lost');
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        // Focus time tracking timer
        const focusTracker = setInterval(() => {
            if (isFollowingRef.current) {
                setFocusTime(ft => ft + 0.1);
            }
        }, 100);

        // Orb movement animation
        let animationFrameId: number;
        let time = 0;
        const animate = () => {
            time += 0.015;
            setPosition({
                x: (Math.sin(time * 0.8) + Math.cos(time * 1.3) + 2) / 4 * 80 + 10,
                y: (Math.cos(time * 0.7) + Math.sin(time * 1.1) + 2) / 4 * 80 + 10,
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        
        return () => {
            clearInterval(gameTimer);
            clearInterval(focusTracker);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, onComplete]);

    const handleRestart = () => {
        setFocusTime(0);
        setTimeLeft(gameDuration);
        setGameState('playing');
        setSuggestedGame(null);
    };
    
    if (gameState === 'won') {
        return (
            <div className="text-center flex flex-col items-center justify-center h-full animate-fade-in p-4">
                <div className="text-6xl animate-bounce-in">🎉</div>
                <h3 className="text-3xl font-bold text-brand-gray-darkest mt-4">Fantastic Focus!</h3>
                <p className="text-brand-gray-dark mt-2">You maintained focus for {focusTime.toFixed(1)} seconds!</p>
                <button onClick={handleRestart} className="mt-6 py-2.5 px-6 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors">
                    Play Again
                </button>
                {suggestedGame && (
                    <div className="mt-6 p-4 bg-brand-gray-lightest rounded-lg w-full max-w-xs text-center">
                        <p className="font-semibold text-brand-gray-dark">Why not try another challenge?</p>
                        <p className="text-lg text-brand-blue mt-1">{suggestedGame.title}</p>
                    </div>
                )}
            </div>
        );
    }

    if (gameState === 'lost') {
        return <GameEndState status="lost" onRestart={handleRestart} message={`You focused for ${focusTime.toFixed(1)}s. The goal was ${targetFocusTime}s.`} />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-brand-gray-darkest mb-2">Keep your cursor on the orb!</h3>
            <div className="flex justify-between w-full max-w-xs mb-2">
                <p className="text-brand-gray">Focus Time: {focusTime.toFixed(1)}s / {targetFocusTime}s</p>
                <p className="text-brand-gray font-mono">Time Left: {timeLeft}s</p>
            </div>
            <div className="w-full max-w-xs h-64 bg-brand-gray-lightest rounded-lg border relative overflow-hidden cursor-crosshair">
                <div 
                    className="absolute w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full shadow-lg"
                    style={{ top: `calc(${position.y}% - 24px)`, left: `calc(${position.x}% - 24px)` }}
                    onMouseEnter={() => (isFollowingRef.current = true)}
                    onMouseLeave={() => (isFollowingRef.current = false)}
                ></div>
            </div>
        </div>
    );
};

// 4. Mood Melody Game
const MoodMelodyGame: React.FC = () => {
    const [notesPlayed, setNotesPlayed] = useState(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const playNote = useCallback((frequency: number) => {
        if (!audioCtxRef.current) {
            try {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser", e);
                return;
            }
        }
        
        const audioCtx = audioCtxRef.current;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 1);
        setNotesPlayed(n => n + 1);
    }, []);

    const notes = [
        { freq: 261.63, color: 'bg-red-400' }, { freq: 293.66, color: 'bg-orange-400' },
        { freq: 329.63, color: 'bg-yellow-400' }, { freq: 349.23, color: 'bg-green-400' },
        { freq: 392.00, color: 'bg-cyan-400' }, { freq: 440.00, color: 'bg-blue-400' },
    ];
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
             <h3 className="text-lg font-semibold text-brand-gray-darkest mb-4">Tap the pads to create your own melody.</h3>
             <div className="grid grid-cols-3 gap-4">
                {notes.map(note => (
                    <button 
                        key={note.freq} 
                        onClick={() => playNote(note.freq)}
                        className={`w-24 h-24 rounded-xl ${note.color} transition-transform active:scale-95 shadow-md hover:shadow-lg`}
                    ></button>
                ))}
             </div>
             <p className="mt-4 text-brand-gray">{notesPlayed} notes played</p>
             <p className="text-brand-gray-dark mt-6 font-medium">Enjoy your creation. Close the window when you feel ready.</p>
        </div>
    );
};

// 5. Gratitude Garden
const GratitudeGardenGame: React.FC = () => {
    const [gratitudes, setGratitudes] = useState<{ text: string; pos: { top: number; left: number; }}[]>([]);
    const [input, setInput] = useState('');
    const flowers = ['🌸', '🌷', '🌻', '🌹', '🌼', '🌺'];

    const addGratitude = () => {
        if (input.trim()) {
            const newGratitudes = [...gratitudes, {
                text: input,
                pos: { top: 20 + Math.random() * 60, left: 10 + Math.random() * 80 }
            }];
            setGratitudes(newGratitudes);
            setInput('');
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-shrink-0 p-2 border-b">
                 <p className="text-center text-sm text-brand-gray mb-2">
                    Plant something you're grateful for. Your garden has {gratitudes.length} flower{gratitudes.length !== 1 ? 's' : ''}.
                 </p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="I'm grateful for..."
                        className="flex-1 px-3 py-2 bg-brand-gray-lightest border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-gray-darkest placeholder:text-brand-gray"
                        onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
                    />
                    <button onClick={addGratitude} className="px-4 py-2 bg-brand-teal text-white font-semibold rounded-lg hover:bg-brand-teal-dark">Plant</button>
                </div>
            </div>
            <div className="flex-1 bg-green-100/50 relative overflow-hidden">
                {gratitudes.map((item, index) => (
                    <div key={index} className="absolute flex flex-col items-center" style={{ top: `${item.pos.top}%`, left: `${item.pos.left}%`, transform: 'translateX(-50%)'}}>
                        <div className="text-4xl cursor-default animate-bounce-in">{flowers[index % flowers.length]}</div>
                        <span className="mt-1 block w-24 overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-black/10 px-2 py-0.5 text-center text-xs font-semibold text-green-900">
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 6. Affirmation Flow Game
const AffirmationFlowGame: React.FC = () => {
    const positiveAffirmationsList = ["You are capable", "You are strong", "You are worthy", "You are enough", "Breathe deeply", "You are resilient", "Choose joy", "You are valued"];
    const negativeAffirmationsList = ["You might fail", "It's too hard", "Give up", "Not good enough", "It's pointless", "Doubt yourself"];
    
    type AffirmationType = 'positive' | 'negative';
    interface Affirmation {
      id: number;
      text: string;
      x: number;
      type: AffirmationType;
    }

    const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<GameState>('playing');
    const [negativeClicks, setNegativeClicks] = useState(0);

    const handleCatch = (id: number, type: AffirmationType) => {
        if (gameState !== 'playing') return;

        if (type === 'positive') {
            setScore(s => s + 100);
        } else {
            const newClicks = negativeClicks + 1;
            setNegativeClicks(newClicks);
            if (newClicks >= 2) {
                setGameState('lost');
            }
        }
        setAffirmations(prev => prev.filter(a => a.id !== id));
    };
    
    useEffect(() => {
        if (gameState !== 'playing') return;

        const spawnInterval = setInterval(() => {
            const isPositive = Math.random() > 0.35; // ~65% positive
            const text = isPositive 
                ? positiveAffirmationsList[Math.floor(Math.random() * positiveAffirmationsList.length)]
                : negativeAffirmationsList[Math.floor(Math.random() * negativeAffirmationsList.length)];

            setAffirmations(prev => [...prev, {
                id: Date.now() + Math.random(),
                text,
                x: 10 + Math.random() * 80,
                type: isPositive ? 'positive' : 'negative',
            }]);
        }, 1200);

        return () => {
            clearInterval(spawnInterval);
        };
    }, [gameState]);


    const handleRestart = () => {
        setScore(0);
        setAffirmations([]);
        setNegativeClicks(0);
        setGameState('playing');
    };

    if (gameState === 'lost') {
        return <GameEndState status="lost" score={score} message="You tapped on 2 negative thoughts. Focus on the positive next time!" onRestart={handleRestart} />;
    }
    
    const animationDuration = 8; // seconds

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <style>{`
                @keyframes float-up { 0% { bottom: -10%; opacity: 1; } 100% { bottom: 110%; opacity: 0; } }
                .animate-float-up { animation: float-up linear forwards; }
            `}</style>
            <div className="flex justify-between w-full max-w-sm mb-2">
                <p className="text-brand-gray">Score: {score}</p>
                <p className="text-red-500 font-semibold">Negative Taps: {negativeClicks}/2</p>
            </div>
            <div className="w-full max-w-sm h-80 bg-brand-sky-blue/50 rounded-lg border relative overflow-hidden">
                {affirmations.map(item => {
                    const buttonClasses = 'bg-white text-brand-gray-darkest font-semibold';

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleCatch(item.id, item.type)}
                            onAnimationEnd={() => setAffirmations(prev => prev.filter(a => a.id !== item.id))}
                            className={`absolute py-2 px-4 rounded-full shadow-md cursor-pointer animate-float-up ${buttonClasses}`}
                            style={{ left: `${item.x}%`, animationDuration: `${animationDuration}s` }}
                        >
                            {item.text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// 7. Doodle Spark Game
const DoodleSparkGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    type DrawMode = 'sparkles' | 'waves' | 'neon';
    const [drawMode, setDrawMode] = useState<DrawMode>('sparkles');

    const particlesRef = useRef<any[]>([]);
    const pointsRef = useRef<any[]>([]);
    const hueRef = useRef(0);
    const isDrawingRef = useRef(false);

    // Effect to clear canvas elements when mode changes
    useEffect(() => {
        particlesRef.current = [];
        pointsRef.current = [];
        // Also clear the canvas immediately for visual feedback
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [drawMode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        class BaseParticle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            life: number;
            maxLife: number;

            constructor(x: number, y: number, hue: number) {
                this.x = x;
                this.y = y;
                this.size = 0;
                this.speedX = 0;
                this.speedY = 0;
                this.color = `hsl(${hue}, 100%, 50%)`;
                this.life = 1;
                this.maxLife = Math.random() * 60 + 40;
            }

            update() { /* to be implemented by child */ }

            draw(context: CanvasRenderingContext2D) {
                context.fillStyle = this.color;
                context.globalAlpha = this.life > 0 ? this.life : 0;
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.fill();
            }
        }

        class SparkleParticle extends BaseParticle {
            constructor(x: number, y: number, hue: number) {
                super(x, y, hue);
                this.size = Math.random() * 5 + 2;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.size *= 0.97;
                this.life -= 1 / this.maxLife;
            }
        }

        class WaveParticle extends BaseParticle {
            angle: number;
            angleSpeed: number;

            constructor(x: number, y: number, hue: number) {
                super(x, y, hue);
                this.size = Math.random() * 4 + 2;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.angle = Math.random() * Math.PI * 2;
                this.angleSpeed = Math.random() * 0.1 + 0.05;
            }

            update() {
                this.x += this.speedX + Math.sin(this.angle) * 1.2;
                this.y += this.speedY + Math.cos(this.angle) * 1.2;
                this.angle += this.angleSpeed;
                this.size *= 0.98;
                this.life -= 1 / this.maxLife;
            }
        }
        
        // Using PointerEvents ensures compatibility with both mouse and touch input.
        const handlePointerDown = () => { isDrawingRef.current = true; };
        const handlePointerUp = () => { isDrawingRef.current = false; };
        
        const handlePointerMove = (e: PointerEvent) => {
            if (!isDrawingRef.current) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            hueRef.current = (hueRef.current + 2) % 360;
            
            if (drawMode === 'sparkles') {
                for (let i = 0; i < 5; i++) {
                    particlesRef.current.push(new SparkleParticle(x, y, hueRef.current));
                }
            } else if (drawMode === 'waves') {
                 for (let i = 0; i < 3; i++) {
                    particlesRef.current.push(new WaveParticle(x, y, hueRef.current));
                }
            } else if (drawMode === 'neon') {
                 pointsRef.current.push({ x, y, life: 120, hue: hueRef.current });
            }
        };

        const animate = () => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (drawMode === 'neon') {
                ctx.shadowBlur = 0;
                ctx.globalCompositeOperation = 'lighter';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                for (let i = 1; i < pointsRef.current.length; i++) {
                    const p1 = pointsRef.current[i - 1];
                    const p2 = pointsRef.current[i];
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = `hsla(${p1.hue}, 100%, 70%, ${p1.life / 120})`;
                    ctx.shadowColor = `hsl(${p1.hue}, 100%, 50%)`;
                    ctx.shadowBlur = 20;
                    ctx.stroke();

                    p1.life--;
                }
                pointsRef.current = pointsRef.current.filter(p => p.life > 0);
                
            } else {
                 ctx.globalCompositeOperation = 'lighter';
                for (let i = 0; i < particlesRef.current.length; i++) {
                    const p = particlesRef.current[i];
                    p.update();
                    p.draw(ctx);
                    if (p.size < 0.2 || p.life <= 0) {
                        particlesRef.current.splice(i, 1);
                        i--;
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };
        
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);
        canvas.addEventListener('pointermove', handlePointerMove);
        
        animate();
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointerleave', handlePointerUp);
            canvas.removeEventListener('pointermove', handlePointerMove);
        };

    }, [drawMode]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center bg-black relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-1 bg-black/40 rounded-full backdrop-blur-sm">
                <button onClick={() => setDrawMode('sparkles')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${drawMode === 'sparkles' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/20'}`}>Sparkles</button>
                <button onClick={() => setDrawMode('waves')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${drawMode === 'waves' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/20'}`}>Waves</button>
                <button onClick={() => setDrawMode('neon')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${drawMode === 'neon' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/20'}`}>Neon</button>
            </div>
            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair"></canvas>
            <p className="absolute bottom-4 text-white/70 font-medium">Draw with your finger or mouse. Close the window when you feel ready.</p>
        </div>
    );
};

// Game Player Modal
const GamePlayer: React.FC<{ game: Game; onClose: () => void; onGameWin: (gameId: string) => void; }> = ({ game, onClose, onGameWin }) => {
    const renderGame = () => {
        const onComplete = () => onGameWin(game.id);

        switch (game.id) {
            case 'breathing-bubbles': return <BreathingBubblesGame />;
            case 'mindful-memory': return <MindfulMemoryGame onComplete={onComplete} />;
            case 'focus-flow': return <FocusFlowGame onComplete={onComplete} />;
            case 'mood-melody': return <MoodMelodyGame />;
            case 'gratitude-garden': return <GratitudeGardenGame />;
            case 'affirmation-flow': return <AffirmationFlowGame />;
            case 'doodle-spark': return <DoodleSparkGame />;
            default:
                return (
                    <div className="text-center p-8">
                        <p className="text-brand-gray">This game is coming soon!</p>
                    </div>
                );
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-brand-gray-darkest flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">{game.icon}</div>
                        {game.title}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-gray-light">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-4 sm:p-6 h-[65vh] flex items-center justify-center overflow-hidden">
                    {renderGame()}
                </div>
            </div>
        </div>
    );
};


// Icons
const BreathingBubblesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" opacity="0.3" /><circle cx="12" cy="12" r="6" opacity="0.6" /><circle cx="12" cy="12" r="2" /></svg>;
const MindfulMemoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01" opacity={0.6} /></svg>;
const FocusFlowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.905 15.092l.02.018a5 5 0 016.15 0l.02-.018" /></svg>;
const MoodMelodyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;
const GratitudeGardenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4a4 4 0 014-4h10a4 4 0 014 4v4M8 21V11a2 2 0 012-2h4a2 2 0 012 2v10M12 11V3m0 0a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" /></svg>;
const AffirmationFlowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /><path d="M12 5V2m0 18v-3" strokeDasharray="2 2" opacity="0.7"/></svg>;
const DoodleSparkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" opacity="0.5" /></svg>;

const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" clipRule="evenodd" /></svg>;
const MeditationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ColorTherapyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const AffirmationStarsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

const games: Game[] = [
    { id: 'breathing-bubbles', icon: <BreathingBubblesIcon />, title: "Breathing Bubbles", description: "Follow the bubble to guide your breath", difficulty: 'Easy', category: 'Breathing', duration: '1 min', benefits: ['Reduces anxiety', 'Improves focus', 'Calms nervous system'] },
    { id: 'mindful-memory', icon: <MindfulMemoryIcon />, title: "Mindful Memory", description: "Match peaceful images while staying present", difficulty: 'Medium', category: 'Mindfulness', duration: '2-5 min', benefits: ['Enhances memory', 'Increases mindfulness', 'Reduces stress'] },
    { id: 'focus-flow', icon: <FocusFlowIcon />, title: "Focus Flow", description: "Follow the orb to train your focus", difficulty: 'Medium', category: 'Focus', duration: '30 sec', benefits: ['Improves concentration', 'Reduces distractions', 'Calms mind'] },
    { id: 'mood-melody', icon: <MoodMelodyIcon />, title: "Mood Melody", description: "Create calming music based on your mood", difficulty: 'Easy', category: 'Creative', duration: '1-5 min', benefits: ['Self-expression', 'Mood regulation', 'Creative outlet'] },
    { id: 'doodle-spark', icon: <DoodleSparkIcon />, title: "Doodle Spark", description: "Draw glowing patterns with your touch", difficulty: 'Easy', category: 'Creative', duration: '1-5 min', benefits: ['Creative expression', 'Mindful focus', 'Relaxing'] },
    { id: 'gratitude-garden', icon: <GratitudeGardenIcon />, title: "Gratitude Garden", description: "Grow a virtual garden of gratitude", difficulty: 'Easy', category: 'Gratitude', duration: '2-5 min', benefits: ['Boosts mood', 'Increases positivity', 'Builds resilience'] },
    { id: 'affirmation-flow', icon: <AffirmationFlowIcon />, title: "Affirmation Flow", description: "Catch positive thoughts as they float by", difficulty: 'Medium', category: 'Positivity', duration: '30 sec', benefits: ['Positive reinforcement', 'Boosts self-esteem', 'Encourages optimism'] },
];

const GameCard: React.FC<{ game: Game; onStartGame: () => void }> = ({ game, onStartGame }) => {
    const difficultyColors = {
        Easy: 'bg-green-100 text-green-800',
        Medium: 'bg-yellow-100 text-yellow-800',
    };
    return (
    <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 flex flex-col">
        <div className="flex items-start space-x-4">
            <div className="p-2 bg-brand-gray-light rounded-lg">{game.icon}</div>
            <div className="flex-1">
                <h3 className="font-bold text-lg text-brand-gray-darkest">{game.title}</h3>
                <p className="text-sm text-brand-gray">{game.description}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2 text-sm flex-wrap gap-y-1">
            <span className={`px-2 py-0.5 font-semibold rounded-full text-xs ${difficultyColors[game.difficulty]}`}>{game.difficulty}</span>
            <span className="px-2 py-0.5 font-semibold rounded-full text-xs bg-gray-200 text-gray-800">{game.category}</span>
            <span className="text-brand-gray text-xs">{game.duration}</span>
        </div>
        <div>
            <p className="font-semibold text-sm mb-1.5 text-brand-gray-darkest">Benefits:</p>
            <div className="flex flex-wrap gap-2">
                {game.benefits.map(benefit => (
                    <span key={benefit} className="px-2 py-1 text-xs bg-brand-blue-light text-brand-blue-dark font-medium rounded-md">{benefit}</span>
                ))}
            </div>
        </div>
        <button onClick={onStartGame} className="w-full mt-2 py-2.5 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center justify-center space-x-2">
            <PlayIcon />
            <span>Start Game</span>
        </button>
    </div>
    );
};

interface GameStats {
    completed: number;
    time: number; // in milliseconds
    playedToday: string[];
    lastReset: number;
}

const GamesScreen: React.FC = () => {
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    const gameStartTimeRef = useRef<number | null>(null);

    const [gamesCompleted, setGamesCompleted] = useState(0);
    const [timePlayed, setTimePlayed] = useState(0); // in milliseconds
    const [playedGamesToday, setPlayedGamesToday] = useState<string[]>([]);
    
    useEffect(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        let stats: GameStats = { completed: 0, time: 0, playedToday: [], lastReset: today };

        try {
            const savedStats = localStorage.getItem('gameStats');
            if (savedStats) {
                const parsedStats: GameStats = JSON.parse(savedStats);
                const lastResetDate = new Date(parsedStats.lastReset || 0);
                const lastResetDay = new Date(lastResetDate.getFullYear(), lastResetDate.getMonth(), lastResetDate.getDate()).getTime();

                if (today > lastResetDay) {
                    // It's a new day, reset daily stats
                    stats = { completed: 0, time: 0, playedToday: [], lastReset: today };
                    localStorage.setItem('gameStats', JSON.stringify(stats));
                } else {
                    // Load existing stats for today
                    stats = parsedStats;
                }
            } else {
                // No stats found, initialize for today
                localStorage.setItem('gameStats', JSON.stringify(stats));
            }
        } catch (error) {
            console.error("Failed to load or parse game stats:", error);
            localStorage.setItem('gameStats', JSON.stringify(stats)); // Reset on error
        }

        setGamesCompleted(stats.completed);
        setTimePlayed(stats.time);
        setPlayedGamesToday(stats.playedToday || []);
    }, []);
    
    const updateLocalStorageStats = (newStats: Partial<GameStats>) => {
        try {
            const savedStats = localStorage.getItem('gameStats');
            const currentStats = savedStats ? JSON.parse(savedStats) : {};
            const updatedStats = { ...currentStats, ...newStats };
            localStorage.setItem('gameStats', JSON.stringify(updatedStats));
        } catch(error) {
            console.error("Failed to update game stats:", error);
        }
    };

    const handleStartGame = (game: Game) => {
        gameStartTimeRef.current = Date.now();
        setActiveGame(game);
    };

    const handleCloseGame = () => {
        if (gameStartTimeRef.current) {
            const elapsed = Date.now() - gameStartTimeRef.current;
            const newTimePlayed = timePlayed + elapsed;
            const newGamesCompleted = gamesCompleted + 1;
            
            setTimePlayed(newTimePlayed);
            setGamesCompleted(newGamesCompleted);
            
            updateLocalStorageStats({ time: newTimePlayed, completed: newGamesCompleted });
            gameStartTimeRef.current = null;
        }
        setActiveGame(null);
    };
    
    const handleGameWin = useCallback((gameId: string) => {
        // Only count wins for challenge games for the daily challenge progress
        const game = games.find(g => g.id === gameId);
        if (game && !['breathing-bubbles', 'mood-melody', 'gratitude-garden', 'doodle-spark'].includes(game.id)) {
            const newPlayedGamesToday = [...new Set([...playedGamesToday, gameId])];
            setPlayedGamesToday(newPlayedGamesToday);
            updateLocalStorageStats({ playedToday: newPlayedGamesToday });
        }
    }, [playedGamesToday]);
    
    const relaxationGames = games.filter(g => ['breathing-bubbles', 'mood-melody', 'gratitude-garden', 'doodle-spark'].includes(g.id));
    const challengeGames = games.filter(g => !['breathing-bubbles', 'mood-melody', 'gratitude-garden', 'doodle-spark'].includes(g.id));

    const dailyChallengeProgress = playedGamesToday.length;
    const dailyChallengeTotal = 3;
    
    return (
        <div className="p-5 space-y-6 bg-brand-sky-blue min-h-full">
            <header className="px-2">
                <h1 className="text-2xl font-bold text-brand-gray-darkest">Mindful Games</h1>
                <p className="text-brand-gray">Play mindful games designed to reduce stress and boost wellbeing</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
                    <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600"><TrophyIcon/></div>
                    <div>
                        <p className="text-2xl font-bold text-brand-gray-darkest">{gamesCompleted}</p>
                        <p className="text-sm text-brand-gray leading-tight">Games Played Today</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600"><ClockIcon/></div>
                    <div>
                        <p className="text-2xl font-bold text-brand-gray-darkest">{Math.floor(timePlayed / 60000)}m</p>
                        <p className="text-sm text-brand-gray leading-tight">Time Played Today</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-brand-gray-darkest">Daily Challenge</h3>
                        <p className="text-sm text-brand-gray">Play 3 different games from Interactive challenges</p>
                    </div>
                    <p className="font-semibold text-brand-gray">{dailyChallengeProgress}/{dailyChallengeTotal}</p>
                </div>
                <div className="w-full bg-brand-gray-light rounded-full h-2 mt-3">
                    <div className="bg-brand-blue h-2 rounded-full" style={{ width: `${(dailyChallengeProgress / dailyChallengeTotal) * 100}%` }}></div>
                </div>
                <p className="text-xs text-brand-gray mt-2">Complete the daily challenge to unlock the "Mindful Explorer" badge!</p>
            </div>

            <section>
                <h2 className="text-xl font-bold text-brand-gray-darkest mb-4 px-2">Relaxation Games</h2>
                <div className="flex overflow-x-auto space-x-4 pb-4 -mx-5 px-5 no-scrollbar">
                    {relaxationGames.map(game => (
                        <div key={game.id} className="flex-shrink-0 w-[85vw] max-w-sm sm:w-96">
                            <GameCard game={game} onStartGame={() => handleStartGame(game)} />
                        </div>
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-xl font-bold text-brand-gray-darkest mb-4 px-2">Interactive Challenges</h2>
                <div className="space-y-4">
                    {challengeGames.map(game => <GameCard key={game.id} game={game} onStartGame={() => handleStartGame(game)} />)}
                </div>
            </section>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-brand-gray-light">
                <div className="text-4xl mb-3">⚡️</div>
                <h3 className="text-lg font-bold text-brand-gray-darkest">More Games Coming Soon!</h3>
                <p className="text-brand-gray text-sm">We're working on exciting new stress-relief games</p>
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-4 text-sm text-brand-gray-dark">
                    <div className="flex items-center space-x-1.5"><MeditationIcon/> <span>Meditation Quest</span></div>
                    <span className="text-brand-gray-light hidden sm:inline">•</span>
                    <div className="flex items-center space-x-1.5"><ColorTherapyIcon/> <span>Color Therapy</span></div>
                     <span className="text-brand-gray-light hidden sm:inline">•</span>
                    <div className="flex items-center space-x-1.5"><AffirmationStarsIcon/> <span>Affirmation Stars</span></div>
                </div>
            </div>
            {activeGame && <GamePlayer game={activeGame} onClose={handleCloseGame} onGameWin={handleGameWin} />}
            
            <style>{`
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                @keyframes fade-in { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes bounce-in { 
                    0% { transform: scale(0.5); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default GamesScreen;
