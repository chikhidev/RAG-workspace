import React from 'react';

/**
 * FileSearchLoader - Animated file search visualization
 * Shows stacked files with a magnifying glass scanning through text
 */
export const FileSearchLoader: React.FC = () => {
  return (
    <svg className="file-loader" viewBox="0 0 48 48">
      {/* Back file */}
      <rect className="file" x="8"  y="5"  width="22" height="28" rx="2.5"/>
      {/* Mid file */}
      <rect className="file" x="12" y="8"  width="22" height="28" rx="2.5"/>
      {/* Front file */}
      <rect className="file" x="16" y="11" width="22" height="28" rx="2.5"/>

      {/* Dog-ear on front file */}
      <path d="M32,11 L38,11 L38,17 Z" fill="#0f1117" stroke="#2a2f3f" strokeWidth="1" strokeLinejoin="round"/>
      <line x1="32" y1="11" x2="32" y2="17" stroke="#2a2f3f" strokeWidth="1"/>

      {/* Text lines on front file (with scan flash) */}
      <line className="line-flash lf0" x1="19" y1="20" x2="33" y2="20"/>
      <line className="line-flash lf1" x1="19" y1="23" x2="35" y2="23"/>
      <line className="line-flash lf2" x1="19" y1="26" x2="31" y2="26"/>
      <line className="line-flash lf3" x1="19" y1="29" x2="34" y2="29"/>
      <line className="line-flash lf4" x1="19" y1="32" x2="30" y2="32"/>
      <line className="line-flash lf5" x1="19" y1="35" x2="33" y2="35"/>

      {/* Magnifying glass */}
      <g style={{ transformOrigin: '36px 24px' }}>
        <circle className="glass-lens"   cx="36" cy="24" r="6.5"/>
        <circle className="glass-circle" cx="36" cy="24" r="6.5"/>
        <line   className="glass-handle" x1="41" y1="29" x2="44" y2="32"/>
      </g>
    </svg>
  );
};
