"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReturnRoadmap = exports.getFlexSimulationResponse = exports.getFlexSimulationStart = exports.evaluateFlexRequest = exports.getNegotiationRebuttal = exports.generateInterviewCheatSheet = exports.analyzeInterviewAnswer = exports.getNextInterviewQuestion = exports.startInterviewSimulation = exports.generateLinkedInContent = exports.analyzeKeywords = exports.auditConfidence = exports.suggestGapStrategy = exports.enhanceExperience = exports.generateSkillsBasedCV = exports.generateCVFromChat = exports.continueCVChat = exports.startCVChat = exports.generateIndustryPulse = exports.generateBattleCard = exports.findOpportunities = exports.analyzeJobMatch = exports.getDailyInspiration = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
admin.initializeApp();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new genai_1.GoogleGenAI({ apiKey }) : null;
// --- Functions ---
exports.getDailyInspiration = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    if (!genAI)
        return "Growth is a spiral process, doubling back on itself, reassessing and regrouping.";
    try {
        const model = 'gemini-2.0-flash';
        const response = await genAI.models.generateContent({
            model,
            contents: "Give me a short, sophisticated, single-sentence career advice or inspirational quote for a busy professional. Do not use quotes around the output.",
            config: { maxOutputTokens: 50, temperature: 0.7 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "Consistency is the bridge between goals and accomplishment.";
    }
    catch (error) {
        return "Your potential is endless. Go do what you were created to do.";
    }
});
exports.analyzeJobMatch = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { role, company } = data;
    if (!genAI)
        return {
            whyFit: "Your background aligns perfectly with this role's requirements.",
            gap: "Consider strengthening industry-specific knowledge.",
            salaryContext: "This role is competitive within the current market."
        };
    const prompt = `Analyze a potential job match for a professional.
    Role: ${role} at ${company}.
    
    Provide 3 brief, punchy sentences in JSON:
    1. "whyFit": Why a candidate would be a good match.
    2. "gap": A potential skill gap to address (be constructive).
    3. "salaryContext": Brief market context for 2026 UK market (£25k-£70k range).
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        whyFit: { type: genai_1.Type.STRING },
                        gap: { type: genai_1.Type.STRING },
                        salaryContext: { type: genai_1.Type.STRING }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No analysis generated");
    }
    catch (error) {
        return {
            whyFit: "Strong alignment with your core competencies.",
            gap: "Review recent industry-specific tools.",
            salaryContext: "Competitive within the current landscape."
        };
    }
});
exports.findOpportunities = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { cvData } = data;
    if (!genAI)
        return [];
    const profileSummary = `
    Role: ${cvData.targetRole || "Professional"}
    Skills: ${cvData.skills.join(', ') || "Various professional skills"}
    Experience: ${cvData.summary}
    `;
    const prompt = `
    Act as a Recruiter for UK professionals earning £25,000-£70,000.
    Search for 5 job openings that match this candidate profile:
    ${profileSummary}

    For each job found, provide:
    1. Role Title
    2. Company Name
    3. Location (Remote/Hybrid/City)
    4. Estimated Salary (in £GBP, within £25k-£70k range)
    5. A brief 1-sentence "Why it matches" reason.
    6. The Sector (Tech, Finance, Public, Creative, or Other).
    7. A Match Score (0-100).

    Return the result as a JSON array of objects with keys: id (random string), title, company, location, salary, matchReason, sector, matchScore.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            id: { type: genai_1.Type.STRING },
                            title: { type: genai_1.Type.STRING },
                            company: { type: genai_1.Type.STRING },
                            location: { type: genai_1.Type.STRING },
                            salary: { type: genai_1.Type.STRING },
                            matchReason: { type: genai_1.Type.STRING },
                            sector: { type: genai_1.Type.STRING },
                            matchScore: { type: genai_1.Type.INTEGER }
                        }
                    }
                }
            }
        });
        const opportunities = response.text ? JSON.parse(response.text) : [];
        return opportunities;
    }
    catch (error) {
        console.error("Search failed", error);
        return [];
    }
});
exports.generateBattleCard = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { jdText } = data;
    if (!genAI)
        return {
            role: "Professional",
            hiddenAgenda: "They need someone who can hit the ground running.",
            questions: ["What does success look like in 6 months?", "What's the team's biggest challenge?"],
            tools: ["Microsoft Office", "Industry tools"]
        };
    const prompt = `Analyze the following Job Description text.
    Identify:
    1. The "Hidden Agenda" (The core pain point they need solved).
    2. 3 High-Impact strategic questions the candidate should ask.
    3. Key software/tools mentioned or implied.
    
    JD: "${jdText.substring(0, 3000)}"
    
    Return JSON with keys: role (inferred title), hiddenAgenda, questions (array), tools (array).`;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        role: { type: genai_1.Type.STRING },
                        hiddenAgenda: { type: genai_1.Type.STRING },
                        questions: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        tools: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response");
    }
    catch (error) {
        return {
            role: "Role Analysis",
            hiddenAgenda: "Focus on demonstrating value creation.",
            questions: ["What does success look like in 6 months?", "How does this role impact the team?"],
            tools: ["Industry Standard Tools"]
        };
    }
});
exports.generateIndustryPulse = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { industry } = data;
    if (!genAI)
        return {
            industry,
            watercooler: ["AI adoption is accelerating.", "Remote work policies are evolving.", "Skills-based hiring is trending."],
            competitorSnapshot: "Major players are focusing on efficiency and digital transformation."
        };
    const prompt = `Act as an industry researcher in 2026. 
    Provide an "Industry Pulse" briefing for: ${industry}.
    
    Return JSON with:
    1. "watercooler": 3 short, punchy facts/news items for small talk.
    2. "competitorSnapshot": A brief paragraph on what major companies are doing.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        watercooler: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        competitorSnapshot: { type: genai_1.Type.STRING }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response");
    }
    catch (error) {
        return {
            industry,
            watercooler: ["Market volatility is high.", "Tech integration is priority #1.", "Sustainability is a key driver."],
            competitorSnapshot: "Competitors are pivoting to AI-driven workflows."
        };
    }
});
exports.startCVChat = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    return "Hello. I'm your Executive Recruiter. Let's build a CV that reflects your true value. To start, what is the target role title you are aiming for?";
});
exports.continueCVChat = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { history, userMessage } = data;
    if (!genAI)
        return "Tell me more about your experience and achievements.";
    const conversation = history.map(turn => `${turn.role === 'user' ? 'Candidate' : 'Recruiter'}: ${turn.parts[0].text}`).join('\n');
    const prompt = `
    You are an expert Executive Recruiter helping a candidate build a "Skills-Based CV".
    Your goal is to extract high-impact achievements, numbers, and specific moments using probing questions.
    
    Conversation History:
    ${conversation}
    Candidate: "${userMessage}"

    Instructions:
    1. Acknowledge the candidate's input briefly.
    2. Ask ONE specific, probing question to get more detail, metrics, or context.
    3. Focus on achievements, not duties. Ask for numbers and impact.
    4. Keep it professional and encouraging.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { maxOutputTokens: 150 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "Can you quantify the impact of that work?";
    }
    catch (error) {
        return "Could you elaborate on the outcome of that project?";
    }
});
exports.generateCVFromChat = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { history } = data;
    if (!genAI)
        return null;
    const conversation = history.map(turn => `${turn.role === 'user' ? 'Candidate' : 'Recruiter'}: ${turn.parts[0].text}`).join('\n');
    const prompt = `
    Based on the following interview conversation, structure a preliminary CV.
    
    Conversation:
    ${conversation}

    Extract:
    1. Full Name (if mentioned, otherwise leave empty).
    2. Target Role.
    3. Professional Summary (Synthesize a strong 3-sentence summary).
    4. Experience: Identify distinct roles discussed. Format them as experience entries.
    5. Skills: Extract hard and soft skills mentioned or implied.

    Return JSON matching this schema:
    { "fullName": string, "targetRole": string, "summary": string, "experience": [{ "title": string, "company": string, "dates": string, "description": string }], "skills": [string] }
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        fullName: { type: genai_1.Type.STRING },
                        targetRole: { type: genai_1.Type.STRING },
                        summary: { type: genai_1.Type.STRING },
                        experience: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    title: { type: genai_1.Type.STRING },
                                    company: { type: genai_1.Type.STRING },
                                    dates: { type: genai_1.Type.STRING },
                                    description: { type: genai_1.Type.STRING }
                                }
                            }
                        },
                        skills: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
                    }
                }
            }
        });
        if (response.text) {
            const raw = JSON.parse(response.text);
            return {
                fullName: raw.fullName || '',
                email: '',
                targetRole: raw.targetRole || '',
                summary: raw.summary || '',
                experience: ((_a = raw.experience) === null || _a === void 0 ? void 0 : _a.map((e, idx) => ({
                    id: Date.now().toString() + idx,
                    title: e.title || 'Role',
                    company: e.company || 'Company',
                    dates: e.dates || 'Recent',
                    description: e.description || '',
                    status: 'neutral'
                }))) || [],
                gaps: [],
                skills: raw.skills || [],
                jobDescription: ''
            };
        }
        return null;
    }
    catch (error) {
        console.error("Failed to generate CV from chat", error);
        return null;
    }
});
exports.generateSkillsBasedCV = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { input } = data;
    if (!genAI)
        return null;
    const prompt = `
    Create a skills-based CV for the following candidate targeting a ${input.targetRole} role in ${input.targetIndustry || 'their industry'}.

    Skills (with proficiency):
    ${input.skills.join('\n')}

    Work Experience:
    ${input.experiences.map((e) => `${e.title} at ${e.company} (${e.duration}): ${e.achievements}`).join('\n\n')}

    Personal Note: ${input.personalSummary || 'Career professional seeking new opportunities'}

    Create:
    1. A compelling professional summary (3 sentences, highlighting transferable skills)
    2. Enhanced experience descriptions that emphasize skills over duties
    3. Extract and organize the most relevant skills

    Return JSON: { "fullName": "", "targetRole": string, "summary": string, "experience": [{ "title": string, "company": string, "dates": string, "description": string }], "skills": [string] }
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        fullName: { type: genai_1.Type.STRING },
                        targetRole: { type: genai_1.Type.STRING },
                        summary: { type: genai_1.Type.STRING },
                        experience: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    title: { type: genai_1.Type.STRING },
                                    company: { type: genai_1.Type.STRING },
                                    dates: { type: genai_1.Type.STRING },
                                    description: { type: genai_1.Type.STRING }
                                }
                            }
                        },
                        skills: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        return null;
    }
    catch (error) {
        console.error("Skills CV generation failed", error);
        return null;
    }
});
exports.enhanceExperience = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { text, role } = data;
    if (!genAI)
        return text;
    const prompt = `Rewrite the following resume bullet point for a ${role} role. 
  Transform it into impactful, result-oriented language. 
  Focus on achievements, metrics, and active verbs. Remove passive voice. 
  Original text: "${text}"`;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { temperature: 0.4 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || text;
    }
    catch (error) {
        console.error("Enhancement failed", error);
        return text;
    }
});
exports.suggestGapStrategy = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { activity } = data;
    if (!genAI)
        return activity;
    const prompt = `The user has a career gap and did the following activity: "${activity}". 
  Rewrite this as a "Strategic Professional Development" entry for a CV. 
  Make it sound intentional, growth-oriented, and valuable to an employer.`;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { temperature: 0.5 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || activity;
    }
    catch (error) {
        console.error("Gap strategy failed", error);
        return activity;
    }
});
exports.auditConfidence = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { fullText } = data;
    if (!genAI || !fullText)
        return [];
    const prompt = `Analyze the following CV text for "soft language" or lack of confidence (e.g., "helped", "assisted", "tried", "part of"). 
  Identify up to 5 weak phrases.
  Return a JSON array where each object has:
  - "original": the weak phrase found
  - "suggestion": a strong replacement (e.g., "Spearheaded", "Delivered")
  - "reason": brief explanation.
  
  CV Text: "${fullText.substring(0, 2000)}"`;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            original: { type: genai_1.Type.STRING },
                            suggestion: { type: genai_1.Type.STRING },
                            reason: { type: genai_1.Type.STRING },
                        }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    }
    catch (error) {
        console.error("Confidence audit failed", error);
        return [];
    }
});
exports.analyzeKeywords = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { cvText, jobDescription } = data;
    if (!genAI || !jobDescription)
        return { missingKeywords: [], matchScore: 0 };
    const prompt = `Analyze the CV text against the Job Description. 
    Identify key skills and terms present in the JD but missing from the CV.
    Return a JSON object with:
    - "missingKeywords": array of strings (top 5 missing important terms)
    - "matchScore": integer from 0 to 100 based on keyword relevance.

    CV: "${cvText.substring(0, 1000)}"
    JD: "${jobDescription.substring(0, 1000)}"`;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        missingKeywords: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        matchScore: { type: genai_1.Type.INTEGER }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        return { missingKeywords: [], matchScore: 0 };
    }
    catch (error) {
        console.error("Keyword analysis failed", error);
        return { missingKeywords: [], matchScore: 0 };
    }
});
exports.generateLinkedInContent = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { cvData } = data;
    if (!genAI)
        return {
            headline: cvData.targetRole || "Professional",
            summary: cvData.summary || "Experienced professional seeking new opportunities.",
            about: cvData.summary || "Dedicated professional with a track record of success.",
            experiences: cvData.experience.map(e => ({ title: e.title, company: e.company, description: e.description }))
        };
    const cvSummary = `
    Name: ${cvData.fullName}
    Target Role: ${cvData.targetRole}
    Summary: ${cvData.summary}
    Experience: ${cvData.experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join('\n')}
    Skills: ${cvData.skills.join(', ')}
    `;
    const prompt = `
    Create LinkedIn profile content based on this CV:
    ${cvSummary}

    Generate:
    1. headline: A compelling LinkedIn headline (max 120 chars)
    2. summary: A short bio for the profile intro (2-3 sentences)
    3. about: A full "About" section (professional narrative, ~150 words)
    4. experiences: Enhanced descriptions for each role (more conversational than CV)

    Return JSON: { "headline": string, "summary": string, "about": string, "experiences": [{ "title": string, "company": string, "description": string }] }
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        headline: { type: genai_1.Type.STRING },
                        summary: { type: genai_1.Type.STRING },
                        about: { type: genai_1.Type.STRING },
                        experiences: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    title: { type: genai_1.Type.STRING },
                                    company: { type: genai_1.Type.STRING },
                                    description: { type: genai_1.Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response");
    }
    catch (error) {
        return {
            headline: cvData.targetRole || "Professional",
            summary: cvData.summary || "Experienced professional.",
            about: cvData.summary || "Dedicated professional.",
            experiences: cvData.experience.map(e => ({ title: e.title, company: e.company, description: e.description }))
        };
    }
});
exports.startInterviewSimulation = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { jobDescription, cvText } = data;
    if (!genAI)
        return "Thank you for joining us today. Tell me about a significant achievement in your career that demonstrates your capability for this role.";
    const prompt = `
    You are conducting a rigorous behavioral interview for a role.
    
    Job Description Summary: "${jobDescription.substring(0, 500)}"
    Candidate CV Summary: "${cvText.substring(0, 500)}"
    
    Generate your opening interview question. Make it challenging but fair.
    Focus on behavioral questions (STAR format expected).
    1-2 sentences max.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { maxOutputTokens: 100, temperature: 0.7 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "Tell me about a time you faced a significant challenge at work. How did you handle it?";
    }
    catch (error) {
        return "Let's begin. Tell me about your most impactful professional achievement.";
    }
});
exports.getNextInterviewQuestion = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { jobDescription, history, lastAnswer } = data;
    if (!genAI)
        return "Interesting. Can you give me a specific example of when you demonstrated that skill?";
    const prompt = `
    You are conducting a behavioral interview.
    
    Job Context: "${jobDescription.substring(0, 300)}"
    
    Conversation so far:
    ${history.substring(0, 1000)}
    
    The candidate just said: "${lastAnswer}"
    
    Generate your next interview question. Probe deeper based on their answer.
    Look for gaps, ask for specifics, or move to a new competency area.
    1-2 sentences max.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { maxOutputTokens: 100, temperature: 0.7 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "Can you elaborate on the specific outcome of that situation?";
    }
    catch (error) {
        return "Interesting. How did you measure the success of that initiative?";
    }
});
exports.analyzeInterviewAnswer = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { answer, question, jobDescription } = data;
    if (!genAI)
        return {
            authorityScore: 65,
            powerMove: "Add specific metrics or outcomes to strengthen your answer.",
            hedgesFound: []
        };
    const prompt = `
    Analyze this interview answer for executive presence and confidence.
    
    Job Context: "${jobDescription.substring(0, 200)}"
    Question: "${question}"
    Answer: "${answer}"
    
    Return JSON:
    1. "authorityScore": 0-100 rating (penalize hedges like "maybe", "I think", "sort of", "just")
    2. "powerMove": One specific coaching tip (max 15 words)
    3. "hedgesFound": Array of weak/hedge phrases found
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        authorityScore: { type: genai_1.Type.INTEGER },
                        powerMove: { type: genai_1.Type.STRING },
                        hedgesFound: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response");
    }
    catch (error) {
        return {
            authorityScore: 60,
            powerMove: "Quantify your impact with specific numbers.",
            hedgesFound: []
        };
    }
});
exports.generateInterviewCheatSheet = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { jobDescription, cvText } = data;
    if (!genAI)
        return {
            roleTitle: "Professional Role",
            hiddenAgenda: "They need someone who can deliver results quickly.",
            keyRequirements: ["Strong communication", "Problem-solving", "Team collaboration"],
            questionsToAsk: ["What does success look like in the first 6 months?", "What's the team's biggest challenge?"],
            talkingPoints: ["Highlight your relevant experience", "Emphasize your adaptability"],
            buzzwords: ["Agile", "Cross-functional", "Data-driven"]
        };
    const prompt = `
    Create an interview cheat sheet/briefing document.
    
    Job Description: "${jobDescription.substring(0, 1500)}"
    Candidate CV: "${cvText.substring(0, 1000)}"
    
    Generate:
    1. roleTitle: The inferred job title
    2. hiddenAgenda: What the company really needs (pain point)
    3. keyRequirements: Top 5 must-have requirements from the JD
    4. questionsToAsk: 4 strategic questions to impress the interviewer
    5. talkingPoints: 5 personalized points linking CV to the role
    6. buzzwords: 6 industry terms/buzzwords to use naturally
    
    Return as JSON.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        roleTitle: { type: genai_1.Type.STRING },
                        hiddenAgenda: { type: genai_1.Type.STRING },
                        keyRequirements: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        questionsToAsk: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        talkingPoints: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        buzzwords: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response");
    }
    catch (error) {
        return {
            roleTitle: "Target Role",
            hiddenAgenda: "They need a capable, reliable professional.",
            keyRequirements: ["Relevant experience", "Communication skills", "Problem-solving"],
            questionsToAsk: ["What does success look like?", "What are the team dynamics?"],
            talkingPoints: ["Your relevant experience", "Your key achievements"],
            buzzwords: ["Collaborative", "Results-driven", "Strategic"]
        };
    }
});
exports.getNegotiationRebuttal = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { objection } = data;
    if (!genAI) {
        const fallbacks = {
            "We don't usually offer 4-day weeks.": "I understand it's not standard. Could we trial it for 3 months with clear KPIs to demonstrate I can deliver the same results?",
            "That's the top of our budget band.": "I appreciate the transparency. Given my track record, I believe I'd deliver exceptional value. Can we revisit after 6 months based on performance?",
            "We need you in the office 5 days a week.": "I value collaboration. What if we started with 4 days in-office, then assessed based on productivity?",
            "The equity package is standard for everyone.": "I understand consistency is important. Could we discuss a performance-based bonus instead?"
        };
        return fallbacks[objection] || "I understand your concern. Let's explore what flexibility exists.";
    }
    const prompt = `You are a negotiation coach. Generate a powerful rebuttal (2-3 sentences) to this objection:
    "${objection}"
    
    Be direct, professional, and propose a specific compromise.`;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { maxOutputTokens: 100, temperature: 0.6 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "Let's explore alternative arrangements.";
    }
    catch (error) {
        return "I understand. Could we explore alternatives?";
    }
});
exports.evaluateFlexRequest = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { context: ctx } = data;
    if (!genAI)
        return {
            likelihood: 60,
            strengths: ["You have tenure with the company", "Your request is reasonable"],
            challenges: ["Company culture may not support this", "Manager may have concerns"],
            recommendation: "Frame your request around business benefits and propose a trial period."
        };
    const prompt = `
    Evaluate the likelihood of this flexible working request being approved:
    
    Role: ${ctx.jobRole} at ${ctx.company}
    Tenure: ${ctx.tenure}
    Current: ${ctx.currentArrangement}
    Requested: ${ctx.desiredArrangement}
    Reason: ${ctx.reason}
    Manager Style: ${ctx.managerStyle}
    
    Return JSON:
    - likelihood: 0-100 percentage
    - strengths: 3 factors in favor of approval
    - challenges: 3 potential obstacles
    - recommendation: specific advice for approaching this request
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        likelihood: { type: genai_1.Type.INTEGER },
                        strengths: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        challenges: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        recommendation: { type: genai_1.Type.STRING }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response");
    }
    catch (error) {
        return {
            likelihood: 55,
            strengths: ["Clear reasoning", "Specific request", "Willingness to negotiate"],
            challenges: ["May face resistance", "Precedent concerns", "Coverage needs"],
            recommendation: "Lead with business benefits and propose a trial period."
        };
    }
});
exports.getFlexSimulationStart = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { persona, context: ctx } = data;
    if (!genAI) {
        if (persona === 'hr') {
            return "Hello. I understand you'd like to discuss your working arrangements. What specifically are you looking for?";
        }
        return "You wanted to chat about your working hours? What's on your mind?";
    }
    const personaDesc = persona === 'hr'
        ? "You are an HR representative. Be professional, policy-focused, but fair."
        : `You are a ${ctx.managerStyle} line manager. React accordingly.`;
    const prompt = `
    ${personaDesc}
    
    An employee (${ctx.jobRole}, ${ctx.tenure} tenure) wants to request ${ctx.desiredArrangement}.
    
    Generate your opening line for this conversation. Be in character. 1-2 sentences.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { maxOutputTokens: 80, temperature: 0.7 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "I understand you wanted to discuss your working arrangements.";
    }
    catch (error) {
        return "You mentioned wanting to discuss flexibility. What did you have in mind?";
    }
});
exports.getFlexSimulationResponse = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    var _a;
    const { persona, context: ctx, history, userMessage } = data;
    if (!genAI)
        return "I see. Can you tell me more about how this would work?";
    const personaDesc = persona === 'hr'
        ? "You are an HR representative. Be professional and policy-focused."
        : `You are a ${ctx.managerStyle} line manager. React accordingly.`;
    const prompt = `
    ${personaDesc}
    
    Context: Employee (${ctx.jobRole}) is requesting ${ctx.desiredArrangement}.
    
    Conversation:
    ${history}
    
    Employee just said: "${userMessage}"
    
    Respond in character. Push back where appropriate but remain professional. 1-2 sentences.
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { maxOutputTokens: 80, temperature: 0.7 }
        });
        return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "That's an interesting point. How would you handle coverage during those times?";
    }
    catch (error) {
        return "I appreciate you sharing that. Let me think about the implications.";
    }
});
exports.generateReturnRoadmap = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    const { context: ctx } = data;
    if (!genAI)
        return {
            phases: [
                { title: "The Foundation", weeks: "Weeks 1-4", focus: "Rebuild confidence and connections", actions: ["Schedule 1:1s with key colleagues", "Review industry updates", "Set up productivity systems"] },
                { title: "The Momentum", weeks: "Weeks 5-8", focus: "Demonstrate value", actions: ["Identify a quick win project", "Share knowledge from fresh perspective", "Build visibility"] },
                { title: "The Integration", weeks: "Weeks 9-12", focus: "Solidify your position", actions: ["Document your contributions", "Seek feedback", "Plan next steps"] }
            ],
            keyTip: "Focus on impact, not hours. Quality over presence."
        };
    const prompt = `
    Create a personalized 90-day return-to-work roadmap.
    
    Role: ${ctx.role}
    Industry: ${ctx.industry}
    Time away: ${ctx.timeAway}
    Priorities: ${ctx.priorities.join(', ')}
    Main concern: ${ctx.challenges}
    
    Create 3 phases (Weeks 1-4, 5-8, 9-12) with:
    - title: Phase name
    - weeks: Time period
    - focus: Main focus area
    - actions: 3-4 specific actions
    
    Also provide one key tip/golden rule.
    
    Return JSON: { "phases": [...], "keyTip": string }
    `;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                // @ts-ignore
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        phases: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    title: { type: genai_1.Type.STRING },
                                    weeks: { type: genai_1.Type.STRING },
                                    focus: { type: genai_1.Type.STRING },
                                    actions: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
                                }
                            }
                        },
                        keyTip: { type: genai_1.Type.STRING }
                    }
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response");
    }
    catch (error) {
        return {
            phases: [
                { title: "Reconnect", weeks: "Weeks 1-4", focus: "Rebuild relationships", actions: ["Meet with key stakeholders", "Understand current priorities", "Set up systems"] },
                { title: "Contribute", weeks: "Weeks 5-8", focus: "Add value", actions: ["Take on a visible project", "Share fresh perspectives", "Build credibility"] },
                { title: "Establish", weeks: "Weeks 9-12", focus: "Solidify position", actions: ["Document wins", "Seek feedback", "Plan growth"] }
            ],
            keyTip: "Your break gave you perspective—use it as a strength."
        };
    }
});
//# sourceMappingURL=index.js.map