export interface AuthTokenSet {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokenStore {
  getTokens(): Promise<AuthTokenSet | null>;
  setTokens(tokens: AuthTokenSet): Promise<void>;
  clearTokens(): Promise<void>;
}

class MemoryAuthTokenStore implements AuthTokenStore {
  private tokens: AuthTokenSet | null = null;

  async getTokens(): Promise<AuthTokenSet | null> {
    return this.tokens;
  }

  async setTokens(tokens: AuthTokenSet): Promise<void> {
    this.tokens = tokens;
  }

  async clearTokens(): Promise<void> {
    this.tokens = null;
  }
}

let authTokenStore: AuthTokenStore = new MemoryAuthTokenStore();

export function getAuthTokenStore() {
  return authTokenStore;
}

export function setAuthTokenStore(store: AuthTokenStore) {
  authTokenStore = store;
}
