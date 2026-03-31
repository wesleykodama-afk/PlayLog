import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import type { Activity, LeaderboardEntry } from "../types";

type FriendCard = LeaderboardEntry & {
  bio?: string | null;
};

export function FriendsPage() {
  const { token } = useAuth();
  const [friends, setFriends] = useState<FriendCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    if (!token) {
      return;
    }

    const [friendData, activityData] = await Promise.all([
      apiFetch<FriendCard[]>("/friends", {}, token),
      apiFetch<Activity[]>("/activity", {}, token)
    ]);

    setFriends(friendData);
    setActivities(activityData);
  };

  useEffect(() => {
    load();
  }, [token]);

  const addFriend = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    try {
      setError("");
      await apiFetch("/friends", {
        method: "POST",
        body: JSON.stringify({ username })
      }, token);
      setUsername("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add friend.");
    }
  };

  const toggleLike = async (activity: Activity) => {
    if (!token) {
      return;
    }

    await apiFetch(
      `/activity/${activity.id}/like`,
      { method: activity.likedByMe ? "DELETE" : "POST" },
      token
    );
    await load();
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-header">
          <h2>Add Friend</h2>
        </div>
        <form className="stack-form" onSubmit={addFriend}>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Search by username" />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" type="submit">
            Add to leaderboard
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Your Friends</h2>
        </div>
        <div className="card-list">
          {friends.map((friend) => (
            <article className="friend-card" key={friend.id}>
              <div>
                <h3>{friend.username}</h3>
                <p>{friend.bio || "No bio yet."}</p>
              </div>
              <strong>{friend.totalHours.toFixed(1)}h</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel span-2">
        <div className="panel-header">
          <h2>Activity Feed</h2>
        </div>
        <div className="activity-feed">
          {activities.map((activity) => (
            <article className="activity-card" key={activity.id}>
              <div>
                <p>
                  <strong>{activity.user.username}</strong> {activity.type.replaceAll("_", " ").toLowerCase()}
                  {activity.gameName ? ` ${activity.gameName}` : ""}
                </p>
                <span>{new Date(activity.createdAt).toLocaleString()}</span>
              </div>
              <button className="secondary-button" onClick={() => toggleLike(activity)}>
                {activity.likedByMe ? "Unlike" : "Like"} ({activity.likeCount})
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
