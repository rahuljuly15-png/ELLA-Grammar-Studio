import Dexie, { type EntityTable } from 'dexie';

export interface Student {
  id?: number;
  name: string;
  current_level: number;
  created_at: Date;
}

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

export interface LessonSteps {
  '1_notice': NoticeStep;
  '2_hypothesize': HypothesizeStep;
  '3_clarify': ClarifyStep;
  '5_free_production'?: FreeProductionStep;
  '6_reflection'?: ReflectionStep;
}

export interface LessonJson {
  topicId: string;
  title: string;
  level: number;
  category: string;
  descriptionHi: string;
  steps: LessonSteps;
}

export interface GrammarPoint {
  topic_id: string;
  title: string;
  lesson_json: LessonJson;
}

export interface ReviewState {
  id?: number;
  student_id: number;
  topic_id: string;
  rule_recall_score: number;
  production_accuracy_score: number;
  next_due_date: Date;
  stability?: number;
  difficulty?: number;
  reps?: number;
  lapses?: number;
  last_review?: Date;
}

export interface SessionLog {
  id?: number;
  student_id: number;
  topic_id: string;
  student_sentence?: string;
  self_explanation_note?: string;
  timestamp: Date;
}

export interface ErrorPattern {
  id?: number;
  student_id: number;
  topic_id: string;
  wrong_input: string;
  corrected_output: string;
  caught_by: 'offline_rule' | 'gemini_ai';
  timestamp: Date;
  full_sentence?: string;
}

const db = new Dexie('ELLAGrammarDB') as Dexie & {
  students: EntityTable<Student, 'id'>;
  grammar_points: EntityTable<GrammarPoint, 'topic_id'>;
  review_states: EntityTable<ReviewState, 'id'>;
  session_logs: EntityTable<SessionLog, 'id'>;
  error_patterns: EntityTable<ErrorPattern, 'id'>;
};

// Version 1 (Initial schema)
db.version(1).stores({
  students: '++id, name',
  grammar_points: 'topic_id, title',
  review_states: '++id, student_id, topic_id',
  session_logs: '++id, student_id, topic_id',
  error_patterns: '++id, student_id, topic_id'
});

// Version 2 (Unique compound index, FSRS query index, timestamp indices)
db.version(2).stores({
  review_states: '++id, &[student_id+topic_id], student_id, topic_id, next_due_date',
  session_logs: '++id, student_id, topic_id, timestamp, [student_id+topic_id]',
  error_patterns: '++id, student_id, topic_id, timestamp, [student_id+topic_id]',
});

export { db };
