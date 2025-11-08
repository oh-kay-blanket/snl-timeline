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

  const currentSeasonIndex = Math.round(scrollProgress);

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

  const currentPosition = (currentSeasonIndex / (seasons.length - 1)) * 100;

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
          style={{ top: `${currentPosition}%` }}
        />

        {/* Hover indicator tick - only when hovering */}
        {hoveredSeason !== null && (
          <div
            className="timeline-hover-tick"
            style={{ top: `${(hoveredSeason / (seasons.length - 1)) * 100}%` }}
          />
        )}
      </div>

      {/* Active year label - always visible */}
      {seasons[currentSeasonIndex] && (
        <div
          className="timeline-year-label"
          style={{ top: `${currentPosition}%` }}
        >
          {seasons[currentSeasonIndex].yearStart}
        </div>
      )}

      {/* Hover year label - only when hovering */}
      {hoveredSeason !== null && seasons[hoveredSeason] && (
        <div
          className="timeline-year-label"
          style={{ top: `${(hoveredSeason / (seasons.length - 1)) * 100}%` }}
        >
          {seasons[hoveredSeason].yearStart}
        </div>
      )}
    </div>
  );
}
