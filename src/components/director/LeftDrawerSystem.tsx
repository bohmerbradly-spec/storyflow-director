import React from 'react';
import { 
  Network, 
  Zap, 
  FolderOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface LeftDrawerTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const leftTabs: LeftDrawerTab[] = [
  { id: 'nodes', label: 'Nodes', icon: <Network className="h-5 w-5" /> },
  { id: 'apis', label: 'APIs', icon: <Zap className="h-5 w-5" /> },
  { id: 'library', label: 'Library', icon: <FolderOpen className="h-5 w-5" /> }
];

interface LeftDrawerSystemProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  activeMode: string;
}

export const LeftDrawerSystem: React.FC<LeftDrawerSystemProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
  activeMode
}) => {
  return (
    <div className={cn(
      'flex transition-all duration-300',
      isOpen ? 'w-80' : 'w-16'
    )}>
      {/* Tab Bar */}
      <div className="w-16 bg-card border-r border-border flex flex-col">
        {/* Tab Buttons */}
        <div className="flex-1 flex flex-col gap-2 p-2">
          {leftTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-12 h-12 transition-all duration-200',
                activeTab === tab.id && 'shadow-glow bg-primary text-primary-foreground'
              )}
              title={tab.label}
            >
              {tab.icon}
            </Button>
          ))}
        </div>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(false)}
            className="w-12 h-12"
            title="Close Drawer"
          >
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div className="flex-1 bg-card border-r border-border overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {leftTabs.find(tab => tab.id === activeTab)?.icon}
                <h2 className="text-lg font-semibold capitalize">
                  {leftTabs.find(tab => tab.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'nodes' && <NodesContent activeMode={activeMode} />}
              {activeTab === 'apis' && <APIsContent activeMode={activeMode} />}
              {activeTab === 'library' && <LibraryContent activeMode={activeMode} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NodesContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 space-y-4">
    <div className="text-sm text-muted-foreground mb-4">
      Drag and drop nodes to build your cinematic workflow
    </div>
    
    {/* Node Categories */}
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-primary mb-3">Characters & Assets</h3>
        <div className="grid grid-cols-2 gap-2">
          <NodeCard title="Character" type="character" icon="👤" />
          <NodeCard title="Background" type="background" icon="🏙️" />
          <NodeCard title="Props" type="prop" icon="⚔️" />
          <NodeCard title="Wardrobe" type="wardrobe" icon="👔" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-accent mb-3">Production</h3>
        <div className="grid grid-cols-2 gap-2">
          <NodeCard title="Script" type="script" icon="📝" />
          <NodeCard title="Camera" type="camera" icon="📷" />
          <NodeCard title="Lighting" type="lighting" icon="💡" />
          <NodeCard title="Style" type="style" icon="🎨" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-secondary mb-3">Media Generation</h3>
        <div className="grid grid-cols-2 gap-2">
          <NodeCard title="Image" type="image" icon="🖼️" />
          <NodeCard title="Video" type="video" icon="🎬" />
          <NodeCard title="Audio" type="audio" icon="🎵" />
          <NodeCard title="Voice" type="voiceover" icon="🎙️" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-emerald-400 mb-3">Environment</h3>
        <div className="grid grid-cols-2 gap-2">
          <NodeCard title="Location" type="location" icon="📍" />
          <NodeCard title="Weather" type="weather" icon="☀️" />
          <NodeCard title="SFX" type="sfx" icon="🔊" />
          <NodeCard title="Music" type="music" icon="🎼" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-orange-400 mb-3">Output</h3>
        <div className="grid grid-cols-2 gap-2">
          <NodeCard title="Scene" type="finalcut" icon="🎞️" />
          <NodeCard title="Timeline" type="timeline" icon="🎬" />
        </div>
      </div>
    </div>
  </div>
);

const APIsContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 space-y-4">
    <div className="text-sm text-muted-foreground mb-4">
      Configure AI models and APIs for {activeMode} processing
    </div>
    
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-primary mb-2">Model Selection</h3>
        <p className="text-sm text-muted-foreground">Choose your AI model</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-accent mb-2">Parameters</h3>
        <p className="text-sm text-muted-foreground">Fine-tune generation settings</p>
      </div>
    </div>
  </div>
);

const LibraryContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 space-y-4">
    <div className="text-sm text-muted-foreground mb-4">
      Access your character and asset library
    </div>
    
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-primary mb-2">Characters</h3>
        <p className="text-sm text-muted-foreground">Persistent character profiles</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-accent mb-2">Objects</h3>
        <p className="text-sm text-muted-foreground">Props and environment assets</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-secondary mb-2">Styles</h3>
        <p className="text-sm text-muted-foreground">Visual style references</p>
      </div>
    </div>
  </div>
);

const NodeCard: React.FC<{ title: string; type: string; icon: string }> = ({ title, type, icon }) => (
  <div className={cn(
    'p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer',
    'hover:shadow-accent hover:border-accent/50 hover:scale-105 transform transition-transform'
  )}>
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="text-sm font-medium">{title}</div>
    </div>
  </div>
);