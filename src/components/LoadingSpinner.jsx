import React from 'react';

export function LoadingSpinner({ size = 'md', fullScreen = false, message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
        style={{ borderTopWidth: '3px' }}
      />
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function LoadingOverlay({ show, message }) {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}
