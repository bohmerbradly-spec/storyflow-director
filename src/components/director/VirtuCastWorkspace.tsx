import React, { useState, useRef, useCallback } from 'react';
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
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Node {
  id: string;
  type: 'image' | 'character' | 'background' | 'prop' | 'video' | 'audio' | 'finalcut';
  title: string;
  description: string;
  x: number;
  y: number;
  connections: string[];
  status: 'idle' | 'processing' | 'complete' | 'error';
  thumbnail?: string;
  metadata?: any;
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

const nodeTypes = {
  image: { icon: Image, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/50' },
  character: { icon: User, color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/50' },
  background: { icon: Mountain, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/50' },
  prop: { icon: Package, color: 'text-orange-400', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/50' },
  video: { icon: Video, color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/50' },
  audio: { icon: Volume2, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/50' },
  finalcut: { icon: Film, color: 'text-pink-400', bgColor: 'bg-pink-400/10', borderColor: 'border-pink-400/50' }
};

const initialNodes: Node[] = [
  // Character Nodes
  { id: 'char1', type: 'character', title: 'Alira Chen', description: 'Asian Executive, 28, Professional', x: 100, y: 100, connections: ['img1', 'img4'], status: 'complete' },
  { id: 'char2', type: 'character', title: 'Marcus Storm', description: 'Cyberpunk Detective, 35, Gruff', x: 100, y: 250, connections: ['img2'], status: 'complete' },
  { id: 'char3', type: 'character', title: 'Luna Voss', description: 'Space Pilot, 26, Confident', x: 100, y: 400, connections: ['img8'], status: 'processing' },
  
  // Background Nodes
  { id: 'bg1', type: 'background', title: 'Neo-Tokyo Streets', description: 'Neon-lit cyberpunk cityscape', x: 300, y: 80, connections: ['img2', 'img3'], status: 'complete' },
  { id: 'bg2', type: 'background', title: 'Corporate Boardroom', description: 'Modern glass office, sunset view', x: 300, y: 200, connections: ['img1'], status: 'complete' },
  { id: 'bg3', type: 'background', title: 'Spaceship Bridge', description: 'Futuristic command center', x: 300, y: 320, connections: ['img8'], status: 'complete' },
  { id: 'bg4', type: 'background', title: 'Abandoned Warehouse', description: 'Industrial, dramatic lighting', x: 300, y: 440, connections: ['img7'], status: 'idle' },
  
  // Prop Nodes
  { id: 'prop1', type: 'prop', title: 'Katana Blade', description: 'Traditional Japanese sword', x: 500, y: 120, connections: ['img2', 'img3'], status: 'complete' },
  { id: 'prop2', type: 'prop', title: 'Holographic UI', description: 'Floating interface panels', x: 500, y: 240, connections: ['img8'], status: 'complete' },
  { id: 'prop3', type: 'prop', title: 'Luxury Briefcase', description: 'Leather, executive style', x: 500, y: 360, connections: ['img1'], status: 'complete' },
  { id: 'prop4', type: 'prop', title: 'Cyberpunk Vehicle', description: 'Flying car, neon underglow', x: 500, y: 480, connections: ['img7'], status: 'processing' },
  
  // Image Generation Nodes
  { id: 'img1', type: 'image', title: 'Executive Portrait', description: 'Alira in boardroom setting', x: 700, y: 150, connections: ['vid1'], status: 'complete' },
  { id: 'img2', type: 'image', title: 'Detective Scene', description: 'Marcus with katana in Neo-Tokyo', x: 700, y: 270, connections: ['vid2'], status: 'complete' },
  { id: 'img3', type: 'image', title: 'Action Sequence', description: 'Combat scene with sword', x: 700, y: 390, connections: ['vid3'], status: 'processing' },
  { id: 'img4', type: 'image', title: 'Character Study', description: 'Alira emotional range', x: 700, y: 50, connections: ['vid1'], status: 'complete' },
  { id: 'img5', type: 'image', title: 'Establishing Shot', description: 'Wide city panorama', x: 700, y: 510, connections: ['vid4'], status: 'idle' },
  { id: 'img6', type: 'image', title: 'Close-up Drama', description: 'Intense character moment', x: 900, y: 100, connections: ['vid5'], status: 'complete' },
  { id: 'img7', type: 'image', title: 'Vehicle Chase', description: 'Car action in warehouse', x: 900, y: 220, connections: ['vid6'], status: 'processing' },
  { id: 'img8', type: 'image', title: 'Sci-Fi Command', description: 'Luna on bridge with UI', x: 900, y: 340, connections: ['vid7'], status: 'complete' },
  
  // Video Generation Nodes
  { id: 'vid1', type: 'video', title: 'Corporate Presentation', description: 'Alira speaking to camera', x: 1100, y: 100, connections: ['aud1', 'final1'], status: 'complete' },
  { id: 'vid2', type: 'video', title: 'Detective Intro', description: 'Marcus walking through rain', x: 1100, y: 200, connections: ['aud2', 'final2'], status: 'complete' },
  { id: 'vid3', type: 'video', title: 'Sword Fight', description: 'Dynamic combat sequence', x: 1100, y: 300, connections: ['aud3', 'final2'], status: 'processing' },
  { id: 'vid4', type: 'video', title: 'City Flyover', description: 'Drone shot of skyline', x: 1100, y: 400, connections: ['aud4', 'final3'], status: 'idle' },
  { id: 'vid5', type: 'video', title: 'Emotional Beat', description: 'Character realization moment', x: 1300, y: 150, connections: ['aud5', 'final1'], status: 'complete' },
  { id: 'vid6', type: 'video', title: 'Chase Sequence', description: 'High-speed pursuit', x: 1300, y: 250, connections: ['aud6', 'final3'], status: 'processing' },
  { id: 'vid7', type: 'video', title: 'Space Opera', description: 'Luna commanding bridge', x: 1300, y: 350, connections: ['aud7', 'final4'], status: 'complete' },
  
  // Audio Nodes
  { id: 'aud1', type: 'audio', title: 'Executive Voice', description: 'Professional presentation tone', x: 1500, y: 80, connections: ['final1'], status: 'complete' },
  { id: 'aud2', type: 'audio', title: 'Noir Monologue', description: 'Detective internal voice', x: 1500, y: 160, connections: ['final2'], status: 'complete' },
  { id: 'aud3', type: 'audio', title: 'Combat SFX', description: 'Sword clashing, impacts', x: 1500, y: 240, connections: ['final2'], status: 'processing' },
  { id: 'aud4', type: 'audio', title: 'City Ambience', description: 'Urban soundscape', x: 1500, y: 320, connections: ['final3'], status: 'idle' },
  { id: 'aud5', type: 'audio', title: 'Emotional Score', description: 'Orchestral drama', x: 1500, y: 400, connections: ['final1'], status: 'complete' },
  { id: 'aud6', type: 'audio', title: 'Chase Music', description: 'High-energy electronic', x: 1500, y: 480, connections: ['final3'], status: 'processing' },
  { id: 'aud7', type: 'audio', title: 'Sci-Fi Atmosphere', description: 'Space ambient + tech sounds', x: 1700, y: 300, connections: ['final4'], status: 'complete' },
  
  // Final Cut Nodes
  { id: 'final1', type: 'finalcut', title: 'Scene 1: Boardroom', description: 'Executive presentation sequence', x: 1900, y: 150, connections: [], status: 'complete' },
  { id: 'final2', type: 'finalcut', title: 'Scene 2: Street Fight', description: 'Detective action sequence', x: 1900, y: 270, connections: [], status: 'complete' },
  { id: 'final3', type: 'finalcut', title: 'Scene 3: Chase', description: 'High-speed pursuit', x: 1900, y: 390, connections: [], status: 'processing' },
  { id: 'final4', type: 'finalcut', title: 'Scene 4: Bridge', description: 'Space command sequence', x: 1900, y: 510, connections: [], status: 'complete' }
];

const timelineScenes = [
  { id: 'final1', title: 'Boardroom', duration: 45, color: 'bg-purple-500' },
  { id: 'final2', title: 'Street Fight', duration: 120, color: 'bg-red-500' },
  { id: 'final3', title: 'Chase', duration: 90, color: 'bg-orange-500' },
  { id: 'final4', title: 'Bridge', duration: 60, color: 'bg-blue-500' }
];

export const VirtuCastWorkspace: React.FC<VirtuCastWorkspaceProps> = ({
  activeMode,
  isZenMode,
  leftDrawerOpen,
  rightDrawerOpen
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    setSelectedNode(nodeId);
  }, [nodes]);

  const renderNode = (node: Node) => {
    const nodeType = nodeTypes[node.type];
    const Icon = nodeType.icon;
    const isSelected = selectedNode === node.id;
    
    return (
      <div
        key={node.id}
        className={cn(
          'absolute w-64 bg-card border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl',
          nodeType.borderColor,
          nodeType.bgColor,
          isSelected && 'ring-2 ring-primary shadow-2xl scale-105',
          node.status === 'processing' && 'animate-pulse',
          node.status === 'error' && 'border-red-400 bg-red-400/10'
        )}
        style={{ left: node.x, top: node.y }}
        onClick={() => handleNodeClick(node.id)}
        onMouseDown={(e) => handleNodeDragStart(e, node.id)}
      >
        {/* Node Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', nodeType.bgColor)}>
            <Icon className={cn('h-5 w-5', nodeType.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-foreground">{node.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{node.description}</p>
          </div>
          <div className={cn(
            'w-2 h-2 rounded-full',
            node.status === 'complete' && 'bg-green-400',
            node.status === 'processing' && 'bg-yellow-400 animate-pulse',
            node.status === 'idle' && 'bg-gray-400',
            node.status === 'error' && 'bg-red-400'
          )} />
        </div>

        {/* Node Preview */}
        <div className="mb-3">
          <div className={cn(
            'w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center',
            nodeType.borderColor
          )}>
            {node.status === 'complete' ? (
              <div className="text-center">
                <Sparkles className={cn('h-6 w-6 mx-auto mb-1', nodeType.color)} />
                <span className="text-xs text-muted-foreground">Generated</span>
              </div>
            ) : node.status === 'processing' ? (
              <div className="text-center">
                <Zap className={cn('h-6 w-6 mx-auto mb-1 animate-pulse', nodeType.color)} />
                <span className="text-xs text-muted-foreground">Processing...</span>
              </div>
            ) : (
              <div className="text-center">
                <Wand2 className={cn('h-6 w-6 mx-auto mb-1', nodeType.color)} />
                <span className="text-xs text-muted-foreground">Ready</span>
              </div>
            )}
          </div>
        </div>

        {/* Node Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="flex-1 text-xs">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 text-xs">
            <Play className="h-3 w-3 mr-1" />
            Run
          </Button>
        </div>

        {/* Connection Points */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background" />
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-secondary rounded-full border-2 border-background" />
      </div>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (!targetNode) return;
        
        const startX = node.x + 264; // Node width + connection point
        const startY = node.y + 80; // Roughly center of node
        const endX = targetNode.x;
        const endY = targetNode.y + 80;
        
        const midX = startX + (endX - startX) / 2;
        
        connections.push(
          <svg
            key={`${node.id}-${targetId}`}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <path
              d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        );
      });
    });
    
    return connections;
  };

  const renderFilmTimeline = () => {
    let totalDuration = 0;
    
    return (
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-card border-2 border-primary rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-4 mb-3">
          <Film className="h-6 w-6 text-primary" />
          <h3 className="font-bold text-lg">VirtuCast Timeline</h3>
          <div className="text-sm text-muted-foreground">Total: {timelineScenes.reduce((sum, scene) => sum + scene.duration, 0)}s</div>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
          {/* Film sprocket holes */}
          <div className="flex flex-col gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-muted rounded-sm" />
            ))}
          </div>
          
          {/* Timeline scenes */}
          <div className="flex gap-1 flex-1">
            {timelineScenes.map((scene, index) => {
              totalDuration += scene.duration;
              return (
                <div
                  key={scene.id}
                  className={cn(
                    'h-12 rounded flex items-center justify-center text-white text-xs font-medium transition-all duration-200 hover:scale-105 cursor-pointer',
                    scene.color
                  )}
                  style={{ width: `${scene.duration * 2}px` }}
                  title={`${scene.title} - ${scene.duration}s`}
                >
                  <span className="truncate px-2">{scene.title}</span>
                </div>
              );
            })}
          </div>
          
          {/* Film sprocket holes */}
          <div className="flex flex-col gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-muted rounded-sm" />
            ))}
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-3">
          <Button size="sm" variant="outline">
            <Play className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-full overflow-auto"
        style={{ minWidth: '2500px', minHeight: '800px' }}
      >
        {/* Render connections first (behind nodes) */}
        {renderConnections()}
        
        {/* Render all nodes */}
        {nodes.map(renderNode)}
        
        {/* Floating Action Bar */}
        <div className="fixed top-20 right-4 bg-card border border-primary rounded-xl p-2 shadow-xl">
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" title="Add Character">
              <User className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" title="Add Background">
              <Mountain className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" title="Add Prop">
              <Package className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" title="Add Image">
              <Image className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" title="Add Video">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" title="Add Audio">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Film Timeline */}
      {renderFilmTimeline()}
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/20" />
      </div>
    </div>
  );
};