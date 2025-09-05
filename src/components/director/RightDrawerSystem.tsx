import React from 'react';
import { 
  MessageSquare, 
  Map, 
  Clock, 
  User,
  Key,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface RightDrawerTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const rightTabs: RightDrawerTab[] = [
  { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'context', label: 'Context', icon: <Map className="h-5 w-5" /> },
  { id: 'memories', label: 'Memories', icon: <Clock className="h-5 w-5" /> },
  { id: 'account', label: 'Account', icon: <User className="h-5 w-5" /> },
  { id: 'keys', label: 'API Keys', icon: <Key className="h-5 w-5" /> }
];

interface RightDrawerSystemProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  activeMode: string;
}

export const RightDrawerSystem: React.FC<RightDrawerSystemProps> = ({
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
      {/* Drawer Content */}
      {isOpen && (
        <div className="flex-1 bg-card border-l border-border overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {rightTabs.find(tab => tab.id === activeTab)?.icon}
                <h2 className="text-lg font-semibold">
                  {rightTabs.find(tab => tab.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'chat' && <ChatContent activeMode={activeMode} />}
              {activeTab === 'context' && <ContextContent activeMode={activeMode} />}
              {activeTab === 'memories' && <MemoriesContent activeMode={activeMode} />}
              {activeTab === 'account' && <AccountContent activeMode={activeMode} />}
              {activeTab === 'keys' && <APIKeysContent activeMode={activeMode} />}
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="w-16 bg-card border-l border-border flex flex-col">
        {/* Tab Buttons */}
        <div className="flex-1 flex flex-col gap-2 p-2">
          {rightTabs.map((tab) => (
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
            {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChatContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 h-full flex flex-col">
    <div className="text-sm text-muted-foreground mb-4">
      AI Assistant for {activeMode} editing
    </div>
    
    {/* Chat Interface */}
    <div className="flex-1 bg-muted/20 rounded-lg p-4 mb-4 overflow-auto">
      <div className="space-y-4">
        <div className="text-sm">
          <div className="text-accent font-medium mb-1">Director AI</div>
          <div className="text-muted-foreground">
            Welcome to Director! I'm here to help you create amazing {activeMode} content. 
            What would you like to work on today?
          </div>
        </div>
      </div>
    </div>
    
    {/* Input */}
    <div className="border border-border rounded-lg p-3">
      <input 
        type="text" 
        placeholder="Ask me anything about your project..."
        className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none"
      />
    </div>
  </div>
);

const ContextContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 space-y-4">
    <div className="text-sm text-muted-foreground mb-4">
      Current project context and navigation
    </div>
    
    <div className="space-y-3">
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-primary mb-1">Active Mode</h3>
        <p className="text-sm text-muted-foreground capitalize">{activeMode} Editing</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-accent mb-1">Project Status</h3>
        <p className="text-sm text-muted-foreground">New Project</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-secondary mb-1">Timeline</h3>
        <p className="text-sm text-muted-foreground">00:00 / 00:00</p>
      </div>
    </div>
  </div>
);

const MemoriesContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 space-y-4">
    <div className="text-sm text-muted-foreground mb-4">
      History and asset memory
    </div>
    
    <div className="text-sm text-muted-foreground text-center py-8">
      No memories recorded yet. Start creating to build your project history.
    </div>
  </div>
);

const AccountContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 space-y-4">
    <div className="text-sm text-muted-foreground mb-4">
      Account settings and usage statistics
    </div>
    
    <div className="space-y-3">
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-primary mb-1">Usage</h3>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
        </div>
        <p className="text-xs text-muted-foreground">25% of monthly quota used</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-accent mb-1">Status</h3>
        <p className="text-sm text-muted-foreground">Free Plan</p>
      </div>
    </div>
  </div>
);

const APIKeysContent: React.FC<{ activeMode: string }> = ({ activeMode }) => (
  <div className="p-4 space-y-4">
    <div className="text-sm text-muted-foreground mb-4">
      Manage your AI model API connections
    </div>
    
    <div className="space-y-3">
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-primary mb-1">OpenAI</h3>
        <p className="text-sm text-muted-foreground">Not connected</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-accent mb-1">Replicate</h3>
        <p className="text-sm text-muted-foreground">Not connected</p>
      </div>
      
      <div className="p-3 rounded-lg border border-border bg-muted/30">
        <h3 className="font-medium text-secondary mb-1">Runway ML</h3>
        <p className="text-sm text-muted-foreground">Not connected</p>
      </div>
    </div>
  </div>
);