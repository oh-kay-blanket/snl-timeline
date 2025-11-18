import './SeasonInfoButton.css';

interface SeasonInfoButtonProps {
  onClick: () => void;
}

export default function SeasonInfoButton({ onClick }: SeasonInfoButtonProps) {
  return (
    <button className="season-info-button" onClick={onClick} aria-label="View season details">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 11v6M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
