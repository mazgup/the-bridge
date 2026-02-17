// ============================================================
// Elastic Layout Engine — "The Perfect Fit Algorithm" v2
// ============================================================
// Given CVData, estimates how much vertical space the content
// occupies on A4, then distributes remaining space proportionally
// across sections, entries, and bullets so the page is FULL.
//
// No AI. Pure math.
// ============================================================

import { CVData } from '../CVTypes';

export type DensityLevel =
    | "spacious" | "loose" | "relaxed" | "normal"
    | "compact" | "tight" | "very-tight" | "dense";

export interface StyleConfig {
    fontSize: number;
    headerFontSize: number;
    nameFontSize: number;
    lineHeight: number;
    margins: number;         // in PDF points (72pt = 1 inch)
    sectionSpacing: number;
    bulletSpacing: number;
    entrySpacing: number;
    headerBottomMargin: number;
}

// A4 in points: 595.28 x 841.89
const A4_HEIGHT_PT = 841.89;
const A4_WIDTH_PT = 595.28;

// ============================================================
// Content Measurement
// ============================================================

/** Count total words across all text fields */
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

/** Count structural elements to estimate line counts */
function countStructure(cvData: CVData) {
    const c = cvData?.content;
    if (!c) return { sections: 0, entries: 0, bulletLines: 0, textLines: 0, hasName: false, contactItems: 0, hasLinks: false };

    const hasName = !!(c.personal?.name);
    const contactItems = (c.personal?.contact || []).length;
    const hasLinks = (c.personal?.links || []).length > 0;

    let sections = 0;
    let entries = 0;
    let bulletLines = 0;
    let textLines = 0;

    // Summary
    if (c.summary) {
        sections++;
        // Estimate lines from word count (roughly 12 words per line at 9.5pt on A4)
        const summaryWords = c.summary.split(/\s+/).filter(Boolean).length;
        textLines += Math.ceil(summaryWords / 12);
    }

    // Experience
    if ((c.experience || []).length > 0) {
        sections++;
        for (const exp of c.experience) {
            entries++;
            // Header line (company + role + date)
            textLines += 1;
            // Location line
            if (exp.location) textLines += 1;
            // Bullets
            for (const bullet of (exp.bullets || [])) {
                const words = bullet.split(/\s+/).filter(Boolean).length;
                bulletLines += Math.ceil(words / 12); // wrapping estimate
            }
        }
    }

    // Education
    if ((c.education || []).length > 0) {
        sections++;
        for (const edu of c.education) {
            entries++;
            textLines += 1; // institution + qual line
            if (edu.grade) textLines += 1;
        }
    }

    // Projects
    if ((c.projects || []).length > 0) {
        sections++;
        for (const proj of c.projects) {
            entries++;
            textLines += 1; // name + date line
            if (proj.description) {
                const words = proj.description.split(/\s+/).filter(Boolean).length;
                textLines += Math.ceil(words / 12);
            }
            for (const bullet of (proj.bullets || [])) {
                const words = bullet.split(/\s+/).filter(Boolean).length;
                bulletLines += Math.ceil(words / 12);
            }
        }
    }

    // Skills
    if ((c.skills || []).length > 0) {
        sections++;
        for (const group of c.skills) {
            entries++;
            // Estimate: category + items on one or two lines
            const itemWords = (group.items || []).join(", ").split(/\s+/).filter(Boolean).length;
            textLines += Math.max(1, Math.ceil(itemWords / 10));
        }
    }

    return { sections, entries, bulletLines, textLines, hasName, contactItems, hasLinks };
}

// ============================================================
// The Core Algorithm
// ============================================================

// ============================================================
// The Core Algorithm — Iterative Best Fit
// ============================================================

const PRESETS: StyleConfig[] = [
    { fontSize: 11, headerFontSize: 13, nameFontSize: 24, lineHeight: 1.45, margins: 55, sectionSpacing: 24, bulletSpacing: 6, entrySpacing: 14, headerBottomMargin: 30 },
    { fontSize: 10.5, headerFontSize: 12, nameFontSize: 22, lineHeight: 1.4, margins: 50, sectionSpacing: 18, bulletSpacing: 4, entrySpacing: 12, headerBottomMargin: 24 },
    { fontSize: 10, headerFontSize: 11.5, nameFontSize: 20, lineHeight: 1.35, margins: 40, sectionSpacing: 9, bulletSpacing: 2.5, entrySpacing: 7, headerBottomMargin: 16 },
    { fontSize: 9.5, headerFontSize: 11, nameFontSize: 18, lineHeight: 1.3, margins: 36, sectionSpacing: 10, bulletSpacing: 2, entrySpacing: 6, headerBottomMargin: 12 }, // Normal
    { fontSize: 9.25, headerFontSize: 10.5, nameFontSize: 17, lineHeight: 1.25, margins: 34, sectionSpacing: 7, bulletSpacing: 1.5, entrySpacing: 5, headerBottomMargin: 10 },
    { fontSize: 9, headerFontSize: 10, nameFontSize: 16, lineHeight: 1.2, margins: 32, sectionSpacing: 6, bulletSpacing: 1, entrySpacing: 4, headerBottomMargin: 8 },
    { fontSize: 8.75, headerFontSize: 9.5, nameFontSize: 15, lineHeight: 1.15, margins: 30, sectionSpacing: 5, bulletSpacing: 0.5, entrySpacing: 3, headerBottomMargin: 6 },
    { fontSize: 8.5, headerFontSize: 9, nameFontSize: 14, lineHeight: 1.1, margins: 25, sectionSpacing: 4, bulletSpacing: 0.25, entrySpacing: 2, headerBottomMargin: 4 }, // Dense
    { fontSize: 8, headerFontSize: 9, nameFontSize: 14, lineHeight: 1.1, margins: 20, sectionSpacing: 3, bulletSpacing: 0, entrySpacing: 2, headerBottomMargin: 4 }, // Ultra-Dense (Emergency)
];

/** Estimate height of content using a specific configuration */
function estimateHeight(structure: ReturnType<typeof countStructure>, config: StyleConfig): number {
    const lineHeightPt = config.fontSize * config.lineHeight;

    let h = 0;

    // Header
    if (structure.hasName) h += config.nameFontSize * 1.3;
    if (structure.contactItems > 0) h += config.fontSize * 1.5;
    if (structure.hasLinks) h += config.fontSize * 1.3;
    h += config.headerBottomMargin;

    // Sections
    const sectionTitleHeight = config.headerFontSize * 1.5 + 5;
    h += structure.sections * sectionTitleHeight;

    // Text & Bullets
    h += structure.textLines * lineHeightPt;
    h += structure.bulletLines * lineHeightPt;

    // Spacing
    h += structure.sections * config.sectionSpacing;
    h += structure.entries * config.entrySpacing;
    h += structure.bulletLines * config.bulletSpacing;

    return h;
}

/**
 * Iteratively find the best layout that fits the target page count.
 * Starts from "Spacious" and shrinks until it fits.
 */
export function computeElasticStyle(cvData: CVData): StyleConfig {
    const structure = countStructure(cvData);
    const targetPages = cvData?.meta?.target_pages || 1;

    // 1. Iterative Fit: Find the first preset that fits.
    // If targetPages=1, we stop as soon as height <= A4_HEIGHT.
    // If targetPages=2, we stop as soon as height <= 2 * A4_HEIGHT.

    let bestConfig = PRESETS[PRESETS.length - 1]; // Default to densest if nothing fits
    let minOverflow = Infinity;

    // Start with Spacious (Index 0) -> Dense (Index N)
    for (const config of PRESETS) {
        const usableHeight = (A4_HEIGHT_PT - config.margins * 2) * targetPages;
        const totalHeight = estimateHeight(structure, config);

        if (totalHeight <= usableHeight) {
            // It fits!
            bestConfig = config;
            break;
        }

        // Track the "least bad" option in case absolutely nothing fits
        const overflow = totalHeight - usableHeight;
        if (overflow < minOverflow) {
            minOverflow = overflow;
            bestConfig = config; // Keep the one closest to fitting
        }
    }

    // 2. Refine: Distribute any extra space if we have a fit
    // This phase expands the layout back comfortably if we picked a preset that is *too* small.
    // E.g. if "Normal" overflowed but "Compact" left 40% empty space, we expand "Compact" slightly.

    const finalUsableHeight = (A4_HEIGHT_PT - bestConfig.margins * 2) * targetPages;
    const finalContentHeight = estimateHeight(structure, bestConfig);
    const extraSpace = Math.max(0, finalUsableHeight - finalContentHeight);

    // Distribution Weights
    const sectionSlots = Math.max(1, structure.sections);
    const entrySlots = Math.max(1, structure.entries);
    const bulletSlots = Math.max(1, structure.bulletLines);

    const headerWeight = 3;
    const sectionWeight = 4;
    const entryWeight = 2;
    const bulletWeight = 1;

    const totalWeight = headerWeight + (sectionSlots * sectionWeight) + (entrySlots * entryWeight) + (bulletSlots * bulletWeight);
    const pointsPerWeight = extraSpace / Math.max(1, totalWeight);

    // Expansion limits (don't make it look absurdly spaced out)
    const isMultiPage = targetPages > 1;
    const MAX_HEADER_MARGIN = isMultiPage ? 80 : 40;
    const MAX_SECTION_SPACING = isMultiPage ? 60 : 30;
    const MAX_ENTRY_SPACING = isMultiPage ? 30 : 16;
    const MAX_BULLET_SPACING = isMultiPage ? 12 : 6;

    return {
        ...bestConfig,
        headerBottomMargin: Math.min(MAX_HEADER_MARGIN, bestConfig.headerBottomMargin + pointsPerWeight * headerWeight),
        sectionSpacing: Math.min(MAX_SECTION_SPACING, bestConfig.sectionSpacing + pointsPerWeight * sectionWeight),
        entrySpacing: Math.min(MAX_ENTRY_SPACING, bestConfig.entrySpacing + pointsPerWeight * entryWeight),
        bulletSpacing: Math.min(MAX_BULLET_SPACING, bestConfig.bulletSpacing + pointsPerWeight * bulletWeight),
    };
}

// Legacy exports for compatibility
export function calculateDensity(cvData: CVData): DensityLevel {
    const wordCount = countWords(cvData);
    const targetPages = cvData?.meta?.target_pages || 1;
    const wordsPerPage = wordCount / targetPages;

    if (wordsPerPage < 200) return "spacious";
    if (wordsPerPage < 300) return "loose";
    if (wordsPerPage < 400) return "relaxed";
    if (wordsPerPage < 500) return "normal";
    if (wordsPerPage < 600) return "compact";
    if (wordsPerPage < 700) return "tight";
    if (wordsPerPage < 800) return "very-tight";
    return "dense";
}

export function getStyleConfig(density: DensityLevel): StyleConfig {
    // This is kept for backward compat but the main path now uses computeElasticStyle
    switch (density) {
        case "spacious": return { fontSize: 11, headerFontSize: 13, nameFontSize: 24, lineHeight: 1.5, margins: 55, sectionSpacing: 24, bulletSpacing: 6, entrySpacing: 14, headerBottomMargin: 30 };
        case "loose": return { fontSize: 10.5, headerFontSize: 12, nameFontSize: 22, lineHeight: 1.4, margins: 50, sectionSpacing: 18, bulletSpacing: 4, entrySpacing: 12, headerBottomMargin: 24 };
        case "relaxed": return { fontSize: 10, headerFontSize: 11.5, nameFontSize: 20, lineHeight: 1.35, margins: 40, sectionSpacing: 9, bulletSpacing: 2.5, entrySpacing: 7, headerBottomMargin: 16 };
        case "normal": return { fontSize: 9.5, headerFontSize: 11, nameFontSize: 18, lineHeight: 1.3, margins: 36, sectionSpacing: 10, bulletSpacing: 2, entrySpacing: 6, headerBottomMargin: 12 };
        case "compact": return { fontSize: 9.25, headerFontSize: 10.5, nameFontSize: 17, lineHeight: 1.25, margins: 34, sectionSpacing: 7, bulletSpacing: 1.5, entrySpacing: 5, headerBottomMargin: 10 };
        case "tight": return { fontSize: 9, headerFontSize: 10, nameFontSize: 16, lineHeight: 1.2, margins: 32, sectionSpacing: 6, bulletSpacing: 1, entrySpacing: 4, headerBottomMargin: 8 };
        case "very-tight": return { fontSize: 8.75, headerFontSize: 9.5, nameFontSize: 15, lineHeight: 1.15, margins: 30, sectionSpacing: 5, bulletSpacing: 0.5, entrySpacing: 3, headerBottomMargin: 6 };
        case "dense": return { fontSize: 8.5, headerFontSize: 9, nameFontSize: 14, lineHeight: 1.1, margins: 28, sectionSpacing: 4, bulletSpacing: 0.25, entrySpacing: 2, headerBottomMargin: 4 };
    }
}

/** Estimate usable height per page (A4 minus top/bottom margins) */
export function getUsableHeight(config: StyleConfig): number {
    return A4_HEIGHT_PT - config.margins * 2;
}

/** Estimate usable width (A4 minus left/right margins) */
export function getUsableWidth(config: StyleConfig): number {
    return A4_WIDTH_PT - config.margins * 2;
}
