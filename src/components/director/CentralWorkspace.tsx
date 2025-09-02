import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CentralWorkspaceProps {
  activeMode: string;
  isZenMode: boolean;
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
}

export const CentralWorkspace: React.FC<CentralWorkspaceProps> = ({
  activeMode,
  isZenMode,
  leftDrawerOpen,
  rightDrawerOpen
}) => {
  return (
    <div className={cn(
      'flex-1 bg-background relative overflow-hidden',
      'transition-all duration-300'
    )}>
      {/* Node Graph Canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/5 to-background">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Central Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8">
          {/* Welcome State */}
          <div className="text-center space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome to Director
              </h1>
              <p className="text-xl text-muted-foreground">
                Revolutionary AI-Powered Video Editing System
              </p>
            </div>
            
            <div className="flex items-center gap-4 justify-center">
              <div className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium capitalize',
                'bg-primary/20 text-primary border border-primary/30'
              )}>
                {activeMode} Mode Active
              </div>
              
              {isZenMode && (
                <div className="px-4 py-2 rounded-lg text-sm font-medium bg-accent/20 text-accent border border-accent/30">
                  Zen Mode
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button className="gap-2 shadow-glow">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
              
              <Button variant="outline" className="gap-2">
                Import Media
              </Button>
              
              <Button variant="outline" className="gap-2">
                Load Template
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
              <FeatureCard
                title="AI-Powered Generation"
                description="Generate images, videos, and audio with cutting-edge AI models"
                color="primary"
              />
              <FeatureCard
                title="Character Consistency"
                description="Maintain character continuity across all your content"
                color="accent"
              />
              <FeatureCard
                title="Real-time Collaboration"
                description="Work with your team in real-time with AI assistance"
                color="secondary"
              />
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-cinematic">
            <Button variant="ghost" size="icon" className="rounded-full">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 pointer-events-none" />
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  color: 'primary' | 'accent' | 'secondary';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, color }) => {
  const colorClasses = {
    primary: 'border-primary/30 bg-primary/5 text-primary',
    accent: 'border-accent/30 bg-accent/5 text-accent',
    secondary: 'border-secondary/30 bg-secondary/5 text-secondary'
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border transition-all duration-200 hover:shadow-accent',
      colorClasses[color]
    )}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};