import React, { useState, useEffect, useCallback } from 'react';
import { TabButton } from './TabButton';
import { TryOnMode } from './TryOnMode';
import { SceneSwapMode } from './SceneSwapMode';
import { MarketingMode } from './MarketingMode';
import { StudioPanel } from './StudioPanel';
import { UploadedImage, InputType } from '../types';
import { Bubble } from '../App';
// FIX: Update import path for fetchImageAsUploadedImage from the refactored utils module.
import { fetchImageAsUploadedImage } from '../utils/image';
import { presetImages } from '../constants/presets';
import { HairStyleMode } from './HairStyleMode';
import { ModeSelector } from './ModeSelector';
import { XIcon } from './Icons';

interface LeftPanelProps {
    isOpen: boolean;
    onClose: () => void;
    appMode: 'tryon' | 'sceneswap' | 'marketing' | 'hairstyle';
    setAppMode: (mode: 'tryon' | 'sceneswap' | 'marketing' | 'hairstyle') => void;
    generatedImage: string | null;
    loadingMessage: string | null;
    originalModelImage: UploadedImage | null;
    handleModelImageUpload: (image: UploadedImage | null) => void;
    isFaceRestoreEnabled: boolean;
    setIsFaceRestoreEnabled: (enabled: boolean) => void;
    isSelectingPerson: boolean;
    setIsSelectingPerson: (isSelecting: boolean) => void;
    targetPersonPoint: { x: number; y: number } | null;
    setTargetPersonPoint: (point: { x: number; y: number } | null) => void;
    modelImage: UploadedImage | null;
    modelImageUrl: string;
    setModelImageUrl: (url: string) => void;
    isModelUrlLoading: boolean;
    setIsModelUrlLoading: (loading: boolean) => void;
    clothingImage: UploadedImage | null;
    setClothingImage: (image: UploadedImage | null) => void;
    clothingText: string;
    setClothingText: (text: string) => void;
    clothingImageUrl: string;
    setClothingImageUrl: (url: string) => void;
    isUrlLoading: boolean;
    setIsUrlLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    showPresets: boolean;
    setShowPresets: React.Dispatch<React.SetStateAction<boolean>>;
    isPoseLocked: boolean;
    setIsPoseLocked: (locked: boolean) => void;
    handleGenerate: (activeTab: InputType, clothingText: string, clothingImage: UploadedImage | null) => void;
    isPreparingModel: boolean;
    handlePrepareModel: () => void;
    environmentImage: UploadedImage | null;
    setEnvironmentImage: (image: UploadedImage | null) => void;
    environmentImageUrl: string;
    setEnvironmentImageUrl: (url: string) => void;
    isEnvironmentUrlLoading: boolean;
    setIsEnvironmentUrlLoading: (loading: boolean) => void;
    isStrictFaceEnabled: boolean;
    setIsStrictFaceEnabled: (enabled: boolean) => void;
    handleSceneSwapGenerate: () => void;
    handleAutoSceneSwapGenerate: () => void;
    hairStyleImage: UploadedImage | null;
    setHairStyleImage: (image: UploadedImage | null) => void;
    handleHairStyleGenerate: () => void;
    marketingPrompt: string;
    setMarketingPrompt: (prompt: string) => void;
    marketingProductImage: UploadedImage | null;
    setMarketingProductImage: (image: UploadedImage | null) => void;
    leaveSpaceForText: boolean;
    setLeaveSpaceForText: (enabled: boolean) => void;
    handleMarketingGenerate: () => void;
    numberOfImages: 1 | 2;
    setNumberOfImages: (value: 1 | 2) => void;
    isTwoStageSwap: boolean;
    setIsTwoStageSwap: (enabled: boolean) => void;
    isParaphrasing: boolean;
    handleParaphraseSceneDescription: () => void;
    sceneDescription: string;
    setSceneDescription: (description: string) => void;
    swapStage: 'initial' | 'analyzed';
    setSwapStage: React.Dispatch<React.SetStateAction<'initial' | 'analyzed'>>;
    handleCompleteSceneSwap: () => void;
    activeStudioTab: 'edit' | 'adjust' | 'effects' | 'overlays' | 'animate';
    setActiveStudioTab: React.Dispatch<React.SetStateAction<'edit' | 'adjust' | 'effects' | 'overlays' | 'animate'>>;
    editTab: 'creative' | 'accessory' | 'product';
    setEditTab: React.Dispatch<React.SetStateAction<'creative' | 'accessory' | 'product'>>;
    editPrompt: string;
    setEditPrompt: (prompt: string) => void;
    isSelectingPoint: boolean;
    setIsSelectingPoint: (isSelecting: boolean) => void;
    selectedPoint: { x: number; y: number } | null;
    setSelectedPoint: (point: { x: number; y: number } | null) => void;
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
    handleUpdateBubble: (id: number, updates: Partial<Bubble>) => void;
    animationPrompt: string;
    setAnimationPrompt: (prompt: string) => void;
    handleAnimateImage: () => void;
    isRephrasingEdit: boolean;
    handleRephraseEditPrompt: () => void;
    handleUseAsModel: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = (props) => {
    
    const [activeTab, setActiveTab] = React.useState<InputType>(InputType.IMAGE);
    const [selectedPresetUrl, setSelectedPresetUrl] = React.useState<string | null>(props.clothingImageUrl);
    const [view, setView] = useState<'setup' | 'studio'>('setup');

    useEffect(() => {
        // When a new model is uploaded, or the current one is cleared,
        // always return to the setup view. This ensures that after uploading
        // or using a generated image as a new model, the user is back at the start.
        // A new generation does not change originalModelImage, so the view
        // will correctly stay on 'setup' after generating.
        setView('setup');
    }, [props.originalModelImage]);


    const loadClothingUrl = React.useCallback(async (url: string) => {
        if (!url) return;
        props.setIsUrlLoading(true);
        props.setError(null);
        try {
            const image = await fetchImageAsUploadedImage(url);
            props.setClothingImage(image);
        } catch (err) {
            const errorMsg = `Failed to load from URL. This may be a CORS issue. Try another URL or upload a file. Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
            props.setError(errorMsg);
        } finally {
            props.setIsUrlLoading(false);
        }
      }, [props]);

    const handleLoadFromUrlInput = () => {
        setSelectedPresetUrl(null);
        loadClothingUrl(props.clothingImageUrl);
    };

    const handlePresetImageSelect = (url: string) => {
        props.setClothingImageUrl(url);
        setSelectedPresetUrl(url);
        loadClothingUrl(url);
    };
    
    const handleClothingImageUpload = (image: UploadedImage | null) => {
        props.setClothingImage(image);
        if (image) {
            setSelectedPresetUrl(null);
        }
    }

    React.useEffect(() => {
        if (props.clothingImageUrl && presetImages.some(p => p.url === props.clothingImageUrl)) {
            loadClothingUrl(props.clothingImageUrl);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedBubble = props.bubbles.find(b => b.id === props.selectedBubbleId);

    const renderSetupContent = () => {
        switch(props.appMode) {
            case 'tryon':
                return <TryOnMode
                        originalModelImage={props.originalModelImage}
                        handleModelImageUpload={props.handleModelImageUpload}
                        modelImage={props.modelImage}
                        modelImageUrl={props.modelImageUrl}
                        setModelImageUrl={props.setModelImageUrl}
                        isModelUrlLoading={props.isModelUrlLoading}
                        setIsModelUrlLoading={props.setIsModelUrlLoading}
                        setError={props.setError}
                        isFaceRestoreEnabled={props.isFaceRestoreEnabled}
                        setIsFaceRestoreEnabled={props.setIsFaceRestoreEnabled}
                        isSelectingPerson={props.isSelectingPerson}
                        setIsSelectingPerson={props.setIsSelectingPerson}
                        targetPersonPoint={props.targetPersonPoint}
                        setTargetPersonPoint={props.setTargetPersonPoint}
                        clothingImage={props.clothingImage}
                        clothingText={props.clothingText}
                        setClothingText={props.setClothingText}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        clothingImageUrl={props.clothingImageUrl}
                        setClothingImageUrl={props.setClothingImageUrl}
                        isUrlLoading={props.isUrlLoading}
                        handleLoadFromUrlInput={handleLoadFromUrlInput}
                        handlePresetImageSelect={handlePresetImageSelect}
                        handleClothingImageUpload={handleClothingImageUpload}
                        showPresets={props.showPresets}
                        setShowPresets={props.setShowPresets}
                        selectedPresetUrl={selectedPresetUrl}
                        isPoseLocked={props.isPoseLocked}
                        setIsPoseLocked={props.setIsPoseLocked}
                        handleGenerate={() => props.handleGenerate(activeTab, props.clothingText, props.clothingImage)}
                        loadingMessage={props.loadingMessage}
                        isPreparingModel={props.isPreparingModel}
                        handlePrepareModel={props.handlePrepareModel}
                        numberOfImages={props.numberOfImages}
                        setNumberOfImages={props.setNumberOfImages}
                    />;
            case 'sceneswap':
                 return <SceneSwapMode
                        originalModelImage={props.originalModelImage}
                        handleModelImageUpload={props.handleModelImageUpload}
                        modelImageUrl={props.modelImageUrl}
                        setModelImageUrl={props.setModelImageUrl}
                        isModelUrlLoading={props.isModelUrlLoading}
                        setIsModelUrlLoading={props.setIsModelUrlLoading}
                        environmentImage={props.environmentImage}
                        setEnvironmentImage={props.setEnvironmentImage}
                        environmentImageUrl={props.environmentImageUrl}
                        setEnvironmentImageUrl={props.setEnvironmentImageUrl}
                        isEnvironmentUrlLoading={props.isEnvironmentUrlLoading}
                        setIsEnvironmentUrlLoading={props.setIsEnvironmentUrlLoading}
                        isStrictFaceEnabled={props.isStrictFaceEnabled}
                        setIsStrictFaceEnabled={props.setIsStrictFaceEnabled}
                        handleSceneSwapGenerate={props.handleSceneSwapGenerate}
                        handleAutoSceneSwapGenerate={props.handleAutoSceneSwapGenerate}
                        loadingMessage={props.loadingMessage}
                        numberOfImages={props.numberOfImages}
                        setNumberOfImages={props.setNumberOfImages}
                        isTwoStageSwap={props.isTwoStageSwap}
                        setIsTwoStageSwap={props.setIsTwoStageSwap}
                        isParaphrasing={props.isParaphrasing}
                        handleParaphraseSceneDescription={props.handleParaphraseSceneDescription}
                        sceneDescription={props.sceneDescription}
                        setSceneDescription={props.setSceneDescription}
                        swapStage={props.swapStage}
                        setSwapStage={props.setSwapStage}
                        handleCompleteSceneSwap={props.handleCompleteSceneSwap}
                        setError={props.setError}
                    />;
            case 'hairstyle':
                return <HairStyleMode
                        modelImage={props.originalModelImage}
                        handleModelImageUpload={props.handleModelImageUpload}
                        hairStyleImage={props.hairStyleImage}
                        setHairStyleImage={props.setHairStyleImage}
                        handleHairStyleGenerate={props.handleHairStyleGenerate}
                        loadingMessage={props.loadingMessage}
                        numberOfImages={props.numberOfImages}
                        setNumberOfImages={props.setNumberOfImages}
                    />;
            case 'marketing':
                return <MarketingMode
                        marketingPrompt={props.marketingPrompt}
                        setMarketingPrompt={props.setMarketingPrompt}
                        marketingProductImage={props.marketingProductImage}
                        setMarketingProductImage={props.setMarketingProductImage}
                        leaveSpaceForText={props.leaveSpaceForText}
                        setLeaveSpaceForText={props.setLeaveSpaceForText}
                        handleMarketingGenerate={props.handleMarketingGenerate}
                        loadingMessage={props.loadingMessage}
                        numberOfImages={props.numberOfImages}
                        setNumberOfImages={props.setNumberOfImages}
                    />;
            default:
                return null;
        }
    };

    return (
        <div className={`slide-out-panel ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex-shrink-0 p-2 flex justify-between items-center border-b border-[var(--nb-border)]">
                 <h2 className="text-xl font-bold px-2">Controls</h2>
                 <button onClick={props.onClose} className="neo-button neo-icon-button neo-button-secondary"> <XIcon /> </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col h-full gap-4">
                    {props.generatedImage && !props.loadingMessage && (
                        <div className="flex-shrink-0">
                            <div className="neo-tab-container !p-1.5">
                                <TabButton label="Setup" isActive={view === 'setup'} onClick={() => setView('setup')} />
                                <TabButton label="Studio" isActive={view === 'studio'} onClick={() => setView('studio')} />
                            </div>
                        </div>
                    )}
                    <div className="flex-grow min-h-0">
                        {view === 'setup' ? (
                            <div className="space-y-4">
                                <ModeSelector appMode={props.appMode} setAppMode={props.setAppMode} />
                                {renderSetupContent()}
                            </div>
                        ) : (
                            <StudioPanel
                                activeStudioTab={props.activeStudioTab}
                                setActiveStudioTab={props.setActiveStudioTab}
                                editTab={props.editTab}
                                setEditTab={props.setEditTab}
                                isSelectingPoint={props.isSelectingPoint}
                                setIsSelectingPoint={props.setIsSelectingPoint}
                                selectedPoint={props.selectedPoint}
                                setSelectedPoint={props.setSelectedPoint}
                                editPrompt={props.editPrompt}
                                setEditPrompt={props.setEditPrompt}
                                handleEditImage={props.handleEditImage}
                                setIsInpainting={props.setIsInpainting}
                                accessoryPrompt={props.accessoryPrompt}
                                setAccessoryPrompt={props.setAccessoryPrompt}
                                accessoryImage={props.accessoryImage}
                                setAccessoryImage={props.setAccessoryImage}
                                handleAccessorize={props.handleAccessorize}
                                productPrompt={props.productPrompt}
                                setProductPrompt={props.setProductPrompt}
                                productImage={props.productImage}
                                setProductImage={props.setProductImage}
                                handleStageProduct={props.handleStageProduct}
                                brightness={props.brightness}
                                setBrightness={props.setBrightness}
                                contrast={props.contrast}
                                setContrast={props.setContrast}
                                grainIntensity={props.grainIntensity}
                                setGrainIntensity={props.setGrainIntensity}
                                handleMakePortrait={props.handleMakePortrait}
                                handleBackgroundChange={props.handleBackgroundChange}
                                isWatermarkEnabled={props.isWatermarkEnabled}
                                setIsWatermarkEnabled={props.setIsWatermarkEnabled}
                                bubbles={props.bubbles}
                                handleAddBubble={props.handleAddBubble}
                                handleApplyBubbles={props.handleApplyBubbles}
                                selectedBubbleId={props.selectedBubbleId}
                                setSelectedBubbleId={props.setSelectedBubbleId}
                                handleDeleteBubble={props.handleDeleteBubble}
                                selectedBubble={selectedBubble}
                                handleUpdateBubble={props.handleUpdateBubble}
                                animationPrompt={props.animationPrompt}
                                setAnimationPrompt={props.setAnimationPrompt}
                                handleAnimateImage={props.handleAnimateImage}
                                loadingMessage={props.loadingMessage}
                                isRephrasingEdit={props.isRephrasingEdit}
                                handleRephraseEditPrompt={props.handleRephraseEditPrompt}
                                handleUseAsModel={props.handleUseAsModel}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};