import Dexie, { type EntityTable } from 'dexie';

export interface Student {
  id?: number;
  name: string;
  current_level: number;
  created_at: Date;
}
export interface GrammarPoint {
  topic_id: string;
  title: string;
  lesson_json: any;
}
export interface ReviewState {
  id?: number;
  student_id: number;
  topic_id: string;
  rule_recall_score: number;
  production_accuracy_score: number;
  next_due_date: Date;
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
}

const db = new Dexie('ELLAGrammarDB') as Dexie & {
  students: EntityTable<Student, 'id'>;
  grammar_points: EntityTable<GrammarPoint, 'topic_id'>;
  review_states: EntityTable<ReviewState, 'id'>;
  session_logs: EntityTable<SessionLog, 'id'>;
  error_patterns: EntityTable<ErrorPattern, 'id'>;
};

db.version(1).stores({
  students: '++id, name',
  grammar_points: 'topic_id, title',
  review_states: '++id, student_id, topic_id',
  session_logs: '++id, student_id, topic_id',
  error_patterns: '++id, student_id, topic_id'
});

export { db };

