import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-3 border-emerald-100" />
        <div className="absolute inset-0 rounded-full border-3 border-emerald-700 border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
};
