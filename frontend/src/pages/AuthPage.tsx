import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function AuthPage() {
  const { token, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/app" replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <p className="eyebrow">Competitive game tracking</p>
        <h1>Keep your backlog moving and your crew chasing your hours.</h1>
        <p>
          Playlog blends discovery, tracking, social activity, Steam sync, and affiliate-ready storefront links into
          one console-inspired dashboard.
        </p>
      </div>

      <form className="auth-card" onSubmit={onSubmit}>
        <div className="toggle-row">
          <button type="button" className={mode === "login" ? "tab-button active" : "tab-button"} onClick={() => setMode("login")}>
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "tab-button active" : "tab-button"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "register" && (
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="NightRacer" />
          </label>
        )}

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Enter Playlog" : "Create account"}
        </button>
      </form>
    </div>
  );
}
