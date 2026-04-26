export interface AuthTokenSet {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokenStore {
  getTokens(): Promise<AuthTokenSet | null>;
  setTokens(tokens: AuthTokenSet): Promise<void>;
  clearTokens(): Promise<void>;
}

// Default fallback store for development; replace with secure device storage in production.
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

// Allows the mobile app to plug in SecureStore or any other persistent token backend.
export function setAuthTokenStore(store: AuthTokenStore) {
  authTokenStore = store;
}
