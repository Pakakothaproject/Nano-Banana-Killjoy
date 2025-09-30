import React from 'react';

interface PromotionPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PromotionPopup: React.FC<PromotionPopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="promo-popup-title">
            <div className="image-modal-backdrop" onClick={onClose}></div>
            <div className="image-modal-content">
                <div className="neo-card p-6 w-full max-w-lg space-y-6 m-4 text-center relative">
                    <div className="pt-8">
                        <h2 id="promo-popup-title" className="text-2xl font-bold">
                            See all Apps:
                        </h2>
                        <p className="text-lg mt-2">
                            <a href="https://student-app-hub1.onrender.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--nb-primary)] break-all">
                                https://student-app-hub1.onrender.com/
                            </a>
                        </p>
                    </div>
                    <button onClick={onClose} className="neo-button neo-button-secondary mx-auto">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};