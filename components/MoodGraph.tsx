import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Track {
    title: string;
    artist: string;
    duration: string;
    url: string;
}

const tracks: Track[] = [
    { title: "Forest Lullaby", artist: "Lesfm", duration: "2:14", url: "https://cdn.pixabay.com/download/audio/2024/10/28/audio_6438122991.mp3" },
    { title: "Just Relax", artist: "Lesfm", duration: "2:40", url: "https://cdn.pixabay.com/download/audio/2021/11/23/audio_64b2dd1bce.mp3?filename=just-relax-11157.mp3" },
    { title: "Ambient Classical Guitar", artist: "William King", duration: "2:41", url: "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3"},
    { title: "Lofi Chill", artist: "BoDleasons", duration: "3:19", url: "https://cdn.pixabay.com/download/audio/2025/09/16/audio_2bc98dbf8b.mp3?filename=lofi-lofi-chill-405232.mp3" },
    { title: "Ocean Waves", artist: "Ashot-Danielyan", duration: "4:00", url: "https://cdn.pixabay.com/download/audio/2025/07/21/audio_60af8c021d.mp3?filename=ocean-wave-loops-377890.mp3" },
    { title: "Peaceful Garden", artist: "Asepirawan", duration: "2:36", url: "https://cdn.pixabay.com/download/audio/2023/09/05/audio_6edf3c79bd.mp3?filename=peaceful-garden-music-with-birdsx27-sounds-165222.mp3" },
];

const MusicScreen: React.FC = () => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const currentTrack = tracks[currentTrackIndex];
    
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(error => console.error("Audio play failed:", error));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrackIndex]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNextTrack = useCallback(() => {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    }, []);

    const handlePrevTrack = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    };
    
    const handleTrackSelect = (index: number) => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };
    
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressBarRef.current && audioRef.current) {
            const progressBar = progressBarRef.current;
            const clickPositionX = e.clientX - progressBar.getBoundingClientRect().left;
            const progressBarWidth = progressBar.clientWidth;
            const newTime = (clickPositionX / progressBarWidth) * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div className="p-5 min-h-full bg-brand-sky-blue">
            <audio
                ref={audioRef}
                src={currentTrack.url}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={handleNextTrack}
                preload="metadata"
            />
            <h2 className="text-2xl font-bold text-brand-gray-darkest text-center mb-6">Calming Sounds</h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 bg-gradient-to-br from-brand-blue to-brand-teal text-white">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                        <MusicNoteIcon />
                    </div>
                    <div>
                        <p className="text-sm opacity-80">Now Playing</p>
                        <h3 className="text-xl font-bold">{currentTrack.title}</h3>
                        <p className="text-sm opacity-80">{currentTrack.artist}</p>
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    <div ref={progressBarRef} onClick={handleProgressClick} className="w-full bg-white/20 rounded-full h-1.5 cursor-pointer">
                        <div className="bg-white h-1.5 rounded-full" style={{ width: `${(currentTime / duration) * 100 || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-mono opacity-80">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="flex justify-center items-center space-x-6 mt-4">
                    <button onClick={handlePrevTrack} className="p-2"><RewindIcon /></button>
                    <button onClick={handlePlayPause} className="p-4 bg-white/30 rounded-full shadow-md">
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button onClick={handleNextTrack} className="p-2"><FastForwardIcon /></button>
                </div>
            </div>
            
            <div>
                 <h3 className="text-xl font-bold text-brand-gray-darkest mb-4 px-2">Relax & Unwind</h3>
                 <ul className="space-y-2">
                    {tracks.map((track, index) => (
                        <li 
                            key={index}
                            onClick={() => handleTrackSelect(index)}
                            className={`flex items-center justify-between p-3 rounded-lg shadow-sm hover:bg-brand-gray-lightest transition-colors cursor-pointer ${
                                index === currentTrackIndex ? 'bg-brand-blue-light' : 'bg-white'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-brand-teal-light rounded-full">
                                    <PlaylistMusicIcon />
                                </div>
                                <div>
                                    <p className={`font-semibold ${index === currentTrackIndex ? 'text-brand-blue-dark' : 'text-brand-gray-darkest'}`}>{track.title}</p>
                                    <p className="text-sm text-brand-gray">{track.artist}</p>
                                </div>
                            </div>
                            <span className="text-sm text-brand-gray">{track.duration}</span>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};

// SVG Icons
const MusicNoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;
const RewindIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14.006V5.994a1 1 0 00-1.555-.832L2.4 9.512a1 1 0 000 1.664l6.045 3.656zM18.445 14.832A1 1 0 0020 14.006V5.994a1 1 0 00-1.555-.832L12.4 9.512a1 1 0 000 1.664l6.045 3.656z" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" clipRule="evenodd" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const FastForwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 5.168A1 1 0 0010 5.994v8.012a1 1 0 001.555.832l6.045-3.656a1 1 0 000-1.664L11.555 5.168zM1.555 5.168A1 1 0 000 5.994v8.012a1 1 0 001.555.832l6.045-3.656a1 1 0 000-1.664L1.555 5.168z" /></svg>;
const PlaylistMusicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-teal-dark" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" /></svg>;

export default MusicScreen;