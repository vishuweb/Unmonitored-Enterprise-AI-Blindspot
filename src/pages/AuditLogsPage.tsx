import React from 'react';
import { FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { AuditTable } from '../components/audit/AuditTable';

export const AuditLogsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <AuditTable />
    </div>
  );
};
