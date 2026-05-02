// Query key for contacts
export const userContactKeys = {
  all: ["user"] as const,
  contacts: () => [...userContactKeys.all, "contacts"] as const,
  recentContacts: () => [...userContactKeys.contacts(), "recent"] as const,
  userSearch: (query: string) => [...userContactKeys.all, "search", query] as const,
  fastApiUsersSearch: (query: string, limit: number) =>
    [...userContactKeys.all, "fastApiSearch", query, limit] as const,
} as any;
