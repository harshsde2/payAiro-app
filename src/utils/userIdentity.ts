/**
 * Topup (cash-in shadow) accounts are auto-created without a real PayAiro profile, so their
 * `username`/`payairo_tag` carries a ".tag" suffix (e.g. "manoj.tag"). They have no profile
 * details to show, so any "view profile" entry point must be disabled for them.
 */
export const isTopupUser = (username?: string | null): boolean =>
  /\.tag$/i.test((username ?? '').trim());
