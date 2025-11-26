import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ScrollContainer.css';

interface ScrollContainerProps {
  children: React.ReactNode;
  onScrollProgress?: (progress: number) => void;
}

export interface ScrollContainerHandle {
  scrollToSeason: (seasonIndex: number, options?: { smooth?: boolean }) => void;
}

const ScrollContainer = forwardRef<ScrollContainerHandle, ScrollContainerProps>(
  ({ children, onScrollProgress }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToSeason: (seasonIndex: number, options = { smooth: true }) => {
        if (containerRef.current) {
          const viewportHeight = containerRef.current.clientHeight;
          const targetScrollTop = seasonIndex * viewportHeight;

          containerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: options.smooth ? 'smooth' : 'auto'
          });
        }
      }
    }));

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
);

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer;
