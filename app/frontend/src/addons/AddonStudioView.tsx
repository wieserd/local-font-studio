import React from 'react';
import { AddonManagerContent } from './AddonManagerContent';

export const AddonStudioView: React.FC = () => {
  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      <AddonManagerContent isModal={false} />
    </div>
  );
};
