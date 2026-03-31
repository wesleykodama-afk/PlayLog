import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import type { RawgSuggestion } from "../types";

const platforms = ["STEAM", "EPIC", "GOG", "PLAYSTATION", "NINTENDO"] as const;
const statuses = ["PLAYING", "COMPLETED", "PLATINUM", "DROPPED"] as const;

export function AddGamePage() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<typeof platforms[number]>("STEAM");
  const [status, setStatus] = useState<typeof statuses[number]>("PLAYING");
  const [hoursPlayed, setHoursPlayed] = useState("0");
  const [rating, setRating] = useState("8");
  const [review, setReview] = useState("");
  const [playedDate, setPlayedDate] = useState("");
  const [suggestions, setSuggestions] = useState<RawgSuggestion[]>([]);
  const [selectedGame, setSelectedGame] = useState<RawgSuggestion | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || name.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const data = await apiFetch<RawgSuggestion[]>(
          `/games/discover/search?query=${encodeURIComponent(name)}`,
          {},
          token
        );
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [name, token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    try {
      setError("");
      await apiFetch(
        "/games",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            platform,
            status,
            hoursPlayed: Number(hoursPlayed),
            rating: rating ? Number(rating) : null,
            review,
            playedDate,
            source: selectedGame ? "rawg" : "manual",
            externalId: selectedGame?.id ?? null,
            coverUrl: selectedGame?.coverUrl ?? null,
            releaseDate: selectedGame?.releaseDate ?? null,
            genre: selectedGame?.genre ?? null
          })
        },
        token
      );

      setMessage("Game added to your library.");
      setName("");
      setSelectedGame(null);
      setReview("");
      setPlayedDate("");
      setSuggestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save game.");
    }
  };

  return (
    <div className="page-grid single-column">
      <section className="panel">
        <div className="panel-header">
          <h2>Add Game</h2>
          <span>RAWG-powered autocomplete</span>
        </div>
        <form className="stack-form" onSubmit={submit}>
          <label className="autocomplete">
            Game name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Search titles..." />
            {suggestions.length > 0 && (
              <div className="suggestion-list">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="suggestion-item"
                    onClick={() => {
                      setSelectedGame(suggestion);
                      setName(suggestion.name);
                      setSuggestions([]);
                    }}
                  >
                    <span>{suggestion.name}</span>
                    <small>{suggestion.genre || "Genre pending"}</small>
                  </button>
                ))}
              </div>
            )}
          </label>

          {selectedGame && (
            <div className="selection-card">
              <img src={selectedGame.coverUrl} alt={selectedGame.name} />
              <div>
                <strong>{selectedGame.name}</strong>
                <p>{selectedGame.genre || "Genre unavailable"}</p>
                <span>Released: {selectedGame.releaseDate || "TBA"}</span>
              </div>
            </div>
          )}

          <div className="form-grid">
            <label>
              Platform
              <select value={platform} onChange={(event) => setPlatform(event.target.value as typeof platform)}>
                {platforms.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Hours played
              <input type="number" min="0" value={hoursPlayed} onChange={(event) => setHoursPlayed(event.target.value)} />
            </label>

            <label>
              Rating
              <input type="number" min="1" max="10" value={rating} onChange={(event) => setRating(event.target.value)} />
            </label>
          </div>

          <label>
            Played date
            <input type="date" value={playedDate} onChange={(event) => setPlayedDate(event.target.value)} />
          </label>

          <label>
            Review
            <textarea value={review} onChange={(event) => setReview(event.target.value)} rows={6} />
          </label>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button className="primary-button" type="submit">
            Save log
          </button>
        </form>
      </section>
    </div>
  );
}
