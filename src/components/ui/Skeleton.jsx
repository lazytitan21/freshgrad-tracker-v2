import React from 'react';
import { motion } from 'framer-motion';

// Base Skeleton component with shimmer animation
export function Skeleton({ className = '', children }) {
  return (
    <div 
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700 rounded ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ translateX: ['100%', '-100%'] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: 'linear',
          repeatDelay: 0.5 
        }}
      />
      {children}
    </div>
  );
}

// Text skeleton for single or multiple lines
export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  return <Skeleton className={`${sizes[size]} rounded-full`} />;
}

// Card skeleton for dashboard cards
export function SkeletonCard({ hasIcon = true, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-start gap-4">
        {hasIcon && <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-700">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 ${i === 0 ? 'w-32' : i === columns - 1 ? 'w-20' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}

// Full table skeleton
export function SkeletonTable({ rows = 5, columns = 5, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// List item skeleton
export function SkeletonListItem({ hasAvatar = true, hasActions = true }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      {hasAvatar && <SkeletonAvatar size="md" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      {hasActions && (
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      )}
    </div>
  );
}

// Form skeleton
export function SkeletonForm({ fields = 4 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

// Dashboard grid skeleton
export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
      
      {/* Table section */}
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}

// Candidates page skeleton
export function SkeletonCandidatesPage() {
  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
      
      {/* Table */}
      <SkeletonTable rows={8} columns={7} />
      
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Mentor card skeleton
export function SkeletonMentorCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export default Skeleton;
