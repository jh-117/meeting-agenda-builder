import React, { useState, useRef, useEffect } from 'react';
import { Music, VolumeX } from 'lucide-react';

const BackgroundMusic = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Initialize audio object once
  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true; // Make it loop endlessly
    audioRef.current.volume = 0.5; // Set volume to 50% so it's not too loud

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Browser requires user interaction to play audio
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleMusic}
      className={`fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 group ${
        isPlaying 
          ? 'bg-green-500 text-white hover:bg-green-600 ring-4 ring-green-500/30' 
          : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
      }`}
      aria-label={isPlaying ? "Mute Music" : "Play Music"}
      title={isPlaying ? "Pause Music" : "Play Music"}
    >
      <div className="relative flex items-center justify-center">
        {isPlaying ? (
          <>
            <Music size={24} className="animate-pulse" />
            {/* Optional: Visual sound wave effect */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
            </span>
          </>
        ) : (
          <VolumeX size={24} />
        )}
      </div>
    </button>
  );
};

export default BackgroundMusic;