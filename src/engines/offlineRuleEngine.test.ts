import { describe, it, expect } from 'vitest';
import { checkSentenceOffline } from './offlineRuleEngine';

describe('offlineRuleEngine - 40+ WRONG sentences from Indian ESL learners', () => {
  const wrongCases: { sentence: string; expectedRule: string; expectedMatch: string; expectedSuggest: string }[] = [
    // 1. Articles: Silent 'h'
    { sentence: 'Wait here for a hour', expectedRule: 'silent_h_requires_an', expectedMatch: 'a hour', expectedSuggest: 'an hour' },
    { sentence: 'He is a honest man', expectedRule: 'silent_h_requires_an', expectedMatch: 'a honest', expectedSuggest: 'an honest' },
    { sentence: 'It is a honorable deed', expectedRule: 'silent_h_requires_an', expectedMatch: 'a honorable', expectedSuggest: 'an honorable' },
    { sentence: 'She is a heir to the throne', expectedRule: 'silent_h_requires_an', expectedMatch: 'a heir', expectedSuggest: 'an heir' },

    // 2. Articles: Consonant-sound vowels (require 'a')
    { sentence: 'She studies in an university', expectedRule: 'consonant_sound_requires_a', expectedMatch: 'an university', expectedSuggest: 'a university' },
    { sentence: 'He wears an uniform', expectedRule: 'consonant_sound_requires_a', expectedMatch: 'an uniform', expectedSuggest: 'a uniform' },
    { sentence: 'They formed an union', expectedRule: 'consonant_sound_requires_a', expectedMatch: 'an union', expectedSuggest: 'a union' },
    { sentence: 'France is an European country', expectedRule: 'consonant_sound_requires_a', expectedMatch: 'an European', expectedSuggest: 'a European' },
    { sentence: 'He is an one-eyed sailor', expectedRule: 'consonant_sound_requires_a', expectedMatch: 'an one-eyed', expectedSuggest: 'a one-eyed' },

    // 3. Articles: Acronyms with vowel sounds (require 'an')
    { sentence: 'His father is a MLA', expectedRule: 'acronym_vowel_sound_requires_an', expectedMatch: 'a MLA', expectedSuggest: 'an MLA' },
    { sentence: 'She filed a FIR yesterday', expectedRule: 'acronym_vowel_sound_requires_an', expectedMatch: 'a FIR', expectedSuggest: 'an FIR' },
    { sentence: 'He is a MBA graduate', expectedRule: 'acronym_vowel_sound_requires_an', expectedMatch: 'a MBA', expectedSuggest: 'an MBA' },
    { sentence: 'She holds a MBBS degree', expectedRule: 'acronym_vowel_sound_requires_an', expectedMatch: 'a MBBS', expectedSuggest: 'an MBBS' },
    { sentence: 'I received a SMS alert', expectedRule: 'acronym_vowel_sound_requires_an', expectedMatch: 'a SMS', expectedSuggest: 'an SMS' },

    // 4. Articles: Unique objects (require 'the')
    { sentence: 'Look at a sun today', expectedRule: 'unique_object_requires_the', expectedMatch: 'a sun', expectedSuggest: 'the sun' },
    { sentence: 'A moon is shining bright', expectedRule: 'unique_object_requires_the', expectedMatch: 'A moon', expectedSuggest: 'The moon' },
    { sentence: 'We saw a Taj Mahal in Agra', expectedRule: 'unique_object_requires_the', expectedMatch: 'a Taj Mahal', expectedSuggest: 'the Taj Mahal' },

    // 5. Articles: General Vowel / Consonant
    { sentence: 'She ate a apple today', expectedRule: 'general_vowel_requires_an', expectedMatch: 'a apple', expectedSuggest: 'an apple' },
    { sentence: 'He gave me an book', expectedRule: 'general_consonant_requires_a', expectedMatch: 'an book', expectedSuggest: 'a book' },

    // 6. Indian ESL: Did + V2 trap
    { sentence: 'He did went to school', expectedRule: 'did_plus_base_verb', expectedMatch: 'did went', expectedSuggest: 'did go' },
    { sentence: 'She did not ate lunch', expectedRule: 'did_plus_base_verb', expectedMatch: 'did not ate', expectedSuggest: 'did not eat' },
    { sentence: 'I didn\'t saw him yesterday', expectedRule: 'did_plus_base_verb', expectedMatch: 'didn\'t saw', expectedSuggest: 'didn\'t see' },
    { sentence: 'We did played cricket', expectedRule: 'did_plus_base_verb', expectedMatch: 'did played', expectedSuggest: 'did play' },
    { sentence: 'He did wrote a letter', expectedRule: 'did_plus_base_verb', expectedMatch: 'did wrote', expectedSuggest: 'did write' },

    // 7. Indian ESL: Have / Has / Had + V2
    { sentence: 'They have went to the market', expectedRule: 'perfect_tense_requires_v3', expectedMatch: 'have went', expectedSuggest: 'have gone' },
    { sentence: 'She has ate the food', expectedRule: 'perfect_tense_requires_v3', expectedMatch: 'has ate', expectedSuggest: 'has eaten' },
    { sentence: 'I have saw that movie', expectedRule: 'perfect_tense_requires_v3', expectedMatch: 'have saw', expectedSuggest: 'have seen' },
    { sentence: 'He had wrote a story', expectedRule: 'perfect_tense_requires_v3', expectedMatch: 'had wrote', expectedSuggest: 'had written' },

    // 8. Indian ESL: One of + Singular
    { sentence: 'One of my friend is calling', expectedRule: 'one_of_requires_plural', expectedMatch: 'One of my friend', expectedSuggest: 'One of my friends' },
    { sentence: 'One of the teacher was absent', expectedRule: 'one_of_requires_plural', expectedMatch: 'One of the teacher', expectedSuggest: 'One of the teachers' },
    { sentence: 'One of his brother lives abroad', expectedRule: 'one_of_requires_plural', expectedMatch: 'One of his brother', expectedSuggest: 'One of his brothers' },

    // 9. Indian ESL: Discuss about / Pleonasms
    { sentence: 'We must discuss about this topic', expectedRule: 'discuss_no_about', expectedMatch: 'discuss about', expectedSuggest: 'discuss' },
    { sentence: 'Please reply back to me', expectedRule: 'pleonasm_back_forbidden', expectedMatch: 'reply back', expectedSuggest: 'reply' },
    { sentence: 'When will he return back home', expectedRule: 'pleonasm_back_forbidden', expectedMatch: 'return back', expectedSuggest: 'return' },

    // 10. Indian ESL: Married with / Good in / He don't
    { sentence: 'She is married with an engineer', expectedRule: 'married_to_preposition', expectedMatch: 'married with', expectedSuggest: 'married to' },
    { sentence: 'He is good in maths', expectedRule: 'good_at_subject', expectedMatch: 'good in maths', expectedSuggest: 'good at maths' },
    { sentence: 'He don\'t like sweets', expectedRule: 'singular_subject_doesnt', expectedMatch: 'He don\'t', expectedSuggest: 'He doesn\'t' },
    { sentence: 'She don\'t understand it', expectedRule: 'singular_subject_doesnt', expectedMatch: 'She don\'t', expectedSuggest: 'She doesn\'t' },

    // 11. Indian ESL: Duration requires for
    { sentence: 'I have stayed here since 2 years', expectedRule: 'duration_requires_for', expectedMatch: 'since 2 years', expectedSuggest: 'for 2 years' },

    // 12. Double Comparatives
    { sentence: 'Rohan is more taller than Amit', expectedRule: 'double_comparative_forbidden', expectedMatch: 'more taller', expectedSuggest: 'taller' },
    { sentence: 'She is more smarter than him', expectedRule: 'double_comparative_forbidden', expectedMatch: 'more smarter', expectedSuggest: 'smarter' },

    // 13. Subject-Verb Agreement
    { sentence: 'The dog bark at night', expectedRule: 'singular_subject_needs_verb_s', expectedMatch: 'The dog bark', expectedSuggest: 'The dog barks' },
    { sentence: 'They plays in the ground', expectedRule: 'plural_subject_needs_base_verb', expectedMatch: 'They plays', expectedSuggest: 'They play' },

    // 14. Time / Day Prepositions
    { sentence: 'The class starts in 5 PM', expectedRule: 'preposition_clock_time_at', expectedMatch: 'in 5 PM', expectedSuggest: 'at 5 PM' },
    { sentence: 'We will meet at Monday', expectedRule: 'preposition_day_on', expectedMatch: 'at Monday', expectedSuggest: 'on Monday' },

    // 15. Modals + S
    { sentence: 'She can plays football', expectedRule: 'modal_requires_base_verb', expectedMatch: 'can plays', expectedSuggest: 'can play' },
    { sentence: 'He must watches the game', expectedRule: 'modal_requires_base_verb', expectedMatch: 'must watches', expectedSuggest: 'must watch' },
    { sentence: 'You should studies daily', expectedRule: 'modal_requires_base_verb', expectedMatch: 'should studies', expectedSuggest: 'should study' },
    { sentence: 'He can has my notebook', expectedRule: 'modal_requires_base_verb', expectedMatch: 'can has', expectedSuggest: 'can have' },
    { sentence: 'She will goes to market', expectedRule: 'modal_requires_base_verb', expectedMatch: 'will goes', expectedSuggest: 'will go' },

    // 16. Expanded Indian ESL: Enter into, Listen me, Prefer than, Cope up with, etc.
    { sentence: 'He entered into the room quietly', expectedRule: 'enter_into_redundant', expectedMatch: 'entered into the room', expectedSuggest: 'entered the room' },
    { sentence: 'Why don\'t you listen me carefully', expectedRule: 'listen_requires_to', expectedMatch: 'listen me', expectedSuggest: 'listen to me' },
    { sentence: 'I prefer tea than coffee always', expectedRule: 'prefer_requires_to', expectedMatch: 'prefer tea than coffee', expectedSuggest: 'prefer tea to coffee' },
    { sentence: 'He cannot cope up with this stress', expectedRule: 'cope_with_no_up', expectedMatch: 'cope up with', expectedSuggest: 'cope with' },
    { sentence: 'This secret is between you and I', expectedRule: 'between_you_and_me', expectedMatch: 'between you and I', expectedSuggest: 'between you and me' },
    { sentence: 'I and Rahul went to the market', expectedRule: 'polite_pronoun_order_231', expectedMatch: 'I and Rahul', expectedSuggest: 'Rahul and I' },
    { sentence: 'He could not able to finish the work', expectedRule: 'could_able_to_redundant', expectedMatch: 'could not able to', expectedSuggest: 'could not' },
    { sentence: 'Myself Rahul from Jaipur', expectedRule: 'myself_as_subject_forbidden', expectedMatch: 'Myself Rahul', expectedSuggest: 'I am Rahul' },
  ];

  wrongCases.forEach((testCase, idx) => {
    it(`WRONG #${idx + 1} flags "${testCase.sentence}" -> "${testCase.expectedSuggest}"`, () => {
      const result = checkSentenceOffline(testCase.sentence);
      expect(result.isValid, `Expected sentence to be flagged: "${testCase.sentence}"`).toBe(false);

      const error = result.errors.find((e) => e.ruleId === testCase.expectedRule);
      expect(error, `Expected rule "${testCase.expectedRule}" on sentence: "${testCase.sentence}"`).toBeDefined();
      expect(error?.matchedText.toLowerCase()).toBe(testCase.expectedMatch.toLowerCase());
      expect(error?.suggestedText.toLowerCase()).toBe(testCase.expectedSuggest.toLowerCase());
    });
  });
});

describe('offlineRuleEngine - 50+ CORRECT look-alikes that must NOT be flagged', () => {
  const correctCases = [
    // Modal + base verb ending in -ss or -us
    'We will discuss it',
    'I can pass the exam',
    'He can dress himself nicely',
    'We will focus on our goals',
    'You must miss nothing in class',
    'She can express her thoughts clearly',
    'They will address the meeting today',

    // Modal + adverbs ending in -s
    'She can sometimes cook dinner',
    'It will perhaps rain today',
    'He can always help us',
    'She will nowadays wake up early',
    'They could thus solve the problem',
    'You should besides listen carefully',
    'We will afterwards go to the park',

    // Articles: Correct silent 'h' with 'an'
    'He waited for an hour',
    'She is an honest girl',
    'It is an honorable duty',
    'He is an heir to the property',

    // Articles: Correct consonant sound vowels with 'a'
    'This is a university campus',
    'She wore a uniform to school',
    'Workers formed a union',
    'France is a European nation',
    'He is a one-day player',
    'It was a one-time offer',
    'I met a one-eyed sailor',
    'It was a once in a lifetime trip',

    // Perfect Tense: Have / Has / Had + V3
    'She has gone home',
    'They have eaten their dinner',
    'I have seen the Taj Mahal',
    'He had written the essay properly',

    // Do-support: Correct base verb or noun usage
    'They did their homework carefully',
    'She did go to school yesterday',
    'We did see the movie',

    // One of + plural
    'One of my friends is an engineer',
    'One of the teachers gave me this book',
    'One of his brothers lives in Delhi',

    // Normal usage of discuss / reply / return
    'Let us discuss the matter calmly',
    'Please reply to my message',
    'They will return tomorrow morning',

    // Prepositions & idioms
    'She is married to a doctor',
    'He is good at mathematics',
    "He doesn't know the answer",
    'The train leaves at 5 PM on Monday',
    'She has lived here for 2 years',

    // Acronyms with vowel sounds using 'an'
    'He is an MBA from IIM',
    'She filed an FIR with the police',
    'He sent an SMS to his friend',

    // Unique objects with 'the'
    'The sun rises in the east',
    'The moon shines at night',
    'We visited the Taj Mahal',

    // Single comparatives
    'Rohan is taller than Amit',
    'She is smarter than her classmates',

    // Expanded rules correct look-alikes
    'He entered the room silently',
    'Please listen to me carefully',
    'I prefer tea to coffee',
    'She can cope with difficult situations',
    'This is strictly between you and me',
    'Rahul and I are good friends',
    'He was able to complete the work',
    'I completed the project myself',
    'They entered into an agreement yesterday',
  ];

  correctCases.forEach((sentence, idx) => {
    it(`CORRECT #${idx + 1} "${sentence}" is valid`, () => {
      const result = checkSentenceOffline(sentence);
      expect(
        result.isValid,
        `Expected sentence to be valid, but got errors [${result.errors.map((e) => `${e.ruleId}: "${e.matchedText}"->"${e.suggestedText}"`).join(', ')}] on: "${sentence}"`
      ).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});
