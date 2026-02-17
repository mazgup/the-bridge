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
        ox_page: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            padding: config.margins,
            fontFamily: 'Times-Roman',
            fontSize: 10.5, // Slight increase to fill space better
            lineHeight: 1.6, // More breathing room
            color: '#000000',
        },
        // --- HEADER ---
        ox_header: {
            marginBottom: 20,
            textAlign: 'center',
        },
        ox_name: {
            fontSize: 24, // Rezi Oxford size
            fontFamily: 'Times-Bold',
            // textTransform: 'uppercase', // Removed per user request
            marginBottom: 10, // Adjusted for consistency
            color: '#000000',
        },
        ox_contactRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: 12, // Explicitly larger
            fontFamily: 'Times-Roman', // Explicit font
            fontStyle: 'normal', // Explicit non-italic
            color: '#000000',
            marginTop: 10, // Total gap ~20pt
            marginBottom: 4,
        },
        ox_contactSep: {
            marginHorizontal: 5,
            color: '#000000',
        },
        // --- SECTIONS ---
        ox_section: {
            marginBottom: 10,
        },
        ox_sectionTitle: {
            fontSize: 11,
            fontFamily: 'Times-Bold',
            textTransform: 'uppercase',
            borderBottomWidth: 1, // Solid line
            borderBottomColor: '#000000',
            marginBottom: 8,
            paddingBottom: 2,
            letterSpacing: 0.5,
            marginTop: 5,
        },
        // --- ENTRIES (Experience / Education) ---
        ox_entry: {
            marginBottom: 6,
        },
        ox_entryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 1,
        },
        ox_entryPrimary: {
            fontFamily: 'Times-Bold',
            fontSize: 11, // Slightly larger for company/school
            color: '#000000',
        },
        ox_entrySecondary: {
            fontFamily: 'Times-Italic',
            fontSize: 10,
            color: '#000000',
        },
        ox_entryDate: {
            fontFamily: 'Times-Italic', // Italic dates
            fontSize: 10,
            color: '#000000',
            textAlign: 'right',
        },
        // --- BULLETS ---
        ox_bulletList: {
            marginLeft: 8, // Less indentation
            marginTop: 2,
        },
        ox_bulletItem: {
            flexDirection: 'row',
            marginBottom: 1,
            textAlign: 'justify', // Academic justification
        },
        ox_bulletPoint: {
            width: 10,
            fontSize: 10,
            textAlign: 'center',
        },
        ox_bulletText: {
            flex: 1,
            fontSize: 10,
            lineHeight: 1.4,
        },
        // --- SUMMARY ---
        ox_summaryText: {
            fontSize: 10,
            lineHeight: 1.5,
            textAlign: 'justify',
        },
        // --- SKILLS ---
        ox_skillLine: {
            flexDirection: 'row',
            marginBottom: 2,
        },
        ox_skillCategory: {
            fontFamily: 'Times-Bold',
            fontSize: 10,
            width: 110,
        },
        ox_skillItems: {
            flex: 1,
            fontSize: 10,
        },
        ox_linkText: {
            fontSize: 9,
            color: '#000000',
            textDecoration: 'none',
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

    if (import.meta.env.DEV) {
        console.log('[OxfordStrictPDF] Rendering. Personal Data:', personal);
    }

    return (
        <Document>
            <Page size="A4" style={styles.ox_page}>
                {/* ========== HEADER ========== */}
                <View style={styles.ox_header}>
                    <Text style={styles.ox_name}>{personal.name || 'YOUR NAME'}</Text>
                    <View style={styles.ox_contactRow}>
                        {contact.map((item, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <Text style={styles.ox_contactSep}>|</Text>}
                                <Text>{String(item)}</Text>
                            </React.Fragment>
                        ))}
                    </View>
                    {links.length > 0 && (
                        <View style={[styles.ox_contactRow, { marginTop: 4 }]}>
                            {links.map((link, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <Text style={styles.ox_contactSep}>|</Text>}
                                    <Text style={styles.ox_linkText}>{link.label}: {link.url}</Text>
                                </React.Fragment>
                            ))}
                        </View>
                    )}
                </View>

                {/* ========== SUMMARY ========== */}
                {content?.summary && (
                    <View style={styles.ox_section}>
                        <Text style={styles.ox_sectionTitle}>Professional Summary</Text>
                        {renderFormattedText(content.summary, styles.ox_summaryText, { fontFamily: 'Times-Bold' })}
                    </View>
                )}

                {/* ========== EXPERIENCE ========== */}
                {experience.length > 0 && (
                    <View style={styles.ox_section}>
                        <Text style={styles.ox_sectionTitle}>Experience</Text>
                        {experience.map((exp, i) => (
                            <View key={i} style={styles.ox_entry}>
                                <View style={styles.ox_entryRow}>
                                    <Text style={styles.ox_entryPrimary}>{exp.company}</Text>
                                    <Text style={styles.ox_entryDate}>{exp.date_range}</Text>
                                </View>
                                <View style={styles.ox_entryRow}>
                                    <Text style={styles.ox_entrySecondary}>{exp.role}</Text>
                                    <Text style={styles.ox_entrySecondary}>{exp.location}</Text>
                                </View>
                                {(exp.bullets || []).length > 0 && (
                                    <View style={styles.ox_bulletList}>
                                        {(exp.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.ox_bulletItem} wrap={false}>
                                                <Text style={styles.ox_bulletPoint}>•</Text>
                                                {renderFormattedText(bullet, styles.ox_bulletText, { fontFamily: 'Times-Bold' })}
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
                    <View style={styles.ox_section}>
                        <Text style={styles.ox_sectionTitle}>Projects</Text>
                        {projects.map((proj, i) => (
                            <View key={i} style={styles.ox_entry}>
                                <View style={styles.ox_entryRow}>
                                    <Text style={styles.ox_entryPrimary}>{proj.name}</Text>
                                    {proj.date_range && <Text style={styles.ox_entryDate}>{proj.date_range}</Text>}
                                </View>
                                <Text style={{ fontSize: config.fontSize, marginBottom: 1 }}>{proj.description}</Text>
                                {(proj.bullets || []).length > 0 && (
                                    <View style={styles.ox_bulletList}>
                                        {(proj.bullets || []).map((bullet, j) => (
                                            <View key={j} style={styles.ox_bulletItem}>
                                                <Text style={styles.ox_bulletPoint}>•</Text>
                                                {renderFormattedText(bullet, styles.ox_bulletText, { fontFamily: 'Times-Bold' })}
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
                    <View style={styles.ox_section}>
                        <Text style={styles.ox_sectionTitle}>Education</Text>
                        {education.map((edu, i) => (
                            <View key={i} style={styles.ox_entry}>
                                <View style={styles.ox_entryRow}>
                                    <Text style={styles.ox_entryPrimary}>{edu.institution}</Text>
                                    <Text style={styles.ox_entryDate}>{edu.date_range}</Text>
                                </View>
                                <View style={styles.ox_entryRow}>
                                    <Text style={styles.ox_entrySecondary}>{edu.qualification}</Text>
                                    {edu.grade && <Text style={styles.ox_entrySecondary}>{edu.grade}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ========== SKILLS ========== */}
                {skills.length > 0 && (
                    <View style={styles.ox_section}>
                        <Text style={styles.ox_sectionTitle}>Skills</Text>
                        {skills.map((group, i) => (
                            <View key={i} style={styles.ox_skillLine}>
                                <Text style={styles.ox_skillCategory}>{group.category}:</Text>
                                <Text style={styles.ox_skillItems}>{(group.items || []).join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                )}


                {/* ========== LANGUAGES ========== */}
                {(content.languages || []).length > 0 && (
                    <View style={styles.ox_section}>
                        <Text style={styles.ox_sectionTitle}>Languages</Text>
                        <Text style={styles.ox_summaryText}>
                            {(content.languages || []).join(', ')}
                        </Text>
                    </View>
                )}

                {/* ========== INTERESTS ========== */}
                {(content.interests || []).length > 0 && (
                    <View style={styles.ox_section}>
                        <Text style={styles.ox_sectionTitle}>Interests</Text>
                        <Text style={styles.ox_summaryText}>
                            {(content.interests || []).join(', ')}
                        </Text>
                    </View>
                )}
            </Page>
        </Document>
    );
};
