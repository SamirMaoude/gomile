let cachedProfileAvatarUrl = null;

export function setCachedProfileAvatarUrl(avatarUrl) {
  cachedProfileAvatarUrl = avatarUrl || null;
}

export function getCachedProfileAvatarUrl() {
  return cachedProfileAvatarUrl;
}

export function clearCachedProfileAvatarUrl() {
  cachedProfileAvatarUrl = null;
}