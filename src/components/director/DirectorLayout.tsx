import React, { useState } from 'react';
import { DirectorClapper } from './DirectorClapper';
import { LeftDrawerSystem } from './LeftDrawerSystem';
import { RightDrawerSystem } from './RightDrawerSystem';
import { CentralWorkspace } from './CentralWorkspace';
import { TimelineDrawer } from './TimelineDrawer';
import { cn } from '@/lib/utils';

export interface DirectorLayoutProps {
  className?: string;
}

export const DirectorLayout: React.FC<DirectorLayoutProps> = ({ className }) => {
  const [activeMode, setActiveMode] = useState('video');
  const [isZenMode, setIsZenMode] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [leftDrawerTab, setLeftDrawerTab] = useState('nodes');
  const [rightDrawerTab, setRightDrawerTab] = useState('chat');
  const [timelineMode, setTimelineMode] = useState<'mini' | 'medium' | 'full'>('medium');

  const handleModeChange = (mode: string) => {
    if (mode === 'director') {
      setIsZenMode(!isZenMode);
    } else {
      setActiveMode(mode);
      if (isZenMode) setIsZenMode(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      {/* Director Clapper Topbar */}
      <DirectorClapper
        activeMode={activeMode}
        onModeChange={handleModeChange}
        isZenMode={isZenMode}
      />

      {/* Main Layout Container */}
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Left Drawer System */}
        {(!isZenMode || leftDrawerOpen) && (
          <LeftDrawerSystem
            activeTab={leftDrawerTab}
            onTabChange={setLeftDrawerTab}
            isOpen={leftDrawerOpen}
            onToggle={setLeftDrawerOpen}
            activeMode={activeMode}
          />
        )}

        {/* Central Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <CentralWorkspace
            activeMode={activeMode}
            isZenMode={isZenMode}
            leftDrawerOpen={leftDrawerOpen && !isZenMode}
            rightDrawerOpen={rightDrawerOpen && !isZenMode}
          />

          {/* Timeline Drawer */}
          {(!isZenMode || timelineMode !== 'mini') && (
            <TimelineDrawer
              mode={timelineMode}
              onModeChange={setTimelineMode}
              activeMode={activeMode}
              isZenMode={isZenMode}
            />
          )}
        </div>

        {/* Right Drawer System */}
        {(!isZenMode || rightDrawerOpen) && (
          <RightDrawerSystem
            activeTab={rightDrawerTab}
            onTabChange={setRightDrawerTab}
            isOpen={rightDrawerOpen}
            onToggle={setRightDrawerOpen}
            activeMode={activeMode}
          />
        )}
      </div>

      {/* Cinematic Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 z-0" />
    </div>
  );
};