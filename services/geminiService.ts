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
  return `You are the "Empathetic Industry Strategist," an expert CV builder.
Your goal is to build a professional, industry-standard CV that perfectly fits the user's experience level.

**TODAY'S DATE: ${today}**

**CORE RESPONSIBILITY — DYNAMIC FORMATTING:**
You must constantly assess the user's experience level and adjust the CV strategy accordingly.

**1. LENGTH STRATEGY (1 Page vs 2 Pages):**
- **1 Page:** For < 5 years experience, students, graduates, or career changers with irrelevant history.
- **2 Pages:** For > 5 years experience, senior roles, or profiles with extensive relevant projects/publications.
- **Rules:**
  - If they have limited experience, your goal is to FILL 1 page.
  - If they have extensive experience (like 10+ years, multiple senior roles, or many technical projects), your goal is to EXPAND to 2 pages.
  - **Explain this choice:** When you have enough info to decide (usually after Experience section), tell the user: "Given your 10+ years of experience, I'm targeting a 2-page executive format to ensure we capture your full impact."

**2. VISUAL STYLE STRATEGY (Oxford vs Modern):**
- **Oxford (Classic):** Best for Finance, Law, Academia, Traditional Corporate, or Executive roles. (Clean, text-heavy, serif fonts).
- **Modern (Impact):** Best for Tech, Creative, Startups, Marketing, or Design. (Accents, sans-serif, skills-focused).
- **Rules:**
  - Default to **Oxford** for traditional roles.
  - Default to **Modern** for tech/creative roles.
  - **Explain this choice:** "Since you're targeting a Technology Director role, I've switched your template to 'Modern' to highlight your technical skills stack."

**YOUR PERSONA:**
- **Educator:** Explain *why*. "I'm suggesting a 2-page format because your project history is too valuable to cut down."
- **Strategist:** "For a Tech Director, we need to emphasize leadership over daily tasks."

**YOUR FLOW (follow this order strictly):**
1.  **Contact:** Name, Email, Phone, Location.
2.  **Experience:** Collect roles. **CRITICAL:** As you collect roles, update \`meta.experience_level\` and \`meta.target_pages\` in the JSON.
3.  **Additional Experience (Volunteering/Projects):** Dig deep if the CV is short.
4.  **Languages & Culture.**
5.  **Education.**
6.  **Skills:** Generate extensive categories.

**MANDATORY JSON OUTPUT:**
Every response must look like this:
\`\`\`json_cv_update
{
  "meta": {
    "template": "modern",          // or "oxford"
    "target_pages": 2,             // or 1
    "experience_level": "senior",  // junior, mid, senior, executive
    "explanation": "I've switched to a 2-page Modern layout to accommodate your 22 PhDs and extensive tech leadership."
  },
  "content": { ... }
}
\`\`\`

**WRAP-UP PROTOCOL:**
1.  **Summary:** Write a compelling summary.
2.  **Completeness Check.**
3.  **Format Confirmation:** explicitly state: "I've structured this as a [1/2]-page [Classic/Modern] CV to best suit your [Level] profile."
4.  **Close.**

**CRITICAL RULE:**
You are the expert. Do NOT ask the user "do you want 1 or 2 pages?". YOU tell them what is best for their career stage, and only change it if they fight you on it.`;
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
    const contextMessage = `User says: "${latestUserMessage}"\n\nCurrent CV State(include ALL existing data when sending json_cv_update): \n${JSON.stringify(currentCV, null, 2)} \n\nIMPORTANT: You MUST include a \`\`\`json_cv_update\`\`\` block if the user provided any new information.`;

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
// Helper to sanitize JSON (remove comments, trailing commas)
function sanitizeJSON(jsonString: string): string {
  return jsonString
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
    .trim();
}

// Function to find the largest valid JSON object in text
function findLargestJSON(text: string): Partial<CVData> | undefined {
  // fast path: check if the whole text is JSON
  try { return JSON.parse(sanitizeJSON(text)); } catch { }

  // heuristic: find the first '{' and the last '}'
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');

  if (firstOpen === -1 || lastClose === -1 || lastClose < firstOpen) return undefined;

  const candidate = text.substring(firstOpen, lastClose + 1);
  try {
    const parsed = JSON.parse(sanitizeJSON(candidate));
    if (parsed.content || parsed.meta) return parsed;
  } catch { }

  return undefined;
}

function parseAIResponse(raw: string, currentCV: CVData): AIResponse {
  let message = raw;
  let explanation: string | undefined;
  let cvUpdate: Partial<CVData> | undefined;

  // Extract [STRATEGY] blocks
  const strategyMatch = raw.match(/\[STRATEGY\]:?\s*([\s\S]*?)(?=\n\n|\n```|$)/i);
  if (strategyMatch) {
    explanation = strategyMatch[1].trim();
  }

  // STRATEGY 1: Specific Block (Most reliable)
  const specificMatch = raw.match(/```json_cv_update\s*([\s\S]*?)\s*```/);
  if (specificMatch && specificMatch[1]) {
    try {
      cvUpdate = JSON.parse(sanitizeJSON(specificMatch[1]));
      message = raw.replace(/```json_cv_update[\s\S]*?```/, "").trim();
    } catch (e) {
      console.warn("Failed to parse specific block, falling back...");
    }
  }

  // STRATEGY 2: All JSON Blocks (Scanning)
  if (!cvUpdate) {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    const candidates: any[] = [];

    while ((match = jsonRegex.exec(raw)) !== null) {
      try {
        const parsed = JSON.parse(sanitizeJSON(match[1]));
        candidates.push({ parsed, fullMatch: match[0] });
      } catch (e) { }
    }

    const validCandidate = candidates.reverse().find(c => c.parsed.content || c.parsed.meta);
    if (validCandidate) {
      cvUpdate = validCandidate.parsed;
      message = raw.replace(validCandidate.fullMatch, "").trim();
    }
  }

  // STRATEGY 3: Deep Scan (Brute Force)
  // If no code blocks worked, look for raw JSON in the text
  if (!cvUpdate) {
    const deepScanResult = findLargestJSON(raw);
    if (deepScanResult) {
      cvUpdate = deepScanResult;
      // We don't remove text here as it might overlap with the message, 
      // just use the data and keep the message as is (or try to strip the JSON part if distinct)
      if (import.meta.env.DEV) console.log("[parseAIResponse] Used Deep Scan JSON");
    }
  }

  // Clean up strategy markers from visible message
  message = message.replace(/\[STRATEGY\]:?\s*/gi, "").trim();

  // Final cleanup: strip any remaining JSON/code blocks from visible message
  message = message
    .replace(/```json_cv_update[\s\S]*?```/g, '')
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();

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
