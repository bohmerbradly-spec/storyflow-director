import React from 'react';
import { 
  Clapperboard, 
  Image, 
  Volume2, 
  Video, 
  Circle,
  Upload,
  Save,
  User,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClapperMode {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  isActive?: boolean;
}

const clapperSections: ClapperMode[] = [
  {
    id: 'director',
    label: 'Director Logo / Zen Mode',
    icon: <Clapperboard className="h-5 w-5" />,
    color: 'clapper-black'
  },
  {
    id: 'image',
    label: 'Image Editing Mode',
    icon: <Image className="h-5 w-5" />,
    color: 'clapper-green'
  },
  {
    id: 'audio',
    label: 'Audio Editing Mode', 
    icon: <Volume2 className="h-5 w-5" />,
    color: 'clapper-yellow'
  },
  {
    id: 'video',
    label: 'Video Editing Mode',
    icon: <Video className="h-5 w-5" />,
    color: 'clapper-blue'
  },
  {
    id: 'record',
    label: 'Record Mode',
    icon: <Circle className="h-5 w-5" />,
    color: 'clapper-red'
  },
  {
    id: 'export',
    label: 'Export & Publishing',
    icon: <Upload className="h-5 w-5" />,
    color: 'clapper-white'
  },
  {
    id: 'save',
    label: 'Save Project',
    icon: <Save className="h-5 w-5" />,
    color: 'clapper-light-grey'
  },
  {
    id: 'profile',
    label: 'Profile & Sign In',
    icon: <User className="h-5 w-5" />,
    color: 'clapper-grey'
  },
  {
    id: 'more',
    label: 'More Options',
    icon: <MoreHorizontal className="h-5 w-5" />,
    color: 'clapper-dark-grey'
  }
];

interface DirectorClapperProps {
  activeMode?: string;
  onModeChange?: (mode: string) => void;
  isZenMode?: boolean;
}

export const DirectorClapper: React.FC<DirectorClapperProps> = ({
  activeMode = 'video',
  onModeChange,
  isZenMode = false
}) => {
  const handleSectionClick = (sectionId: string) => {
    onModeChange?.(sectionId);
  };

  if (isZenMode) {
    return (
      <div className="h-12 bg-background border-b border-border flex items-center justify-center">
        <button
          onClick={() => handleSectionClick('director')}
          className="p-2 text-primary hover:text-primary-glow transition-colors"
          title="Exit Zen Mode"
        >
          <Clapperboard className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-16 bg-gradient-cinematic border-b border-border relative overflow-hidden">
      {/* Clapper Board Design */}
      <div className="flex h-full">
        {clapperSections.map((section, index) => {
          const isActive = activeMode === section.id;
          const isRecording = section.id === 'record' && isActive;
          
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={cn(
                'relative flex-1 flex items-center justify-center transition-all duration-300 group',
                'transform skew-x-3 first:skew-x-0 last:skew-x-0',
                'hover:scale-105 hover:z-10',
                isActive && 'z-20 scale-110',
                isRecording && 'animate-pulse-glow'
              )}
              style={{
                backgroundColor: `hsl(var(--${section.color}))`,
                color: section.color.includes('white') || section.color.includes('light-grey') 
                  ? 'hsl(var(--clapper-black))' 
                  : 'hsl(var(--clapper-white))'
              }}
              title={section.label}
            >
              {/* Angled clapper effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Icon */}
              <div className={cn(
                'relative z-10 transform -skew-x-3 first:skew-x-0 last:skew-x-0',
                isActive && 'drop-shadow-glow',
                isRecording && 'text-white animate-pulse'
              )}>
                {section.icon}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-glow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Cinematic glow effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
    </div>
  );
};