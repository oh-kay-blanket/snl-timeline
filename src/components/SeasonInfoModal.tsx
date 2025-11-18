import { useEffect } from 'react';
import type { SeasonWithCast } from '../types';
import './SeasonInfoModal.css';

interface SeasonInfoModalProps {
  season: SeasonWithCast | null;
  onClose: () => void;
}

export default function SeasonInfoModal({ season, onClose }: SeasonInfoModalProps) {
  useEffect(() => {
    if (season) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [season]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (season) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [season, onClose]);

  if (!season) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Parse comma-separated lists
  const anchors = season.anchors ? season.anchors.split(',').map(a => a.trim()) : [];
  const episodeHosts = season.hosts ? season.hosts.split(',').map(h => h.trim()) : [];
  const musicalGuests = season.music ? season.music.split(',').map(m => m.trim()) : [];
  const notableSketches = season.sketches ? season.sketches.split(',').map(s => s.trim()) : [];

  return (
    <div className="season-info-modal-backdrop" onClick={handleBackdropClick}>
      <div className="season-info-modal">
        <button className="season-info-modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="season-info-modal-content">
          <div className="season-info-modal-header">
            <h2>Season {season.season}</h2>
            <p className="season-info-modal-year">{season.year}</p>
          </div>

          {season.summary && (
            <div className="season-info-summary">
              <p>{season.summary}</p>
            </div>
          )}

          <div className="season-info-modal-sections">
            {episodeHosts.length > 0 && (
              <div className="season-info-section">
                <h3>Notable Hosts</h3>
                <div className="season-info-grid">
                  {episodeHosts.map((host, index) => (
                    <span key={index} className="season-info-item">
                      {host}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {musicalGuests.length > 0 && (
              <div className="season-info-section">
                <h3>Musical Guests</h3>
                <div className="season-info-grid">
                  {musicalGuests.map((artist, index) => (
                    <span key={index} className="season-info-item">
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {notableSketches.length > 0 && (
              <div className="season-info-section">
                <h3>Notable Sketches</h3>
                <div className="season-info-grid">
                  {notableSketches.map((sketch, index) => (
                    <span key={index} className="season-info-item">
                      {sketch}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {anchors.length > 0 && (
              <div className="season-info-section">
                <h3>Weekend Update Anchors</h3>
                <div className="season-info-grid">
                  {anchors.map((anchor, index) => (
                    <span key={index} className="season-info-item">
                      {anchor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="season-info-section">
              <h3>Cast Members ({season.cast.length})</h3>
              <div className="season-info-grid">
                {season.cast.map((member) => (
                  <span key={member.name} className="season-info-item">
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
