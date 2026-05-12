import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Top Progress Bar */}
      <div className="h-[3px] w-full bg-secondary-ivory/30 overflow-hidden">
        <div className="h-full bg-accent-gold w-1/3 animate-loading-bar shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
      </div>

      {/* Subtle Full Page Overlay for 'Shadow' effect */}
      <div className="fixed inset-0 bg-white/20 backdrop-blur-[2px] animate-pulse pointer-events-none" />
      
      {/* Skeleton Structure */}
      <div className="container pt-40 space-y-12 animate-pulse">
        <div className="h-12 bg-secondary-ivory rounded-3xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-secondary-ivory rounded-[3rem]" />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
