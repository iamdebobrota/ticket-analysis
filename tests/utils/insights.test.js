import { describe, it, expect } from 'vitest';
import { computeInsights } from '../../src/utils/insights';

function makeTicket(overrides = {}) {
  return {
    id: '1',
    state: 'open',
    sentiment: 'neutral',
    primaryCategory: 'general-inquiry',
    createdAt: 1714200000,
    agentName: 'Agent A',
    timeToAdminReply: 600,
    ...overrides,
  };
}

describe('computeInsights', () => {
  it('returns empty array for no tickets', () => {
    const metrics = {
      totalTickets: 0,
      resolutionRate: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      categoryDistribution: {},
      agentStats: {},
      volumeByDay: [],
    };
    const result = computeInsights([], metrics);
    expect(result).toEqual([]);
  });

  it('flags low resolution rate when below 50%', () => {
    const tickets = [
      makeTicket({ state: 'open' }),
      makeTicket({ id: '2', state: 'open' }),
      makeTicket({ id: '3', state: 'closed' }),
    ];
    const metrics = {
      totalTickets: 3,
      resolutionRate: 0.33,
      sentimentDistribution: { positive: 1, neutral: 1, negative: 1 },
      categoryDistribution: { 'general-inquiry': 3 },
      agentStats: { 'Agent A': { avgResponseTime: 600, ticketCount: 3 } },
      volumeByDay: [{ date: '2024-04-27', total: 3 }],
    };
    const result = computeInsights(tickets, metrics);
    const resolutionInsight = result.find(i => i.id === 'resolution-rate');
    expect(resolutionInsight).toBeDefined();
    expect(resolutionInsight.severity).toBe('red');
    expect(resolutionInsight.message).toContain('33%');
  });

  it('flags high negative sentiment when above 30%', () => {
    const tickets = Array.from({ length: 10 }, (_, i) =>
      makeTicket({ id: String(i), sentiment: i < 4 ? 'negative' : 'neutral' })
    );
    const metrics = {
      totalTickets: 10,
      resolutionRate: 0.8,
      sentimentDistribution: { positive: 0, neutral: 6, negative: 4 },
      categoryDistribution: { 'general-inquiry': 10 },
      agentStats: { 'Agent A': { avgResponseTime: 600, ticketCount: 10 } },
      volumeByDay: [{ date: '2024-04-27', total: 10 }],
    };
    const result = computeInsights(tickets, metrics);
    const sentimentInsight = result.find(i => i.id === 'sentiment-drift');
    expect(sentimentInsight).toBeDefined();
    expect(sentimentInsight.severity).toBe('amber');
  });

  it('flags dominant category when above 35%', () => {
    const tickets = Array.from({ length: 10 }, (_, i) =>
      makeTicket({ id: String(i), primaryCategory: i < 5 ? 'bugs' : 'general-inquiry' })
    );
    const metrics = {
      totalTickets: 10,
      resolutionRate: 0.8,
      sentimentDistribution: { positive: 3, neutral: 5, negative: 2 },
      categoryDistribution: { bugs: 5, 'general-inquiry': 5 },
      agentStats: { 'Agent A': { avgResponseTime: 600, ticketCount: 10 } },
      volumeByDay: [{ date: '2024-04-27', total: 10 }],
    };
    const result = computeInsights(tickets, metrics);
    const catInsight = result.find(i => i.id === 'top-category');
    expect(catInsight).toBeDefined();
    expect(catInsight.severity).toBe('blue');
    expect(catInsight.message).toContain('bugs');
  });

  it('flags slow agent when >1.5x average response time', () => {
    const metrics = {
      totalTickets: 20,
      resolutionRate: 0.8,
      sentimentDistribution: { positive: 10, neutral: 8, negative: 2 },
      categoryDistribution: { 'general-inquiry': 20 },
      agentStats: {
        'Agent A': { avgResponseTime: 300, ticketCount: 10 },
        'Agent B': { avgResponseTime: 900, ticketCount: 10 },
      },
      volumeByDay: [{ date: '2024-04-27', total: 20 }],
    };
    const tickets = Array.from({ length: 20 }, (_, i) => makeTicket({ id: String(i) }));
    const result = computeInsights(tickets, metrics);
    const agentInsight = result.find(i => i.id === 'slow-agent');
    expect(agentInsight).toBeDefined();
    expect(agentInsight.severity).toBe('amber');
    expect(agentInsight.message).toContain('Agent B');
  });

  it('returns at most 5 insights sorted by severity', () => {
    const metrics = {
      totalTickets: 100,
      resolutionRate: 0.3,
      sentimentDistribution: { positive: 10, neutral: 40, negative: 50 },
      categoryDistribution: { bugs: 60, 'general-inquiry': 40 },
      agentStats: {
        'Agent A': { avgResponseTime: 300, ticketCount: 50 },
        'Agent B': { avgResponseTime: 3000, ticketCount: 50 },
      },
      volumeByDay: Array.from({ length: 10 }, (_, i) => ({
        date: `2024-04-${17 + i}`,
        total: i < 5 ? 5 : 15,
      })),
    };
    const tickets = Array.from({ length: 100 }, (_, i) => makeTicket({ id: String(i) }));
    const result = computeInsights(tickets, metrics);
    expect(result.length).toBeLessThanOrEqual(5);
    const severityOrder = { red: 0, amber: 1, blue: 2 };
    for (let i = 1; i < result.length; i++) {
      expect(severityOrder[result[i].severity]).toBeGreaterThanOrEqual(severityOrder[result[i - 1].severity]);
    }
  });
});
