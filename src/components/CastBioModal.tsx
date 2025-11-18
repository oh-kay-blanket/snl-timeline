import { useEffect } from 'react';
import type { CastMember } from '../types';
import { getSpriteStyle } from '../utils/sprites';
import { getCastMemberSpriteKey } from '../utils/dataParser';
import './CastBioModal.css';

interface CastBioModalProps {
  member: CastMember | null;
  onClose: () => void;
}

export default function CastBioModal({ member, onClose }: CastBioModalProps) {
  useEffect(() => {
    if (!member) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [member, onClose]);

  if (!member) return null;

  const spriteKey = getCastMemberSpriteKey(member.name);
  const spriteStyle = getSpriteStyle(spriteKey, 120);
  const hasSprite = Object.keys(spriteStyle).length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <div
            className={`modal-photo ${!hasSprite ? 'no-photo' : ''}`}
            style={{
              ...spriteStyle,
              borderColor: '#f0f0f0',
            }}
          />
          <div className="modal-title">
            <h2>{member.name}</h2>
            <p className="modal-subtitle">
              {member.gender === 'male' ? 'Cast Member' : 'Cast Member'} • {member.total_seasons} Season{member.total_seasons !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="modal-body">
          {member.bio && (
            <div className="bio-section">
              <p>{member.bio}</p>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">First Season:</span>
            <span className="info-value">Season {member.season} ({member.season_start})</span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Seasons:</span>
            <span className="info-value">{member.total_seasons}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
