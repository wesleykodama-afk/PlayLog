export const parseCustomLinks = (value: string | null | undefined) => {
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const normalizeSteamId = (input: string) => {
  const trimmed = input.trim();
  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d+)/i);
  if (profileMatch) {
    return profileMatch[1];
  }

  return trimmed;
};
