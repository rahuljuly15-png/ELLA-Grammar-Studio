export type EngineType = 
  | 'sentence_lego' 
  | 'time_mood_slider' 
  | 'perspective_transformer' 
  | 'blueprint_studio';

export interface EngineMeta {
  id: EngineType;
  titleHi: string;
  titleEn: string;
  taglineHi: string;
  icon: string;
  color: string;
}

export const ENGINES_META: Record<EngineType, EngineMeta> = {
  sentence_lego: {
    id: 'sentence_lego',
    titleHi: 'इंजन 1: Lego Blocks',
    titleEn: 'The Sentence Lego Engine',
    taglineHi: 'Parts of Speech और सही वाक्य जोड़ना',
    icon: 'Blocks',
    color: 'indigo',
  },
  time_mood_slider: {
    id: 'time_mood_slider',
    titleHi: 'इंजन 2: Time Machine',
    titleEn: 'The Time & Mood Slider',
    taglineHi: 'Verb Forms, Tenses और Modals',
    icon: 'Clock',
    color: 'emerald',
  },
  perspective_transformer: {
    id: 'perspective_transformer',
    titleHi: 'इंजन 3: Perspective Shift',
    titleEn: 'The Perspective Transformer',
    taglineHi: 'Active-Passive और Direct-Indirect Speech',
    icon: 'Repeat',
    color: 'amber',
  },
  blueprint_studio: {
    id: 'blueprint_studio',
    titleHi: 'इंजन 4: Writing Studio',
    titleEn: 'The Guided Blueprint Studio',
    taglineHi: 'Word Lab, नोटिस, पत्र और निबंध लेखन',
    icon: 'FileText',
    color: 'purple',
  },
};

export interface CurriculumTopic {
  topicId: string;
  level: number;
  engine: EngineType;
  title: string;
  titleHi: string;
  categoryHi: string;
  descriptionHi: string;
  formulaHi: string;
  dataFile: string;
  order: number;
}

export const CLASS_7_SYLLABUS: CurriculumTopic[] = [
  // LEVEL 1: BASIC FOUNDATIONS
  {
    topicId: 'level1-articles-01',
    level: 1,
    engine: 'sentence_lego',
    title: 'Articles: A, An, The',
    titleHi: 'Articles का जादू: A, An, The कब लगाएँ?',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'स्वर ध्वनि (Vowel Sound) = An, व्यंजन ध्वनि (Consonant Sound) = A, और दुनिया में अनोखी चीज़ = The।',
    formulaHi: 'स्वर ध्वनि (अ-औ) → An | व्यंजन ध्वनि (क-ज्ञ) → A | दुनिया में एक ही (Unique) → The',
    dataFile: 'level1-articles-01.json',
    order: 1,
  },
  {
    topicId: 'level1-noun-02',
    level: 1,
    engine: 'sentence_lego',
    title: 'Nouns & Its Dimensions',
    titleHi: 'Noun: नाम, एकवचन-बहुवचन और जेंडर',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'व्यक्ति, वस्तु, जगह और ग्रुप के नाम; Singular-Plural और Gender की पहचान।',
    formulaHi: 'Proper (Capitalized) | Common (General) | Collective (Group) | Abstract (Feelings)',
    dataFile: 'level1-noun-02.json',
    order: 2,
  },
  {
    topicId: 'level1-pronoun-03',
    level: 1,
    engine: 'sentence_lego',
    title: 'Pronouns: Personal, Possessive & Demonstrative',
    titleHi: 'Pronoun: नाम की जगह आने वाले शब्द (I, You, This)',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'बार-बार नाम दोहराने से बचें; अधिकार (Mine/Yours) और इशारे (This/That) वाले शब्द।',
    formulaHi: 'Subjective (I/He) → Possessive (Mine/His) → Demonstrative (This/That)',
    dataFile: 'level1-pronoun-03.json',
    order: 3,
  },
  {
    topicId: 'level1-punctuation-04',
    level: 1,
    engine: 'sentence_lego',
    title: 'Capitalization & Punctuation',
    titleHi: 'Punctuation: फुल स्टॉप, कॉमा और कैपिटल लेटर्स',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'पहला अक्षर और नाम हमेशा Capital; Full Stop (.), Question Mark (?) और Exclamation (!)।',
    formulaHi: 'Capital + Proper Noun | Statement → (.) | Question → (?) | Emotion → (!)',
    dataFile: 'level1-punctuation-04.json',
    order: 4,
  },

  // LEVEL 2: DESCRIPTORS & RELATIONSHIPS
  {
    topicId: 'level2-adjective-05',
    level: 2,
    engine: 'sentence_lego',
    title: 'Adjectives & Degrees of Comparison',
    titleHi: 'Adjective: खूबी बताने वाले शब्द और तुलना (Degrees)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'गुण व संख्या; दो में तुलना (Taller / More) और सब में सबसे अच्छा (The Tallest / Most)।',
    formulaHi: 'Positive (tall) → Comparative (taller than) → Superlative (the tallest)',
    dataFile: 'level2-adjective-05.json',
    order: 5,
  },
  {
    topicId: 'level2-adverb-06',
    level: 2,
    engine: 'sentence_lego',
    title: 'Adverbs: Manner, Time & Place',
    titleHi: 'Adverb: काम कैसे, कब और कहाँ हुआ? (Quickly, Today)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'काम का तरीका (Quickly), समय (Tomorrow) और जगह (Outside) बताने वाले शब्द।',
    formulaHi: 'Manner (How: softly) | Time (When: now) | Place (Where: here)',
    dataFile: 'level2-adverb-06.json',
    order: 6,
  },
  {
    topicId: 'level2-preposition-07',
    level: 2,
    engine: 'sentence_lego',
    title: 'Prepositions: Place & Time',
    titleHi: 'Preposition: सही जगह और सही टाइम (In, On, At)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'घड़ी का समय (at 5 PM), दिन/तारीख (on Monday), महीना/साल (in July) का सटीक नियम।',
    formulaHi: 'Clock Time → at | Days/Dates → on | Months/Years/Enclosed → in',
    dataFile: 'level2-preposition-07.json',
    order: 7,
  },
  {
    topicId: 'level2-conjunction-08',
    level: 2,
    engine: 'sentence_lego',
    title: 'Conjunctions (FANBOYS) & Interjections',
    titleHi: 'Conjunction: वाक्यों को जोड़ने वाले शब्द (FANBOYS)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'दो वाक्यों को आपस में जोड़ना (And, But, Or, So) और अचानक निकले भाव (Wow!, Ouch!)।',
    formulaHi: 'FANBOYS (Connecting clauses) | Emotion words + ! (Alas!, Ouch!)',
    dataFile: 'level2-conjunction-08.json',
    order: 8,
  },

  // LEVEL 3: VERBS, TENSES & AGREEMENT
  {
    topicId: 'level3-verb-forms-09',
    level: 3,
    engine: 'time_mood_slider',
    title: 'Verb Forms (V1, V2, V3)',
    titleHi: 'Verb Forms: क्रिया के 3 रूप (Go, Went, Gone)',
    categoryHi: 'काल और क्रिया',
    descriptionHi: 'काम वाले शब्द: V1 (Base Form), V2 (Past Form), और V3 (Third Form: Eaten/Gone)।',
    formulaHi: 'V1 (Eat/Go) → V2 (Ate/Went) → V3 (Eaten/Gone)',
    dataFile: 'level3-verb-forms-09.json',
    order: 9,
  },
  {
    topicId: 'level3-subject-verb-agreement-10',
    level: 3,
    engine: 'time_mood_slider',
    title: 'Subject-Verb Agreement',
    titleHi: 'Subject-Verb Match: एकवचन vs बहुवचन की सही जोड़ी',
    categoryHi: 'काल और क्रिया',
    descriptionHi: 'एकवचन कर्ता के साथ क्रिया में s/es (The dog barks), बहुवचन के साथ मूल रूप (The dogs bark)।',
    formulaHi: 'Singular Subject + Verb-s/es | Plural Subject + Verb (Base form)',
    dataFile: 'level3-subject-verb-agreement-10.json',
    order: 10,
  },
  {
    topicId: 'level3-tenses-timeline-11',
    level: 3,
    engine: 'time_mood_slider',
    title: 'The Tense Timeline: Present, Past, Future',
    titleHi: 'Tenses टाइम-मशीन: क्या हो रहा है, क्या हुआ था, क्या होगा?',
    categoryHi: 'काल और क्रिया',
    descriptionHi: 'रोज़ की आदत (V1), अभी जारी काम (is/are + ing), और पूरा हो चुका काम (has/have + V3)।',
    formulaHi: 'Routine (V1/s) | Live Now (is/are + V-ing) | Completed (has/have + V3)',
    dataFile: 'level3-tenses-timeline-11.json',
    order: 11,
  },
  {
    topicId: 'level3-modals-meter-12',
    level: 3,
    engine: 'time_mood_slider',
    title: 'The Modal Meter: Can, May, Must, Should',
    titleHi: 'Modals मीटर: ताकत (Can), इजाज़त (May) और फर्ज (Must)',
    categoryHi: 'काल और क्रिया',
    descriptionHi: 'काबिलियत (Can), परमिशन/संभावना (May/Might), और जरूरी नियम (Must/Should)।',
    formulaHi: 'Ability → Can | Permission/Chance → May | Duty/Rule → Must/Should',
    dataFile: 'level3-modals-meter-12.json',
    order: 12,
  },

  // LEVEL 4: SENTENCE ARCHITECTURE & SVO BLOCKS
  {
    topicId: 'level4-svo-sentence-13',
    level: 4,
    engine: 'sentence_lego',
    title: 'Sentence, Predicate & Phrases',
    titleHi: 'Sentence Structure: कर्ता (Who) + काम (Did What)',
    categoryHi: 'वाक्य रचना',
    descriptionHi: 'Subject (कौन कर रहा है) और Predicate (क्या काम किया); सही और पूरा वाक्य बनाना।',
    formulaHi: '[Subject] + [Predicate (Verb + Object)] | Phrase = no verb',
    dataFile: 'level4-svo-sentence-13.json',
    order: 13,
  },
  {
    topicId: 'level4-jumbled-words-14',
    level: 4,
    engine: 'sentence_lego',
    title: 'Jumbled Words Rearrangement',
    titleHi: 'Jumbled Words: उलझे शब्दों की पहेली सुलझाना',
    categoryHi: 'वाक्य रचना',
    descriptionHi: 'उलटे-सीधे शब्दों में सबसे पहले कर्ता, फिर काम, फिर बाकी हिस्सा ढूँढकर परफेक्ट वाक्य बनाएँ।',
    formulaHi: 'Step 1: Find Subject → Step 2: Find Verb → Step 3: Find Object/Where',
    dataFile: 'level4-jumbled-words-14.json',
    order: 14,
  },

  // LEVEL 5: VOICE & SPEECH TRANSFORMATION
  {
    topicId: 'level5-active-passive-15',
    level: 5,
    engine: 'perspective_transformer',
    title: 'Active ↔ Passive Voice Switcher',
    titleHi: 'Active ↔ Passive Voice: बात कहने का अंदाज़ बदलना',
    categoryHi: 'वाच्य और कथन',
    descriptionHi: 'फोकस कर्ता से काम पर: Ram ate apple → The apple was eaten by Ram (was/were + V3 + by)।',
    formulaHi: 'Active: S + V + O → Passive: O + Helping Verb + V3 + by + S',
    dataFile: 'level5-active-passive-15.json',
    order: 15,
  },
  {
    topicId: 'level5-direct-indirect-16',
    level: 5,
    engine: 'perspective_transformer',
    title: 'Direct ↔ Indirect Reporter Mode',
    titleHi: 'Direct ↔ Indirect Speech: किसी की बात रिपोर्ट करना',
    categoryHi: 'वाच्य और कथन',
    descriptionHi: 'कोट्स हटाकर "that" जोड़ना, Pronoun बदलना (I → he) और Tense को एक कदम पीछे ले जाना।',
    formulaHi: 'Rahul said, "I play." → Rahul said that he played.',
    dataFile: 'level5-direct-indirect-16.json',
    order: 16,
  },

  // LEVEL 6: GUIDED BLUEPRINT STUDIO (VOCABULARY & WRITING)
  {
    topicId: 'level6-word-lab-17',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Word-Lab: Prefixes, Suffixes & Animal Sounds',
    titleHi: 'Word Lab: नए शब्द बनाना (Prefix, Suffix व पर्यायवाची)',
    categoryHi: 'शब्दावली निर्माण',
    descriptionHi: 'शुरुआत में जोड़ें (un-happy), अंत में जोड़ें (care-ful); उल्टे और मिलते-जुलते शब्द।',
    formulaHi: 'Prefix (Beginning) + Root Word + Suffix (Ending) | Synonyms & Antonyms',
    dataFile: 'level6-word-lab-17.json',
    order: 17,
  },
  {
    topicId: 'level6-unseen-passage-18',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Unseen Passage: Skimming & Scanning',
    titleHi: 'Unseen Passage: पैराग्राफ से झटपट सही उत्तर ढूँढना',
    categoryHi: 'पठन कौशल',
    descriptionHi: 'कहानी का मेन आइडिया समझना और तारीख/नाम ढूँढने के लिए Scanning तकनीक।',
    formulaHi: 'Main Idea → Skim whole passage | Specific Fact/Date → Scan for keyword',
    dataFile: 'level6-unseen-passage-18.json',
    order: 18,
  },
  {
    topicId: 'level6-notice-writing-19',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Notice Writing Scaffold',
    titleHi: 'Notice Writing: 5 मिनट में परफेक्ट नोटिस बॉक्स',
    categoryHi: 'लेखन कौशल',
    descriptionHi: 'चौकोर बॉक्स, स्कूल का नाम, NOTICE, तारीख, हेडिंग, और 4Ws (Who, What, Where, When)।',
    formulaHi: '[Box] → [School Name] → [NOTICE] → [Date] → [Heading] → [4Ws Body] → [Sign]',
    dataFile: 'level6-notice-writing-19.json',
    order: 19,
  },
  {
    topicId: 'level6-letters-applications-20',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Letters & Formal Applications',
    titleHi: 'Letters & Applications: लीव एप्लीकेशन और फॉर्मल पत्र',
    categoryHi: 'लेखन कौशल',
    descriptionHi: 'स्कूल प्रिंसिपल को छुट्टी की अर्जी (Leave Application), फॉर्मल और इनफॉर्मल लेटर।',
    formulaHi: 'Formal: To + Subject + Respected Sir + Yours obediently | Informal: Dear [Name]',
    dataFile: 'level6-letters-applications-20.json',
    order: 20,
  },
  {
    topicId: 'level6-story-essay-21',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Story & Essay Outliner',
    titleHi: 'Story & Essay Studio: मजेदार कहानी और निबंध लिखना',
    categoryHi: 'लेखन कौशल',
    descriptionHi: 'कहानी: शुरुआत → मोड़ → समाधान और सीख; निबंध: भूमिका → मुख्य बातें → निष्कर्ष।',
    formulaHi: 'Story: Characters → Conflict → Moral | Essay: Intro → Facts/Reasons → Conclusion',
    dataFile: 'level6-story-essay-21.json',
    order: 21,
  },
];
