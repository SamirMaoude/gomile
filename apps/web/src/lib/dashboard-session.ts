export function buildDashboardUsername(email: string) {
  const base = email.split("@")[0]?.trim() ?? "";

  const formatted = base
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formatted || email;
}

export function buildDashboardAvatarLabel(username: string) {
  const parts = username.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "CL";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}
