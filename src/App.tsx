import { useState, useMemo } from 'react';
import ScrollContainer from './components/ScrollContainer';
import SeasonView from './components/SeasonView';
import CastBioModal from './components/CastBioModal';
import ScrollIndicator from './components/ScrollIndicator';
import SeasonInfoModal from './components/SeasonInfoModal';
import AllCastView from './components/AllCastView';
import Timeline from './components/Timeline';
import { parseSeasonData } from './utils/dataParser';
import type { CastMember, SeasonWithCast } from './types';
import './App.css';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedCast, setSelectedCast] = useState<CastMember | null>(null);
  const [selectedSeasonInfo, setSelectedSeasonInfo] = useState<SeasonWithCast | null>(null);

  // Parse season data once
  const seasons = useMemo(() => parseSeasonData(), []);

  // Collect all unique cast members from all seasons (includes placeholders)
  const allCast = useMemo(() => {
    const castMap = new Map<string, CastMember>();
    seasons.forEach(season => {
      season.cast.forEach(member => {
        if (!castMap.has(member.name)) {
          castMap.set(member.name, member);
        }
      });
    });
    return Array.from(castMap.values());
  }, [seasons]);

  // Calculate current and next season indices and transition progress
  const currentSeasonIndex = Math.floor(scrollProgress);
  const nextSeasonIndex = Math.min(currentSeasonIndex + 1, seasons.length - 1);
  const transitionProgress = scrollProgress - currentSeasonIndex; // 0 to 1

  const currentSeason = seasons[currentSeasonIndex];
  const nextSeason = seasons[nextSeasonIndex];

  // Calculate transforms and opacities for sliding animation
  const currentTransform = `translateY(${-transitionProgress * 100}%)`;
  const nextTransform = `translateY(${(1 - transitionProgress) * 100}%)`;
  const currentOpacity = 1 - transitionProgress;
  const nextOpacity = transitionProgress;


  return (
    <div className="app">
      <Timeline seasons={seasons} scrollProgress={scrollProgress} />

      <div className="fixed-season-info">
        <div className="season-number">
          <span className="season-label">Season </span>
          <span className="season-number-container">
            {currentSeason && (
              <span
                className="season-number-value"
                style={{
                  transform: currentTransform,
                  opacity: currentOpacity
                }}
              >
                {currentSeason.season}
              </span>
            )}
            {nextSeason && currentSeasonIndex !== nextSeasonIndex && (
              <span
                className="season-number-value"
                style={{
                  transform: nextTransform,
                  opacity: nextOpacity
                }}
              >
                {nextSeason.season}
              </span>
            )}
          </span>
          <span className="season-year-inline-container">
            {currentSeason && (
              <span
                className="season-year-inline"
                style={{
                  transform: currentTransform,
                  opacity: currentOpacity
                }}
              >
                ({currentSeason.year})
              </span>
            )}
            {nextSeason && currentSeasonIndex !== nextSeasonIndex && (
              <span
                className="season-year-inline"
                style={{
                  transform: nextTransform,
                  opacity: nextOpacity
                }}
              >
                ({nextSeason.year})
              </span>
            )}
          </span>
        </div>
        <div
          className="season-summary-container"
          onClick={() => setSelectedSeasonInfo(currentSeason)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedSeasonInfo(currentSeason);
            }
          }}
        >
          {currentSeason && (
            <div
              className="season-summary"
              style={{
                transform: currentTransform,
                opacity: currentOpacity
              }}
            >
              {currentSeason.summary}
            </div>
          )}
          {nextSeason && currentSeasonIndex !== nextSeasonIndex && (
            <div
              className="season-summary"
              style={{
                transform: nextTransform,
                opacity: nextOpacity
              }}
            >
              {nextSeason.summary}
            </div>
          )}
          <svg className="expand-indicator" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <AllCastView
        allCast={allCast}
        seasons={seasons}
        currentSeason={currentSeason}
        nextSeason={nextSeason}
        transitionProgress={transitionProgress}
        onCastClick={setSelectedCast}
      />

      <ScrollContainer onScrollProgress={setScrollProgress}>
        {seasons.map((season, index) => (
          <SeasonView
            key={season.season}
            season={season}
            isActive={Math.round(scrollProgress) === index}
          />
        ))}
      </ScrollContainer>

      <CastBioModal
        member={selectedCast}
        onClose={() => setSelectedCast(null)}
      />

      <SeasonInfoModal
        season={selectedSeasonInfo}
        onClose={() => setSelectedSeasonInfo(null)}
      />

      <ScrollIndicator scrollProgress={scrollProgress} />
    </div>
  );
}

export default App;
