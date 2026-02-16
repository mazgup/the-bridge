import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { CVData } from '../CVTypes';
import { computeElasticStyle, StyleConfig } from './elasticLayout';

// ============================================================
// Modern Impact Template — Tech / Startup / Creative
// ============================================================
// Font: Helvetica (built-in PDF sans-serif)
// Accent: Navy Blue #2C3E50
// Name: Centered, large
// Skills: 2-column grid with tag-style badges
// CONDENSED: minimal whitespace, professional density
// ============================================================

const ACCENT = '#2C3E50';
const ACCENT_LIGHT = '#34495E';
const GRAY = '#7F8C8D';
const LIGHT_BG = '#F2F4F4';

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
            marginBottom: config.sectionSpacing,
            textAlign: 'center',
            borderBottomWidth: 1.5,
            borderBottomColor: ACCENT,
            paddingBottom: 6,
        },
        name: {
            fontSize: config.nameFontSize,
            fontFamily: 'Helvetica-Bold',
            color: ACCENT,
            letterSpacing: 1,
            marginBottom: 2,
        },
        contactRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: config.fontSize - 0.5,
            color: GRAY,
            gap: 4,
        },
        contactSep: {
            color: '#BDC3C7',
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
            borderBottomColor: '#E5E7E9',
            marginBottom: 4,
            paddingBottom: 2,
        },
        // --- ENTRIES ---
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
            fontFamily: 'Helvetica-Bold',
            fontSize: config.fontSize,
            color: '#000000',
        },
        entryRole: {
            fontFamily: 'Helvetica-Bold',
            fontSize: config.fontSize - 0.5,
            color: ACCENT_LIGHT,
            marginBottom: 1,
        },
        entryDate: {
            fontSize: config.fontSize - 1,
            color: GRAY,
        },
        entryLocation: {
            fontSize: config.fontSize - 1,
            color: GRAY,
        },
        // --- BULLETS ---
        bulletList: {
            marginTop: 1,
        },
        bulletItem: {
            flexDirection: 'row',
            marginBottom: config.bulletSpacing,
        },
        bulletPoint: {
            width: 8,
            fontSize: config.fontSize,
            color: ACCENT,
            textAlign: 'center',
        },
        bulletText: {
            flex: 1,
            fontSize: config.fontSize,
            color: '#2C3E50',
        },
        // --- SUMMARY ---
        summaryText: {
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
            color: '#34495E',
        },
        // --- SKILLS (2-column grid with tags) ---
        skillGroupRow: {
            marginBottom: 3,
        },
        skillCategory: {
            fontFamily: 'Helvetica-Bold',
            fontSize: config.fontSize - 0.5,
            color: ACCENT,
            marginBottom: 2,
        },
        skillTagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 3,
        },
        skillTag: {
            fontSize: config.fontSize - 1.5,
            backgroundColor: LIGHT_BG,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 2,
            color: '#2C3E50',
        },
        // --- 2-Column Skills Layout ---
        skillsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        skillsColumn: {
            width: '50%',
            paddingRight: 6,
        },
        // --- LINKS ---
        linkText: {
            fontSize: config.fontSize - 1,
            color: GRAY,
        },
    });

export const ModernImpactPDF: React.FC<TemplateProps> = ({ data, styleOverride }) => {
    const config = styleOverride || computeElasticStyle(data);
    const styles = createStyles(config);
    const content = data?.content;

    // Safety: ensure we have content before rendering
    const personal = content?.personal || { name: '', contact: [], links: [] };
    const contact = personal.contact || [];
    const links = personal.links || [];
    const experience = content?.experience || [];
    const education = content?.education || [];
    const projects = content?.projects || [];
    const skills = content?.skills || [];

    // Split skills into 2 columns
    const midPoint = Math.ceil(skills.length / 2);
    const skillsCol1 = skills.slice(0, midPoint);
    const skillsCol2 = skills.slice(midPoint);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ========== HEADER ========== */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personal.name || 'YOUR NAME'}</Text>
                    <View style={styles.contactRow}>
                        {contact.map((item, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <Text style={styles.contactSep}>•</Text>}
                                <Text>{item}</Text>
                            </React.Fragment>
                        ))}
                    </View>
                    {links.length > 0 && (
                        <View style={[styles.contactRow, { marginTop: 2 }]}>
                            {links.map((link, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <Text style={styles.contactSep}>•</Text>}
                                    <Text style={styles.linkText}>{link.url}</Text>
                                </React.Fragment>
                            ))}
                        </View>
                    )}
                </View>

                {/* ========== SUMMARY ========== */}
                {content?.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.summaryText}>{content.summary}</Text>
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
                                    <Text style={styles.entryRole}>{exp.role}</Text>
                                    <Text style={styles.entryLocation}>{exp.location}</Text>
                                </View>
                                {(exp.bullets || []).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {(exp.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.bulletItem}>
                                                <Text style={styles.bulletPoint}>▸</Text>
                                                <Text style={styles.bulletText}>{bullet}</Text>
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
                                <View style={styles.entryRow}>
                                    <Text style={styles.entryPrimary}>{proj.name}</Text>
                                    {proj.date_range && <Text style={styles.entryDate}>{proj.date_range}</Text>}
                                </View>
                                <Text style={{ fontSize: config.fontSize, marginBottom: 1, color: ACCENT_LIGHT }}>
                                    {proj.description}
                                </Text>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <View style={[styles.skillTagContainer, { marginBottom: 2 }]}>
                                        {proj.technologies.map((tech, j) => (
                                            <Text key={j} style={styles.skillTag}>{tech}</Text>
                                        ))}
                                    </View>
                                )}
                                {(proj.bullets || []).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {(proj.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.bulletItem}>
                                                <Text style={styles.bulletPoint}>▸</Text>
                                                <Text style={styles.bulletText}>{bullet}</Text>
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
                                    <Text style={styles.entryRole}>{edu.qualification}</Text>
                                    {edu.grade && <Text style={styles.entryLocation}>{edu.grade}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ========== SKILLS (2-Column Grid) ========== */}
                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsGrid}>
                            <View style={styles.skillsColumn}>
                                {skillsCol1.map((group, i) => (
                                    <View key={i} style={styles.skillGroupRow}>
                                        <Text style={styles.skillCategory}>{group.category}</Text>
                                        <View style={styles.skillTagContainer}>
                                            {(group.items || []).map((item, j) => (
                                                <Text key={j} style={styles.skillTag}>{item}</Text>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.skillsColumn}>
                                {skillsCol2.map((group, i) => (
                                    <View key={i} style={styles.skillGroupRow}>
                                        <Text style={styles.skillCategory}>{group.category}</Text>
                                        <View style={styles.skillTagContainer}>
                                            {(group.items || []).map((item, j) => (
                                                <Text key={j} style={styles.skillTag}>{item}</Text>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};
