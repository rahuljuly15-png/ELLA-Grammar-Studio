import { db } from '../db/dexieDb';

export interface RuleError {
  ruleId: string;
  matchedText: string;
  suggestedText: string;
  index: number;
  explanationHi: string;
  severity: 'error' | 'warning';
}

export interface RuleCheckResult {
  isValid: boolean;
  inputSentence: string;
  correctedSentence: string;
  errors: RuleError[];
  positiveFeedbackHi?: string;
}

// 1. ARTICLES: Silent 'h' words that start with vowel sound (require 'an')
const SILENT_H_WORDS = [
  'hour', 'hours', 'hourly', 
  'honest', 'honesty', 'honestly', 
  'honor', 'honors', 'honour', 'honourable', 'honorable', 
  'heir', 'heiress'
];

// 2. ARTICLES: Vowel-letter words starting with consonant sound /juː/ or /w/ (require 'a')
const CONSONANT_SOUND_VOWEL_WORDS = [
  'university', 'universities', 'uniform', 'uniforms', 
  'union', 'unions', 'unit', 'units', 
  'unicorn', 'unicorns', 'unique', 'universal', 
  'user', 'users', 'useful', 'useless', 'utensil', 'utensils',
  'euro', 'euros', 'european', 'europeans', 
  'eucalyptus', 'eulogy', 'euphemism',
  'one-eyed', 'one-way', 'one-rupee', 'one-time', 'one-man'
];

// 3. ARTICLES: Acronyms/Letters that start with vowel sound (require 'an')
const VOWEL_SOUND_ACRONYMS = [
  'mla', 'mp', 'mba', 'msc', 'mcom', 'mtech', 'mbbs', 
  'sms', 'sos', 'fbi', 'fir', 'hr', 'nri', 'rtc', 'rbi', 
  'x-ray', 'sdm', 'sho', 'llb', 'ias', 'ips', 'ifs'
];

// 4. Unique / Universal items that require 'the'
const UNIQUE_ITEMS = [
  'sun', 'moon', 'earth', 'sky', 'universe', 
  'taj mahal', 'red fort', 'ganges', 'himalayas', 'pacific ocean'
];

/**
 * Multi-topic Offline Regex Rule Checker
 * Covers Articles, Subject-Verb Agreement, Adjectives Degrees, Prepositions, and Modals
 */
export function checkSentenceOffline(sentence: string, _topicId?: string): RuleCheckResult {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return {
      isValid: false,
      inputSentence: sentence,
      correctedSentence: sentence,
      errors: [
        {
          ruleId: 'empty_input',
          matchedText: '',
          suggestedText: '',
          index: 0,
          explanationHi: 'कृपया अभ्यास के लिए एक अंग्रेजी वाक्य लिखें।',
          severity: 'error',
        },
      ],
    };
  }

  const errors: RuleError[] = [];
  let corrected = trimmed;

  // ========================================================
  // RULE SET 1: ARTICLES (A, An, The)
  // ========================================================
  // Silent 'h' -> requires 'an'
  const silentHRegex = new RegExp(`\\b([Aa])\\s+((?:(?:very|quite|most)\\s+)?(${SILENT_H_WORDS.join('|')}))\\b`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = silentHRegex.exec(trimmed)) !== null) {
    const isCap = match[1][0] === match[1][0].toUpperCase();
    const correctArticle = isCap ? 'An' : 'an';
    const suggested = `${correctArticle} ${match[2]}`;
    errors.push({
      ruleId: 'silent_h_requires_an',
      matchedText: match[0],
      suggestedText: suggested,
      index: match.index,
      explanationHi: `'${match[3]}' में 'h' साइलेंट है, पहली आवाज़ स्वर ('आ/ऑ') जैसी है। इसलिए 'a' नहीं, '${correctArticle} ${match[3]}' आएगा।`,
      severity: 'error',
    });
  }

  // Consonant sound /juː/ or /w/ -> requires 'a'
  const consonantVowelRegex = new RegExp(`\\b([Aa]n)\\s+((?:(?:very|quite|most)\\s+)?(${CONSONANT_SOUND_VOWEL_WORDS.join('|')}))\\b`, 'gi');
  while ((match = consonantVowelRegex.exec(trimmed)) !== null) {
    const isCap = match[1][0] === match[1][0].toUpperCase();
    const correctArticle = isCap ? 'A' : 'a';
    const suggested = `${correctArticle} ${match[2]}`;
    errors.push({
      ruleId: 'consonant_sound_requires_a',
      matchedText: match[0],
      suggestedText: suggested,
      index: match.index,
      explanationHi: `'${match[3]}' की शुरुआत 'य' या 'व' (व्यंजन ध्वनि) से होती है। इसलिए 'an' नहीं, '${correctArticle} ${match[3]}' आएगा।`,
      severity: 'error',
    });
  }

  // Acronym with vowel sound -> requires 'an'
  const acronymRegex = new RegExp(`\\b([Aa])\\s+(${VOWEL_SOUND_ACRONYMS.join('|')})\\b`, 'gi');
  while ((match = acronymRegex.exec(trimmed)) !== null) {
    const acronym = match[2].toUpperCase();
    const isCap = match[1][0] === match[1][0].toUpperCase();
    const correctArticle = isCap ? 'An' : 'an';
    errors.push({
      ruleId: 'acronym_vowel_sound_requires_an',
      matchedText: match[0],
      suggestedText: `${correctArticle} ${match[2]}`,
      index: match.index,
      explanationHi: `'${acronym}' का उच्चारण स्वर ध्वनि ('एम', 'एस', 'एफ') से शुरू होता है। इसलिए '${correctArticle} ${acronym}' आएगा।`,
      severity: 'error',
    });
  }

  // General 'a' before obvious vowels (a, e, i, o)
  const generalVowelRegex = /\b([Aa])\s+([aeioAEIO][a-zA-Z]+)\b/g;
  while ((match = generalVowelRegex.exec(trimmed)) !== null) {
    const word = match[2].toLowerCase();
    if (CONSONANT_SOUND_VOWEL_WORDS.includes(word)) continue;
    const isCap = match[1][0] === match[1][0].toUpperCase();
    const correctArticle = isCap ? 'An' : 'an';
    errors.push({
      ruleId: 'general_vowel_requires_an',
      matchedText: match[0],
      suggestedText: `${correctArticle} ${match[2]}`,
      index: match.index,
      explanationHi: `'${match[2]}' स्वर ध्वनि से शुरू होता है, इसलिए 'a' नहीं, '${correctArticle} ${match[2]}' आएगा।`,
      severity: 'error',
    });
  }

  // General 'an' before common consonants
  const generalConsonantRegex = /\b([Aa]n)\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ][a-zA-Z]+)\b/g;
  while ((match = generalConsonantRegex.exec(trimmed)) !== null) {
    const word = match[2].toLowerCase();
    if (SILENT_H_WORDS.includes(word) || VOWEL_SOUND_ACRONYMS.includes(word)) continue;
    const isCap = match[1][0] === match[1][0].toUpperCase();
    const correctArticle = isCap ? 'A' : 'a';
    errors.push({
      ruleId: 'general_consonant_requires_a',
      matchedText: match[0],
      suggestedText: `${correctArticle} ${match[2]}`,
      index: match.index,
      explanationHi: `'${match[2]}' व्यंजन ध्वनि से शुरू होता है, इसलिए 'an' नहीं, '${correctArticle} ${match[2]}' आएगा।`,
      severity: 'error',
    });
  }

  // Unique objects requiring 'the'
  const uniqueRegex = new RegExp(`\\b([Aa]n?)\\s+(${UNIQUE_ITEMS.join('|')})\\b`, 'gi');
  while ((match = uniqueRegex.exec(trimmed)) !== null) {
    const isCap = match[1][0] === match[1][0].toUpperCase();
    const correctArticle = isCap ? 'The' : 'the';
    errors.push({
      ruleId: 'unique_object_requires_the',
      matchedText: match[0],
      suggestedText: `${correctArticle} ${match[2]}`,
      index: match.index,
      explanationHi: `'${match[2]}' अद्वितीय/विशिष्ट है, इसलिए 'a/an' नहीं, '${correctArticle}' का प्रयोग होता है।`,
      severity: 'error',
    });
  }

  // ========================================================
  // RULE SET 2: SUBJECT-VERB AGREEMENT
  // ========================================================
  // Singular subject missing 's' (e.g. "He play", "She go", "The dog bark")
  const singularMissingSRegex = /\b(he|she|it|the dog|the boy|the teacher|my brother|my sister)\s+(play|bark|run|eat|read|teach|write|cook|like|live)\b/gi;
  while ((match = singularMissingSRegex.exec(trimmed)) !== null) {
    const subj = match[1];
    const verb = match[2];
    const sVerb = verb === 'teach' ? 'teaches' : (verb.endsWith('ch') || verb.endsWith('sh') || verb.endsWith('o') ? `${verb}es` : `${verb}s`);
    errors.push({
      ruleId: 'singular_subject_needs_verb_s',
      matchedText: match[0],
      suggestedText: `${subj} ${sVerb}`,
      index: match.index,
      explanationHi: `'${subj}' एकवचन (Singular) कर्ता है। इसके साथ क्रिया में 's/es' जुड़ेगा (${sVerb})।`,
      severity: 'error',
    });
  }

  // Plural subject wrongly having 's' on verb (e.g. "They plays", "We cooks", "The dogs barks")
  const pluralWrongSRegex = /\b(they|we|the dogs|the boys|the teachers|the students|the children)\s+(plays|barks|runs|eats|reads|teaches|writes|cooks|likes|lives)\b/gi;
  while ((match = pluralWrongSRegex.exec(trimmed)) !== null) {
    const subj = match[1];
    const verbWithS = match[2];
    const baseVerb = verbWithS.endsWith('es') ? verbWithS.slice(0, -2) : verbWithS.slice(0, -1);
    errors.push({
      ruleId: 'plural_subject_needs_base_verb',
      matchedText: match[0],
      suggestedText: `${subj} ${baseVerb}`,
      index: match.index,
      explanationHi: `'${subj}' बहुवचन (Plural) कर्ता है। बहुवचन के साथ क्रिया बिना 's' के (${baseVerb}) आएगी।`,
      severity: 'error',
    });
  }

  // ========================================================
  // RULE SET 3: DOUBLE COMPARATIVES (Adjectives)
  // ========================================================
  // e.g. "more taller", "most highest", "more better"
  const doubleComparativeRegex = /\b(more\s+(taller|faster|braver|smarter|better|higher|stronger))\b/gi;
  while ((match = doubleComparativeRegex.exec(trimmed)) !== null) {
    const singleComp = match[2];
    errors.push({
      ruleId: 'double_comparative_forbidden',
      matchedText: match[0],
      suggestedText: singleComp,
      index: match.index,
      explanationHi: `डबल कम्पैरेटिव ('more' और '-er') एक साथ नहीं लगाते। केवल '${singleComp}' कहना सही है।`,
      severity: 'error',
    });
  }

  // ========================================================
  // RULE SET 4: PREPOSITION OF TIME/PLACE TRAPS
  // ========================================================
  // "on 5 PM", "in 5 PM" -> should be "at 5 PM"
  const clockTimeRegex = /\b(on|in)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|o'clock))\b/gi;
  while ((match = clockTimeRegex.exec(trimmed)) !== null) {
    errors.push({
      ruleId: 'preposition_clock_time_at',
      matchedText: match[0],
      suggestedText: `at ${match[2]}`,
      index: match.index,
      explanationHi: `घड़ी के सटीक समय (Clock Time) के साथ हमेशा 'at' लगता है (जैसे 'at ${match[2]}')।`,
      severity: 'error',
    });
  }

  // "at Monday", "in Monday" -> should be "on Monday"
  const dayDateRegex = /\b(at|in)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi;
  while ((match = dayDateRegex.exec(trimmed)) !== null) {
    const day = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
    errors.push({
      ruleId: 'preposition_day_on',
      matchedText: match[0],
      suggestedText: `on ${day}`,
      index: match.index,
      explanationHi: `दिनों और तारीखों (Days & Dates) के साथ हमेशा 'on' लगता है (जैसे 'on ${day}')।`,
      severity: 'error',
    });
  }

  // ========================================================
  // RULE SET 5: MODAL HELPING VERBS
  // ========================================================
  // "can lifts", "must to study", "should plays"
  const modalWithSRegex = /\b(can|could|may|might|must|should|will|would)\s+([a-zA-Z]+s)\b/gi;
  while ((match = modalWithSRegex.exec(trimmed)) !== null) {
    const modal = match[1];
    const verbWithS = match[2].toLowerCase();
    // exceptions: words like "is", "this", etc.
    if (['this', 'us', 'as', 'his', 'yes', 'always'].includes(verbWithS)) continue;
    const baseVerb = verbWithS.endsWith('es') ? verbWithS.slice(0, -2) : verbWithS.slice(0, -1);
    errors.push({
      ruleId: 'modal_requires_base_verb',
      matchedText: match[0],
      suggestedText: `${modal} ${baseVerb}`,
      index: match.index,
      explanationHi: `मोडल्स (Can, Must, Should) के बाद हमेशा क्रिया का पहला मूल रूप (${baseVerb}) आता है, 's/es' नहीं लगता।`,
      severity: 'error',
    });
  }

  // Apply corrections
  for (const err of errors) {
    corrected = corrected.replace(err.matchedText, err.suggestedText);
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    inputSentence: trimmed,
    correctedSentence: corrected,
    errors,
    positiveFeedbackHi: isValid
      ? 'शानदार! वाक्य व्याकरण और ध्वनि-नियमों के अनुसार 100% सही है।'
      : undefined,
  };
}

// Backward-compatible alias for existing imports
export const checkArticleRules = (sentence: string) => checkSentenceOffline(sentence, 'level1-articles-01');

/**
 * Saves production attempt directly to Dexie.js (offline database)
 */
export async function recordProductionAttempt(
  topicId: string,
  studentSentence: string,
  checkResult: RuleCheckResult,
  selfExplanationNote?: string,
  studentId: number = 1
): Promise<{ sessionId: number; errorIds: number[] }> {
  // 1. Save session log
  const sessionId = (await db.session_logs.add({
    student_id: studentId,
    topic_id: topicId,
    student_sentence: studentSentence,
    self_explanation_note: selfExplanationNote || (checkResult.isValid ? 'Correct production' : 'Contains error'),
    timestamp: new Date(),
  })) as number;

  // 2. Save any error patterns
  const errorIds: number[] = [];
  for (const err of checkResult.errors) {
    const errId = (await db.error_patterns.add({
      student_id: studentId,
      topic_id: topicId,
      wrong_input: err.matchedText,
      corrected_output: err.suggestedText,
      caught_by: 'offline_rule',
      timestamp: new Date(),
    })) as number;
    errorIds.push(errId);
  }

  // 3. Update or create review state
  const existingReview = await db.review_states.where({ student_id: studentId, topic_id: topicId }).first();
  const accuracyScore = checkResult.isValid ? 100 : Math.max(20, 100 - checkResult.errors.length * 30);
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + (checkResult.isValid ? 3 : 1));

  if (existingReview?.id) {
    await db.review_states.update(existingReview.id, {
      production_accuracy_score: accuracyScore,
      rule_recall_score: checkResult.isValid ? 90 : 60,
      next_due_date: nextDueDate,
    });
  } else {
    await db.review_states.add({
      student_id: studentId,
      topic_id: topicId,
      rule_recall_score: checkResult.isValid ? 90 : 60,
      production_accuracy_score: accuracyScore,
      next_due_date: nextDueDate,
    });
  }

  return { sessionId, errorIds };
}
