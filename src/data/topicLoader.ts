import articlesData from './topics/level1-articles-01.json';
import nounData from './topics/level1-noun-02.json';
import pronounData from './topics/level1-pronoun-03.json';
import punctuationData from './topics/level1-punctuation-04.json';
import adjectiveData from './topics/level2-adjective-05.json';
import adverbData from './topics/level2-adverb-06.json';
import prepositionData from './topics/level2-preposition-07.json';
import conjunctionData from './topics/level2-conjunction-08.json';
import verbFormsData from './topics/level3-verb-forms-09.json';
import svaData from './topics/level3-subject-verb-agreement-10.json';
import tensesData from './topics/level3-tenses-timeline-11.json';
import modalsData from './topics/level3-modals-meter-12.json';
import activePassiveData from './topics/level5-active-passive-15.json';
import noticeWritingData from './topics/level6-notice-writing-19.json';

export interface NoticePair {
  sentence: string;
  highlightWord: string;
  soundHintHi: string;
}

export interface NoticeStep {
  stepTitleHi: string;
  instructionHi: string;
  pairs: NoticePair[];
}

export interface HypothesizeOption {
  textHi: string;
  isCorrect: boolean;
  feedbackHi: string;
}

export interface HypothesizeStep {
  stepTitleHi: string;
  questionHi: string;
  options: HypothesizeOption[];
}

export interface ClarifyExample {
  word: string;
  sound: string;
  reason: string;
}

export interface ClarifyStep {
  stepTitleHi: string;
  goldenRuleHi: string;
  theRuleHi: string;
  examples: ClarifyExample[];
}

export interface FreeProductionStep {
  stepTitleHi: string;
  promptHi: string;
  placeholderHi: string;
  sampleSolutions: string[];
}

export interface ReflectionStep {
  stepTitleHi: string;
  promptHi: string;
  recapPointsHi: string[];
}

export interface TopicSteps {
  '1_notice': NoticeStep;
  '2_hypothesize': HypothesizeStep;
  '3_clarify': ClarifyStep;
  '5_free_production': FreeProductionStep;
  '6_reflection': ReflectionStep;
}

export interface FullTopicData {
  topicId: string;
  title: string;
  level: number;
  category: string;
  descriptionHi: string;
  steps: TopicSteps;
}

export const TOPIC_REGISTRY: Record<string, FullTopicData> = {
  'level1-articles-01': articlesData as unknown as FullTopicData,
  'level1-noun-02': nounData as unknown as FullTopicData,
  'level1-pronoun-03': pronounData as unknown as FullTopicData,
  'level1-punctuation-04': punctuationData as unknown as FullTopicData,
  'level2-adjective-05': adjectiveData as unknown as FullTopicData,
  'level2-adverb-06': adverbData as unknown as FullTopicData,
  'level2-preposition-07': prepositionData as unknown as FullTopicData,
  'level2-conjunction-08': conjunctionData as unknown as FullTopicData,
  'level3-verb-forms-09': verbFormsData as unknown as FullTopicData,
  'level3-subject-verb-agreement-10': svaData as unknown as FullTopicData,
  'level3-tenses-timeline-11': tensesData as unknown as FullTopicData,
  'level3-modals-meter-12': modalsData as unknown as FullTopicData,
  'level5-active-passive-15': activePassiveData as unknown as FullTopicData,
  'level6-notice-writing-19': noticeWritingData as unknown as FullTopicData,
};

export function isTopicAvailable(topicId: string): boolean {
  return Object.prototype.hasOwnProperty.call(TOPIC_REGISTRY, topicId);
}

export function getTopicById(topicId: string): FullTopicData {
  if (!isTopicAvailable(topicId)) {
    console.warn(`[topicLoader] Topic "${topicId}" is not available in TOPIC_REGISTRY. Falling back to default.`);
  }
  return TOPIC_REGISTRY[topicId] || TOPIC_REGISTRY['level1-articles-01'];
}

