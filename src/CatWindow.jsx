import './CatWindow.css'

export default function CatWindow({ isPlaying, onClick, disabled }) {
  return (
    <button 
      className={`cat-window ${isPlaying ? 'playing' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      <svg 
        width="70" 
        height="70" 
        viewBox="0 0 70 70" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="window-svg"
      >
        {/* Window frame */}
        <rect
          x="8"
          y="8"
          width="54"
          height="54"
          rx="2"
          fill="#87CEEB"
          stroke="#8B4513"
          strokeWidth="3"
        />
        
        {/* Window panes dividers */}
        <line x1="35" y1="8" x2="35" y2="62" stroke="#8B4513" strokeWidth="3"/>
        <line x1="8" y1="35" x2="62" y2="35" stroke="#8B4513" strokeWidth="3"/>
        
        {/* Window sill */}
        <rect
          x="5"
          y="58"
          width="60"
          height="8"
          fill="#8B4513"
          stroke="#5D3A1A"
          strokeWidth="1.5"
        />

        {/* Curtain hints */}
        <path
          d="M 10 10 Q 15 15 10 20 Q 15 25 10 30"
          fill="none"
          stroke="#DDA0DD"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 60 10 Q 55 15 60 20 Q 55 25 60 30"
          fill="none"
          stroke="#DDA0DD"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Sun/moon in window */}
        <circle cx="50" cy="20" r="6" fill="#FFD700" opacity="0.8"/>

        {/* Play/Pause icon */}
        <g className="window-icon" transform="translate(35, 35)">
          <circle r="12" fill="rgba(255,255,255,0.9)" stroke="#2c2c2c" strokeWidth="1.5"/>
          {isPlaying ? (
            // Pause icon
            <>
              <rect x="-5" y="-5" width="4" height="10" rx="1" fill="#1db954" stroke="#2c2c2c" strokeWidth="1"/>
              <rect x="1" y="-5" width="4" height="10" rx="1" fill="#1db954" stroke="#2c2c2c" strokeWidth="1"/>
            </>
          ) : (
            // Play icon
            <path
              d="M -4 -6 L -4 6 L 6 0 Z"
              fill="#1db954"
              stroke="#2c2c2c"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      </svg>
    </button>
  )
}
