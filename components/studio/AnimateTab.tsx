import React from 'react';
import { FilmIcon } from '../Icons';

interface AnimateTabProps {
    animationPrompt: string;
    setAnimationPrompt: (prompt: string) => void;
    handleAnimateImage: () => void;
    loadingMessage: string | null;
    activeStudioTab: string;
}

export const AnimateTab: React.FC<AnimateTabProps> = ({
    animationPrompt, setAnimationPrompt, handleAnimateImage, loadingMessage, activeStudioTab
}) => {
    return (
        <div className="space-y-4 p-2 animate-fade-in">
            <h4 className="font-bold mb-2 flex items-center gap-2"><FilmIcon /> Animate with VEO</h4>
            <p className="text-sm opacity-70 -mt-2">Describe how you want the image to move. This can take several minutes.</p>
            <textarea
                value={animationPrompt}
                onChange={e => setAnimationPrompt(e.target.value)}
                className="neo-textarea"
                placeholder="e.g., subtle steam rising from the coffee cup"
                rows={3}
            />
            <button
                onClick={handleAnimateImage}
                disabled={!animationPrompt || !!loadingMessage}
                className="w-full neo-button neo-button-primary"
            >
                <FilmIcon />
                {loadingMessage && activeStudioTab === 'animate' ? 'Animating...' : 'Generate Animation'}
            </button>
        </div>
    );
};
