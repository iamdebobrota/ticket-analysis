export const CATEGORIES = {
  bugs: {
    label: 'Bugs',
    keywords: ['error', 'broken', "doesn't work", 'crash', 'crashed', 'stuck', "can't access", 'charged twice', "won't load", 'glitch', 'bug', 'not working', 'not loading'],
  },
  'feature-request': {
    label: 'Feature Requests',
    keywords: ['how do i', 'can i', 'wish', 'would be nice', 'is there a way', 'looking to', 'want to', 'option for', 'ability to', 'would like to'],
  },
  'ux-problem': {
    label: 'UX Problems',
    keywords: ['confusing', "don't understand", 'where is', "can't find", 'hard to', "won't let me", 'keep getting', 'unclear', 'frustrating', "can't figure"],
  },
  billing: {
    label: 'Billing',
    keywords: ['charge', 'charged', 'refund', 'invoice', 'payment', 'billing', 'double charged', 'overcharged', 'money back'],
  },
  quality: {
    label: 'Quality',
    keywords: ['poor quality', "doesn't look like me", "don't look like me", 'inaccurate', 'terrible', 'disappointed', 'not satisfied', 'unrealistic', 'bad quality'],
  },
  'access-login': {
    label: 'Access/Login',
    keywords: ['login', 'log in', 'password', 'unauthorized', 'locked out', 'sign in', "can't log"],
  },
};

const CANCELLATION_ONLY = ['cancel', 'unsubscribe', 'cancel subscription', 'cancellation'];

const BUCKET_MAP = {
  bugs: 'bugs',
  billing: 'bugs',
  'feature-request': 'feature-requests',
  'ux-problem': 'ux-problems',
  quality: 'ux-problems',
  'access-login': 'ux-problems',
  'general-inquiry': null,
};

export function getBucket(category) {
  return BUCKET_MAP[category] || null;
}

export function categorizeTicket(ticket) {
  const text = [
    ticket.initialMessage || '',
    ...(ticket.customerParts || []).map(p => p.text || ''),
  ].join(' ').toLowerCase();

  const matched = [];
  for (const [key, config] of Object.entries(CATEGORIES)) {
    for (const keyword of config.keywords) {
      if (text.includes(keyword)) {
        matched.push(key);
        break;
      }
    }
  }

  if (matched.length === 1 && matched[0] === 'billing') {
    const hasCancellationOnly = CANCELLATION_ONLY.some(kw => text.includes(kw));
    const hasNonCancellationBilling = CATEGORIES.billing.keywords.some(
      kw => !CANCELLATION_ONLY.some(ck => kw.includes(ck)) && text.includes(kw)
    );
    if (hasCancellationOnly && !hasNonCancellationBilling) {
      return { categories: ['general-inquiry'], primaryCategory: 'general-inquiry' };
    }
  }

  if (matched.length === 0) {
    return { categories: ['general-inquiry'], primaryCategory: 'general-inquiry' };
  }

  return { categories: matched, primaryCategory: matched[0] };
}

export function categorizeAll(tickets) {
  return tickets.map(ticket => {
    const { categories, primaryCategory } = categorizeTicket(ticket);
    return { ...ticket, categories, primaryCategory };
  });
}
