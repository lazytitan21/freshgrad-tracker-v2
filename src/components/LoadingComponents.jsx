import React from 'react';
import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${sizes[size]} border-white/30 border-t-white rounded-full animate-spin ${className}`}
      style={{ animationDuration: '0.8s' }}
    />
  );
}

export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '', 
  loadingText = 'Saving...',
  onClick,
  type = 'button',
  ...props 
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 transition-all duration-200 ${className} ${
        loading ? 'cursor-wait' : ''
      }`}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function LoadingOverlay({ message = 'Saving...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{message}</span>
      </div>
    </motion.div>
  );
}

export function SuccessAnimation({ onComplete }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onAnimationComplete={onComplete}
      className="flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.2, 1] }}
        transition={{ duration: 0.4, times: [0, 0.6, 1] }}
        className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
