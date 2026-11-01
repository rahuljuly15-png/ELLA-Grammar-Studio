import { db, type Student, type GrammarPoint, type ReviewState, type SessionLog, type ErrorPattern } from '../db/dexieDb';

export interface ExportDataPayload {
  version: number;
  exportedAt: string;
  appName: string;
  data: {
    students: Student[];
    grammar_points: GrammarPoint[];
    review_states: ReviewState[];
    session_logs: SessionLog[];
    error_patterns: ErrorPattern[];
  };
}

/**
 * 1-Click JSON Database Export
 * Dumps all Dexie.js indexed tables into a formatted JSON file and triggers instant download.
 */
export async function exportDatabaseToJson(customFilename?: string): Promise<void> {
  const students = await db.students.toArray();
  const grammar_points = await db.grammar_points.toArray();
  const review_states = await db.review_states.toArray();
  const session_logs = await db.session_logs.toArray();
  const error_patterns = await db.error_patterns.toArray();

  const payload: ExportDataPayload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    appName: 'ELLA Grammar Studio v2.1',
    data: {
      students,
      grammar_points,
      review_states,
      session_logs,
      error_patterns,
    },
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = customFilename || `ella-grammar-backup-${timestamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates and restores database from exported JSON
 * Features:
 * 1. Pre-restore auto safety snapshot
 * 2. Proper Date object deserialization (string -> Date)
 * 3. Atomic transaction across all 5 tables
 */
export async function importDatabaseFromJson(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const payload = JSON.parse(text) as ExportDataPayload;

    // Validation
    if (!payload.data || typeof payload.data !== 'object') {
      return { success: false, message: 'अमान्य बैकअप फ़ाइल: "data" ऑब्जेक्ट नहीं मिला।' };
    }

    // 1. Safety snapshot before overwriting
    try {
      await exportDatabaseToJson(`ella-pre-restore-safety-snapshot-${Date.now()}.json`);
    } catch {
      // Continue even if snapshot fails
    }

    // 2. Deserialize dates properly
    const students: Student[] = (payload.data.students || []).map((s) => ({
      ...s,
      created_at: new Date(s.created_at || Date.now()),
    }));

    const grammar_points: GrammarPoint[] = payload.data.grammar_points || [];

    const review_states: ReviewState[] = (payload.data.review_states || []).map((r) => ({
      ...r,
      next_due_date: new Date(r.next_due_date || Date.now()),
    }));

    const session_logs: SessionLog[] = (payload.data.session_logs || []).map((sl) => ({
      ...sl,
      timestamp: new Date(sl.timestamp || Date.now()),
    }));

    const error_patterns: ErrorPattern[] = (payload.data.error_patterns || []).map((ep) => ({
      ...ep,
      timestamp: new Date(ep.timestamp || Date.now()),
    }));

    // 3. Atomic Dexie transaction
    await db.transaction(
      'rw',
      [db.students, db.grammar_points, db.review_states, db.session_logs, db.error_patterns],
      async () => {
        await db.students.clear();
        await db.grammar_points.clear();
        await db.review_states.clear();
        await db.session_logs.clear();
        await db.error_patterns.clear();

        if (students.length > 0) await db.students.bulkAdd(students);
        if (grammar_points.length > 0) await db.grammar_points.bulkAdd(grammar_points);
        if (review_states.length > 0) await db.review_states.bulkAdd(review_states);
        if (session_logs.length > 0) await db.session_logs.bulkAdd(session_logs);
        if (error_patterns.length > 0) await db.error_patterns.bulkAdd(error_patterns);
      }
    );

    return {
      success: true,
      message: `बैकअप सफलतापूर्वक रीस्टोर हुआ! (${session_logs.length} सत्र, ${review_states.length} रिविज़न रिकॉर्ड)`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      message: `बैकअप आयात करने में विफल: ${err.message || 'अज्ञात त्रुटि'}`,
    };
  }
}

/**
 * DPDP Act 2023 Compliance: Wipe all student data from local device
 */
export async function deleteStudentData(studentId: number = 1): Promise<{ success: boolean; message: string }> {
  try {
    await db.transaction(
      'rw',
      [db.students, db.review_states, db.session_logs, db.error_patterns],
      async () => {
        await db.students.where('id').equals(studentId).delete();
        await db.review_states.where('student_id').equals(studentId).delete();
        await db.session_logs.where('student_id').equals(studentId).delete();
        await db.error_patterns.where('student_id').equals(studentId).delete();
      }
    );
    return { success: true, message: 'आपका समस्त डेटा इस डिवाइस से हमेशा के लिए हटा दिया गया है।' };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: `डेटा हटाने में त्रुटि: ${err.message}` };
  }
}

/**
 * Returns database counts for UI display
 */
export async function getOfflineDbCounts() {
  const [sessionsCount, errorsCount, reviewsCount] = await Promise.all([
    db.session_logs.count(),
    db.error_patterns.count(),
    db.review_states.count(),
  ]);

  return {
    sessionsCount,
    errorsCount,
    reviewsCount,
  };
}
