import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  Package, 
  FileText, 
  User, 
  Palette, 
  Lightbulb, 
  Camera, 
  Image, 
  Play, 
  Music, 
  Mic, 
  Volume2, 
  Settings, 
  Edit, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Minimize2, 
  Clapperboard,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AdvancedNodeSettings } from './AdvancedNodeSettings';
import executivePortrait from '@/assets/nodes/executive-portrait.jpg';
import detectiveScene from '@/assets/nodes/detective-scene.jpg';
import spacePilot from '@/assets/nodes/space-pilot.jpg';
import cyberpunkStreet from '@/assets/nodes/cyberpunk-street.jpg';
import spaceshipBridge from '@/assets/nodes/spaceship-bridge.jpg';
import boardroomBg from '@/assets/nodes/boardroom-bg.jpg';
import lightingSetup from '@/assets/nodes/lighting-setup.jpg';
import cameraEquipment from '@/assets/nodes/camera-equipment.jpg';
import businessWardrobe from '@/assets/nodes/business-wardrobe.jpg';
import audioMixing from '@/assets/nodes/audio-mixing.jpg';
import filmScript from '@/assets/nodes/film-script.jpg';
import katanaProp from '@/assets/nodes/katana-prop.jpg';

// Data structure interfaces
export interface Node {
  id: string;
  type: 'script' | 'character' | 'style' | 'lighting' | 'background' | 'location' | 'camera' | 'prop' | 'wardrobe' | 'image' | 'video' | 'music' | 'sfx' | 'voiceover' | 'timeline' | 'weather' | 'finalcut';
  title: string;
  description: string;
  x: number;
  y: number;
  connections: string[];
  status: 'idle' | 'processing' | 'complete' | 'error';
  thumbnail?: string;
}

export interface Scene {
  id: string;
  title: string;
  duration: number;
  color: string;
  preview: string;
  position: { x: number; y: number };
  nodes: Node[];
}

export interface VirtuCastWorkspaceProps {
  activeMode: string;
  isZenMode: boolean;
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
}

export interface PanState {
  isPanning: boolean;
  startX: number;
  startY: number;
  startViewportX: number;
  startViewportY: number;
}

// Node type definitions
const nodeTypes = {
  script: { icon: FileText, color: 'text-slate-400', bgColor: 'bg-slate-400/10', borderColor: 'border-slate-400/50' },
  character: { icon: User, color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/50' },
  style: { icon: Palette, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-400/10', borderColor: 'border-fuchsia-400/50' },
  lighting: { icon: Lightbulb, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/50' },
  background: { icon: Image, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/50' },
  location: { icon: Package, color: 'text-teal-400', bgColor: 'bg-teal-400/10', borderColor: 'border-teal-400/50' },
  camera: { icon: Camera, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', borderColor: 'border-cyan-400/50' },
  prop: { icon: Package, color: 'text-orange-400', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/50' },
  wardrobe: { icon: Package, color: 'text-pink-400', bgColor: 'bg-pink-400/10', borderColor: 'border-pink-400/50' },
  image: { icon: Image, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/50' },
  video: { icon: Play, color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/50' },
  music: { icon: Music, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/50' },
  sfx: { icon: Volume2, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/50' },
  voiceover: { icon: Mic, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/50' },
  timeline: { icon: Clapperboard, color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/50' },
  weather: { icon: Package, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', borderColor: 'border-indigo-400/50' },
  finalcut: { icon: Package, color: 'text-accent', bgColor: 'bg-accent/10', borderColor: 'border-accent/50' },
} as const;

// Collision detection and positioning
const GRID_SIZE = 80;
const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;
const MIN_NODE_SPACING = 60;

const getGridPosition = (x: number, y: number) => ({
  x: Math.round(x / GRID_SIZE) * GRID_SIZE,
  y: Math.round(y / GRID_SIZE) * GRID_SIZE
});

const checkNodeCollision = (x: number, y: number, nodeId: string, nodes: Node[]) => {
  return nodes.some(node => 
    node.id !== nodeId &&
    x < node.x + NODE_WIDTH + MIN_NODE_SPACING &&
    x + NODE_WIDTH + MIN_NODE_SPACING > node.x &&
    y < node.y + NODE_HEIGHT + MIN_NODE_SPACING &&
    y + NODE_HEIGHT + MIN_NODE_SPACING > node.y
  );
};

const findNearestValidPosition = (x: number, y: number, nodeId: string, nodes: Node[]) => {
  const gridPos = getGridPosition(x, y);
  let testX = gridPos.x;
  let testY = gridPos.y;
  
  // Try positions in expanding spiral
  for (let radius = 0; radius < 20; radius++) {
    for (let angle = 0; angle < 360; angle += 45) {
      const offsetX = Math.cos(angle * Math.PI / 180) * radius * GRID_SIZE;
      const offsetY = Math.sin(angle * Math.PI / 180) * radius * GRID_SIZE;
      testX = gridPos.x + offsetX;
      testY = gridPos.y + offsetY;
      
      if (!checkNodeCollision(testX, testY, nodeId, nodes)) {
        return { x: testX, y: testY };
      }
    }
  }
  
  return { x: testX, y: testY };
};

// Simple initial scene with properly spaced nodes
const createInitialScenes = (): Scene[] => {
  const baseNodes: Node[] = [
    // Row 1 - Scripts
    { id: 'script1-master', type: 'script', title: 'Act I Master Script', description: 'Complete first act screenplay', x: 100, y: 50, connections: ['script1-1', 'script1-2'], status: 'complete', thumbnail: filmScript },
    { id: 'script1-1', type: 'script', title: 'Corporate Presentation', description: 'Boardroom power dynamics', x: 450, y: 50, connections: ['char1-1'], status: 'complete', thumbnail: filmScript },
    { id: 'script1-2', type: 'script', title: 'Data Discovery', description: 'Alira finds suspicious files', x: 450, y: 250, connections: ['char1-1'], status: 'complete', thumbnail: filmScript },
    
    // Row 2 - Characters  
    { id: 'char1-1', type: 'character', title: 'Alira Chen', description: 'Corporate Executive / The One', x: 800, y: 150, connections: ['style1-1'], status: 'complete', thumbnail: executivePortrait },
    { id: 'char1-2', type: 'character', title: 'Board Members', description: 'Corporate power structure', x: 800, y: 350, connections: ['style1-1'], status: 'complete', thumbnail: executivePortrait },
    
    // Row 3 - Production
    { id: 'style1-1', type: 'style', title: 'Corporate Matrix Style', description: 'Clean facade hiding digital truth', x: 1200, y: 250, connections: ['light1-1'], status: 'complete' },
    { id: 'light1-1', type: 'lighting', title: 'Boardroom Lighting', description: 'Sterile corporate illumination', x: 1600, y: 250, connections: ['bg1-1'], status: 'complete', thumbnail: lightingSetup },
    
    // Row 4 - Environments
    { id: 'bg1-1', type: 'background', title: 'Corporate Boardroom', description: 'Glass towers and city views', x: 2000, y: 250, connections: ['cam1-1'], status: 'complete', thumbnail: boardroomBg },
    { id: 'cam1-1', type: 'camera', title: 'Corporate Cameras', description: 'Establishing and close-ups', x: 2400, y: 250, connections: ['img1-1'], status: 'complete', thumbnail: cameraEquipment },
    
    // Row 5 - Media  
    { id: 'img1-1', type: 'image', title: 'Boardroom Sequence', description: 'Corporate presentation visuals', x: 2800, y: 250, connections: ['vid1-1'], status: 'complete', thumbnail: executivePortrait },
    { id: 'vid1-1', type: 'video', title: 'Act I Complete', description: 'Full corporate sequence', x: 3200, y: 250, connections: [], status: 'complete' },
    
    // Row 6 - Audio (spaced below)
    { id: 'music1-1', type: 'music', title: 'Corporate Deception', description: 'Orchestral with digital undertones', x: 2800, y: 450, connections: ['vid1-1'], status: 'complete', thumbnail: audioMixing },
    { id: 'voiceover1-1', type: 'voiceover', title: 'Alira\'s Dialogue', description: 'Professional to questioning', x: 3200, y: 450, connections: ['vid1-1'], status: 'complete', thumbnail: audioMixing }
  ];

  return [
    {
      id: 'scene1',
      title: 'Act I: Corporate Boardroom',
      duration: 180,
      color: 'bg-purple-500',
      preview: executivePortrait,
      position: { x: 200, y: 1400 },
      nodes: baseNodes
    }
  ];
};

const initialScenes: Scene[] = createInitialScenes();

// Timeline node - positioned separately  
const timelineNode: Node = {
  id: 'master-timeline',
  type: 'timeline',
  title: 'NEON MATRIX: Digital Awakening',
  description: 'Complete feature film timeline',
  x: 1800,
  y: 100,
  connections: [],
  status: 'complete'
};

export const VirtuCastWorkspace: React.FC<VirtuCastWorkspaceProps> = () => {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<Node | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [showProductionLayers, setShowProductionLayers] = useState(false);

  // Viewport state
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 0.6 });
  
  // Interaction states
  const [dragState, setDragState] = useState<DragState>({ 
    isDragging: false, 
    nodeId: null, 
    startX: 0, 
    startY: 0, 
    nodeStartX: 0, 
    nodeStartY: 0 
  });
  
  const [panState, setPanState] = useState<PanState>({ 
    isPanning: false, 
    startX: 0, 
    startY: 0, 
    startViewportX: 0, 
    startViewportY: 0 
  });

  // Memoized calculations
  const allNodes = useMemo(() => {
    const sceneNodes = scenes.flatMap(scene => scene.nodes);
    return [...sceneNodes, timelineNode];
  }, [scenes]);

  // Event handlers
  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.detail === 2) { // Double click
      const nodeData = allNodes.find(n => n.id === nodeId);
      if (nodeData) {
        setSelectedNodeData(nodeData);
        setShowAdvancedSettings(true);
      }
    } else {
      setSelectedNode(nodeId);
    }
  }, [allNodes]);

  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setDragState({
      isDragging: true,
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y
    });
    setSelectedNode(nodeId);
  }, [allNodes]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging && dragState.nodeId) {
      const deltaX = (e.clientX - dragState.startX) / viewport.scale;
      const deltaY = (e.clientY - dragState.startY) / viewport.scale;
      
      const newX = dragState.nodeStartX + deltaX;
      const newY = dragState.nodeStartY + deltaY;
      
      // Handle timeline node separately
      if (dragState.nodeId === 'master-timeline') {
        return;
      }
      
      // Update node position with collision detection
      setScenes(prev => prev.map(scene => ({
        ...scene,
        nodes: scene.nodes.map(node => {
          if (node.id === dragState.nodeId) {
            const sceneNodes = scene.nodes.filter(n => n.id !== node.id);
            const validPosition = findNearestValidPosition(newX, newY, node.id, sceneNodes);
            return { ...node, ...validPosition };
          }
          return node;
        })
      })));
    } else if (panState.isPanning) {
      const deltaX = e.clientX - panState.startX;
      const deltaY = e.clientY - panState.startY;
      
      setViewport(prev => ({
        ...prev,
        x: panState.startViewportX + deltaX,
        y: panState.startViewportY + deltaY
      }));
    }
  }, [dragState, panState, viewport.scale]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, nodeId: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0 });
    setPanState({ isPanning: false, startX: 0, startY: 0, startViewportX: 0, startViewportY: 0 });
  }, []);

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging) {
      setPanState({
        isPanning: true,
        startX: e.clientX,
        startY: e.clientY,
        startViewportX: viewport.x,
        startViewportY: viewport.y
      });
    }
  }, [dragState.isDragging, viewport.x, viewport.y]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, viewport.scale * scaleFactor));

    const scaleChange = newScale / viewport.scale;
    setViewport(prev => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * scaleChange,
      y: mouseY - (mouseY - prev.y) * scaleChange
    }));
  }, [viewport.scale]);

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 0.6 });
  }, []);

  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }));
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    setScenes(prev => prev.map(scene => ({
      ...scene,
      nodes: scene.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    })));
  }, []);

  // Event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  const renderNode = (node: Node) => {
    const nodeType = nodeTypes[node.type];
    const Icon = nodeType?.icon || Package;
    const isSelected = selectedNode === node.id;
    const isDraggingThis = dragState.isDragging && dragState.nodeId === node.id;
    
    return (
      <div
        key={node.id}
        className={cn(
          'absolute bg-card border-2 rounded-xl p-3 cursor-move transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm',
          nodeType?.borderColor || 'border-gray-400/50',
          nodeType?.bgColor || 'bg-gray-400/10',
          isSelected && 'ring-2 ring-primary shadow-2xl scale-105 z-20',
          isDraggingThis && 'scale-110 shadow-2xl z-30 rotate-1',
          node.status === 'error' && 'border-red-400 bg-red-400/10',
          'select-none user-select-none'
        )}
        style={{ 
          left: node.x, 
          top: node.y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT
        }}
        onClick={(e) => handleNodeClick(node.id, e)}
        onMouseDown={(e) => handleNodeDragStart(e, node.id)}
      >
        {/* Node Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={cn('p-1.5 rounded-lg', nodeType?.bgColor || 'bg-gray-400/10')}>
            <Icon className={cn('h-4 w-4', nodeType?.color || 'text-gray-400')} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs truncate text-foreground">{node.title}</h3>
            <p className="text-[10px] text-muted-foreground truncate">{node.description}</p>
          </div>
          <div className={cn(
            'w-2 h-2 rounded-full border transition-all duration-200',
            node.status === 'complete' && 'bg-green-400 border-green-300',
            node.status === 'processing' && 'bg-yellow-400 border-yellow-300',
            node.status === 'idle' && 'bg-gray-400 border-gray-300',
            node.status === 'error' && 'bg-red-400 border-red-300'
          )} />
        </div>

        {/* Node Preview */}
        <div className="mb-2">
          <div className={cn(
            'w-full h-20 rounded-lg border-2 flex items-center justify-center relative overflow-hidden',
            nodeType?.borderColor || 'border-gray-400/50',
            'bg-gradient-to-br from-muted/30 to-muted/60'
          )}>
            {node.thumbnail ? (
              <img 
                src={node.thumbnail} 
                alt={node.title}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              />
            ) : (
              <div className="text-center">
                <Icon className={cn('h-6 w-6 mx-auto mb-1', nodeType?.color)} />
                <span className="text-[10px] text-muted-foreground">
                  {node.status === 'complete' && 'Generated'}
                  {node.status === 'processing' && 'Processing...'}
                  {node.status === 'idle' && 'Ready'}
                  {node.status === 'error' && 'Error'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="flex-1 text-[10px] h-6" onClick={(e) => e.stopPropagation()}>
            <Edit className="h-2.5 w-2.5 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 text-[10px] h-6" onClick={(e) => e.stopPropagation()}>
            <Play className="h-2.5 w-2.5 mr-1" />
            Generate
          </Button>
        </div>

        {/* Connection Points */}
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
        </div>
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-secondary rounded-full border-2 border-background flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-secondary-foreground rounded-full" />
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    allNodes.forEach(node => {
      if (!node.connections) return;
      node.connections.forEach(targetId => {
        const targetNode = allNodes.find(n => n.id === targetId);
        if (!targetNode) return;
        
        // Calculate actual positions considering scene offset
        const sceneContainer = scenes.find(scene => scene.nodes.some(n => n.id === node.id));
        const targetSceneContainer = scenes.find(scene => scene.nodes.some(n => n.id === targetNode.id));
        
        const sourceOffsetX = sceneContainer ? sceneContainer.position.x - 150 : 0;
        const sourceOffsetY = sceneContainer ? sceneContainer.position.y - 150 : 0;
        const targetOffsetX = targetSceneContainer ? targetSceneContainer.position.x - 150 : 0;
        const targetOffsetY = targetSceneContainer ? targetSceneContainer.position.y - 150 : 0;
        
        // Connection points with proper offsets
        const startX = sourceOffsetX + node.x + NODE_WIDTH - 3;
        const startY = sourceOffsetY + node.y + NODE_HEIGHT / 2;
        const endX = targetOffsetX + targetNode.x + 3;
        const endY = targetOffsetY + targetNode.y + NODE_HEIGHT / 2;
        
        // Smooth bezier curve
        const distance = Math.abs(endX - startX);
        const controlOffset = Math.min(distance * 0.3, 120);
        const controlPoint1X = startX + controlOffset;
        const controlPoint1Y = startY;
        const controlPoint2X = endX - controlOffset;
        const controlPoint2Y = endY;
        
        const getConnectionColor = () => {
          if (targetNode.type === 'timeline') return 'hsl(var(--primary))';
          if (targetNode.type === 'finalcut') return 'hsl(var(--accent))';
          return 'hsl(var(--muted-foreground))';
        };
        
        connections.push(
          <svg
            key={`${node.id}-${targetId}`}
            className="absolute pointer-events-none z-10"
            style={{ 
              left: 0,
              top: 0,
              width: '4000px',
              height: '2500px'
            }}
          >
            <defs>
              <marker
                id={`arrowhead-${node.id}-${targetId}`}
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill={getConnectionColor()}
                />
              </marker>
            </defs>
            <path
              d={`M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`}
              stroke={getConnectionColor()}
              strokeWidth="2"
              fill="none"
              strokeDasharray="6,3"
              markerEnd={`url(#arrowhead-${node.id}-${targetId})`}
              className="drop-shadow-sm opacity-75 hover:opacity-100 transition-all duration-200"
            />
          </svg>
        );
      });
    });
    
    return connections;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handlePanStart}
    >
      {/* Diagram Controls - Positioned within workspace */}
      <div className="absolute top-4 right-4 z-50 bg-card/90 backdrop-blur-sm border border-primary/20 rounded-xl p-2 shadow-xl">
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-r border-border pr-4">
            <Button size="sm" variant="ghost" onClick={zoomOut} title="Zoom Out" className="h-8 w-8">
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
              {Math.round(viewport.scale * 100)}%
            </span>
            <Button size="sm" variant="ghost" onClick={zoomIn} title="Zoom In" className="h-8 w-8">
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={resetView} title="Reset View" className="h-8 w-8">
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Production Layers Toggle */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={showProductionLayers ? "default" : "ghost"}
              onClick={() => setShowProductionLayers(!showProductionLayers)}
              className="h-8 px-3 gap-2"
              title="Production Layers"
            >
              <Layers className="h-3 w-3" />
              <span className="text-xs">Layers</span>
            </Button>
          </div>
        </div>
        
        {/* Film Info */}
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs font-semibold text-foreground">NEON MATRIX: Digital Awakening</div>
          <div className="text-xs text-muted-foreground">{scenes.length} Act • {allNodes.length - 1} Nodes</div>
        </div>
      </div>

      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * viewport.scale}px ${40 * viewport.scale}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`
        }}
      />
      
      {/* Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-full overflow-hidden"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
          minWidth: '4000px',
          minHeight: '2500px'
        }}
      >
        {/* Scene Container */}
        {scenes.map(scene => (
          <div
            key={scene.id}
            className="absolute"
            style={{ 
              left: scene.position.x - 150, 
              top: scene.position.y - 150, 
              width: 3600, 
              height: 800 
            }}
          >
            {/* Scene Background */}
            <div className={cn(
              'absolute inset-0 rounded-3xl border-4 border-dashed opacity-10',
              scene.color.replace('bg-', 'border-').replace('-500', '-400')
            )} />
            
            {/* Scene Header */}
            <div className={cn(
              'absolute -top-12 left-8 px-6 py-3 rounded-xl text-white font-bold text-base shadow-xl',
              scene.color,
              'border-2 border-white/20'
            )}>
              <div className="flex items-center gap-3">
                <Clapperboard className="h-5 w-5" />
                <div>
                  <div>{scene.title}</div>
                  <div className="text-xs opacity-80">{scene.nodes.length} nodes • {scene.duration}s duration</div>
                </div>
              </div>
            </div>
            
            {/* Scene Nodes */}
            {scene.nodes.map(renderNode)}
          </div>
        ))}
        
        {/* Master Timeline Node */}
        <div
          key={timelineNode.id}
          className="absolute bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-primary rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-3xl backdrop-blur-sm"
          style={{ 
            left: timelineNode.x - 200, 
            top: timelineNode.y,
            width: 600,
            height: 200
          }}
          onClick={(e) => handleNodeClick(timelineNode.id, e)}
        >
          {/* Timeline Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Clapperboard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">{timelineNode.title}</h2>
              <p className="text-sm text-muted-foreground">{timelineNode.description}</p>
            </div>
          </div>
          
          {/* Timeline Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-background/50 rounded-lg p-2">
              <div className="text-lg font-bold text-foreground">{scenes.length}</div>
              <div className="text-xs text-muted-foreground">Acts</div>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <div className="text-lg font-bold text-foreground">{allNodes.length - 1}</div>
              <div className="text-xs text-muted-foreground">Nodes</div>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <div className="text-lg font-bold text-foreground">
                {Math.floor(scenes.reduce((sum, scene) => sum + scene.duration, 0) / 60)}:{(scenes.reduce((sum, scene) => sum + scene.duration, 0) % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Runtime</div>
            </div>
          </div>
          
          {/* Timeline Status */}
          <div className="absolute top-4 right-4">
            <div className="w-4 h-4 bg-green-400 border-2 border-green-300 rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* Render connections */}
        {renderConnections()}
      </div>
      
      {/* Advanced Node Settings Modal */}
      <AdvancedNodeSettings
        node={selectedNodeData}
        isOpen={showAdvancedSettings}
        onClose={() => {
          setShowAdvancedSettings(false);
          setSelectedNodeData(null);
        }}
        onUpdateNode={updateNode}
      />
    </div>
  );
};