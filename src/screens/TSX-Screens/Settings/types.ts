// Freshchat Types

export interface IFreshchatUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  externalId?: string;
}

export interface IFreshchatConfig {
  appId: string;
  appKey: string;
  domain?: string;
}

export interface IFreshchatCustomProperty {
  key: string;
  value: string;
}

export interface IFreshchatMessage {
  tag?: string;
  message?: string;
}

