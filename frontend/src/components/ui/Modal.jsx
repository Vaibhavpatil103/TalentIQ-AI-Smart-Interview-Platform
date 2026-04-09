/**
 * Modal — Shared modal shell for TalentIQ
 *
 * Features:
 *   - AnimatePresence-compatible (wrap with <AnimatePresence>)
 *   - Backdrop click to close
 *   - Escape key to close
 *   - Focus trap (basic)
 *   - Portal rendering
 *
 * Usage:
 *   <AnimatePresence>
 *     {open && (
 *       <Modal title="Create Session" onClose={…} footer={<Button>Save</Button>}>
 *         <Input label="Name" />
 *       </Modal>
 *     )}
 *   </AnimatePresence>
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";

export default function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-2xl",
}) {
  const panelRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Auto-focus panel on mount
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`bg-white rounded-2xl w-full ${maxWidth} mx-4 z-10 flex flex-col max-h-[90vh] overflow-hidden border border-[var(--dark-border)] shadow-xl`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-[var(--dark-border)]">
            <h3 className="font-bold text-lg text-[var(--dark-text)]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="hover:bg-gray-100 p-1.5 rounded-lg transition-colors text-[var(--dark-text-secondary)]"
              aria-label="Close modal"
            >
              <XIcon className="size-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 flex gap-3 justify-end flex-shrink-0 border-t border-[var(--dark-border)]">
            {footer}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
