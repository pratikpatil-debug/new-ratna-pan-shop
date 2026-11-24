import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastNotification = () => {
  const { toasts } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 size={18} style={{ color: '#34d399' }} />;
        if (toast.type === 'error') {
          icon = <AlertCircle size={18} style={{ color: '#f87171' }} />;
        } else if (toast.type === 'info') {
          icon = <Info size={18} style={{ color: '#60a5fa' }} />;
        }

        return (
          <div key={toast.id} className="toast-message">
            {icon}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
