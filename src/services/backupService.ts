import { db } from '../db/dexieDb';

export interface ExportDataPayload {
  version: number;
  exportedAt: string;
  appName: string;
  data: {
    students: unknown[];
    grammar_points: unknown[];
    review_states: unknown[];
    session_logs: unknown[];
    error_patterns: unknown[];
  };
}

/**
 * 1-Click JSON Database Export
 * Dumps all Dexie.js indexed tables into a formatted JSON file and triggers instant download.
 */
export async function exportDatabaseToJson(): Promise<void> {
  const students = await db.students.toArray();
  const grammar_points = await db.grammar_points.toArray();
  const review_states = await db.review_states.toArray();
  const session_logs = await db.session_logs.toArray();
  const error_patterns = await db.error_patterns.toArray();

  const payload: ExportDataPayload = {
    version: 1,
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
  anchor.download = `ella-grammar-backup-${timestamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Restore database from exported JSON
 */
export async function importDatabaseFromJson(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const payload: ExportDataPayload = JSON.parse(text);

    if (!payload.data) {
      return { success: false, message: 'अमान्य बैकअप फ़ाइल प्रारूप (Invalid backup format)' };
    }

    await db.transaction(
      'rw',
      [db.students, db.grammar_points, db.review_states, db.session_logs, db.error_patterns],
      async () => {
        if (payload.data.students?.length) {
          await db.students.clear();
          await db.students.bulkAdd(payload.data.students as any);
        }
        if (payload.data.grammar_points?.length) {
          await db.grammar_points.clear();
          await db.grammar_points.bulkAdd(payload.data.grammar_points as any);
        }
        if (payload.data.review_states?.length) {
          await db.review_states.clear();
          await db.review_states.bulkAdd(payload.data.review_states as any);
        }
        if (payload.data.session_logs?.length) {
          await db.session_logs.clear();
          await db.session_logs.bulkAdd(payload.data.session_logs as any);
        }
        if (payload.data.error_patterns?.length) {
          await db.error_patterns.clear();
          await db.error_patterns.bulkAdd(payload.data.error_patterns as any);
        }
      }
    );

    return {
      success: true,
      message: 'बैकअप सफलतापूर्वक रीस्टोर कर लिया गया! (Database restored successfully)',
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

