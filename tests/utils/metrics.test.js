import { describe, it, expect } from 'vitest';
import { computeMetrics } from '../../src/utils/metrics.js';

const makeProcessedTicket = (overrides = {}) => ({
  id: '1',
  createdAt: 1777294812,
  state: 'closed',
  assignedAgentId: 6570694,
  agentName: 'Mary A',
  timeToAdminReply: 600,
  timeToFirstClose: 3600,
  countReopens: 0,
  rating: null,
  sentiment: 'neutral',
  sentimentScore: 0,
  primaryCategory: 'billing',
  categories: ['billing'],
  adminParts: [{ authorName: 'Mary A', partType: 'comment' }],
  ...overrides,
});

describe('computeMetrics', () => {
  it('computes total ticket count', () => {
    const tickets = [makeProcessedTicket(), makeProcessedTicket({ id: '2' })];
    const m = computeMetrics(tickets);
    expect(m.totalTickets).toBe(2);
  });

  it('computes state breakdown', () => {
    const tickets = [
      makeProcessedTicket({ state: 'closed' }),
      makeProcessedTicket({ id: '2', state: 'open' }),
      makeProcessedTicket({ id: '3', state: 'snoozed' }),
    ];
    const m = computeMetrics(tickets);
    expect(m.stateBreakdown.closed).toBe(1);
    expect(m.stateBreakdown.open).toBe(1);
    expect(m.stateBreakdown.snoozed).toBe(1);
  });

  it('computes average response time', () => {
    const tickets = [
      makeProcessedTicket({ timeToAdminReply: 600 }),
      makeProcessedTicket({ id: '2', timeToAdminReply: 1200 }),
    ];
    const m = computeMetrics(tickets);
    expect(m.avgResponseTime).toBe(900);
  });

  it('ignores null response times in average', () => {
    const tickets = [
      makeProcessedTicket({ timeToAdminReply: 600 }),
      makeProcessedTicket({ id: '2', timeToAdminReply: null }),
    ];
    const m = computeMetrics(tickets);
    expect(m.avgResponseTime).toBe(600);
  });

  it('computes resolution rate', () => {
    const tickets = [
      makeProcessedTicket({ state: 'closed' }),
      makeProcessedTicket({ id: '2', state: 'open' }),
    ];
    const m = computeMetrics(tickets);
    expect(m.resolutionRate).toBe(0.5);
  });

  it('computes average rating from rated tickets only', () => {
    const tickets = [
      makeProcessedTicket({ rating: 5 }),
      makeProcessedTicket({ id: '2', rating: 3 }),
      makeProcessedTicket({ id: '3', rating: null }),
    ];
    const m = computeMetrics(tickets);
    expect(m.avgRating).toBe(4);
    expect(m.ratedCount).toBe(2);
  });

  it('computes sentiment distribution', () => {
    const tickets = [
      makeProcessedTicket({ sentiment: 'positive' }),
      makeProcessedTicket({ id: '2', sentiment: 'negative' }),
      makeProcessedTicket({ id: '3', sentiment: 'neutral' }),
    ];
    const m = computeMetrics(tickets);
    expect(m.sentimentDistribution.positive).toBe(1);
    expect(m.sentimentDistribution.negative).toBe(1);
    expect(m.sentimentDistribution.neutral).toBe(1);
  });

  it('computes per-agent stats', () => {
    const tickets = [
      makeProcessedTicket({ agentName: 'Mary A', timeToAdminReply: 600, state: 'closed' }),
      makeProcessedTicket({ id: '2', agentName: 'Mary A', timeToAdminReply: 1200, state: 'open' }),
      makeProcessedTicket({ id: '3', agentName: 'Jas R', timeToAdminReply: 300, state: 'closed' }),
    ];
    const m = computeMetrics(tickets);
    expect(m.agentStats['Mary A'].ticketCount).toBe(2);
    expect(m.agentStats['Mary A'].avgResponseTime).toBe(900);
    expect(m.agentStats['Mary A'].closedRate).toBe(0.5);
    expect(m.agentStats['Jas R'].ticketCount).toBe(1);
  });

  it('computes category distribution', () => {
    const tickets = [
      makeProcessedTicket({ primaryCategory: 'billing' }),
      makeProcessedTicket({ id: '2', primaryCategory: 'billing' }),
      makeProcessedTicket({ id: '3', primaryCategory: 'bugs' }),
    ];
    const m = computeMetrics(tickets);
    expect(m.categoryDistribution.billing).toBe(2);
    expect(m.categoryDistribution.bugs).toBe(1);
  });

  it('computes response time buckets', () => {
    const tickets = [
      makeProcessedTicket({ timeToAdminReply: 120 }),
      makeProcessedTicket({ id: '2', timeToAdminReply: 600 }),
      makeProcessedTicket({ id: '3', timeToAdminReply: 5000 }),
    ];
    const m = computeMetrics(tickets);
    expect(m.responseTimeBuckets['0-5min']).toBe(1);
    expect(m.responseTimeBuckets['5-15min']).toBe(1);
    expect(m.responseTimeBuckets['1-2hr']).toBe(1);
  });
});
