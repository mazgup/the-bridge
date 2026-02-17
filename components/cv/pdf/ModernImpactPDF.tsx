import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { CVData } from '../CVTypes';
import { computeElasticStyle, StyleConfig } from './elasticLayout';

// ============================================================
// Modern Impact Template (Rezi Style)
// ============================================================
// Font: Helvetica (Standard PDF font)
// Design: Clean, linear, professional.
// Header: High impact, centered.
// Skills: Linear list (Category: Item, Item).
// Experience: Role | Company ..... Date
// ============================================================
// Rezi-inspired Modern Style
// Rezi-inspired Modern Style
const ACCENT = '#2563EB'; // Rezi Blue (Royal/Standard Blue)
const ACCENT_LIGHT = '#2563EB'; // Consistency
const TEXT_MAIN = '#2D3748';
const TEXT_SUB = '#718096';
const GRAY = '#718096';

interface TemplateProps {
    data: CVData;
    styleOverride?: StyleConfig;
}

// Register Roboto Font
// Register Roboto Font
Font.register({
    family: 'Roboto',
    fonts: [
        { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 }, // Bold
        { src: '/fonts/Roboto-Bold.ttf', fontWeight: 900 }, // Black
    ],
});

const createStyles = (config: StyleConfig) =>
    StyleSheet.create({
        page: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            padding: config.margins,
            fontFamily: 'Roboto', // Modern Font
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
            color: '#333333',
        },
        // --- HEADER (Left Aligned for Modern) ---
        header: {
            marginBottom: config.headerBottomMargin,
            paddingBottom: 10,
            borderBottomWidth: 1, // Distinct separation
            borderBottomColor: '#E2E8F0',
            textAlign: 'left', // Ensure Left
        },
        name: {
            fontSize: 30, // Large
            fontFamily: 'Roboto',
            fontWeight: 700, // Explicit bold
            color: ACCENT, // Rezi Blue
            // textTransform: 'uppercase', // Removed per user request
            letterSpacing: -0.5,
            marginBottom: 10, // Adjusted for consistency (was 20)
        },
        contactRow: {
            flexDirection: 'row',
            justifyContent: 'flex-start', // Left align
            flexWrap: 'wrap',
            fontSize: 12, // Explicitly larger
            color: '#4A5568',
            marginBottom: 6,
            marginTop: 10, // Total gap ~20pt
        },
        contactItem: {
            marginRight: 4,
        },
        linkText: {
            color: '#4A5568',
            textDecoration: 'none',
        },
        // --- SECTIONS ---
        section: {
            marginBottom: config.sectionSpacing,
        },
        sectionTitle: {
            fontSize: 11,
            fontFamily: 'Roboto',
            fontWeight: 700,
            color: '#000000', // Black Headers (Rezi Style)
            textTransform: 'uppercase',
            letterSpacing: 1.2, // Wide tracking
            borderBottomWidth: 0,
            marginTop: 10,
            marginBottom: 8,
        },
        // --- ENTRIES ---
        entry: {
            marginBottom: 8,
        },
        entryHeaderRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 2,
        },
        entryLeft: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'baseline',
            flexWrap: 'wrap',
        },
        entryRight: {
            textAlign: 'right',
            fontSize: 9,
            color: '#666666',
            minWidth: 80,
        },
        entryRole: {
            fontFamily: 'Roboto',
            fontWeight: 700,
            fontSize: 10.5,
            color: ACCENT, // Blue Accent for Title
            marginRight: 4,
        },
        entryCompany: {
            fontFamily: 'Roboto',
            fontWeight: 700,
            fontSize: 10.5,
            color: '#000000',
        },
        entryLocation: {
            fontSize: 9,
            color: GRAY,
            marginTop: 1,
            textAlign: 'right',
        },
        // --- BULLETS ---
        bulletList: {
            marginTop: 2,
        },
        bulletItem: {
            flexDirection: 'row',
            marginBottom: 2,
            paddingLeft: 0,
        },
        bulletPoint: {
            width: 10,
            fontSize: 10,
            color: '#000000',
            textAlign: 'left',
            lineHeight: 1.4,
        },
        bulletText: {
            flex: 1,
            fontSize: 10.5,
            color: '#333333',
            lineHeight: 1.4,
        },
        // --- SUMMARY ---
        summaryText: {
            fontSize: 10.5,
            lineHeight: 1.4,
            color: '#333333',
        },
        // --- SKILLS (Linear) ---
        skillLine: {
            flexDirection: 'row',
            marginBottom: 3,
            fontSize: 10.5,
            lineHeight: 1.4,
        },
        skillCategory: {
            fontFamily: 'Roboto',
            fontWeight: 700,
            color: '#000000',
            width: 120,
            marginRight: 4,
        },
        skillList: {
            flex: 1,
            color: '#333333',
        },
    });

// Helper to render text with **bold** formatting
const renderFormattedText = (text: string | undefined, style: any, boldStyle: any) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <Text style={style}>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <Text key={i} style={boldStyle}>
                            {part.slice(2, -2)}
                        </Text>
                    );
                }
                return <Text key={i}>{part}</Text>;
            })}
        </Text>
    );
};

export const ModernImpactPDF: React.FC<TemplateProps> = ({ data, styleOverride }) => {
    const config = styleOverride || computeElasticStyle(data);
    const styles = createStyles(config);
    const content = data?.content;

    // Safety
    const personal = content?.personal || { name: '', contact: [], links: [] };
    // Defensive: ensure contact items are always flat strings (AI may send {type, value} objects)
    const contact = (personal.contact || []).map((item: any) =>
        typeof item === 'string' ? item : (item?.value || item?.label || item?.text || '')
    ).filter(Boolean);
    const links = personal.links || [];
    const experience = content?.experience || [];
    const education = content?.education || [];
    const projects = content?.projects || [];
    const skills = content?.skills || [];

    if (import.meta.env.DEV) {
        console.log('[ModernImpactPDF] Rendering. Personal Data:', personal);
    }

    // Helper to join items with pipe
    const ContactLine = ({ items }: { items: string[] }) => (
        <View style={styles.contactRow}>
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <Text style={{ marginHorizontal: 4, color: '#BDC3C7' }}>|</Text>}
                    <Text>{String(item)}</Text>
                </React.Fragment>
            ))}
        </View>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ========== HEADER ========== */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personal.name || 'YOUR NAME'}</Text>

                    <View style={styles.contactRow}>
                        {contact.map((item, i) => (
                            <Text key={i} style={styles.contactItem}>
                                {i > 0 && <Text style={{ color: '#BDC3C7' }}> | </Text>}
                                {String(item)}
                            </Text>
                        ))}
                    </View>

                    {links.length > 0 && (
                        <View style={styles.contactRow}>
                            {links.map((link, i) => (
                                <Text key={i} style={styles.linkText}>
                                    {i > 0 && <Text style={{ color: '#BDC3C7' }}> | </Text>}
                                    {link.url}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* ========== SUMMARY ========== */}
                {content?.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        {renderFormattedText(content.summary, styles.summaryText, { fontFamily: 'Roboto', fontWeight: 700 })}
                    </View>
                )}

                {/* ========== EXPERIENCE ========== */}
                {experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {experience.map((exp, i) => (
                            <View key={i} style={styles.entry}>
                                {/* Header Row: Role | Company ... Date */}
                                <View style={styles.entryHeaderRow}>
                                    <View style={styles.entryLeft}>
                                        <Text style={styles.entryRole}>{exp.role}</Text>
                                        {exp.company && (
                                            <>
                                                <Text style={{ marginHorizontal: 4, color: '#BDC3C7' }}>|</Text>
                                                <Text style={styles.entryCompany}>{exp.company}</Text>
                                            </>
                                        )}
                                    </View>
                                    <View>
                                        <Text style={styles.entryRight}>{exp.date_range}</Text>
                                        {exp.location && <Text style={styles.entryLocation}>{exp.location}</Text>}
                                    </View>
                                </View>

                                {/* Bullets */}
                                {(exp.bullets || []).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {(exp.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.bulletItem} wrap={false}>
                                                <Text style={styles.bulletPoint}>•</Text>
                                                {renderFormattedText(bullet, styles.bulletText, { fontFamily: 'Roboto', fontWeight: 700 })}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ========== PROJECTS ========== */}
                {projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((proj, i) => (
                            <View key={i} style={styles.entry}>
                                <View style={styles.entryHeaderRow}>
                                    <Text style={styles.entryRole}>{proj.name}</Text>
                                    {proj.date_range && <Text style={styles.entryRight}>{proj.date_range}</Text>}
                                </View>
                                <Text style={{ fontSize: config.fontSize, marginBottom: 2, color: ACCENT_LIGHT }}>
                                    {proj.description}
                                </Text>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <Text style={{ fontSize: config.fontSize - 1, color: GRAY, marginBottom: 2 }}>
                                        <Text style={{ fontFamily: 'Roboto', fontWeight: 700, color: '#000000' }}>Stack: </Text>
                                        {proj.technologies.join(', ')}
                                    </Text>
                                )}
                                {(proj.bullets || []).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {(proj.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.bulletItem}>
                                                <Text style={styles.bulletPoint}>•</Text>
                                                {renderFormattedText(bullet, styles.bulletText, { fontFamily: 'Helvetica-Bold' })}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ========== EDUCATION ========== */}
                {education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map((edu, i) => (
                            <View key={i} style={styles.entry}>
                                <View style={styles.entryHeaderRow}>
                                    <View style={styles.entryLeft}>
                                        <Text style={styles.entryRole}>{edu.qualification}</Text>
                                        {edu.institution && (
                                            <>
                                                <Text style={{ marginHorizontal: 4, color: '#BDC3C7' }}>|</Text>
                                                <Text style={styles.entryCompany}>{edu.institution}</Text>
                                            </>
                                        )}
                                    </View>
                                    <Text style={styles.entryRight}>{edu.date_range}</Text>
                                </View>
                                {edu.grade && (
                                    <Text style={{ fontSize: config.fontSize - 1, color: GRAY, marginTop: 1 }}>{edu.grade}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ========== SKILLS (Linear List) ========== */}
                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View>
                            {skills.map((group, i) => (
                                <View key={i} style={styles.skillLine}>
                                    {group.category && group.category !== 'General' && (
                                        <Text style={styles.skillCategory}>{group.category}:</Text>
                                    )}
                                    <Text style={styles.skillList}>
                                        {(group.items || []).join(', ')}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ========== LANGUAGES ========== */}
                {(content.languages || []).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <Text style={styles.summaryText}>
                            {(content.languages || []).join(', ')}
                        </Text>
                    </View>
                )}

                {/* ========== INTERESTS ========== */}
                {(content.interests || []).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Interests</Text>
                        <Text style={styles.summaryText}>
                            {(content.interests || []).join(', ')}
                        </Text>
                    </View>
                )}
            </Page>
        </Document>
    );
};
