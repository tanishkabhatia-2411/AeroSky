import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import type { WeatherData, AppSettings } from '../types/weather';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface AiAssistantProps {
  weather: WeatherData;
  settings: AppSettings;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ weather, settings }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `Hello! I am AeroAI, your local atmospheric assistant. I have loaded the live weather profile for **${weather.cityName}**. Ask me about running conditions, travel plans, clothing, or if you'll need an umbrella today!`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Keep chat scrolling manual; do not auto-jump the panel.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  // Standard preset questions
  const presetQuestions = [
    'Will it rain today?',
    'What clothes should I wear?',
    'Can I go for a run?',
    'Is it safe to travel?'
  ];

  // Helper to get localized temp formatting
  const formatTemp = (c: number, f: number) => {
    return settings.tempUnit === 'C' ? `${Math.round(c)}°C` : `${Math.round(f)}°F`;
  };

  // Generate response logic based on current weather context
  const generateAiResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();
    const temp = weather.temp_c;
    const cond = weather.condition.toLowerCase();
    const isRain = weather.precip_mm > 0 || cond.includes('rain') || cond.includes('drizzle');
    const isSnow = cond.includes('snow');
    const isThunder = cond.includes('thunder') || cond.includes('storm');
    const uv = weather.uv;
    const aqi = weather.aqi.usEpaIndex;

    const formattedCurrentTemp = formatTemp(weather.temp_c, weather.temp_f);

    // 1. Rain Query
    if (q.includes('rain') || q.includes('shower') || q.includes('umbrella') || q.includes('wet')) {
      if (isRain) {
        return `Yes, it is currently raining in **${weather.cityName}** (${weather.precip_mm}mm precipitation). I highly recommend bringing a sturdy umbrella and wearing a waterproof layer if you go outside.`;
      }
      
      // Check hourly forecast
      const rainHour = weather.hourly.find(h => h.chance_of_rain > 40);
      if (rainHour) {
        return `It is not raining right now, but our hourly sensors indicate a **${rainHour.chance_of_rain}% chance of rain** starting around **${rainHour.time}**. It is highly advised to take an umbrella with you just in case!`;
      }
      
      return `Good news! There is no rain forecast for the next 24 hours in **${weather.cityName}**. You can safely leave your umbrella at home.`;
    }

    // 2. Clothing Query
    if (q.includes('cloth') || q.includes('wear') || q.includes('jacket') || q.includes('coat') || q.includes('sunscreen')) {
      let advice = `Right now in **${weather.cityName}**, it is **${formattedCurrentTemp}** and **${weather.condition}**. `;
      
      if (isSnow) {
        advice += 'You should wear a heavy insulated winter coat, warm gloves, a thermal scarf, and waterproof winter boots. The wind will make it feel even colder!';
      } else if (isRain) {
        advice += 'Wear a wind-resistant raincoat or trench coat, and water-repellent shoes. Don\'t forget your umbrella!';
      } else if (temp < 10) {
        advice += 'It\'s cold. I suggest dressing in layers, starting with a warm base layer, a heavy sweater, and a thick jacket/coat.';
      } else if (temp < 20) {
        advice += 'Chilly to mild conditions. A light jacket, trench coat, or heavy cardigan over a shirt is ideal for today.';
      } else if (temp >= 30) {
        advice += 'It is hot outside! Stick to breathable, lightweight fabrics like linen or cotton. Shorts, t-shirts, and sandals are perfect.';
      } else {
        advice += 'Pleasant conditions! A shirt, jeans, and sneakers are perfectly comfortable. If you plan to stay out late, carry a light sweater.';
      }

      if (uv >= 6) {
        advice += ` Also, the UV index is very high (**${uv}**). Make sure to apply SPF 30+ sunscreen and wear sunglasses.`;
      }

      return advice;
    }

    // 3. Walk / Run / Outdoor Query
    if (q.includes('run') || q.includes('walk') || q.includes('outside') || q.includes('jog') || q.includes('sport')) {
      if (isThunder) {
        return `I do not recommend going for a run or spending time outside in **${weather.cityName}** right now. Thunderstorms present lightning hazards. Stay indoors.`;
      }
      if (isRain) {
        return `It is currently raining. Outdoor runs will be slippery and uncomfortable. If you must run, seek an indoor track or treadmill. A short walk with a rain poncho is manageable but damp.`;
      }
      if (isSnow) {
        return `Winter weather is active. Slippery pathways and icy spots make running outside hazardous. Better to opt for indoor activities today.`;
      }
      if (temp > 32) {
        return `It is extremely warm (**${formattedCurrentTemp}**). Outdoor exercise is unsafe during peak afternoon hours due to heat stroke risks. If you want to jog, wait until sunset or run early in the morning, and hydrate heavily.`;
      }
      if (aqi >= 4) {
        return `Air quality in **${weather.cityName}** is currently poor (EPA Index: **${aqi}**). Limit heavy outdoor exertion, especially if you have sensitive respiratory conditions.`;
      }
      if (temp < 5) {
        return `It is cold (**${formattedCurrentTemp}**). A run is fine if you dress in full thermals, cover your head, and warm up thoroughly inside first. Paths could have invisible ice.`;
      }
      
      return `Absolutely! Conditions are excellent in **${weather.cityName}** right now. The temperature is a comfortable **${formattedCurrentTemp}** with moderate wind (**${weather.wind_kph} km/h**). Enjoy your run!`;
    }

    // 4. Travel / Driving Query
    if (q.includes('travel') || q.includes('drive') || q.includes('road') || q.includes('trip') || q.includes('car')) {
      if (weather.alerts && weather.alerts.length > 0) {
        return `⚠️ **Alert:** There is an active weather warning in **${weather.cityName}**: *"${weather.alerts[0].headline}"*. Avoid long road trips and non-essential driving. Stay safe!`;
      }
      if (isThunder) {
        return `Driving is hazardous due to localized downpours and lightning. Hydroplaning risks are high. If you must drive, turn on your headlights and keep a safe distance from other vehicles.`;
      }
      if (isRain) {
        return `Rainy conditions. Roads will be wet and slippery, reducing tires traction. Vision might be slightly impaired. Drive carefully and slow down.`;
      }
      if (isSnow) {
        return `Snow alert is active. Expect snow accumulations on pathways. Do not travel unless your vehicle has snow chains or winter tires. Road closures are possible.`;
      }
      if (weather.visibility_km < 5) {
        return `Visibility is low (**${weather.visibility_km} km**) due to fog/mist. Keep your low-beam headlights on and keep a high safety gap. Avoid high-speed travel.`;
      }

      return `Roads are dry and visibility is clear (**${weather.visibility_km} km**). Driving conditions are optimal. Safe travels!`;
    }

    // 5. Default General Weather response
    return `In **${weather.cityName}**, the current temperature is **${formattedCurrentTemp}** with **${weather.condition}**. The wind speed is **${weather.wind_kph} km/h** from the **${weather.wind_dir}**, humidity is at **${weather.humidity}%**, and the UV Index is **${weather.uv}**. Overall, it feels like **${formatTemp(weather.feelslike_c, weather.feelslike_f)}**. Let me know if you want detailed clothing or sport recommendations!`;
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Add user message
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. Simulate AI thinking and reply
    setTimeout(() => {
      const replyText = generateAiResponse(textToSend);
      const botMsg: Message = {
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200); // 1.2s delay for realism
  };

  return (
    <div className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '480px' }}>
      
      {/* AI Assistant Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.35rem', borderRadius: '8px' }}>
            <Sparkles size={16} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AeroAI Assistant
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Online Context
        </div>
      </div>

      {/* Message Feed list */}
      <div 
        ref={messagesContainerRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          paddingRight: '0.25rem',
          paddingBottom: '0.5rem'
        }}
      >
        {messages.map((msg, idx) => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '85%'
              }}
            >
              {isBot && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.4rem',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)'
                }}>
                  <Bot size={14} />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div 
                  style={{
                    background: isBot 
                      ? 'rgba(255, 255, 255, 0.03)' 
                      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
                    border: isBot ? '1px solid var(--glass-border)' : '1px solid rgba(59, 130, 246, 0.25)',
                    padding: '0.75rem 1rem',
                    borderRadius: isBot ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.45,
                    boxShadow: isBot ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.1)'
                  }}
                >
                  {/* Handle inline bold markup **text** */}
                  {msg.text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700 }}>{chunk}</strong> : chunk)}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: isBot ? 'flex-start' : 'flex-end' }}>
                  {msg.time}
                </span>
              </div>

              {!isBot && (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  padding: '0.4rem',
                  borderRadius: '10px',
                  color: '#60a5fa'
                }}>
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', alignSelf: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '10px', color: 'var(--text-secondary)' }}>
              <Bot size={14} />
            </div>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '0.5rem 0.85rem', borderRadius: '18px' }}>
              <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'float-slow 1.2s infinite' }} />
              <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'float-slow 1.2s infinite', animationDelay: '0.2s' }} />
              <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'float-slow 1.2s infinite', animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Preset Question Suggestions */}
      {messages.length === 1 && !isTyping && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '99px',
                padding: '0.45rem 0.8rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Message Area */}
      <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
        <input
          type="text"
          className="glass-input"
          style={{ paddingRight: '2.5rem', fontSize: '0.85rem' }}
          placeholder="Ask AeroAI (e.g. 'Can I go for a walk?')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
        />
        <button
          className="glow-button"
          style={{
            padding: '0.7rem',
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: '12px',
            boxShadow: 'none'
          }}
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
        >
          <Send size={14} />
        </button>
      </div>

    </div>
  );
};
export default AiAssistant;
