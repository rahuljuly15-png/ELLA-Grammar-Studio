/**
 * Free Spaced Repetition Scheduler (FSRS) Engine
 * Designed for ELLA Grammar Studio (Classes 6-10)
 * 
 * Implements a cognitive science-based spaced repetition model
 * tracking Memory Stability (S) and Topic Difficulty (D) to calculate
 * optimal review intervals with 90% target retention.
 */

export type FSRSRating = 1 | 2 | 3 | 4;

export const FSRS_RATINGS = {
  AGAIN: 1 as FSRSRating, // पुनः अभ्यास (त्रुटि हुई / भूल गए)
  HARD: 2 as FSRSRating,  // कठिन (कठिनाई से याद आया)
  GOOD: 3 as FSRSRating,  // अच्छा (सामान्य सही प्रयास)
  EASY: 4 as FSRSRating,  // बहुत सरल (सहज और 100% सही)
};

export interface FSRSCardState {
  stability: number;       // S (in days)
  difficulty: number;      // D (1.0 to 10.0)
  reps: number;            // Total successful repetitions
  lapses: number;          // Number of times forgotten
  lastReview?: Date;       // Timestamp of previous review
}

export interface FSRSScheduleResult {
  rating: FSRSRating;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  intervalDays: number;
  nextDueDate: Date;
  estimatedRetention: number; // 0 to 100 (%)
  labelHi: string;
}

// Cognitive calibration parameters for adolescent learners (Classes 6-10)
const INITIAL_STABILITY: Record<FSRSRating, number> = {
  1: 0.5, // 12 hours / next morning
  2: 1.5, // ~1-2 days
  3: 3.5, // ~3-4 days
  4: 7.0, // 1 week
};

const INITIAL_DIFFICULTY: Record<FSRSRating, number> = {
  1: 7.5,
  2: 6.0,
  3: 4.5,
  4: 2.5,
};

/**
 * Calculates current estimated memory retrievability R(t) in %
 * R(t) = exp(-t / S)
 */
export function calculateRetention(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 0;
  if (elapsedDays <= 0) return 100;
  const r = Math.exp(-elapsedDays / stability);
  return Math.min(100, Math.max(0, Math.round(r * 100)));
}

/**
 * Automatically maps offline rule check results to an initial FSRS rating
 */
export function deriveRatingFromCheckResult(
  isValid: boolean,
  errorCount: number,
  firstAttempt: boolean = true
): FSRSRating {
  if (!isValid || errorCount > 0) {
    return FSRS_RATINGS.AGAIN; // 1
  }
  if (!firstAttempt) {
    return FSRS_RATINGS.HARD;  // 2 (corrected after hint)
  }
  return FSRS_RATINGS.GOOD;    // 3 (clean first try)
}

/**
 * Core FSRS transition function
 * Given previous card state and user rating, returns updated memory state and next review date.
 */
export function computeNextFSRSState(
  currentState: Partial<FSRSCardState> | undefined,
  rating: FSRSRating,
  reviewDate: Date = new Date()
): FSRSScheduleResult {
  const isFirstReview = !currentState || currentState.reps === undefined || currentState.reps === 0;

  let newStability: number;
  let newDifficulty: number;
  let newReps = currentState?.reps || 0;
  let newLapses = currentState?.lapses || 0;

  if (isFirstReview) {
    // Initial card setup
    newStability = INITIAL_STABILITY[rating];
    newDifficulty = INITIAL_DIFFICULTY[rating];
    if (rating === FSRS_RATINGS.AGAIN) {
      newLapses = 1;
      newReps = 0;
    } else {
      newReps = 1;
    }
  } else {
    // Subsequent review
    const prevStability = currentState.stability || INITIAL_STABILITY[3];
    const prevDifficulty = currentState.difficulty || INITIAL_DIFFICULTY[3];
    const lastDate = currentState.lastReview ? new Date(currentState.lastReview) : reviewDate;
    const elapsedDays = Math.max(0.1, (reviewDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentR = Math.exp(-elapsedDays / prevStability);

    // Difficulty update: D' = clamp(1, 10, D - 0.5 * (rating - 3))
    const difficultyDelta = -0.6 * (rating - 3);
    newDifficulty = Math.min(10, Math.max(1, +(prevDifficulty + difficultyDelta).toFixed(2)));

    if (rating === FSRS_RATINGS.AGAIN) {
      // Memory lapse: item forgotten
      newLapses += 1;
      // Post-lapse stability drops
      newStability = Math.max(0.5, +(prevStability * 0.25).toFixed(2));
    } else {
      // Successful retrieval: stability grows
      newReps += 1;
      const difficultyBonus = (11 - newDifficulty) / 5;
      const retrievabilityFactor = Math.exp(1 - currentR);
      const stabilityFactor = 1 + 0.8 * difficultyBonus * retrievabilityFactor;
      
      const ratingMultiplier = rating === FSRS_RATINGS.HARD ? 0.75 : rating === FSRS_RATINGS.EASY ? 1.4 : 1.0;
      newStability = Math.max(prevStability + 0.5, +(prevStability * stabilityFactor * ratingMultiplier).toFixed(2));
    }
  }

  // Calculate interval in days (target retention = 90%)
  const intervalDays = Math.max(1, Math.round(newStability));
  const nextDueDate = new Date(reviewDate);
  nextDueDate.setDate(nextDueDate.getDate() + intervalDays);

  const estimatedRetention = calculateRetention(newStability, 0);

  const labelsHi: Record<FSRSRating, string> = {
    1: 'पुनः अभ्यास आवश्यक (कल)',
    2: 'कठिन (1-2 दिन में दोहराएं)',
    3: 'अच्छा (3-4 दिन में दोहराएं)',
    4: 'सरल (अगले सप्ताह दोहराएं)',
  };

  return {
    rating,
    stability: newStability,
    difficulty: newDifficulty,
    reps: newReps,
    lapses: newLapses,
    intervalDays,
    nextDueDate,
    estimatedRetention,
    labelHi: labelsHi[rating],
  };
}
