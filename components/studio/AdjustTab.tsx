import React from 'react';
import { BrightnessIcon, ContrastIcon, FilmIcon } from '../Icons';

interface AdjustTabProps {
    brightness: number;
    setBrightness: (value: number) => void;
    contrast: number;
    setContrast: (value: number) => void;
    grainIntensity: number;
    setGrainIntensity: (value: number) => void;
}

export const AdjustTab: React.FC<AdjustTabProps> = ({
    brightness, setBrightness, contrast, setContrast, grainIntensity, setGrainIntensity
}) => {
    return (
        <div className="space-y-3 p-2 animate-fade-in">
            <div className="flex items-center gap-3" title="Brightness">
                <BrightnessIcon />
                <input aria-label="Brightness" id="brightness-slider" type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
                <span className="text-sm font-medium opacity-70 w-12 text-right">{brightness}%</span>
            </div>
            <div className="flex items-center gap-3" title="Contrast">
                <ContrastIcon />
                <input aria-label="Contrast" id="contrast-slider" type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full" />
                <span className="text-sm font-medium opacity-70 w-12 text-right">{contrast}%</span>
            </div>
            <div className="flex items-center gap-3" title="Film Grain">
                <FilmIcon />
                <input aria-label="Film Grain" id="grain-slider" type="range" min="0" max="100" value={grainIntensity} onChange={(e) => setGrainIntensity(Number(e.target.value))} className="w-full" />
                <span className="text-sm font-medium opacity-70 w-12 text-right">{grainIntensity}%</span>
            </div>
        </div>
    );
};
