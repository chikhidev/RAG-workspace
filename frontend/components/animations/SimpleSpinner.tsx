import React from 'react';

/**
 * SimpleSpinner - Animated circular spinner for all loading operations
 * Shows a traveling arc around a pulsing center dot
 */
export const SimpleSpinner: React.FC = () => {
  return (
    <div className="relative w-4 h-4">
      <div className="absolute inset-0 rounded-full border-2 border-brand-border"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-accent animate-spin"></div>
    </div>
  );
};
