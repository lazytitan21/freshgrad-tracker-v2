import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const bgColors = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  warning: 'bg-amber-500',
  info: 'bg-indigo-600',
  loading: 'bg-slate-700',
};

function Toast({ id, type = 'info', message, title, action, onDismiss, duration = 4000, persistent = false }) {
  const Icon = icons[type] || Info;
  const bgColor = bgColors[type] || bgColors.info;

  useEffect(() => {
    if (persistent || type === 'loading') return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, onDismiss, duration, persistent, type]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[300px] max-w-[420px] text-white ${bgColor}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${type === 'loading' ? 'animate-spin' : ''}`} />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <span className="block">{message}</span>
        {action && (
          <button 
            onClick={() => { action.onClick(); onDismiss(id); }}
            className="mt-2 text-xs font-semibold underline underline-offset-2 hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>
      {!persistent && type !== 'loading' && (
        <button
          onClick={() => onDismiss(id)}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, options = {}) => {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    
    // Remove existing toast with same id if updating
    setToasts(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return [...filtered, { id, type, message, ...options }];
    });
    
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const toast = {
    success: (message, options) => addToast('success', message, options),
    error: (message, options) => addToast('error', message, options),
    warning: (message, options) => addToast('warning', message, options),
    info: (message, options) => addToast('info', message, options),
    loading: (message, options) => addToast('loading', message, { ...options, persistent: true }),
    dismiss: dismissToast,
    update: updateToast,
    // Promise helper for async operations
    promise: async (promise, { loading: loadingMsg, success: successMsg, error: errorMsg }) => {
      const id = addToast('loading', loadingMsg, { persistent: true });
      try {
        const result = await promise;
        setToasts(prev => prev.map(t => 
          t.id === id ? { ...t, type: 'success', message: successMsg, persistent: false } : t
        ));
        return result;
      } catch (err) {
        setToasts(prev => prev.map(t => 
          t.id === id ? { ...t, type: 'error', message: errorMsg || err.message, persistent: false } : t
        ));
        throw err;
      }
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
