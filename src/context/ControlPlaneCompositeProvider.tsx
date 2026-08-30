import React, { ReactNode } from 'react';
import { ExecutionProvider } from './ExecutionContext';
import { PoliciesProvider } from './PoliciesContext';
import { ReviewQueueProvider } from './ReviewQueueContext';
import { ControlPlaneProvider } from './ControlPlaneContext';

/**
 * Composite Provider that wraps all context providers in the correct order
 * Use this to initialize the app with all necessary contexts
 */
export const ControlPlaneCompositeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ExecutionProvider>
      <PoliciesProvider>
        <ReviewQueueProvider>
          <ControlPlaneProvider>
            {children}
          </ControlPlaneProvider>
        </ReviewQueueProvider>
      </PoliciesProvider>
    </ExecutionProvider>
  );
};

export default ControlPlaneCompositeProvider;
