import { useState, useMemo } from 'react';
import ScrollContainer from './components/ScrollContainer';
import SeasonView from './components/SeasonView';
import CastBioModal from './components/CastBioModal';
import AllCastView from './components/AllCastView';
import Timeline from './components/Timeline';
import { parseSeasonData } from './utils/dataParser';
import { cast } from './data/cast';
import type { CastMember } from './types';
import './App.css';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedCast, setSelectedCast] = useState<CastMember | null>(null);

  // Parse season data once
  const seasons = useMemo(() => parseSeasonData(), []);

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
        </div>
        <div className="season-year-container">
          {currentSeason && (
            <div
              className="season-year"
              style={{
                transform: currentTransform,
                opacity: currentOpacity
              }}
            >
              {currentSeason.year}
            </div>
          )}
          {nextSeason && currentSeasonIndex !== nextSeasonIndex && (
            <div
              className="season-year"
              style={{
                transform: nextTransform,
                opacity: nextOpacity
              }}
            >
              {nextSeason.year}
            </div>
          )}
        </div>
      </div>

      <AllCastView
        allCast={cast}
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
    </div>
  );
}

export default App;
