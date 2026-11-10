---
name: ella-grammar-studio
description: Bilingual (Hindi-English) Inductive Grammar Engine, Evaluator & Tutor for Classes 6-10 based on ELLA Grammar Studio architecture. Use to inspect grammar, run automated ESL benchmarks, generate bilingual exercises, or integrate ELLA rules into external apps.
---

# ELLA Grammar Studio Skill

This skill allows AI agents to interface with **ELLA Grammar Studio v3.0** — a zero-cost, local-first, bilingual inductive English grammar learning platform designed for Indian school students (Classes 6–10).

---

## 1. Core Architecture & Philosophy

- **Pedagogy**: Inductive Discovery Method (*Notice $\rightarrow$ Hypothesize $\rightarrow$ Clarify $\rightarrow$ Practice $\rightarrow$ Use $\rightarrow$ Schedule*). Students discover grammar rules through contrasting bilingual patterns rather than rote memorization.
- **Latency & Cost**: 0ms offline regex rule checking, ₹0 infrastructure cost, privacy-first local Dexie.js storage (DPDP Act 2023 compliant).
- **Curriculum**: 4 Core Learning Engines across 6 levels:
  1. `sentence_lego` (Sentence Lego Engine: Parts of Speech, Articles, SVO syntax)
  2. `time_mood_slider` (Time & Mood Slider: Verbs, Tenses, Modals, Subject-Verb Agreement)
  3. `perspective_transformer` (Perspective Transformer: Active/Passive Voice, Direct/Indirect Speech)
  4. `blueprint_studio` (Guided Blueprint Studio: Vocab lab, Notice writing, Letters, Essays)

---

## 2. Using the Engine Programmatically (For External Apps & AI)

External apps (mobile apps, web services, chatbots) or AI agents can directly use the grammar evaluation engine without the UI:

### Direct TypeScript / Node Import
```typescript
import { checkSentenceOffline, type RuleCheckResult } from './src/engines/offlineRuleEngine';

// Evaluate any sentence
const result: RuleCheckResult = checkSentenceOffline("She can plays football", "level3-modals-meter-12");

console.log(result.isValid); // false
console.log(result.errors); 
// [
//   {
//     ruleId: "modal_requires_base_verb",
//     matchedText: "can plays",
//     suggestedText: "can play",
//     explanationHi: "'can' के बाद हमेशा क्रिया का पहला मूल रूप (play) आता है, s/es नहीं।",
//     inductiveHintHi: "Modals के बाद क्रिया में s/es नहीं लगता।"
//   }
// ]
console.log(result.correctedSentence); // "She can play football"
```

### JSON REST / Headless API Payload
```json
// POST /api/check-grammar
{
  "sentence": "He is a honest man",
  "topicId": "level1-articles-01"
}

// Response
{
  "isValid": false,
  "errors": [
    {
      "ruleId": "silent_h_requires_an",
      "matchedText": "a honest",
      "suggestedText": "an honest",
      "explanationHi": "'honest' में 'h' साइलेंट है, पहली आवाज़ स्वर ('ऑ') जैसी है। इसलिए 'an honest' आएगा।",
      "inductiveHintHi": "बोलकर देखें: क्या पहली आवाज़ अ से औ जैसी है?"
    }
  ],
  "correctedSentence": "He is an honest man"
}
```

---

## 3. Supported ESL Rules & Indian Classroom Traps

The engine handles critical high-frequency error patterns common among Hindi-medium and bilingual learners:

| Category | Typical Error | Expected Correction | Rule ID |
| :--- | :--- | :--- | :--- |
| **Articles** | *a hour*, *a honest* | *an hour*, *an honest* | `silent_h_requires_an` |
| **Articles** | *an university*, *an European* | *a university*, *a European* | `consonant_sound_requires_a` |
| **Articles** | *a MLA*, *a MBBS*, *a FIR* | *an MLA*, *an MBBS*, *an FIR* | `acronym_vowel_sound_requires_an` |
| **Articles** | *a sun*, *a moon* | *the sun*, *the moon* | `unique_object_requires_the` |
| **Did + V2** | *did went*, *didn't saw* | *did go*, *didn't see* | `did_plus_base_verb` |
| **Have + V2** | *have went*, *has ate* | *have gone*, *has eaten* | `perfect_tense_requires_v3` |
| **One of** | *one of my friend* | *one of my friends* | `one_of_requires_plural` |
| **Redundancy** | *discuss about*, *reply back* | *discuss*, *reply* | `discuss_no_about`, `pleonasm_back_forbidden` |
| **Prepositions**| *married with*, *good in maths* | *married to*, *good at maths* | `married_to_preposition`, `good_at_subject` |
| **Subject-Verb**| *he don't*, *the dog bark* | *he doesn't*, *the dog barks* | `singular_subject_doesnt`, `singular_subject_needs_verb_s` |
| **Comparatives**| *more taller*, *more smarter* | *taller*, *smarter* | `double_comparative_forbidden` |
| **Modals + s** | *can plays*, *will watches* | *can play*, *will watch* | `modal_requires_base_verb` |
| **Time/Day** | *in 5 PM*, *at Monday* | *at 5 PM*, *on Monday* | `preposition_clock_time_at`, `preposition_day_on` |

---

## 4. How to Measure & Collect Feedback

### A. Measuring Production Accuracy
Run the automated test suite to verify engine precision:
```powershell
npm test
```
The test suite in [`src/engines/offlineRuleEngine.test.ts`](file:///c:/Users/rahul/RahulCode/ELLA-Grammar-Studio/src/engines/offlineRuleEngine.test.ts) evaluates over 100 benchmark sentences covering both real student errors and look-alikes.

### B. Tracking Student Error Frequency & Retention
In the local IndexedDB (`ELLAGrammarDB`), three tables provide telemetry metrics:
1. `session_logs`: Total practice attempts, timestamps, self-explanation notes (`self_explanation_note`).
2. `error_patterns`: Specific error tags, wrong inputs, full sentence contexts, and whether caught by offline regex or AI.
3. `review_states`: FSRS review dates, `rule_recall_score`, and `production_accuracy_score`.

### C. Feedback Loop (LLM-as-a-Judge)
For open-ended sentences that pass offline regex, an external LLM can provide contextual feedback:
1. Validate syntactic correctness.
2. Evaluate semantic coherence and grade-level appropriateness (Classes 6–10).
3. Always respond in warm, supportive Hindi with Devanagari script.
