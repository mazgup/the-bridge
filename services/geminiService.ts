// ============================================================
// Gemini Service — The "Brain" (PRD v3.0)
// ============================================================
// Model: Gemini 3 Flash Preview
// Role: Content & Logic ONLY. Never touches design.
// Output: Strict JSON matching CVData schema.
// ============================================================

import { CVData, CVProfile, INITIAL_CV_PROFILE, INITIAL_CV_DATA } from "../components/cv/CVTypes";

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
// Streaming CV Conversation
// ============================================================
export async function streamCVConversation(
  history: ChatMessage[],
  currentCV: CVData,
  latestUserMessage: string,
  onChunk?: (partialText: string) => void
): Promise<AIResponse> {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return {
      message: "[System Error]: Missing VITE_FIREBASE_PROJECT_ID in environment variables.",
    };
  }

  const isDev = import.meta.env.DEV;
  // If running locally, you might want to call the emulator. Otherwise call the deployed function
  const functionUrl = isDev
    ? `http://127.0.0.1:5001/${projectId}/us-central1/streamCVConversation`
    : `https://us-central1-${projectId}.cloudfunctions.net/streamCVConversation`;

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, currentCV, latestUserMessage }),
    });

    if (!response.ok) {
      let errMessage = `Cloud Function returned ${response.status}`;
      try { const errObj = await response.json(); errMessage = errObj.error || errMessage; } catch (e) { }
      throw new Error(errMessage);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    if (reader) {
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.substring(6).trim();
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr);
                  if (data.error) throw new Error(data.error);
                  if (data.text) {
                    fullText += data.text;
                    if (onChunk) onChunk(fullText);
                  }
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }
        }
      }
    }

    // --- Parse the complete response ---
    return parseAIResponse(fullText, currentCV);
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return {
      message: `[System Error]: ${error.message || error.toString()}`,
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
