import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/dashboard/";
const AUTH_BASE = import.meta.env.VITE_AUTH_URL || "http://localhost:8000/api/auth/";
const LOGIN_URL = `${AUTH_BASE}login/`;
const LOGOUT_URL = `${AUTH_BASE}logout/`;
const REGISTER_URL = `${AUTH_BASE}register/`;
const SESSION_URL = `${AUTH_BASE}session/`;
const CREATE_ATHLETE_URL = import.meta.env.VITE_ADMIN_ATHLETE_URL || "http://localhost:8000/api/admin/athletes/";

const iconGlyphs = {
  users: "👥",
  check_circle: "✔",
  pending: "⏳",
  block: "⛔",
  trending_up: "📈",
};

const PERFORMANCE_METRICS = [
  { key: "strength", label: "Strength" },
  { key: "endurance", label: "Endurance" },
  { key: "agility", label: "Agility" },
  { key: "speed", label: "Speed" },
  { key: "flexibility", label: "Flexibility" },
];

const DEFAULT_METRICS = PERFORMANCE_METRICS.reduce((acc, metric) => {
  acc[metric.key] = 50;
  return acc;
}, {});

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

const AthleteCard = ({ athlete }) => (
  <article className="athlete-card">
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
    <div className="athlete-card-grid">
      <span>Fitness Score</span>
      <strong>{athlete.fitness_score}</strong>
      <span>Medical Status</span>
      <span
        className="status-chip"
        style={{ background: athlete.status.color + "22", color: athlete.status.color }}
      >
        {athlete.status.label}
      </span>
      <span>Coach</span>
      <strong>{athlete.coach || "Unassigned"}</strong>
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
  const [activeView, setActiveView] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sessionResolved, setSessionResolved] = useState(false);
  const [selectedAthleteName, setSelectedAthleteName] = useState("");
  const [medicalClearance, setMedicalClearance] = useState("Cleared");
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [createError, setCreateError] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [athleteForm, setAthleteForm] = useState({
    name: "",
    sport: "",
    class_level: "",
    fitness_score: "",
    status: "Cleared",
    coach_name: "",
    coach_email: "",
    coach_experience: "",
  });

  const overviewTiles = useMemo(() => data?.overview ?? [], [data]);
  const sportOptions = useMemo(() => {
    const sports = [...new Set((data?.athletes ?? []).map((athlete) => athlete.sport))];
    return sports.sort();
  }, [data]);
  const statusOptions = useMemo(() => {
    const statuses = [...new Set((data?.athletes ?? []).map((athlete) => athlete.status.label))];
    return statuses.sort();
  }, [data]);
  const filteredAthletes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return (data?.athletes ?? []).filter((athlete) => {
      const nameMatch = !term || athlete.name.toLowerCase().includes(term);
      const sportMatch = sportFilter === "all" || athlete.sport === sportFilter;
      const statusMatch = statusFilter === "all" || athlete.status.label === statusFilter;
      return nameMatch && sportMatch && statusMatch;
    });
  }, [data, searchTerm, sportFilter, statusFilter]);
  const selectedAthlete = useMemo(
    () => (data?.athletes ?? []).find((athlete) => athlete.name === selectedAthleteName) ?? null,
    [data, selectedAthleteName]
  );
  const averageMetricScore = useMemo(() => {
    const values = Object.values(metrics);
    return Math.round(values.reduce((sum, value) => sum + Number(value), 0) / values.length);
  }, [metrics]);

  const buildAssessmentResult = (score, clearanceStatus) => {
    if (clearanceStatus !== "Cleared") {
      return {
        level: "Not Eligible",
        reason: "Medical clearance required before competition",
        color: "#ef5c78",
      };
    }

    if (score >= 85) {
      return {
        level: "Elite",
        reason: "Excellent performance profile and medical clearance",
        color: "#10c981",
      };
    }
    if (score >= 70) {
      return {
        level: "Advanced",
        reason: "Strong readiness with room to optimize",
        color: "#4f8dff",
      };
    }
    if (score >= 60) {
      return {
        level: "Intermediate",
        reason: "Meets baseline requirements for progression",
        color: "#f2c94c",
      };
    }

    return {
      level: "Not Eligible",
      reason: "Below minimum performance benchmark",
      color: "#ef5c78",
    };
  };

  useEffect(() => {
    if (!data?.athletes?.length) {
      return;
    }
    if (!selectedAthleteName) {
      setSelectedAthleteName(data.athletes[0].name);
      setMedicalClearance(data.athletes[0].status.label);
    }
  }, [data, selectedAthleteName]);

  useEffect(() => {
    if (!selectedAthlete) {
      return;
    }
    setMedicalClearance(selectedAthlete.status.label);
  }, [selectedAthlete]);

  useEffect(() => {
    fetch(SESSION_URL, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to verify session");
        }
        return response.json();
      })
      .then((payload) => {
        setIsAuthenticated(Boolean(payload.authenticated));
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => setSessionResolved(true));
  }, []);

  const loadDashboardData = useCallback(() => {
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
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, loadDashboardData]);

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
        setActiveView("Dashboard");
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
      setActiveView("Dashboard");
      setAuthMessage("You are signed out.");
      setData(null);
      setError("");
      setLoading(false);
    });
  };

  const handleGenerateAssessment = () => {
    if (!selectedAthlete) {
      return;
    }

    const result = buildAssessmentResult(averageMetricScore, medicalClearance);
    setAssessmentResult({
      athlete: selectedAthlete,
      score: averageMetricScore,
      clearance: medicalClearance,
      generatedAt: new Date().toLocaleString(),
      ...result,
    });
  };

  const handleAthleteFormChange = (event) => {
    const { name, value } = event.target;
    setAthleteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAthlete = (event) => {
    event.preventDefault();
    setCreateError("");
    setCreateMessage("");
    setCreateLoading(true);

    fetch(CREATE_ATHLETE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...athleteForm,
        fitness_score: Number(athleteForm.fitness_score),
        coach_experience: athleteForm.coach_experience ? Number(athleteForm.coach_experience) : 0,
      }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.detail || "Failed to add athlete");
        }
        return payload;
      })
      .then(() => {
        setCreateMessage("Data added to system successfully.");
        setAthleteForm({
          name: "",
          sport: "",
          class_level: "",
          fitness_score: "",
          status: "Cleared",
          coach_name: "",
          coach_email: "",
          coach_experience: "",
        });
        loadDashboardData();
      })
      .catch((err) => {
        setCreateError(err.message);
      })
      .finally(() => setCreateLoading(false));
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
              <button
                key={link}
                type="button"
                className={link === activeView ? "nav-pill active" : "nav-pill"}
                onClick={() => setActiveView(link)}
              >
                {link}
              </button>
            ))}
          </nav>
        </header>

        {!sessionResolved ? (
          <section className="login-screen">
            <p className="status">Checking session...</p>
          </section>
        ) : !isAuthenticated ? (
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
                <p className="tagline">
                  {activeView === "Dashboard" && "Dashboard Overview"}
                  {activeView === "Athletes" && "Athletes"}
                  {activeView === "Assessments" && "Assessments"}
                </p>
                <h1>
                  {activeView === "Dashboard" && "Monitor athlete performance and clearance status"}
                  {activeView === "Athletes" && "Manage and monitor student-athlete profiles"}
                  {activeView === "Assessments" && "Performance Assessment"}
                </h1>
                <p className="subhead">
                  {activeView === "Dashboard" && "Live insights into athletes, health clearance, and training trends."}
                  {activeView === "Athletes" && "Use search and filters to quickly find athletes by sport and medical status."}
                  {activeView === "Assessments" && "Evaluate athlete fitness and determine competition eligibility."}
                </p>
              </div>
              <div className="hero-cta">
                <label className="pill">Updated {data?.generated ?? "—"}</label>
                <div className="hero-actions">
                  <button
                    className="hero-cta-button"
                    type="button"
                    onClick={() => setActiveView("Dashboard")}
                  >
                    View data
                  </button>
                  <button className="ghost-link" type="button" onClick={handleLogout}>
                    Log out →
                  </button>
                </div>
              </div>
            </section>

            {authMessage && <p className="status success">{authMessage}</p>}
            {loading && <p className="status">Loading dashboard...</p>}
            {error && <p className="status error">{error}</p>}

            {data && activeView === "Dashboard" && (
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
                    <button className="ghost-link" type="button" onClick={() => setActiveView("Athletes")}>
                      View all →
                    </button>
                  </div>
                  <div className="panel-body">
                    {data.athletes.map((athlete) => (
                      <AthleteRow key={athlete.name} athlete={athlete} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {data && activeView === "Athletes" && (
              <section className="athletes-page">
                <form className="panel athlete-add-panel" onSubmit={handleCreateAthlete}>
                  <div className="panel-header">
                    <h2>Add Data To System</h2>
                  </div>
                  <div className="athlete-add-grid">
                    <input
                      className="athlete-search"
                      name="name"
                      value={athleteForm.name}
                      onChange={handleAthleteFormChange}
                      placeholder="Athlete Name"
                      required
                    />
                    <input
                      className="athlete-search"
                      name="sport"
                      value={athleteForm.sport}
                      onChange={handleAthleteFormChange}
                      placeholder="Sport"
                      required
                    />
                    <input
                      className="athlete-search"
                      name="class_level"
                      value={athleteForm.class_level}
                      onChange={handleAthleteFormChange}
                      placeholder="Class Level"
                      required
                    />
                    <input
                      className="athlete-search"
                      type="number"
                      min="0"
                      max="100"
                      name="fitness_score"
                      value={athleteForm.fitness_score}
                      onChange={handleAthleteFormChange}
                      placeholder="Fitness Score (0-100)"
                      required
                    />
                    <select
                      className="athlete-select"
                      name="status"
                      value={athleteForm.status}
                      onChange={handleAthleteFormChange}
                    >
                      <option value="Cleared">Cleared</option>
                      <option value="Pending">Pending</option>
                      <option value="Restricted">Restricted</option>
                    </select>
                    <input
                      className="athlete-search"
                      name="coach_name"
                      value={athleteForm.coach_name}
                      onChange={handleAthleteFormChange}
                      placeholder="Coach Name (optional)"
                    />
                    <input
                      className="athlete-search"
                      type="email"
                      name="coach_email"
                      value={athleteForm.coach_email}
                      onChange={handleAthleteFormChange}
                      placeholder="Coach Email (optional)"
                    />
                    <input
                      className="athlete-search"
                      type="number"
                      min="0"
                      max="60"
                      name="coach_experience"
                      value={athleteForm.coach_experience}
                      onChange={handleAthleteFormChange}
                      placeholder="Coach Experience (years)"
                    />
                  </div>
                  <div className="athlete-add-actions">
                    <button className="hero-cta-button" type="submit" disabled={createLoading}>
                      {createLoading ? "Saving..." : "Add Data"}
                    </button>
                    {createMessage && <span className="status success form-status-inline">{createMessage}</span>}
                    {createError && <span className="status error form-status-inline">{createError}</span>}
                  </div>
                </form>

                <div className="athlete-controls panel">
                  <input
                    type="text"
                    className="athlete-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search athletes..."
                  />
                  <select
                    className="athlete-select"
                    value={sportFilter}
                    onChange={(event) => setSportFilter(event.target.value)}
                  >
                    <option value="all">All Sports</option>
                    {sportOptions.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                  <select
                    className="athlete-select"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="athletes-summary">
                  <span className="pill">Showing {filteredAthletes.length} athletes</span>
                  <button
                    type="button"
                    className="ghost-link"
                    onClick={() => {
                      setSearchTerm("");
                      setSportFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Reset filters
                  </button>
                </div>

                <div className="athlete-card-grid-layout">
                  {filteredAthletes.map((athlete) => (
                    <AthleteCard key={athlete.name} athlete={athlete} />
                  ))}
                </div>
              </section>
            )}

            {activeView === "Assessments" && (
              <section className="assessments-page">
                <div className="panel assessment-form-panel">
                  <div className="panel-header">
                    <h2>New Assessment</h2>
                  </div>
                  <div className="panel-body">
                    <label className="assessment-label" htmlFor="assessment-athlete">Select Athlete</label>
                    <select
                      id="assessment-athlete"
                      className="assessment-select"
                      value={selectedAthleteName}
                      onChange={(event) => setSelectedAthleteName(event.target.value)}
                    >
                      <option value="">Choose an athlete...</option>
                      {(data?.athletes ?? []).map((athlete) => (
                        <option key={athlete.name} value={athlete.name}>
                          {athlete.name}
                        </option>
                      ))}
                    </select>

                    <label className="assessment-label" htmlFor="assessment-clearance">Medical Clearance Status</label>
                    <select
                      id="assessment-clearance"
                      className="assessment-select"
                      value={medicalClearance}
                      onChange={(event) => setMedicalClearance(event.target.value)}
                    >
                      <option value="Cleared">Cleared</option>
                      <option value="Pending">Pending</option>
                      <option value="Restricted">Restricted</option>
                    </select>

                    <div className="assessment-divider" />
                    <h3 className="assessment-section-title">Performance Metrics</h3>

                    <div className="assessment-metrics">
                      {PERFORMANCE_METRICS.map((metric) => (
                        <label key={metric.key} className="metric-slider-row">
                          <div className="metric-slider-top">
                            <span>{metric.label}</span>
                            <strong>{metrics[metric.key]}/100</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={metrics[metric.key]}
                            onChange={(event) =>
                              setMetrics((prev) => ({
                                ...prev,
                                [metric.key]: Number(event.target.value),
                              }))
                            }
                          />
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="hero-cta-button assessment-generate-button"
                      onClick={handleGenerateAssessment}
                      disabled={!selectedAthlete}
                    >
                      Generate Assessment Report
                    </button>
                  </div>
                </div>

                <div className="assessments-side">
                  <div className="panel assessment-results-panel">
                    <div className="panel-header">
                      <h2>Assessment Results</h2>
                    </div>
                    <div className="panel-body">
                      {assessmentResult ? (
                        <div className="assessment-result-card">
                          <p className="assessment-athlete-name">{assessmentResult.athlete.name}</p>
                          <p className="assessment-summary-line">Sport: {assessmentResult.athlete.sport}</p>
                          <p className="assessment-summary-line">Average Score: {assessmentResult.score}/100</p>
                          <p className="assessment-summary-line">Clearance: {assessmentResult.clearance}</p>
                          <p className="assessment-summary-line">Generated: {assessmentResult.generatedAt}</p>
                          <p className="assessment-grade" style={{ color: assessmentResult.color }}>
                            {assessmentResult.level}
                          </p>
                          <p className="assessment-reason">{assessmentResult.reason}</p>
                        </div>
                      ) : (
                        <div className="assessment-empty">Complete the assessment form to view results</div>
                      )}
                    </div>
                  </div>

                  <div className="panel assessment-criteria-panel">
                    <div className="panel-header">
                      <h2>Eligibility Criteria</h2>
                    </div>
                    <div className="panel-body assessment-criteria-list">
                      <article className="criteria-card criteria-elite">
                        <strong>Elite (85-100)</strong>
                        <span>Medical clearance + high performance scores</span>
                      </article>
                      <article className="criteria-card criteria-advanced">
                        <strong>Advanced (70-84)</strong>
                        <span>Medical clearance + strong performance</span>
                      </article>
                      <article className="criteria-card criteria-intermediate">
                        <strong>Intermediate (60-69)</strong>
                        <span>Medical clearance + minimum fitness requirements</span>
                      </article>
                      <article className="criteria-card criteria-not-eligible">
                        <strong>Not Eligible</strong>
                        <span>Missing medical clearance or below minimum fitness</span>
                      </article>
                    </div>
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
