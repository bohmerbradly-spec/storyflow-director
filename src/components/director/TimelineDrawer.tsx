import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Settings,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineDrawerProps {
  mode: 'mini' | 'medium' | 'full';
  onModeChange: (mode: 'mini' | 'medium' | 'full') => void;
  activeMode: string;
  isZenMode: boolean;
}

export const TimelineDrawer: React.FC<TimelineDrawerProps> = ({
  mode,
  onModeChange,
  activeMode,
  isZenMode
}) => {
  const heights = {
    mini: 'h-16',
    medium: 'h-48',
    full: 'h-80'
  };

  const cycleModes = () => {
    const modes: ('mini' | 'medium' | 'full')[] = ['mini', 'medium', 'full'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onModeChange(modes[nextIndex]);
  };

  return (
    <div className={cn(
      'bg-card border-t border-border transition-all duration-300 relative',
      heights[mode]
    )}>
      {/* Timeline Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Timeline Info */}
          <div className="text-sm text-muted-foreground">
            00:00:00 / 00:00:00
          </div>

          {/* Timeline Scale */}
          <div className="text-xs text-muted-foreground">
            1:1 Scale
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeline Tools */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
          
          {/* Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={cycleModes}
            title={`Switch to ${mode === 'mini' ? 'medium' : mode === 'medium' ? 'full' : 'mini'} view`}
          >
            {mode === 'full' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      {mode !== 'mini' && (
        <div className="flex-1 overflow-hidden">
          <TimelineContent mode={mode} activeMode={activeMode} />
        </div>
      )}

      {/* Timeline Scrubber for Mini Mode */}
      {mode === 'mini' && (
        <div className="flex-1 flex items-center px-4">
          <div className="flex-1 h-2 bg-muted rounded-full relative cursor-pointer">
            <div className="absolute left-0 top-0 h-full w-0 bg-primary rounded-full transition-all duration-100" />
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-glow cursor-grab" />
          </div>
        </div>
      )}

      {/* Playhead */}
      <div className="absolute top-12 left-20 w-px h-full bg-primary shadow-glow pointer-events-none" />
    </div>
  );
};

interface TimelineContentProps {
  mode: 'medium' | 'full';
  activeMode: string;
}

const TimelineContent: React.FC<TimelineContentProps> = ({ mode, activeMode }) => {
  return (
    <div className="h-full flex">
      {/* Track Labels */}
      <div className="w-32 bg-muted/30 border-r border-border flex flex-col">
        <TrackLabel title="Video 1" color="blue" active />
        <TrackLabel title="Audio 1" color="yellow" />
        <TrackLabel title="Effects" color="green" />
        {mode === 'full' && (
          <>
            <TrackLabel title="Video 2" color="blue" />
            <TrackLabel title="Audio 2" color="yellow" />
            <TrackLabel title="Overlay" color="accent" />
          </>
        )}
      </div>

      {/* Timeline Canvas */}
      <div className="flex-1 relative overflow-x-auto overflow-y-hidden">
        {/* Time Ruler */}
        <div className="h-8 bg-muted/20 border-b border-border flex items-center text-xs text-muted-foreground">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="w-20 border-r border-border/50 px-2">
              {i}s
            </div>
          ))}
        </div>

        {/* Track Content */}
        <div className="flex-1 relative" style={{ width: '1600px' }}>
          <TimelineTrack y={0} clips={[{ start: 40, width: 200, title: 'Scene 1', color: 'blue' }]} />
          <TimelineTrack y={1} clips={[{ start: 60, width: 180, title: 'Voice Over', color: 'yellow' }]} />
          <TimelineTrack y={2} clips={[{ start: 100, width: 120, title: 'Transition', color: 'green' }]} />
          
          {mode === 'full' && (
            <>
              <TimelineTrack y={3} clips={[]} />
              <TimelineTrack y={4} clips={[]} />
              <TimelineTrack y={5} clips={[]} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface TrackLabelProps {
  title: string;
  color: string;
  active?: boolean;
}

const TrackLabel: React.FC<TrackLabelProps> = ({ title, color, active }) => {
  const colorMap: Record<string, string> = {
    blue: 'text-clapper-blue border-clapper-blue',
    yellow: 'text-clapper-yellow border-clapper-yellow',
    green: 'text-clapper-green border-clapper-green',
    accent: 'text-accent border-accent'
  };

  return (
    <div className={cn(
      'h-12 flex items-center px-3 border-b border-border text-sm font-medium transition-colors',
      'hover:bg-muted/50 cursor-pointer',
      active && 'bg-muted/30',
      colorMap[color] || 'text-foreground border-border'
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full mr-2',
        `bg-clapper-${color}` 
      )} />
      {title}
    </div>
  );
};

interface TimelineTrackProps {
  y: number;
  clips: Array<{
    start: number;
    width: number;
    title: string;
    color: string;
  }>;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({ y, clips }) => {
  return (
    <div 
      className="absolute left-0 h-12 w-full border-b border-border"
      style={{ top: y * 48 + 32 }}
    >
      {clips.map((clip, index) => (
        <div
          key={index}
          className={cn(
            'absolute h-10 mt-1 rounded border shadow-sm cursor-pointer transition-all duration-200',
            'hover:shadow-accent hover:scale-y-105',
            `bg-clapper-${clip.color}/20 border-clapper-${clip.color}/50 text-clapper-${clip.color}`
          )}
          style={{ left: clip.start, width: clip.width }}
        >
          <div className="p-2 text-xs font-medium truncate">
            {clip.title}
          </div>
        </div>
      ))}
    </div>
  );
};