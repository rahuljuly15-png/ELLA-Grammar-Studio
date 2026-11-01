# ELLA Grammar Studio (v2.1) — AI Review & Context Handoff

> **इस फ़ाइल का उपयोग कैसे करें:** इस पूरी फ़ाइल को कॉपी करें या अपलोड करें और किसी भी AI (ChatGPT, Claude, DeepSeek, Gemini आदि) को भेजें और नीचे दिया गया प्रॉम्प्ट लिखें:
> *"यह मेरे प्रोजेक्ट ELLA Grammar Studio (v2.1) का आर्किटेक्चर, कोडबेस स्थिति और रोडमैप है। कृपया इसका निष्पक्ष विश्लेषण (Code & Architecture Audit) करें और मुझे सुझाव दें।"*

---

## 1. प्रोजेक्ट अवलोकन (Project Overview)
- **नाम:** ELLA Grammar Studio (v2.1)
- **उद्देश्य:** कक्षा 6 से 10 (विशेषकर कक्षा 7) के हिंदी माध्यम और द्विभाषी छात्रों के लिए एक **Zero-Cost, Local-First, Bilingual Inductive Grammar Studio**।
- **बजट लक्ष्य:** ₹0 (100% Free of Cost)। कोई पेड सर्वर या पेड API नहीं।
- **आर्किटेक्चर:** Local-First PWA (Vite + React 19 + TypeScript + Tailwind CSS v4 + Dexie.js) $\rightarrow$ भविष्य में Capacitor.js से Native Android APK।
- **लोकेशन:** `C:\Users\rahul\ELLA-Grammar-Studio`

---

## 2. वर्तमान स्थिति (Stage 1 Complete)
इस प्रोजेक्ट का **Stage 1 (Core Offline Loop)** 100% बन चुका है और लाइव चल रहा है:
1. **5 Core Tables (Dexie.js IndexedDB)**:
   - `students` (छात्र प्रोफ़ाइल)
   - `grammar_points` (विषय और JSON पाठ सामग्री)
   - `review_states` (Dual-Rating FSRS Spaced Repetition)
   - `session_logs` (छात्र के लिखे वाक्य और आत्म-स्पष्टीकरण)
   - `error_patterns` (पकड़ी गई गलतियाँ, टैग: `caught_by: 'offline_rule'`)
2. **4 लर्निंग इंजन और 6 लेवल्स में 21 टॉपिक्स (Class 7 Syllabus)**:
   - *Engine 1: The Sentence Lego Engine* (Articles, Nouns, Pronouns, Punctuation, Adjectives, Adverbs, Prepositions, Conjunctions, SVO Blocks)
   - *Engine 2: The Time & Mood Slider* (Verb Forms, Subject-Verb Agreement, Tense Timeline, Modal Meter)
   - *Engine 3: The Perspective Transformer* (Active ↔ Passive Voice, Direct ↔ Indirect Speech)
   - *Engine 4: The Guided Blueprint Studio* (Word-Lab, Unseen Passages, Notice Writing, Letters/Applications, Story/Essay)
3. **ऑफलाइन रूल इंजन (`offlineRuleEngine.ts`)**:
   - Regex आधारित 0ms एरर डिटेक्शन:
     - Articles (Silent H, consonant vowel sounds, acronyms, unique objects)
     - Subject-Verb Agreement (Singular s/es vs Plural base verb)
     - Adjectives (Double comparatives: *more taller* forbidden)
     - Prepositions of Time/Place (*at 5 PM*, *on Monday*)
     - Modals (Modal + Base verb)
   - *Max 2 Errors Rule* (कम संज्ञानात्मक भार) और 1-Click "Apply Fix" बटन।
4. **एर्गोनॉमिक UI (`App.tsx`)**:
   - **Progressive Disclosure (3 Views)**:
     - *आज का अभ्यास (Today's Cycle)*: विषय बदलने का ड्रॉपडाउन, स्क्रीन पर लाइव USE इनपुट बॉक्स और रियल-टाइम फ़ीडबैक बॉक्स, तथा एस्केप हैच।
     - *कौशल मानचित्र (Mastery Map)*: चारों इंजनों और 21 विषयों का इंटरैक्टिव बोर्ड।
     - *सेटिंग्स व बैकअप (Settings)*: 1-Click JSON Backup & Import, DPDP Act 2023 प्राइवेसी कम्प्लायंस।
   - **₹0 Web Speech API**: हर वाक्य के पास इन-बिल्ट स्पीकर आइकन जिससे छात्र शुद्ध भारतीय-अंग्रेजी उच्चारण सुन सकते हैं।

---

## 3. फ़ाइल डायरेक्टरी संरचना (Directory Structure)
```plaintext
C:\Users\rahul\ELLA-Grammar-Studio/
├── index.html                   # PWA स्टैंडअलोन सेटिंग्स और थीम कलर
├── vite.config.ts               # Tailwind v4 Vite प्लगइन कॉन्फ़िगरेशन
├── tsconfig.app.json            # TypeScript Strict Mode + Bundler Resolution
├── package.json                 # react 19, dexie, lucide-react, tailwindcss v4
├── public/
│   └── manifest.json            # PWA Manifest
└── src/
    ├── index.css                # @import "tailwindcss";
    ├── App.tsx                  # 3-View Progressive Disclosure Container (Cycle, Map, Settings)
    ├── db/
    │   └── dexieDb.ts           # 5 कोर टेबल्स का Dexie.js स्कीमा
    ├── engines/
    │   └── offlineRuleEngine.ts # 100% ऑफ़लाइन Regex ग्रामर चेकर व Dexie सेवर
    ├── services/
    │   └── backupService.ts     # 1-Click JSON डेटाबेस एक्सपोर्ट और रीस्टोर
    └── data/
        ├── curriculum.ts        # 4 इंजनों और 21 टॉपिक्स की मास्टर रजिस्ट्री
        ├── topicLoader.ts       # सभी टॉपिक्स का टाइप-सेफ लोडर
        └── topics/              # 6-Step Inductive Golden JSON फ़ाइलें
            ├── level1-articles-01.json
            ├── level1-noun-02.json
            ├── level2-adjective-05.json
            ├── level3-subject-verb-agreement-10.json
            ├── level3-tenses-timeline-11.json
            ├── level5-active-passive-15.json
            └── level6-notice-writing-19.json
```

---

## 4. मुख्य कोड स्निपेट्स (Core Code Architecture)

### 4.1 डेटाबेस स्कीमा (`src/db/dexieDb.ts`)
```typescript
import Dexie, { type EntityTable } from 'dexie';

export interface Student { id?: number; name: string; current_level: number; created_at: Date; }
export interface GrammarPoint { topic_id: string; title: string; lesson_json: any; }
export interface ReviewState { id?: number; student_id: number; topic_id: string; rule_recall_score: number; production_accuracy_score: number; next_due_date: Date; }
export interface SessionLog { id?: number; student_id: number; topic_id: string; student_sentence?: string; self_explanation_note?: string; timestamp: Date; }
export interface ErrorPattern { id?: number; student_id: number; topic_id: string; wrong_input: string; corrected_output: string; caught_by: 'offline_rule' | 'gemini_ai'; timestamp: Date; }

export const db = new Dexie('ELLAGrammarDB') as Dexie & {
  students: EntityTable<Student, 'id'>;
  grammar_points: EntityTable<GrammarPoint, 'topic_id'>;
  review_states: EntityTable<ReviewState, 'id'>;
  session_logs: EntityTable<SessionLog, 'id'>;
  error_patterns: EntityTable<ErrorPattern, 'id'>;
};

db.version(1).stores({
  students: '++id, name',
  grammar_points: 'topic_id, title',
  review_states: '++id, student_id, topic_id',
  session_logs: '++id, student_id, topic_id',
  error_patterns: '++id, student_id, topic_id'
});
```

### 4.2 1-Click JSON Backup Service (`src/services/backupService.ts`)
```typescript
export async function exportDatabaseToJson(): Promise<void> {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'ELLA Grammar Studio v2.1',
    data: {
      students: await db.students.toArray(),
      grammar_points: await db.grammar_points.toArray(),
      review_states: await db.review_states.toArray(),
      session_logs: await db.session_logs.toArray(),
      error_patterns: await db.error_patterns.toArray(),
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ella-grammar-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
}
```

---

## 5. आगामी रोडमैप (Future Stages)
- **Stage 2**: Cloudflare Worker प्रॉक्सी + Google Gemini API (gemini-2.5-flash Free Tier) उन 15% खुले वाक्यों के लिए जिन्हें Regex नहीं पकड़ता।
- **Stage 3**: Dual-Rating FSRS शेड्यूलर (Declarative vs Procedural memory stability)।
- **Stage 4**: Capacitor.js + GitHub Actions द्वारा 100% मुफ़्त Native Android APK बिल्ड।
- **Stage 5**: Teacher Heatmap Dashboard (सर्वाधिक सामान्य गलतियों का विश्लेषण)।

---

## 6. अन्य AI से पूछने के लिए अनुशंसित प्रश्न (Audit Questions)
1. *क्या यह आर्किटेक्चर ग्रामीण और अर्ध-शहरी भारतीय छात्रों (कक्षा 7) के लिए संज्ञानात्मक दृष्टि से उपयुक्त है?*
2. *क्या Dexie.js + 1-Click JSON Backup का ऑफ़लाइन मॉडल ₹0 लागत और डेटा सुरक्षा (DPDP Act 2023) के लिए पर्याप्त है?*
3. *Offline Rule Engine में और कौन से सामान्य छात्र-त्रुटि पैटर्न (Edge Cases) जोड़े जाने चाहिए?*
4. *Stage 2 में Cloudflare Worker + Gemini 2.5 Flash जोड़ते समय किन सुरक्षा और लेटेंसी बातों का ध्यान रखें?*

