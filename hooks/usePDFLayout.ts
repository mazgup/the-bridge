import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Vite-compatible worker import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export type SectionPositions = Record<string, number>;

export const usePDFLayout = (pdfBlob: Blob | null) => {
    const [positions, setPositions] = useState<SectionPositions>({});
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        if (!pdfBlob) return;

        const calculateLayout = async () => {
            setIsCalculating(true);
            try {
                const arrayBuffer = await pdfBlob.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await doc.getPage(1); // Assuming page 1 for now, or we can scan all pages
                const textContent = await page.getTextContent();

                if (import.meta.env.DEV) {
                    console.log("PDF Text Content Items:", textContent.items.map((i: any) => i.str));
                }

                const foundPositions: SectionPositions = {
                    contact: 5, // Default top
                };

                // Helper to normalize text for searching
                const normalize = (str: string) => str.trim().toUpperCase();

                // Keywords to look for (Must match the Template's section titles)
                const KEYWORDS: Record<string, string> = {
                    'summary': 'SUMMARY', // or PROFESSIONAL SUMMARY
                    'experience': 'EXPERIENCE',
                    'education': 'EDUCATION',
                    'skills': 'SKILLS',
                    'projects': 'PROJECTS'
                };

                // The PDF coordinate system starts from Bottom-Left usually.
                // We need to invert it based on viewport height.
                const viewport = page.getViewport({ scale: 1.0 });
                const pageHeight = viewport.height;

                textContent.items.forEach((item: any) => {
                    const str = normalize(item.str);
                    const transform = item.transform; // [scaleX, skewY, skewX, scaleY, x, y]
                    const y = transform[5]; // The Y coordinate (from bottom in PDF usually)

                    // Check if this item matches a section header
                    Object.entries(KEYWORDS).forEach(([key, keyword]) => {
                        if (str === keyword || str === keyword + ':') {
                            if (import.meta.env.DEV) console.log(`[Layout] Found section: ${key} at Y=${y}`);

                            // Convert PDF Y (bottom-up) to CSS Top % (top-down)
                            // PDF Y=0 is bottom. Y=Height is top.
                            // calculatedTop = (PageHeight - Y) / PageHeight
                            const topPercent = (1 - (y / pageHeight)) * 100;

                            // Only set if not already set (find the first occurrence)
                            if (!foundPositions[key]) {
                                foundPositions[key] = topPercent;
                            }
                        }
                    });
                });

                if (Object.keys(foundPositions).length > 1) {
                    setPositions(foundPositions);
                }

            } catch (err) {
                console.error("Layout analysis failed:", err);
            } finally {
                setIsCalculating(false);
            }
        };

        calculateLayout();
    }, [pdfBlob]);

    return { positions, isCalculating };
};
