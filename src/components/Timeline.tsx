import { useState } from 'react';
import type { SeasonWithCast } from '../types';
import './Timeline.css';

interface TimelineProps {
  seasons: SeasonWithCast[];
  scrollProgress: number;
}

export default function Timeline({ seasons, scrollProgress }: TimelineProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentSeasonIndex = Math.round(scrollProgress);

  const handleSeasonClick = (seasonIndex: number) => {
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;
    if (scrollContainer) {
      const windowHeight = window.innerHeight;
      const targetScrollTop = seasonIndex * windowHeight;

      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`timeline ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className="timeline-toggle"
        onClick={toggleCollapse}
        aria-label={isCollapsed ? 'Expand timeline' : 'Collapse timeline'}
      >
        {isCollapsed ? '›' : '‹'}
      </button>

      {!isCollapsed && (
        <>
          <div className="timeline-header">Seasons</div>
          <div className="timeline-track">
            {seasons.map((season, index) => {
              const isActive = currentSeasonIndex === index;
              const isPast = index < currentSeasonIndex;

              return (
                <div
                  key={season.season}
                  className={`timeline-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => handleSeasonClick(index)}
                >
                  <div className="timeline-marker" />
                  <div className="timeline-label">
                    <span className="timeline-season-number">{season.season}</span>
                    <span className="timeline-year">{season.yearStart}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
