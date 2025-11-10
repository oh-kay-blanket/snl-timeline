import { useRef, useEffect } from 'react';
import './ScrollContainer.css';

interface ScrollContainerProps {
  children: React.ReactNode;
  onScrollProgress?: (progress: number) => void;
}

export default function ScrollContainer({ children, onScrollProgress }: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      // Use clientHeight instead of window.innerHeight for accurate mobile calculation
      const viewportHeight = container.clientHeight;

      // Calculate exact scroll progress (which season + fraction)
      const progress = scrollTop / viewportHeight;
      onScrollProgress?.(progress);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    // Trigger initial position calculation on mount
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [onScrollProgress]);

  return (
    <div ref={containerRef} className="scroll-container">
      {children}
    </div>
  );
}
