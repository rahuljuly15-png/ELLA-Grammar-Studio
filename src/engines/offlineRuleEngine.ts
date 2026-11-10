import { db } from '../db/dexieDb';

export interface RuleError {
  ruleId: string;
  matchedText: string;
  suggestedText: string;
  index: number;
  explanationHi: string;
  severity: 'error' | 'warning';
  confidence: 'high' | 'medium';
  inductiveHintHi: string; // The 1-line rule hint for the "Hint Ladder"
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
  'one-eyed', 'one-way', 'one-rupee', 'one-time', 'one-man',
  'one', 'once'
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
 * Specifically tuned for Indian Classroom ESL learners (Class 6-10)
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
          confidence: 'high',
          inductiveHintHi: 'अभ्यास शुरू करने के लिए कोई वाक्य टाइप करें।',
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
    errors.push({
      ruleId: 'silent_h_requires_an',
      matchedText: match[0],
      suggestedText: `${correctArticle} ${match[2]}`,
      index: match.index,
      explanationHi: `'${match[3]}' में 'h' साइलेंट है, पहली आवाज़ स्वर ('आ/ऑ') जैसी है। इसलिए '${correctArticle} ${match[3]}' आएगा।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'बोलकर देखें: क्या पहली आवाज़ अ से औ जैसी है?',
    });
  }

  // Consonant sound /juː/ or /w/ -> requires 'a'
  const consonantVowelRegex = new RegExp(`\\b([Aa]n)\\s+((?:(?:very|quite|most)\\s+)?(${CONSONANT_SOUND_VOWEL_WORDS.join('|')}))\\b`, 'gi');
  while ((match = consonantVowelRegex.exec(trimmed)) !== null) {
    const isCap = match[1][0] === match[1][0].toUpperCase();
    const correctArticle = isCap ? 'A' : 'a';
    errors.push({
      ruleId: 'consonant_sound_requires_a',
      matchedText: match[0],
      suggestedText: `${correctArticle} ${match[2]}`,
      index: match.index,
      explanationHi: `'${match[3]}' की शुरुआत 'य' या 'व' (व्यंजन ध्वनि) से होती है। इसलिए '${correctArticle} ${match[3]}' आएगा।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'अक्षर न देखें, पहली आवाज़ (Sound) पर ध्यान दें।',
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
      confidence: 'high',
      inductiveHintHi: 'शॉर्ट-फॉर्म के पहले अक्षर को हिंदी में बोलकर देखें।',
    });
  }

  // General 'a' before obvious vowels
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
      explanationHi: `'${match[2]}' स्वर ध्वनि से शुरू होता है, इसलिए '${correctArticle} ${match[2]}' आएगा।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'स्वर (Vowel Sound) से पहले An आता है।',
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
      explanationHi: `'${match[2]}' व्यंजन ध्वनि से शुरू होता है, इसलिए '${correctArticle} ${match[2]}' आएगा।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'व्यंजन (Consonant Sound) से पहले A आता है।',
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
      explanationHi: `'${match[2]}' अद्वितीय/विशिष्ट है, इसलिए निश्चित उपपद '${correctArticle}' का प्रयोग होता है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'दुनिया में एक ही अद्वितीय चीज़ के साथ The लगता है।',
    });
  }

  // ========================================================
  // RULE SET 2: INDIAN CLASSROOM PATTERNS (CRITICAL ADDITIONS)
  // ========================================================
  
  // Pattern 2.1: 'did went' / 'did ate' (Do-support + V2 trap)
  const didV2Regex = /\b(did(?:n't| not)?)\s+(went|ate|saw|played|bought|came|wrote|took|broke|spoke|drank)\b/gi;
  const baseVerbMap: Record<string, string> = {
    went: 'go', ate: 'eat', saw: 'see', played: 'play', bought: 'buy',
    came: 'come', wrote: 'write', took: 'take', broke: 'break', spoke: 'speak', drank: 'drink'
  };
  while ((match = didV2Regex.exec(trimmed)) !== null) {
    const doPart = match[1];
    const pastVerb = match[2].toLowerCase();
    const base = baseVerbMap[pastVerb] || pastVerb;
    errors.push({
      ruleId: 'did_plus_base_verb',
      matchedText: match[0],
      suggestedText: `${doPart} ${base}`,
      index: match.index,
      explanationHi: `'did' के साथ हमेशा क्रिया का पहला मूल रूप (${base}) आता है, V2 (${pastVerb}) नहीं।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Did के साथ भूतकाल का पहला रूप (V1) आता है।',
    });
  }

  // Pattern 2.2: 'have went' / 'has ate' (Aux + Past Participle V3 trap)
  const haveV2Regex = /\b(have|has|had)\s+(went|ate|saw|wrote|took|broke|drank)\b/gi;
  const v3VerbMap: Record<string, string> = {
    went: 'gone', ate: 'eaten', saw: 'seen', wrote: 'written', took: 'taken', broke: 'broken', drank: 'drunk'
  };
  while ((match = haveV2Regex.exec(trimmed)) !== null) {
    const aux = match[1];
    const wrongV2 = match[2].toLowerCase();
    const correctV3 = v3VerbMap[wrongV2] || wrongV2;
    errors.push({
      ruleId: 'perfect_tense_requires_v3',
      matchedText: match[0],
      suggestedText: `${aux} ${correctV3}`,
      index: match.index,
      explanationHi: `'${aux}' के बाद क्रिया का तीसरा रूप V3 (${correctV3}) आता है, V2 नहीं।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Has/Have/Had के बाद हमेशा V3 (Third Form) लगती है।',
    });
  }

  // Pattern 2.3: 'one of my friend' -> 'one of my friends'
  const oneOfRegex = /\b(one\s+of\s+(?:my|the|his|her|our|their)?\s*)(friend|teacher|brother|sister|student|player|book|city|school)\b/gi;
  while ((match = oneOfRegex.exec(trimmed)) !== null) {
    const prefix = match[1];
    const singular = match[2];
    errors.push({
      ruleId: 'one_of_requires_plural',
      matchedText: match[0],
      suggestedText: `${prefix}${singular}s`,
      index: match.index,
      explanationHi: `'one of' (में से एक) के बाद संज्ञा हमेशा बहुवचन (Plural: ${singular}s) होती है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'कईयों में से एक की बात हो रही है, इसलिए संज्ञा में s लगेगा।',
    });
  }

  // Pattern 2.4: 'discuss about' -> 'discuss'
  const discussAboutRegex = /\b(discuss(?:ed|ing|es)?)\s+about\b/gi;
  while ((match = discussAboutRegex.exec(trimmed)) !== null) {
    const verb = match[1];
    errors.push({
      ruleId: 'discuss_no_about',
      matchedText: match[0],
      suggestedText: verb,
      index: match.index,
      explanationHi: `'${verb}' का अर्थ ही 'के बारे में चर्चा करना' है, इसके साथ 'about' लगाना अनावश्यक है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Discuss के साथ About नहीं लगाया जाता।',
    });
  }

  // Pattern 2.5: 'reply back' / 'return back' / 'revert back' -> 'reply' / 'return'
  const pleonasmBackRegex = /\b(reply|return|revert)(ed|ing|s)?\s+back\b/gi;
  while ((match = pleonasmBackRegex.exec(trimmed)) !== null) {
    const base = match[1];
    const suffix = match[2] || '';
    errors.push({
      ruleId: 'pleonasm_back_forbidden',
      matchedText: match[0],
      suggestedText: `${base}${suffix}`,
      index: match.index,
      explanationHi: `'${base}' में 'वापस' का भाव पहले से है, इसलिए साथ में 'back' नहीं लगाते।`,
      severity: 'warning',
      confidence: 'high',
      inductiveHintHi: 'Return या Reply के साथ Back नहीं लगता।',
    });
  }

  // Pattern 2.6: 'married with' -> 'married to'
  const marriedWithRegex = /\b(married)\s+with\b/gi;
  while ((match = marriedWithRegex.exec(trimmed)) !== null) {
    errors.push({
      ruleId: 'married_to_preposition',
      matchedText: match[0],
      suggestedText: 'married to',
      index: match.index,
      explanationHi: `विवाह के संदर्भ में अंग्रेजी में 'married with' नहीं, 'married to' कहा जाता है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Married के साथ To Preposition आती है।',
    });
  }

  // Pattern 2.7: 'good in' [subject] -> 'good at'
  const goodInRegex = /\b(good|weak|bad|clever)\s+in\s+(maths|mathematics|english|science|sports|cricket|studies|dancing|singing)\b/gi;
  while ((match = goodInRegex.exec(trimmed)) !== null) {
    const adj = match[1];
    const field = match[2];
    errors.push({
      ruleId: 'good_at_subject',
      matchedText: match[0],
      suggestedText: `${adj} at ${field}`,
      index: match.index,
      explanationHi: `किसी विषय या कौशल में निपुणता दर्शाने के लिए '${adj} in' नहीं, '${adj} at ${field}' बोलते हैं।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'विषय में निपुणता के लिए At लगता है।',
    });
  }

  // Pattern 2.8: 'he don't' / 'she don't' -> 'doesn't'
  const heDontRegex = /\b(he|she|it|my father|my mother|the boy|the teacher)\s+(don't|do\s+not)\b/gi;
  while ((match = heDontRegex.exec(trimmed)) !== null) {
    const subj = match[1];
    errors.push({
      ruleId: 'singular_subject_doesnt',
      matchedText: match[0],
      suggestedText: `${subj} doesn't`,
      index: match.index,
      explanationHi: `'${subj}' एकवचन (Singular) कर्ता है, इसके साथ 'don't' नहीं, 'doesn't' आता है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'एकवचन कर्ता के साथ Doesn\'t आता है।',
    });
  }

  // Pattern 2.9: 'since 2 years' -> 'for 2 years'
  const sinceDurationRegex = /\b(since)\s+(\d+|two|three|four|five|six|many|several)\s+(years|months|days|weeks|hours|minutes)\b/gi;
  while ((match = sinceDurationRegex.exec(trimmed)) !== null) {
    errors.push({
      ruleId: 'duration_requires_for',
      matchedText: match[0],
      suggestedText: `for ${match[2]} ${match[3]}`,
      index: match.index,
      explanationHi: `कुल समयावधि (Duration: ${match[2]} ${match[3]}) के लिए 'since' नहीं, 'for' का प्रयोग होता है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'समय की अवधि के लिए For और शुरुआती बिंदु के लिए Since आता है।',
    });
  }

  // Pattern 2.10: 'cousin brother' / 'cousin sister' -> 'cousin'
  const cousinBrotherRegex = /\b(cousin\s+(?:brother|sister)s?)\b/gi;
  while ((match = cousinBrotherRegex.exec(trimmed)) !== null) {
    errors.push({
      ruleId: 'cousin_no_brother_sister',
      matchedText: match[0],
      suggestedText: 'cousin',
      index: match.index,
      explanationHi: `मानक अंग्रेजी में 'cousin brother/sister' नहीं, केवल 'cousin' कहा जाता है।`,
      severity: 'warning',
      confidence: 'medium',
      inductiveHintHi: 'Standard English में सिर्फ Cousin बोला जाता है।',
    });
  }

  // ========================================================
  // RULE SET 3: SUBJECT-VERB AGREEMENT & DOUBLE COMPARATIVES
  // ========================================================
  // Singular subject missing 's'
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
      explanationHi: `'${subj}' एकवचन कर्ता है, इसलिए क्रिया में 's/es' जुड़ेगा (${sVerb})।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'एकवचन कर्ता के साथ क्रिया में s/es लगता है।',
    });
  }

  // Plural subject wrongly having 's' on verb
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
      explanationHi: `'${subj}' बहुवचन कर्ता है, क्रिया बिना 's' के (${baseVerb}) आएगी।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'बहुवचन कर्ता के साथ क्रिया मूल रूप में रहती है।',
    });
  }

  // Double comparatives
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
      confidence: 'high',
      inductiveHintHi: '-er वाले विशेषण के आगे more नहीं लगाया जाता।',
    });
  }

  // Clock time preposition: on/in 5 PM -> at 5 PM
  const clockTimeRegex = /\b(on|in)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|o'clock))\b/gi;
  while ((match = clockTimeRegex.exec(trimmed)) !== null) {
    errors.push({
      ruleId: 'preposition_clock_time_at',
      matchedText: match[0],
      suggestedText: `at ${match[2]}`,
      index: match.index,
      explanationHi: `घड़ी के सटीक समय के साथ हमेशा 'at' लगता है (उदा. 'at ${match[2]}')।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'घड़ी के समय से पहले At आता है।',
    });
  }

  // Day preposition: at/in Monday -> on Monday
  const dayDateRegex = /\b(at|in)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi;
  while ((match = dayDateRegex.exec(trimmed)) !== null) {
    const day = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
    errors.push({
      ruleId: 'preposition_day_on',
      matchedText: match[0],
      suggestedText: `on ${day}`,
      index: match.index,
      explanationHi: `दिनों और तारीखों के साथ हमेशा 'on' लगता है (उदा. 'on ${day}')।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'दिनों के नाम से पहले On आता है।',
    });
  }

  // Modals followed by base verb
  const modalWithSRegex = /\b(can|could|may|might|must|should|will|would)\s+([a-zA-Z]+s)\b/gi;
  while ((match = modalWithSRegex.exec(trimmed)) !== null) {
    const modal = match[1];
    const verbWithS = match[2].toLowerCase();
    if (['this', 'us', 'as', 'his', 'yes', 'always'].includes(verbWithS)) continue;
    if (verbWithS.endsWith('ss') || verbWithS.endsWith('us')) continue;
    const baseVerb = verbWithS.endsWith('es') ? verbWithS.slice(0, -2) : verbWithS.slice(0, -1);
    errors.push({
      ruleId: 'modal_requires_base_verb',
      matchedText: match[0],
      suggestedText: `${modal} ${baseVerb}`,
      index: match.index,
      explanationHi: `मोडल्स (Can, Must, Should) के बाद हमेशा क्रिया का पहला मूल रूप (${baseVerb}) आता है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Modals के बाद क्रिया में s/es नहीं लगता।',
    });
  }

  // Apply high-confidence corrections
  for (const err of errors) {
    if (err.confidence === 'high') {
      corrected = corrected.replace(err.matchedText, err.suggestedText);
    }
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

// Backward-compatible alias
export const checkArticleRules = (sentence: string) => checkSentenceOffline(sentence, 'level1-articles-01');

/**
 * Saves production attempt directly to Dexie.js (offline database)
 * Uses Dexie v2 compound unique index &[student_id+topic_id] safely
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

  // 3. Update or put review state using compound index &[student_id+topic_id]
  const accuracyScore = checkResult.isValid ? 100 : Math.max(20, 100 - checkResult.errors.length * 30);
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + (checkResult.isValid ? 3 : 1));

  const existingReview = await db.review_states.where({ student_id: studentId, topic_id: topicId }).first();

  if (existingReview?.id) {
    await db.review_states.update(existingReview.id, {
      production_accuracy_score: accuracyScore,
      rule_recall_score: checkResult.isValid ? 90 : 60,
      next_due_date: nextDueDate,
    });
  } else {
    await db.review_states.put({
      student_id: studentId,
      topic_id: topicId,
      rule_recall_score: checkResult.isValid ? 90 : 60,
      production_accuracy_score: accuracyScore,
      next_due_date: nextDueDate,
    });
  }

  return { sessionId, errorIds };
}
