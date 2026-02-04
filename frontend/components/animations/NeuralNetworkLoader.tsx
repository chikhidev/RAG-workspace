import React from 'react';

/**
 * NeuralNetworkLoader - Animated neural network visualization for thinking/planning operations
 * Shows signal propagation through input → hidden → output layers
 */
export const NeuralNetworkLoader: React.FC = () => {
  return (
    <svg className="nn-loader" viewBox="0 0 48 48">
      {/* Resting edges: Input → Hidden */}
      <line className="edge" x1="6"  y1="10" x2="24" y2="7"/>
      <line className="edge" x1="6"  y1="10" x2="24" y2="17"/>
      <line className="edge" x1="6"  y1="20" x2="24" y2="17"/>
      <line className="edge" x1="6"  y1="20" x2="24" y2="27"/>
      <line className="edge" x1="6"  y1="30" x2="24" y2="27"/>
      <line className="edge" x1="6"  y1="30" x2="24" y2="37"/>
      <line className="edge" x1="6"  y1="10" x2="24" y2="27"/>
      <line className="edge" x1="6"  y1="20" x2="24" y2="7"/>
      <line className="edge" x1="6"  y1="30" x2="24" y2="17"/>

      {/* Resting edges: Hidden → Output */}
      <line className="edge" x1="24" y1="7"  x2="42" y2="14"/>
      <line className="edge" x1="24" y1="17" x2="42" y2="14"/>
      <line className="edge" x1="24" y1="17" x2="42" y2="34"/>
      <line className="edge" x1="24" y1="27" x2="42" y2="34"/>
      <line className="edge" x1="24" y1="27" x2="42" y2="14"/>
      <line className="edge" x1="24" y1="37" x2="42" y2="34"/>
      <line className="edge" x1="24" y1="7"  x2="42" y2="34"/>
      <line className="edge" x1="24" y1="37" x2="42" y2="14"/>

      {/* Signal overlays: Input → Hidden */}
      <line className="sig sig-ih0" x1="6"  y1="10" x2="24" y2="7"/>
      <line className="sig sig-ih1" x1="6"  y1="10" x2="24" y2="17"/>
      <line className="sig sig-ih2" x1="6"  y1="20" x2="24" y2="17"/>
      <line className="sig sig-ih3" x1="6"  y1="20" x2="24" y2="27"/>
      <line className="sig sig-ih4" x1="6"  y1="30" x2="24" y2="27"/>
      <line className="sig sig-ih5" x1="6"  y1="30" x2="24" y2="37"/>
      <line className="sig sig-ih6" x1="6"  y1="10" x2="24" y2="27"/>
      <line className="sig sig-ih7" x1="6"  y1="20" x2="24" y2="7"/>
      <line className="sig sig-ih8" x1="6"  y1="30" x2="24" y2="17"/>

      {/* Signal overlays: Hidden → Output */}
      <line className="sig sig-ho0" x1="24" y1="7"  x2="42" y2="14"/>
      <line className="sig sig-ho1" x1="24" y1="17" x2="42" y2="14"/>
      <line className="sig sig-ho2" x1="24" y1="17" x2="42" y2="34"/>
      <line className="sig sig-ho3" x1="24" y1="27" x2="42" y2="34"/>
      <line className="sig sig-ho4" x1="24" y1="27" x2="42" y2="14"/>
      <line className="sig sig-ho5" x1="24" y1="37" x2="42" y2="34"/>
      <line className="sig sig-ho6" x1="24" y1="7"  x2="42" y2="34"/>
      <line className="sig sig-ho7" x1="24" y1="37" x2="42" y2="14"/>

      {/* Nodes - Input layer */}
      <circle className="node n-in0" cx="6"  cy="10" r="2.2"/>
      <circle className="node n-in1" cx="6"  cy="20" r="2.2"/>
      <circle className="node n-in2" cx="6"  cy="30" r="2.2"/>

      {/* Nodes - Hidden layer */}
      <circle className="node n-h0" cx="24" cy="7"  r="2"/>
      <circle className="node n-h1" cx="24" cy="17" r="2"/>
      <circle className="node n-h2" cx="24" cy="27" r="2"/>
      <circle className="node n-h3" cx="24" cy="37" r="2"/>

      {/* Nodes - Output layer */}
      <circle className="node n-o0" cx="42" cy="14" r="2.4"/>
      <circle className="node n-o1" cx="42" cy="34" r="2.4"/>
    </svg>
  );
};
