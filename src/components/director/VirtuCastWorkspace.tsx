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
  ChevronUp,
  Brain,
  Cpu,
  Shield,
  Zap as Lightning,
  Bot,
  Binary,
  Server,
  Database,
  Code,
  Network,
  Wifi,
  Monitor,
  Gamepad2,
  Headphones,
  Radio,
  Phone,
  Smartphone
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

// Comprehensive script for the feature film inspired by Blade Runner and Matrix
const featureFilmScript = {
  title: "NEON MATRIX: Digital Awakening",
  logline: "In a cyberpunk dystopia where reality and simulation blur, corporate executive Alira Chen discovers the truth about The Matrix while detective Marcus Storm hunts rogue AI programs in neon-soaked Neo-Tokyo.",
  genre: "Cyberpunk Sci-Fi Thriller",
  runtime: "2h 15min",
  acts: [
    {
      act: 1,
      title: "The Corporate Illusion",
      duration: "35 minutes",
      scenes: [
        "Corporate Boardroom - Alira's presentation to The Board",
        "Executive Office - Discovery of suspicious data streams", 
        "Neo-Tokyo Streets - Marcus investigates digital crimes",
        "Underground Club - First hints of The Matrix",
        "Alira's Apartment - Strange glitches in reality",
        "Police Station - Marcus encounters AI anomalies"
      ]
    },
    {
      act: 2,
      title: "The Red Pill",
      duration: "50 minutes", 
      scenes: [
        "Matrix Interface - Alira's first awakening",
        "Real World Reveal - The desolate reality outside",
        "Zion Base - Meeting the resistance",
        "Training Simulation - Learning to fight in The Matrix",
        "Corporate Infiltration - Undercover mission",
        "Agent Smith Encounter - First major confrontation",
        "Betrayal - Corporate insider reveals truth",
        "Chase Sequence - Rooftop pursuit through Neo-Tokyo"
      ]
    },
    {
      act: 3,
      title: "Digital Revolution", 
      duration: "50 minutes",
      scenes: [
        "Space Station Command - Luna coordinates from orbit",
        "Final Preparation - Team assembles for final mission",
        "Matrix Infiltration - Multi-layered digital heist",
        "Corporate Tower Assault - Physical and digital battle",
        "Agent Army - Massive AI confrontation",
        "The Source Code - Reaching the core of The Matrix",
        "Final Choice - Alira's decision that changes everything",
        "New Reality - The world after The Matrix"
      ]
    }
  ]
};

// Enhanced collision detection system
const GRID_SIZE = 80;
const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;
const MIN_NODE_SPACING = 20;

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

// Comprehensive scene-based node organization for full feature film
const initialScenes: Scene[] = [
  {
    id: 'scene1',
    title: 'Act I: Corporate Boardroom',
    duration: 180,
    color: 'bg-purple-500',
    preview: executivePortrait,
    position: { x: 200, y: 1400 },
    nodes: [
      // Master script
      { id: 'script1-master', type: 'script', title: 'Act I Master Script', description: 'Complete first act screenplay', x: 100, y: 100, connections: ['script1-1', 'script1-2', 'script1-3'], status: 'complete', thumbnail: filmScript },
      
      // Individual scene scripts
      { id: 'script1-1', type: 'script', title: 'Corporate Presentation', description: 'Boardroom power dynamics', x: 400, y: 50, connections: ['char1-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script1-2', type: 'script', title: 'Data Discovery', description: 'Alira finds suspicious files', x: 400, y: 120, connections: ['char1-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script1-3', type: 'script', title: 'Reality Glitches', description: 'First Matrix anomalies', x: 400, y: 190, connections: ['char1-1'], status: 'complete', thumbnail: filmScript },
      
      // Main characters
      { id: 'char1-1', type: 'character', title: 'Alira Chen', description: 'Corporate Executive / The One', x: 700, y: 120, connections: ['char1-2', 'style1-1'], status: 'complete', thumbnail: executivePortrait },
      { id: 'char1-2', type: 'character', title: 'Board Members', description: 'Corporate power structure', x: 700, y: 220, connections: ['style1-1'], status: 'complete', thumbnail: executivePortrait },
      
      // Production design
      { id: 'style1-1', type: 'style', title: 'Corporate Matrix Style', description: 'Clean facade hiding digital truth', x: 1000, y: 80, connections: ['light1-1', 'light1-2'], status: 'complete' },
      { id: 'light1-1', type: 'lighting', title: 'Boardroom Lighting', description: 'Sterile corporate illumination', x: 1300, y: 50, connections: ['bg1-1'], status: 'complete', thumbnail: lightingSetup },
      { id: 'light1-2', type: 'lighting', title: 'Office Noir', description: 'Dramatic shadows for discovery', x: 1300, y: 120, connections: ['bg1-2'], status: 'complete', thumbnail: lightingSetup },
      
      // Environments
      { id: 'bg1-1', type: 'background', title: 'Corporate Boardroom', description: 'Glass towers and city views', x: 1600, y: 50, connections: ['cam1-1'], status: 'complete', thumbnail: boardroomBg },
      { id: 'bg1-2', type: 'background', title: 'Executive Office', description: 'Private space for discovery', x: 1600, y: 120, connections: ['cam1-2'], status: 'complete', thumbnail: boardroomBg },
      
      // Camera work
      { id: 'cam1-1', type: 'camera', title: 'Corporate Cameras', description: 'Establishing and close-ups', x: 1900, y: 50, connections: ['img1-1'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'cam1-2', type: 'camera', title: 'Macro Detail', description: 'Document reveals and reactions', x: 1900, y: 120, connections: ['img1-2'], status: 'complete', thumbnail: cameraEquipment },
      
      // Props and technology
      { id: 'prop1-1', type: 'prop', title: 'Digital Interface', description: 'Holographic data displays', x: 700, y: 320, connections: ['img1-1'], status: 'complete' },
      { id: 'prop1-2', type: 'prop', title: 'Executive Briefcase', description: 'Contains hidden data drives', x: 1000, y: 320, connections: ['img1-1'], status: 'complete' },
      { id: 'wardrobe1-1', type: 'wardrobe', title: 'Executive Attire', description: 'Perfect corporate facade', x: 1300, y: 320, connections: ['char1-1'], status: 'complete', thumbnail: businessWardrobe },
      
      // Media generation
      { id: 'img1-1', type: 'image', title: 'Boardroom Sequence', description: 'Corporate presentation visuals', x: 2200, y: 80, connections: ['vid1-1'], status: 'complete', thumbnail: executivePortrait },
      { id: 'img1-2', type: 'image', title: 'Discovery Moment', description: 'Data revelation sequence', x: 2200, y: 150, connections: ['vid1-1'], status: 'complete', thumbnail: executivePortrait },
      { id: 'vid1-1', type: 'video', title: 'Act I Complete', description: 'Full corporate sequence', x: 2500, y: 120, connections: [], status: 'complete' },
      
      // Audio design
      { id: 'music1-1', type: 'music', title: 'Corporate Deception', description: 'Orchestral with digital undertones', x: 2200, y: 270, connections: ['vid1-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'voiceover1-1', type: 'voiceover', title: 'Alira\'s Dialogue', description: 'Professional to questioning', x: 2200, y: 340, connections: ['vid1-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx1-1', type: 'sfx', title: 'Digital Glitches', description: 'Subtle Matrix anomaly sounds', x: 2500, y: 270, connections: ['vid1-1'], status: 'complete', thumbnail: audioMixing }
    ]
  },
  {
    id: 'scene2',
    title: 'Act II: Neo-Tokyo Streets',
    duration: 320,
    color: 'bg-red-500',
    preview: detectiveScene,
    position: { x: 600, y: 1400 },
    nodes: [
      // Master act script
      { id: 'script2-master', type: 'script', title: 'Act II Master Script', description: 'Street investigation and awakening', x: 100, y: 500, connections: ['script2-1', 'script2-2', 'script2-3', 'script2-4'], status: 'complete', thumbnail: filmScript },
      
      // Individual scenes
      { id: 'script2-1', type: 'script', title: 'Detective Introduction', description: 'Marcus patrols neon streets', x: 400, y: 450, connections: ['char2-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script2-2', type: 'script', title: 'Digital Crime Scene', description: 'AI-generated evidence trail', x: 400, y: 520, connections: ['char2-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script2-3', type: 'script', title: 'Underground Club', description: 'First contact with resistance', x: 400, y: 590, connections: ['char2-1', 'char2-3'], status: 'complete', thumbnail: filmScript },
      { id: 'script2-4', type: 'script', title: 'Katana Combat', description: 'Traditional vs digital weapons', x: 400, y: 660, connections: ['char2-1'], status: 'complete', thumbnail: filmScript },
      
      // Characters
      { id: 'char2-1', type: 'character', title: 'Marcus Storm', description: 'Neo-Tokyo Detective', x: 700, y: 520, connections: ['char2-2', 'style2-1'], status: 'complete', thumbnail: detectiveScene },
      { id: 'char2-2', type: 'character', title: 'Agent Smith', description: 'AI enforcement program', x: 700, y: 620, connections: ['style2-2'], status: 'complete', thumbnail: detectiveScene },
      { id: 'char2-3', type: 'character', title: 'Morpheus', description: 'Resistance leader mentor', x: 700, y: 720, connections: ['style2-1'], status: 'complete', thumbnail: detectiveScene },
      
      // Production design
      { id: 'style2-1', type: 'style', title: 'Cyberpunk Noir', description: 'Rain-soaked neon aesthetic', x: 1000, y: 480, connections: ['light2-1', 'light2-2'], status: 'complete' },
      { id: 'style2-2', type: 'style', title: 'Matrix Code Style', description: 'Digital overlay effects', x: 1000, y: 580, connections: ['light2-3'], status: 'complete' },
      
      // Lighting design
      { id: 'light2-1', type: 'lighting', title: 'Neon Street Lighting', description: 'Pink and blue cyberpunk glow', x: 1300, y: 450, connections: ['bg2-1'], status: 'complete', thumbnail: lightingSetup },
      { id: 'light2-2', type: 'lighting', title: 'Underground Club', description: 'Strobing rave atmosphere', x: 1300, y: 520, connections: ['bg2-2'], status: 'complete', thumbnail: lightingSetup },
      { id: 'light2-3', type: 'lighting', title: 'Matrix Interface', description: 'Green digital rain effect', x: 1300, y: 590, connections: ['bg2-3'], status: 'complete', thumbnail: lightingSetup },
      
      // Weather and atmosphere
      { id: 'weather2-1', type: 'weather', title: 'Acid Rain', description: 'Atmospheric pollution effect', x: 1000, y: 680, connections: ['bg2-1'], status: 'complete' },
      { id: 'weather2-2', type: 'weather', title: 'Digital Storms', description: 'Matrix glitch weather', x: 1000, y: 750, connections: ['bg2-3'], status: 'complete' },
      
      // Environments
      { id: 'bg2-1', type: 'background', title: 'Neo-Tokyo Streets', description: 'Towering holograms and neon', x: 1600, y: 450, connections: ['cam2-1'], status: 'complete', thumbnail: cyberpunkStreet },
      { id: 'bg2-2', type: 'background', title: 'Underground Club', description: 'Hidden resistance meeting place', x: 1600, y: 520, connections: ['cam2-2'], status: 'complete', thumbnail: cyberpunkStreet },
      { id: 'bg2-3', type: 'background', title: 'Matrix Interface', description: 'Digital code environment', x: 1600, y: 590, connections: ['cam2-3'], status: 'complete', thumbnail: cyberpunkStreet },
      
      // Location details
      { id: 'location2-1', type: 'location', title: 'Shibuya District 2177', description: 'Central Neo-Tokyo hub', x: 1600, y: 680, connections: ['bg2-1'], status: 'complete' },
      { id: 'location2-2', type: 'location', title: 'Data Fortress', description: 'Corporate server farm', x: 1600, y: 750, connections: ['bg2-3'], status: 'complete' },
      
      // Advanced cinematography
      { id: 'cam2-1', type: 'camera', title: 'Street Tracking', description: 'Fluid following shots through crowds', x: 1900, y: 450, connections: ['img2-1'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'cam2-2', type: 'camera', title: 'Combat Choreography', description: 'Multi-angle fight coverage', x: 1900, y: 520, connections: ['img2-2'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'cam2-3', type: 'camera', title: 'Digital Perspectives', description: 'Matrix code visualization', x: 1900, y: 590, connections: ['img2-3'], status: 'complete', thumbnail: cameraEquipment },
      
      // Props and weapons
      { id: 'prop2-1', type: 'prop', title: 'Katana Blade', description: 'Traditional weapon in digital age', x: 700, y: 820, connections: ['img2-2'], status: 'complete', thumbnail: katanaProp },
      { id: 'prop2-2', type: 'prop', title: 'Holo-Display', description: 'Interactive crime scene data', x: 1000, y: 820, connections: ['img2-1'], status: 'complete' },
      { id: 'prop2-3', type: 'prop', title: 'Neural Interface', description: 'Direct brain-computer link', x: 1300, y: 820, connections: ['img2-3'], status: 'complete' },
      
      // Wardrobe design
      { id: 'wardrobe2-1', type: 'wardrobe', title: 'Detective Coat', description: 'Noir styling with tech elements', x: 1600, y: 820, connections: ['char2-1'], status: 'complete' },
      { id: 'wardrobe2-2', type: 'wardrobe', title: 'Agent Suits', description: 'Perfect digital uniformity', x: 1900, y: 820, connections: ['char2-2'], status: 'complete' },
      
      // Media generation
      { id: 'img2-1', type: 'image', title: 'Street Investigation', description: 'Detective in neon-lit alley', x: 2200, y: 480, connections: ['vid2-1'], status: 'complete', thumbnail: detectiveScene },
      { id: 'img2-2', type: 'image', title: 'Sword Combat', description: 'Traditional vs AI weapons', x: 2200, y: 550, connections: ['vid2-1'], status: 'complete', thumbnail: detectiveScene },
      { id: 'img2-3', type: 'image', title: 'Matrix Awakening', description: 'First glimpse of true reality', x: 2200, y: 620, connections: ['vid2-1'], status: 'complete', thumbnail: detectiveScene },
      { id: 'vid2-1', type: 'video', title: 'Act II Complete', description: 'Street investigation to awakening', x: 2500, y: 550, connections: [], status: 'complete' },
      
      // Audio landscape
      { id: 'music2-1', type: 'music', title: 'Neo-Tokyo Nights', description: 'Synthwave with traditional elements', x: 2200, y: 720, connections: ['vid2-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'music2-2', type: 'music', title: 'Matrix Theme', description: 'Digital awakening orchestral', x: 2200, y: 790, connections: ['vid2-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx2-1', type: 'sfx', title: 'Street Ambience', description: 'Rain, traffic, holo-ads', x: 2500, y: 720, connections: ['vid2-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx2-2', type: 'sfx', title: 'Combat Audio', description: 'Blade clashes and digital impacts', x: 2500, y: 790, connections: ['vid2-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'voiceover2-1', type: 'voiceover', title: 'Marcus Narration', description: 'Detective\'s internal monologue', x: 2200, y: 860, connections: ['vid2-1'], status: 'complete', thumbnail: audioMixing }
    ]
  },
  {
    id: 'scene3',
    title: 'Act II: Matrix Training',
    duration: 280,
    color: 'bg-orange-500',
    preview: cyberpunkStreet,
    position: { x: 1000, y: 1400 },
    nodes: [
      // Training program scripts
      { id: 'script3-master', type: 'script', title: 'Training Protocols', description: 'Matrix simulation sequences', x: 100, y: 900, connections: ['script3-1', 'script3-2', 'script3-3'], status: 'complete', thumbnail: filmScript },
      { id: 'script3-1', type: 'script', title: 'Sparring Program', description: 'Combat training simulation', x: 400, y: 850, connections: ['char3-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script3-2', type: 'script', title: 'Jump Program', description: 'Rooftop simulation test', x: 400, y: 920, connections: ['char3-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script3-3', type: 'script', title: 'Chase Sequence', description: 'High-speed pursuit training', x: 400, y: 990, connections: ['char3-1'], status: 'complete', thumbnail: filmScript },
      
      // Characters in training
      { id: 'char3-1', type: 'character', title: 'Alira - Training', description: 'Learning Matrix combat', x: 700, y: 920, connections: ['char3-2', 'style3-1'], status: 'complete', thumbnail: executivePortrait },
      { id: 'char3-2', type: 'character', title: 'Neo-Morpheus', description: 'AI training program', x: 700, y: 1020, connections: ['style3-2'], status: 'complete', thumbnail: detectiveScene },
      
      // Simulation environments
      { id: 'style3-1', type: 'style', title: 'Simulation Aesthetic', description: 'Clean training environment', x: 1000, y: 880, connections: ['light3-1'], status: 'complete' },
      { id: 'style3-2', type: 'style', title: 'Code Visualization', description: 'Matrix code overlay effects', x: 1000, y: 980, connections: ['light3-2'], status: 'complete' },
      
      // Advanced lighting systems
      { id: 'light3-1', type: 'lighting', title: 'Dojo Lighting', description: 'Clean simulation environment', x: 1300, y: 850, connections: ['bg3-1'], status: 'complete', thumbnail: lightingSetup },
      { id: 'light3-2', type: 'lighting', title: 'Digital Rain', description: 'Matrix code visualization', x: 1300, y: 920, connections: ['bg3-2'], status: 'complete', thumbnail: lightingSetup },
      { id: 'light3-3', type: 'lighting', title: 'Rooftop Simulation', description: 'Cityscape training environment', x: 1300, y: 990, connections: ['bg3-3'], status: 'complete', thumbnail: lightingSetup },
      
      // Training environments
      { id: 'bg3-1', type: 'background', title: 'Training Dojo', description: 'White simulation space', x: 1600, y: 850, connections: ['cam3-1'], status: 'complete' },
      { id: 'bg3-2', type: 'background', title: 'Code Matrix', description: 'Digital rain environment', x: 1600, y: 920, connections: ['cam3-2'], status: 'complete' },
      { id: 'bg3-3', type: 'background', title: 'City Rooftops', description: 'Urban training simulation', x: 1600, y: 990, connections: ['cam3-3'], status: 'complete' },
      
      // Location details
      { id: 'location3-1', type: 'location', title: 'Zion Base', description: 'Real world training facility', x: 1600, y: 1090, connections: ['bg3-1'], status: 'complete' },
      
      // Specialized cameras
      { id: 'cam3-1', type: 'camera', title: 'Combat Coverage', description: 'Multi-angle fight choreography', x: 1900, y: 850, connections: ['img3-1'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'cam3-2', type: 'camera', title: 'Matrix Visualization', description: 'Code rain perspective shots', x: 1900, y: 920, connections: ['img3-2'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'cam3-3', type: 'camera', title: 'Aerial Tracking', description: 'Rooftop jump sequences', x: 1900, y: 990, connections: ['img3-3'], status: 'complete', thumbnail: cameraEquipment },
      
      // Training props
      { id: 'prop3-1', type: 'prop', title: 'Simulation Weapons', description: 'Digital training arsenal', x: 700, y: 1120, connections: ['img3-1'], status: 'complete' },
      { id: 'prop3-2', type: 'prop', title: 'Neural Interfaces', description: 'Training simulation ports', x: 1000, y: 1120, connections: ['img3-2'], status: 'complete' },
      { id: 'prop3-3', type: 'prop', title: 'Hover Platforms', description: 'Anti-gravity training aids', x: 1300, y: 1120, connections: ['img3-3'], status: 'complete' },
      
      // Wardrobe evolution
      { id: 'wardrobe3-1', type: 'wardrobe', title: 'Training Gear', description: 'Flexible combat attire', x: 1600, y: 1190, connections: ['char3-1'], status: 'complete' },
      
      // Media outputs
      { id: 'img3-1', type: 'image', title: 'Combat Training', description: 'Sparring simulation visuals', x: 2200, y: 880, connections: ['vid3-1'], status: 'complete' },
      { id: 'img3-2', type: 'image', title: 'Matrix Interface', description: 'Code visualization sequence', x: 2200, y: 950, connections: ['vid3-1'], status: 'complete' },
      { id: 'img3-3', type: 'image', title: 'Rooftop Chase', description: 'Urban pursuit training', x: 2200, y: 1020, connections: ['vid3-1'], status: 'complete' },
      { id: 'vid3-1', type: 'video', title: 'Training Complete', description: 'Full simulation sequence', x: 2500, y: 950, connections: [], status: 'complete' },
      
      // Audio design
      { id: 'music3-1', type: 'music', title: 'Training Montage', description: 'Building intensity score', x: 2200, y: 1120, connections: ['vid3-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx3-1', type: 'sfx', title: 'Simulation Audio', description: 'Digital environment sounds', x: 2200, y: 1190, connections: ['vid3-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx3-2', type: 'sfx', title: 'Combat Impacts', description: 'Training fight sound effects', x: 2500, y: 1120, connections: ['vid3-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'voiceover3-1', type: 'voiceover', title: 'Morpheus Guidance', description: 'Training instruction dialogue', x: 2500, y: 1190, connections: ['vid3-1'], status: 'complete', thumbnail: audioMixing }
    ]
  },
  {
    id: 'scene4',
    title: 'Act II: Corporate Infiltration',
    duration: 240,
    color: 'bg-blue-500',
    preview: spacePilot,
    position: { x: 1400, y: 1400 },
    nodes: [
      // Infiltration mission scripts
      { id: 'script4-master', type: 'script', title: 'Infiltration Mission', description: 'Corporate tower assault plan', x: 100, y: 1200, connections: ['script4-1', 'script4-2'], status: 'complete', thumbnail: filmScript },
      { id: 'script4-1', type: 'script', title: 'Stealth Entry', description: 'Silent infiltration sequence', x: 400, y: 1150, connections: ['char4-1'], status: 'complete', thumbnail: filmScript },
      { id: 'script4-2', type: 'script', title: 'Data Heist', description: 'Accessing the mainframe', x: 400, y: 1220, connections: ['char4-1'], status: 'complete', thumbnail: filmScript },
      
      // Mission team
      { id: 'char4-1', type: 'character', title: 'Alira - Infiltrator', description: 'Executive turned rebel', x: 700, y: 1200, connections: ['char4-2'], status: 'complete', thumbnail: executivePortrait },
      { id: 'char4-2', type: 'character', title: 'Marcus - Backup', description: 'Detective providing support', x: 700, y: 1300, connections: ['style4-1'], status: 'complete', thumbnail: detectiveScene },
      
      // Mission aesthetics
      { id: 'style4-1', type: 'style', title: 'Corporate Security', description: 'High-tech surveillance systems', x: 1000, y: 1180, connections: ['light4-1'], status: 'complete' },
      { id: 'style4-2', type: 'style', title: 'Digital Intrusion', description: 'Hacking visualization effects', x: 1000, y: 1280, connections: ['light4-2'], status: 'complete' },
      
      // Security lighting
      { id: 'light4-1', type: 'lighting', title: 'Security Systems', description: 'Red alert lighting grid', x: 1300, y: 1150, connections: ['bg4-1'], status: 'complete', thumbnail: lightingSetup },
      { id: 'light4-2', type: 'lighting', title: 'Data Visualization', description: 'Blue holographic interfaces', x: 1300, y: 1220, connections: ['bg4-2'], status: 'complete', thumbnail: lightingSetup },
      
      // Corporate environments
      { id: 'bg4-1', type: 'background', title: 'Corporate Tower', description: 'High-security office building', x: 1600, y: 1150, connections: ['cam4-1'], status: 'complete', thumbnail: boardroomBg },
      { id: 'bg4-2', type: 'background', title: 'Server Room', description: 'Mainframe data center', x: 1600, y: 1220, connections: ['cam4-2'], status: 'complete', thumbnail: spaceshipBridge },
      
      // Location specifics
      { id: 'location4-1', type: 'location', title: 'Corporate Plaza', description: 'Downtown business district', x: 1600, y: 1320, connections: ['bg4-1'], status: 'complete' },
      
      // Specialized cameras
      { id: 'cam4-1', type: 'camera', title: 'Stealth Tracking', description: 'Silent infiltration coverage', x: 1900, y: 1150, connections: ['img4-1'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'cam4-2', type: 'camera', title: 'Data Interface', description: 'Close-up hacking sequences', x: 1900, y: 1220, connections: ['img4-2'], status: 'complete', thumbnail: cameraEquipment },
      
      // Mission props
      { id: 'prop4-1', type: 'prop', title: 'Hacking Device', description: 'Portable data extractor', x: 700, y: 1400, connections: ['img4-2'], status: 'complete' },
      { id: 'prop4-2', type: 'prop', title: 'Security Badge', description: 'Forged access credentials', x: 1000, y: 1400, connections: ['img4-1'], status: 'complete' },
      { id: 'prop4-3', type: 'prop', title: 'Neural Scanner', description: 'Biometric bypass tool', x: 1300, y: 1400, connections: ['img4-2'], status: 'complete' },
      
      // Mission wardrobe
      { id: 'wardrobe4-1', type: 'wardrobe', title: 'Corporate Disguise', description: 'Blending in with executives', x: 1600, y: 1400, connections: ['char4-1'], status: 'complete', thumbnail: businessWardrobe },
      
      // Mission visuals
      { id: 'img4-1', type: 'image', title: 'Infiltration Sequence', description: 'Stealth mission visuals', x: 2200, y: 1180, connections: ['vid4-1'], status: 'complete', thumbnail: executivePortrait },
      { id: 'img4-2', type: 'image', title: 'Data Heist', description: 'Hacking the mainframe', x: 2200, y: 1250, connections: ['vid4-1'], status: 'complete', thumbnail: spaceshipBridge },
      { id: 'vid4-1', type: 'video', title: 'Mission Complete', description: 'Corporate infiltration sequence', x: 2500, y: 1220, connections: [], status: 'complete' },
      
      // Mission audio
      { id: 'music4-1', type: 'music', title: 'Tension Score', description: 'Suspenseful infiltration theme', x: 2200, y: 1350, connections: ['vid4-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx4-1', type: 'sfx', title: 'Security Systems', description: 'Alarms and surveillance sounds', x: 2200, y: 1420, connections: ['vid4-1'], status: 'complete', thumbnail: audioMixing },
      { id: 'sfx4-2', type: 'sfx', title: 'Data Transfer', description: 'Digital hacking sound effects', x: 2500, y: 1350, connections: ['vid4-1'], status: 'complete', thumbnail: audioMixing }
    ]
  },
  
  // Additional scenes for full feature film
  {
    id: 'scene5',
    title: 'Act III: Space Command Center',
    duration: 180,
    color: 'bg-cyan-500',
    preview: spacePilot,
    position: { x: 1800, y: 1400 },
    nodes: [
      // Space operations
      { id: 'script5-1', type: 'script', title: 'Orbital Command', description: 'Space station coordination', x: 100, y: 1500, connections: ['char5-1'], status: 'complete', thumbnail: filmScript },
      { id: 'char5-1', type: 'character', title: 'Luna Voss', description: 'Space Operations Commander', x: 400, y: 1550, connections: ['style5-1'], status: 'complete', thumbnail: spacePilot },
      { id: 'style5-1', type: 'style', title: 'Space Command', description: 'Advanced space technology', x: 700, y: 1500, connections: ['light5-1'], status: 'complete' },
      { id: 'light5-1', type: 'lighting', title: 'Orbital Lighting', description: 'Zero-gravity illumination', x: 1000, y: 1500, connections: ['bg5-1'], status: 'complete', thumbnail: lightingSetup },
      { id: 'bg5-1', type: 'background', title: 'Command Bridge', description: 'Advanced space station', x: 1300, y: 1550, connections: ['cam5-1'], status: 'complete', thumbnail: spaceshipBridge },
      { id: 'cam5-1', type: 'camera', title: 'Zero-G Cameras', description: 'Floating camera work', x: 1600, y: 1500, connections: ['img5-1'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'img5-1', type: 'image', title: 'Space Command', description: 'Orbital operations center', x: 1900, y: 1550, connections: ['vid5-1'], status: 'complete', thumbnail: spacePilot },
      { id: 'vid5-1', type: 'video', title: 'Space Operations', description: 'Command center sequence', x: 2200, y: 1550, connections: [], status: 'complete' }
    ]
  },
  
  {
    id: 'scene6',
    title: 'Act III: Final Battle',
    duration: 360,
    color: 'bg-rose-500',
    preview: detectiveScene,
    position: { x: 2200, y: 1400 },
    nodes: [
      // Epic finale
      { id: 'script6-1', type: 'script', title: 'Final Confrontation', description: 'Matrix vs Real World battle', x: 100, y: 1600, connections: ['char6-1'], status: 'complete', thumbnail: filmScript },
      { id: 'char6-1', type: 'character', title: 'Team Assembly', description: 'All heroes united', x: 400, y: 1650, connections: ['style6-1'], status: 'complete', thumbnail: detectiveScene },
      { id: 'style6-1', type: 'style', title: 'Epic Scale', description: 'Massive battle aesthetic', x: 700, y: 1600, connections: ['light6-1'], status: 'complete' },
      { id: 'light6-1', type: 'lighting', title: 'War Lighting', description: 'Dramatic battle illumination', x: 1000, y: 1600, connections: ['bg6-1'], status: 'complete', thumbnail: lightingSetup },
      { id: 'bg6-1', type: 'background', title: 'Digital Battlefield', description: 'Matrix core environment', x: 1300, y: 1650, connections: ['cam6-1'], status: 'complete', thumbnail: cyberpunkStreet },
      { id: 'cam6-1', type: 'camera', title: 'Epic Cinematography', description: 'Sweeping battle coverage', x: 1600, y: 1600, connections: ['img6-1'], status: 'complete', thumbnail: cameraEquipment },
      { id: 'img6-1', type: 'image', title: 'Final Battle', description: 'Epic confrontation visuals', x: 1900, y: 1650, connections: ['vid6-1'], status: 'complete', thumbnail: detectiveScene },
      { id: 'vid6-1', type: 'video', title: 'Finale Complete', description: 'Epic conclusion sequence', x: 2200, y: 1650, connections: [], status: 'complete' }
    ]
  }
];

// Master timeline node with proper spacing
const timelineNode: Node = { 
  id: 'master-timeline', 
  type: 'timeline', 
  title: 'NEON MATRIX: Digital Awakening', 
  description: 'Feature Film Master Timeline - 2h 15min', 
  x: 1200, 
  y: 1800, 
  connections: [], 
  status: 'complete' 
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
            // Get valid position avoiding collisions
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

        {/* Node Preview with Real Photo */}
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
            
            {/* Processing overlay */}
            {node.status === 'processing' && (
              <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
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

        {/* Enhanced Connection Points */}
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
      node.connections.forEach(targetId => {
        const targetNode = allNodes.find(n => n.id === targetId);
        if (!targetNode) return;
        
        // Better connection point calculation
        const startX = node.x + NODE_WIDTH - 3; // Right connection point
        const startY = node.y + NODE_HEIGHT / 2; // Center vertically
        const endX = targetNode.x + 3; // Left connection point
        const endY = targetNode.y + NODE_HEIGHT / 2;
        
        // Improved bezier curve calculation
        const distance = Math.abs(endX - startX);
        const controlOffset = Math.min(distance * 0.4, 150);
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
            className="absolute inset-0 pointer-events-none z-10"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <marker
                id={`arrowhead-${node.id}-${targetId}`}
                markerWidth="10"
                markerHeight="8"
                refX="9"
                refY="4"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 4, 0 8"
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
              className="drop-shadow-lg opacity-70 hover:opacity-100 transition-all duration-200"
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
      const sceneX = scene.position.x + 100; // Scene center
      const sceneY = scene.position.y + 200; // Scene bottom
      const timelineX = timelineNode.x + NODE_WIDTH / 2; // Timeline center
      const timelineY = timelineNode.y; // Timeline top
      
      // Calculate smooth curve
      const midX = (sceneX + timelineX) / 2;
      const midY = sceneY + (timelineY - sceneY) / 2;
      const controlPoint1X = sceneX;
      const controlPoint1Y = midY;
      const controlPoint2X = timelineX;
      const controlPoint2Y = midY;
      
      connections.push(
        <svg
          key={`scene-${scene.id}-timeline`}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id={`scene-arrow-${scene.id}`}
              markerWidth="16"
              markerHeight="12"
              refX="14"
              refY="6"
              orient="auto"
            >
              <polygon
                points="0 0, 16 6, 0 12"
                fill="hsl(var(--primary))"
              />
            </marker>
          </defs>
          <path
            d={`M ${sceneX} ${sceneY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${timelineX} ${timelineY}`}
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            fill="none"
            strokeDasharray="15,8"
            markerEnd={`url(#scene-arrow-${scene.id})`}
            className="drop-shadow-xl opacity-90 hover:opacity-100 transition-all duration-300"
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
      {/* Top Bar with Integrated Controls */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-card/90 backdrop-blur-sm border border-primary/20 rounded-xl p-2 shadow-xl">
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
          
          {/* Film Info */}
          <div className="border-l border-border pl-4">
            <div className="text-xs font-semibold text-foreground">NEON MATRIX: Digital Awakening</div>
            <div className="text-xs text-muted-foreground">2h 15min • {scenes.length} Acts • {allNodes.length - 1} Nodes</div>
          </div>
        </div>
      </div>

      {/* Production Layers Panel - Right Side When Open */}
      {showProductionLayers && (
        <div className="fixed top-20 right-4 z-40 w-80 bg-card/95 backdrop-blur-sm border border-primary/20 rounded-xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold">Production Layers</h4>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowProductionLayers(false)}
              className="h-6 w-6"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2 text-xs max-h-80 overflow-y-auto">
            {[
              { color: 'bg-slate-400', label: 'Scripts & Story', count: allNodes.filter(n => n.type === 'script').length },
              { color: 'bg-purple-400', label: 'Characters', count: allNodes.filter(n => n.type === 'character').length },
              { color: 'bg-fuchsia-400', label: 'Production Design', count: allNodes.filter(n => n.type === 'style').length },
              { color: 'bg-amber-400', label: 'Lighting', count: allNodes.filter(n => n.type === 'lighting').length },
              { color: 'bg-blue-400', label: 'Environments', count: allNodes.filter(n => n.type === 'background').length },
              { color: 'bg-emerald-400', label: 'Media Generation', count: allNodes.filter(n => ['image', 'video'].includes(n.type)).length },
              { color: 'bg-yellow-400', label: 'Audio Design', count: allNodes.filter(n => ['music', 'sfx', 'voiceover'].includes(n.type)).length },
              { color: 'bg-orange-400', label: 'Props & Wardrobe', count: allNodes.filter(n => ['prop', 'wardrobe'].includes(n.type)).length },
              { color: 'bg-cyan-400', label: 'Camera Work', count: allNodes.filter(n => n.type === 'camera').length },
              { color: 'bg-pink-400', label: 'Final Output', count: allNodes.filter(n => n.type === 'timeline').length }
            ].map((layer, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${layer.color} rounded`} />
                  <span>{layer.label}</span>
                </div>
                <span className="text-muted-foreground">{layer.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {/* Scene Containers with Better Organization */}
        {scenes.map(scene => (
          <div
            key={scene.id}
            className="absolute"
            style={{ 
              left: scene.position.x - 150, 
              top: scene.position.y - 150, 
              width: 2800, 
              height: 600 
            }}
          >
            {/* Scene Background with Better Visibility */}
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
            
            {/* Scene Nodes with Proper Spacing */}
            {scene.nodes.map(renderNode)}
          </div>
        ))}
        
        {/* Master Timeline Node - Special Rendering */}
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