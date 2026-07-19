import React, { useEffect, useState } from 'react';
import { CloudLightning, Sun, CloudRain } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 600); // Wait for transition out
          }, 400);
          return 100;
        }
        return prev + 4;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #090d16 0%, #040509 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        visibility: fadeOut ? 'hidden' : 'visible',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Animated Brand Icon Stack */}
        <div
          style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Sun
            size={48}
            className="pulse-glow"
            style={{
              color: '#f59e0b',
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <CloudRain
            size={36}
            style={{
              color: '#3b82f6',
              position: 'absolute',
              bottom: '15px',
              right: '15px',
              opacity: 0.7,
              transform: 'rotate(-10deg)',
            }}
          />
          <CloudLightning
            size={28}
            style={{
              color: '#a855f7',
              position: 'absolute',
              top: '15px',
              left: '15px',
              opacity: 0.7,
              transform: 'rotate(15deg)',
            }}
          />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}
          >
            AeroSky
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              color: '#64748b',
              marginTop: '0.25rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            Intelligence in the Atmosphere
          </p>
        </div>

        {/* Progress Bar Container */}
        <div
          style={{
            width: '200px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '99px',
            overflow: 'hidden',
            marginTop: '1.5rem',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.03)',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              borderRadius: '99px',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default SplashScreen;
