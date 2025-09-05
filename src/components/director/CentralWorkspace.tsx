import React from 'react';
import { VirtuCastWorkspace } from './VirtuCastWorkspace';

interface CentralWorkspaceProps {
  activeMode: string;
  isZenMode: boolean;
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
}

export const CentralWorkspace: React.FC<CentralWorkspaceProps> = (props) => {
  return <VirtuCastWorkspace {...props} />;
};