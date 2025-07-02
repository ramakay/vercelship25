'use client';

interface PaperPlaneProps {
  id: string;
  modelId: string;
}

export default function PaperPlane({ id, modelId }: PaperPlaneProps) {
  const colors = {
    grok: '#FF5782',
    claude: '#9100DB', 
    gemini: '#00FFD7'
  };

  const color = colors[modelId as keyof typeof colors] || '#7F9BFC';

  return (
    <div 
      id={id}
      className="absolute"
      style={{
        opacity: 0,
        transform: 'translate(-300px, -100px) rotate(-45deg)',
        zIndex: 500
      }}
    >
      <svg 
        width="120" 
        height="120" 
        viewBox="0 0 120 120"
        style={{ filter: `drop-shadow(0 10px 20px ${color}30)` }}
      >
        <defs>
          <linearGradient id={`plane-gradient-${modelId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id={`plane-light-${modelId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>
        
        {/* Paper plane shape inspired by Zajno */}
        <g transform="translate(10, 10)">
          {/* Main body */}
          <path
            d="M80 20 L20 60 L30 45 L15 85 Z"
            fill={`url(#plane-gradient-${modelId})`}
            stroke="white"
            strokeWidth="1"
          />
          
          {/* Wing highlight */}
          <path
            d="M80 20 L30 45 L35 38"
            fill={`url(#plane-light-${modelId})`}
          />
          
          {/* Body fold */}
          <path
            d="M80 20 L15 85"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
}