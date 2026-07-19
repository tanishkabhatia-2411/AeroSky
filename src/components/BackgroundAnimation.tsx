import React, { useMemo } from 'react';

interface BackgroundAnimationProps {
  conditionCode: number;
  isNight: boolean;
}

export const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
  conditionCode,
  isNight
}) => {
  // Categorize condition codes
  const weatherType = useMemo(() => {
    const code = conditionCode;
    if (code === 1000) return 'clear';
    if (code === 1003) return 'partly_cloudy';
    if (code === 1006 || code === 1009) return 'cloudy';
    if (code === 1030 || code === 1135) return 'fog';
    if (code === 1087 || code === 1276) return 'thunderstorm';
    if (code === 1114 || code === 1219 || code === 1225) return 'snow';
    if ([1063, 1183, 1189, 1195, 1240].includes(code)) return 'rain';
    return 'clear';
  }, [conditionCode]);

  // Generate random static positions once using useMemo to avoid repositioning on renders
  const particles = useMemo(() => {
    const list: Array<{ id: number; left: string; top: string; delay: string; duration: string; size: string }> = [];
    const count = weatherType === 'snow' || weatherType === 'rain' ? 40 : (isNight && weatherType === 'clear' ? 60 : 0);
    
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * -5}s`, // Negative delay so they start immediately at different stages
        duration: weatherType === 'rain' 
          ? `${0.8 + Math.random() * 0.6}s` 
          : weatherType === 'snow' 
            ? `${3 + Math.random() * 4}s` 
            : `${2 + Math.random() * 4}s`, // Twinkle duration
        size: weatherType === 'rain' 
          ? `${1 + Math.random() * 1}px` 
          : weatherType === 'snow' 
            ? `${2 + Math.random() * 4}px` 
            : `${1 + Math.random() * 1.5}px` // Star size
      });
    }
    return list;
  }, [weatherType, isNight]);

  // Generate cloud bubbles for cloudy weather
  const clouds = useMemo(() => {
    const list: Array<{ id: number; width: string; height: string; top: string; left: string; delay: string }> = [];
    if (weatherType === 'cloudy' || weatherType === 'partly_cloudy') {
      const count = weatherType === 'cloudy' ? 6 : 3;
      for (let i = 0; i < count; i++) {
        list.push({
          id: i,
          width: `${150 + Math.random() * 200}px`,
          height: `${100 + Math.random() * 150}px`,
          top: `${10 + Math.random() * 40}%`,
          left: `${-20 + Math.random() * 40}%`,
          delay: `${Math.random() * -20}s`
        });
      }
    }
    return list;
  }, [weatherType]);

  // Determine container backdrop color depending on weather and time of day
  const containerStyle = useMemo(() => {
    let background = 'linear-gradient(135deg, #0b0f19 0%, #06080e 100%)'; // default dark

    if (isNight) {
      if (weatherType === 'thunderstorm') {
        background = 'linear-gradient(135deg, #090610 0%, #030206 100%)';
      } else if (weatherType === 'rain' || weatherType === 'fog') {
        background = 'linear-gradient(135deg, #070a13 0%, #040509 100%)';
      } else {
        background = 'linear-gradient(135deg, #05070c 0%, #020305 100%)';
      }
    } else {
      // Day Archetypes
      switch (weatherType) {
        case 'clear':
          background = 'linear-gradient(135deg, #0c2540 0%, #071526 100%)'; // Sleek dark blue sunny
          break;
        case 'partly_cloudy':
          background = 'linear-gradient(135deg, #0e1e33 0%, #081120 100%)';
          break;
        case 'cloudy':
        case 'fog':
          background = 'linear-gradient(135deg, #1b263b 0%, #0d131f 100%)';
          break;
        case 'rain':
          background = 'linear-gradient(135deg, #14213d 0%, #0a1128 100%)';
          break;
        case 'thunderstorm':
          background = 'linear-gradient(135deg, #1a162b 0%, #0b0914 100%)';
          break;
        case 'snow':
          background = 'linear-gradient(135deg, #22333b 0%, #0f171a 100%)';
          break;
      }
    }

    return { background };
  }, [weatherType, isNight]);

  return (
    <div className="weather-bg-container" style={containerStyle}>
      {/* 1. Star Particles for Clear Nights */}
      {isNight && weatherType === 'clear' && particles.map(p => (
        <div
          key={p.id}
          className="star-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}

      {/* 2. Falling Rain Drops */}
      {weatherType === 'rain' && particles.map(p => (
        <div
          key={p.id}
          className="rain-particle"
          style={{
            left: p.left,
            top: `-${50 + Math.random() * 50}px`,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}

      {/* 3. Drifting Snowflakes */}
      {weatherType === 'snow' && particles.map(p => (
        <div
          key={p.id}
          className="snow-particle"
          style={{
            left: p.left,
            top: `-${20 + Math.random() * 20}px`,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}

      {/* 4. Thunderstorm Lightning & Heavy Rain */}
      {weatherType === 'thunderstorm' && (
        <>
          <div className="lightning-flash lightning-active" />
          {particles.map(p => (
            <div
              key={p.id}
              className="rain-particle"
              style={{
                left: p.left,
                top: `-${50 + Math.random() * 50}px`,
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: 0.8,
                background: 'linear-gradient(transparent, rgba(168, 85, 247, 0.4))' // Purple tint
              }}
            />
          ))}
        </>
      )}

      {/* 5. Floating Clouds (Parallax backdrop effect) */}
      {(weatherType === 'cloudy' || weatherType === 'partly_cloudy') && clouds.map(c => (
        <div
          key={c.id}
          className="cloud-particle"
          style={{
            width: c.width,
            height: c.height,
            top: c.top,
            left: c.left,
            animationDelay: c.delay
          }}
        />
      ))}

      {/* 6. Fog Layer Overlay */}
      {weatherType === 'fog' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 80%)',
            backdropFilter: 'blur(3px)',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};
export default BackgroundAnimation;
