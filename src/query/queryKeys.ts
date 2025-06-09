// Query key for contacts
export const userContactKeys = {
  all: ["user"] as const,
  contacts: () => [...userContactKeys.all, "contacts"] as const,
  recentContacts: () => [...userContactKeys.contacts(), "recent"] as const,
} as any;
