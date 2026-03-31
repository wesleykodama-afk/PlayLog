import { env } from "../config.js";

const RAWG_BASE_URL = "https://api.rawg.io/api";

type RawgGame = {
  id: number;
  name: string;
  background_image?: string;
  released?: string;
  genres?: Array<{ name: string }>;
};

const requestRawg = async <T>(path: string) => {
  if (!env.RAWG_API_KEY) {
    throw new Error("RAWG_API_KEY is not configured.");
  }

  const url = new URL(`${RAWG_BASE_URL}${path}`);
  url.searchParams.set("key", env.RAWG_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("RAWG request failed.");
  }

  return (await response.json()) as T;
};

export const searchGames = async (query: string) => {
  const data = await requestRawg<{ results: RawgGame[] }>(`/games?search=${encodeURIComponent(query)}&page_size=8`);
  return data.results.map((game) => ({
    id: String(game.id),
    name: game.name,
    coverUrl: game.background_image ?? "",
    releaseDate: game.released ?? "",
    genre: game.genres?.map((item) => item.name).join(", ") ?? ""
  }));
};

export const getGameDetails = async (externalId: string) => {
  const game = await requestRawg<RawgGame>(`/games/${externalId}`);
  return {
    externalId: String(game.id),
    name: game.name,
    coverUrl: game.background_image ?? "",
    releaseDate: game.released ?? "",
    genre: game.genres?.map((item) => item.name).join(", ") ?? ""
  };
};
