import './CatLegs.css'

export default function CatLegs({ isPlaying, onClick, disabled }) {
  return (
    <button 
      className={`cat-legs ${isPlaying ? 'playing' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      <svg 
        width="70" 
        height="60" 
        viewBox="0 0 70 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="legs-svg"
      >
        {/* Left leg */}
        <path
          d="M 5 0 Q 8 20 10 40 Q 12 50 15 55"
          fill="none"
          stroke="#E8BEAC"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Right leg */}
        <path
          d="M 25 0 Q 28 20 30 40 Q 32 50 35 55"
          fill="none"
          stroke="#E8BEAC"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Leg hair - left leg */}
        <g className="leg-hair">
          <path d="M 3 8 L 0 6" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 4 15 L 1 14" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 5 22 L 2 21" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 6 30 L 3 29" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 14 10 L 17 8" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 15 18 L 18 17" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 16 26 L 19 25" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
        </g>

        {/* Leg hair - right leg */}
        <g className="leg-hair">
          <path d="M 23 8 L 20 6" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 24 15 L 21 14" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 25 22 L 22 21" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 34 10 L 37 8" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 35 18 L 38 17" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 36 26 L 39 25" stroke="#8B7355" strokeWidth="1" strokeLinecap="round"/>
        </g>

        {/* Shorts/boxers hint */}
        <rect x="2" y="0" width="35" height="8" fill="#4169E1" stroke="#2c2c2c" strokeWidth="1"/>
        <path d="M 19 0 L 19 8" stroke="#2c2c2c" strokeWidth="1" strokeDasharray="2 2"/>

        {/* Play/Pause icon */}
        <g className="legs-icon" transform="translate(50, 30)">
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
