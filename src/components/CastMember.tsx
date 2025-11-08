import { useState } from 'react';
import type { CastMember as CastMemberType } from '../types';
import { getSpriteStyle } from '../utils/sprites';
import { getCastMemberSpriteKey } from '../utils/dataParser';
import './CastMember.css';

interface CastMemberProps {
  member: CastMemberType;
  x: number;
  y: number;
  isActive?: boolean;
  onClick?: () => void;
}

export default function CastMember({ member, x, y, isActive: _isActive = false, onClick }: CastMemberProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Use smaller photos on mobile
  const isMobile = window.innerWidth < 768;
  const photoSize = isMobile ? 60 : 80;

  const spriteKey = getCastMemberSpriteKey(member.name);
  const spriteStyle = getSpriteStyle(spriteKey, photoSize);

  const borderColor = '#f0f0f0';

  // Check if sprite was found (spriteStyle will be empty object if not found)
  const hasSprite = Object.keys(spriteStyle).length > 0;

  // Forward wheel events to scroll container
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTop += e.deltaY;
    }
  };

  return (
    <div
      className={`cast-member ${isHovered ? 'hovered' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: isHovered ? 100 : 'auto',
      }}
      onWheel={handleWheel}
    >
      <div
        className={`cast-member-photo ${!hasSprite ? 'no-photo' : ''}`}
        style={{
          ...spriteStyle,
          borderColor,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      />
      {isHovered && (
        <div className="cast-member-tooltip">
          <div className="tooltip-name">{member.name}</div>
          <div className="tooltip-info">
            {member.total_seasons} season{member.total_seasons !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
