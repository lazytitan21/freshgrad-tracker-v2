import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

const icons = {
  danger: { icon: Trash2, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
  info: { icon: HelpCircle, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
  success: { icon: CheckCircle, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
};

const buttonStyles = {
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  info: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
};

function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false
}) {
  const iconData = icons[type] || icons.warning;
  const Icon = iconData.icon;
  const buttonStyle = buttonStyles[type] || buttonStyles.warning;
  
  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && !loading) onConfirm();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm, loading]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mx-4">
              {/* Header with icon */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl ${iconData.bg}`}>
                    <Icon className={`h-6 w-6 ${iconData.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {message}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${buttonStyle}`}
                >
                  {loading && (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback(({ 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'warning' 
  }) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ title, message, confirmText, cancelText, type });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setDialog(null);
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setDialog(null);
  }, []);

  // Convenience methods
  const confirmDelete = useCallback((itemName) => {
    return confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }, [confirm]);

  const confirmAction = useCallback((message) => {
    return confirm({
      title: 'Confirm Action',
      message,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      type: 'warning'
    });
  }, [confirm]);

  return (
    <ConfirmContext.Provider value={{ confirm, confirmDelete, confirmAction }}>
      {children}
      <ConfirmDialog
        isOpen={Boolean(dialog)}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...dialog}
      />
    </ConfirmContext.Provider>
  );
}

export default ConfirmDialog;
