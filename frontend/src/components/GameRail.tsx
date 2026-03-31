import type { HomeCard } from "../types";

export function GameRail({
  title,
  games,
  metric
}: {
  title: string;
  games: HomeCard[];
  metric: "rating" | "hours";
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="game-rail">
        {games.map((game) => (
          <article className="game-card" key={`${title}-${game.name}`}>
            <div className="cover-wrap">
              <img
                src={game.coverUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"}
                alt={game.name}
              />
            </div>
            <div className="game-card-body">
              <h3>{game.name}</h3>
              <p>{metric === "rating" ? `${game.rating ?? "N/A"}/10` : `${game.hoursPlayed}h tracked`}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
