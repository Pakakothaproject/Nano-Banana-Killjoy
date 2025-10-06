import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  Icon?: React.FC;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, Icon }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--nb-primary)] ${
        isActive
          ? 'bg-[var(--nb-surface)] text-[var(--nb-text)] shadow-sm'
          : 'hover:bg-[var(--nb-surface)]/50'
      }`}
    >
      {Icon && <Icon />}
      {label}
    </button>
  );
};
