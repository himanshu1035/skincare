"use client";

import React, { useState, useEffect } from 'react';

export const CampaignTimer: React.FC<{ endDate: string }> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = +new Date(endDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-4 md:gap-8">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds }
      ].map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-text-dark text-white rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-xl border border-white/10">
            {unit.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-3">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};
