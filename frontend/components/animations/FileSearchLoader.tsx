import React from 'react';

/**
 * FileSearchLoader - Animated spinner for file search/searching operations
 * Shows a traveling arc around a pulsing center dot
 */
export const FileSearchLoader: React.FC = () => {
  return (
    <svg className="file-loader" viewBox="0 0 48 48">
      {/* Outer ring */}
      <circle className="ring" cx="24" cy="24" r="12"/>

      {/* Traveling arc */}
      <circle className="arc" cx="24" cy="24" r="12"/>

      {/* Center dot */}
      <circle className="center" cx="24" cy="24" r="3"/>
    </svg>
  );
};
