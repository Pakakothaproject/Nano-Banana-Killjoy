import React from 'react';
import { TabButton } from '../TabButton';
import { ImageUploader } from '../ImageUploader';
import {
    WandIcon, JewelryIcon, BoxIcon, CrosshairIcon, XIcon,
    BrushIcon, RefreshCcwIcon
} from '../Icons';
import type { UploadedImage } from '../../types';

interface EditTabProps {
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
    loadingMessage: string | null;
    isRephrasingEdit: boolean;
    handleRephraseEditPrompt: () => void;
}

export const EditTab: React.FC<EditTabProps> = ({
    editTab, setEditTab, isSelectingPoint, setIsSelectingPoint, selectedPoint, setSelectedPoint, editPrompt,
    setEditPrompt, handleEditImage, setIsInpainting, accessoryPrompt, setAccessoryPrompt, accessoryImage,
    setAccessoryImage, handleAccessorize, productPrompt, setProductPrompt, productImage, setProductImage,
    handleStageProduct, loadingMessage, isRephrasingEdit, handleRephraseEditPrompt
}) => {
    const showProductUploader = productPrompt.includes('@object');
    const showAccessoryUploader = accessoryPrompt.includes('@accessory');

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="neo-tab-container">
                <TabButton label="Creative" Icon={WandIcon} isActive={editTab === 'creative'} onClick={() => setEditTab('creative')} />
                <TabButton label="Accessory" Icon={JewelryIcon} isActive={editTab === 'accessory'} onClick={() => setEditTab('accessory')} />
                <TabButton label="Product" Icon={BoxIcon} isActive={editTab === 'product'} onClick={() => setEditTab('product')} />
            </div>
            
            {editTab === 'creative' && (
                <div className="space-y-3 pt-2 animate-fade-in">
                    <p className="font-bold text-sm opacity-80">QUICK EDIT</p>
                    <div className="flex gap-2">
                    <button onClick={() => setIsSelectingPoint(!isSelectingPoint)} className={`w-full neo-button text-sm ${isSelectingPoint ? 'neo-button-danger' : 'neo-button-secondary'}`}>
                        <CrosshairIcon /> {isSelectingPoint ? 'Cancel Selection' : 'Select Point'}
                    </button>
                    {selectedPoint && (
                        <button onClick={() => setSelectedPoint(null)} className="neo-button neo-icon-button neo-button-secondary" aria-label="Clear selected point"><XIcon /></button>
                    )}
                    </div>
                    <textarea
                        value={editPrompt}
                        onChange={e => setEditPrompt(e.target.value)}
                        className="neo-textarea w-full"
                        placeholder="e.g., make the shirt red"
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <button onClick={handleRephraseEditPrompt} disabled={!editPrompt || isRephrasingEdit || !!loadingMessage} className="w-full neo-button neo-button-secondary" title="Rephrase prompt for a more creative result">
                            <RefreshCcwIcon /> Rephrase
                        </button>
                        <button onClick={handleEditImage} disabled={!editPrompt || !!loadingMessage} className="w-full neo-button neo-button-primary" title="Apply Edit">
                            <WandIcon /> Apply
                        </button>
                    </div>
                    {selectedPoint && <p className="text-xs text-center font-semibold text-[var(--nb-primary)] animate-fade-in">✓ Point selected. Edit will be applied here.</p>}

                    <p className="font-bold text-sm opacity-80 pt-2">ADVANCED EDIT</p>
                    <button onClick={() => setIsInpainting(true)} className="w-full neo-button neo-button-secondary"><BrushIcon /> Inpaint Studio</button>
                </div>
            )}

            {editTab === 'accessory' && (
                <div className="space-y-3 pt-2 animate-fade-in">
                    <textarea value={accessoryPrompt} onChange={e => setAccessoryPrompt(e.target.value)} className="neo-textarea" placeholder="e.g., a diamond necklace. Use @accessory to upload an image." />
                    <p className="text-xs opacity-70 -mt-2 px-1">Use <code className="bg-[var(--nb-surface-alt)] font-semibold px-1 py-0.5 rounded">@accessory</code> to show uploader.</p>
                    {showAccessoryUploader && <ImageUploader image={accessoryImage} onImageUpload={setAccessoryImage} />}
                    <button onClick={handleAccessorize} disabled={!accessoryPrompt || (showAccessoryUploader && !accessoryImage) || !!loadingMessage} className="w-full neo-button neo-button-danger"><JewelryIcon /> Add Accessory</button>
                </div>
            )}
            
            {editTab === 'product' && (
                <div className="space-y-3 pt-2 animate-fade-in">
                    <textarea value={productPrompt} onChange={e => setProductPrompt(e.target.value)} className="neo-textarea" placeholder="e.g., holding @object in left hand" />
                    <p className="text-xs opacity-70 -mt-2 px-1">Use <code className="bg-[var(--nb-surface-alt)] font-semibold px-1 py-0.5 rounded">@object</code> to show uploader.</p>
                    {showProductUploader && <ImageUploader image={productImage} onImageUpload={setProductImage} />}
                    <button onClick={handleStageProduct} disabled={!productPrompt || (showProductUploader && !productImage) || !!loadingMessage} className="w-full neo-button neo-button-accent"><BoxIcon /> Stage Product</button>
                </div>
            )}
        </div>
    );
};
