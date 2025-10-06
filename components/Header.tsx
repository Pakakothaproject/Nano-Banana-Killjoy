import React from 'react';
import { MoonIcon, SunIcon, WandIcon, MenuIcon, UndoIcon, RedoIcon, DownloadIcon, CogIcon } from './Icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onOpenGenerator: () => void;
    onTogglePanel: () => void;
    canUndo: boolean;
    handleUndo: () => void;
    canRedo: boolean;
    handleRedo: () => void;
    isDownloading: boolean;
    handlePrimaryDownload: () => void;
    hasGeneratedContent: boolean;
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    theme, toggleTheme, onOpenGenerator, onTogglePanel,
    canUndo, handleUndo, canRedo, handleRedo, isDownloading, handlePrimaryDownload, hasGeneratedContent,
    onOpenSettings
}) => {
    return (
        <header className="w-full p-4 flex justify-between items-start gap-4 pointer-events-auto">
            {/* Left side actions */}
            <div className="flex items-center gap-2">
                 <button onClick={onTogglePanel} aria-label="Toggle controls panel" className="neo-button neo-icon-button header-action-button">
                    <MenuIcon />
                </button>
                 <button onClick={onOpenGenerator} aria-label="Create New Image from Text" className="neo-button neo-icon-button header-action-button">
                    <WandIcon />
                </button>
            </div>

            {/* Center promo text */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4">
                 <div className="text-center pulsating-highlight max-w-full">
                    <p className="text-xs sm:text-sm">This is a beta model. We have a more robust app ready for market.</p>
                </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-2">
                 <button onClick={handleUndo} disabled={!canUndo} className="neo-button neo-icon-button header-action-button"><UndoIcon /></button>
                 <button onClick={handleRedo} disabled={!canRedo} className="neo-button neo-icon-button header-action-button"><RedoIcon /></button>
                 <button onClick={handlePrimaryDownload} disabled={isDownloading || !hasGeneratedContent} className="neo-button neo-icon-button header-action-button"><DownloadIcon /></button>
                 <button onClick={toggleTheme} aria-label="Toggle theme" className="neo-button neo-icon-button header-action-button">
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                <button onClick={onOpenSettings} aria-label="Open settings" className="neo-button neo-icon-button neo-button-danger">
                    <CogIcon />
                </button>
            </div>
        </header>
    );
};