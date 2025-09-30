import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertTriangleIcon, DownloadIcon, ImageIcon, SparklesIcon, UserIcon, XIcon } from './Icons';

interface GeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    prompt: string;
    setPrompt: (p: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    error: string | null;
    images: string[] | null;
    onUseAsModel: (image: string) => void;
    onDownload: (image: string) => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
    isOpen, onClose, prompt, setPrompt, onGenerate, isLoading, error, images,
    onUseAsModel, onDownload
}) => {
    if (!isOpen) return null;

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="generator-modal-title">
            <div className="image-modal-backdrop" onClick={onClose}></div>
            <div className="image-modal-content">
                <div className="neo-card p-6 w-full max-w-4xl h-[80vh] flex flex-col gap-4 m-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 id="generator-modal-title" className="text-2xl font-bold flex items-center gap-2"><SparklesIcon /> Image Generation Studio</h2>
                            <p className="text-sm opacity-70 mt-1">Create a new image from a text description.</p>
                        </div>
                        <button onClick={onClose} className="neo-button neo-icon-button neo-button-secondary"><XIcon /></button>
                    </div>
                    
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                        {/* Left: Prompt & controls */}
                        <div className="flex flex-col gap-4">
                            <label htmlFor="generator-prompt" className="font-semibold">Prompt</label>
                            <textarea
                                id="generator-prompt"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                className="neo-textarea flex-grow"
                                placeholder="A photorealistic image of..."
                            />
                            <button onClick={onGenerate} disabled={isLoading || !prompt} className="neo-button neo-button-primary">
                                <SparklesIcon /> {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>

                        {/* Right: Image display */}
                        <div className="relative neo-card !shadow-none bg-[var(--nb-surface-alt)] p-2 rounded-lg flex flex-col items-center justify-center">
                            {isLoading && <LoadingSpinner message="Generating..." />}
                            {error && !isLoading && (
                                <div className="text-center text-[var(--nb-secondary)] p-4">
                                    <AlertTriangleIcon className="mx-auto mb-2" />
                                    <p className="font-semibold">Generation Failed</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                            {!isLoading && !error && images && images.length > 0 && (
                                <div className="w-full h-full flex flex-col gap-4 p-1">
                                    <div className="flex-grow relative rounded-md overflow-hidden min-h-0">
                                        <img src={images[0]} alt="Generated image" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-4">
                                        <button onClick={() => onDownload(images[0])} className="neo-button neo-button-secondary w-full">
                                            <DownloadIcon /> Download
                                        </button>
                                        <button onClick={() => onUseAsModel(images[0])} className="neo-button neo-button-primary w-full">
                                            <UserIcon /> Use as Model
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!isLoading && !error && (!images || images.length === 0) && (
                                <div className="text-center text-[var(--nb-text)] opacity-60 px-4">
                                    <ImageIcon className="mx-auto mb-4 w-16 h-16"/>
                                    <p className="font-semibold text-lg">Generated image will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
