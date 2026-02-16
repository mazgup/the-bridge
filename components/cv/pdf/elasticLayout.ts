// ============================================================
// Elastic Layout Engine — "The Perfect Fit Algorithm"
// ============================================================
// This is a DETERMINISTIC function. No AI.
// It calculates how much content exists and returns a style
// config that makes everything fit perfectly on the target pages.
//
// CONDENSED: spacing values are tightened to maximise page usage,
// matching professional CV tools like Rezi.ai.
// ============================================================

import { CVData } from '../CVTypes';

export type DensityLevel = "loose" | "normal" | "tight" | "ultra-tight";

export interface StyleConfig {
    fontSize: number;
    headerFontSize: number;
    nameFontSize: number;
    lineHeight: number;
    margins: number;         // in PDF points (72pt = 1 inch)
    sectionSpacing: number;
    bulletSpacing: number;
    entrySpacing: number;
}

// A4 in points: 595.28 x 841.89
const A4_HEIGHT_PT = 841.89;
const A4_WIDTH_PT = 595.28;

/**
 * Count total words across all text fields in the CV
 * Null-safe: handles undefined/partial data gracefully
 */
export function countWords(cvData: CVData): number {
    const content = cvData?.content;
    if (!content) return 0;

    let text = "";

    text += (content.personal?.name || "") + " ";
    text += (content.personal?.contact || []).join(" ") + " ";
    text += (content.summary || "") + " ";

    for (const exp of (content.experience || [])) {
        text += `${exp.company || ""} ${exp.role || ""} ${exp.location || ""} ${exp.date_range || ""} `;
        text += (exp.bullets || []).join(" ") + " ";
    }

    for (const edu of (content.education || [])) {
        text += `${edu.institution || ""} ${edu.qualification || ""} ${edu.date_range || ""} `;
        if (edu.grade) text += edu.grade + " ";
    }

    for (const proj of (content.projects || [])) {
        text += `${proj.name || ""} ${proj.description || ""} `;
        text += (proj.bullets || []).join(" ") + " ";
    }

    for (const group of (content.skills || [])) {
        text += `${group.category || ""} ${(group.items || []).join(" ")} `;
    }

    return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate density based on word count and target pages
 */
export function calculateDensity(cvData: CVData): DensityLevel {
    const wordCount = countWords(cvData);
    const targetPages = cvData?.meta?.target_pages || 1;
    const wordsPerPage = wordCount / targetPages;

    if (wordsPerPage < 250) return "loose";
    if (wordsPerPage < 400) return "normal";
    if (wordsPerPage < 550) return "tight";
    return "ultra-tight";
}

/**
 * Get the style configuration for a density level
 * All values condensed to maximise page real-estate
 */
export function getStyleConfig(density: DensityLevel): StyleConfig {
    switch (density) {
        case "loose":
            return {
                fontSize: 10,
                headerFontSize: 11,
                nameFontSize: 20,
                lineHeight: 1.3,
                margins: 40,          // ~0.55 inch
                sectionSpacing: 8,
                bulletSpacing: 1.5,
                entrySpacing: 6,
            };
        case "normal":
            return {
                fontSize: 9.5,
                headerFontSize: 10.5,
                nameFontSize: 18,
                lineHeight: 1.25,
                margins: 36,          // 0.5 inch
                sectionSpacing: 6,
                bulletSpacing: 1,
                entrySpacing: 5,
            };
        case "tight":
            return {
                fontSize: 9,
                headerFontSize: 10,
                nameFontSize: 17,
                lineHeight: 1.2,
                margins: 32,          // ~0.44 inch
                sectionSpacing: 5,
                bulletSpacing: 0.5,
                entrySpacing: 4,
            };
        case "ultra-tight":
            return {
                fontSize: 8.5,
                headerFontSize: 9.5,
                nameFontSize: 16,
                lineHeight: 1.15,
                margins: 28,          // ~0.39 inch
                sectionSpacing: 4,
                bulletSpacing: 0.5,
                entrySpacing: 3,
            };
    }
}

/**
 * Main entry point: Given CVData, return the StyleConfig to use
 */
export function computeElasticStyle(cvData: CVData): StyleConfig {
    const density = calculateDensity(cvData);
    return getStyleConfig(density);
}

/**
 * Estimate usable height per page (A4 minus top/bottom margins)
 */
export function getUsableHeight(config: StyleConfig): number {
    return A4_HEIGHT_PT - config.margins * 2;
}

/**
 * Estimate usable width (A4 minus left/right margins)
 */
export function getUsableWidth(config: StyleConfig): number {
    return A4_WIDTH_PT - config.margins * 2;
}
