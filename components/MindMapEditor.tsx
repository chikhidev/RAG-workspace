import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MindNode, MindMap, MindNodeConnection } from '../types';
import { mindNodeService } from '../services/mindNodeService';
import {
  X,
  Plus,
  Trash2,
  Link2,
  Move,
  Type,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mindMaps: MindMap[];
  onSaveMindMaps: (maps: MindMap[]) => void;
}

interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
}

interface ConnectionDragState {
  fromNodeId: string;
  fromPort: 'left' | 'right';
  mouseX: number;
  mouseY: number;
  snapToNodeId?: string;
  snapToPort?: 'left' | 'right';
}

const SNAP_DISTANCE = 30; // Pixels to activate magnetic snap
const GRID_SIZE = 20; // Grid cell size in pixels

export const MindMapEditor: React.FC<Props> = ({
  isOpen,
  onClose,
  mindMaps,
  onSaveMindMaps,
}) => {
  const [currentMapIndex, setCurrentMapIndex] = useState(0);
  const [currentMap, setCurrentMap] = useState<MindMap | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [connectionDragState, setConnectionDragState] = useState<ConnectionDragState | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<MindMap[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  // Update canvas rect on mount and resize
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };
    updateCanvasRect();
    window.addEventListener('resize', updateCanvasRect);
    return () => window.removeEventListener('resize', updateCanvasRect);
  }, []);

  // Initialize current map
  useEffect(() => {
    if (mindMaps.length > 0) {
      setCurrentMap(mindMaps[currentMapIndex] || mindMaps[0]);
    } else {
      // Create a default map
      const newMap = mindNodeService.createMindMap('My Mind Map');
      setCurrentMap(newMap);
    }
  }, [mindMaps, currentMapIndex]);

  // Save to history for undo
  const saveToHistory = useCallback((map: MindMap) => {
    setHistory((prev) => {
      // Remove any future history when making a new change
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(map);
      // Keep only last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex((idx) => idx - 1);
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Save current map back to the list
  const saveCurrentMap = useCallback(() => {
    if (!currentMap) return;

    const newMaps = [...mindMaps];
    if (newMaps[currentMapIndex]) {
      newMaps[currentMapIndex] = currentMap;
    } else {
      newMaps.push(currentMap);
    }
    onSaveMindMaps(newMaps);
  }, [currentMap, mindMaps, currentMapIndex, onSaveMindMaps]);

  // Create a new mind map
  const handleCreateMap = () => {
    const newMap = mindNodeService.createMindMap(`Mind Map ${mindMaps.length + 1}`);
    const newMaps = [...mindMaps, newMap];
    onSaveMindMaps(newMaps);
    setCurrentMapIndex(newMaps.length - 1);
    setCurrentMap(newMap);
  };

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && history.length > 0) {
      const newIndex = historyIndex - 1;
      const previousMap = history[newIndex];
      setHistoryIndex(newIndex);
      setCurrentMap(previousMap);
      
      const newMaps = [...mindMaps];
      newMaps[currentMapIndex] = previousMap;
      onSaveMindMaps(newMaps);
    }
  }, [historyIndex, history, mindMaps, currentMapIndex, onSaveMindMaps]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextMap = history[newIndex];
      setHistoryIndex(newIndex);
      setCurrentMap(nextMap);
      
      const newMaps = [...mindMaps];
      newMaps[currentMapIndex] = nextMap;
      onSaveMindMaps(newMaps);
    }
  }, [historyIndex, history, mindMaps, currentMapIndex, onSaveMindMaps]);

  // Duplicate selected node
  const handleDuplicateNode = useCallback(() => {
    if (!currentMap || !selectedNodeId) return;

    const nodeToDuplicate = currentMap.nodes[selectedNodeId];
    if (!nodeToDuplicate) return;

    saveToHistory(currentMap);
    const newNode = mindNodeService.createNode(
      nodeToDuplicate.text + ' (copy)',
      nodeToDuplicate.x + 50,
      nodeToDuplicate.y + 50,
      nodeToDuplicate.color
    );
    const updatedMap = mindNodeService.addNode(currentMap, newNode);
    setCurrentMap(updatedMap);

    const newMaps = [...mindMaps];
    newMaps[currentMapIndex] = updatedMap;
    onSaveMindMaps(newMaps);
  }, [currentMap, selectedNodeId, mindMaps, currentMapIndex, onSaveMindMaps, saveToHistory]);

  // Add a new node
  const handleAddNode = (x: number = 100, y: number = 100) => {
    if (!currentMap) return;

    saveToHistory(currentMap);
    const newNode = mindNodeService.createNode('New Node', x, y);
    const updatedMap = mindNodeService.addNode(currentMap, newNode);
    setCurrentMap(updatedMap);
    
    const newMaps = [...mindMaps];
    newMaps[currentMapIndex] = updatedMap;
    onSaveMindMaps(newMaps);
  };

  // Delete selected node
  const handleDeleteNode = useCallback(() => {
    if (!currentMap || !selectedNodeId) return;

    saveToHistory(currentMap);
    const updatedMap = mindNodeService.removeNode(currentMap, selectedNodeId);
    setCurrentMap(updatedMap);
    setSelectedNodeId(null);
    
    const newMaps = [...mindMaps];
    newMaps[currentMapIndex] = updatedMap;
    onSaveMindMaps(newMaps);
  }, [currentMap, selectedNodeId, mindMaps, currentMapIndex, onSaveMindMaps, saveToHistory]);

  // Delete selected connection
  const handleDeleteConnection = useCallback(() => {
    if (!currentMap || !selectedConnectionId) return;

    saveToHistory(currentMap);
    const updatedConnections = currentMap.connections.filter(conn => conn.id !== selectedConnectionId);
    const updatedMap = { ...currentMap, connections: updatedConnections };
    setCurrentMap(updatedMap);
    setSelectedConnectionId(null);
    
    const newMaps = [...mindMaps];
    newMaps[currentMapIndex] = updatedMap;
    onSaveMindMaps(newMaps);
  }, [currentMap, selectedConnectionId, mindMaps, currentMapIndex, onSaveMindMaps, saveToHistory]);

  // Start dragging a node
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!currentMap) return;
    
    // Don't start drag if clicking on port
    if ((e.target as HTMLElement).classList.contains('port')) {
      return;
    }

    e.stopPropagation();
    const node = currentMap.nodes[nodeId];
    if (!node) return;

    setSelectedNodeId(nodeId);
    setDragState({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentMap) return;

    // Handle node dragging
    if (dragState) {
      const dx = (e.clientX - dragState.startX) / zoom;
      const dy = (e.clientY - dragState.startY) / zoom;
      const newX = dragState.nodeStartX + dx;
      const newY = dragState.nodeStartY + dy;

      const updatedMap = mindNodeService.updateNodePosition(
        currentMap,
        dragState.nodeId,
        newX,
        newY
      );
      setCurrentMap(updatedMap);
    }

    // Handle connection dragging with magnetic snapping
    if (connectionDragState && canvasRect) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const snapPort = findSnapPort(mouseX, mouseY, connectionDragState.fromNodeId);
      
      setConnectionDragState({
        ...connectionDragState,
        mouseX,
        mouseY,
        snapToNodeId: snapPort?.nodeId,
        snapToPort: snapPort?.port,
      });
    }

    // Handle canvas panning
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent) => {
    // Update canvas rect for accurate positioning
    if (canvasRef.current) {
      setCanvasRect(canvasRef.current.getBoundingClientRect());
    }

    if (dragState) {
      saveCurrentMap();
      setDragState(null);
    }

    // Handle connection completion with magnetic snap
    if (connectionDragState && currentMap) {
      const { snapToNodeId, snapToPort } = connectionDragState;
      
      if (snapToNodeId && snapToPort) {
        // Use magnetic snap target
        if (!mindNodeService.wouldCreateCycle(currentMap, connectionDragState.fromNodeId, snapToNodeId) &&
            connectionDragState.fromNodeId !== snapToNodeId) {
          const connection = mindNodeService.createConnection(
            connectionDragState.fromNodeId,
            connectionDragState.fromPort,
            snapToNodeId,
            snapToPort
          );
          const updatedMap = mindNodeService.addConnection(currentMap, connection);
          console.log('Updated map connections:', updatedMap.connections.length);
          setCurrentMap(updatedMap);
          
          // Save the updated map immediately
          const newMaps = [...mindMaps];
          if (newMaps[currentMapIndex]) {
            newMaps[currentMapIndex] = updatedMap;
          } else {
            newMaps.push(updatedMap);
          }
          onSaveMindMaps(newMaps);
        }
      }
      setConnectionDragState(null);
    }

    setIsPanning(false);
  };

  // Start creating a connection
  const handlePortMouseDown = (
    e: React.MouseEvent,
    nodeId: string,
    port: 'left' | 'right'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectionDragState({
      fromNodeId: nodeId,
      fromPort: port,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  // Complete creating a connection
  const handlePortMouseUp = (
    e: React.MouseEvent,
    nodeId: string,
    port: 'left' | 'right'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!connectionDragState || !currentMap) {
      return;
    }

    // Check if this would create a cycle
    if (mindNodeService.wouldCreateCycle(currentMap, connectionDragState.fromNodeId, nodeId)) {
      alert('Cannot create connection: This would create a cycle!');
      setConnectionDragState(null);
      return;
    }

    // Don't connect node to itself
    if (connectionDragState.fromNodeId === nodeId) {
      setConnectionDragState(null);
      return;
    }

    const connection = mindNodeService.createConnection(
      connectionDragState.fromNodeId,
      connectionDragState.fromPort,
      nodeId,
      port
    );

    const updatedMap = mindNodeService.addConnection(currentMap, connection);
    console.log('Updated map connections:', updatedMap.connections.length);
    setCurrentMap(updatedMap);
    setConnectionDragState(null);
    
    // Save the updated map immediately
    const newMaps = [...mindMaps];
    if (newMaps[currentMapIndex]) {
      newMaps[currentMapIndex] = updatedMap;
    } else {
      newMaps.push(updatedMap);
    }
    onSaveMindMaps(newMaps);
  };

  // Start editing node text
  const handleNodeDoubleClick = (nodeId: string) => {
    if (!currentMap) return;
    const node = currentMap.nodes[nodeId];
    if (!node) return;

    setEditingNodeId(nodeId);
    setEditText(node.text);
  };

  // Auto-save text on change
  const handleTextChange = (nodeId: string, newText: string) => {
    if (!currentMap) return;

    const updatedMap = mindNodeService.updateNodeText(currentMap, nodeId, newText);
    setCurrentMap(updatedMap);
    
    // Auto-save immediately
    const newMaps = [...mindMaps];
    if (newMaps[currentMapIndex]) {
      newMaps[currentMapIndex] = updatedMap;
    } else {
      newMaps.push(updatedMap);
    }
    onSaveMindMaps(newMaps);
  };

  // Get port position in world coordinates
  const getPortPosition = (nodeId: string, port: 'left' | 'right') => {
    if (!currentMap) return { x: 0, y: 0 };
    
    const node = currentMap.nodes[nodeId];
    if (!node) return { x: 0, y: 0 };

    const x = port === 'left' ? node.x : node.x + node.width;
    const y = node.y + node.height / 2;

    return { x, y };
  };

  // Convert world coordinates to screen coordinates
  const worldToScreen = (x: number, y: number) => {
    return {
      x: x * zoom + pan.x,
      y: y * zoom + pan.y,
    };
  };

  // Convert screen coordinates to world coordinates
  const screenToWorld = (x: number, y: number) => {
    return {
      x: (x - pan.x) / zoom,
      y: (y - pan.y) / zoom,
    };
  };

  // Find nearest port to snap to
  const findSnapPort = (mouseX: number, mouseY: number, excludeNodeId: string) => {
    if (!currentMap) return null;

    const worldPos = screenToWorld(mouseX, mouseY);
    let closestPort: { nodeId: string; port: 'left' | 'right'; distance: number } | null = null;

    Object.values(currentMap.nodes).forEach((node) => {
      if (node.id === excludeNodeId) return;

      ['left', 'right'].forEach((port) => {
        const portPos = getPortPosition(node.id, port as 'left' | 'right');
        const dx = portPos.x - worldPos.x;
        const dy = portPos.y - worldPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < SNAP_DISTANCE / zoom && (!closestPort || distance < closestPort.distance)) {
          closestPort = { nodeId: node.id, port: port as 'left' | 'right', distance };
        }
      });
    });

    return closestPort;
  };

  // Start canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !dragState && !connectionDragState) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedConnectionId(null); // Deselect connection when clicking canvas
      setSelectedNodeId(null); // Deselect node when clicking canvas
    }
  };

  // Zoom in/out
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when editing text
      if (editingNodeId) return;

      const isMod = e.metaKey || e.ctrlKey;

      // Zoom: Ctrl/Cmd + Plus/Minus
      if (isMod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.1, 2));
      } else if (isMod && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.1, 0.5));
      }
      // Reset zoom: Ctrl/Cmd + 0
      else if (isMod && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
      // Undo: Ctrl/Cmd + Z
      else if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl/Cmd + Shift + Z
      else if (isMod && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
      }
      // Duplicate: Ctrl/Cmd + D
      else if (isMod && e.key === 'd') {
        e.preventDefault();
        handleDuplicateNode();
      }
      // Delete: Delete or Backspace
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedNodeId) {
          handleDeleteNode();
        } else if (selectedConnectionId) {
          handleDeleteConnection();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, editingNodeId, selectedNodeId, selectedConnectionId, handleUndo, handleRedo, handleDuplicateNode, handleDeleteNode, handleDeleteConnection]);

  if (!isOpen || !currentMap) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-brand-darker">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-base/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-100">Mind Map Editor</h2>
          <input
            type="text"
            value={currentMap.name}
            onChange={(e) => setCurrentMap({ ...currentMap, name: e.target.value })}
            onBlur={saveCurrentMap}
            className="px-3 py-1.5 bg-brand-darker border border-brand-border rounded-lg text-sm text-gray-200 outline-none focus:border-brand-accent/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-brand-border/50 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-brand-border/50 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-brand-border/50 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Reset View"
          >
            <Maximize2 size={18} />
          </button>

          <div className="w-px h-6 bg-brand-border mx-2" />

          {/* Action buttons */}
          <button
            onClick={() => handleAddNode(400, 300)}
            className="flex items-center gap-2 px-3 py-2 bg-brand-accent hover:bg-brand-accent/80 rounded-lg transition-colors text-white text-sm font-medium"
          >
            <Plus size={16} />
            Add Node
          </button>

          {selectedNodeId && (
            <button
              onClick={handleDeleteNode}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors text-red-400 text-sm font-medium"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-border/50 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-[#0a0a0a] cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          setZoom((z) => Math.min(Math.max(z + delta, 0.5), 2));
        }}
      >
        {/* Grid background pattern */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <pattern
              id="grid"
              width={GRID_SIZE * zoom}
              height={GRID_SIZE * zoom}
              patternUnits="userSpaceOnUse"
              x={pan.x % (GRID_SIZE * zoom)}
              y={pan.y % (GRID_SIZE * zoom)}
            >
              <path
                d={`M ${GRID_SIZE * zoom} 0 L 0 0 0 ${GRID_SIZE * zoom}`}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Render existing connections */}
          {currentMap.connections.map((conn) => {
            const fromWorldPos = getPortPosition(conn.fromNodeId, conn.fromPort);
            const toWorldPos = getPortPosition(conn.toNodeId, conn.toPort);
            const fromPos = worldToScreen(fromWorldPos.x, fromWorldPos.y);
            const toPos = worldToScreen(toWorldPos.x, toWorldPos.y);
            const isSelected = conn.id === selectedConnectionId;

            return (
              <g key={conn.id}>
                {/* Invisible wider line for easier selection */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="transparent"
                  strokeWidth="12"
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConnectionId(conn.id);
                    setSelectedNodeId(null);
                  }}
                />
                {/* Visible line */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isSelected ? '#ffffff' : '#8b5cf6'}
                  strokeWidth={isSelected ? '4' : '3'}
                  className="pointer-events-none"
                />
              </g>
            );
          })}

          {/* Render connection being dragged */}
          {connectionDragState && (() => {
            const startWorldPos = getPortPosition(connectionDragState.fromNodeId, connectionDragState.fromPort);
            const startScreenPos = worldToScreen(startWorldPos.x, startWorldPos.y);
            
            let endX = connectionDragState.mouseX;
            let endY = connectionDragState.mouseY;
            
            // Snap to port if close enough
            if (connectionDragState.snapToNodeId && connectionDragState.snapToPort) {
              const snapWorldPos = getPortPosition(connectionDragState.snapToNodeId, connectionDragState.snapToPort);
              const snapScreenPos = worldToScreen(snapWorldPos.x, snapWorldPos.y);
              endX = snapScreenPos.x;
              endY = snapScreenPos.y;
            }

            return (
              <>
                <line
                  x1={startScreenPos.x}
                  y1={startScreenPos.y}
                  x2={endX}
                  y2={endY}
                  stroke={connectionDragState.snapToNodeId ? "#8b5cf6" : "#6b7280"}
                  strokeWidth="3"
                  strokeDasharray={connectionDragState.snapToNodeId ? "0" : "5,5"}
                />
                {/* Snap indicator circle */}
                {connectionDragState.snapToNodeId && (
                  <circle
                    cx={endX}
                    cy={endY}
                    r="8"
                    fill="#8b5cf6"
                    opacity="0.5"
                    className="animate-ping"
                  />
                )}
              </>
            );
          })()}
        </svg>

        {/* Render nodes */}
        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {Object.values(currentMap.nodes).map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isRoot = node.id === currentMap.rootNodeId;
            
            return (
              <div
                key={node.id}
                className="absolute cursor-move select-none"
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onDoubleClick={() => handleNodeDoubleClick(node.id)}
              >
              {/* Entrypoint badge for root node */}
              {isRoot && (
                <div 
                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-2 py-0.5 text-[10px] font-bold text-yellow-400 whitespace-nowrap"
                  title="ENTRYPOINT: This text determines if the LLM will explore this mind map. Make it descriptive and clear about the topic."
                >
                  ENTRYPOINT
                </div>
              )}

              {/* Node box */}
              <div
                className={`w-full h-full rounded-xl flex items-center justify-center p-3 shadow-lg pointer-events-auto transition-all bg-brand-base ${
                  isSelected ? 'border-[3px] border-white' : 'border-2 border-brand-border'
                }`}
              >
                {editingNodeId === node.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => {
                      setEditText(e.target.value);
                      handleTextChange(node.id, e.target.value);
                    }}
                    onBlur={() => setEditingNodeId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        setEditingNodeId(null);
                      }
                    }}
                    className="w-full bg-brand-base border border-brand-border rounded px-2 py-1 text-sm text-white outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p 
                    className="text-sm font-medium text-white text-center break-words cursor-text hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeDoubleClick(node.id);
                    }}
                    title="Click to edit"
                  >
                    {node.text}
                  </p>
                )}
              </div>

              {/* Left port - hidden for root/entrypoint node */}
              {!isRoot && (
                <div
                  className="port absolute w-3 h-3 bg-gray-500 border border-gray-400 rounded-full cursor-pointer hover:scale-125 transition-transform pointer-events-auto"
                  style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
                  onMouseDown={(e) => handlePortMouseDown(e, node.id, 'left')}
                  onMouseUp={(e) => handlePortMouseUp(e, node.id, 'left')}
                />
              )}

                {/* Right port */}
                <div
                  className="port absolute w-3 h-3 bg-gray-500 border border-gray-400 rounded-full cursor-pointer hover:scale-125 transition-transform pointer-events-auto"
                  style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
                  onMouseDown={(e) => handlePortMouseDown(e, node.id, 'right')}
                  onMouseUp={(e) => handlePortMouseUp(e, node.id, 'right')}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-6 py-3 border-t border-brand-border bg-brand-base/50 text-xs text-gray-400 flex items-center justify-between">
        <div>
          {Object.keys(currentMap.nodes).length} nodes • {currentMap.connections.length} connections
        </div>
        <div>
          {selectedNodeId && currentMap.nodes[selectedNodeId] && (
            <span>
              Selected: {currentMap.nodes[selectedNodeId].text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
