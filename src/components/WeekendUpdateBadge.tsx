import './WeekendUpdateBadge.css';

interface BadgePosition {
  x: number;
  y: number;
}

interface WeekendUpdateBadgeProps {
  positions: BadgePosition[];
}

export default function WeekendUpdateBadge({ positions }: WeekendUpdateBadgeProps) {
  if (positions.length === 0) return null;

  return (
    <>
      {positions.map((pos, index) => (
        <img
          key={index}
          src="/images/weekend-update.jpg"
          alt="Weekend Update"
          className="wu-badge-floating"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
          }}
        />
      ))}
    </>
  );
}
