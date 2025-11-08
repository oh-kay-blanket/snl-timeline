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
      const windowHeight = window.innerHeight;

      // Calculate exact scroll progress (which season + fraction)
      const progress = scrollTop / windowHeight;
      onScrollProgress?.(progress);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

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
