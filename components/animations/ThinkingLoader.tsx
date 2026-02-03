import React from 'react';

/**
 * ThinkingLoader - Animated circular spinner for thinking/analyzing/planning operations
 * Shows a traveling arc around a pulsing center dot
 */
export const ThinkingLoader: React.FC = () => {
  return (
    <svg className="thinking-loader" viewBox="0 0 48 48">
      {/* Outer ring */}
      <circle className="ring" cx="24" cy="24" r="12"/>

      {/* Traveling arc */}
      <circle className="arc" cx="24" cy="24" r="12"/>

      {/* Center dot */}
      <circle className="center" cx="24" cy="24" r="3"/>
    </svg>
  );
};
