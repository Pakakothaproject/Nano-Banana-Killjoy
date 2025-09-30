import React from 'react';
import { CameraIcon, BrushIcon } from '../Icons';

interface EffectsTabProps {
    handleMakePortrait: () => void;
    handleBackgroundChange: (prompt: string) => void;
}

export const EffectsTab: React.FC<EffectsTabProps> = ({
    handleMakePortrait, handleBackgroundChange
}) => {
    return (
        <div className="space-y-4 p-2 animate-fade-in">
            <div>
                <h4 className="font-bold mb-2 flex items-center gap-2"><CameraIcon /> Composition</h4>
                <button onClick={handleMakePortrait} className="w-full neo-button neo-button-secondary text-sm">Make Full Body Portrait</button>
            </div>
             <div>
                <h4 className="font-bold mb-2 flex items-center gap-2"><BrushIcon /> Quick Backgrounds</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleBackgroundChange('a professional photography studio')} className="neo-button neo-button-secondary text-xs w-full">Studio</button>
                    <button onClick={() => handleBackgroundChange('an outdoor park with green trees')} className="neo-button neo-button-secondary text-xs w-full">Outdoor</button>
                    <button onClick={() => handleBackgroundChange('a solid, light grey wall')} className="neo-button neo-button-secondary text-xs w-full">Minimal</button>
                    <button onClick={() => handleBackgroundChange('a vibrant, colorful cityscape at night')} className="neo-button neo-button-secondary text-xs w-full">Cityscape</button>
                </div>
            </div>
        </div>
    );
};
