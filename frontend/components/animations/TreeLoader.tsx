import React from 'react';

/**
 * TreeLoader - Animated tree visualization for mind map operations
 * Shows a hierarchical structure pulsing from root to leaves
 */
export const TreeLoader: React.FC = () => {
  return (
    <svg className="loader-mindmap-nav" viewBox="0 0 48 48">
      {/* Edges */}
      <line className="edge e0" x1="24" y1="6"  x2="14" y2="20"/>
      <line className="edge e1" x1="24" y1="6"  x2="34" y2="20"/>
      <line className="edge e2" x1="14" y1="20" x2="7"  y2="36"/>
      <line className="edge e3" x1="14" y1="20" x2="21" y2="36"/>
      <line className="edge e4" x1="34" y1="20" x2="27" y2="36"/>
      <line className="edge e5" x1="34" y1="20" x2="41" y2="36"/>
      
      {/* Nodes */}
      <circle className="node n0" cx="24" cy="6"  r="4"/>
      <circle className="node n1" cx="14" cy="20" r="3.5"/>
      <circle className="node n2" cx="34" cy="20" r="3.5"/>
      <circle className="node n3" cx="7"  cy="36" r="3"/>
      <circle className="node n4" cx="21" cy="36" r="3"/>
      <circle className="node n5" cx="27" cy="36" r="3"/>
      <circle className="node n6" cx="41" cy="36" r="3"/>
    </svg>
  );
};
