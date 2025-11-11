import { useState, useRef } from 'react';
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
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Use smaller photos on mobile
  const isMobile = window.innerWidth < 768;
  const photoSize = isMobile ? 60 : 80;

  const spriteKey = getCastMemberSpriteKey(member.name);
  const spriteStyle = getSpriteStyle(spriteKey, photoSize);

  const borderColor = '#f0f0f0';

  // Check if sprite was found (spriteStyle will be empty object if not found)
  const hasSprite = Object.keys(spriteStyle).length > 0;

  // Only allow clicking if member has bio information
  const hasBio = member.bio && member.bio.length > 0;
  const handleClick = hasBio ? onClick : undefined;

  // Only enable hover behavior on non-mobile devices
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  // Mobile tap detection
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - touchStartRef.current.time;

    // If minimal movement (< 10px) and short duration (< 300ms), treat as tap
    if (distance < 10 && duration < 300 && hasBio) {
      onClick?.();
    }

    touchStartRef.current = null;
  };

  return (
    <div
      className={`cast-member ${isHovered ? 'hovered' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: isHovered ? 100 : 'auto',
      }}
    >
      <div
        className={`cast-member-photo ${!hasSprite ? 'no-photo' : ''}`}
        style={{
          ...spriteStyle,
          borderColor,
          cursor: hasBio ? 'pointer' : 'default',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!hasSprite && <span className="cast-member-name-text">{member.name}</span>}
      </div>
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
