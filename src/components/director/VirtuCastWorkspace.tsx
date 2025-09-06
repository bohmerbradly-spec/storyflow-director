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
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AdvancedNodeSettings } from './AdvancedNodeSettings';

// Import the generated images
import executivePortrait from '@/assets/nodes/executive-portrait.jpg';
import detectiveScene from '@/assets/nodes/detective-scene.jpg';
import spacePilot from '@/assets/nodes/space-pilot.jpg';
import boardroomBg from '@/assets/nodes/boardroom-bg.jpg';
import cyberpunkStreet from '@/assets/nodes/cyberpunk-street.jpg';
import spaceshipBridge from '@/assets/nodes/spaceship-bridge.jpg';
import katanaProp from '@/assets/nodes/katana-prop.jpg';
import lightingSetup from '@/assets/nodes/lighting-setup.jpg';
import filmScript from '@/assets/nodes/film-script.jpg';
import businessWardrobe from '@/assets/nodes/business-wardrobe.jpg';
import cameraEquipment from '@/assets/nodes/camera-equipment.jpg';
import audioMixing from '@/assets/nodes/audio-mixing.jpg';

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

interface Scene {
  id: string;
  title: string;
  duration: number;
  color: string;
  preview: string;
  nodes: Node[];
  position: { x: number; y: number };
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

// Comprehensive script for the feature film
const featureFilmScript = {
  title: "NEON SHADOWS: Corporate Conspiracy",
  logline: "In a cyberpunk future, an ambitious corporate executive discovers her company's dark secret while a detective hunts the truth through neon-lit streets.",
  acts: [
    {
      act: 1,
      title: "Setup - Corporate Façade",
      scenes: [
        {
          sceneNumber: "1A",
          title: "Executive Boardroom",
          description: "INT. CORPORATE BOARDROOM - DAY",
          fullDescription: "Alira Chen presents quarterly results to the board. Pristine glass office with city skyline. Camera: Establishing wide shot, then medium close-up. Lighting: Corporate clean, soft key with window backlight. Duration: 45s",
          cameraAngles: ["Wide establishing", "Medium CU on Alira", "Over shoulder board reaction"],
          lighting: "Natural window light + soft key fill",
          props: ["Presentation screen", "Executive briefcase", "Glass conference table"],
          wardrobe: "Tailored business suit, professional styling"
        },
        {
          sceneNumber: "1B", 
          title: "Character Moment",
          description: "Alira's private moment of doubt",
          fullDescription: "Close-up of Alira reviewing suspicious financial documents. Camera: Macro lens on documents, then tight close-up. Lighting: Desk lamp creating dramatic shadows. Duration: 30s",
          cameraAngles: ["Macro on documents", "Tight CU reaction", "Wide office context"],
          lighting: "Hard desk lamp, creating mystery",
          props: ["Financial documents", "Desk lamp"],
          wardrobe: "Same executive suit, slightly disheveled"
        }
      ]
    },
    {
      act: 2,
      title: "Confrontation - Street Level Truth",
      scenes: [
        {
          sceneNumber: "2A",
          title: "Detective Introduction",
          description: "EXT. CYBERPUNK STREET - NIGHT",
          fullDescription: "Marcus Storm walks through rain-soaked neon streets investigating corporate crime. Camera: Tracking shot following detective. Lighting: Neon reflections, dramatic noir. Duration: 90s",
          cameraAngles: ["Tracking medium shot", "Low angle hero shot", "Wide establishing cityscape"],
          lighting: "Neon street lights, rain reflections",
          props: ["Katana blade", "Detective notepad", "Holographic displays"],
          wardrobe: "Long detective coat, noir styling"
        },
        {
          sceneNumber: "2B",
          title: "Sword Combat",
          description: "Marcus confronts corporate assassins",
          fullDescription: "Dynamic fight sequence with traditional katana against futuristic weapons. Camera: Multiple angles, slow-motion highlights. Lighting: Strobing neon, dramatic shadows. Duration: 120s",
          cameraAngles: ["Wide action", "Close-up blade work", "Slow motion impacts"],
          lighting: "Strobing neon, high contrast shadows",
          props: ["Katana sword", "Futuristic weapons", "Neon signs"],
          wardrobe: "Combat-ready detective gear"
        }
      ]
    },
    {
      act: 3,
      title: "Resolution - Space Age Truth",
      scenes: [
        {
          sceneNumber: "3A",
          title: "Space Command",
          description: "INT. SPACESHIP BRIDGE - CONTINUOUS",
          fullDescription: "Luna Voss commands bridge operations while monitoring the corporate conspiracy from space. Camera: Sweeping crane shots. Lighting: Holographic blue glow. Duration: 60s",
          cameraAngles: ["Sweeping crane shot", "Close-up on controls", "Wide bridge overview"],
          lighting: "Blue holographic glow, sci-fi ambience",
          props: ["Holographic displays", "Command chair", "Sci-fi controls"],
          wardrobe: "Space pilot uniform, technical gear"
        }
      ]
    }
  ]
};

// Scene-based node organization
const initialScenes: Scene[] = [
  {
    id: 'scene1',
    title: 'Act I: Boardroom',
    duration: 75,
    color: 'bg-purple-500',
    preview: executivePortrait,
    position: { x: 200, y: 1400 },
    nodes: [
      // Script nodes for this scene
      { id: 'script1-1', type: 'script', title: 'Scene 1A: Boardroom Setup', description: 'Executive presentation script', x: 50, y: 100, connections: ['char1-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script1-2', type: 'script', title: 'Scene 1B: Character Moment', description: 'Private doubt sequence', x: 50, y: 250, connections: ['char1-1'], status: 'complete', thumbnail: filmScript },
      
      // Character nodes
      { id: 'char1-1', type: 'character', title: 'Alira Chen', description: 'Executive protagonist', x: 300, y: 150, connections: ['style1-1'], status: 'complete', thumbnail: executivePortrait },
      
      // Style and production
      { id: 'style1-1', type: 'style', title: 'Corporate Aesthetic', description: 'Clean, professional look', x: 550, y: 100, connections: ['light1-1'], status: 'complete' },
      { id: 'light1-1', type: 'lighting', title: 'Corporate Lighting', description: 'Soft professional illumination', x: 800, y: 100, connections: ['bg1-1'], status: 'complete', thumbnail: lightingSetup },
      
      // Backgrounds and locations
      { id: 'bg1-1', type: 'background', title: 'Corporate Boardroom', description: 'Glass office with city view', x: 1050, y: 150, connections: ['cam1-1'], status: 'complete', thumbnail: boardroomBg },
      
      // Camera work
      { id: 'cam1-1', type: 'camera', title: 'Boardroom Cameras', description: 'Multiple angle setup', x: 1300, y: 100, connections: ['img1-1'], status: 'complete', thumbnail: cameraEquipment },
      
      // Props and wardrobe
      { id: 'prop1-1', type: 'prop', title: 'Executive Briefcase', description: 'Luxury leather briefcase', x: 300, y: 300, connections: ['img1-1'], status: 'complete' },
      { id: 'wardrobe1-1', type: 'wardrobe', title: 'Executive Suit', description: 'Tailored business attire', x: 550, y: 250, connections: ['char1-1'], status: 'complete', thumbnail: businessWardrobe },
      
      // Media generation
      { id: 'img1-1', type: 'image', title: 'Boardroom Render', description: 'Executive in boardroom setting', x: 1550, y: 150, connections: ['vid1-1'], status: 'complete', thumbnail: executivePortrait },
      { id: 'vid1-1', type: 'video', title: 'Boardroom Sequence', description: 'Complete scene video', x: 1800, y: 150, connections: [], status: 'complete' },
      
      // Audio elements
      { id: 'music1-1', type: 'music', title: 'Corporate Theme', description: 'Professional orchestral', x: 1550, y: 300, connections: ['vid1-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'voiceover1-1', type: 'voiceover', title: 'Executive Dialogue', description: 'Professional delivery', x: 1800, y: 300, connections: ['vid1-1'], status: 'complete', thumbnail: audioMixing }
    ]
  },
  {
    id: 'scene2',
    title: 'Act II: Street Fight',
    duration: 210,
    color: 'bg-red-500',
    preview: detectiveScene,
    position: { x: 600, y: 1400 },
    nodes: [
      // Script nodes
      { id: 'script2-1', type: 'script', title: 'Scene 2A: Detective Intro', description: 'Neo-Tokyo street investigation', x: 50, y: 500, connections: ['char2-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script2-2', type: 'script', title: 'Scene 2B: Combat Sequence', description: 'Katana fight choreography', x: 50, y: 650, connections: ['char2-1'], status: 'complete', thumbnail: filmScript },
      
      // Characters
      { id: 'char2-1', type: 'character', title: 'Marcus Storm', description: 'Cyberpunk detective', x: 300, y: 550, connections: ['style2-1'], status: 'complete', thumbnail: detectiveScene },
      
      // Production design
      { id: 'style2-1', type: 'style', title: 'Cyberpunk Noir', description: 'Dark neon aesthetic', x: 550, y: 500, connections: ['light2-1'], status: 'complete' },
      { id: 'light2-1', type: 'lighting', title: 'Neon Street Lighting', description: 'Dramatic cyberpunk illumination', x: 800, y: 500, connections: ['bg2-1'], status: 'complete', thumbnail: lightingSetup },
      { id: 'weather2-1', type: 'weather', title: 'Rain Effect', description: 'Atmospheric rain for streets', x: 800, y: 650, connections: ['bg2-1'], status: 'complete' },
      
      // Environment
      { id: 'bg2-1', type: 'background', title: 'Cyberpunk Streets', description: 'Neon-lit rain-soaked cityscape', x: 1050, y: 550, connections: ['cam2-1'], status: 'complete', thumbnail: cyberpunkStreet },
      { id: 'location2-1', type: 'location', title: 'Neo-Tokyo District', description: 'Futuristic urban environment', x: 1050, y: 700, connections: ['bg2-1'], status: 'complete' },
      
      // Camera and cinematography
      { id: 'cam2-1', type: 'camera', title: 'Action Cameras', description: 'Dynamic fight cinematography', x: 1300, y: 500, connections: ['img2-1'], status: 'complete', thumbnail: cameraEquipment },
      
      // Props and wardrobe
      { id: 'prop2-1', type: 'prop', title: 'Katana Blade', description: 'Traditional Japanese sword', x: 300, y: 700, connections: ['img2-1'], status: 'complete', thumbnail: katanaProp },
      { id: 'prop2-2', type: 'prop', title: 'Holographic UI', description: 'Futuristic interface panels', x: 550, y: 650, connections: ['img2-1'], status: 'complete' },
      { id: 'wardrobe2-1', type: 'wardrobe', title: 'Detective Coat', description: 'Noir-style trench coat', x: 550, y: 800, connections: ['char2-1'], status: 'complete' },
      
      // Media generation
      { id: 'img2-1', type: 'image', title: 'Street Fight Render', description: 'Detective action scene', x: 1550, y: 550, connections: ['vid2-1'], status: 'complete', thumbnail: detectiveScene },
      { id: 'img2-2', type: 'image', title: 'Combat Sequence', description: 'Sword fight dynamics', x: 1550, y: 700, connections: ['vid2-1'], status: 'processing' },
      { id: 'vid2-1', type: 'video', title: 'Street Fight Video', description: 'Complete action sequence', x: 1800, y: 600, connections: [], status: 'complete' },
      
      // Audio design
      { id: 'music2-1', type: 'music', title: 'Cyberpunk Beat', description: 'Electronic noir soundtrack', x: 1300, y: 750, connections: ['vid2-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx2-1', type: 'sfx', title: 'Combat SFX', description: 'Sword clashes and impacts', x: 1550, y: 850, connections: ['vid2-1'], status: 'processing', thumbnail: audioMixing }
    ]
  },
  {
    id: 'scene3',
    title: 'Act II: Chase Sequence',
    duration: 90,
    color: 'bg-orange-500',
    preview: cyberpunkStreet,
    position: { x: 1000, y: 1400 },
    nodes: [
      // Script and planning
      { id: 'script3-1', type: 'script', title: 'Chase Choreography', description: 'High-speed pursuit sequence', x: 50, y: 900, connections: ['cam3-1'], status: 'complete', thumbnail: filmScript },
      
      // Cinematography focus
      { id: 'cam3-1', type: 'camera', title: 'Chase Cameras', description: 'High-speed tracking shots', x: 300, y: 950, connections: ['img3-1'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'cam3-2', type: 'camera', title: 'Drone Footage', description: 'Aerial chase coverage', x: 300, y: 1100, connections: ['img3-1'], status: 'idle', thumbnail: cameraEquipment },
      
      // Environment and location
      { id: 'location3-1', type: 'location', title: 'Warehouse District', description: 'Industrial chase environment', x: 550, y: 900, connections: ['bg3-1'], status: 'idle' },
      { id: 'bg3-1', type: 'background', title: 'Industrial Zone', description: 'Warehouse and factory area', x: 800, y: 950, connections: ['img3-1'], status: 'idle' },
      
      // Props and vehicles
      { id: 'prop3-1', type: 'prop', title: 'Chase Vehicle', description: 'Cyberpunk motorcycle', x: 550, y: 1050, connections: ['img3-1'], status: 'processing' },
      
      // Media generation
      { id: 'img3-1', type: 'image', title: 'Chase Sequence', description: 'High-speed pursuit visuals', x: 1050, y: 950, connections: ['vid3-1'], status: 'processing' },
      { id: 'vid3-1', type: 'video', title: 'Chase Video', description: 'Dynamic pursuit sequence', x: 1300, y: 950, connections: [], status: 'processing' },
      
      // Audio
      { id: 'music3-1', type: 'music', title: 'Chase Music', description: 'High-energy electronic track', x: 1050, y: 1100, connections: ['vid3-1'], status: 'processing', thumbnail: audioMixing },
      { id: 'sfx3-1', type: 'sfx', title: 'Vehicle SFX', description: 'Engine and chase sounds', x: 1300, y: 1100, connections: ['vid3-1'], status: 'idle', thumbnail: audioMixing }
    ]
  },
  {
    id: 'scene4',
    title: 'Act III: Space Command',
    duration: 60,
    color: 'bg-blue-500',
    preview: spacePilot,
    position: { x: 1400, y: 1400 },
    nodes: [
      // Script
      { id: 'script4-1', type: 'script', title: 'Bridge Command', description: 'Space operations sequence', x: 50, y: 1200, connections: ['char4-1'], status: 'complete', thumbnail: filmScript },
      
      // Character
      { id: 'char4-1', type: 'character', title: 'Luna Voss', description: 'Space pilot commander', x: 300, y: 1250, connections: ['style4-1'], status: 'processing', thumbnail: spacePilot },
      
      // Production design
      { id: 'style4-1', type: 'style', title: 'Sci-Fi Command', description: 'Futuristic space aesthetic', x: 550, y: 1200, connections: ['light4-1'], status: 'complete' },
      { id: 'light4-1', type: 'lighting', title: 'Holographic Lighting', description: 'Blue sci-fi illumination', x: 800, y: 1200, connections: ['bg4-1'], status: 'complete', thumbnail: lightingSetup },
      
      // Environment
      { id: 'bg4-1', type: 'background', title: 'Spaceship Bridge', description: 'Futuristic command center', x: 1050, y: 1250, connections: ['cam4-1'], status: 'complete', thumbnail: spaceshipBridge },
      
      // Technology and props
      { id: 'prop4-1', type: 'prop', title: 'Holographic UI', description: 'Advanced control interfaces', x: 800, y: 1350, connections: ['img4-1'], status: 'complete' },
      { id: 'prop4-2', type: 'prop', title: 'Command Chair', description: 'Captain\'s command station', x: 550, y: 1350, connections: ['img4-1'], status: 'complete' },
      
      // Cinematography
      { id: 'cam4-1', type: 'camera', title: 'Bridge Cameras', description: 'Sweeping crane shots', x: 1300, y: 1200, connections: ['img4-1'], status: 'complete', thumbnail: cameraEquipment },
      
      // Media generation
      { id: 'img4-1', type: 'image', title: 'Bridge Command', description: 'Sci-fi command sequence', x: 1550, y: 1250, connections: ['vid4-1'], status: 'complete', thumbnail: spacePilot },
      { id: 'vid4-1', type: 'video', title: 'Space Sequence', description: 'Bridge operations video', x: 1800, y: 1250, connections: [], status: 'complete' },
      
      // Audio
      { id: 'music4-1', type: 'music', title: 'Space Opera Score', description: 'Epic orchestral theme', x: 1550, y: 1400, connections: ['vid4-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx4-1', type: 'sfx', title: 'Sci-Fi Ambience', description: 'Space bridge sounds', x: 1800, y: 1400, connections: ['vid4-1'], status: 'complete', thumbnail: audioMixing }
    ]
  }
];

// Timeline node
const timelineNode: Node = { 
  id: 'master-timeline', 
  type: 'timeline', 
  title: 'Master Timeline', 
  description: 'Complete Feature Film', 
  x: 800, 
  y: 1600, 
  connections: [], 
  status: 'processing' 
};

export const VirtuCastWorkspace: React.FC<VirtuCastWorkspaceProps> = ({
  activeMode,
  isZenMode,
  leftDrawerOpen,
  rightDrawerOpen
}) => {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<Node | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 0.6 });
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, nodeId: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0 });
  const [panState, setPanState] = useState<PanState>({ isPanning: false, startX: 0, startY: 0, startViewportX: 0, startViewportY: 0 });
  const [showProductionLayers, setShowProductionLayers] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get all nodes from all scenes
  const allNodes = scenes.flatMap(scene => scene.nodes).concat([timelineNode]);

  // Mouse and interaction handlers
  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNodeData(node);
      setShowAdvancedSettings(true);
    }
  }, [allNodes]);

  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
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
      
      // Update node position in the appropriate scene or timeline
      if (dragState.nodeId === 'master-timeline') {
        // Handle timeline node separately if needed
        return;
      }
      
      setScenes(prev => prev.map(scene => ({
        ...scene,
        nodes: scene.nodes.map(node => 
          node.id === dragState.nodeId 
            ? { ...node, x: dragState.nodeStartX + deltaX, y: dragState.nodeStartY + deltaY }
            : node
        )
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
          'absolute w-64 bg-card border-2 rounded-xl p-3 cursor-move transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm',
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
          transform: isDraggingThis ? 'rotate(1deg)' : 'rotate(0deg)'
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
            'w-2 h-2 rounded-full border',
            node.status === 'complete' && 'bg-green-400 border-green-300',
            node.status === 'processing' && 'bg-yellow-400 border-yellow-300 animate-pulse',
            node.status === 'idle' && 'bg-gray-400 border-gray-300',
            node.status === 'error' && 'bg-red-400 border-red-300'
          )} />
        </div>

        {/* Node Preview with Real Photo */}
        <div className="mb-2">
          <div className={cn(
            'w-full h-24 rounded-lg border-2 flex items-center justify-center relative overflow-hidden',
            nodeType?.borderColor || 'border-gray-400/50',
            'bg-gradient-to-br from-muted/30 to-muted/60'
          )}>
            {node.thumbnail ? (
              <img 
                src={node.thumbnail} 
                alt={node.title}
                className="w-full h-full object-cover"
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

        {/* Node Actions */}
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
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
        </div>
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-secondary rounded-full border-2 border-background flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-secondary-foreground rounded-full" />
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    allNodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = allNodes.find(n => n.id === targetId);
        if (!targetNode) return;
        
        const startX = node.x + 256; // Node width + connection point
        const startY = node.y + 60; // Roughly center of node
        const endX = targetNode.x;
        const endY = targetNode.y + 60;
        
        const controlPoint1X = startX + Math.abs(endX - startX) * 0.3;
        const controlPoint1Y = startY;
        const controlPoint2X = endX - Math.abs(endX - startX) * 0.3;
        const controlPoint2Y = endY;
        
        const getConnectionColor = () => {
          if (targetNode.type === 'timeline') return 'hsl(var(--primary))';
          if (targetNode.type === 'finalcut') return 'hsl(var(--accent))';
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
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
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
              className="drop-shadow-sm opacity-60 hover:opacity-100 transition-opacity"
            />
          </svg>
        );
      });
    });
    
    return connections;
  };

  const renderSceneConnections = () => {
    const connections: JSX.Element[] = [];
    
    scenes.forEach(scene => {
      const sceneX = scene.position.x;
      const sceneY = scene.position.y;
      const timelineX = timelineNode.x + 128;
      const timelineY = timelineNode.y + 60;
      
      const controlPoint1X = sceneX + 100;
      const controlPoint1Y = sceneY;
      const controlPoint2X = timelineX - 100;
      const controlPoint2Y = timelineY;
      
      connections.push(
        <svg
          key={`scene-${scene.id}-timeline`}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id={`scene-arrow-${scene.id}`}
              markerWidth="12"
              markerHeight="8"
              refX="10"
              refY="4"
              orient="auto"
            >
              <polygon
                points="0 0, 12 4, 0 8"
                fill="hsl(var(--primary))"
              />
            </marker>
          </defs>
          <path
            d={`M ${sceneX} ${sceneY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${timelineX} ${timelineY}`}
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            strokeDasharray="12,6"
            markerEnd={`url(#scene-arrow-${scene.id})`}
            className="drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity"
          />
        </svg>
      );
    });
    
    return connections;
  };

  const renderFilmTimeline = () => {
    return (
      <div 
        className="absolute bg-card border-4 border-primary rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
        style={{ 
          left: timelineNode.x - 200, 
          top: timelineNode.y + 120,
          minWidth: '1000px'
        }}
      >
        {/* Timeline Header */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-3">
            <Clapperboard className="h-10 w-10 text-primary animate-pulse" />
            <div>
              <h3 className="font-bold text-3xl text-primary">{featureFilmScript.title}</h3>
              <p className="text-sm text-muted-foreground">{featureFilmScript.logline}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total Runtime: {scenes.reduce((sum, scene) => sum + scene.duration, 0)}s • 
                {Math.floor(scenes.reduce((sum, scene) => sum + scene.duration, 0)/60)}:{(scenes.reduce((sum, scene) => sum + scene.duration, 0)%60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Film Strip Container */}
        <div className="relative bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 rounded-xl p-6 border-4 border-dashed border-primary/30">
          {/* Sprocket Holes Top */}
          <div className="flex justify-between absolute top-3 left-6 right-6">
            {[...Array(25)].map((_, i) => (
              <div key={`top-${i}`} className="w-2.5 h-2.5 bg-muted-foreground/40 rounded-full" />
            ))}
          </div>
          
          {/* Frame Numbers */}
          <div className="flex justify-between absolute top-8 left-6 right-6 text-xs text-muted-foreground font-mono">
            {scenes.map((_, index) => (
              <span key={index} className="bg-muted/80 px-2 py-1 rounded">
                {String(index + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
          
          {/* Main Film Strip */}
          <div className="flex gap-3 my-8 px-4">
            {scenes.map((scene, index) => (
              <div key={scene.id} className="flex flex-col items-center gap-3">
                {/* Scene Preview Frame */}
                <div
                  className={cn(
                    'relative rounded-lg border-4 border-white shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden',
                    scene.color,
                    'group'
                  )}
                  style={{ 
                    width: `${Math.max(150, scene.duration * 2)}px`, 
                    height: '100px' 
                  }}
                  title={`${scene.title} - ${scene.duration}s`}
                >
                  {/* Scene Visual with Real Photo */}
                  <div className="absolute inset-0">
                    <img 
                      src={scene.preview} 
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-white">
                      <div className="text-xs font-bold">{scene.duration}s</div>
                    </div>
                  </div>
                  
                  {/* Scene Status Indicator */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      'bg-green-400' // All scenes complete for demo
                    )} />
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                  </div>

                  {/* Film Perforations */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20" />
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/20" />
                </div>
                
                {/* Scene Info */}
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">{scene.title}</div>
                  <div className="text-xs text-muted-foreground">Act {Math.floor(index / 2) + 1}</div>
                  <div className="text-xs text-muted-foreground">{scene.nodes.length} nodes</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sprocket Holes Bottom */}
          <div className="flex justify-between absolute bottom-3 left-6 right-6">
            {[...Array(25)].map((_, i) => (
              <div key={`bottom-${i}`} className="w-2.5 h-2.5 bg-muted-foreground/40 rounded-full" />
            ))}
          </div>
          
          {/* Timeline Track Labels */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 space-y-2">
            <div className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">VIDEO</div>
            <div className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">AUDIO</div>
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">FX</div>
          </div>
        </div>
        
        {/* Enhanced Timeline Controls */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-3">
            <Button variant="default" className="gap-2">
              <Play className="h-5 w-5" />
              Preview Film
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-5 w-5" />
              Export Master
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-5 w-5" />
              Timeline Settings
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <span className="text-muted-foreground">Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-muted-foreground">Pending</span>
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
      <div className="fixed top-20 left-4 z-40 bg-card border border-primary rounded-xl p-2 shadow-xl">
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

      {/* Production Layers Panel - Minimized by Default */}
      <div className={cn(
        "fixed top-20 right-4 z-40 bg-card border border-primary rounded-xl shadow-xl transition-all duration-300",
        showProductionLayers ? "w-80 h-96" : "w-12 h-12"
      )}>
        <div className="p-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowProductionLayers(!showProductionLayers)}
            className="w-8 h-8"
            title="Production Layers"
          >
            {showProductionLayers ? <Minimize2 className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          </Button>
          
          {showProductionLayers && (
            <div className="mt-2 space-y-2">
              <h4 className="text-sm font-semibold">Production Layers</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-slate-400 rounded" />
                  <span>Scripts & Story</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-purple-400 rounded" />
                  <span>Characters</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-fuchsia-400 rounded" />
                  <span>Production Design</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-amber-400 rounded" />
                  <span>Lighting</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-blue-400 rounded" />
                  <span>Environments</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-emerald-400 rounded" />
                  <span>Media Generation</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-yellow-400 rounded" />
                  <span>Audio Design</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <div className="w-3 h-3 bg-pink-400 rounded" />
                  <span>Final Output</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Grid Background */}
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
        {/* Scene Containers */}
        {scenes.map(scene => (
          <div
            key={scene.id}
            className="absolute"
            style={{ left: scene.position.x - 100, top: scene.position.y - 100, width: 2000, height: 400 }}
          >
            {/* Scene Background */}
            <div className={cn(
              'absolute inset-0 rounded-2xl border-2 border-dashed opacity-20',
              scene.color.replace('bg-', 'border-').replace('-500', '-300')
            )} />
            
            {/* Scene Label */}
            <div className={cn(
              'absolute -top-8 left-4 px-4 py-2 rounded-lg text-white font-bold text-sm shadow-lg',
              scene.color
            )}>
              {scene.title} ({scene.nodes.length} nodes)
            </div>
            
            {/* Scene Nodes */}
            {scene.nodes.map(renderNode)}
          </div>
        ))}
        
        {/* Timeline Node */}
        {renderNode(timelineNode)}
        
        {/* Render all connections */}
        {renderConnections()}
        {renderSceneConnections()}
        
        {/* Film Timeline */}
        {renderFilmTimeline()}
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