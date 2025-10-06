import React from 'react';
import { TabButton } from './TabButton';
import { WandIcon, SlidersIcon, CameraIcon, MessageSquareIcon, FilmIcon, RefreshCcwIcon } from './Icons';
import type { UploadedImage } from '../types';
import type { Bubble } from '../App';
import { EditTab } from './studio/EditTab';
import { AdjustTab } from './studio/AdjustTab';
import { EffectsTab } from './studio/EffectsTab';
import { OverlaysTab } from './studio/OverlaysTab';
import { AnimateTab } from './studio/AnimateTab';

interface StudioPanelProps {
    activeStudioTab: 'edit' | 'adjust' | 'effects' | 'overlays' | 'animate';
    setActiveStudioTab: React.Dispatch<React.SetStateAction<'edit' | 'adjust' | 'effects' | 'overlays' | 'animate'>>;
    editTab: 'creative' | 'accessory' | 'product';
    setEditTab: React.Dispatch<React.SetStateAction<'creative' | 'accessory' | 'product'>>;
    isSelectingPoint: boolean;
    setIsSelectingPoint: (isSelecting: boolean) => void;
    selectedPoint: { x: number; y: number } | null;
    setSelectedPoint: (point: { x: number; y: number } | null) => void;
    editPrompt: string;
    setEditPrompt: (prompt: string) => void;
    handleEditImage: () => void;
    setIsInpainting: (isInpainting: boolean) => void;
    accessoryPrompt: string;
    setAccessoryPrompt: (prompt: string) => void;
    accessoryImage: UploadedImage | null;
    setAccessoryImage: (image: UploadedImage | null) => void;
    handleAccessorize: () => void;
    productPrompt: string;
    setProductPrompt: (prompt: string) => void;
    productImage: UploadedImage | null;
    setProductImage: (image: UploadedImage | null) => void;
    handleStageProduct: () => void;
    brightness: number;
    setBrightness: (value: number) => void;
    contrast: number;
    setContrast: (value: number) => void;
    grainIntensity: number;
    setGrainIntensity: (value: number) => void;
    handleMakePortrait: () => void;
    handleBackgroundChange: (prompt: string) => void;
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
    animationPrompt: string;
    setAnimationPrompt: (prompt: string) => void;
    handleAnimateImage: () => void;
    loadingMessage: string | null;
    isRephrasingEdit: boolean;
    handleRephraseEditPrompt: () => void;
    handleUseAsModel: () => void;
}

export const StudioPanel: React.FC<StudioPanelProps> = (props) => {

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="space-y-4">
                <div className="overflow-x-auto">
                    <div className="neo-tab-container !p-1 inline-flex min-w-full">
                        <TabButton Icon={WandIcon} label="Edit" isActive={props.activeStudioTab === 'edit'} onClick={() => props.setActiveStudioTab('edit')} />
                        <TabButton Icon={SlidersIcon} label="Adjust" isActive={props.activeStudioTab === 'adjust'} onClick={() => props.setActiveStudioTab('adjust')} />
                        <TabButton Icon={CameraIcon} label="Effects" isActive={props.activeStudioTab === 'effects'} onClick={() => props.setActiveStudioTab('effects')} />
                        <TabButton Icon={MessageSquareIcon} label="Overlays" isActive={props.activeStudioTab === 'overlays'} onClick={() => props.setActiveStudioTab('overlays')} />
                        <TabButton Icon={FilmIcon} label="Animate" isActive={props.activeStudioTab === 'animate'} onClick={() => props.setActiveStudioTab('animate')} />
                    </div>
                </div>

                {props.activeStudioTab === 'edit' && <EditTab {...props} />}
                {props.activeStudioTab === 'adjust' && <AdjustTab {...props} />}
                {props.activeStudioTab === 'effects' && <EffectsTab {...props} />}
                {props.activeStudioTab === 'overlays' && <OverlaysTab {...props} />}
                {props.activeStudioTab === 'animate' && <AnimateTab {...props} />}
                
                <div className="mt-4 pt-4 border-t border-[var(--nb-border)]">
                    <button onClick={props.handleUseAsModel} className="w-full neo-button neo-button-secondary">
                        <RefreshCcwIcon /> Use as New Model
                    </button>
                </div>
            </div>
        </div>
    );
};