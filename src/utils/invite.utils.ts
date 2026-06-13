// Extracts the invite token whether the user pastes a full link
// (https://chatonn.app/community/invite/abc123) or just the raw token.
export function extractInviteToken(input: string): string {
  const trimmed = input.trim();
  const parts = trimmed.split('/').filter(Boolean);
  return parts[parts.length - 1] || trimmed;
}