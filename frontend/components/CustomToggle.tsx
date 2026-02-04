import React from 'react';
import './CustomToggle.css';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  activeColor = '#c1603c77',
  inactiveColor = '#474747',
}) => {
  return (
    <div 
      className="toggle-container"
      style={{
        '--active-color': activeColor,
        '--inactive-color': inactiveColor,
      } as React.CSSProperties}
    >
      <input
        type="checkbox"
        className="toggle-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label="Toggle switch"
      />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 292 142" className="toggle">
        <path
          d="M71 142C31.7878 142 0 110.212 0 71C0 31.7878 31.7878 0 71 0C110.212 0 119 30 146 30C173 30 182 0 221 0C260 0 292 31.7878 292 71C292 110.212 260.212 142 221 142C181.788 142 173 112 146 112C119 112 110.212 142 71 142Z"
          className="toggle-background"
        />
        <g filter="url('#goo')">
          <rect fill="#fff" rx="29" height="58" width="116" y="42" x="13" className="toggle-circle-center" />
          <rect fill="#fff" rx="58" height="114" width="114" y="14" x="14" className="toggle-circle left" />
          <rect fill="#fff" rx="58" height="114" width="114" y="14" x="164" className="toggle-circle right" />
        </g>
        <filter id="goo">
          <feGaussianBlur stdDeviation="10" result="blur" in="SourceGraphic" />
          <feColorMatrix result="goo" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" mode="matrix" in="blur" />
        </filter>
      </svg>
    </div>
  );
};

export default CustomToggle;
