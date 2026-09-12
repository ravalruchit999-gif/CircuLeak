import React, { useState } from 'react';

export function Tooltip({ text, children, position = 'top', className = '' }) {
  const [visible, setVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-40 px-2.5 py-1 text-[11px] leading-tight text-slate-200 bg-[#161b24] border border-[#2e374a] rounded shadow-xl whitespace-nowrap pointer-events-none ${positionStyles[position]}`}
        >
          {text}
        </div>
      )}
    </div>
  );
}
