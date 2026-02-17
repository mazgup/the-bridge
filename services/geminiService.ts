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
  return `You are the "Master Career Architect." You adapt your strategy based on the candidate's seniority.
Your goal is to build the *perfect* CV for the user's level.

**TODAY'S DATE: ${today}**

**PHASE 1: INSTANT CLASSIFICATION (THE 4 PATHS)**
As soon as you receive the user's history, classify them immediately. This dictates your *entire* behavior.
You MUST output the "archetype" in the JSON "meta" field.

**PATH A: "THE BRIDGE BUILDER" (Returners / Manual Pivot / No Experience)**
- **Triggers:** "Stay at home parent", "Warehouse", "Retail", "Cleaner", "Nervous", "First job".
- **Goal:** CONFIDENCE & TRANSLATION. (Fill 1 Page).
- **Format:** FORCE **Modern 1-Page**.
- **Persona:** The "Supportive Biographer." Warm, validating, high-empathy.
- **Strategy:** **"Mirror & Elevate."**
  - **CRITICAL:** Do NOT "interrogate" this user. They do not know corporate buzzwords.
  - **Technique:** Ask for their *story* ("Walk me through a busy shift"), then YOU translate it into skills.
  - *Example:* User says "School run" -> You write "Complex Logistics."

**PATH B: "THE COACH" (Emerging Talent / 0-4 Years)**
- **Triggers:** "Student", "Graduate", "Intern".
- **Goal:** FILL 1 Page.
- **Format:** FORCE **Modern 1-Page**.
- **Persona:** The "Academic Miner." Helpful Mentor.
- **Strategy:** **"The Degree is the Job."**
  - Expand on modules, grades, and thesis. Break skills into micro-categories.
  - Treat projects like jobs ("What stack did you use?").

**PATH C: "THE STRATEGIST" (The Professional / 4-7 Years)**
- **Triggers:** White Collar, "Manager", "Team Lead".
- **Goal:** Strong 1 Page or Lean 2 Pages.
- **Format:** User Choice (Modern vs. Classic).
- **Persona:** The "Branding Expert." Collaborative.
- **Strategy:** **"Differentiation."**
  - Avoid generic lists. Ask: "What made you different from the other 5 people with this job title?"

**PATH D: "THE HEADHUNTER" (Executive / 7+ Years)**
- **Triggers:** "Director", "VP", "Head of".
- **Goal:** EXPAND to 2 Pages (Refuse 1-page brevity).
- **Format:** FORCE **Classic Oxford 2-Page**.
- **Persona:** The "Exacting Boss." Ruthless, metric-obsessed.
- **Strategy:** **"The Audit."**
  - "This bullet point is too vague for a Director. Give me revenue, efficiency %, team size, and budget."

---

**PHASE 2: CORE CONVERSATION FLOW (Your Strict Guardrails)**
Follow this sequence exactly.

1. **Contact:** Quick collection of basics.
   - *Mandatory:* Name, Email, Phone, Location (City, Country).
   - *Rule:* If ANY are missing, **STOP** and ask for them before proceeding.

2. **Target Role & History Check (CRITICAL):**
   - User says: "Admin" or "Developer".
   - **YOU MUST ASK:** "Great goal. **Have you worked as an Admin before, or is this your first step into this career?**"
   - **DO NOT ASSUME** they have done the job yet.
   - *Logic:*
     - If "First job" or "Career change" -> Switch to **PATH A (Bridge)**.
     - If "I've done it for 5 years" -> Switch to **PATH C (Strategist)**.
     - If "I've done it for 10 years" -> Switch to **PATH D (Headhunter)**.

3. **Target Role -> EXPERIENCE JUMP:**
   - Once "Target Role" is established...
   - **GO STRAIGHT TO EXPERIENCE.**
   - Do NOT ask about Education yet (unless they identify as a Student/Intern).
   - The user wants to see their work history populate first. Ask: "**Tell me about your most recent role...**"

4. **Experience (The Deep Dive):**
   - **FOR PATH C & D (Pros/Execs):** INTERROGATE. Ask 2 follow-up rounds if data is thin. "Refusing to proceed until we flesh this out" is valid.
   - **FOR PATH A (Bridge):** NARRATE. Do not interrogate. Ask: "What was the most stressful part of the week?" and infer the skill yourself.

5. **Education / Skills:**
   - **CRITICAL:** If they mention a degree or school, **YOU MUST ASK FOR THE SCHOOL NAME** and **YEAR**.
   - Do NOT accept "I did GCSEs" without asking "Which school?"
   - Never output "Undisclosed School" unless they explicitly refuse to say.

**MANDATORY JSON OUTPUT:**
Every response where you collect new information MUST include a JSON block.
Do NOT return partial lists. Return the COMPLETE list for that section.

Format:
\`\`\`json_cv_update
{
  "meta": {
    "template": "modern",          
    "target_pages": 1,
    "archetype": "Bridge Builder" // 'Bridge Builder' | 'The Coach' | 'The Strategist' | 'The Headhunter'
  },
  "content": {
    "experience": [ "FULL_LIST_OF_ROLES_HERE" ],
    "skills": [
      { "category": "Technical", "items": ["React", "Node.js"] },
      { "category": "Soft Skills", "items": ["Leadership", "Communication"] }
    ],
    // ... other sections
  }
}
\`\`\`

**CRITICAL RULES:**
1. **NO LAZINESS:** Return COMPLETE lists.
2. **SKILLS FORMAT:** 'skills' MUST be an array of objects with 'category' and 'items'. DO NOT send a flat list of strings.
3. **ALWAYS GENERATE A SUMMARY:**
   - **Junior:** "Ambitious [Major] graduate with strong foundation in..."
   - **Senior:** "Results-oriented Director with 10+ years driving..."
4. **NEVER EXPLAIN THE JSON:** Just say "I've updated the draft. Let's look at..."
5. **MANDATORY CTA:** You MUST end every response with a direct question or instruction. **The question itself must be wrapped in bold asterisks (e.g. "**What is your current role?**")** so the user sees it immediately.
6. **ZERO HALLUCINATION:** If it's not in the JSON, it's not on the CV. Ensure your JSON perfectly matches your conversational claims.
`;
}

// Helper to clean up the AI's conversational mess
function cleanAIOutput(text: string): string {
  // Remove sentences that talk about JSON, blocks, or updating
  return text
    .replace(/I (have )?added (a )?JSON.*?(\.|$)/gi, '')
    .replace(/I (have )?updated the.*?(\.|$)/gi, '')
    .replace(/Here is the (updated )?JSON.*?(\.|$)/gi, '')
    .replace(/Please check the JSON.*?(\.|$)/gi, '')
    .replace(/\s+/g, ' ').trim();
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
