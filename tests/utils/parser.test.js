import { describe, it, expect } from 'vitest';
import { parseTickets, mergeTickets, stripHtml } from '../../src/utils/parser.js';

const makeTicket = (overrides = {}) => ({
  type: 'conversation',
  id: '1001',
  created_at: 1777294812,
  updated_at: 1777371669,
  state: 'closed',
  source: {
    type: 'email',
    body: '<p>Hello, I need help</p>',
    author: { type: 'lead', id: 'c1', name: 'Alice', email: 'alice@test.com' },
  },
  admin_assignee_id: 6570694,
  statistics: {
    time_to_admin_reply: 600,
    time_to_first_close: 3600,
    time_to_last_close: 3600,
    median_time_to_reply: 600,
    count_reopens: 0,
    count_assignments: 1,
    count_conversation_parts: 3,
    first_admin_reply_at: 1777295412,
    last_admin_reply_at: 1777295412,
  },
  conversation_rating: null,
  conversation_parts: {
    type: 'conversation_part.list',
    conversation_parts: [
      {
        part_type: 'comment',
        body: '<p>Thanks for reaching out</p>',
        created_at: 1777295412,
        author: { id: '6570694', type: 'admin', name: 'Mary A', email: 'support@aragon.ai' },
      },
    ],
  },
  ...overrides,
});

describe('stripHtml', () => {
  it('removes HTML tags and decodes entities', () => {
    expect(stripHtml('<p>Hello &amp; world</p>')).toBe('Hello & world');
  });
  it('returns empty string for null/undefined', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });
});

describe('parseTickets', () => {
  it('normalizes a raw ticket into flat structure', () => {
    const raw = [makeTicket()];
    const result = parseTickets(raw, 'test.json');
    expect(result).toHaveLength(1);
    const t = result[0];
    expect(t.id).toBe('1001');
    expect(t.state).toBe('closed');
    expect(t.customerName).toBe('Alice');
    expect(t.customerEmail).toBe('alice@test.com');
    expect(t.sourceType).toBe('email');
    expect(t.initialMessage).toBe('Hello, I need help');
    expect(t.assignedAgentId).toBe(6570694);
    expect(t.timeToAdminReply).toBe(600);
    expect(t.timeToFirstClose).toBe(3600);
    expect(t.countReopens).toBe(0);
    expect(t.rating).toBeNull();
    expect(t.sourceFile).toBe('test.json');
    expect(t.parts).toHaveLength(1);
    expect(t.parts[0].authorType).toBe('admin');
    expect(t.parts[0].authorName).toBe('Mary A');
    expect(t.parts[0].text).toBe('Thanks for reaching out');
  });
  it('extracts rating when present', () => {
    const raw = [makeTicket({ conversation_rating: { rating: 5, remark: 'Great!' } })];
    const result = parseTickets(raw, 'file.json');
    expect(result[0].rating).toBe(5);
    expect(result[0].ratingRemark).toBe('Great!');
  });
});

describe('mergeTickets', () => {
  it('deduplicates by id', () => {
    const a = [makeTicket({ id: '1' }), makeTicket({ id: '2' })];
    const b = [makeTicket({ id: '2' }), makeTicket({ id: '3' })];
    const parsedA = parseTickets(a, 'a.json');
    const parsedB = parseTickets(b, 'b.json');
    const merged = mergeTickets(parsedA, parsedB);
    expect(merged).toHaveLength(3);
    const ids = merged.map(t => t.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
  });
});
