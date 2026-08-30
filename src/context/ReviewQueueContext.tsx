import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ReviewQueueItem } from '../types';
import { INITIAL_REVIEW_ITEMS } from './seedData';
import { apiService } from '../services/api';

interface ReviewQueueContextType {
  reviewQueue: ReviewQueueItem[];
  approveReviewItem: (itemId: string, notes?: string) => Promise<void>;
  rejectReviewItem: (itemId: string, notes?: string) => Promise<void>;
  editReviewItem: (itemId: string, editedRemediation: string, notes?: string) => Promise<void>;
  approveAllLowRisk: () => Promise<void>;
  pendingCount: number;
}

const ReviewQueueContext = createContext<ReviewQueueContextType | undefined>(undefined);

export const ReviewQueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>(() => {
    const saved = localStorage.getItem('controlplane_review_queue_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_REVIEW_ITEMS;
  });

  // Sync to localStorage whenever review queue changes
  useEffect(() => {
    localStorage.setItem('controlplane_review_queue_v2', JSON.stringify(reviewQueue));
  }, [reviewQueue]);

  // Memoized pending count to avoid re-renders
  const pendingCount = useMemo(() => {
    return reviewQueue.filter(item => item.status === 'PENDING').length;
  }, [reviewQueue]);

  const approveReviewItem = async (itemId: string, notes?: string): Promise<void> => {
    const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
    setReviewQueue(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              status: 'APPROVED' as const,
              reviewer: 'safety-operator@controlplane.ai',
              reviewTimestamp: timestamp,
              reviewNotes: notes || 'Approved by safety operator.',
            }
          : item
      )
    );

    try {
      await apiService.actionReview(itemId, 'APPROVE', undefined, notes);
    } catch (err) {
      // Silently fail - data is already updated in state and localStorage
      console.log('Offline mode: Review action saved locally');
    }
  };

  const rejectReviewItem = async (itemId: string, notes?: string): Promise<void> => {
    const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
    setReviewQueue(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              status: 'REJECTED' as const,
              reviewer: 'safety-operator@controlplane.ai',
              reviewTimestamp: timestamp,
              reviewNotes: notes || 'Rejected and permanently dropped.',
            }
          : item
      )
    );

    try {
      await apiService.actionReview(itemId, 'REJECT', undefined, notes);
    } catch (err) {
      console.log('Offline mode: Review action saved locally');
    }
  };

  const editReviewItem = async (itemId: string, editedRemediation: string, notes?: string): Promise<void> => {
    const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';
    setReviewQueue(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              remediatedOutput: editedRemediation,
              status: 'EDITED' as const,
              reviewer: 'safety-operator@controlplane.ai',
              reviewTimestamp: timestamp,
              reviewNotes: notes || 'Edited and safely released.',
            }
          : item
      )
    );

    try {
      await apiService.actionReview(itemId, 'EDIT', editedRemediation, notes);
    } catch (err) {
      console.log('Offline mode: Review action saved locally');
    }
  };

  const approveAllLowRisk = async (): Promise<void> => {
    const lowRiskItems = reviewQueue.filter(
      item => item.status === 'PENDING' && item.riskScore < 30
    );

    const timestamp = new Date().toISOString().substring(0, 19) + ' UTC';

    setReviewQueue(prev =>
      prev.map(item => {
        if (lowRiskItems.find(lr => lr.id === item.id)) {
          return {
            ...item,
            status: 'APPROVED' as const,
            reviewer: 'safety-operator@controlplane.ai',
            reviewTimestamp: timestamp,
            reviewNotes: 'Auto-approved (low risk)',
          };
        }
        return item;
      })
    );

    try {
      for (const item of lowRiskItems) {
        await apiService.actionReview(item.id, 'APPROVE', undefined, 'Auto-approved (low risk)');
      }
    } catch (err) {
      console.log('Offline mode: Batch approval saved locally');
    }
  };

  const value: ReviewQueueContextType = {
    reviewQueue,
    approveReviewItem,
    rejectReviewItem,
    editReviewItem,
    approveAllLowRisk,
    pendingCount,
  };

  return (
    <ReviewQueueContext.Provider value={value}>
      {children}
    </ReviewQueueContext.Provider>
  );
};

export const useReviewQueue = (): ReviewQueueContextType => {
  const context = useContext(ReviewQueueContext);
  if (!context) {
    throw new Error('useReviewQueue must be used within ReviewQueueProvider');
  }
  return context;
};
