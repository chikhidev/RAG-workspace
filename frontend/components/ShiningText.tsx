import React from 'react';
import '../styles/ShiningText.css';

interface ShiningTextProps {
  text?: string;
  duration?: number;
  variant?: 'shine' | 'chrome';
}

const ShiningText: React.FC<ShiningTextProps> = ({ 
  text = 'Executing', 
  duration = 2,
  variant = 'shine'
}) => {
  return (
    <div 
      className={`shining-text ${variant}`}
      style={{ animationDuration: `${duration}s` }}
    >
      {text}
    </div>
  );
};

export default ShiningText;