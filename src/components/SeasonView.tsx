import { useRef } from 'react';
import type { SeasonWithCast } from '../types';
import './SeasonView.css';

interface SeasonViewProps {
  season: SeasonWithCast;
  isActive: boolean;
}

export default function SeasonView({ season }: SeasonViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="season-view">
      {/* Empty container for scroll snap points */}
    </div>
  );
}
