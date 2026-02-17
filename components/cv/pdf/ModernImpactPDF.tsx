import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
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

const ACCENT = '#2C3E50';
const ACCENT_LIGHT = '#34495E';
const GRAY = '#7F8C8D';

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
            fontFamily: 'Helvetica',
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
            color: '#2C3E50',
        },
        // --- HEADER ---
        header: {
            marginBottom: config.headerBottomMargin,
            textAlign: 'center',
        },
        name: {
            fontSize: config.nameFontSize,
            fontFamily: 'Helvetica-Bold', // Standard Bold
            color: ACCENT,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 8,
        },
        contactRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: config.fontSize - 0.5,
            color: '#000000', // Rezi uses darker text for contact usually
            gap: 0,
        },
        contactItem: {
            marginHorizontal: 4,
        },
        contactSep: {
            color: '#BDC3C7',
        },
        linkText: {
            color: '#2980B9', // Blue links? Or stick to Black? Rezi often black. Keeping gray/blue.
            textDecoration: 'none',
        },
        // --- SECTIONS ---
        section: {
            marginBottom: config.sectionSpacing,
        },
        sectionTitle: {
            fontSize: config.headerFontSize,
            fontFamily: 'Helvetica-Bold',
            color: ACCENT,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            borderBottomWidth: 1,
            borderBottomColor: '#BDC3C7', // Specific gray line
            marginBottom: 8,
            paddingBottom: 2,
        },
        // --- ENTRIES ---
        entry: {
            marginBottom: config.entrySpacing,
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
            fontSize: config.fontSize - 0.5,
            color: '#000000',
            minWidth: 80,
        },
        entryRole: {
            fontFamily: 'Helvetica-Bold',
            fontSize: config.fontSize,
            color: '#000000',
        },
        entryCompany: {
            fontFamily: 'Helvetica',
            fontSize: config.fontSize,
            color: '#000000',
        },
        entryLocation: {
            fontSize: config.fontSize - 1,
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
            marginBottom: config.bulletSpacing,
            paddingLeft: 0,
        },
        bulletPoint: {
            width: 10,
            fontSize: config.fontSize,
            color: '#000000',
            textAlign: 'left',
            lineHeight: config.lineHeight,
        },
        bulletText: {
            flex: 1,
            fontSize: config.fontSize,
            color: '#2C3E50',
            lineHeight: config.lineHeight,
        },
        // --- SUMMARY ---
        summaryText: {
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
            color: '#2C3E50',
        },
        // --- SKILLS (Linear) ---
        skillLine: {
            flexDirection: 'row',
            marginBottom: 3,
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
        },
        skillCategory: {
            fontFamily: 'Helvetica-Bold',
            color: '#000000',
            width: 120, // Fixed width for category label? Or just inline? Rezi is inline usually.
            // Screenshot 4 suggests: "Category" on left? Or inline? 
            // "Advanced Bid Writing..." looks like just a list?
            // "Skills" title -> then lines.
            // I'll make it bold prefix.
            marginRight: 4,
        },
        skillList: {
            flex: 1,
            color: '#2C3E50',
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

                    <ContactLine items={contact} />

                    {links.length > 0 && (
                        <View style={{ marginTop: 2 }}>
                            <View style={styles.contactRow}>
                                {links.map((link, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <Text style={{ marginHorizontal: 4, color: '#BDC3C7' }}>|</Text>}
                                        <Text style={styles.linkText}>{link.url}</Text>
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* ========== SUMMARY ========== */}
                {content?.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        {renderFormattedText(content.summary, styles.summaryText, { fontFamily: 'Helvetica-Bold' })}
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
                                        <Text style={{ fontFamily: 'Helvetica-Bold', color: '#000000' }}>Stack: </Text>
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
            </Page>
        </Document>
    );
};
