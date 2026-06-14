const POSITIVE_WORDS = [
  'thank', 'thanks', 'great', 'excellent', 'perfect', 'appreciate',
  'helpful', 'amazing', 'wonderful', 'love', 'happy', 'satisfied',
  'resolved', 'quick', 'fast', 'good', 'awesome',
];

const NEGATIVE_WORDS = [
  'frustrated', 'angry', 'terrible', 'horrible', 'awful', 'unacceptable',
  'disappointed', 'ridiculous', 'waste', 'scam', 'furious', 'upset',
  'unhappy', 'poor', 'bad', 'worst', 'complaint', 'disgusting',
];

const INTENSITY_MODIFIERS = [
  'very', 'extremely', 'absolutely', 'completely', 'totally',
  'incredibly', 'really', 'so',
];

export function scoreSentiment(text) {
  if (!text) return 0;
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  let score = 0;
  let intensityMultiplier = 1;

  for (const word of words) {
    if (INTENSITY_MODIFIERS.includes(word)) {
      intensityMultiplier = 1.5;
      continue;
    }
    if (POSITIVE_WORDS.includes(word)) {
      score += 1 * intensityMultiplier;
    } else if (NEGATIVE_WORDS.includes(word)) {
      score -= 1 * intensityMultiplier;
    }
    intensityMultiplier = 1;
  }
  return score;
}

export function classifySentiment(score) {
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

export function analyzeTicketSentiment(ticket) {
  const texts = [
    ticket.initialMessage || '',
    ...(ticket.customerParts || []).map(p => p.text || ''),
  ];
  const totalScore = texts.reduce((sum, text) => sum + scoreSentiment(text), 0);
  return {
    sentimentScore: totalScore,
    sentiment: classifySentiment(totalScore),
  };
}

export function analyzeSentimentAll(tickets) {
  return tickets.map(ticket => {
    const { sentimentScore, sentiment } = analyzeTicketSentiment(ticket);
    return { ...ticket, sentimentScore, sentiment };
  });
}
