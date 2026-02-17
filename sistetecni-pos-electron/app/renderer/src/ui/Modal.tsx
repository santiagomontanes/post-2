import React from 'react';

export const Modal: React.FC<{ open: boolean; children: React.ReactNode; onClose?: () => void }> = ({ open, children, onClose }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={() => onClose?.()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="card"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: 'min(900px, 96vw)', maxHeight: '90vh', overflow: 'auto' }}
      >
        {children}
      </div>
    </div>
  );
};
