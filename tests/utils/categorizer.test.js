import { describe, it, expect } from 'vitest';
import { categorizeTicket, CATEGORIES, getBucket } from '../../src/utils/categorizer.js';

describe('categorizeTicket', () => {
  it('detects billing keywords', () => {
    const ticket = { initialMessage: 'I was charged twice for my subscription', customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.categories).toContain('billing');
  });
  it('detects bug keywords', () => {
    const ticket = { initialMessage: "The page won't load and is stuck", customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.categories).toContain('bugs');
  });
  it('detects feature request keywords', () => {
    const ticket = { initialMessage: 'Is there a way to change my background?', customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.categories).toContain('feature-request');
  });
  it('detects UX problem keywords', () => {
    const ticket = { initialMessage: "I can't find the download button, very confusing", customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.categories).toContain('ux-problem');
  });
  it('detects quality keywords', () => {
    const ticket = { initialMessage: "The headshots don't look like me at all, very disappointed", customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.categories).toContain('quality');
  });
  it('detects access/login keywords', () => {
    const ticket = { initialMessage: "I can't login to my account, says unauthorized", customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.categories).toContain('access-login');
  });
  it('assigns cancellation-only billing tickets as general inquiry', () => {
    const ticket = { initialMessage: 'Please cancel my subscription', customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.primaryCategory).toBe('general-inquiry');
  });
  it('includes text from customer conversation parts', () => {
    const ticket = {
      initialMessage: 'Hi there',
      customerParts: [{ text: "The app crashed when I tried to upload" }],
    };
    const result = categorizeTicket(ticket);
    expect(result.categories).toContain('bugs');
  });
  it('returns general-inquiry when no keywords match', () => {
    const ticket = { initialMessage: 'Hello, I have a question about my account', customerParts: [] };
    const result = categorizeTicket(ticket);
    expect(result.primaryCategory).toBe('general-inquiry');
  });
});

describe('getBucket', () => {
  it('maps bugs to bugs bucket', () => { expect(getBucket('bugs')).toBe('bugs'); });
  it('maps billing to bugs bucket', () => { expect(getBucket('billing')).toBe('bugs'); });
  it('maps feature-request to feature-requests bucket', () => { expect(getBucket('feature-request')).toBe('feature-requests'); });
  it('maps ux-problem to ux-problems bucket', () => { expect(getBucket('ux-problem')).toBe('ux-problems'); });
  it('maps quality to ux-problems bucket', () => { expect(getBucket('quality')).toBe('ux-problems'); });
  it('maps access-login to ux-problems bucket', () => { expect(getBucket('access-login')).toBe('ux-problems'); });
});
