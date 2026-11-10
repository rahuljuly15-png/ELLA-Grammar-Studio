import { db } from '../db/dexieDb';
import { deriveRatingFromCheckResult, computeNextFSRSState } from '../services/fsrsScheduler';

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

// Words to skip after modals (pronouns, adverbs ending in s, etc.)
const MODAL_SKIP_WORDS = new Set([
  'this', 'us', 'as', 'his', 'yes', 'always',
  'sometimes', 'perhaps', 'besides', 'thus', 'otherwise',
  'hence', 'nowadays', 'towards', 'afterwards', 'upstairs', 'downstairs',
  'its', 'ours', 'yours', 'theirs'
]);

/**
 * Converts a 3rd-person singular verb ending in 's' back to its base form (V1).
 * has -> have, does -> do, goes -> go
 * consonant + ies -> y (studies -> study)
 * ches/shes/sses/xes/zes -> strip "es" (watches -> watch, dresses -> dress)
 * otherwise -> strip "s" (plays -> play, makes -> make)
 */
export function toBaseVerb(verbWithS: string): { baseVerb: string; confidence: 'high' | 'medium' } {
  const v = verbWithS.toLowerCase();
  if (v === 'has') return { baseVerb: 'have', confidence: 'high' };
  if (v === 'does') return { baseVerb: 'do', confidence: 'high' };
  if (v === 'goes') return { baseVerb: 'go', confidence: 'high' };

  // consonant + ies -> y (studies -> study, flies -> fly, tries -> try)
  if (/[^aeiou]ies$/i.test(v)) {
    return { baseVerb: v.slice(0, -3) + 'y', confidence: 'high' };
  }

  // ches, shes, sses, xes, zes -> strip "es" (watches -> watch, washes -> wash, dresses -> dress, fixes -> fix, buzzes -> buzz)
  if (/(?:ch|sh|ss|x|z)es$/i.test(v)) {
    return { baseVerb: v.slice(0, -2), confidence: 'high' };
  }

  // standard verbs ending in s -> strip "s" (plays -> play, makes -> make, eats -> eat)
  if (v.length > 2 && v.endsWith('s')) {
    return { baseVerb: v.slice(0, -1), confidence: 'high' };
  }

  // If unsure, return the word with medium confidence and no auto-fix
  return { baseVerb: v, confidence: 'medium' };
}

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
      explanationHi: `'${match[2]}' दुनिया में एक ही और खास (Unique) है, इसलिए हमेशा इसके आगे '${correctArticle}' लगेगा।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'दुनिया में एक ही अनोखी चीज़ के साथ The लगता है।',
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
      explanationHi: `'${verb}' का मतलब ही चर्चा करना है, इसके साथ 'about' मत लगाएँ (सीधे 'discuss the problem' कहें)।`,
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
      explanationHi: `'${base}' का मतलब ही वापस आना/जवाब देना है, इसलिए साथ में 'back' मत लगाएँ।`,
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
      explanationHi: `शादी के संदर्भ में अंग्रेजी में 'married with' नहीं, 'married to' बोला जाता है।`,
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
      explanationHi: `किसी विषय या खेल में होशियार बताने के लिए '${adj} in' नहीं, '${adj} at ${field}' बोलते हैं।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'विषय या खेल में होशियार बताने के लिए At लगता है।',
    });
  }

  // Pattern 2.8: 'he don't' / 'she don't' -> 'doesn't'
  const heDontRegex = /\b(he|she|it|my father|my mother|my brother|my sister|the boy|the girl|the teacher|the student|the dog|the cat)\s+(don't|do\s+not)\b/gi;
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
      explanationHi: `समय की कुल गिनती (${match[2]} ${match[3]}) के लिए 'since' नहीं, 'for' आता है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'समय की कुल गिनती के लिए For और शुरुआती समय के लिए Since आता है।',
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
      explanationHi: `सही अंग्रेजी में 'cousin brother/sister' नहीं, केवल 'cousin' बोला जाता है।`,
      severity: 'warning',
      confidence: 'medium',
      inductiveHintHi: 'सही अंग्रेजी में सिर्फ Cousin बोला जाता है।',
    });
  }

  // Pattern 2.11: 'entered into the room' -> 'entered the room'
  const enterIntoRegex = /\b(enter(?:ed|ing|s)?)\s+into\s+((?:the\s+|a\s+|an\s+|this\s+|that\s+|my\s+|our\s+|his\s+|her\s+|their\s+)?(?:room|house|classroom|hall|building|office|kitchen|bus|car|train|shop))\b/gi;
  while ((match = enterIntoRegex.exec(trimmed)) !== null) {
    const verb = match[1];
    const place = match[2];
    errors.push({
      ruleId: 'enter_into_redundant',
      matchedText: match[0],
      suggestedText: `${verb} ${place}`,
      index: match.index,
      explanationHi: `'${verb}' का मतलब ही अंदर जाना है, इसलिए साथ में 'into' मत लगाएँ (सीधे 'enter the room' कहें)।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Enter के साथ Into नहीं लगाया जाता (केवल Enter the room)।',
    });
  }

  // Pattern 2.12: 'listen me' -> 'listen to me'
  const listenToRegex = /\b(listen(?:ed|ing|s)?)\s+(me|him|her|us|them|the teacher|your parents)\b/gi;
  while ((match = listenToRegex.exec(trimmed)) !== null) {
    const verb = match[1];
    const target = match[2];
    errors.push({
      ruleId: 'listen_requires_to',
      matchedText: match[0],
      suggestedText: `${verb} to ${target}`,
      index: match.index,
      explanationHi: `'${verb}' के बाद किसी व्यक्ति या बात का जिक्र हो तो 'to' (उदा. '${verb} to ${target}') लगाना जरूरी है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Listen के बाद हमेशा To आता है (Listen to me)।',
    });
  }

  // Pattern 2.13: 'prefer tea than coffee' -> 'prefer tea to coffee'
  const preferToRegex = /\b(prefer(?:red|ring|s)?)\s+([a-zA-Z]+)\s+than\s+([a-zA-Z]+)\b/gi;
  while ((match = preferToRegex.exec(trimmed)) !== null) {
    const verb = match[1];
    const item1 = match[2];
    const item2 = match[3];
    errors.push({
      ruleId: 'prefer_requires_to',
      matchedText: match[0],
      suggestedText: `${verb} ${item1} to ${item2}`,
      index: match.index,
      explanationHi: `'${verb}' के साथ दो चीज़ों की पसंद की तुलना में 'than' नहीं, 'to' लगता है (उदा. '${verb} ${item1} to ${item2}')।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Prefer के साथ Than नहीं, To लगाया जाता है।',
    });
  }

  // Pattern 2.14: 'cope up with' -> 'cope with'
  const copeUpWithRegex = /\b(cop(?:e|ed|ing|es))\s+up\s+with\b/gi;
  while ((match = copeUpWithRegex.exec(trimmed)) !== null) {
    const verb = match[1];
    errors.push({
      ruleId: 'cope_with_no_up',
      matchedText: match[0],
      suggestedText: `${verb} with`,
      index: match.index,
      explanationHi: `अंग्रेजी में सही शब्द '${verb} with' (सामना करना) है, साथ में 'up' लगाना गलत है।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Cope के साथ Up नहीं आता, केवल Cope with होता है।',
    });
  }

  // Pattern 2.15: 'Between you and I' -> 'Between you and me'
  const betweenYouAndIRegex = /\b([Bb]etween)\s+(you\s+and\s+I)\b/g;
  while ((match = betweenYouAndIRegex.exec(trimmed)) !== null) {
    const betweenWord = match[1];
    errors.push({
      ruleId: 'between_you_and_me',
      matchedText: match[0],
      suggestedText: `${betweenWord} you and me`,
      index: match.index,
      explanationHi: `'Between' के बाद हमेशा 'me' आता है, 'I' नहीं (उदा. 'Between you and me')।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Between के बाद me आता है (Between you and me)।',
    });
  }

  // Pattern 2.16: 'I and Rahul' -> 'Rahul and I' (Politeness 231 rule)
  const pronounOrderRegex = /\b([Ii])\s+and\s+([A-Z][a-z]+|my\s+friend|my\s+brother|my\s+sister)\b/g;
  while ((match = pronounOrderRegex.exec(trimmed)) !== null) {
    const otherPerson = match[2];
    const capitalizedOther = otherPerson.startsWith('my')
      ? (match.index === 0 ? 'My' + otherPerson.slice(2) : otherPerson)
      : otherPerson;
    errors.push({
      ruleId: 'polite_pronoun_order_231',
      matchedText: match[0],
      suggestedText: `${capitalizedOther} and I`,
      index: match.index,
      explanationHi: `मैनर्स का गोल्डन रूल: हमेशा दूसरे का नाम पहले और अपना नाम ('I') बाद में रखें (उदा. '${capitalizedOther} and I')।`,
      severity: 'warning',
      confidence: 'high',
      inductiveHintHi: 'दूसरों का नाम पहले और अपना नाम (I) बाद में रखें।',
    });
  }

  // Pattern 2.17: 'could able to' -> 'could'
  const couldAbleToRegex = /\b(could(?:n't| not)?)\s+able\s+to\b/gi;
  while ((match = couldAbleToRegex.exec(trimmed)) !== null) {
    const modalPart = match[1];
    errors.push({
      ruleId: 'could_able_to_redundant',
      matchedText: match[0],
      suggestedText: modalPart,
      index: match.index,
      explanationHi: `'${modalPart}' और 'able to' दोनों का एक ही मतलब है; दोनों को एक साथ इस्तेमाल न करें।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'Could के साथ able to नहीं लगाया जाता।',
    });
  }

  // Pattern 2.18: 'Myself Rahul' -> 'I am Rahul'
  const myselfIntroRegex = /\b([Mm]yself)\s+([A-Z][a-z]+)\b/g;
  while ((match = myselfIntroRegex.exec(trimmed)) !== null) {
    const name = match[2];
    errors.push({
      ruleId: 'myself_as_subject_forbidden',
      matchedText: match[0],
      suggestedText: `I am ${name}`,
      index: match.index,
      explanationHi: `अपना परिचय देते समय 'Myself' न बोलें; सीधे 'I am ${name}' या 'My name is ${name}' कहें।`,
      severity: 'error',
      confidence: 'high',
      inductiveHintHi: 'परिचय देते समय Myself नहीं, I am बोलें।',
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
    if (MODAL_SKIP_WORDS.has(verbWithS)) continue;
    if (verbWithS.endsWith('ss') || verbWithS.endsWith('us')) continue;

    const { baseVerb, confidence } = toBaseVerb(verbWithS);
    const suggestedText = confidence === 'high' ? `${modal} ${baseVerb}` : match[0];
    errors.push({
      ruleId: 'modal_requires_base_verb',
      matchedText: match[0],
      suggestedText,
      index: match.index,
      explanationHi: confidence === 'high'
        ? `'${modal}' के बाद हमेशा क्रिया का पहला मूल रूप (${baseVerb}) आता है, s/es नहीं।`
        : `'${modal}' के बाद हमेशा क्रिया का पहला मूल रूप आता है, s/es नहीं।`,
      severity: 'error',
      confidence,
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
      ? 'शाबाश! आपका वाक्य 100% सही और परफेक्ट है! 🎉'
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
      full_sentence: studentSentence,
    })) as number;
    errorIds.push(errId);
  }

  // 3. Update or put review state using FSRS algorithm & compound index &[student_id+topic_id]
  const existingReview = await db.review_states.where({ student_id: studentId, topic_id: topicId }).first();
  const rating = deriveRatingFromCheckResult(checkResult.isValid, checkResult.errors.length, true);
  const now = new Date();
  const fsrs = computeNextFSRSState(existingReview, rating, now);
  const accuracyScore = checkResult.isValid ? 100 : Math.max(20, 100 - checkResult.errors.length * 30);
  const recallScore = checkResult.isValid ? 95 : 55;

  if (existingReview?.id) {
    await db.review_states.update(existingReview.id, {
      production_accuracy_score: accuracyScore,
      rule_recall_score: recallScore,
      stability: fsrs.stability,
      difficulty: fsrs.difficulty,
      reps: fsrs.reps,
      lapses: fsrs.lapses,
      last_review: now,
      next_due_date: fsrs.nextDueDate,
    });
  } else {
    await db.review_states.put({
      student_id: studentId,
      topic_id: topicId,
      production_accuracy_score: accuracyScore,
      rule_recall_score: recallScore,
      stability: fsrs.stability,
      difficulty: fsrs.difficulty,
      reps: fsrs.reps,
      lapses: fsrs.lapses,
      last_review: now,
      next_due_date: fsrs.nextDueDate,
    });
  }

  return { sessionId, errorIds };
}
