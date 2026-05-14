"use client";

import React from 'react';

type TicketStatus = 'Open' | 'Pending' | 'Processing' | 'Resolved' | 'Declined' | 'Closed' | 'Escalated';

export const TicketStatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status as TicketStatus) {
      case 'Open':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Pending':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Processing':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Resolved':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'Declined':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'Escalated':
        return 'bg-red-100 text-red-700 border-red-300 animate-pulse';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStyles()}`}>
      {status}
    </span>
  );
};
