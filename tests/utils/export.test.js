import { describe, it, expect } from 'vitest';
import { buildCSV } from '../../src/utils/export';

describe('buildCSV', () => {
  it('returns header row when given empty array', () => {
    const csv = buildCSV([]);
    expect(csv).toBe('ID,Customer,Subject,Agent,Status,Category,Sentiment,Created Date,First Response Time,Resolution Time');
  });

  it('formats a single ticket correctly', () => {
    const ticket = {
      id: '123',
      customerName: 'Alice',
      title: 'Login broken',
      agentName: 'Bob',
      state: 'open',
      primaryCategory: 'bugs',
      sentiment: 'negative',
      createdAt: 1714195200,
      timeToAdminReply: 300,
      timeToFirstClose: null,
    };
    const csv = buildCSV([ticket]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe('123,Alice,Login broken,Bob,open,bugs,negative,2024-04-27T05:20:00.000Z,5.0 min,N/A');
  });

  it('escapes commas and quotes in fields', () => {
    const ticket = {
      id: '456',
      customerName: 'Eve, Jr.',
      title: 'Says "error"',
      agentName: 'Carol',
      state: 'closed',
      primaryCategory: 'ux-problem',
      sentiment: 'neutral',
      createdAt: 1714200000,
      timeToAdminReply: 7200,
      timeToFirstClose: 86400,
    };
    const csv = buildCSV([ticket]);
    const lines = csv.split('\n');
    expect(lines[1]).toContain('"Eve, Jr."');
    expect(lines[1]).toContain('"Says ""error"""');
  });

  it('handles missing fields gracefully', () => {
    const ticket = {
      id: '789',
      customerName: null,
      title: undefined,
      agentName: null,
      state: null,
      primaryCategory: null,
      sentiment: null,
      createdAt: null,
      timeToAdminReply: null,
      timeToFirstClose: null,
    };
    const csv = buildCSV([ticket]);
    const lines = csv.split('\n');
    expect(lines[1]).toBe('789,,,,,,,N/A,N/A,N/A');
  });
});
