import { useState, useRef, useEffect } from 'react';
import type { SeasonWithCast } from '../types';
import './Timeline.css';

interface TimelineProps {
  seasons: SeasonWithCast[];
  scrollProgress: number;
}

export default function Timeline({ seasons, scrollProgress }: TimelineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredSeason, setHoveredSeason] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate current and next season for smooth transitions
  const currentSeasonIndex = Math.floor(scrollProgress);
  const nextSeasonIndex = Math.min(currentSeasonIndex + 1, seasons.length - 1);
  const transitionProgress = scrollProgress - currentSeasonIndex;

  const scrollToSeason = (seasonIndex: number) => {
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;
    if (scrollContainer) {
      const windowHeight = window.innerHeight;
      const targetScrollTop = seasonIndex * windowHeight;

      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'auto'
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSeasonFromMouse(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSeasonFromTouch(e.touches[0].clientY);
  };

  const updateSeasonFromMouse = (clientY: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, y / rect.height));
    const seasonIndex = Math.round(percentage * (seasons.length - 1));

    scrollToSeason(seasonIndex);
    setHoveredSeason(seasonIndex);
  };

  const updateSeasonFromTouch = (clientY: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, y / rect.height));
    const seasonIndex = Math.round(percentage * (seasons.length - 1));

    scrollToSeason(seasonIndex);
    setHoveredSeason(seasonIndex);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateSeasonFromMouse(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updateSeasonFromTouch(e.touches[0].clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setHoveredSeason(null);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setHoveredSeason(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, seasons.length]);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, y / rect.height));
    const seasonIndex = Math.round(percentage * (seasons.length - 1));

    scrollToSeason(seasonIndex);
  };

  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (isDragging || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, y / rect.height));
    const seasonIndex = Math.round(percentage * (seasons.length - 1));

    setHoveredSeason(seasonIndex);
  };

  const handleTrackMouseLeave = () => {
    if (!isDragging) {
      setHoveredSeason(null);
    }
  };

  // Smooth position for pill and tick (uses raw scrollProgress)
  const smoothPosition = (scrollProgress / (seasons.length - 1)) * 100;

  // Calculate opacities for year label animation
  const currentOpacity = 1 - transitionProgress;
  const nextOpacity = transitionProgress;

  return (
    <div className="timeline">
      <div
        ref={trackRef}
        className={`timeline-track ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleTrackClick}
        onMouseMove={handleTrackMouseMove}
        onMouseLeave={handleTrackMouseLeave}
      >
        {/* Season markers - small tick for each season, large tick every 5 seasons */}
        {seasons.map((season, index) => {
          const position = (index / (seasons.length - 1)) * 100;
          const isMajorTick = index % 5 === 0;
          return (
            <div
              key={season.season}
              className={`timeline-tick ${isMajorTick ? 'major' : 'minor'}`}
              style={{ top: `${position}%` }}
            />
          );
        })}

        {/* Active year indicator tick - always visible */}
        <div
          className="timeline-hover-tick"
          style={{ top: `${smoothPosition}%` }}
        />

        {/* Hover indicator tick - only when hovering */}
        {hoveredSeason !== null && (
          <div
            className="timeline-hover-tick"
            style={{ top: `${(hoveredSeason / (seasons.length - 1)) * 100}%` }}
          />
        )}
      </div>

      {/* Active year label container with smooth transitions */}
      <div
        className="timeline-year-label-container"
        style={{ top: `${smoothPosition}%` }}
      >
        {seasons[currentSeasonIndex] && (
          <div
            className="timeline-year-label"
            style={{
              transform: `translateY(${-transitionProgress * 100}%)`,
              opacity: currentOpacity
            }}
          >
            {seasons[currentSeasonIndex].yearStart}
          </div>
        )}
        {currentSeasonIndex !== nextSeasonIndex && seasons[nextSeasonIndex] && (
          <div
            className="timeline-year-label"
            style={{
              transform: `translateY(${(1 - transitionProgress) * 100}%)`,
              opacity: nextOpacity
            }}
          >
            {seasons[nextSeasonIndex].yearStart}
          </div>
        )}
      </div>

      {/* Hover year label - only when hovering */}
      {hoveredSeason !== null && seasons[hoveredSeason] && (
        <div
          className="timeline-year-label-container"
          style={{ top: `${(hoveredSeason / (seasons.length - 1)) * 100}%` }}
        >
          <div className="timeline-year-label">
            {seasons[hoveredSeason].yearStart}
          </div>
        </div>
      )}
    </div>
  );
}
