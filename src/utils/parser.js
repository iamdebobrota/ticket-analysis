export function stripHtml(html) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, ' ');
  const decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return decoded.replace(/\s+/g, ' ').trim();
}

function normalizePart(part) {
  return {
    partType: part.part_type,
    body: part.body,
    text: stripHtml(part.body),
    createdAt: part.created_at,
    authorId: part.author?.id,
    authorType: part.author?.type,
    authorName: part.author?.name,
  };
}

export function parseTickets(rawTickets, sourceFileName) {
  return rawTickets.map(t => {
    const parts = (t.conversation_parts?.conversation_parts || []).map(normalizePart);
    const customerParts = parts.filter(
      p => (p.authorType === 'lead' || p.authorType === 'user' || p.authorType === 'contact') && p.partType === 'comment'
    );
    const adminParts = parts.filter(p => p.authorType === 'admin' && p.partType === 'comment');
    const agentName = adminParts.length > 0 ? adminParts[0].authorName : null;

    return {
      id: t.id,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      state: t.state,
      sourceType: t.source?.type,
      title: t.title || t.source?.subject || '',
      initialMessage: stripHtml(t.source?.body),
      customerName: t.source?.author?.name || 'Unknown',
      customerEmail: t.source?.author?.email || '',
      assignedAgentId: t.admin_assignee_id,
      agentName,
      timeToAdminReply: t.statistics?.time_to_admin_reply ?? null,
      timeToFirstClose: t.statistics?.time_to_first_close ?? null,
      timeToLastClose: t.statistics?.time_to_last_close ?? null,
      medianTimeToReply: t.statistics?.median_time_to_reply ?? null,
      countReopens: t.statistics?.count_reopens ?? 0,
      countAssignments: t.statistics?.count_assignments ?? 0,
      countConversationParts: t.statistics?.count_conversation_parts ?? 0,
      firstAdminReplyAt: t.statistics?.first_admin_reply_at ?? null,
      lastAdminReplyAt: t.statistics?.last_admin_reply_at ?? null,
      rating: t.conversation_rating?.rating ?? null,
      ratingRemark: t.conversation_rating?.remark ?? null,
      language: t.custom_attributes?.Language ?? 'Unknown',
      parts,
      customerParts,
      adminParts,
      sourceFile: sourceFileName,
    };
  });
}

export function mergeTickets(...ticketArrays) {
  const seen = new Map();
  for (const arr of ticketArrays) {
    for (const ticket of arr) {
      if (!seen.has(ticket.id)) {
        seen.set(ticket.id, ticket);
      }
    }
  }
  return Array.from(seen.values());
}
