import React from 'react';
import './SimpleSpinner.css';

interface SimpleSpinnerProps {
  accentColor?: string;
  borderColor?: string;
  size?: number; // pixels
}

/**
 * SimpleSpinner - Animated circular spinner for all loading operations
 * Uses CSS variables for colors so `prefers-color-scheme` defaults apply.
 */
export const SimpleSpinner: React.FC<SimpleSpinnerProps> = ({
  accentColor,
  borderColor,
  size = 16,
}) => {
  const style = (() => {
    const s: React.CSSProperties = {
      width: `${size}px`,
      height: `${size}px`,
    };
    if (accentColor) (s as any)['--spinner-accent'] = accentColor;
    if (borderColor) (s as any)['--spinner-border'] = borderColor;
    return s;
  })();

  return (
    <div className="simple-spinner-container" style={style} aria-hidden>
      <div
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: 'var(--spinner-border)' }}
      />
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: 'var(--spinner-accent)' }}
      />
    </div>
  );
};
