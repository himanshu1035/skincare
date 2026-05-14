"use client";

import React from 'react';

type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export const TicketPriorityBadge = ({ priority }: { priority: string }) => {
  const getStyles = () => {
    switch (priority as TicketPriority) {
      case 'Low':
        return 'bg-blue-50 text-blue-600';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-600';
      case 'High':
        return 'bg-orange-50 text-orange-600';
      case 'Urgent':
        return 'bg-red-600 text-white animate-pulse shadow-md';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] ${getStyles()}`}>
      {priority}
    </span>
  );
};
