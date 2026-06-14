import { describe, it, expect } from 'vitest';
import { scoreSentiment, classifySentiment } from '../../src/utils/sentiment.js';

describe('scoreSentiment', () => {
  it('scores positive words', () => {
    expect(scoreSentiment('Thank you, that was great and helpful')).toBeGreaterThan(0);
  });
  it('scores negative words', () => {
    expect(scoreSentiment('I am frustrated and angry, this is terrible')).toBeLessThan(0);
  });
  it('returns 0 for neutral text', () => {
    expect(scoreSentiment('I have a question about my order')).toBe(0);
  });
  it('applies intensity modifiers', () => {
    const withModifier = scoreSentiment('very frustrated');
    const without = scoreSentiment('frustrated');
    expect(Math.abs(withModifier)).toBeGreaterThan(Math.abs(without));
  });
  it('handles empty string', () => {
    expect(scoreSentiment('')).toBe(0);
  });
});

describe('classifySentiment', () => {
  it('classifies positive score as positive', () => { expect(classifySentiment(2)).toBe('positive'); });
  it('classifies negative score as negative', () => { expect(classifySentiment(-1)).toBe('negative'); });
  it('classifies zero as neutral', () => { expect(classifySentiment(0)).toBe('neutral'); });
});
