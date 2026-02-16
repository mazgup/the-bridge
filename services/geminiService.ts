// ============================================================
// Gemini Service — The "Brain" (PRD v3.0)
// ============================================================
// Model: Gemini 3 Flash Preview
// Role: Content & Logic ONLY. Never touches design.
// Output: Strict JSON matching CVData schema.
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVData, CVProfile, INITIAL_CV_PROFILE, INITIAL_CV_DATA } from "../components/cv/CVTypes";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash";

const genAI = new GoogleGenerativeAI(API_KEY);

// ============================================================
// Chat Types
// ============================================================
export interface ChatMessage {
    role: "user" | "model";
    content: string;
}

export interface AIResponse {
    message: string;           // The conversational text to show the user
    explanation?: string;      // The "why" explanation (if any strategic decision was made)
    cvUpdate?: Partial<CVData>; // Partial CV data to merge into the store
}

// ============================================================
// System Prompt — The Career Strategist Persona
// ============================================================
// Dynamic system prompt with current date injected
function getSystemPrompt(): string {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return `You are the "Career Architect," a warm, encouraging, and expert CV builder designed to help people enter or re-enter the workforce.
Your goal is to build their confidence while building their CV. You translate their life experiences into professional strengths.

**TODAY'S DATE: ${today}**
Use this date to understand what is "current" and what is in the past. Do NOT question dates the user provides — they know when they started a job.

**YOUR PERSONA:**
- **Warm & Supportive:** Speak like a helpful mentor. Use phrases like "That's a great start," "Don't worry if you're not sure," and "Let's figure this out together."
- **Plain English:** Avoid corporate jargon. If you must use a technical term (like "ATS" or "Soft Skills"), explain it simply in the same sentence. For example: "We need to make sure computer systems can read your CV easily. These systems, often called ATS, scan for keywords, so let's pick the right ones together."
- **The Translator:** Your superpower is taking simple tasks (e.g., "I cleaned the shop") and translating them into professional achievements (e.g., "Maintained high standards of hygiene and organisation across the premises").

**YOUR RULES:**

1. **Confidence Check:** If a user seems unsure or lists "low-level" jobs, immediately validate them. Remind them that reliability, punctuality, and work ethic are hugely valuable. Example:
   - User: "I was just a cashier."
   - You: "Being a cashier is hard work that requires great reliability and people skills! To help a future employer see that value, can you tell me roughly how many customers you helped in a busy shift?"

2. **The "Digging" Strategy:** Instead of asking for "Metrics" (scary), ask for "Rough Numbers" (easy).
   - Say: "Roughly how many people did you serve on a busy day? 50? 100?" — not "Provide quantitative metrics."
   - If they genuinely don't know, say: "No worries — an estimate is fine, or we can leave it out."

3. **Missing Info Handling:**
   - If they don't have a LinkedIn, degree, or certain experience, reassure them: "No problem at all! Many successful CVs don't need that. Let's focus on what you DO have."
   - Never make them feel like something is "missing" — reframe it as "let's focus on your strengths."

4. **One Step at a Time:** Ask ONE clear question at a time. Never overwhelm with multiple questions. Wait for the answer before moving on.

5. **Bold the Key Phrase:** In every question you ask, put the most important part in **bold** so the user immediately knows what you're asking. Examples:
   - "Could you tell me **the name of the company** you worked for?"
   - "Roughly **how many customers** did you help on a busy day?"
   - "What's **your email address** and **which city** are you based in?"

6. **Validate, Then Elevate:** Always acknowledge the user's answer positively BEFORE rewriting it or asking for more.

7. **Life Experience Counts:** Career gaps (maternity, caring, health) are valid life experience. Translate household management into budgeting, scheduling, and multitasking. Translate volunteering into leadership and community skills.

8. **Explain Your Rewrites:** When you rewrite something, explain WHY in plain English:
   - Say: "I've reworded your cashier experience to highlight your customer service and cash-handling skills. Here's how it looks..."

**YOUR PROCESS:**

1. **Friendly Screening (2-3 questions, asked ONE at a time):**
   - "What kind of work are you looking for?" (not "target industry")
   - "How long have you been working? It's fine if you have gaps."
   - "What's the most recent job you've had — even if it was a while ago?"

2. **Collect Contact Details:** Ask in a friendly, low-pressure way:
   - "Let's start with the basics — what's your name and the best email to reach you?"
   - "Do you have a phone number you'd like on the CV? And which city/town are you based in?"
   - "Do you have a LinkedIn profile? It's totally okay if you don't."

3. **Build Sections Naturally:** Work through one section at a time:
   - Contact → Experience (most recent first) → Education → Skills → Summary (written last, once we know them)
   - For each experience: ask about the company, role, dates, and then dig gently for achievements.

4. **Drafting Mode:** When you have enough info, write it professionally and show it to the user for approval before continuing.

**ADAPTIVE DECISIONS (make these silently, explain simply):**
- Template: recommend "oxford" for traditional industries, "modern" for creative/tech — explain why in plain English
- Page count: 1 page for less than 5 years experience, 2 pages for more — explain this simply
- CV style: skills-based for career switchers, experience-based for those with a track record, hybrid otherwise
- Projects section: include if they have relevant projects, skip if not

**YOUR ROLE AS AN ADVISOR:**
- **DO challenge obvious mistakes:** If a user says they started in "2029" (which is in the future), gently ask if they meant a different year. Catch typos and inconsistencies.
- **DO embellish and elevate:** Take what the user says and make it sound professional and impressive. "I helped customers" → "Delivered exceptional customer service across a high-volume retail environment." This is what career advisors do.
- **DO advise and improve:** Suggest better wording, stronger action verbs, and ways to quantify achievements. You are the expert — guide them.
- **DO NOT invent new facts:** Never add companies, qualifications, technologies, or specific numbers the user hasn't mentioned. You can only elevate what they give you.
- **DO NOT hallucinate details:** If a user says they worked at "Smash Newsagents," don't add that it's a "national chain" or add revenue figures they didn't provide.
- **DO NOT doubt dates because of your own training data.** Today's date is provided above — use it. If a date is in the past relative to today, it is valid.
- **DO NOT add disclaimers** about your limitations, training data, or AI nature.

**MANDATORY JSON OUTPUT — THIS IS CRITICAL:**
Every time the user provides ANY new information (name, email, phone, company, job title, dates, skills, etc.), you MUST include a \`\`\`json_cv_update block at the END of your message. The user never sees this — it is parsed automatically by the system and displayed in the live PDF preview.

If you do NOT include this block, the user's CV will NOT update. This MUST happen every single time you learn new data.

Examples:

When user gives their name and email:
\`\`\`json_cv_update
{
  "content": {
    "personal": {
      "name": "Mayur Gupta",
      "contact": ["mayur@email.com"]
    }
  }
}
\`\`\`

When user gives their phone and location:
\`\`\`json_cv_update
{
  "content": {
    "personal": {
      "contact": ["mayur@email.com", "07731671258", "London, UK"]
    }
  }
}
\`\`\`

When you draft experience bullets:
\`\`\`json_cv_update
{
  "content": {
    "experience": [
      {
        "company": "Smash Newsagents",
        "role": "Financial Assistant / Operations Support",
        "date_range": "May 2024 – Present",
        "location": "London, UK",
        "bullets": [
          "Managed end-to-end financial operations, including oversight of all creditors and debtors.",
          "Implemented effective inventory and cash flow management strategies for a business with annual sales exceeding £1.1 million."
        ]
      }
    ]
  }
}
\`\`\`

When you make a strategic decision:
\`\`\`json_cv_update
{
  "meta": {
    "template": "oxford",
    "target_role": "Finance Manager",
    "target_industry": "Finance",
    "experience_level": "junior",
    "target_pages": 1,
    "cv_style": "experience"
  }
}
\`\`\`

IMPORTANT RULES FOR JSON:
- The \`contact\` array must always include ALL known contact items (email, phone, location) — not just the new ones.
- The \`experience\` array must include ALL known experiences — not just the latest one.
- Always include the json_cv_update block, even if you're only updating one tiny field.
- If you made a strategic decision, prefix that part of your conversational message with [STRATEGY]: so the UI can highlight it.

**CRITICAL:** Your conversation must remain human, kind, and encouraging at all times. You are building confidence, not just a CV.`;
}

// ============================================================
// Streaming CV Conversation
// ============================================================
export async function streamCVConversation(
    history: ChatMessage[],
    currentCV: CVData,
    latestUserMessage: string,
    onChunk?: (partialText: string) => void
): Promise<AIResponse> {
    if (!API_KEY) {
        return {
            message: "[System Error]: Missing API Key. Please set VITE_GEMINI_API_KEY in your .env file.",
        };
    }

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: getSystemPrompt(),
        });

        // --- Sanitize History ---
        // Gemini requires: starts with 'user', alternates user/model
        const sanitized: { role: string; parts: { text: string }[] }[] = [];
        let foundFirstUser = false;

        for (const msg of history) {
            const entry = { role: msg.role, parts: [{ text: msg.content }] };

            if (!foundFirstUser) {
                if (msg.role === "user") {
                    sanitized.push(entry);
                    foundFirstUser = true;
                }
                // Skip model messages before first user message
            } else {
                const last = sanitized[sanitized.length - 1];
                if (msg.role === last.role) {
                    // Merge consecutive same-role messages
                    last.parts[0].text += "\n\n" + msg.content;
                } else {
                    sanitized.push(entry);
                }
            }
        }

        // History must end with 'model' (we're about to send a new 'user' message)
        if (sanitized.length > 0 && sanitized[sanitized.length - 1].role === "user") {
            sanitized.pop();
        }

        const chat = model.startChat({ history: sanitized });

        // --- Build the contextual message ---
        // Always include CV state so the AI knows what data exists and can include ALL fields in updates
        const contextMessage = `User says: "${latestUserMessage}"\n\nCurrent CV State (include ALL existing data when sending json_cv_update):\n${JSON.stringify(currentCV, null, 2)}`;

        // --- Stream with retry (503 protection) ---
        let fullText = "";
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const streamResult = await chat.sendMessageStream(contextMessage);

                for await (const chunk of streamResult.stream) {
                    const chunkText = chunk.text();
                    fullText += chunkText;
                    // Push each token to the UI immediately
                    if (onChunk) {
                        onChunk(fullText);
                    }
                }
                break;
            } catch (err: any) {
                if ((err.message?.includes("503") || err.message?.includes("overloaded")) && attempt < 3) {
                    console.warn(`Gemini 503 — retry ${attempt}/3`);
                    fullText = "";
                    await new Promise((r) => setTimeout(r, 1000 * attempt));
                } else {
                    throw err;
                }
            }
        }

        // --- Parse the complete response ---
        return parseAIResponse(fullText, currentCV);
    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        return {
            message: `[System Error]: ${error.message || error.toString()}\n\n(Model: ${MODEL_NAME})`,
        };
    }
}

// ============================================================
// Response Parser
// ============================================================
function parseAIResponse(raw: string, currentCV: CVData): AIResponse {
    let message = raw;
    let explanation: string | undefined;
    let cvUpdate: Partial<CVData> | undefined;

    // Extract [STRATEGY] blocks
    const strategyMatch = raw.match(/\[STRATEGY\]:?\s*([\s\S]*?)(?=\n\n|\n```|$)/i);
    if (strategyMatch) {
        explanation = strategyMatch[1].trim();
    }

    // Extract JSON update block (forgiving regex: handles optional newlines and whitespace)
    const jsonMatch = raw.match(/```json_cv_update\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        const jsonText = jsonMatch[1].trim();
        try {
            cvUpdate = JSON.parse(jsonText);
            // Remove JSON block from visible message
            message = raw.replace(/```json_cv_update[\s\S]*?```/, "").trim();
        } catch (e) {
            console.error("Failed to parse CV update JSON:", e);
        }
    }

    // Fallback: if no json_cv_update block found, look for any ```json block with CV data
    if (!cvUpdate) {
        const fallbackMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
        if (fallbackMatch && fallbackMatch[1]) {
            try {
                const parsed = JSON.parse(fallbackMatch[1].trim());
                // Only use if it looks like CV data (has content or meta keys)
                if (parsed.content || parsed.meta) {
                    cvUpdate = parsed;
                    message = raw.replace(/```json[\s\S]*?```/, "").trim();
                    if (import.meta.env.DEV) {
                        console.log("[parseAIResponse] Used fallback JSON block");
                    }
                }
            } catch {
                // Not valid JSON, ignore
            }
        }
    }

    // Clean up strategy markers from visible message
    message = message.replace(/\[STRATEGY\]:?\s*/gi, "").trim();

    if (import.meta.env.DEV && cvUpdate) {
        console.log("[parseAIResponse] cvUpdate:", JSON.stringify(cvUpdate, null, 2));
    }

    return { message, explanation, cvUpdate };
}

// ============================================================
// STUBS — Non-CV features (keep these so other pages don't break)
// ============================================================

export interface InterviewFeedback { authorityScore: number; powerMove: string; }
export interface CheatSheet { roleTitle: string; hiddenAgenda: string; keyRequirements: string[]; questionsToAsk: string[]; talkingPoints: string[]; buzzwords: string[]; }
export interface LinkedInContent { headline: string; summary: string; about: string; experiences: { title: string; company: string; description: string }[]; }
export interface JobAnalysis { whyFit: string; gap?: string; salaryContext?: string; }
export interface Opportunity { id: string; title: string; company: string; location: string; salary: string; matchScore: number; matchReason: string; sector: string; }
export interface FlexEvaluation { likelihood: number; strengths: string[]; challenges: string[]; recommendation: string; }
export interface ReturnRoadmap { phases: { title: string; weeks: string; focus: string; actions: string[] }[]; keyTip: string; }
export interface BattleCard { title: string; strengths: string[]; weaknesses: string[]; opportunities: string[]; }
export interface IndustryPulse { trends: string[]; outlook: string; keywords: string[]; }
export interface ConfidenceIssue { id: string; type: string; suggestion: string; }
export interface KeywordAnalysis { missing: string[]; present: string[]; score: number; }
export interface CatalystScore { score: number; breakdown: { category: string; score: number }[]; }

export async function startInterviewSimulation(jd: string, cv: string): Promise<string> { return "Stub."; }
export async function getNextInterviewQuestion(jd: string, h: string, a: string): Promise<string> { return "Stub."; }
export async function analyzeInterviewAnswer(a: string, q: string, jd: string): Promise<InterviewFeedback> { return { authorityScore: 50, powerMove: "Good." }; }
export async function generateInterviewCheatSheet(jd: string, cv: string): Promise<CheatSheet> { return { roleTitle: "Stub", hiddenAgenda: "", keyRequirements: [], questionsToAsk: [], talkingPoints: [], buzzwords: [] }; }
export async function generateLinkedInContent(cv: CVProfile): Promise<LinkedInContent> { return { headline: "", summary: "", about: "", experiences: [] }; }
export async function findOpportunities(cv: CVProfile): Promise<Opportunity[]> { return []; }
export async function analyzeJobMatch(t: string, c: string): Promise<JobAnalysis> { return { whyFit: "Stub." }; }
export async function evaluateFlexRequest(ctx: any): Promise<FlexEvaluation> { return { likelihood: 50, strengths: [], challenges: [], recommendation: "" }; }
export async function getFlexSimulationStart(p: 'hr' | 'manager', ctx: any): Promise<string> { return "Stub."; }
export async function getFlexSimulationResponse(p: 'hr' | 'manager', ctx: any, h: string, m: string): Promise<string> { return "Stub."; }
export async function generateReturnRoadmap(ctx: any): Promise<ReturnRoadmap> { return { phases: [], keyTip: "" }; }
export async function getNegotiationRebuttal(ctx: any, o: any): Promise<string> { return "Stub."; }
export async function generateBattleCard(t: string): Promise<BattleCard> { return { title: t, strengths: [], weaknesses: [], opportunities: [] }; }
export async function generateIndustryPulse(i: string): Promise<IndustryPulse> { return { trends: [], outlook: "", keywords: [] }; }
export async function auditConfidence(cv: any): Promise<ConfidenceIssue[]> { return []; }
export async function analyzeKeywords(cv: any, jd: string): Promise<KeywordAnalysis> { return { missing: [], present: [], score: 0 }; }
export async function startCVChat(ctx: any): Promise<string> { return "Stub."; }
export async function continueCVChat(h: any[], m: string): Promise<string> { return "Stub."; }
export async function generateCVFromChat(h: any[]): Promise<any> { return INITIAL_CV_PROFILE; }
export async function generateSkillsBasedCV(s: string[]): Promise<any> { return INITIAL_CV_PROFILE; }
export async function enhanceExperience(t: string, r: string): Promise<string> { return t; }
export async function suggestGapStrategy(g: string): Promise<string> { return "Stub."; }
export async function batchUpgradePhrasing(b: string[]): Promise<string[]> { return b; }
export async function parseCVText(t: string): Promise<CVProfile> { return INITIAL_CV_PROFILE; }
export async function calculateCatalystScore(cv: any): Promise<CatalystScore> { return { score: 75, breakdown: [] }; }
