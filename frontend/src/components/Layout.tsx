import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const items = [
  { to: "/app", label: "Home" },
  { to: "/app/friends", label: "Friends" },
  { to: "/app/add-game", label: "Add Game" },
  { to: "/app/profile", label: "Profile" },
  { to: "/app/settings", label: "Settings" }
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <h1>Playlog</h1>
            <p>Track. Compete. Discover.</p>
          </div>
        </div>

        <nav className="nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.username}</strong>
            <span>{user?.role === "ADMIN" ? "Admin" : "Player"}</span>
          </div>
          <button className="secondary-button" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
