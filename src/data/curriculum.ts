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
    titleHi: 'इंजन 1: वाक्य लेगो इंजन',
    titleEn: 'The Sentence Lego Engine',
    taglineHi: 'शब्द भेद (Parts of Speech) और SVO वाक्य संरचना',
    icon: 'Blocks',
    color: 'indigo',
  },
  time_mood_slider: {
    id: 'time_mood_slider',
    titleHi: 'इंजन 2: समय व भाव स्लाइडर',
    titleEn: 'The Time & Mood Slider',
    taglineHi: 'क्रिया, काल (Tenses) और मोडल्स (Modals)',
    icon: 'Clock',
    color: 'emerald',
  },
  perspective_transformer: {
    id: 'perspective_transformer',
    titleHi: 'इंजन 3: दृष्टिकोण रूपांतरक',
    titleEn: 'The Perspective Transformer',
    taglineHi: 'वाच्य (Voice) और कथन (Speech)',
    icon: 'Repeat',
    color: 'amber',
  },
  blueprint_studio: {
    id: 'blueprint_studio',
    titleHi: 'इंजन 4: गाइडेड ब्लूप्रिंट स्टूडियो',
    titleEn: 'The Guided Blueprint Studio',
    taglineHi: 'शब्दावली, अपठित गद्यांश और लेखन कौशल (Writing Scaffolds)',
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
    titleHi: 'उपपद (Articles: A, An, The)',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'ध्वनि आधारित साउंड-ट्रैप डिटेक्टर: स्वर ध्वनि = An, व्यंजन ध्वनि = A, अद्वितीय/विशिष्ट = The।',
    formulaHi: 'स्वर ध्वनि (अ-औ) → An | व्यंजन ध्वनि (क-ज्ञ) → A | विशिष्ट/अद्वितीय → The',
    dataFile: 'level1-articles-01.json',
    order: 1,
  },
  {
    topicId: 'level1-noun-02',
    level: 1,
    engine: 'sentence_lego',
    title: 'Nouns & Its Dimensions',
    titleHi: 'संज्ञा एवं उसके प्रकार (Noun: Kinds, Number, Gender)',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'व्यक्ति, वस्तु, जाति, समूह (Collective) व भाव (Abstract) की पहचान; एकवचन-बहुवचन और लिंग।',
    formulaHi: 'Proper (Capitalized) | Common (General) | Collective (Group) | Abstract (Feelings)',
    dataFile: 'level1-noun-02.json',
    order: 2,
  },
  {
    topicId: 'level1-pronoun-03',
    level: 1,
    engine: 'sentence_lego',
    title: 'Pronouns: Personal, Possessive & Demonstrative',
    titleHi: 'सर्वनाम (Pronouns: I, Mine, This/That)',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'संज्ञा की पुनरावृत्ति रोकने वाले शब्द; अधिकार (mine/yours) व संकेत (this/that/these/those)।',
    formulaHi: 'Subjective (I/He) → Possessive (Mine/His) → Demonstrative (This/That)',
    dataFile: 'level1-pronoun-03.json',
    order: 3,
  },
  {
    topicId: 'level1-punctuation-04',
    level: 1,
    engine: 'sentence_lego',
    title: 'Capitalization & Punctuation',
    titleHi: 'विराम चिह्न और बड़े अक्षर (Punctuation & Caps)',
    categoryHi: 'बेसिक फाउंडेशन',
    descriptionHi: 'पहला अक्षर व Proper Noun कैपिटल; Full Stop (.), Question Mark (?), Comma (,) और Exclamation (!)।',
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
    titleHi: 'विशेषण व तुलना की अवस्थाएँ (Degrees: tall, taller, tallest)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'गुण व परिमाण; दो में तुलना (-er / more) और तीन या अधिक में (-est / most) तथा as...as।',
    formulaHi: 'Positive (tall) → Comparative (taller than) → Superlative (the tallest)',
    dataFile: 'level2-adjective-05.json',
    order: 5,
  },
  {
    topicId: 'level2-adverb-06',
    level: 2,
    engine: 'sentence_lego',
    title: 'Adverbs: Manner, Time & Place',
    titleHi: 'क्रिया विशेषण (Adverb: How, When, Where)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'क्रिया की रीति (quickly), समय (tomorrow) और स्थान (outside) का वर्णन करने वाले शब्द।',
    formulaHi: 'Manner (How: softly) | Time (When: now) | Place (Where: here)',
    dataFile: 'level2-adverb-06.json',
    order: 6,
  },
  {
    topicId: 'level2-preposition-07',
    level: 2,
    engine: 'sentence_lego',
    title: 'Prepositions: Place & Time',
    titleHi: 'संबंधबोधक (Prepositions: in, on, at, under)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'स्थान (in, on, under, behind) और समय (at 5 PM, on Monday, in July) का सटीक संबंध।',
    formulaHi: 'Clock Time → at | Days/Dates → on | Months/Years/Enclosed → in',
    dataFile: 'level2-preposition-07.json',
    order: 7,
  },
  {
    topicId: 'level2-conjunction-08',
    level: 2,
    engine: 'sentence_lego',
    title: 'Conjunctions (FANBOYS) & Interjections',
    titleHi: 'समुच्चयबोधक व विस्मयादिबोधक (Conjunctions & Interjections)',
    categoryHi: 'वर्णन और संबंध',
    descriptionHi: 'वाक्य जोड़ने वाले शब्द (For, And, Nor, But, Or, Yet, So) और अचानक भाव (Alas!, Hurrah!, Wow!)।',
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
    titleHi: 'क्रिया के तीन रूप (Action & State of Being: V1, V2, V3)',
    categoryHi: 'काल और क्रिया',
    descriptionHi: 'कार्य क्रियाएँ vs अवस्था क्रियाएँ (is/am/are); V1 (Base), V2 (Past), V3 (Past Participle)।',
    formulaHi: 'V1 (Eat/Go) → V2 (Ate/Went) → V3 (Eaten/Gone)',
    dataFile: 'level3-verb-forms-09.json',
    order: 9,
  },
  {
    topicId: 'level3-subject-verb-agreement-10',
    level: 3,
    engine: 'time_mood_slider',
    title: 'Subject-Verb Agreement',
    titleHi: 'कर्ता के साथ क्रिया का मेल (Subject-Verb Agreement)',
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
    titleHi: 'समय-रेखा काल चक्र (Present, Past, Future)',
    categoryHi: 'काल और क्रिया',
    descriptionHi: 'एक ही समय-रेखा पर Simple, Continuous, और Perfect काल का स्पष्ट अंतर।',
    formulaHi: 'Routine (V1/s) | Live Now (is/are + V-ing) | Completed (has/have + V3)',
    dataFile: 'level3-tenses-timeline-11.json',
    order: 11,
  },
  {
    topicId: 'level3-modals-meter-12',
    level: 3,
    engine: 'time_mood_slider',
    title: 'The Modal Meter: Can, May, Must, Should',
    titleHi: 'मोडल्स मीटर (Can, May, Must, Should)',
    categoryHi: 'काल और क्रिया',
    descriptionHi: 'क्षमता (Can/Could), अनुमति/संभावना (May/Might), कर्तव्य/अनिवार्यता (Must/Should)।',
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
    titleHi: 'वाक्य रचना, उद्देश्य-विधेय व वाक्यांश (Subject, Predicate, Phrases)',
    categoryHi: 'वाक्य रचना',
    descriptionHi: 'Subject (कर्ता) और Predicate (विधेय) की पहचान; अधूरे वाक्यांशों को पूर्ण वाक्य में बदलना।',
    formulaHi: '[Subject] + [Predicate (Verb + Object)] | Phrase = no verb',
    dataFile: 'level4-svo-sentence-13.json',
    order: 13,
  },
  {
    topicId: 'level4-jumbled-words-14',
    level: 4,
    engine: 'sentence_lego',
    title: 'Jumbled Words Rearrangement',
    titleHi: 'उलझे हुए शब्द सुलझाना (Jumbled Words SVO Blocks)',
    categoryHi: 'वाक्य रचना',
    descriptionHi: 'उलझे शब्दों में पहले कर्ता, फिर क्रिया, फिर कर्म ढूँढकर सार्थक वाक्य बनाना।',
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
    titleHi: 'कर्तृवाच्य और कर्मवाच्य (Active & Passive Voice)',
    categoryHi: 'वाच्य और कथन',
    descriptionHi: 'स्पॉटलाइट कर्ता से कर्म पर: Ram ate apple → The apple was eaten by Ram (Helping Verb + V3 + by)।',
    formulaHi: 'Active: S + V + O → Passive: O + Helping Verb + V3 + by + S',
    dataFile: 'level5-active-passive-15.json',
    order: 15,
  },
  {
    topicId: 'level5-direct-indirect-16',
    level: 5,
    engine: 'perspective_transformer',
    title: 'Direct ↔ Indirect Reporter Mode',
    titleHi: 'प्रत्यक्ष और अप्रत्यक्ष कथन (Direct & Indirect Speech)',
    categoryHi: 'वाच्य और कथन',
    descriptionHi: 'कोट्स हटाकर "that" जोड़ना, सर्वनाम बदलना (I → he) और काल को एक कदम पीछे ले जाना।',
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
    titleHi: 'शब्द निर्माण प्रयोगशाला (Prefix, Suffix, Synonyms & Animal Sounds)',
    categoryHi: 'शब्दावली निर्माण',
    descriptionHi: 'un + happy = unhappy; care + ful = careful; Synonyms/Antonyms; Dogs bark, Elephants trumpet।',
    formulaHi: 'Prefix (Beginning) + Root Word + Suffix (Ending) | Synonyms & Antonyms',
    dataFile: 'level6-word-lab-17.json',
    order: 17,
  },
  {
    topicId: 'level6-unseen-passage-18',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Unseen Passage: Skimming & Scanning',
    titleHi: 'अपठित गद्यांश की समझ (Skimming & Scanning)',
    categoryHi: 'पठन कौशल',
    descriptionHi: 'मुख्य विचार के लिए Skimming (तेज़ पढ़ना) और विशिष्ट तिथि/नाम के लिए Scanning (खोज करना)।',
    formulaHi: 'Main Idea → Skim whole passage | Specific Fact/Date → Scan for keyword',
    dataFile: 'level6-unseen-passage-18.json',
    order: 18,
  },
  {
    topicId: 'level6-notice-writing-19',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Notice Writing Scaffold',
    titleHi: 'सूचना लेखन प्रारूप (Notice Writing in a Square Box)',
    categoryHi: 'लेखन कौशल',
    descriptionHi: 'चौकोर बॉक्स में School Name, NOTICE, Date, Heading, और Who, What, Where, When के 4 चेक-इंडिकेटर्स।',
    formulaHi: '[Box] → [School Name] → [NOTICE] → [Date] → [Heading] → [4Ws Body] → [Sign]',
    dataFile: 'level6-notice-writing-19.json',
    order: 19,
  },
  {
    topicId: 'level6-letters-applications-20',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Letters & Formal Applications',
    titleHi: 'प्रार्थना पत्र और अनौपचारिक पत्र (Applications, Letters & Email)',
    categoryHi: 'लेखन कौशल',
    descriptionHi: 'To, The Principal से Yours obediently तक; अनौपचारिक पत्र (Dear friend) व संक्षिप्त ईमेल।',
    formulaHi: 'Formal: To + Subject + Respected Sir + Yours obediently | Informal: Dear [Name]',
    dataFile: 'level6-letters-applications-20.json',
    order: 20,
  },
  {
    topicId: 'level6-story-essay-21',
    level: 6,
    engine: 'blueprint_studio',
    title: 'Story & Essay Outliner',
    titleHi: 'कहानी और निबंध लेखन (Story & Essay Guided Blocks)',
    categoryHi: 'लेखन कौशल',
    descriptionHi: 'कहानी: Title → Beginning → Problem → Solution & Moral; निबंध: Introduction → Body → Conclusion।',
    formulaHi: 'Story: Characters → Conflict → Moral | Essay: Intro → Facts/Reasons → Conclusion',
    dataFile: 'level6-story-essay-21.json',
    order: 21,
  },
];

