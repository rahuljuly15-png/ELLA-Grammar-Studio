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
 * producing concise (2-3 sentences max), sharp, pedagogical explanations in Hindi or simple English.
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
    language?: 'hi' | 'en';
  }
): TutorResponse {
  const name = context.studentName?.trim() || 'Ishu';
  const query = userQuery.trim().toLowerCase();
  const errors = context.liveCheckResult.errors;
  const isEn = context.language === 'en';

  // 1. If user explicitly asks about their mistake ("मेरी गलती", "गलती कहाँ है", "check sentence", "where is my error")
  if (/गलती|mistake|wrong|error|चेक|check|क्या हुआ|खराबी/i.test(query)) {
    if (errors.length > 0) {
      const err = errors[0];
      if (isEn) {
        return {
          mood: 'guiding',
          reply: `${name}, look at '${err.matchedText}' in your sentence. It needs a quick fix. Try writing '${err.suggestedText}' instead!`,
        };
      }
      return {
        mood: 'guiding',
        reply: `${name}, तुम्हारे वाक्य में '${err.matchedText}' में सुधार चाहिए। ${err.explanationHi}। इसे '${err.suggestedText}' करके देखो!`,
      };
    }
    if (context.studentSentence.trim()) {
      if (isEn) {
        return {
          mood: 'cheering',
          reply: `Awesome job ${name}! 🎉 Your sentence '${context.studentSentence}' is 100% correct! Keep it up!`,
        };
      }
      return {
        mood: 'cheering',
        reply: `शाबाश ${name}! 🎉 तुम्हारे वाक्य '${context.studentSentence}' में कोई गलती नहीं है, यह 100% सही है!`,
      };
    }
    if (isEn) {
      return {
        mood: 'thinking',
        reply: `${name}, first type your sentence in the box below, and I'll analyze every word for you! ✍️`,
      };
    }
    return {
      mood: 'thinking',
      reply: `${name}, पहले नीचे दिए गए बॉक्स में अपना वाक्य लिखो, फिर मैं तुरंत उसकी हर गलती समझाऊँगी! ✍️`,
    };
  }

  // 2. Specific Rule Questions: "a vs an", "hour", "honest", "university"
  if (/a और an|a vs an|an कब|a कब|a या an|when to use a|when to use an/i.test(query)) {
    if (isEn) {
      return {
        mood: 'guiding',
        reply: `Here is the simple rule, ${name}: If the word starts with a VOWEL SOUND (a, e, i, o, u sound), use 'an' (an apple, an hour). If it starts with a CONSONANT sound, use 'a' (a book, a university)!`,
      };
    }
    return {
      mood: 'guiding',
      reply: `सीधा नियम यह है ${name}: अगर शब्द बोलने पर पहली आवाज़ स्वर (अ, आ, इ, ई, ए, ओ) की आए तो 'an' लगेगा, और यदि व्यंजन (क, ख, ग, य, व) की आए तो 'a' लगेगा!`,
    };
  }

  if (/hour|honest|silent h|h साइलेंट/i.test(query)) {
    if (isEn) {
      return {
        mood: 'guiding',
        reply: `In 'hour' and 'honest', the letter 'h' is completely silent! The first sound you say is 'ah' or 'aw' (vowel sounds), which is why we always say 'an hour' and 'an honest person'!`,
      };
    }
    return {
      mood: 'guiding',
      reply: `'Hour' और 'Honest' में 'h' बिल्कुल साइलेंट (मूक) रहता है! इसलिए पहली आवाज़ 'आ' या 'ऑ' (स्वर) आती है, और हम 'an hour' व 'an honest man' बोलते हैं।`,
    };
  }

  if (/university|european|union/i.test(query)) {
    if (isEn) {
      return {
        mood: 'guiding',
        reply: `Notice the first sound of 'university' or 'European': it sounds like 'yu' (y sound), which is a consonant sound. That is why we say 'a university', not 'an'!`,
      };
    }
    return {
      mood: 'guiding',
      reply: `'University' और 'European' भले ही U या E से शुरू हों, पर बोलते समय पहली आवाज़ 'य' (व्यंजन) की आती है। इसलिए इनके आगे 'a' लगता है, 'an' नहीं!`,
    };
  }

  if (/did|did went|did ate|did के बाद/i.test(query)) {
    if (isEn) {
      return {
        mood: 'guiding',
        reply: `Golden Rule: 'did' is already in past tense! Never use another past verb after it. Always say 'did go' (never 'did went') and 'didn't know' (never 'didn't knew')!`,
      };
    }
    return {
      mood: 'guiding',
      reply: `सीक्रेट फॉर्मूला याद रखो: 'did' पहले से ही भूतकाल (Past) है! इसके बाद हमेशा मूल क्रिया (V1) आएगी—जैसे 'did go' (did went नहीं) और 'didn't know' (didn't knew नहीं)!`,
    };
  }

  // 3. General Greetings & Personality
  if (/hi|hello|नमस्ते|हाय|hey|कौन हो|who are you/i.test(query)) {
    if (isEn) {
      return {
        mood: 'waving',
        reply: `Hello ${name}! I'm Ella, your magical AI grammar teacher 🧞‍♀️! I help you understand English grammar easily by speaking, listening, and discovering rules!`,
      };
    }
    return {
      mood: 'waving',
      reply: `नमस्ते ${name}! मैं हूँ एला जिनी 🧞‍♀️—आपकी पर्सनल इंग्लिश लर्निंग असिस्टेंट! मैं आपको बिना रटे, बोलकर और समझकर ग्रामर सिखाती हूँ!`,
    };
  }

  if (/मदद|help|क्या करूँ|what to do/i.test(query)) {
    if (isEn) {
      return {
        mood: 'guiding',
        reply: `${name}, look at the current step on your screen. Read the clue, listen to the pronunciation, and discover the hidden pattern! I am right here beside you.`,
      };
    }
    return {
      mood: 'guiding',
      reply: `${name}, स्क्रीन पर जो स्टेप खुला है, उसके उदाहरण को ध्यान से पढ़ो और उच्चारण सुनो। कोई भी शंका हो तो मुझसे बेझिझक पूछो!`,
    };
  }

  // Fallback Socratic Guidance
  if (isEn) {
    return {
      mood: 'guiding',
      reply: `${name}, great question! In English, remember to always focus on spoken sounds and clear sentence patterns. What do you notice in this step?`,
    };
  }
  return {
    mood: 'guiding',
    reply: `${name}, बहुत बढ़िया सवाल! हमेशा ध्यान रखो कि अंग्रेजी में नियम रटने से नहीं, वाक्यों को बोलकर और समझकर सीखने से आते हैं। बताओ तुम्हें इस स्टेप में क्या दिखा?`,
  };
}

/**
 * Proactive contextual dialogue delivered by the Genie when student switches steps or completes actions.
 */
export function getProactiveTeachingDialogue(context: {
  currentStep: StepKey;
  studentName: string;
  selectedHypothesis: number | null;
  isHypothesisCorrect: boolean | null;
  liveCheckResult: RuleCheckResult;
  studentSentence: string;
  isSavedToDb: boolean;
  activeTopic: FullTopicData;
  language?: 'hi' | 'en';
}): TutorResponse {
  const name = context.studentName?.trim() || 'Ishu';
  const { currentStep, selectedHypothesis, isHypothesisCorrect, liveCheckResult, studentSentence, isSavedToDb, activeTopic } = context;
  const isEn = context.language === 'en';

  // State: Progress Saved
  if (isSavedToDb) {
    if (isEn) {
      return {
        mood: 'celebrating',
        reply: `Superb, ${name}! Your progress is safely saved. Tap Step 5 to lock this topic into your long-term memory!`,
      };
    }
    return {
      mood: 'celebrating',
      reply: `वाह ${name}! तुम्हारी मेहनत सुरक्षित सेव हो गई है। अब 5वें कदम पर जाकर इस टॉपिक की रिवीजन मेमोरी लॉक कर लो!`,
    };
  }

  // Step 4: Sentence Builder
  if (currentStep === 'use') {
    if (studentSentence.trim()) {
      if (liveCheckResult.isValid) {
        if (isEn) {
          return {
            mood: 'celebrating',
            reply: `Brilliant, ${name}! 🎉 Your sentence '${studentSentence}' is 100% correct! You've mastered this rule!`,
          };
        }
        return {
          mood: 'celebrating',
          reply: `लाजवाब ${name}! 🎉 तुम्हारा वाक्य '${studentSentence}' 100% सही है! तुमने नियम को पूरी तरह समझ लिया!`,
        };
      }
      const err = liveCheckResult.errors[0];
      if (isEn) {
        return {
          mood: 'guiding',
          reply: `Look closely, ${name}: in '${err.matchedText}', try changing it to '${err.suggestedText}'. You can do it!`,
        };
      }
      return {
        mood: 'guiding',
        reply: `अरे ${name}, तुमने '${err.matchedText}' लिखा है। ${err.explanationHi}। इसे '${err.suggestedText}' करके देखो!`,
      };
    }
    if (isEn) {
      return {
        mood: 'guiding',
        reply: `Your turn now, ${name}! Type your own English sentence in the box above and I'll check it instantly ✍️`,
      };
    }
    return {
      mood: 'guiding',
      reply: `चलो ${name}, अब तुम्हारी बारी है! ऊपर दिए बॉक्स में अपना एक नया वाक्य बनाकर मुझे दिखाओ ✍️`,
    };
  }

  // Step 2: Hypothesize
  if (currentStep === 'hypothesize') {
    if (selectedHypothesis !== null) {
      const option = activeTopic.steps['2_hypothesize']?.options[selectedHypothesis];
      if (isHypothesisCorrect) {
        if (isEn) {
          return {
            mood: 'celebrating',
            reply: `Spot on, ${name}! 🎯 You guessed the secret pattern! Remember: spoken sound is the master key!`,
          };
        }
        return {
          mood: 'celebrating',
          reply: `बिल्कुल सटीक ${name}! 🎯 तुमने सही चुना: "${option?.textHi || ''}"। असली नियम स्पेलिंग नहीं, आवाज़ बनाती है!`,
        };
      }
      if (isEn) {
        return {
          mood: 'thinking',
          reply: `Think carefully, ${name}! Say the word out loud—what is the very first sound you hear? Listen closely!`,
        };
      }
      return {
        mood: 'thinking',
        reply: `सोचो ${name}, तुमने चुना "${option?.textHi || ''}"। पर ज़रा शब्द को बोलकर देखो—पहली आवाज़ क्या सुनाई दी? आवाज़ ही असली चाबी है!`,
      };
    }
    if (isEn) {
      return {
        mood: 'thinking',
        reply: `Be a grammar detective, ${name}! What secret rule do you spot in the examples above? Choose an option!`,
      };
    }
    const q = activeTopic.steps['2_hypothesize']?.questionHi;
    return {
      mood: 'thinking',
      reply: `${name}, अपना दिमाग लगाओ: ${q || 'दोनों में क्या अंतर है? नीचे सही विकल्प चुनो!'}`,
    };
  }

  // Step 1: Notice
  if (currentStep === 'notice') {
    const pair = activeTopic.steps['1_notice']?.pairs[0];
    if (isEn) {
      return {
        mood: 'waving',
        reply: `Hey ${name}! Listen to these examples out loud: '${pair?.highlightWord || 'example'}'. Can you hear the difference in their first sounds?`,
      };
    }
    return {
      mood: 'waving',
      reply: `हाय ${name}! इन दोनों वाक्यों को बोलकर सुनो: '${pair?.highlightWord || 'उदाहरण'}' की आवाज़ में तुम्हें क्या फर्क दिखा?`,
    };
  }

  // Step 3: Clarify
  if (currentStep === 'clarify') {
    if (isEn) {
      return {
        mood: 'guiding',
        reply: `Here is today's golden rule, ${name}! Keep this in mind and you'll never make this mistake again!`,
      };
    }
    const golden = activeTopic.steps['3_clarify']?.goldenRuleHi;
    return {
      mood: 'guiding',
      reply: `ये रहा आज का असली सीक्रेट फॉर्मूला, ${name}: "${golden || ''}"! इसे याद रखो, कभी गलती नहीं होगी!`,
    };
  }

  // Step 5: Schedule
  if (isEn) {
    return {
      mood: 'celebrating',
      reply: `Mission accomplished, ${name}! 🏆 Rate how easy or hard this was so I can remind you at the perfect time!`,
    };
  }
  return {
    mood: 'celebrating',
    reply: `मिशन पूरा हुआ ${name}! 🏆 खुद को स्टार रेटिंग दो ताकि मैं सही समय पर तुम्हें यह नियम याद दिला सकूँ!`,
  };
}
