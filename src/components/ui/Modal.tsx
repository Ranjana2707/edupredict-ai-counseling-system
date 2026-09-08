import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm"
          />

          {/* Modal Content Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={cn(
              'relative z-10 flex flex-col w-full max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface shadow-xl focus-visible:outline-none max-h-[85vh]',
              className
            )}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-lg border-b border-outline-variant/30">
              <div className="space-y-1 pr-6">
                <h2 className="font-sans text-title-lg font-semibold tracking-tight text-on-surface">
                  {title}
                </h2>
                {description && (
                  <p className="font-sans text-xs text-on-surface-variant">
                    {description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-surface-container-low"
              >
                <X className="h-4.5 w-4.5 text-outline" />
              </Button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-lg font-sans text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-lg border-t border-outline-variant/30 bg-surface-container-low/30 rounded-b-lg">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
