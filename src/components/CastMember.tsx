import { useRef } from 'react';
import type { CastMember as CastMemberType } from '../types';
import { getSpriteStyle } from '../utils/sprites';
import { getCastMemberSpriteKey } from '../utils/dataParser';
import './CastMember.css';

interface CastMemberProps {
  member: CastMemberType;
  x: number;
  y: number;
  isActive?: boolean;
  castCount?: number;
  onClick?: () => void;
}

export default function CastMember({ member, x, y, isActive: _isActive = false, castCount = 0, onClick }: CastMemberProps) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Consistent photo sizing based on screen size
  const isMobile = window.innerWidth < 768;
  const photoSize = isMobile ? 50 : 80;

  const spriteKey = getCastMemberSpriteKey(member.name);
  const spriteStyle = getSpriteStyle(spriteKey, photoSize);

  const borderColor = '#f0f0f0';

  // Check if sprite was found (spriteStyle will be empty object if not found)
  const hasSprite = Object.keys(spriteStyle).length > 0;

  // Only allow clicking if member has bio information
  const hasBio = member.bio && member.bio.length > 0;
  const handleClick = hasBio ? onClick : undefined;

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

  // Split name into first name and rest
  const nameParts = member.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  // Radius for text positioning (photo radius + offset to clear border)
  const borderWidth = isMobile ? 2 : 3;
  const topTextClearance = 1; // More clearance for top text
  const bottomTextClearance = 0; // Less clearance for bottom text

  const topTextRadius = photoSize / 2 + borderWidth + topTextClearance;
  const bottomTextRadius = (photoSize / 1.5 + borderWidth + bottomTextClearance) * .95; // Larger radius for flatter curve

  return (
    <div
      className="cast-member"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div
        className={`cast-member-photo ${!hasSprite ? 'no-photo' : ''}`}
        style={{
          ...spriteStyle,
          borderColor,
          cursor: hasBio ? 'pointer' : 'default',
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!hasSprite && <span className="cast-member-name-text">{member.name}</span>}
      </div>

      {/* SVG circular text */}
      <svg
        className="cast-member-name-svg"
        width={photoSize * 3}
        height={photoSize * 3}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Top arc path (curved upward) */}
          <path
            id={`top-arc-${member.name.replace(/\s/g, '-')}`}
            d={`M ${photoSize * 1.5 - topTextRadius} ${photoSize * 1.5} A ${topTextRadius} ${topTextRadius} 0 0 1 ${photoSize * 1.5 + topTextRadius} ${photoSize * 1.5}`}
            fill="none"
          />
          {/* Bottom arc path (curved downward) */}
          <path
            id={`bottom-arc-${member.name.replace(/\s/g, '-')}`}
            d={`M ${photoSize * 1.5 - bottomTextRadius} ${photoSize * 1.5} A ${bottomTextRadius} ${bottomTextRadius} 0 0 0 ${photoSize * 1.5 + bottomTextRadius} ${photoSize * 1.5}`}
            fill="none"
          />
        </defs>

        {/* First name on top arc */}
        {firstName && (
          <text className="cast-member-name-svg-text">
            <textPath
              href={`#top-arc-${member.name.replace(/\s/g, '-')}`}
              startOffset="50%"
              textAnchor="middle"
              letterSpacing={isMobile ? '0.35em' : '0.35em'}
            >
              {firstName}
            </textPath>
          </text>
        )}

        {/* Last name on bottom arc */}
        {lastName && (
          <text className="cast-member-name-svg-text">
            <textPath
              href={`#bottom-arc-${member.name.replace(/\s/g, '-')}`}
              startOffset="50%"
              textAnchor="middle"
              letterSpacing={isMobile ? '0.35em' : '0.35em'}
            >
              {lastName}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
