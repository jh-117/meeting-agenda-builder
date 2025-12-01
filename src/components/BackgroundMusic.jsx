import React, { useState, useRef, useEffect } from 'react';
import { Music, VolumeX } from 'lucide-react';

const BackgroundMusic = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Lowered to 30% for background music

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
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleMusic}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 9999,
        padding: '0.75rem',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: isPlaying ? 'rgba(99, 102, 241, 0.9)' : 'rgba(51, 65, 85, 0.8)',
        color: 'white',
        boxShadow: isPlaying 
          ? '0 8px 16px rgba(99, 102, 241, 0.4), 0 0 0 4px rgba(99, 102, 241, 0.2)' 
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      aria-label={isPlaying ? "Mute Music" : "Play Music"}
      title={isPlaying ? "Pause Music" : "Play Music"}
    >
      {isPlaying ? (
        <Music size={20} style={{ display: 'block' }} />
      ) : (
        <VolumeX size={20} style={{ display: 'block' }} />
      )}
    </button>
  );
};

export default BackgroundMusic;