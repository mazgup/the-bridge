import React, { useEffect } from 'react';
import { usePDF } from '@react-pdf/renderer';
import { usePDFLayout } from '../../../hooks/usePDFLayout';
import { PDFCanvasPreview } from './PDFCanvasPreview';
import { InteractiveOverlay } from './InteractiveOverlay';
import { CVData } from '../CVTypes';

interface DocRendererProps {
    document: React.ReactElement;
    cvData: CVData;
    zoom: number;
    onSetEditingSection: (section: string) => void;
    templateName: string; // Used for debugging/logging
}

export const DocRenderer: React.ReactFC<DocRendererProps> = ({
    document,
    cvData,
    zoom,
    onSetEditingSection,
    templateName
}) => {
    // This hook is now guaranteed to be "fresh" because the parent keys this component
    const [pdfInstance, update] = usePDF({ document });
    const { positions: layoutPositions } = usePDFLayout(pdfInstance.blob);

    // Force update if document changes (double safety)
    useEffect(() => {
        update(document);
    }, [document, update]);

    if (import.meta.env.DEV) {
        // console.log(`[DocRenderer] Rendering for template: ${templateName}`, { loading: pdfInstance.loading, blob: !!pdfInstance.blob });
    }

    return (
        <div
            className="relative transition-all duration-300 ease-out origin-top mb-12"
            style={{
                width: `${zoom * 100}%`,
                maxWidth: '100%',
                minHeight: '800px', // Prevent collapse during load
            }}
        >
            <InteractiveOverlay
                cvData={cvData}
                onSelectSection={onSetEditingSection}
                layoutPositions={layoutPositions}
            />

            {pdfInstance.loading ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="animate-spin w-8 h-8 border-2 border-[#9FBFA0] border-t-transparent rounded-full mb-4" />
                </div>
            ) : (
                <PDFCanvasPreview
                    blob={pdfInstance.blob}
                    zoom={zoom}
                />
            )}
        </div>
    );
};
