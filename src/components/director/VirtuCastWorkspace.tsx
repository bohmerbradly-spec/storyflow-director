import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Image, 
  Video, 
  Music, 
  User, 
  Mountain, 
  Package, 
  Film, 
  Download,
  Sparkles,
  Wand2,
  Camera,
  Mic,
  Volume2,
  Play,
  Edit,
  Palette,
  Layers,
  Target,
  Zap,
  Globe,
  Crown,
  Sword,
  Car,
  Building,
  FileText,
  Lightbulb,
  Shirt,
  Palette as StyleIcon,
  MapPin,
  Clock,
  Users,
  Megaphone,
  Clapperboard,
  AudioWaveform,
  Eye,
  Sun,
  Wind,
  Flame,
  Droplets,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Node {
  id: string;
  type: 'image' | 'character' | 'background' | 'prop' | 'video' | 'audio' | 'finalcut' | 'script' | 'lighting' | 'style' | 'wardrobe' | 'location' | 'sfx' | 'music' | 'voiceover' | 'camera' | 'weather' | 'timeline';
  title: string;
  description: string;
  x: number;
  y: number;
  connections: string[];
  status: 'idle' | 'processing' | 'complete' | 'error';
  thumbnail?: string;
  preview?: string;
  metadata?: any;
  layer?: number;
  sceneId?: string;
}

interface Connection {
  from: string;
  to: string;
}

interface VirtuCastWorkspaceProps {
  activeMode: string;
  isZenMode: boolean;
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
}

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
}

interface PanState {
  isPanning: boolean;
  startX: number;
  startY: number;
  startViewportX: number;
  startViewportY: number;
}

const nodeTypes = {
  // Core Content Nodes
  image: { icon: Image, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/50' },
  character: { icon: User, color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/50' },
  background: { icon: Mountain, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/50' },
  prop: { icon: Package, color: 'text-orange-400', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/50' },
  location: { icon: MapPin, color: 'text-teal-400', bgColor: 'bg-teal-400/10', borderColor: 'border-teal-400/50' },
  
  // Media Generation Nodes
  video: { icon: Video, color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/50' },
  audio: { icon: Volume2, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/50' },
  music: { icon: Music, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', borderColor: 'border-indigo-400/50' },
  voiceover: { icon: Mic, color: 'text-rose-400', bgColor: 'bg-rose-400/10', borderColor: 'border-rose-400/50' },
  sfx: { icon: AudioWaveform, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', borderColor: 'border-cyan-400/50' },
  
  // Production Nodes
  script: { icon: FileText, color: 'text-slate-400', bgColor: 'bg-slate-400/10', borderColor: 'border-slate-400/50' },
  lighting: { icon: Lightbulb, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/50' },
  style: { icon: StyleIcon, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-400/10', borderColor: 'border-fuchsia-400/50' },
  wardrobe: { icon: Shirt, color: 'text-violet-400', bgColor: 'bg-violet-400/10', borderColor: 'border-violet-400/50' },
  camera: { icon: Camera, color: 'text-gray-400', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/50' },
  weather: { icon: Sun, color: 'text-sky-400', bgColor: 'bg-sky-400/10', borderColor: 'border-sky-400/50' },
  
  // Output Nodes
  finalcut: { icon: Film, color: 'text-pink-400', bgColor: 'bg-pink-400/10', borderColor: 'border-pink-400/50' },
  timeline: { icon: Clapperboard, color: 'text-gold-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/50' }
};

const generatePreviewImage = (nodeType: string, title: string) => {
  const patterns = {
    character: '👤',
    background: '🏙️',
    prop: '⚔️',
    script: '📝',
    lighting: '💡',
    style: '🎨',
    wardrobe: '👔',
    location: '📍',
    camera: '📷',
    weather: '☀️',
    audio: '🎵',
    music: '🎼',
    voiceover: '🎤',
    sfx: '🔊',
    video: '🎬',
    image: '🖼️',
    finalcut: '🎞️',
    timeline: '🎬'
  };
  return patterns[nodeType as keyof typeof patterns] || '📦';
};

const initialNodes: Node[] = [
  // Timeline Node (Main Film Strip)
  { id: 'timeline1', type: 'timeline', title: 'Main Timeline', description: 'Complete Film Sequence', x: 200, y: 1200, connections: [], status: 'processing', layer: 0, preview: '🎞️' },
  
  // Layer 1: Script & Story Elements
  { id: 'script1', type: 'script', title: 'Act I: Setup', description: 'Opening sequence screenplay', x: 100, y: 50, connections: ['scene1', 'scene2'], status: 'complete', layer: 1, preview: '📜' },
  { id: 'script2', type: 'script', title: 'Act II: Confrontation', description: 'Midpoint action sequence', x: 300, y: 50, connections: ['scene3'], status: 'complete', layer: 1, preview: '📋' },
  { id: 'script3', type: 'script', title: 'Act III: Resolution', description: 'Climax and resolution', x: 500, y: 50, connections: ['scene4'], status: 'processing', layer: 1, preview: '📄' },
  
  // Layer 2: Character Development
  { id: 'char1', type: 'character', title: 'Alira Chen', description: 'Asian Executive, 28, Professional', x: 100, y: 200, connections: ['img1', 'img4', 'vid1'], status: 'complete', layer: 2, preview: '👩‍💼' },
  { id: 'char2', type: 'character', title: 'Marcus Storm', description: 'Cyberpunk Detective, 35, Gruff', x: 300, y: 200, connections: ['img2', 'vid2'], status: 'complete', layer: 2, preview: '🕵️‍♂️' },
  { id: 'char3', type: 'character', title: 'Luna Voss', description: 'Space Pilot, 26, Confident', x: 500, y: 200, connections: ['img8', 'vid7'], status: 'processing', layer: 2, preview: '👩‍🚀' },
  
  // Layer 3: Production Design
  { id: 'style1', type: 'style', title: 'Cyberpunk Aesthetic', description: 'Neon-noir visual style', x: 100, y: 350, connections: ['bg1', 'light1'], status: 'complete', layer: 3, preview: '🌃' },
  { id: 'style2', type: 'style', title: 'Corporate Clean', description: 'Modern minimalist design', x: 300, y: 350, connections: ['bg2', 'light2'], status: 'complete', layer: 3, preview: '🏢' },
  { id: 'style3', type: 'style', title: 'Sci-Fi Command', description: 'Futuristic space aesthetic', x: 500, y: 350, connections: ['bg3', 'light3'], status: 'complete', layer: 3, preview: '🚀' },
  
  // Layer 4: Lighting Design
  { id: 'light1', type: 'lighting', title: 'Neon Street Lighting', description: 'Dramatic cyberpunk illumination', x: 100, y: 500, connections: ['bg1', 'img2'], status: 'complete', layer: 4, preview: '💡' },
  { id: 'light2', type: 'lighting', title: 'Corporate Ambience', description: 'Soft professional lighting', x: 300, y: 500, connections: ['bg2', 'img1'], status: 'complete', layer: 4, preview: '🔆' },
  { id: 'light3', type: 'lighting', title: 'Space Bridge Glow', description: 'Holographic blue lighting', x: 500, y: 500, connections: ['bg3', 'img8'], status: 'complete', layer: 4, preview: '✨' },
  
  // Layer 5: Locations & Backgrounds
  { id: 'bg1', type: 'background', title: 'Neo-Tokyo Streets', description: 'Neon-lit cyberpunk cityscape', x: 100, y: 650, connections: ['img2', 'vid2'], status: 'complete', layer: 5, preview: '🏙️' },
  { id: 'bg2', type: 'background', title: 'Corporate Boardroom', description: 'Modern glass office, sunset view', x: 300, y: 650, connections: ['img1', 'vid1'], status: 'complete', layer: 5, preview: '🏢' },
  { id: 'bg3', type: 'background', title: 'Spaceship Bridge', description: 'Futuristic command center', x: 500, y: 650, connections: ['img8', 'vid7'], status: 'complete', layer: 5, preview: '🚀' },
  { id: 'location1', type: 'location', title: 'Warehouse District', description: 'Industrial area for chase scene', x: 700, y: 650, connections: ['img7', 'vid6'], status: 'idle', layer: 5, preview: '🏭' },
  
  // Layer 6: Props & Wardrobe
  { id: 'prop1', type: 'prop', title: 'Katana Blade', description: 'Traditional Japanese sword', x: 100, y: 800, connections: ['img2', 'img3'], status: 'complete', layer: 6, preview: '⚔️' },
  { id: 'prop2', type: 'prop', title: 'Holographic UI', description: 'Floating interface panels', x: 300, y: 800, connections: ['img8'], status: 'complete', layer: 6, preview: '📱' },
  { id: 'prop3', type: 'prop', title: 'Luxury Briefcase', description: 'Leather, executive style', x: 500, y: 800, connections: ['img1'], status: 'complete', layer: 6, preview: '💼' },
  { id: 'wardrobe1', type: 'wardrobe', title: 'Executive Suit', description: 'Tailored business attire', x: 700, y: 800, connections: ['char1'], status: 'complete', layer: 6, preview: '👔' },
  { id: 'wardrobe2', type: 'wardrobe', title: 'Detective Coat', description: 'Long noir-style trench coat', x: 900, y: 800, connections: ['char2'], status: 'complete', layer: 6, preview: '🧥' },
  
  // Layer 7: Image Generation
  { id: 'img1', type: 'image', title: 'Executive Portrait', description: 'Alira in boardroom setting', x: 100, y: 950, connections: ['vid1'], status: 'complete', layer: 7, preview: '🖼️' },
  { id: 'img2', type: 'image', title: 'Detective Scene', description: 'Marcus with katana in Neo-Tokyo', x: 300, y: 950, connections: ['vid2'], status: 'complete', layer: 7, preview: '🌃' },
  { id: 'img3', type: 'image', title: 'Action Sequence', description: 'Combat scene with sword', x: 500, y: 950, connections: ['vid3'], status: 'processing', layer: 7, preview: '⚔️' },
  { id: 'img4', type: 'image', title: 'Character Study', description: 'Alira emotional range', x: 700, y: 950, connections: ['vid1'], status: 'complete', layer: 7, preview: '👤' },
  { id: 'img5', type: 'image', title: 'Establishing Shot', description: 'Wide city panorama', x: 900, y: 950, connections: ['vid4'], status: 'idle', layer: 7, preview: '🌉' },
  { id: 'img6', type: 'image', title: 'Close-up Drama', description: 'Intense character moment', x: 1100, y: 950, connections: ['vid5'], status: 'complete', layer: 7, preview: '😤' },
  { id: 'img7', type: 'image', title: 'Vehicle Chase', description: 'Car action in warehouse', x: 1300, y: 950, connections: ['vid6'], status: 'processing', layer: 7, preview: '🚗' },
  { id: 'img8', type: 'image', title: 'Sci-Fi Command', description: 'Luna on bridge with UI', x: 1500, y: 950, connections: ['vid7'], status: 'complete', layer: 7, preview: '🛸' },
  
  // Layer 8: Video Generation  
  { id: 'vid1', type: 'video', title: 'Corporate Presentation', description: 'Alira speaking to camera', x: 200, y: 1100, connections: ['scene1'], status: 'complete', layer: 8, preview: '📹' },
  { id: 'vid2', type: 'video', title: 'Detective Intro', description: 'Marcus walking through rain', x: 400, y: 1100, connections: ['scene2'], status: 'complete', layer: 8, preview: '🌧️' },
  { id: 'vid3', type: 'video', title: 'Sword Fight', description: 'Dynamic combat sequence', x: 600, y: 1100, connections: ['scene2'], status: 'processing', layer: 8, preview: '⚔️' },
  { id: 'vid4', type: 'video', title: 'City Flyover', description: 'Drone shot of skyline', x: 800, y: 1100, connections: ['scene3'], status: 'idle', layer: 8, preview: '🚁' },
  { id: 'vid5', type: 'video', title: 'Emotional Beat', description: 'Character realization moment', x: 1000, y: 1100, connections: ['scene1'], status: 'complete', layer: 8, preview: '💭' },
  { id: 'vid6', type: 'video', title: 'Chase Sequence', description: 'High-speed pursuit', x: 1200, y: 1100, connections: ['scene3'], status: 'processing', layer: 8, preview: '💨' },
  { id: 'vid7', type: 'video', title: 'Space Opera', description: 'Luna commanding bridge', x: 1400, y: 1100, connections: ['scene4'], status: 'complete', layer: 8, preview: '🌌' },
  
  // Layer 9: Audio Elements
  { id: 'music1', type: 'music', title: 'Corporate Theme', description: 'Professional orchestral score', x: 150, y: 1250, connections: ['scene1'], status: 'complete', layer: 9, preview: '🎼' },
  { id: 'music2', type: 'music', title: 'Cyberpunk Beat', description: 'Electronic noir atmosphere', x: 350, y: 1250, connections: ['scene2'], status: 'complete', layer: 9, preview: '🎵' },
  { id: 'sfx1', type: 'sfx', title: 'Combat SFX', description: 'Sword clashing, impacts', x: 550, y: 1250, connections: ['scene2'], status: 'processing', layer: 9, preview: '🔊' },
  { id: 'voiceover1', type: 'voiceover', title: 'Narrator', description: 'Opening exposition voice', x: 750, y: 1250, connections: ['scene1'], status: 'complete', layer: 9, preview: '🎙️' },
  { id: 'music3', type: 'music', title: 'Chase Music', description: 'High-energy electronic', x: 950, y: 1250, connections: ['scene3'], status: 'processing', layer: 9, preview: '🎶' },
  { id: 'sfx2', type: 'sfx', title: 'Space Ambience', description: 'Sci-fi atmospheric sounds', x: 1150, y: 1250, connections: ['scene4'], status: 'complete', layer: 9, preview: '🌌' },
  
  // Layer 10: Final Scenes (feeding into timeline)
  { id: 'scene1', type: 'finalcut', title: 'Scene 1: Boardroom', description: 'Executive presentation sequence', x: 200, y: 1400, connections: ['timeline1'], status: 'complete', layer: 10, preview: '🎬', sceneId: '1' },
  { id: 'scene2', type: 'finalcut', title: 'Scene 2: Street Fight', description: 'Detective action sequence', x: 500, y: 1400, connections: ['timeline1'], status: 'complete', layer: 10, preview: '⚔️', sceneId: '2' },
  { id: 'scene3', type: 'finalcut', title: 'Scene 3: Chase', description: 'High-speed pursuit', x: 800, y: 1400, connections: ['timeline1'], status: 'processing', layer: 10, preview: '🚗', sceneId: '3' },
  { id: 'scene4', type: 'finalcut', title: 'Scene 4: Bridge', description: 'Space command sequence', x: 1100, y: 1400, connections: ['timeline1'], status: 'complete', layer: 10, preview: '🌌', sceneId: '4' }
];

const timelineScenes = [
  { id: 'scene1', title: 'Boardroom', duration: 45, color: 'bg-purple-500', preview: '🎬' },
  { id: 'scene2', title: 'Street Fight', duration: 120, color: 'bg-red-500', preview: '⚔️' },
  { id: 'scene3', title: 'Chase', duration: 90, color: 'bg-orange-500', preview: '🚗' },
  { id: 'scene4', title: 'Bridge', duration: 60, color: 'bg-blue-500', preview: '🌌' }
];

export const VirtuCastWorkspace: React.FC<VirtuCastWorkspaceProps> = ({
  activeMode,
  isZenMode,
  leftDrawerOpen,
  rightDrawerOpen
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, nodeId: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0 });
  const [panState, setPanState] = useState<PanState>({ isPanning: false, startX: 0, startY: 0, startViewportX: 0, startViewportY: 0 });
  const workspaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse and interaction handlers
  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
  }, []);

  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
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
  }, [nodes]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging && dragState.nodeId) {
      const deltaX = (e.clientX - dragState.startX) / viewport.scale;
      const deltaY = (e.clientY - dragState.startY) / viewport.scale;
      
      setNodes(prev => prev.map(node => 
        node.id === dragState.nodeId 
          ? { ...node, x: dragState.nodeStartX + deltaX, y: dragState.nodeStartY + deltaY }
          : node
      ));
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

    // Zoom towards mouse position
    const scaleChange = newScale / viewport.scale;
    setViewport(prev => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * scaleChange,
      y: mouseY - (mouseY - prev.y) * scaleChange
    }));
  }, [viewport.scale]);

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);

  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }));
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
          'absolute w-72 bg-card border-2 rounded-xl p-4 cursor-move transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm',
          nodeType?.borderColor || 'border-gray-400/50',
          nodeType?.bgColor || 'bg-gray-400/10',
          isSelected && 'ring-2 ring-primary shadow-2xl scale-105 z-20',
          isDraggingThis && 'scale-110 shadow-2xl z-30',
          node.status === 'processing' && 'animate-pulse',
          node.status === 'error' && 'border-red-400 bg-red-400/10',
          'select-none user-select-none'
        )}
        style={{ 
          left: node.x, 
          top: node.y,
          transform: isDraggingThis ? 'rotate(2deg)' : 'rotate(0deg)'
        }}
        onClick={(e) => handleNodeClick(node.id, e)}
        onMouseDown={(e) => handleNodeDragStart(e, node.id)}
      >
        {/* Node Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', nodeType?.bgColor || 'bg-gray-400/10')}>
            <Icon className={cn('h-5 w-5', nodeType?.color || 'text-gray-400')} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-foreground">{node.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{node.description}</p>
          </div>
          <div className={cn(
            'w-3 h-3 rounded-full border',
            node.status === 'complete' && 'bg-green-400 border-green-300',
            node.status === 'processing' && 'bg-yellow-400 border-yellow-300 animate-pulse',
            node.status === 'idle' && 'bg-gray-400 border-gray-300',
            node.status === 'error' && 'bg-red-400 border-red-300'
          )} />
        </div>

        {/* Node Preview with Visual */}
        <div className="mb-3">
          <div className={cn(
            'w-full h-32 rounded-lg border-2 flex items-center justify-center relative overflow-hidden',
            nodeType?.borderColor || 'border-gray-400/50',
            'bg-gradient-to-br from-muted/30 to-muted/60'
          )}>
            {node.preview ? (
              <div className="text-center">
                <div className="text-4xl mb-2">{node.preview}</div>
                <div className="text-xs text-muted-foreground font-medium">
                  {node.status === 'complete' && 'Generated'}
                  {node.status === 'processing' && 'Processing...'}
                  {node.status === 'idle' && 'Ready'}
                  {node.status === 'error' && 'Error'}
                </div>
              </div>
            ) : (
              <div className="text-center">
                {node.status === 'complete' && <Sparkles className={cn('h-8 w-8 mx-auto mb-2', nodeType?.color)} />}
                {node.status === 'processing' && <Zap className={cn('h-8 w-8 mx-auto mb-2 animate-pulse', nodeType?.color)} />}
                {node.status === 'idle' && <Wand2 className={cn('h-8 w-8 mx-auto mb-2', nodeType?.color)} />}
                {node.status === 'error' && <Target className="h-8 w-8 mx-auto mb-2 text-red-400" />}
                <span className="text-xs text-muted-foreground">
                  {node.status === 'complete' && 'Generated'}
                  {node.status === 'processing' && 'Processing...'}
                  {node.status === 'idle' && 'Ready'}
                  {node.status === 'error' && 'Error'}
                </span>
              </div>
            )}
            
            {/* Layer indicator */}
            {node.layer !== undefined && (
              <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                L{node.layer}
              </div>
            )}
          </div>
        </div>

        {/* Node Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={(e) => e.stopPropagation()}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={(e) => e.stopPropagation()}>
            <Play className="h-3 w-3 mr-1" />
            Generate
          </Button>
        </div>

        {/* Connection Points */}
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
        </div>
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-secondary rounded-full border-2 border-background flex items-center justify-center">
          <div className="w-2 h-2 bg-secondary-foreground rounded-full" />
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (!targetNode) return;
        
        const startX = node.x + 288; // Node width (272) + connection point (16)
        const startY = node.y + 90; // Roughly center of node
        const endX = targetNode.x;
        const endY = targetNode.y + 90;
        
        const controlPoint1X = startX + Math.abs(endX - startX) * 0.3;
        const controlPoint1Y = startY;
        const controlPoint2X = endX - Math.abs(endX - startX) * 0.3;
        const controlPoint2Y = endY;
        
        // Different colors for different connection types
        const getConnectionColor = () => {
          if (targetNode.type === 'timeline') return 'hsl(var(--primary))';
          if (targetNode.type === 'finalcut') return 'hsl(var(--accent))';
          if (node.layer !== undefined && targetNode.layer !== undefined) {
            return node.layer < targetNode.layer ? 'hsl(var(--primary))' : 'hsl(var(--secondary))';
          }
          return 'hsl(var(--muted-foreground))';
        };
        
        connections.push(
          <svg
            key={`${node.id}-${targetId}`}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <marker
                id={`arrowhead-${node.id}-${targetId}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={getConnectionColor()}
                />
              </marker>
            </defs>
            <path
              d={`M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`}
              stroke={getConnectionColor()}
              strokeWidth="3"
              fill="none"
              strokeDasharray="8,4"
              markerEnd={`url(#arrowhead-${node.id}-${targetId})`}
              className="drop-shadow-sm opacity-80 hover:opacity-100 transition-opacity"
            />
          </svg>
        );
      });
    });
    
    return connections;
  };

  const renderFilmTimeline = () => {
    const timelineNode = nodes.find(n => n.type === 'timeline');
    if (!timelineNode) return null;
    
    const totalDuration = timelineScenes.reduce((sum, scene) => sum + scene.duration, 0);
    
    return (
      <div 
        className="absolute bg-card border-2 border-primary rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
        style={{ 
          left: timelineNode.x - 100, 
          top: timelineNode.y + 150,
          minWidth: '800px'
        }}
      >
        {/* Timeline Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-8 w-8 text-primary animate-pulse" />
            <div>
              <h3 className="font-bold text-2xl text-primary">Master Timeline</h3>
              <p className="text-sm text-muted-foreground">Total Runtime: {totalDuration}s • {Math.floor(totalDuration/60)}:{(totalDuration%60).toString().padStart(2, '0')}</p>
            </div>
          </div>
        </div>
        
        {/* Film Strip Container */}
        <div className="relative bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 rounded-xl p-4 border-2 border-dashed border-primary/30">
          {/* Sprocket Holes Top */}
          <div className="flex justify-between absolute top-2 left-4 right-4">
            {[...Array(20)].map((_, i) => (
              <div key={`top-${i}`} className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
            ))}
          </div>
          
          {/* Main Film Strip */}
          <div className="flex gap-2 my-4 px-2">
            {timelineScenes.map((scene, index) => {
              const sceneNode = nodes.find(n => n.sceneId === scene.id.replace('scene', ''));
              return (
                <div key={scene.id} className="flex flex-col items-center gap-2">
                  {/* Scene Preview */}
                  <div
                    className={cn(
                      'relative rounded-lg border-2 border-white shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden',
                      scene.color,
                      'group'
                    )}
                    style={{ 
                      width: `${Math.max(120, scene.duration * 1.5)}px`, 
                      height: '80px' 
                    }}
                    title={`${scene.title} - ${scene.duration}s`}
                  >
                    {/* Scene Visual */}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-2xl mb-1">{scene.preview}</div>
                        <div className="text-xs font-bold">{scene.duration}s</div>
                      </div>
                    </div>
                    
                    {/* Scene Status Indicator */}
                    <div className={cn(
                      'absolute top-1 right-1 w-2 h-2 rounded-full',
                      sceneNode?.status === 'complete' && 'bg-green-400',
                      sceneNode?.status === 'processing' && 'bg-yellow-400 animate-pulse',
                      sceneNode?.status === 'idle' && 'bg-gray-400',
                      sceneNode?.status === 'error' && 'bg-red-400'
                    )} />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Scene Label */}
                  <div className="text-center">
                    <div className="text-xs font-semibold text-foreground">{scene.title}</div>
                    <div className="text-xs text-muted-foreground">Scene {index + 1}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Sprocket Holes Bottom */}
          <div className="flex justify-between absolute bottom-2 left-4 right-4">
            {[...Array(20)].map((_, i) => (
              <div key={`bottom-${i}`} className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
            ))}
          </div>
        </div>
        
        {/* Timeline Controls */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Preview Timeline
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Film
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span>Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handlePanStart}
    >
      {/* Zoom Controls */}
      <div className="fixed top-20 left-4 bg-card border border-primary rounded-xl p-2 shadow-xl z-50">
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" onClick={zoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={zoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetView} title="Reset View">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="text-xs text-center py-1 text-muted-foreground">
            {Math.round(viewport.scale * 100)}%
          </div>
        </div>
      </div>

      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: `${50 * viewport.scale}px ${50 * viewport.scale}px`,
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
          minWidth: '3000px',
          minHeight: '2000px'
        }}
      >
        {/* Layer Background Indicators */}
        {Array.from(new Set(nodes.map(n => n.layer).filter(l => l !== undefined))).sort().map(layer => (
          <div
            key={`layer-${layer}`}
            className="absolute left-0 right-0 bg-muted/5 border-l-4 border-primary/20"
            style={{
              top: layer! * 150 + 25,
              height: 125,
              zIndex: -1
            }}
          >
            <div className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded">
              Layer {layer}
            </div>
          </div>
        ))}
        
        {/* Render connections first (behind nodes) */}
        {renderConnections()}
        
        {/* Render all nodes */}
        {nodes.map(renderNode)}
        
        {/* Film Timeline */}
        {renderFilmTimeline()}
      </div>
      
      {/* Floating Node Creation Toolbar */}
      <div className="fixed top-20 right-4 bg-card border border-primary rounded-xl p-3 shadow-xl z-50">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Add Nodes</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" title="Add Character" className="p-2">
            <User className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Background" className="p-2">
            <Mountain className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Script" className="p-2">
            <FileText className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Style" className="p-2">
            <StyleIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Lighting" className="p-2">
            <Lightbulb className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Prop" className="p-2">
            <Package className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Image" className="p-2">
            <Image className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Video" className="p-2">
            <Video className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Audio" className="p-2">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" title="Add Music" className="p-2">
            <Music className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Layer Legend */}
      <div className="fixed bottom-4 left-4 bg-card border border-primary rounded-xl p-3 shadow-xl z-50 max-w-xs">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Production Layers</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            <span>L1: Script & Story</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span>L2: Characters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-fuchsia-400 rounded-full" />
            <span>L3: Style Design</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full" />
            <span>L4: Lighting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span>L5: Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>L6: Props & Wardrobe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span>L7: Image Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span>L8: Video Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span>L9: Audio Elements</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full" />
            <span>L10: Final Scenes</span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="fixed bottom-4 right-4 bg-card border border-primary rounded-xl p-4 shadow-xl z-50 max-w-sm">
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            const nodeType = nodeTypes[node.type];
            const Icon = nodeType?.icon || Package;
            
            return (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('p-2 rounded-lg', nodeType?.bgColor)}>
                    <Icon className={cn('h-5 w-5', nodeType?.color)} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{node.title}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{node.type} Node</p>
                  </div>
                </div>
                <p className="text-sm mb-3">{node.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>Layer {node.layer || 'N/A'}</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full',
                    node.status === 'complete' && 'bg-green-100 text-green-800',
                    node.status === 'processing' && 'bg-yellow-100 text-yellow-800',
                    node.status === 'idle' && 'bg-gray-100 text-gray-800',
                    node.status === 'error' && 'bg-red-100 text-red-800'
                  )}>
                    {node.status}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/10" />
      </div>
    </div>
  );
};