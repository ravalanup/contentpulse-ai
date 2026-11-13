import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  widthClass?: string;
  headerActions?: React.ReactNode;
}

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  widthClass = 'max-w-2xl',
  headerActions,
}) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen ${widthClass} bg-[#0e1420] border-l border-slate-800/90 shadow-2xl flex flex-col transform transition ease-in-out duration-300 animate-in slide-in-from-right`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-[#0f172a]/70 flex items-center justify-between sticky top-0 z-10">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h3>
                {badge}
              </div>
              {subtitle && <p className="text-xs text-slate-400 font-normal">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              {headerActions}
              <button
                type="button"
                id="btn-close-slide-over"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Close drawer (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
