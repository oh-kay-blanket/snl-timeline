import { useEffect } from 'react';
import './AboutCreditsModal.css';

interface AboutCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutCreditsModal({ isOpen, onClose }: AboutCreditsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="about-modal-backdrop" onClick={handleBackdropClick}>
      <div className="about-modal">
        <button className="about-modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="about-modal-content">
          <div className="about-modal-header">
            <h2>About SNL Timeline</h2>
          </div>

          <div className="about-modal-body">
            <p className="about-modal-creator">Created by Kayla Plunkett</p>

            <div className="about-modal-links">
              <a
                href="https://ohkayblanket.com"
                target="_blank"
                rel="noopener noreferrer"
                className="about-modal-link"
              >
                Portfolio
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <a
                href="https://github.com/oh-kay-blanket/snl-timeline"
                target="_blank"
                rel="noopener noreferrer"
                className="about-modal-link"
              >
                GitHub Repository
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
