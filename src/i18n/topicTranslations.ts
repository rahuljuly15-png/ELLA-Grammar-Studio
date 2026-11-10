import type { FullTopicData } from '../data/topicLoader';

export interface LocalizedTopicContent {
  titleEn: string;
  categoryEn: string;
  descriptionEn: string;
  formulaEn: string;
  step1: {
    stepTitleEn: string;
    instructionEn: string;
    soundHintsEn: string[];
  };
  step2: {
    stepTitleEn: string;
    questionEn: string;
    options: Array<{
      textEn: string;
      isCorrect: boolean;
      feedbackEn: string;
    }>;
  };
  step3: {
    stepTitleEn: string;
    goldenRuleEn: string;
    theRuleEn: string;
    examples: Array<{
      word: string;
      soundEn: string;
      reasonEn: string;
    }>;
  };
  step4: {
    stepTitleEn: string;
    promptEn: string;
    placeholderEn: string;
  };
}

export const TOPIC_TRANSLATIONS: Record<string, LocalizedTopicContent> = {
  'level1-articles-01': {
    titleEn: 'Articles: A, An, The',
    categoryEn: 'Basic Foundations',
    descriptionEn: 'Learn when to use A, An, and The based on spoken sounds—not just spellings!',
    formulaEn: 'Vowel Sound (a, e, i, o, u sound) → An | Consonant Sound → A | Unique / Specific → The',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Read these sentences carefully out loud. Both words start with letters "U" and "H", but why do we use "a" for one and "an" for the other?',
      soundHintsEn: [
        'University begins with a "yu" sound (consonant sound)',
        'Hour has a silent "h", first sound is "ah" (vowel sound)',
        'Honest has a silent "h", first sound is "aw" (vowel sound)',
        'European begins with "E", but the first sound is "yu" (consonant sound)',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'Looking at the examples above, what secret rule did you discover?',
      options: [
        {
          textEn: 'We put "an" whenever we see vowel letters (a, e, i, o, u).',
          isCorrect: false,
          feedbackEn: 'Look closer! "University" has letter "u" but uses "a", and "hour" has letter "h" but uses "an". Spelling alone is not enough!',
        },
        {
          textEn: 'We don\'t check spelling; we listen to the FIRST SOUND when we speak the word.',
          isCorrect: true,
          feedbackEn: 'Bingo! Spot on! The real rule is all about pronunciation and first spoken sound.',
        },
        {
          textEn: 'Using "a" or "an" depends on how long the sentence is.',
          isCorrect: false,
          feedbackEn: 'No, sentence length has nothing to do with articles.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Say it out loud! If the word begins with a vowel sound (like uh, ah, ih, eh, oh), use "An". If it begins with a consonant sound (like k, t, p, y, w), use "A".',
      theRuleEn: 'Use "The" for specific items, unique things in the universe (The Sun, The Moon, The Earth), or when both speaker and listener already know which item is meant.',
      examples: [
        { word: 'an umbrella', soundEn: 'Uh sound (vowel)', reasonEn: 'Starts with vowel sound' },
        { word: 'a union', soundEn: 'Yu sound (consonant)', reasonEn: 'Starts with consonant sound' },
        { word: 'an MLA / MP', soundEn: 'Em → Eh sound (vowel)', reasonEn: 'Spoken acronym starts with vowel sound' },
        { word: 'the Taj Mahal', soundEn: 'One-of-a-kind monument', reasonEn: 'Definite unique noun' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence using "a university", "an honest", "an hour", or "a European":',
      placeholderEn: 'e.g. My cousin works at a university in Delhi...',
    },
  },

  'level1-noun-02': {
    titleEn: 'Nouns & Its Dimensions',
    categoryEn: 'Basic Foundations',
    descriptionEn: 'Names of persons, places, animals, things, and ideas. Master singular-plural and gender with ease.',
    formulaEn: 'Proper (Capitalized) | Common (General) | Collective (Group) | Abstract (Feelings)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Look at how these nouns behave. Notice why some start with capital letters and others group things together.',
      soundHintsEn: [
        'Rahul is a specific person (Proper Noun, always Capitalized)',
        'City is a general name (Common Noun)',
        'Flock of birds groups many birds into one unit (Collective Noun)',
        'Honesty is a quality you cannot touch, only feel (Abstract Noun)',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'How can you quickly tell a Proper Noun from a Common Noun?',
      options: [
        {
          textEn: 'Proper Nouns name specific people/places and ALWAYS begin with a Capital Letter.',
          isCorrect: true,
          feedbackEn: 'Exactly right! India, Delhi, Ishu, and Sunday are all Proper Nouns with capitals!',
        },
        {
          textEn: 'Proper Nouns are only used at the very end of sentences.',
          isCorrect: false,
          feedbackEn: 'No, proper nouns can appear anywhere in a sentence.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'A noun is a naming word. Proper nouns (Delhi, Ganga) take capital letters. Abstract nouns (bravery, joy) cannot be touched. Collective nouns (team, army) describe groups as one single unit.',
      theRuleEn: 'For singular to plural, most nouns add -s or -es (box → boxes). Irregular nouns change completely (child → children, foot → feet).',
      examples: [
        { word: 'India / Ishu', soundEn: 'Specific name', reasonEn: 'Proper noun (always capital)' },
        { word: 'a bouquet of flowers', soundEn: 'Group as one unit', reasonEn: 'Collective noun' },
        { word: 'happiness / wisdom', soundEn: 'Feeling / Idea', reasonEn: 'Abstract noun' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence with a Proper Noun and an Abstract Noun:',
      placeholderEn: 'e.g. Ishu showed great courage during the test...',
    },
  },

  'level1-pronoun-03': {
    titleEn: 'Pronouns: Personal & Demonstrative',
    categoryEn: 'Basic Foundations',
    descriptionEn: 'Words that replace nouns to stop repetitive speech (I, you, he, she, this, that, mine, yours).',
    formulaEn: 'Subjective (I/He) → Possessive (Mine/His) → Demonstrative (This/That)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Read these pairs. Notice how using pronouns makes English sound natural instead of repeating names over and over.',
      soundHintsEn: [
        'Instead of "Rohan went home, Rohan slept", say "Rohan went home. He slept."',
        '"This" points to something near you; "That" points to something far away.',
        '"These" is plural for nearby things; "Those" is plural for distant things.',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'When should we use "He" versus "Him"?',
      options: [
        {
          textEn: '"He" does the action (Subject); "Him" receives the action (Object).',
          isCorrect: true,
          feedbackEn: 'Correct! "He called me" (subject) vs "I called him" (object).',
        },
        {
          textEn: 'Both "He" and "Him" mean the exact same thing and can swap anytime.',
          isCorrect: false,
          feedbackEn: 'Not quite! You never say "Him went to school", you say "He went".',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Subject Pronouns (I, You, He, She, We, They) perform the action. Object Pronouns (Me, Him, Her, Us, Them) receive the action.',
      theRuleEn: 'Demonstrative pronouns point out things: This/These (near you), That/Those (far away). Possessive pronouns show ownership: Mine, Yours, Hers, Ours.',
      examples: [
        { word: 'She invited us', soundEn: 'Subject + Object', reasonEn: 'She (subject) gives action to us (object)' },
        { word: 'This is my pen', soundEn: 'Nearby single item', reasonEn: 'Demonstrative pronoun' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence using a subject pronoun (He/She/They) and a possessive pronoun (mine/his/theirs):',
      placeholderEn: 'e.g. She forgot her umbrella, so I gave her mine...',
    },
  },

  'level1-punctuation-04': {
    titleEn: 'Capitalization & Punctuation',
    categoryEn: 'Basic Foundations',
    descriptionEn: 'Full stops, question marks, commas, and capital letters that give meaning to your writing.',
    formulaEn: 'First letter capital | Statement → (.) | Question → (?) | Excitement → (!)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice how changing punctuation marks completely changes the feeling of the sentence!',
      soundHintsEn: [
        'A statement ends with a period / full stop (.)',
        'A question asks for information and ends with (?)',
        'An exclamation shows strong feelings and ends with (!)',
        'Always capitalize "I" when referring to yourself alone.',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'Which words in a sentence must ALWAYS start with a capital letter?',
      options: [
        {
          textEn: 'The first word of every sentence, Proper Nouns, and the standalone letter "I".',
          isCorrect: true,
          feedbackEn: 'Great job! Always capitalize names of people, cities, days, months, and "I"!',
        },
        {
          textEn: 'Every long word with more than 5 letters.',
          isCorrect: false,
          feedbackEn: 'Length does not matter. Only sentence beginnings and proper names take capitals.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Every sentence begins with a Capital Letter and ends with a terminal mark (., ?, !). Use commas (,) to separate items in a list or pause between ideas.',
      theRuleEn: 'Use apostrophes (\') for contractions (do not → don\'t) and ownership (Rohan\'s book). Never put an apostrophe in simple plurals (cats, books).',
      examples: [
        { word: 'I live in Delhi.', soundEn: 'Statement + City name', reasonEn: 'Capital I, capital Delhi, full stop' },
        { word: 'Are you ready?', soundEn: 'Question', reasonEn: 'Question mark at end' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a question sentence using capital letters and correct punctuation:',
      placeholderEn: 'e.g. Why did Rohan visit Jaipur yesterday?...',
    },
  },

  'level2-adjective-05': {
    titleEn: 'Adjectives & Degrees of Comparison',
    categoryEn: 'Descriptors & Relationships',
    descriptionEn: 'Describing words and comparing things: Positive (tall), Comparative (taller than), Superlative (the tallest).',
    formulaEn: 'Positive (tall) → Comparative (taller than) → Superlative (the tallest)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Compare these three sentences. Notice how the adjective changes when comparing one, two, or everyone.',
      soundHintsEn: [
        'Rohan is tall. (One person, basic description)',
        'Rohan is taller than Amit. (Comparing two people, uses -er + than)',
        'Rohan is the tallest boy in class. (Comparing everyone, uses the + -est)',
        'For longer words: beautiful → more beautiful than → the most beautiful.',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What word must always come after a comparative adjective (like taller, bigger)?',
      options: [
        {
          textEn: 'The word "than" (e.g. taller than, stronger than).',
          isCorrect: true,
          feedbackEn: 'Correct! Never say "taller then", always use "taller than"!',
        },
        {
          textEn: 'The word "as" or "from".',
          isCorrect: false,
          feedbackEn: 'Incorrect. We compare two things using "than".',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Short words add -er (comparative) and -est (superlative). Long words (2+ syllables) use "more" and "most". Always put "the" before superlative adjectives (the best, the highest).',
      theRuleEn: 'Watch out for irregular adjectives: good → better → best; bad → worse → worst; far → farther → farthest.',
      examples: [
        { word: 'smarter than', soundEn: 'Comparing two', reasonEn: '-er + than' },
        { word: 'the smartest', soundEn: 'Top of group', reasonEn: 'the + -est' },
        { word: 'more helpful than', soundEn: 'Long word comparison', reasonEn: 'more + adjective + than' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a comparative sentence using "than" or a superlative sentence using "the":',
      placeholderEn: 'e.g. Mount Everest is the highest mountain in the world...',
    },
  },

  'level2-adverb-06': {
    titleEn: 'Adverbs: Manner, Time & Place',
    categoryEn: 'Descriptors & Relationships',
    descriptionEn: 'Words that tell how, when, and where actions happen (softly, yesterday, everywhere).',
    formulaEn: 'Manner (How: softly) | Time (When: now) | Place (Where: outside)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice how adverbs add extra color to the action verb in each sentence.',
      soundHintsEn: [
        'She sings sweetly. (How does she sing? Manner)',
        'We will leave tomorrow. (When will we leave? Time)',
        'Please wait outside. (Where should you wait? Place)',
        'Most manner adverbs end in -ly (quick → quickly, slow → slowly).',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'How are most adverbs of manner formed from adjectives?',
      options: [
        {
          textEn: 'By adding "-ly" to the adjective (e.g. loud → loudly, brave → bravely).',
          isCorrect: true,
          feedbackEn: 'Awesome detective work! That is the standard rule.',
        },
        {
          textEn: 'By putting "un-" at the start of the word.',
          isCorrect: false,
          feedbackEn: 'No, "un-" makes opposites, not adverbs.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Adjectives describe nouns (She is quiet). Adverbs describe action verbs (She speaks quietly). Be careful: "fast" stays "fast", never "fastly"!',
      theRuleEn: 'Adverbs answer 3 big questions: HOW (neatly, fast), WHEN (today, soon), and WHERE (here, upstairs).',
      examples: [
        { word: 'drives carefully', soundEn: 'Manner adverb', reasonEn: 'Answers HOW he drives' },
        { word: 'arrived early', soundEn: 'Time adverb', reasonEn: 'Answers WHEN he arrived' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence describing an action with an adverb ending in "-ly":',
      placeholderEn: 'e.g. The children listened attentively to the teacher...',
    },
  },

  'level2-preposition-07': {
    titleEn: 'Prepositions: In, On, At',
    categoryEn: 'Descriptors & Relationships',
    descriptionEn: 'The exact rules for place and time: At for clock time, On for days/dates, In for months/years/enclosed spaces.',
    formulaEn: 'Clock Time → at | Days/Dates → on | Months/Years/Enclosed → in',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Look at the time clues in each sentence. Notice how the preposition changes with the clock, the calendar day, and the month.',
      soundHintsEn: [
        'The train arrives AT 5:00 PM. (Exact clock time)',
        'Our school tournament is ON Monday. (Day of the week)',
        'My birthday falls IN July. (Month / Year)',
        'Sitting IN the room vs sitting ON the chair.',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'Which preposition should always go before days and dates (like Sunday, 15th August)?',
      options: [
        {
          textEn: 'We use "ON" for specific days and calendar dates.',
          isCorrect: true,
          feedbackEn: 'Spot on! On Sunday, on 26th January, on Diwali day!',
        },
        {
          textEn: 'We use "IN" for days and calendar dates.',
          isCorrect: false,
          feedbackEn: 'Careful! In is for big timeframes like months and years (in 2026, in summer).',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Remember the Time Pyramid: AT is sharp and pinpoint (at 4 o\'clock, at noon). ON is flat like a calendar page (on Monday, on my birthday). IN is deep like a bowl (in July, in 2026, in the morning).',
      theRuleEn: 'For place: AT = a specific point (at the door, at the bus stop); ON = a surface (on the table, on the wall); IN = an enclosed 3D area (in the box, in the room, in India).',
      examples: [
        { word: 'at 7:30 AM', soundEn: 'Exact clock time', reasonEn: 'Pinpoint time → at' },
        { word: 'on Tuesday', soundEn: 'Specific day', reasonEn: 'Calendar day → on' },
        { word: 'in December', soundEn: 'Full month', reasonEn: 'Broad period → in' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence with an exact time (at) and a day (on):',
      placeholderEn: 'e.g. We will meet at 4 PM on Saturday...',
    },
  },

  'level2-conjunction-08': {
    titleEn: 'Conjunctions (FANBOYS) & Interjections',
    categoryEn: 'Descriptors & Relationships',
    descriptionEn: 'Joining words (And, But, Or, So, Because) and sudden emotion words (Wow!, Ouch!).',
    formulaEn: 'FANBOYS (Connecting clauses) | Emotion words + ! (Alas!, Ouch!)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice how conjunctions act like bridges connecting two ideas together.',
      soundHintsEn: [
        'I studied hard AND I scored good marks. (Adds similar ideas)',
        'He ran fast BUT he missed the bus. (Contrasts two ideas)',
        'Do you want tea OR milk? (Shows a choice)',
        'It was raining SO we stayed indoors. (Shows a result)',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'Which conjunction is used when two ideas oppose each other?',
      options: [
        {
          textEn: '"But" or "Although" (shows contrast/opposite outcome).',
          isCorrect: true,
          feedbackEn: 'Correct! "The question was hard BUT she solved it!"',
        },
        {
          textEn: '"And" (joins everything identically).',
          isCorrect: false,
          feedbackEn: '"And" simply joins similar ideas without contrast.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'FANBOYS stands for: For, And, Nor, But, Or, Yet, So. Use "Because" to give reasons and "Although" to show unexpected twists.',
      theRuleEn: 'Interjections express sudden bursts of feeling (Wow!, Alas!, Hurrah!, Oops!). They are always followed by an exclamation mark (!).',
      examples: [
        { word: 'rich but humble', soundEn: 'Contrast', reasonEn: 'Opposite qualities joined by but' },
        { word: 'Hurrah! We won.', soundEn: 'Joyous emotion', reasonEn: 'Interjection with exclamation' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence joining two ideas using "because" or "but":',
      placeholderEn: 'e.g. I brought an umbrella because it looked like rain...',
    },
  },

  'level3-verb-forms-09': {
    titleEn: 'Verb Forms (V1, V2, V3)',
    categoryEn: 'Tenses & Verbs',
    descriptionEn: 'The three action forms: Base (V1: Go), Past (V2: Went), and Past Participle (V3: Gone).',
    formulaEn: 'V1 (Eat/Go) → V2 (Ate/Went) → V3 (Eaten/Gone)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Watch how the action word changes depending on whether it happens daily, happened yesterday, or is already finished.',
      soundHintsEn: [
        'I write a letter every week. (V1: Daily routine)',
        'I wrote a letter yesterday. (V2: Finished past action)',
        'I have written the letter. (V3: Used with have/has/had)',
        'Regular verbs just add -ed (play → played → played). Irregular verbs change completely (see → saw → seen).',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'Which verb form must ALWAYS be used right after "have", "has", or "had"?',
      options: [
        {
          textEn: 'The Third Form / Past Participle (V3) (e.g. have gone, has eaten, had seen).',
          isCorrect: true,
          feedbackEn: 'Brilliant! Never say "have went" or "has wrote". Always use V3!',
        },
        {
          textEn: 'The Second Form (V2) (e.g. have went).',
          isCorrect: false,
          feedbackEn: 'Common trap! V2 never pairs with have/has. Only V3 can pair with have/has!',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'V1 is the base action word. V2 stands alone in simple past (I ate lunch). V3 NEVER stands alone—it always needs a buddy like has, have, had, or is/was in passive voice.',
      theRuleEn: 'Watch out for tricky verbs where all 3 forms stay the same: cut-cut-cut, put-put-put, read-read-read (pronounced "red" in past).',
      examples: [
        { word: 'went (V2)', soundEn: 'Simple past', reasonEn: 'Stands alone: "He went home"' },
        { word: 'has gone (V3)', soundEn: 'Perfect tense', reasonEn: 'Uses helping verb has + V3' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence using "has" or "have" with a V3 verb (e.g. has written, have finished):',
      placeholderEn: 'e.g. Ishu has completed her English homework...',
    },
  },

  'level3-subject-verb-agreement-10': {
    titleEn: 'Subject-Verb Agreement',
    categoryEn: 'Tenses & Verbs',
    descriptionEn: 'The matching rule: Singular subjects take singular verbs with -s (He plays), plural subjects take base verbs (They play).',
    formulaEn: 'Singular Subject (He/She/It) + Verb-s/es | Plural Subject (They/We) + Base Verb',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Look at the subject of each sentence. Notice why the action verb sometimes has an "-s" and sometimes does not!',
      soundHintsEn: [
        'The boy plays cricket. (One boy = plays with -s)',
        'The boys play cricket. (Many boys = play without -s)',
        'He works hard. (He/She/It takes -s)',
        'They work hard. (They/We/You take base form)',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'If the subject is "The teacher", should we write "teaches" or "teach"?',
      options: [
        {
          textEn: '"Teaches" (singular subject takes a verb ending in -s/-es).',
          isCorrect: true,
          feedbackEn: 'Correct! One teacher = teaches. Many teachers = teach.',
        },
        {
          textEn: '"Teach" (verbs never change for singular subjects).',
          isCorrect: false,
          feedbackEn: 'Remember: In English, when a noun is singular, the present verb takes an -s!',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'The Balance Scale Rule: If the noun does NOT have an -s (The cat), the verb MUST have an -s (runs). If the noun HAS an -s (The cats), the verb drops the -s (run)!',
      theRuleEn: 'Words like "Everyone", "Nobody", "Each", and "Somebody" sound like groups, but in grammar they are SINGULAR and take verbs with -s (Everyone likes ice cream).',
      examples: [
        { word: 'He speaks English', soundEn: 'Singular balance', reasonEn: 'He (singular) + speaks (-s)' },
        { word: 'They speak English', soundEn: 'Plural balance', reasonEn: 'They (plural) + speak (base)' },
        { word: 'Everyone is here', soundEn: 'Indefinite pronoun', reasonEn: 'Everyone counts as singular' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a present tense sentence starting with "He" or "She" with an action verb ending in -s:',
      placeholderEn: 'e.g. She reads a storybook every night before sleeping...',
    },
  },

  'level3-tenses-timeline-11': {
    titleEn: 'The Tense Timeline: Present, Past, Future',
    categoryEn: 'Tenses & Verbs',
    descriptionEn: 'Travel in time: What happens daily (V1), what is happening right now (is/are + ing), what happened (V2), and what will happen (will + V1).',
    formulaEn: 'Routine (V1/s) | Happening Now (is/are + ing) | Past (V2) | Future (will + V1)',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Look at the time markers in these sentences. Notice how the verb form changes across past, present, and future.',
      soundHintsEn: [
        'I walk to school every morning. (Daily routine = Simple Present)',
        'I am walking to school right now. (Happening this second = Present Continuous)',
        'I walked to school yesterday. (Finished action = Simple Past)',
        'I will walk to school tomorrow. (Future expectation = Simple Future)',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What helping verbs do we need to show that an action is happening right this second?',
      options: [
        {
          textEn: 'Is, Am, or Are followed by a verb ending in "-ing".',
          isCorrect: true,
          feedbackEn: 'Spot on! "I am studying", "She is reading", "They are playing".',
        },
        {
          textEn: 'Did followed by a past tense verb.',
          isCorrect: false,
          feedbackEn: 'Did is for past questions and negatives, not present continuous.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Timeline Check: Habits use V1 (I drink milk). Live actions use is/am/are + V-ing (I am drinking milk). Finished past actions use V2 (I drank milk). Future plans use will + V1 (I will drink milk).',
      theRuleEn: 'CRITICAL INDIAN CLASSROOM RULE: When using "did" in a past question or negative sentence, DID already carries the past! Never double the past: say "I did not know", NEVER "I did not knew"!',
      examples: [
        { word: 'did not know', soundEn: 'Did + Base Verb (V1)', reasonEn: 'Did handles the past; verb stays base' },
        { word: 'is cooking', soundEn: 'Continuous action', reasonEn: 'Happening right now' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence with "did not" and a base verb (e.g. did not go, did not see):',
      placeholderEn: 'e.g. We did not see the movie yesterday...',
    },
  },

  'level3-modals-meter-12': {
    titleEn: 'The Modal Meter: Can, May, Must, Should',
    categoryEn: 'Tenses & Verbs',
    descriptionEn: 'Helping verbs for ability (Can), permission/chance (May), duty (Should), and strict rules (Must).',
    formulaEn: 'Ability → Can | Permission/Chance → May | Duty/Rule → Must/Should',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice how modal helping verbs change the mood and meaning of the exact same action.',
      soundHintsEn: [
        'I CAN solve this puzzle. (Shows physical or mental power/ability)',
        'MAY I come in, teacher? (Polite and formal request for permission)',
        'You SHOULD drink plenty of water. (Friendly advice / moral suggestion)',
        'You MUST wear a helmet while riding. (Compulsory rule / law)',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What form of the action verb must always follow a modal (can, could, may, must, should)?',
      options: [
        {
          textEn: 'The simple Base Form (V1), never with -s, -ed, or -ing (e.g. can go, must eat).',
          isCorrect: true,
          feedbackEn: 'Exactly right! Never say "can goes" or "must went". Always use base V1!',
        },
        {
          textEn: 'The past participle (V3) form.',
          isCorrect: false,
          feedbackEn: 'Incorrect. Modals directly take the bare base verb V1.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Modals never take -s even with he/she (She can dance, NOT she cans dance). Always follow a modal with the pure base verb (V1).',
      theRuleEn: 'Can = Ability (I can swim). May = Formal permission & 50% probability (It may rain). Should = Good advice (You should sleep early). Must = 100% compulsory necessity (You must stop at red light).',
      examples: [
        { word: 'can speak', soundEn: 'Ability + V1', reasonEn: 'Can takes base verb' },
        { word: 'must obey', soundEn: 'Obligation + V1', reasonEn: 'Must takes base verb' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write an advice sentence using "should" or a rule sentence using "must":',
      placeholderEn: 'e.g. Students must arrive at school on time...',
    },
  },

  'level4-svo-sentence-13': {
    titleEn: 'Sentence Architecture & SVO Blocks',
    categoryEn: 'Sentence Mechanics',
    descriptionEn: 'How to build full sentences: Subject (Who does it) + Verb (The action) + Object (Who receives it).',
    formulaEn: '[Subject] + [Verb] + [Object] | Complete idea with meaning',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Read these sentence parts. Notice the difference between a complete sentence and an incomplete phrase.',
      soundHintsEn: [
        'In the morning. (No action, no subject = Just a phrase, incomplete)',
        'Rohan plays football in the morning. (Subject + Verb + Object = Complete sentence!)',
        'Every full sentence must have at least one Subject and one finite Verb.',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What are the two essential building blocks every complete English sentence must have?',
      options: [
        {
          textEn: 'A Subject (doer) and a Predicate containing a Verb (action).',
          isCorrect: true,
          feedbackEn: 'Spot on! Without a subject and a verb, it is only a fragment.',
        },
        {
          textEn: 'At least ten words and two commas.',
          isCorrect: false,
          feedbackEn: 'No! Even a 2-word sentence like "Birds fly" is 100% complete.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'The S-V-O Formula: [Subject] answers WHO or WHAT. [Verb] answers DID WHAT. [Object] answers TO WHOM or TO WHAT.',
      theRuleEn: 'Sentences come in 4 types: Declarative (states a fact .), Interrogative (asks a question ?), Imperative (gives a command or request .), Exclamatory (shows high emotion !).',
      examples: [
        { word: 'Rohan (S) kicked (V) the ball (O)', soundEn: 'Clear SVO flow', reasonEn: 'Complete thought' },
        { word: 'Please sit down.', soundEn: 'Imperative sentence', reasonEn: 'Subject [You] is understood' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a complete sentence with a clear Subject, Verb, and Object:',
      placeholderEn: 'e.g. The chef baked a delicious chocolate cake...',
    },
  },

  'level4-jumbled-words-14': {
    titleEn: 'Jumbled Words Rearrangement',
    categoryEn: 'Sentence Mechanics',
    descriptionEn: 'Solve word puzzles by finding the subject, finding the action verb, and arranging the remaining details in order.',
    formulaEn: 'Step 1: Find Subject → Step 2: Find Verb → Step 3: Find Object/Where/When',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Look at this jumbled mess and how arranging it using the S-V-O key turns chaos into sense.',
      soundHintsEn: [
        'Jumbled: "park / in / children / the / playing / are"',
        'Step 1: Who? → "The children"',
        'Step 2: Doing what? → "are playing"',
        'Step 3: Where? → "in the park."',
        'Result: "The children are playing in the park."',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What should be your very first move when solving a jumbled sentence?',
      options: [
        {
          textEn: 'Identify the Subject (who is doing something) and the Main Verb.',
          isCorrect: true,
          feedbackEn: 'Master strategy! Once you link the subject to its verb, the puzzle solves itself.',
        },
        {
          textEn: 'Arrange the words in alphabetical order.',
          isCorrect: false,
          feedbackEn: 'Alphabetical order won\'t make any sense in a sentence!',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'The 3-Step Rearrangement Compass: 1. Find the Doer (Noun/Pronoun). 2. Find the Action (Helping verb + Main verb). 3. Place Manner, Place, and Time at the end (MPT order: How, Where, When).',
      theRuleEn: 'If it\'s a question (ends with ?), the Helping Verb or Question Word (Wh-) jumps to the front: [Wh- word] + [Helping verb] + [Subject] + [Main verb]?',
      examples: [
        { word: 'The dog barked loudly at night', soundEn: 'Subject + Verb + Manner + Time', reasonEn: 'Logical English sentence order' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Rearrange and write: "health / exercise / good / for / is / daily":',
      placeholderEn: 'Type the correct sentence here...',
    },
  },

  'level5-active-passive-15': {
    titleEn: 'Active ↔ Passive Voice Switcher',
    categoryEn: 'Perspective Shift',
    descriptionEn: 'Shift the spotlight: In Active, the doer is first (Ram ate apple). In Passive, the receiver is first (The apple was eaten by Ram).',
    formulaEn: 'Active: S + V + O → Passive: O + Be-verb + V3 + by + S',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Look at both sentences. The event is identical, but who gets the spotlight?',
      soundHintsEn: [
        'Active: The teacher praised Rohan. (Spotlight on the teacher)',
        'Passive: Rohan was praised by the teacher. (Spotlight on Rohan!)',
        'Passive voice ALWAYS uses a form of "be" (is/was/been) followed by a V3 verb.',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What verb form is ALWAYS required in every passive sentence without exception?',
      options: [
        {
          textEn: 'Past Participle (V3) (e.g. was eaten, is written, were found).',
          isCorrect: true,
          feedbackEn: '100% correct! Passive voice never exists without a V3 verb.',
        },
        {
          textEn: 'Present participle ending in -ing.',
          isCorrect: false,
          feedbackEn: '-ing is continuous. Passive voice must have the 3rd form (V3).',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'The Voice Switch: 1. Move Object to the front. 2. Add appropriate "be" helping verb (is, are, was, were). 3. Turn main verb into V3. 4. Add "by [original subject]".',
      theRuleEn: 'Tense consistency: Present simple becomes is/are + V3. Past simple becomes was/were + V3. Continuous adds "being" (is being painted).',
      examples: [
        { word: 'A song was sung by Neha', soundEn: 'Past passive', reasonEn: 'was + V3 (sung) + by' },
        { word: 'Cricket is played by them', soundEn: 'Present passive', reasonEn: 'is + V3 (played) + by' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Convert to Passive: "The boy broke the window":',
      placeholderEn: 'e.g. The window was broken by the boy...',
    },
  },

  'level5-direct-indirect-16': {
    titleEn: 'Direct ↔ Indirect Speech Reporter',
    categoryEn: 'Perspective Shift',
    descriptionEn: 'Reporting what someone said: Drop the quotation marks, add "that", adjust pronouns, and step the tense one step into the past.',
    formulaEn: 'Rahul said, "I play." → Rahul said that he played.',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice how the quotation marks disappear and the pronouns shift when reporting someone else\'s words.',
      soundHintsEn: [
        'Direct: Aman said, "I am tired." (Exact spoken words inside quotes)',
        'Indirect: Aman said that he was tired. (Reported from our perspective)',
        'Quotation marks are removed, "that" is added, "I" becomes "he", and "am" becomes "was".',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'When the reporting verb is in the past (e.g. "He said"), what happens to present tense verbs inside the quotes?',
      options: [
        {
          textEn: 'They shift one step into the past (is → was, play → played, can → could).',
          isCorrect: true,
          feedbackEn: 'Golden rule of narration! The past reporting verb pulls the inside tense into the past.',
        },
        {
          textEn: 'They always shift into future tense with will.',
          isCorrect: false,
          feedbackEn: 'No, indirect narration shifts backwards into the past, not future.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'The Reporter\'s 3 Steps: 1. Remove commas & quotes; add connector "that". 2. Shift pronouns (I → he/she, we → they). 3. Shift tenses back (Present Simple → Past Simple, will → would, can → could).',
      theRuleEn: 'Exception: Universal truths or scientific facts NEVER change tense! (Teacher said, "The earth revolves around the sun" → Teacher said that the earth revolves around the sun).',
      examples: [
        { word: 'He said that he was happy', soundEn: 'Indirect report', reasonEn: 'I am → he was' },
        { word: 'She said that she would come', soundEn: 'Modal shift', reasonEn: 'will → would' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Convert to Indirect: Priya said, "I like ice cream":',
      placeholderEn: 'e.g. Priya said that she liked ice cream...',
    },
  },

  'level6-word-lab-17': {
    titleEn: 'Word-Lab: Prefixes, Suffixes & Root Words',
    categoryEn: 'Word Power & Vocabulary',
    descriptionEn: 'Build hundreds of new words by adding beginnings (un-, dis-) and endings (-ful, -less, -ment) to root words.',
    formulaEn: 'Prefix (Front) + Root Word + Suffix (Back) | Synonyms & Antonyms',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Look at how adding a small prefix or suffix completely changes the word\'s meaning or part of speech.',
      soundHintsEn: [
        'Happy → UNhappy (Prefix "un-" creates the opposite)',
        'Care → CareFUL (Suffix "-ful" turns a noun into an adjective)',
        'Care → CareLESS (Suffix "-less" means without)',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What do prefixes like "un-", "dis-", and "im-" usually do to a root word?',
      options: [
        {
          textEn: 'They reverse the meaning to create an opposite / antonym (e.g. obey → disobey).',
          isCorrect: true,
          feedbackEn: 'Spot on! They act like negation switches.',
        },
        {
          textEn: 'They make the word into a plural noun.',
          isCorrect: false,
          feedbackEn: 'No, plurals are made by adding -s or -es at the end, not prefixes.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'A Prefix attaches to the FRONT of a root word (re-write, pre-test). A Suffix attaches to the BACK (help-ful, dark-ness). Knowing 20 common affixes unlocks 500+ new vocabulary words!',
      theRuleEn: 'Common suffixes and their powers: -ful = full of (joyful); -less = without (fearless); -ly = in that manner (quickly); -able = capable of (readable).',
      examples: [
        { word: 'disagree', soundEn: 'Prefix opposite', reasonEn: 'dis + agree' },
        { word: 'kindness', soundEn: 'Suffix noun', reasonEn: 'kind + ness' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a sentence using a word with prefix "un-" or suffix "-ful":',
      placeholderEn: 'e.g. It was impossible to solve the puzzle in time...',
    },
  },

  'level6-unseen-passage-18': {
    titleEn: 'Unseen Passage: Skimming & Scanning',
    categoryEn: 'Reading Comprehension',
    descriptionEn: 'Master exam reading: Skim the passage for the big picture, scan for exact dates, names, and keywords.',
    formulaEn: 'Big Idea → Skim whole passage | Specific Fact/Date → Scan for keyword',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice the difference between reading every single word slowly versus using speed-reading techniques for exam passages.',
      soundHintsEn: [
        'Skimming: Read title, first line, and last line to grasp the main topic in 30 seconds.',
        'Scanning: Look for a specific keyword from the question (like a number, year, or capitalized name).',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What is the smartest way to tackle a reading comprehension passage in an exam?',
      options: [
        {
          textEn: 'Read the questions FIRST, then scan the passage for the key answers.',
          isCorrect: true,
          feedbackEn: 'The pro student strategy! Reading questions first gives your brain a treasure map.',
        },
        {
          textEn: 'Read the passage 5 times before ever looking at the questions.',
          isCorrect: false,
          feedbackEn: 'That wastes precious exam time without knowing what to look for.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Skim for Context: What is the passage about? Scan for Facts: When, Where, Who, How Many. Always answer questions using exact facts from the text—not personal assumptions!',
      theRuleEn: 'For vocabulary questions ("Find a word similar to..."), read the entire sentence where the word appears to discover its meaning from surrounding context clues.',
      examples: [
        { word: 'Skim reading', soundEn: 'Fast overview', reasonEn: 'Gets the central theme' },
        { word: 'Scan reading', soundEn: 'Targeted search', reasonEn: 'Finds names, dates, numbers' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write a 1-sentence summary stating the main theme of a story you read recently:',
      placeholderEn: 'e.g. The story teaches that honesty is always rewarded...',
    },
  },

  'level6-notice-writing-19': {
    titleEn: 'Notice Writing Scaffold',
    categoryEn: 'Composition Studio',
    descriptionEn: 'Create exam-perfect notice boxes in 5 minutes: Box border, School Name, NOTICE, Date, Heading, and the 4 Ws.',
    formulaEn: '[Box] → [School Name] → [NOTICE] → [Date] → [Heading] → [4Ws Body] → [Sign]',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice the strict rectangular layout and centered titles of formal school notices.',
      soundHintsEn: [
        'A notice is ALWAYS enclosed inside a neat rectangular box.',
        'The word "NOTICE" is centered and written in BOLD CAPITAL letters.',
        'The body answers: What is happening? When? Where? Who is eligible?',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What are the 4 "W" questions that every notice body must clearly answer?',
      options: [
        {
          textEn: 'What (event), When (date & time), Where (venue), and Who (contact person).',
          isCorrect: true,
          feedbackEn: 'Spot on! Answering these 4 Ws ensures full marks in CBSE/State exams.',
        },
        {
          textEn: 'Why, Which, Whose, and Whichever.',
          isCorrect: false,
          feedbackEn: 'A notice needs specific event details: What, When, Where, Who.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Notice Architecture: 1. Draw a clean border box. 2. Center the School/Org Name. 3. Center word "NOTICE". 4. Left-align the Date. 5. Center an attractive Heading. 6. 50-word Body with 4Ws. 7. Sign off with Name and Designation.',
      theRuleEn: 'Keep the tone formal and passive: "All students are hereby informed that..." Word limit is strictly 50 words.',
      examples: [
        { word: 'NOTICE', soundEn: 'All-caps centered', reasonEn: 'Standard official notice format' },
        { word: 'Inter-School Debate', soundEn: 'Catchy heading', reasonEn: 'Tells topic immediately' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write the opening sentence for a school notice about a Lost Watch:',
      placeholderEn: 'e.g. This is to inform all students that a black Titan watch was found in the library...',
    },
  },

  'level6-letters-applications-20': {
    titleEn: 'Formal Letters & Leave Applications',
    categoryEn: 'Composition Studio',
    descriptionEn: 'Write polished school leave applications and formal letters: Sender address, Date, Receiver, Subject, Respected Sir/Madam, and Body.',
    formulaEn: 'Formal: Sender + Date + Receiver + Subject + Salutation + Body + Yours obediently',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice how formal applications to the Principal differ from informal letters to friends.',
      soundHintsEn: [
        'Formal letter has a clear "Subject" line stating the exact purpose.',
        'Language is polite and respectful ("I request you to kindly grant me leave...").',
        'Formal letters end with "Yours obediently" (for school) or "Yours faithfully".',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'Where does the "Subject" line appear in a formal school application?',
      options: [
        {
          textEn: 'Right below the Principal\'s address, before the salutation (Respected Sir/Madam).',
          isCorrect: true,
          feedbackEn: 'Correct! The subject line tells the Principal the reason at a glance.',
        },
        {
          textEn: 'At the very end of the letter after your signature.',
          isCorrect: false,
          feedbackEn: 'No! The subject must be near the top so the reader knows the purpose immediately.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Leave Application Formula: To → The Principal → School Name & City → Date → Subject (Application for 2 days leave due to fever) → Respected Sir/Madam → Body → Thanking you → Yours obediently, Name & Class.',
      theRuleEn: 'Common mistake: Never write "Yours\' obediently" with an apostrophe! Write "Yours obediently" or "Yours sincerely" cleanly.',
      examples: [
        { word: 'Application for Sick Leave', soundEn: 'Subject line', reasonEn: 'Concise, clear purpose' },
        { word: 'Yours obediently', soundEn: 'Formal school closing', reasonEn: 'No apostrophe in Yours' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write the "Subject" line for a 3-day leave application for your sister\'s wedding:',
      placeholderEn: 'e.g. Subject: Application for 3 days leave to attend sister\'s wedding...',
    },
  },

  'level6-story-essay-21': {
    titleEn: 'Story & Essay Outliner',
    categoryEn: 'Composition Studio',
    descriptionEn: 'Craft compelling stories with character, conflict, and a moral; structure essays with Introduction, Body Paragraphs, and Conclusion.',
    formulaEn: 'Story: Characters → Conflict → Resolution & Moral | Essay: Intro → Arguments → Conclusion',
    step1: {
      stepTitleEn: '1. Look Closely & Spot the Difference (Notice)',
      instructionEn: 'Notice how memorable stories always have a challenge/obstacle that the hero must overcome.',
      soundHintsEn: [
        'Beginning: Introduce the setting and main characters.',
        'Middle: A problem or twist occurs (the climax).',
        'End: The problem is solved and a meaningful lesson or moral is revealed.',
      ],
    },
    step2: {
      stepTitleEn: '2. Guess the Rule (Hypothesize)',
      questionEn: 'What are the 3 essential paragraphs needed in every good school essay?',
      options: [
        {
          textEn: '1. Introduction (hook), 2. Body Paragraphs (facts & examples), 3. Conclusion (summary).',
          isCorrect: true,
          feedbackEn: 'The golden essay formula! This guarantees high marks in any English exam.',
        },
        {
          textEn: 'One single giant block of 500 words without any paragraphs.',
          isCorrect: false,
          feedbackEn: 'Never write one giant block! Always organize into paragraphs.',
        },
      ],
    },
    step3: {
      stepTitleEn: '3. The Secret Rule (Clarify)',
      goldenRuleEn: 'Storytelling Hook: Give your story a catchy title. Use vivid adjectives and strong action verbs. End with a memorable moral (e.g. "Hard work always bears fruit").',
      theRuleEn: 'Essay Structure: Paragraph 1 = Define the topic and why it matters. Paragraph 2 & 3 = Key benefits, challenges, and real-life examples. Paragraph 4 = Inspiring conclusion summarizing your thoughts.',
      examples: [
        { word: 'A Friend in Need is a Friend Indeed', soundEn: 'Classic story moral', reasonEn: 'Leaves a lasting impression' },
        { word: 'In conclusion, technology is a useful servant...', soundEn: 'Essay closing', reasonEn: 'Strong summary statement' },
      ],
    },
    step4: {
      stepTitleEn: '4. Build Your Sentence (Practice)',
      promptEn: 'Write an opening line for a story about an unexpected adventure:',
      placeholderEn: 'e.g. It was a stormy night when Rohan found an ancient map in his attic...',
    },
  },
};

/**
 * Returns a fully localized FullTopicData object based on active language.
 */
export function getLocalizedTopic(baseTopic: FullTopicData, lang: 'hi' | 'en'): FullTopicData {
  if (lang === 'hi') {
    return baseTopic;
  }

  const trans = TOPIC_TRANSLATIONS[baseTopic.topicId];
  if (!trans) {
    return baseTopic;
  }

  return {
    ...baseTopic,
    title: trans.titleEn,
    category: trans.categoryEn,
    descriptionHi: trans.descriptionEn,
    steps: {
      ...baseTopic.steps,
      '1_notice': {
        ...baseTopic.steps['1_notice'],
        stepTitleHi: trans.step1.stepTitleEn,
        instructionHi: trans.step1.instructionEn,
        pairs: baseTopic.steps['1_notice']?.pairs.map((p, idx) => ({
          ...p,
          soundHintHi: trans.step1.soundHintsEn[idx] || p.soundHintHi,
        })) || [],
      },
      '2_hypothesize': {
        ...baseTopic.steps['2_hypothesize'],
        stepTitleHi: trans.step2.stepTitleEn,
        questionHi: trans.step2.questionEn,
        options: trans.step2.options.map((opt, idx) => {
          const original = baseTopic.steps['2_hypothesize']?.options[idx];
          return {
            textHi: opt.textEn,
            isCorrect: opt.isCorrect,
            feedbackHi: opt.feedbackEn,
          };
        }),
      },
      '3_clarify': {
        ...baseTopic.steps['3_clarify'],
        stepTitleHi: trans.step3.stepTitleEn,
        goldenRuleHi: trans.step3.goldenRuleEn,
        theRuleHi: trans.step3.theRuleEn,
        examples: trans.step3.examples.map((ex) => ({
          word: ex.word,
          sound: ex.soundEn,
          reason: ex.reasonEn,
        })),
      },
      '5_free_production': {
        ...baseTopic.steps['5_free_production'],
        stepTitleHi: trans.step4.stepTitleEn,
        promptHi: trans.step4.promptEn,
        placeholderHi: trans.step4.placeholderEn,
      },
    },
  };
}
