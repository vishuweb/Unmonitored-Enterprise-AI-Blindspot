import React from 'react';
import { UserCheck, ShieldAlert } from 'lucide-react';
import { ReviewQueueTable } from '../components/review/ReviewQueueTable';

export const ReviewQueuePage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <ReviewQueueTable />
    </div>
  );
};
