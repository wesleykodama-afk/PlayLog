export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  username: string;
  email: string;
  role: Role;
  language: string;
};

export type Game = {
  id: string;
  name: string;
  platform: "STEAM" | "EPIC" | "GOG" | "PLAYSTATION" | "NINTENDO";
  status: "PLAYING" | "COMPLETED" | "PLATINUM" | "DROPPED";
  hoursPlayed: number;
  rating: number | null;
  review: string | null;
  playedDate: string | null;
  coverUrl: string | null;
  source: string;
  externalId: string | null;
  releaseDate?: string | null;
  genre?: string | null;
};

export type Activity = {
  id: string;
  type: string;
  gameName: string | null;
  hoursPlayed: number | null;
  rating: number | null;
  review: string | null;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  user: {
    username: string;
    profileImage: string | null;
  };
};

export type AffiliateProduct = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  affiliateLink: string;
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  profileImage?: string | null;
  totalHours: number;
  totalGames: number;
};

export type HomeCard = {
  name: string;
  coverUrl: string;
  hoursPlayed: number;
  rating: number | null;
};

export type HomePayload = {
  leaderboard: LeaderboardEntry[];
  tabs: {
    trending: HomeCard[];
    mostPlayed: HomeCard[];
    topRated: HomeCard[];
    lowestRated: HomeCard[];
  };
};

export type CustomLink = {
  name: string;
  url: string;
};

export type Settings = {
  id: string;
  preferredLanguage: "English" | "Spanish" | "Chinese" | "Japanese" | "Russian" | "Portuguese";
  steamProfileUrl: string | null;
  epicProfileUrl: string | null;
  gogProfileUrl: string | null;
  customLinks: CustomLink[];
};

export type ProfilePayload = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  profileImage: string | null;
  language: string;
  stats: {
    totalHours: number;
    totalGames: number;
    totalPlatinum: number;
  };
  games: Game[];
  settings: Settings | null;
};

export type RawgSuggestion = {
  id: string;
  name: string;
  coverUrl: string;
  releaseDate: string;
  genre: string;
};
