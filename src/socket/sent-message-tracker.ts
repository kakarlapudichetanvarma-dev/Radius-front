// Tracks IDs of messages sent by the current user so socket echo is ignored
export const sentMessageIds = new Set<string>();

export const trackSentMessage = (id: string) => {
  sentMessageIds.add(id);
  // Auto-clean after 10s to avoid memory leak
  setTimeout(() => sentMessageIds.delete(id), 10_000);
};