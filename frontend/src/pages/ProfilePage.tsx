import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import type { ProfilePayload } from "../types";

const filters = ["ALL", "PLATINUM", "COMPLETED"] as const;

export function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [filter, setFilter] = useState<typeof filters[number]>("ALL");
  const totalHoursLabel = profile ? profile.stats.totalHours.toFixed(1) : "0.0";

  useEffect(() => {
    if (!token) {
      return;
    }

    apiFetch<ProfilePayload>("/profile/me", {}, token).then(setProfile);
  }, [token]);

  const games = !profile
    ? []
    : filter === "ALL"
      ? profile.games
      : profile.games.filter((game) => game.status === filter);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Player profile</p>
          <h1>{profile?.username ?? "Loading..."}</h1>
          <p>{profile?.bio || "No bio set yet. Your next review can do the talking."}</p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <span>Total Hours</span>
            <strong>{totalHoursLabel}h</strong>
          </div>
          <div className="stat-card">
            <span>Total Games</span>
            <strong>{profile?.stats.totalGames ?? 0}</strong>
          </div>
          <div className="stat-card">
            <span>Platinum</span>
            <strong>{profile?.stats.totalPlatinum ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Library</h2>
          <div className="tab-row">
            {filters.map((item) => (
              <button key={item} className={filter === item ? "tab-button active" : "tab-button"} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="library-grid">
          {games.map((game) => (
            <article className="library-card" key={game.id}>
              <img
                src={game.coverUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80"}
                alt={game.name}
              />
              <div>
                <h3>{game.name}</h3>
                <p>
                  {game.platform} - {game.status}
                </p>
                <span>{game.hoursPlayed}h - {game.rating ?? "No rating"}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {profile?.settings?.customLinks.length ? (
        <section className="panel">
          <div className="panel-header">
            <h2>External Links</h2>
          </div>
          <div className="link-list">
            {profile.settings.customLinks.map((link) => (
              <a key={link.url} className="link-chip" href={link.url} target="_blank" rel="noreferrer">
                {link.name}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
