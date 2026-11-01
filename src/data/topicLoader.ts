import articlesData from './topics/level1-articles-01.json';
import nounData from './topics/level1-noun-02.json';
import adjectiveData from './topics/level2-adjective-05.json';
import svaData from './topics/level3-subject-verb-agreement-10.json';
import tensesData from './topics/level3-tenses-timeline-11.json';
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
  'level2-adjective-05': adjectiveData as unknown as FullTopicData,
  'level3-subject-verb-agreement-10': svaData as unknown as FullTopicData,
  'level3-tenses-timeline-11': tensesData as unknown as FullTopicData,
  'level5-active-passive-15': activePassiveData as unknown as FullTopicData,
  'level6-notice-writing-19': noticeWritingData as unknown as FullTopicData,
};

export function getTopicById(topicId: string): FullTopicData {
  return TOPIC_REGISTRY[topicId] || TOPIC_REGISTRY['level1-articles-01'];
}

