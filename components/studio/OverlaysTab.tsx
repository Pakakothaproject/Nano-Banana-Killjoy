import React from 'react';
import { CopyrightIcon, MessageSquareIcon, SaveIcon, TrashIcon } from '../Icons';
import type { Bubble } from '../../App';

interface OverlaysTabProps {
    isWatermarkEnabled: boolean;
    setIsWatermarkEnabled: (enabled: boolean) => void;
    bubbles: Bubble[];
    handleAddBubble: () => void;
    handleApplyBubbles: () => void;
    selectedBubbleId: number | null;
    setSelectedBubbleId: (id: number | null) => void;
    handleDeleteBubble: (id: number) => void;
    selectedBubble: Bubble | undefined;
    handleUpdateBubble: (id: number, updates: Partial<Bubble>) => void;
}

export const OverlaysTab: React.FC<OverlaysTabProps> = ({
    isWatermarkEnabled, setIsWatermarkEnabled, bubbles, handleAddBubble, handleApplyBubbles,
    selectedBubbleId, setSelectedBubbleId, handleDeleteBubble, selectedBubble, handleUpdateBubble
}) => {
    return (
        <div className="space-y-4 p-2 animate-fade-in">
            <div className="flex items-center justify-between">
                <span id="watermark-label" className="flex flex-col pr-4">
                    <span className="font-semibold flex items-center gap-2"><CopyrightIcon /> Watermark</span>
                    <span className="text-sm opacity-70">Applies a logo to the corner.</span>
                </span>
                <button type="button" role="switch" aria-checked={isWatermarkEnabled} aria-labelledby="watermark-label" onClick={() => setIsWatermarkEnabled(!isWatermarkEnabled)}
                    className={`${isWatermarkEnabled ? 'bg-[var(--nb-primary)]' : 'bg-[var(--nb-surface-alt)]'} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-[var(--nb-border)] transition-colors duration-200 ease-in-out`}>
                    <span aria-hidden="true" className={`${isWatermarkEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out border border-[var(--nb-border)]`}/>
                </button>
            </div>
            <div className="pt-4 border-t-2 border-dashed border-[var(--nb-border)]">
                <h4 className="font-bold mb-2 flex items-center gap-2"><MessageSquareIcon /> Speech Bubbles</h4>
                <button onClick={handleAddBubble} className="w-full neo-button neo-button-secondary">Add Bubble</button>
                {bubbles.length > 0 && ( <button onClick={handleApplyBubbles} className="w-full neo-button neo-button-accent mt-2"> <SaveIcon /> Apply Bubbles to Image </button> )}
                <div className="space-y-2 mt-3 max-h-32 overflow-y-auto">
                    {bubbles.map((bubble, index) => (
                        <div key={bubble.id} onClick={() => setSelectedBubbleId(bubble.id)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border-2 transition-colors ${selectedBubbleId === bubble.id ? 'border-[var(--nb-primary)] bg-[var(--nb-surface-alt)]' : 'border-transparent hover:bg-[var(--nb-surface-alt)]'}`}>
                            <span className="font-semibold text-sm">Bubble {index + 1}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteBubble(bubble.id); }} className="neo-button neo-icon-button !p-1"><TrashIcon /></button>
                        </div>
                    ))}
                </div>
                {selectedBubble && (
                    <div className="space-y-3 pt-4 mt-3 border-t-2 border-dashed border-[var(--nb-border)]">
                        <h5 className="font-bold">Editing Bubble {bubbles.findIndex(b => b.id === selectedBubbleId) + 1}</h5>
                        <textarea value={selectedBubble.text} onChange={e => handleUpdateBubble(selectedBubble.id, {text: e.target.value})} className="neo-textarea" rows={3}/>
                        <button onClick={() => handleUpdateBubble(selectedBubble.id, {scaleX: selectedBubble.scaleX * -1})} className="w-full neo-button neo-button-secondary text-sm">Flip Horizontal</button>
                        
                        <div className="space-y-1 pt-2">
                            <label htmlFor="bubble-size-slider" className="text-sm font-semibold opacity-80">Bubble Size</label>
                            <div className="flex items-center gap-3">
                                <input id="bubble-size-slider" type="range" min="10" max="100" value={selectedBubble.size} onChange={(e) => handleUpdateBubble(selectedBubble.id, { size: Number(e.target.value) })} className="w-full" />
                                <span className="text-sm font-medium opacity-70 w-12 text-right">{selectedBubble.size}%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="text-size-slider" className="text-sm font-semibold opacity-80">Text Size</label>
                            <div className="flex items-center gap-3">
                                <input id="text-size-slider" type="range" min="5" max="50" value={selectedBubble.textSize} onChange={(e) => handleUpdateBubble(selectedBubble.id, { textSize: Number(e.target.value) })} className="w-full" />
                                <span className="text-sm font-medium opacity-70 w-12 text-right">{selectedBubble.textSize}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
