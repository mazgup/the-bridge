import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFCanvasPreviewProps {
    blob: Blob | null;
    zoom: number;
}

export const PDFCanvasPreview: React.FC<PDFCanvasPreviewProps> = ({ blob, zoom }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<JSX.Element[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!blob) {
            console.log('[PDFCanvasPreview] No blob provided');
            return;
        }

        console.log('[PDFCanvasPreview] Received blob:', blob.size, blob.type);
        let isCancelled = false;

        // Reset pages on new blob
        setPages([]);
        setError(null);

        const renderPages = async () => {
            try {
                const url = URL.createObjectURL(blob);
                console.log('[PDFCanvasPreview] Created URL:', url);

                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                console.log('[PDFCanvasPreview] PDF Loaded, Pages:', pdf.numPages);

                const pageElements: JSX.Element[] = [];

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pageElements.push(
                        <PDFPageCanvas
                            key={`page-${pageNum}-${zoom}`}
                            pdf={pdf}
                            pageNum={pageNum}
                            zoom={zoom}
                        />
                    );
                }

                if (!isCancelled) {
                    console.log('[PDFCanvasPreview] Setting pages:', pageElements.length);
                    setPages(pageElements);
                    setError(null);
                }
            } catch (err: any) {
                console.error('[PDFCanvasPreview] Render Error:', err);
                if (!isCancelled) setError(err.message || 'Failed to render PDF');
            }
        };

        renderPages();

        return () => {
            isCancelled = true;
        };
    }, [blob, zoom]);

    if (error) {
        return <div className="text-red-500 p-4">Error loading preview: {error}</div>;
    }

    return (
        <div ref={containerRef} className="flex flex-col w-full">
            {pages}
        </div>
    );
};

// Sub-component for individual page rendering
const PDFPageCanvas: React.FC<{ pdf: any, pageNum: number, zoom: number }> = ({ pdf, pageNum, zoom }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        let renderTask: any;
        let isCancelled = false;

        const render = async () => {
            try {
                const page = await pdf.getPage(pageNum);
                if (isCancelled) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                // pixelRatio for high DPI
                const pixelRatio = window.devicePixelRatio || 1;
                const viewport = page.getViewport({ scale: zoom * pixelRatio });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Adjust CSS size to match zoom - CHANGED to 100% to fit container
                // The container width is controlled by the zoom prop in UnifiedBuilder
                // This ensures the canvas never overflows the container
                canvas.style.width = '100%';
                canvas.style.height = 'auto';

                // If a previous task is somehow still running (should be handled by cancel, but good to check)
                // actually pdf.js throws if we reuse canvas. cancel() *should* handle it.

                renderTask = page.render({
                    canvasContext: context,
                    viewport: viewport,
                });

                await renderTask.promise;
            } catch (err: any) {
                if (isCancelled || err.name === 'RenderingCancelledException') {
                    // Ignore cancellation errors
                    return;
                }
                console.error('[PDFPageCanvas] Page Render Error:', err);
                setRenderError(err.message || 'Error rendering page');
            }
        };

        setRenderError(null); // Reset error on new render attempt
        render();

        return () => {
            isCancelled = true;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [pdf, pageNum, zoom]);

    if (renderError) {
        return (
            <div className="w-full h-[800px] flex items-center justify-center bg-red-50 text-red-500 border border-red-200">
                {renderError}
            </div>
        );
    }

    return (
        <div className="relative w-full shadow-lg mb-8 min-h-[500px] bg-white">
            {/* The "Paper" */}
            <canvas
                ref={canvasRef}
                className="bg-white block w-full h-full"
                style={{ objectFit: 'contain' }}
            />
        </div>
    );
};
