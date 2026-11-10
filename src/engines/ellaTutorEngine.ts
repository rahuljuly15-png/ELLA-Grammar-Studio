import type { FullTopicData } from '../data/topicLoader';
import type { RuleCheckResult } from './offlineRuleEngine';
import type { StepKey } from '../components/ella/PracticeCycleView';
import type { EllaMood } from '../components/ella/EllaAvatarCompanion';

export interface TutorResponse {
  reply: string;
  mood: EllaMood;
}

/**
 * Intelligent, 100% Offline Socratic ESL Tutor Brain.
 * Analyzes student actions, errors, choices, and conversational questions,
 * producing concise (2-3 sentences max), sharp, pedagogical Hindi/Hinglish explanations.
 */
export function generateTutorResponse(
  userQuery: string,
  context: {
    studentName: string;
    currentStep: StepKey;
    activeTopic: FullTopicData;
    selectedHypothesis: number | null;
    isHypothesisCorrect: boolean | null;
    liveCheckResult: RuleCheckResult;
    studentSentence: string;
  }
): TutorResponse {
  const name = context.studentName?.trim() || 'Ishu';
  const query = userQuery.trim().toLowerCase();
  const topicId = context.activeTopic.topicId || '';
  const errors = context.liveCheckResult.errors;

  // 1. If user explicitly asks about their mistake ("मेरी गलती", "गलती कहाँ है", "check sentence")
  if (/गलती|mistake|wrong|error|चेक|check|क्या हुआ|खराबी/i.test(query)) {
    if (errors.length > 0) {
      const err = errors[0];
      return {
        mood: 'guiding',
        reply: `${name}, तुम्हारे वाक्य में '${err.matchedText}' में सुधार चाहिए। ${err.explanationHi}। इसे '${err.suggestedText}' करके देखो!`,
      };
    }
    if (context.studentSentence.trim()) {
      return {
        mood: 'cheering',
        reply: `शाबाश ${name}! 🎉 तुम्हारे वाक्य '${context.studentSentence}' में कोई गलती नहीं है, यह 100% सही है!`,
      };
    }
    return {
      mood: 'thinking',
      reply: `${name}, पहले नीचे दिए गए बॉक्स में अपना वाक्य लिखो, फिर मैं तुरंत उसकी हर गलती समझाऊँगी! ✍️`,
    };
  }

  // 2. Specific Rule Questions: "a vs an", "hour", "honest", "university"
  if (/a और an|a vs an|an कब|a कब|a या an/i.test(query)) {
    return {
      mood: 'guiding',
      reply: `सीधा नियम यह है ${name}: अगर शब्द बोलने पर पहली आवाज़ स्वर (अ, आ, इ, ई, ए, ओ) की आए तो 'an' लगेगा, और यदि व्यंजन (क, ख, ग, य, व) की आए तो 'a' लगेगा!`,
    };
  }

  if (/hour|honest|honor|heir/i.test(query)) {
    return {
      mood: 'guiding',
      reply: `'Hour' और 'Honest' में 'H' साइलेंट रहता है और पहली आवाज़ 'आ' (स्वर) की निकलती है, इसलिए हमेशा 'an' लगता है (जैसे an hour)!`,
    };
  }

  if (/university|european|union|uniform|one/i.test(query)) {
    return {
      mood: 'guiding',
      reply: `'University' 'U' से शुरू होता है लेकिन आवाज़ 'य' (व्यंजन) की आती है! व्यंजन ध्वनि के कारण इसके आगे 'a' लगता है (a university)!`,
    };
  }

  // 3. Verb Rules: "did", "went", "tenses", "v1", "v2"
  if (/did|went|verb|भूतकाल|past/i.test(query) && /did/i.test(query)) {
    return {
      mood: 'guiding',
      reply: `याद रखो ${name}: 'Did' खुद भूतकाल (V2) है! इसलिए 'did' के बाद हमेशा क्रिया का पहला रूप (V1) आता है, जैसे 'did go' (did went बिल्कुल गलत है)!`,
    };
  }

  // 4. User asks for simpler explanation: "समझ नहीं आया", "सरल करो", "explain simply"
  if (/समझ नहीं|explain|आसान|सरल|simple|difficult|कठिन/i.test(query)) {
    const golden = context.activeTopic.steps['3_clarify']?.goldenRuleHi;
    return {
      mood: 'guiding',
      reply: `${name}, बिल्कुल आसान शब्दों में: ${golden || 'अंग्रेजी में स्पेलिंग मत रटो, बस शब्द को मुँह से बोलकर उसकी पहली आवाज़ सुनो!'} क्या अब थोड़ा स्पष्ट हुआ?`,
    };
  }

  // 5. User asks for another example: "एक और उदाहरण", "example"
  if (/उदाहरण|example|sample|और दिखाओ/i.test(query)) {
    const examples = context.activeTopic.steps['3_clarify']?.examples;
    if (examples && examples.length > 0) {
      const ex = examples[Math.floor(Math.random() * examples.length)];
      return {
        mood: 'waving',
        reply: `ये लो नया उदाहरण ${name}: '${ex.word}' (ध्वनि: ${ex.sound})। ${ex.reason}। इसे बोलकर देखो!`,
      };
    }
  }

  // 6. Greetings & Chit-chat: "hi", "hello", "kaise ho", "who are you"
  if (/^(hi|hello|नमस्ते|हाय|hey)/i.test(query)) {
    return {
      mood: 'waving',
      reply: `नमस्ते ${name}! 👋 मैं तुम्हारी जादुई AI ग्रामर टीचर हूँ। इस टॉपिक में कोई भी शंका हो, सीधे मुझसे पूछो!`,
    };
  }

  if (/कौन हो|who are you|नाम क्या है/i.test(query)) {
    return {
      mood: 'cheering',
      reply: `मैं हूँ एला जिनी 🧞‍♀️—आपकी पर्सनल इंग्लिश लर्निंग असिस्टेंट! मैं आपको बिना रटे, बोलकर और समझकर ग्रामर सिखाती हूँ!`,
    };
  }

  // 7. General contextual reply based on current topic & step
  const topicTitle = context.activeTopic.title || 'इस नियम';
  return {
    mood: 'thinking',
    reply: `${name}, आपने '${userQuery}' के बारे में पूछा। ${topicTitle} का मुख्य सूत्र याद रखो: बोलने की ध्वनि पर ध्यान दो, नियम अपने आप समझ आ जाएगा!`,
  };
}

/**
 * Generates proactive, analytically sharp, non-verbose dialogue on step transitions and student actions.
 */
export function getProactiveTeachingDialogue(context: {
  studentName: string;
  currentStep: StepKey;
  activeTopic: FullTopicData;
  selectedHypothesis: number | null;
  isHypothesisCorrect: boolean | null;
  liveCheckResult: RuleCheckResult;
  studentSentence: string;
  isSavedToDb: boolean;
}): TutorResponse {
  const name = context.studentName?.trim() || 'Ishu';
  const { currentStep, activeTopic, selectedHypothesis, isHypothesisCorrect, liveCheckResult, studentSentence, isSavedToDb } = context;

  // Step 4: Sentence Building (Free Production)
  if (currentStep === 'use') {
    if (isSavedToDb) {
      return {
        mood: 'celebrating',
        reply: `वाह ${name}! आपकी मेहनत डेटाबेस में सुरक्षित सेव हो गई। आज का अभ्यास सफल रहा! 💾✨`,
      };
    }
    if (studentSentence.trim().length > 0) {
      if (liveCheckResult.errors.length === 0) {
        return {
          mood: 'cheering',
          reply: `सुपरस्टार ${name}! 🎉 आपका वाक्य '${studentSentence}' व्याकरण के अनुसार 100% सही है! अब सेव करें!`,
        };
      }
      const err = liveCheckResult.errors[0];
      return {
        mood: 'guiding',
        reply: `अरे ${name}, तुमने '${err.matchedText}' लिखा है। ${err.explanationHi}। इसे '${err.suggestedText}' करके देखो!`,
      };
    }
    return {
      mood: 'guiding',
      reply: `चलो ${name}, अब तुम्हारी बारी है! ऊपर दिए बॉक्स में अपना एक नया वाक्य बनाकर मुझे दिखाओ ✍️`,
    };
  }

  // Step 2: Hypothesize (Inductive Discovery)
  if (currentStep === 'hypothesize') {
    if (selectedHypothesis !== null) {
      const option = activeTopic.steps['2_hypothesize']?.options[selectedHypothesis];
      if (isHypothesisCorrect) {
        return {
          mood: 'celebrating',
          reply: `बिल्कुल सटीक ${name}! 🎯 तुमने सही चुना: "${option?.textHi || ''}"। असली नियम स्पेलिंग नहीं, आवाज़ बनाती है!`,
        };
      }
      return {
        mood: 'thinking',
        reply: `सोचो ${name}, तुमने चुना "${option?.textHi || ''}"। पर ज़रा शब्द को बोलकर देखो—पहली आवाज़ क्या सुनाई दी? आवाज़ ही असली चाबी है!`,
      };
    }
    const q = activeTopic.steps['2_hypothesize']?.questionHi;
    return {
      mood: 'thinking',
      reply: `${name}, अपना दिमाग लगाओ: ${q || 'दोनों में क्या अंतर है? नीचे सही विकल्प चुनो!'}`,
    };
  }

  // Step 1: Notice (Observation)
  if (currentStep === 'notice') {
    const pair = activeTopic.steps['1_notice']?.pairs[0];
    return {
      mood: 'waving',
      reply: `हाय ${name}! इन दोनों वाक्यों को बोलकर सुनो: '${pair?.highlightWord || 'उदाहरण'}' की आवाज़ में तुम्हें क्या फर्क दिखा?`,
    };
  }

  // Step 3: Clarify (The Golden Formula)
  if (currentStep === 'clarify') {
    const golden = activeTopic.steps['3_clarify']?.goldenRuleHi;
    return {
      mood: 'guiding',
      reply: `ये रहा आज का असली सीक्रेट फॉर्मूला, ${name}: "${golden || ''}"! इसे याद रखो, कभी गलती नहीं होगी!`,
    };
  }

  // Step 5: Schedule (Memory Review)
  return {
    mood: 'celebrating',
    reply: `मिशन पूरा हुआ ${name}! 🏆 खुद को स्टार रेटिंग दो ताकि मैं सही समय पर तुम्हें यह नियम याद दिला सकूँ!`,
  };
}
