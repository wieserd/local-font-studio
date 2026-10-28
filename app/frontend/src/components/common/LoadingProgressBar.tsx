import React from 'react';

export interface LoadingProgressBarProps {
  progress: number; // 0 to 100
  title?: string;
  subtitle?: string;
  isModal?: boolean;
}

export const LoadingProgressBar: React.FC<LoadingProgressBarProps> = ({
  progress,
  title = 'Processing...',
  subtitle = 'Please wait while calculations complete',
  isModal = false,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      <div 
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center border"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(79, 70, 229, 0.08))',
          borderColor: 'rgba(99, 102, 241, 0.35)',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.22)'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#6366f1">
          <path d="M12 2L2 22h4.5l2-4.5h7l2 4.5H22L12 2zm0 6.5l2.25 5h-4.5L12 8.5z" />
        </svg>
      </div>

      <div className="text-[15px] font-semibold text-slate-100 tracking-tight mb-1">
        {title}
      </div>
      <div className="text-xs text-slate-400 mb-5">
        {subtitle}
      </div>

      <div 
        className="w-64 h-1.5 rounded-full overflow-hidden relative"
        style={{
          backgroundColor: '#1f2536',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div 
          className="h-full rounded-full transition-all duration-150 ease-out"
          style={{
            width: `${clampedProgress}%`,
            background: 'linear-gradient(90deg, #4f46e5, #6366f1, #38bdf8)',
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)'
          }}
        />
      </div>

      <div className="w-64 flex justify-between items-center mt-2.5 text-xs text-slate-400 font-mono">
        <span className="text-[10px] tracking-wider uppercase text-slate-500 font-sans font-medium">Progress</span>
        <span className="font-semibold text-indigo-300 font-mono">{clampedProgress}%</span>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="rounded-2xl border p-2 max-w-sm w-full mx-4"
        style={{
          backgroundColor: '#0e1117',
          borderColor: '#262e40',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
        }}
      >
        {content}
      </div>
    </div>
  );
};
