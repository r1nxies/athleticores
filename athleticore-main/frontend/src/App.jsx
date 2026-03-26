import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/dashboard/";
const AUTH_BASE = import.meta.env.VITE_AUTH_URL || "http://localhost:8000/api/auth/";
const LOGIN_URL = `${AUTH_BASE}login/`;
const LOGOUT_URL = `${AUTH_BASE}logout/`;
const REGISTER_URL = `${AUTH_BASE}register/`;

const iconGlyphs = {
  users: "👥",
  check_circle: "✔",
  pending: "⏳",
  block: "⛔",
  trending_up: "📈",
};

const TrendGraph = ({ points }) => {
  const width = 320;
  const height = 180;
  const values = points.map((entry) => entry.average_fitness);
  const maxValue = Math.max(...values, 100);
  const minValue = Math.min(...values, 0);
  const xStep = width / Math.max(points.length - 1, 1);
  const normalized = points.map((entry, index) => {
    const x = index * xStep;
    const y = height - ((entry.average_fitness - minValue) / (maxValue - minValue || 1)) * height;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="trend-graph">
      <polyline
        points={normalized.join(" ")}
        fill="none"
        stroke="#5a9dff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {points.map((entry, index) => {
        const coords = normalized[index].split(",");
        return (
          <circle
            key={entry.month}
            cx={coords[0]}
            cy={coords[1]}
            r="6"
            fill="#5a9dff"
            stroke="#0b1b2f"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

const SportBarChart = ({ totals }) => {
  const max = Math.max(...totals.map((sport) => sport.count), 1);
  return (
    <div className="sport-grid">
      {totals.map((sport) => (
        <div key={sport.sport} className="sport-entry">
          <div
            className="sport-bar"
            style={{
              height: `${(sport.count / max) * 100}%`,
            }}
          />
          <span>{sport.sport}</span>
        </div>
      ))}
    </div>
  );
};

const LoginForm = ({ onSubmit, loading, error }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(credentials);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-field">
        <span>Username</span>
        <input
          name="username"
          value={credentials.username}
          onChange={handleChange}
          placeholder="admin"
          autoComplete="username"
        />
      </label>
      <label className="login-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </label>
      {error && <p className="status error login-error">{error}</p>}
      <button type="submit" className="hero-cta-button" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
};

const RegisterForm = ({ onSubmit, loading, error, message }) => {
  const [values, setValues] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (message) {
      setValues({ username: "", email: "", password: "", confirmPassword: "" });
    }
  }, [message]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (values.password !== values.confirmPassword) {
      setLocalError("Passwords must match");
      return;
    }
    setLocalError("");
    onSubmit({ username: values.username, email: values.email, password: values.password });
  };

  return (
    <form className="login-form register-form" onSubmit={handleSubmit}>
      <label className="login-field">
        <span>Username</span>
        <input
          name="username"
          value={values.username}
          onChange={handleChange}
          placeholder="newuser"
          autoComplete="username"
        />
      </label>
      <label className="login-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          placeholder="athlete@team.com"
          autoComplete="email"
        />
      </label>
      <label className="login-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </label>
      <label className="login-field">
        <span>Confirm</span>
        <input
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </label>
      {(localError || error) && <p className="status error register-error">{localError || error}</p>}
      {message && <p className="status success register-success">{message}</p>}
      <button type="submit" className="hero-cta-button" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AthleteRow = ({ athlete }) => (
  <article className="athlete-row">
    <div className="athlete-profile">
      <div className="avatar" aria-hidden>
        {getInitials(athlete.name)}
      </div>
      <div>
        <strong>{athlete.name}</strong>
        <p>
          {athlete.sport} • {athlete.class}
        </p>
      </div>
    </div>
    <div className="athlete-meta">
      <div>
        <span className="fitness-label">Fitness Score</span>
        <p className="fitness-score">{athlete.fitness_score}</p>
      </div>
      <span
        className="status-chip"
        style={{ background: athlete.status.color + "22", color: athlete.status.color }}
      >
        {athlete.status.label}
      </span>
    </div>
  </article>
);

const OverviewCard = ({ tile }) => (
  <article className="metric-card">
    <div className="metric-header">
      <span className="metric-icon" aria-hidden>
        {iconGlyphs[tile.icon] ?? "•"}
      </span>
      <p className="metric-label">{tile.label}</p>
    </div>
    <div className="metric-value">{tile.value}</div>
  </article>
);

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const overviewTiles = useMemo(() => data?.overview ?? [], [data]);

  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    fetch(API_URL, { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }
        return response.json();
      })
      .then((payload) => {
        setData(payload);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleLogin = (credentials) => {
    setAuthLoading(true);
    setLoginError("");
    setAuthMessage("");

    fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.detail || "Invalid credentials");
        }
        return payload;
      })
      .then(() => {
        setIsAuthenticated(true);
        setAuthMessage("Welcome back!");
      })
      .catch((err) => {
        setLoginError(err.message);
      })
      .finally(() => setAuthLoading(false));
  };

  const handleRegister = (credentials) => {
    setRegisterLoading(true);
    setRegisterError("");
    setRegisterMessage("");

    fetch(REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.detail || "Unable to create account");
        }
        return payload;
      })
      .then(() => {
        setRegisterMessage("Account created. Sign in to continue.");
      })
      .catch((err) => {
        setRegisterError(err.message);
      })
      .finally(() => setRegisterLoading(false));
  };

  const handleLogout = () => {
    fetch(LOGOUT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).finally(() => {
      setIsAuthenticated(false);
      setAuthMessage("You are signed out.");
      setData(null);
      setError("");
      setLoading(false);
    });
  };

  const navLinks = ["Dashboard", "Athletes", "Assessments"];

  return (
    <div className="app-shell">
      <div className="app-layer">
        <header className="top-nav">
          <div className="brand">
            <span className="brand-icon">⚡</span>
            <div>
              <p className="brand-title">AthletiCore</p>
              <span className="brand-subtitle">Performance & Medical Clearance Portal</span>
            </div>
          </div>
          <nav className="nav-links">
            {navLinks.map((link) => (
              <button key={link} className={link === "Dashboard" ? "nav-pill active" : "nav-pill"}>
                {link}
              </button>
            ))}
          </nav>
        </header>

        {!isAuthenticated ? (
          <section className="login-screen">
            <div className="login-grid">
              <div className="login-panel">
                <p className="tagline">Dashboard Access</p>
                <h1>Sign in to continue</h1>
                <p className="subhead">Use your AthletiCore credentials to unlock the live analytics experience.</p>
                <LoginForm onSubmit={handleLogin} loading={authLoading} error={loginError} />
                <p className="login-note">
                  You can also create a staff user directly from this page. Newly created accounts can be granted access
                  once the backend migrations and superuser setup are complete.
                </p>
              </div>
              <div className="register-panel">
                <p className="tagline">New to AthletiCore?</p>
                <h1>Create portal access</h1>
                <p className="subhead">Register a teammate or self to begin monitoring athletes with authenticated sessions.</p>
                <RegisterForm
                  onSubmit={handleRegister}
                  loading={registerLoading}
                  error={registerError}
                  message={registerMessage}
                />
                <p className="register-note">
                  After the backend accepts the account, sign in with the same credentials to unlock the dashboard.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <main>
            <section className="hero">
              <div>
                <p className="tagline">Dashboard Overview</p>
                <h1>Monitor athlete performance and clearance status</h1>
                <p className="subhead">Live insights into athletes, health clearance, and training trends.</p>
              </div>
              <div className="hero-cta">
                <label className="pill">Updated {data?.generated ?? "—"}</label>
                <div className="hero-actions">
                  <button className="hero-cta-button">View data</button>
                  <button className="ghost-link" type="button" onClick={handleLogout}>
                    Log out →
                  </button>
                </div>
              </div>
            </section>

            {authMessage && <p className="status success">{authMessage}</p>}
            {loading && <p className="status">Loading dashboard...</p>}
            {error && <p className="status error">{error}</p>}

            {data && (
              <section>
                <div className="overview-grid">
                  {overviewTiles.map((tile) => (
                    <OverviewCard key={tile.label} tile={tile} />
                  ))}
                </div>

                <div className="panels">
                  <div className="panel">
                    <div className="panel-header">
                      <h2>Performance Trends</h2>
                      <span className="panel-meta">2026 season</span>
                    </div>
                    <div className="panel-body">
                      <TrendGraph points={data.trend_graph} />
                      <div className="chart-legend">
                        {data.trend_graph.map((point) => (
                          <span key={point.month}>{point.month}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-header">
                      <h2>Athletes by Sport</h2>
                    </div>
                    <div className="panel-body sport-panel">
                      <SportBarChart totals={data.sport_totals} />
                    </div>
                  </div>
                </div>

                <div className="panel athlete-list">
                  <div className="panel-header">
                    <h2>Athlete Status Overview</h2>
                    <button className="ghost-link">View all →</button>
                  </div>
                  <div className="panel-body">
                    {data.athletes.map((athlete) => (
                      <AthleteRow key={athlete.name} athlete={athlete} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
