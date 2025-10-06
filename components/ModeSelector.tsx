import React from 'react';
import { WandIcon, FrameIcon, MegaphoneIcon, ScissorsIcon } from './Icons';

interface ModeSelectorProps {
    appMode: 'tryon' | 'sceneswap' | 'marketing' | 'hairstyle';
    setAppMode: (mode: 'tryon' | 'sceneswap' | 'marketing' | 'hairstyle') => void;
}

const ModeButton: React.FC<{
    label: string;
    Icon: React.FC<{className?: string}>;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        aria-label={label}
        title={label}
        className={`w-full flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all aspect-square border ${
            isActive ? 'bg-[var(--nb-primary)] text-white border-transparent shadow-md' : 'bg-[var(--nb-surface-alt)] hover:bg-[var(--nb-surface)] border-[var(--nb-border)]'
        }`}
    >
        <Icon className="w-6 h-6" />
        <span className="text-xs font-bold">{label}</span>
    </button>
);

export const ModeSelector: React.FC<ModeSelectorProps> = ({ appMode, setAppMode }) => {
    return (
        <div className="grid grid-cols-4 gap-2">
            <ModeButton label="Try-On" Icon={WandIcon} isActive={appMode === 'tryon'} onClick={() => setAppMode('tryon')} />
            <ModeButton label="Scene" Icon={FrameIcon} isActive={appMode === 'sceneswap'} onClick={() => setAppMode('sceneswap')} />
            <ModeButton label="Hair" Icon={ScissorsIcon} isActive={appMode === 'hairstyle'} onClick={() => setAppMode('hairstyle')} />
            <ModeButton label="Ads" Icon={MegaphoneIcon} isActive={appMode === 'marketing'} onClick={() => setAppMode('marketing')} />
        </div>
    );
};
