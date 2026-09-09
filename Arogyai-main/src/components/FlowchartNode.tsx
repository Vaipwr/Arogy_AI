import React from 'react';

interface FlowchartNodeProps {
  type: 'start' | 'process' | 'decision' | 'end';
  children: React.ReactNode;
  className?: string;
}

export function FlowchartNode({ type, children, className = '' }: FlowchartNodeProps) {
  const baseClasses = "flex items-center justify-center p-4 border-2 border-primary text-center min-h-16 min-w-32";
  
  const typeClasses = {
    start: "rounded-full bg-green-100 border-green-500 text-green-800",
    process: "rounded-lg bg-blue-100 border-blue-500 text-blue-800",
    decision: "rotate-45 bg-yellow-100 border-yellow-500 text-yellow-800 transform",
    end: "rounded-full bg-red-100 border-red-500 text-red-800"
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <div className={type === 'decision' ? '-rotate-45 transform' : ''}>
        {children}
      </div>
    </div>
  );
}