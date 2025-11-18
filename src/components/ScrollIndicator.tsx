import { useEffect, useState } from 'react';
import './ScrollIndicator.css';

interface ScrollIndicatorProps {
  scrollProgress: number;
}

export default function ScrollIndicator({ scrollProgress }: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Hide indicator once user scrolls past season 1
  useEffect(() => {
    if (scrollProgress >= 1) {
      setIsVisible(false);
    }
  }, [scrollProgress]);

  // Calculate opacity based on scroll progress (fade out as user scrolls)
  const opacity = Math.max(0, 1 - scrollProgress * 2);

  // Don't render if not visible
  if (!isVisible || scrollProgress >= 1) {
    return null;
  }

  return (
    <div className="scroll-indicator" style={{ opacity }}>
      <div className="scroll-indicator-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5L12 19M12 19L19 12M12 19L5 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
