import { useEffect, useRef } from 'react'
import './AnimatedCat.css'

export default function AnimatedCat() {
  const catRef = useRef(null)

  useEffect(() => {
    const cat = catRef.current
    if (!cat) return

    // Random starting position
    const startX = Math.random() * (window.innerWidth - 100)
    const startY = Math.random() * (window.innerHeight - 100)
    cat.style.left = `${startX}px`
    cat.style.top = `${startY}px`

    // Random direction
    let directionX = (Math.random() - 0.5) * 2
    let directionY = (Math.random() - 0.5) * 2
    const speed = 0.5 + Math.random() * 0.5

    let x = startX
    let y = startY

    const move = () => {
      x += directionX * speed
      y += directionY * speed

      // Bounce off edges with padding
      const padding = 20
      if (x <= padding || x >= window.innerWidth - 100 - padding) {
        directionX *= -1
        cat.style.transform = directionX > 0 ? 'scaleX(1)' : 'scaleX(-1)'
        x = Math.max(padding, Math.min(x, window.innerWidth - 100 - padding))
      }
      if (y <= padding || y >= window.innerHeight - 100 - padding) {
        directionY *= -1
        y = Math.max(padding, Math.min(y, window.innerHeight - 100 - padding))
      }

      cat.style.left = `${x}px`
      cat.style.top = `${y}px`

      requestAnimationFrame(move)
    }

    move()

    // Occasionally change direction
    const directionInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        directionX = (Math.random() - 0.5) * 2
        directionY = (Math.random() - 0.5) * 2
        cat.style.transform = directionX > 0 ? 'scaleX(1)' : 'scaleX(-1)'
      }
    }, 3000)

    return () => clearInterval(directionInterval)
  }, [])

  return (
    <div ref={catRef} className="animated-cat">
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="cat-svg"
      >
        {/* Cat head */}
        <circle
          cx="50"
          cy="40"
          r="25"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Cat ears */}
        <path
          d="M 35 25 L 30 10 L 40 20 Z"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 65 25 L 70 10 L 60 20 Z"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Cat eyes */}
        <circle
          cx="42"
          cy="38"
          r="3"
          fill="#2c2c2c"
        />
        <circle
          cx="58"
          cy="38"
          r="3"
          fill="#2c2c2c"
        />
        
        {/* Cat nose */}
        <path
          d="M 50 45 L 47 50 L 53 50 Z"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Cat mouth */}
        <path
          d="M 50 50 Q 45 55 42 52"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 50 50 Q 55 55 58 52"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Cat body */}
        <ellipse
          cx="50"
          cy="70"
          rx="20"
          ry="15"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Cat tail */}
        <path
          d="M 70 70 Q 85 60 90 75 Q 85 80 80 75"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Cat paws */}
        <circle
          cx="35"
          cy="80"
          r="4"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="1.5"
        />
        <circle
          cx="65"
          cy="80"
          r="4"
          fill="none"
          stroke="#2c2c2c"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}

