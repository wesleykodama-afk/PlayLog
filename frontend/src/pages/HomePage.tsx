import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import type { AffiliateProduct, HomePayload } from "../types";
import { AffiliateCarousel } from "../components/AffiliateCarousel";
import { GameRail } from "../components/GameRail";

const tabs = [
  { key: "trending", label: "Trending", metric: "hours" as const },
  { key: "mostPlayed", label: "Most Played", metric: "hours" as const },
  { key: "topRated", label: "Top Rated", metric: "rating" as const },
  { key: "lowestRated", label: "Lowest Rated", metric: "rating" as const }
];

export function HomePage() {
  const { token } = useAuth();
  const [payload, setPayload] = useState<HomePayload | null>(null);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("trending");

  useEffect(() => {
    if (!token) {
      return;
    }

    Promise.all([
      apiFetch<HomePayload>("/home", {}, token),
      apiFetch<AffiliateProduct[]>("/affiliate-products")
    ]).then(([home, affiliate]) => {
      setPayload(home);
      setProducts(affiliate);
    });
  }, [token]);

  const active = tabs.find((tab) => tab.key === activeTab)!;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Discovery meets competition</p>
          <h1>Your gaming season at a glance.</h1>
          <p>See who leads your friend group, spot what is rising, and jump straight into your next log.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Friends Leaderboard</h2>
          <span>Top 3 by tracked hours</span>
        </div>
        <div className="podium">
          {(payload?.leaderboard ?? []).map((friend, index) => (
            <article className={`podium-card place-${index + 1}`} key={friend.id}>
              <span className="place-badge">#{index + 1}</span>
              <h3>{friend.username}</h3>
              <strong>{friend.totalHours.toFixed(1)}h</strong>
              <p>{friend.totalGames} games logged</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Game Discovery</h2>
          <div className="tab-row">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={activeTab === tab.key ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {payload && <GameRail title={active.label} games={payload.tabs[active.key]} metric={active.metric} />}
      </section>

      {products.length > 0 && <AffiliateCarousel products={products} />}
    </div>
  );
}
