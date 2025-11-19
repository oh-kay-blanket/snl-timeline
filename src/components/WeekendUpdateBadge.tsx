import './WeekendUpdateBadge.css';

interface BadgePosition {
  x: number;
  y: number;
}

interface WeekendUpdateBadgeProps {
  positions: BadgePosition[];
}

export default function WeekendUpdateBadge({ positions }: WeekendUpdateBadgeProps) {
  // Always render exactly 3 badges with stable keys for smooth transitions
  // If fewer positions are provided, use the first position as fallback
  const getBadgePosition = (index: number): BadgePosition => {
    return positions[index] || positions[0] || { x: 0, y: 0 };
  };

  // Don't render if no positions at all
  if (positions.length === 0) return null;

  return (
    <>
      {[0, 1, 2].map((index) => {
        const pos = getBadgePosition(index);
        return (
          <img
            key={index}
            src="/images/weekend-update.png"
            alt="Weekend Update"
            className="wu-badge-floating"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
            }}
          />
        );
      })}
    </>
  );
}
