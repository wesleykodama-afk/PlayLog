import { XMLParser } from "fast-xml-parser";
import { normalizeSteamId } from "../utils/serialize.js";

const parser = new XMLParser({
  ignoreAttributes: false
});

type SteamGameXml = {
  gamesList?: {
    games?: {
      game?: Array<{
        appID?: string;
        name?: string;
        hoursOnRecord?: string;
        logo?: string;
      }> | {
        appID?: string;
        name?: string;
        hoursOnRecord?: string;
        logo?: string;
      };
    };
  };
};

export const fetchOwnedSteamGames = async (steamInput: string) => {
  const steamId = normalizeSteamId(steamInput);
  const url = `https://steamcommunity.com/profiles/${steamId}/games?tab=all&xml=1`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Steam profile could not be fetched.");
  }

  const xml = await response.text();
  const parsed = parser.parse(xml) as SteamGameXml;
  const rawGames = parsed.gamesList?.games?.game ?? [];
  const games = Array.isArray(rawGames) ? rawGames : [rawGames];

  return {
    steamId,
    games: games
      .filter((game) => game?.name)
      .map((game) => ({
        name: game.name ?? "Unknown game",
        externalId: game.appID ?? "",
        hoursPlayed: Number.parseFloat(game.hoursOnRecord ?? "0") || 0,
        coverUrl: game.logo ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appID}/${game.logo}.jpg` : ""
      }))
  };
};
