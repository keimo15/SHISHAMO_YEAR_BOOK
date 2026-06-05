export function normalizeSongTitle(title) {
  return String(title).replace(/\//g, "／");
}

export function getSongTitleAliases(title) {
  const normalized = normalizeSongTitle(title);
  const legacy = normalized.replace(/／/g, "/");

  return [...new Set([normalized, legacy])];
}
