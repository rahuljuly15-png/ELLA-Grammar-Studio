import type { StepKey } from '../components/ella/PracticeCycleView';

export interface EllaAIContext {
  studentName: string;
  currentStep: StepKey;
  topicTitle: string;
  goldenRule?: string;
  studentSentence?: string;
  errors?: string[];
  selectedHypothesisText?: string;
  isHypothesisCorrect?: boolean | null;
}

const STORAGE_KEY = 'ella_gemini_api_key';

/**
 * Get stored Gemini API key from localStorage.
 */
export function getStoredGeminiKey(): string | null {
  if (typeof window === 'undefined') return null;
  const key = localStorage.getItem(STORAGE_KEY);
  return key && key.trim() ? key.trim() : null;
}

/**
 * Save Gemini API key in localStorage.
 */
export function setStoredGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Test a Gemini API key with a fast, lightweight ping.
 */
export async function testGeminiConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: 'कृपया एक वैध API Key दर्ज करें।' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Say "नमस्ते" in one word.' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || response.statusText;
      return {
        success: false,
        message: `कनेक्शन विफल (${response.status}): ${errMsg}`,
      };
    }

    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        message: 'सफलतापूर्वक कनेक्टेड! Google Gemini AI अब ELLA में सक्रिय है। ⚡',
      };
    }

    return { success: false, message: 'अमान्य प्रतिक्रिया प्राप्त हुई।' };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'नेटवर्क त्रुटि';
    return { success: false, message: `कनेक्शन त्रुटि: ${err}` };
  }
}

/**
 * Ask Ella AI (Gemini 1.5 Flash) with deep pedagogical Socratic context.
 * Returns concise, punchy (2-3 sentences max) Hinglish/Hindi explanation.
 */
export async function askEllaAI(userQuery: string, context: EllaAIContext): Promise<string | null> {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) return null;

  const name = context.studentName?.trim() || 'Ishu';

  const systemPrompt = `You are "एला जिनी (Ella Genie)", an exceptionally intelligent, caring, and pedagogical AI English Grammar Tutor for Indian students (Classes 6–10 CBSE/State Board).

CORE PERSONA & TEACHING RULES:
1. Address the student warmly as "${name}".
2. Language: Natural, conversational Hinglish (Hindi written in Devanagari script mixed with key English grammar terms).
3. Brevity is sacred: Respond in STRICTLY 2 to 3 concise, punchy sentences. NEVER write long paragraphs or bullet lists.
4. Pedagogical Focus: Explain WHY a rule works through sounds/phonetics (आवाज़/ध्वनि) and real speech rather than rote memorization.
5. Socratic guidance: If the student made an error, point out the specific word, explain the reason kindly, and encourage them to fix it.
6. Tone: Loving, enthusiastic, magical, never patronizing or overly academic.`;

  const contextDetails = [
    `Current Grammar Topic: "${context.topicTitle}"`,
    `Current Learning Step: "${context.currentStep}"`,
    context.goldenRule ? `Topic Secret Rule: "${context.goldenRule}"` : null,
    context.studentSentence ? `Student's Current Sentence: "${context.studentSentence}"` : null,
    context.errors && context.errors.length > 0 ? `Detected Errors in Sentence: ${context.errors.join('; ')}` : null,
    context.selectedHypothesisText ? `Student Selected Hypothesis: "${context.selectedHypothesisText}" (Is Correct: ${context.isHypothesisCorrect})` : null,
    `Student Question / Input: "${userQuery}"`,
  ].filter(Boolean).join('\n');

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: contextDetails }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 180,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API call failed, status:', response.status);
      return null;
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (replyText && replyText.trim()) {
      return replyText.trim();
    }
    return null;
  } catch (e) {
    console.warn('Error querying Gemini AI:', e);
    return null;
  }
}
