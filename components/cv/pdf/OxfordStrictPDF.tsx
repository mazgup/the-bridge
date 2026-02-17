import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { CVData } from '../CVTypes';
import { computeElasticStyle, StyleConfig } from './elasticLayout';

// ============================================================
// Oxford Strict Template — Finance / Law / Corporate
// ============================================================
// Font: Times-Roman (built-in PDF serif)
// Colors: Black & White ONLY
// Headers: UPPERCASE, Bold, 1pt black bottom border
// Dates: Right-aligned
// CONDENSED: minimal whitespace, professional density
// ============================================================

interface TemplateProps {
    data: CVData;
    styleOverride?: StyleConfig;
}

const createStyles = (config: StyleConfig) =>
    StyleSheet.create({
        page: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            padding: config.margins,
            fontFamily: 'Times-Roman',
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
            color: '#000000',
        },
        // --- HEADER ---
        header: {
            marginBottom: config.headerBottomMargin,
            textAlign: 'center',
        },
        name: {
            fontSize: config.nameFontSize,
            fontFamily: 'Times-Bold',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 12,
        },
        contactRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: config.fontSize - 0.5,
            color: '#333333',
            gap: 3,
        },
        contactSep: {
            marginHorizontal: 2,
            color: '#666',
        },
        // --- SECTIONS ---
        section: {
            marginBottom: config.sectionSpacing,
        },
        sectionTitle: {
            fontSize: config.headerFontSize,
            fontFamily: 'Times-Bold',
            textTransform: 'uppercase',
            borderBottomWidth: 0.75,
            borderBottomColor: '#000000',
            marginBottom: 4,
            paddingBottom: 1,
            letterSpacing: 0.8,
        },
        // --- ENTRIES (Experience / Education) ---
        entry: {
            marginBottom: config.entrySpacing,
        },
        entryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 0,
        },
        entryPrimary: {
            fontFamily: 'Times-Bold',
            fontSize: config.fontSize,
        },
        entrySecondary: {
            fontFamily: 'Times-Italic',
            fontSize: config.fontSize,
        },
        entryDate: {
            fontFamily: 'Times-Italic',
            fontSize: config.fontSize - 0.5,
            color: '#333',
        },
        // --- BULLETS ---
        bulletList: {
            marginLeft: 10,
            marginTop: 1,
        },
        bulletItem: {
            flexDirection: 'row',
            marginBottom: config.bulletSpacing,
        },
        bulletPoint: {
            width: 8,
            fontSize: config.fontSize,
        },
        bulletText: {
            flex: 1,
            fontSize: config.fontSize,
        },
        // --- SUMMARY ---
        summaryText: {
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
        },
        // --- SKILLS ---
        skillLine: {
            flexDirection: 'row',
            marginBottom: 1,
        },
        skillCategory: {
            fontFamily: 'Times-Bold',
            fontSize: config.fontSize,
            width: 120,
        },
        skillItems: {
            flex: 1,
            fontSize: config.fontSize,
        },
        linkText: {
            fontSize: config.fontSize - 1,
            color: '#333',
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

export const OxfordStrictPDF: React.FC<TemplateProps> = ({ data, styleOverride }) => {
    const config = styleOverride || computeElasticStyle(data);
    const styles = createStyles(config);
    const content = data?.content;

    // Safety: ensure we have content before rendering
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

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ========== HEADER ========== */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personal.name || 'YOUR NAME'}</Text>
                    <View style={styles.contactRow}>
                        {contact.map((item, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <Text style={styles.contactSep}>|</Text>}
                                <Text>{String(item)}</Text>
                            </React.Fragment>
                        ))}
                    </View>
                    {links.length > 0 && (
                        <View style={[styles.contactRow, { marginTop: 1 }]}>
                            {links.map((link, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <Text style={styles.contactSep}>|</Text>}
                                    <Text style={styles.linkText}>{link.label}: {link.url}</Text>
                                </React.Fragment>
                            ))}
                        </View>
                    )}
                </View>

                {/* ========== SUMMARY ========== */}
                {content?.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        {renderFormattedText(content.summary, styles.summaryText, { fontFamily: 'Times-Bold' })}
                    </View>
                )}

                {/* ========== EXPERIENCE ========== */}
                {experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {experience.map((exp, i) => (
                            <View key={i} style={styles.entry}>
                                <View style={styles.entryRow}>
                                    <Text style={styles.entryPrimary}>{exp.company}</Text>
                                    <Text style={styles.entryDate}>{exp.date_range}</Text>
                                </View>
                                <View style={styles.entryRow}>
                                    <Text style={styles.entrySecondary}>{exp.role}</Text>
                                    <Text style={styles.entrySecondary}>{exp.location}</Text>
                                </View>
                                {(exp.bullets || []).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {(exp.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.bulletItem}>
                                                <Text style={styles.bulletPoint}>•</Text>
                                                {renderFormattedText(bullet, styles.bulletText, { fontFamily: 'Times-Bold' })}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ========== PROJECTS (if present) ========== */}
                {projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((proj, i) => (
                            <View key={i} style={styles.entry}>
                                <View style={styles.entryRow}>
                                    <Text style={styles.entryPrimary}>{proj.name}</Text>
                                    {proj.date_range && <Text style={styles.entryDate}>{proj.date_range}</Text>}
                                </View>
                                <Text style={{ fontSize: config.fontSize, marginBottom: 1 }}>{proj.description}</Text>
                                {(proj.bullets || []).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {(proj.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.bulletItem}>
                                                <Text style={styles.bulletPoint}>•</Text>
                                                {renderFormattedText(bullet, styles.bulletText, { fontFamily: 'Times-Bold' })}
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
                                <View style={styles.entryRow}>
                                    <Text style={styles.entryPrimary}>{edu.institution}</Text>
                                    <Text style={styles.entryDate}>{edu.date_range}</Text>
                                </View>
                                <View style={styles.entryRow}>
                                    <Text style={styles.entrySecondary}>{edu.qualification}</Text>
                                    {edu.grade && <Text style={styles.entrySecondary}>{edu.grade}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ========== SKILLS ========== */}
                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        {skills.map((group, i) => (
                            <View key={i} style={styles.skillLine}>
                                <Text style={styles.skillCategory}>{group.category}:</Text>
                                <Text style={styles.skillItems}>{(group.items || []).join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};
