import React from 'react';
export const Modal: React.FC<{ open: boolean; children: React.ReactNode }> = ({ open, children }) =>
  open ? <div className="card">{children}</div> : null;
