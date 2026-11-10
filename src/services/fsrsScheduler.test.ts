import { describe, it, expect } from 'vitest';
import {
  FSRS_RATINGS,
  calculateRetention,
  deriveRatingFromCheckResult,
  computeNextFSRSState,
} from './fsrsScheduler';

describe('FSRS Scheduler - Memory Stability & Interval Transitions', () => {
  it('correctly derives initial rating from rule check output', () => {
    // Errors present -> Rating 1 (Again)
    expect(deriveRatingFromCheckResult(false, 2, true)).toBe(FSRS_RATINGS.AGAIN);
    expect(deriveRatingFromCheckResult(false, 1, false)).toBe(FSRS_RATINGS.AGAIN);

    // Clean first attempt -> Rating 3 (Good)
    expect(deriveRatingFromCheckResult(true, 0, true)).toBe(FSRS_RATINGS.GOOD);

    // Corrected after hint -> Rating 2 (Hard)
    expect(deriveRatingFromCheckResult(true, 0, false)).toBe(FSRS_RATINGS.HARD);
  });

  it('calculates memory retention accurately over time', () => {
    // Zero elapsed time should yield 100% retention
    expect(calculateRetention(4.0, 0)).toBe(100);

    // When elapsed time equals stability, R = e^-1 ≈ 36.79% -> 37%
    expect(calculateRetention(5.0, 5.0)).toBe(37);

    // When elapsed time is small fraction of stability, retention remains very high
    expect(calculateRetention(10.0, 1.0)).toBeGreaterThan(85);
  });

  it('initializes card state appropriately on first review', () => {
    const baseDate = new Date('2026-11-10T12:00:00Z');

    // First review: Rating 1 (Again)
    const againResult = computeNextFSRSState(undefined, FSRS_RATINGS.AGAIN, baseDate);
    expect(againResult.stability).toBe(0.5);
    expect(againResult.difficulty).toBe(7.5);
    expect(againResult.lapses).toBe(1);
    expect(againResult.reps).toBe(0);
    expect(againResult.intervalDays).toBe(1);

    // First review: Rating 3 (Good)
    const goodResult = computeNextFSRSState(undefined, FSRS_RATINGS.GOOD, baseDate);
    expect(goodResult.stability).toBe(3.5);
    expect(goodResult.difficulty).toBe(4.5);
    expect(goodResult.reps).toBe(1);
    expect(goodResult.lapses).toBe(0);
    expect(goodResult.intervalDays).toBe(4);

    // First review: Rating 4 (Easy)
    const easyResult = computeNextFSRSState(undefined, FSRS_RATINGS.EASY, baseDate);
    expect(easyResult.stability).toBe(7.0);
    expect(easyResult.difficulty).toBe(2.5);
    expect(easyResult.reps).toBe(1);
    expect(easyResult.intervalDays).toBe(7);
  });

  it('expands stability and schedules longer intervals upon successful consecutive reviews', () => {
    const day1 = new Date('2026-11-10T12:00:00Z');
    const firstReview = computeNextFSRSState(undefined, FSRS_RATINGS.GOOD, day1);
    expect(firstReview.stability).toBe(3.5);

    // Review again 4 days later with 'Good'
    const day5 = new Date('2026-11-14T12:00:00Z');
    const secondReview = computeNextFSRSState(
      {
        stability: firstReview.stability,
        difficulty: firstReview.difficulty,
        reps: firstReview.reps,
        lapses: firstReview.lapses,
        lastReview: day1,
      },
      FSRS_RATINGS.GOOD,
      day5
    );

    // Stability must have grown significantly beyond 3.5 days
    expect(secondReview.stability).toBeGreaterThan(firstReview.stability);
    expect(secondReview.reps).toBe(2);
    expect(secondReview.intervalDays).toBeGreaterThanOrEqual(5);

    // Review a third time 10 days later with 'Easy'
    const day15 = new Date('2026-11-24T12:00:00Z');
    const thirdReview = computeNextFSRSState(
      {
        stability: secondReview.stability,
        difficulty: secondReview.difficulty,
        reps: secondReview.reps,
        lapses: secondReview.lapses,
        lastReview: day5,
      },
      FSRS_RATINGS.EASY,
      day15
    );

    expect(thirdReview.stability).toBeGreaterThan(secondReview.stability);
    expect(thirdReview.reps).toBe(3);
    expect(thirdReview.intervalDays).toBeGreaterThan(secondReview.intervalDays);
  });

  it('handles lapse correctly when student forgets a previously mastered topic', () => {
    const day1 = new Date('2026-11-10T12:00:00Z');
    const masteredState = {
      stability: 14.0,
      difficulty: 3.5,
      reps: 4,
      lapses: 0,
      lastReview: day1,
    };

    // Student reviews 15 days later and gets it wrong (Rating 1 - Again)
    const day16 = new Date('2026-11-25T12:00:00Z');
    const lapseResult = computeNextFSRSState(masteredState, FSRS_RATINGS.AGAIN, day16);

    // Stability should drop, lapses incremented, next due date scheduled for tomorrow
    expect(lapseResult.lapses).toBe(1);
    expect(lapseResult.stability).toBeLessThan(masteredState.stability);
    expect(lapseResult.intervalDays).toBeLessThanOrEqual(4);
    expect(lapseResult.difficulty).toBeGreaterThan(masteredState.difficulty);
  });
});
