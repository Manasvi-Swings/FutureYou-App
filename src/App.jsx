import { useEffect, useId, useRef, useState } from "react";
import {
  Home, Check, Plus, Trash2, Target,
  ArrowRight, Sparkles, SlidersHorizontal, Mail,
  CalendarDays, TrendingUp, ChevronRight, Sun, Moon
} from "lucide-react";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip
} from "recharts";
import "./App.css";

const THEME_KEY = "fy-theme";
const CHART_COLORS = {
  study: "#2c5877",
  sleep: "#5a7d6a",
  exercise: "#c4a35a",
  screen: "#8b6b7a",
  rest: "#6b8f9e",
  focus: "#2c5877"
};

const initialHabits = [
  { id: 1, name: "Study for 2 hours", category: "Learning", done: false },
  { id: 2, name: "Sleep before 11 PM", category: "Wellness", done: false },
  { id: 3, name: "Move your body", category: "Health", done: false },
  { id: 4, name: "Limit screen time", category: "Focus", done: false },
];

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function generateDailyNote(habits, goals, dateKey) {
  const completedHabits = habits.filter(h => h.done);
  const activeGoal = goals.find(g => !g.completed);
  const completedGoal = goals.find(g => g.completed);

  const updates = goals.flatMap(g =>
    (g.updates || []).map(update => ({
      ...update,
      goalTitle: g.title
    }))
  );

  const latestUpdate = updates.sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
  )[0];

  const messages = [];

  if (completedHabits.length) {
    messages.push(
      `You followed through on ${completedHabits.length} ${completedHabits.length === 1 ? "habit" : "habits"} today. Small promises count.`
    );
  }

  if (activeGoal) {
    messages.push(
      activeGoal.nextStep
        ? `Your goal, ${activeGoal.title}, is still in progress. Your next step is ${activeGoal.nextStep}.`
        : `You're still making room for ${activeGoal.title}. Choose one small action to move it forward.`
    );
  }

  if (latestUpdate) {
    messages.push(
      `You recently made progress on ${latestUpdate.goalTitle}: "${latestUpdate.text}". Take a moment to recognise that.`
    );
  }

  if (completedGoal) {
    messages.push(
      `You completed ${completedGoal.title}. Pause and give yourself credit before moving to the next thing.`
    );
  }

  if (!messages.length) {
    return "You don't need a perfect plan today. Start with one small promise to yourself and build from there.";
  }

  const dayNumber = Number(dateKey.replace(/-/g, ""));
  return messages[dayNumber % messages.length];
}

function generateFutureLetter(habits, goals, version = 0) {
  const completedHabits = habits.filter(h => h.done);
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  const updates = goals.flatMap(g =>
    (g.updates || []).map(update => ({
      ...update,
      goalTitle: g.title
    }))
  ).sort((a, b) =>
    String(a.date || "").localeCompare(String(b.date || ""))
  );

  const activeGoal = activeGoals.length
    ? activeGoals[version % activeGoals.length]
    : null;

  const completedGoal = completedGoals.length
    ? completedGoals[version % completedGoals.length]
    : null;

  const latestUpdate = updates.length
    ? updates[updates.length - 1]
    : null;

  const openings = [
    "I hope you're taking a moment to appreciate how far we've come.",
    "I'm writing this while we're still learning, growing and figuring things out.",
    "I wish you could see how much the small choices we're making today matter."
  ];

  const closings = [
    "Please keep choosing a life that feels like ours.",
    "Keep going, but don't forget to enjoy the life we're building.",
    "We don't need to be perfect. We just need to keep moving with purpose."
  ];

  const habitParagraph = completedHabits.length
    ? `Today, we followed through on ${completedHabits.map(h => h.name).join(", ")}. I hope these routines continue to support the person we're becoming.`
    : "I hope we've become a little more consistent with the habits that help us feel well. And when we miss a day, I hope we keep beginning again.";

  const goalParagraph = activeGoal
    ? `I remember how much ${activeGoal.title} mattered to us. We were working towards it one step at a time${activeGoal.nextStep ? `, starting with ${activeGoal.nextStep}` : ""}. I hope we kept giving that goal a chance.`
    : goals.length
      ? "We've been working through the goals we set for ourselves. I hope we celebrated the progress and kept finding things that matter."
      : "I hope we've found goals that genuinely matter to us, not just things we felt pressured to achieve.";

  const progressParagraph = latestUpdate
    ? `I still remember this progress update: "${latestUpdate.text}" about ${latestUpdate.goalTitle}. I hope we never forget that meaningful progress often begins with ordinary actions.`
    : "I hope we remember that progress isn't always easy to measure. Sometimes simply trying again is an achievement.";

  const achievementParagraph = completedGoal
    ? `I'm especially proud that we completed ${completedGoal.title}. I hope we celebrated that moment instead of immediately rushing towards the next thing.`
    : "";

  return [
    openings[version % openings.length],
    habitParagraph,
    goalParagraph,
    progressParagraph,
    achievementParagraph,
    closings[version % closings.length]
  ].filter(Boolean);
}

function ProgressBar({ value, label }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

/** shadcn ChartTooltipContent-style overlay */
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="chart-overlay" role="tooltip">
      <p className="chart-overlay-title">{point.label}</p>
      <div className="chart-overlay-rows">
        <div className="chart-overlay-row">
          <span className="chart-swatch" style={{ background: point.fill }} aria-hidden="true" />
          <span>{point.name}</span>
          <strong>{point.display}</strong>
        </div>
      </div>
      {point.detail ? <p className="chart-overlay-note">{point.detail}</p> : null}
    </div>
  );
}

function ActiveDonut({
  data,
  dataKey = "value",
  activeIndex,
  onActiveChange,
  centerLabel,
  centerValue,
  ariaLabel
}) {
  return (
    <div className="chart-wrap chart-wrap--donut" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip cursor={false} content={<DonutTooltip />} wrapperStyle={{ outline: "none", zIndex: 20 }} />
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey="name"
            innerRadius="58%"
            outerRadius="82%"
            strokeWidth={4}
            stroke="var(--p-panel)"
            onMouseEnter={(_, index) => onActiveChange?.(index)}
            shape={(props) => {
              const { index, outerRadius = 0, ...rest } = props;
              const isActive = index === activeIndex;
              return (
                <Sector
                  {...rest}
                  outerRadius={isActive ? outerRadius + 10 : outerRadius}
                />
              );
            }}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                const { cx, cy } = viewBox;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={cx}
                      y={(cy || 0) - 8}
                      className="donut-center-value"
                    >
                      {centerValue}
                    </tspan>
                    <tspan
                      x={cx}
                      y={(cy || 0) + 14}
                      className="donut-center-label"
                    >
                      {centerLabel}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function readTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "day" || saved === "night") return saved;
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "night";
  }
  return "day";
}

function App() {
  const [page, setPage] = useState("Today");
  const [letterVersion, setLetterVersion] = useState(0);
  const [theme, setTheme] = useState(readTheme);
  const [activeRoutineIndex, setActiveRoutineIndex] = useState(0);
  const [activeBalanceIndex, setActiveBalanceIndex] = useState(0);
  const pageHeadingRef = useRef(null);
  const formIds = useId();

  const [habits, setHabits] = useState(() => {
    const savedHabits = readStorage("fy-habits", initialHabits);
    return Array.isArray(savedHabits) ? savedHabits : initialHabits;
  });

  const [goals, setGoals] = useState(() => {
    const savedGoals = readStorage("fy-goals", []);
    return Array.isArray(savedGoals) ? savedGoals : [];
  });

  const [newHabit, setNewHabit] = useState("");
  const [habitCategory, setHabitCategory] = useState("Personal");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState("Short-term");
  const [goalNext, setGoalNext] = useState("");
  const [goalToday, setGoalToday] = useState("");
  const [updates, setUpdates] = useState({});

  const [scenario, setScenario] = useState({
    study: 2, sleep: 8, exercise: 3, screen: 4
  });

  useEffect(() => {
    localStorage.setItem("fy-habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("fy-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pageHeadingRef.current) {
      pageHeadingRef.current.focus();
    }
  }, [page]);

  const dateKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const note = generateDailyNote(habits, goals, dateKey);
  const futureLetter = generateFutureLetter(habits, goals, letterVersion);
  const shortLetter = futureLetter.slice(0, 2);

  const completed = habits.filter(h => h.done).length;

  const habitProgress = habits.length
    ? Math.round(completed / habits.length * 100)
    : 0;

  const completedGoals = goals.filter(g => g.completed).length;

  const goalProgress = goals.length
    ? Math.round(completedGoals / goals.length * 100)
    : 0;

  function goToPage(nextPage) {
    setPage(nextPage);
  }

  function addHabit(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;

    setHabits([...habits, {
      id: Date.now(),
      name: newHabit.trim(),
      category: habitCategory,
      done: false,
      custom: true
    }]);

    setNewHabit("");
  }

  function toggleHabit(id) {
    setHabits(current =>
      current.map(h => h.id === id ? { ...h, done: !h.done } : h)
    );
  }

  function deleteHabit(id) {
    setHabits(current => current.filter(h => h.id !== id));
  }

  function addGoal(e) {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setGoals(current => [...current, {
      id: Date.now(),
      title: goalTitle.trim(),
      type: goalType,
      nextStep: goalNext.trim(),
      todayAction: goalToday.trim(),
      updates: [],
      completed: false
    }]);

    setGoalTitle("");
    setGoalNext("");
    setGoalToday("");
  }

  function addGoalUpdate(id) {
    const update = (updates[id] || "").trim();
    if (!update) return;

    setGoals(current => current.map(g =>
      g.id === id
        ? { ...g, updates: [...(g.updates || []), { text: update, date: dateKey }] }
        : g
    ));

    setUpdates(current => ({ ...current, [id]: "" }));
  }

  function toggleGoal(id) {
    setGoals(current => current.map(g =>
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  }

  function deleteGoal(id) {
    setGoals(current => current.filter(g => g.id !== id));
  }

  function changeScenario(key, value) {
    setScenario(current => ({ ...current, [key]: Number(value) }));
  }

  const extraStudy = (scenario.study - 1.5) * 7;
  const screenSaved = (6 - scenario.screen) * 7;
  const sleepDifference = scenario.sleep - 7;

  const studyWeek = scenario.study * 7;
  const sleepWeek = scenario.sleep * 7;
  const screenWeek = scenario.screen * 7;
  const exerciseHours = scenario.exercise * 1; // treat each day as ~1 hr block for mix
  const routineTotal = studyWeek + sleepWeek + screenWeek + exerciseHours;

  const routineDonut = [
    {
      name: "Study",
      label: "Study",
      value: studyWeek,
      display: `${studyWeek.toFixed(1)} hrs / week`,
      detail: `${extraStudy >= 0 ? "+" : ""}${extraStudy.toFixed(1)} hrs vs a 1.5 hr/day baseline`,
      fill: CHART_COLORS.study
    },
    {
      name: "Sleep",
      label: "Sleep",
      value: sleepWeek,
      display: `${scenario.sleep} hrs / night`,
      detail: `${sleepDifference >= 0 ? "+" : ""}${sleepDifference} hrs vs a 7-hour night`,
      fill: CHART_COLORS.sleep
    },
    {
      name: "Exercise",
      label: "Exercise",
      value: Math.max(exerciseHours, 0.01),
      display: `${scenario.exercise} days / week`,
      detail: "Your selected movement target for the week",
      fill: CHART_COLORS.exercise
    },
    {
      name: "Screen",
      label: "Screen",
      value: screenWeek,
      display: `${screenWeek.toFixed(1)} hrs / week`,
      detail: `${screenSaved.toFixed(1)} hrs saved vs a 6 hr/day baseline`,
      fill: CHART_COLORS.screen
    }
  ];

  const wakingHours = Math.max(24 - scenario.sleep, 0.1);
  const focusHours = Math.min(scenario.study + scenario.exercise * (1 / 7), wakingHours);
  const screenShare = Math.min(scenario.screen, Math.max(wakingHours - focusHours, 0));
  const freeHours = Math.max(wakingHours - focusHours - screenShare, 0);

  const balanceDonut = [
    {
      name: "Focus",
      label: "Focus & movement",
      value: focusHours,
      display: `${focusHours.toFixed(1)} hrs / day`,
      detail: "Study plus a share of exercise time in your waking day",
      fill: CHART_COLORS.focus
    },
    {
      name: "Screen",
      label: "Screen time",
      value: Math.max(screenShare, 0.01),
      display: `${scenario.screen} hrs / day`,
      detail: "Leisure and device time in the waking day",
      fill: CHART_COLORS.screen
    },
    {
      name: "Free",
      label: "Open time",
      value: Math.max(freeHours, 0.01),
      display: `${freeHours.toFixed(1)} hrs / day`,
      detail: "Waking hours left for meals, people, and rest",
      fill: CHART_COLORS.rest
    }
  ];

  const activeRoutine = routineDonut[activeRoutineIndex] || routineDonut[0];
  const activeBalance = balanceDonut[activeBalanceIndex] || balanceDonut[0];
  const isNight = theme === "night";

  function toggleTheme() {
    setTheme(current => (current === "night" ? "day" : "night"));
  }

  const nav = [
    { name: "Today", icon: Home },
    { name: "My Habits", icon: CalendarDays },
    { name: "Future Goals", icon: Target },
    { name: "What If?", icon: SlidersHorizontal },
    { name: "Future Letter", icon: Mail }
  ];

  const sliderFields = [
    { key: "study", label: "Study", unit: "hours / day", min: 0, max: 12 },
    { key: "sleep", label: "Sleep", unit: "hours / night", min: 3, max: 12 },
    { key: "exercise", label: "Exercise", unit: "days / week", min: 0, max: 7 },
    { key: "screen", label: "Screen time", unit: "hours / day", min: 0, max: 14 }
  ];

  const pageTitles = {
    Today: "Make today count",
    "My Habits": "My habits",
    "Future Goals": "Your future goals",
    "What If?": "What if you changed?",
    "Future Letter": "Dear, future me."
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <aside className="sidebar" aria-label="Workspace">
        <div className="brand-row">
          <p className="brand"><span>fy.</span> future you</p>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-pressed={isNight}
            aria-label={isNight ? "Switch to day mode" : "Switch to night mode"}
            title={isNight ? "Day mode" : "Night mode"}
          >
            {isNight ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            <span className="theme-toggle-label">{isNight ? "Day" : "Night"}</span>
          </button>
        </div>
        <div>
          <p className="nav-caption" id="nav-label">Your workspace</p>
          <nav aria-labelledby="nav-label">
            {nav.map(item => {
              const Icon = item.icon;
              const isActive = page === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => goToPage(item.name)}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden="true" /> {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <Sparkles size={18} aria-hidden="true" />
            <p>Build a life that feels like your own.</p>
          </div>

          <div className="profile-row">
            <div className="profile-avatar" aria-hidden="true">Y</div>
            <div>
              <strong>Your space</strong>
              <small>One day at a time</small>
            </div>
          </div>
        </div>
      </aside>

      <main id="main-content" className="main-content" tabIndex={-1}>
        <header className="topbar">
          <div>
            <div className="overline">Personal growth, your way</div>
            <p>{today.toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric"
            })}</p>
          </div>

          <span className="topbar-tag">
            <Sparkles size={15} aria-hidden="true" /> Your next chapter
          </span>
        </header>

        {page === "Today" && <>
          <section className="hero" aria-labelledby="today-heading">
            <div>
              <span className="tag">A new day, a new chance</span>
              <h1
                id="today-heading"
                ref={pageHeadingRef}
                tabIndex={-1}
              >
                Make today count.<br /><span>On your terms.</span>
              </h1>
              <p>Small, intentional actions can move you closer to the life you want.</p>

              <button
                type="button"
                className="primary-btn"
                onClick={() => goToPage("Future Goals")}
              >
                Work on my goals <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="hero-shape" aria-hidden="true">
              <div className="shape-circle"></div>
              <div className="shape-square"></div>
              <span>plan · act · grow</span>
            </div>
          </section>

          <section className="section-heading">
            <div>
              <div className="overline">Your daily overview</div>
              <h2>Today, so far</h2>
            </div>
            <span className="muted">{dateKey}</span>
          </section>

          <section className="stats-grid" aria-label="Today at a glance">
            <div className="stat-card">
              <span className="stat-icon sage" aria-hidden="true"><Check /></span>
              <div>
                <strong>{completed}/{habits.length}</strong>
                <small>Habits completed</small>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon blue" aria-hidden="true"><Target /></span>
              <div>
                <strong>{goals.length}</strong>
                <small>Goals created</small>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon sand" aria-hidden="true"><TrendingUp /></span>
              <div>
                <strong>{goalProgress}%</strong>
                <small>Goals completed</small>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <div className="overline">Your daily habits</div>
                  <h3>Keep your promises</h3>
                </div>

                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => goToPage("My Habits")}
                >
                  View all <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>

              <ProgressBar value={habitProgress} label="Habit completion" />
              <p className="helper-text">{habitProgress}% of today's habits completed</p>

              {habits.slice(0, 4).map(h => (
                <button
                  type="button"
                  className={`habit-row ${h.done ? "is-done" : ""}`}
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                  aria-pressed={h.done}
                >
                  <span className="tick" aria-hidden="true"><Check size={14} /></span>
                  <span>{h.name}</span>
                </button>
              ))}

              <button
                type="button"
                className="subtle-btn add-link"
                onClick={() => goToPage("My Habits")}
              >
                <Plus size={15} aria-hidden="true" /> Manage habits
              </button>
            </div>

            <div className="right-stack">
              <div className="note-panel">
                <div className="overline">A note for today</div>
                <div className="note-mark" aria-hidden="true">“</div>
                <p>{note}</p>
                <span className="note-date">Today's reminder · {dateKey}</span>
              </div>

              <div className="goal-preview">
                <div className="overline">Your bigger picture</div>
                <h3>Keep your goals in sight.</h3>
                <p>
                  {goals.length
                    ? `${goals.length} ${goals.length === 1 ? "goal is" : "goals are"} part of your journey.`
                    : "Your future starts with deciding what matters to you."}
                </p>
                <button
                  type="button"
                  className="light-btn"
                  onClick={() => goToPage("Future Goals")}
                >
                  Open my goals <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>

              <div className="future-preview">
                <div className="overline">A note from your future self</div>
                <h3>A little reminder of who we're becoming.</h3>

                {shortLetter.map((paragraph, index) => (
                  <p key={`${letterVersion}-preview-${index}`}>{paragraph}</p>
                ))}

                <button
                  type="button"
                  className="light-btn"
                  onClick={() => goToPage("Future Letter")}
                >
                  Read my full letter <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </>}

        {page === "My Habits" && (
          <section className="page-wrap" aria-labelledby="habits-heading">
            <div className="overline">Build your own routine</div>
            <h1
              id="habits-heading"
              className="page-title"
              ref={pageHeadingRef}
              tabIndex={-1}
            >
              {pageTitles["My Habits"]}
            </h1>
            <p className="page-description">
              Choose the habits that matter to your life. Add, complete or remove them whenever you need.
            </p>

            <div className="panel">
              <div className="panel-heading">
                <div>
                  <div className="overline">Today's progress</div>
                  <h3>{completed} of {habits.length} completed</h3>
                </div>
                <strong className="progress-number">{habitProgress}%</strong>
              </div>

              <ProgressBar value={habitProgress} label="Habit completion for today" />

              {habits.map(h => (
                <div className={`habit-row habit-manage ${h.done ? "is-done" : ""}`} key={h.id}>
                  <button
                    type="button"
                    className="habit-toggle"
                    onClick={() => toggleHabit(h.id)}
                    aria-pressed={h.done}
                  >
                    <span className="tick" aria-hidden="true"><Check size={14} /></span>
                    <span>{h.name}<small>{h.category}</small></span>
                  </button>

                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Delete habit ${h.name}`}
                    onClick={() => deleteHabit(h.id)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}

              <form className="inline-form" onSubmit={addHabit}>
                <div className="form-span overline">Create a personal habit</div>

                <div className="field">
                  <label className="field-label" htmlFor={`${formIds}-habit-name`}>
                    Habit name
                  </label>
                  <input
                    id={`${formIds}-habit-name`}
                    value={newHabit}
                    onChange={e => setNewHabit(e.target.value)}
                    placeholder="e.g. Read 10 pages"
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor={`${formIds}-habit-category`}>
                    Category
                  </label>
                  <select
                    id={`${formIds}-habit-category`}
                    value={habitCategory}
                    onChange={e => setHabitCategory(e.target.value)}
                  >
                    <option>Personal</option>
                    <option>Learning</option>
                    <option>Health</option>
                    <option>Wellness</option>
                    <option>Focus</option>
                    <option>Work</option>
                  </select>
                </div>

                <button className="primary-btn" type="submit">
                  <Plus size={16} aria-hidden="true" /> Add habit
                </button>
              </form>
            </div>
          </section>
        )}

        {page === "Future Goals" && (
          <section className="page-wrap" aria-labelledby="goals-heading">
            <div className="overline">Turn intentions into action</div>
            <h1
              id="goals-heading"
              className="page-title"
              ref={pageHeadingRef}
              tabIndex={-1}
            >
              {pageTitles["Future Goals"]}
            </h1>
            <p className="page-description">
              Big dreams become manageable when you give them a next step. Keep track of what you want and what you're doing today.
            </p>

            <div className="goal-summary-strip" aria-label="Goal summary">
              <div><strong>{goals.length}</strong><span>Total goals</span></div>
              <div><strong>{goals.filter(g => g.type === "Short-term").length}</strong><span>Short-term</span></div>
              <div><strong>{goals.filter(g => g.type === "Long-term").length}</strong><span>Long-term</span></div>
              <div><strong>{completedGoals}</strong><span>Completed</span></div>
            </div>

            <div className="panel goal-form-panel">
              <div className="overline">Add a new goal</div>
              <h3>What do you want to work towards?</h3>

              <form className="goal-form" onSubmit={addGoal}>
                <div className="field">
                  <label className="field-label" htmlFor={`${formIds}-goal-title`}>
                    Goal title
                  </label>
                  <input
                    id={`${formIds}-goal-title`}
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
                    placeholder="e.g. Get better at programming"
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor={`${formIds}-goal-type`}>
                    Type
                  </label>
                  <select
                    id={`${formIds}-goal-type`}
                    value={goalType}
                    onChange={e => setGoalType(e.target.value)}
                  >
                    <option>Short-term</option>
                    <option>Long-term</option>
                  </select>
                </div>

                <div className="field field-wide">
                  <label className="field-label" htmlFor={`${formIds}-goal-next`}>
                    Next step
                  </label>
                  <input
                    id={`${formIds}-goal-next`}
                    value={goalNext}
                    onChange={e => setGoalNext(e.target.value)}
                    placeholder="What's your next step?"
                  />
                </div>

                <div className="field field-wide">
                  <label className="field-label" htmlFor={`${formIds}-goal-today`}>
                    Today's action
                  </label>
                  <textarea
                    id={`${formIds}-goal-today`}
                    value={goalToday}
                    onChange={e => setGoalToday(e.target.value)}
                    placeholder="What will you do today to move towards it?"
                    rows={2}
                  />
                </div>

                <button className="primary-btn" type="submit">
                  <Plus size={16} aria-hidden="true" /> Save goal
                </button>
              </form>
            </div>

            <div className="goal-list-heading">
              <div className="overline">Your personal roadmap</div>
              <h2>One step at a time</h2>
            </div>

            {goals.length === 0 && (
              <div className="empty-state">
                <Target size={30} aria-hidden="true" />
                <h3>Your goals will live here.</h3>
                <p>Add your first short-term or long-term goal above.</p>
              </div>
            )}

            <div className="goals-list">
              {goals.map(g => {
                const updateId = `${formIds}-update-${g.id}`;

                return (
                  <article
                    className={`goal-card ${g.completed ? "goal-complete" : ""}`}
                    key={g.id}
                  >
                    <div className="goal-card-top">
                      <span className={`goal-type ${g.type === "Long-term" ? "long" : ""}`}>
                        {g.type}
                      </span>

                      <div className="goal-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Delete goal ${g.title}`}
                          onClick={() => deleteGoal(g.id)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <h3>{g.title}</h3>

                    {g.nextStep && (
                      <div className="goal-detail">
                        <span>Next step</span>
                        <p>{g.nextStep}</p>
                      </div>
                    )}

                    {g.todayAction && (
                      <div className="goal-detail today-action">
                        <span>Today's action</span>
                        <p>{g.todayAction}</p>
                      </div>
                    )}

                    <div className="update-area">
                      <label className="field-label" htmlFor={updateId}>
                        What did you do today?
                      </label>

                      <textarea
                        id={updateId}
                        rows={2}
                        placeholder="Write a small action or progress update..."
                        value={updates[g.id] || ""}
                        onChange={e => setUpdates(current => ({
                          ...current,
                          [g.id]: e.target.value
                        }))}
                      />

                      <button
                        type="button"
                        className="subtle-btn"
                        onClick={() => addGoalUpdate(g.id)}
                      >
                        <Plus size={14} aria-hidden="true" /> Add progress update
                      </button>
                    </div>

                    {g.updates?.length > 0 && (
                      <div className="updates-list">
                        <strong>Progress log</strong>
                        {g.updates.map((u, i) => (
                          <p key={`${g.id}-update-${i}`}>
                            <span>{u.date}</span>
                            {u.text}
                          </p>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className={`complete-goal-btn ${g.completed ? "completed" : ""}`}
                      onClick={() => toggleGoal(g.id)}
                      aria-pressed={g.completed}
                    >
                      {g.completed ? "Goal completed" : "Mark goal as completed"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {page === "What If?" && (
          <section className="page-wrap page-wrap--wide" aria-labelledby="whatif-heading">
            <div className="overline">Explore a different routine</div>
            <h1
              id="whatif-heading"
              className="page-title"
              ref={pageHeadingRef}
              tabIndex={-1}
            >
              {pageTitles["What If?"]}
            </h1>
            <p className="page-description">
              Adjust your routine and see how the numbers change over a week. This is a simple planning tool, not a prediction of your future.
            </p>

            <div className="simulator-layout">
              <div className="panel simulator-controls">
                <div className="overline">Your proposed routine</div>
                <h3>Adjust your daily habits</h3>

                {sliderFields.map(item => {
                  const sliderId = `${formIds}-slider-${item.key}`;
                  const valueText = `${scenario[item.key]} ${item.unit}`;

                  return (
                    <div className="slider-item" key={item.key}>
                      <div className="slider-heading">
                        <label htmlFor={sliderId}>{item.label}</label>
                        <strong>
                          {scenario[item.key]} <small>{item.unit}</small>
                        </strong>
                      </div>

                      <input
                        id={sliderId}
                        type="range"
                        min={item.min}
                        max={item.max}
                        value={scenario[item.key]}
                        aria-valuemin={item.min}
                        aria-valuemax={item.max}
                        aria-valuenow={scenario[item.key]}
                        aria-valuetext={valueText}
                        onChange={e => changeScenario(item.key, e.target.value)}
                      />
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="subtle-btn reset-sim"
                  onClick={() => setScenario({ study: 2, sleep: 8, exercise: 3, screen: 4 })}
                >
                  Reset example routine
                </button>
              </div>

              <div className="simulator-charts">
                <article className="chart-card">
                  <header className="chart-card-header">
                    <div>
                      <div className="overline">Weekly mix</div>
                      <h3>Pie chart — donut active</h3>
                      <p className="chart-hint">Hover a slice for the detail overlay.</p>
                    </div>
                    <div className="chart-card-trend">
                      <TrendingUp size={16} aria-hidden="true" />
                      {extraStudy >= 0 ? "+" : ""}{extraStudy.toFixed(1)} study hrs / week
                    </div>
                  </header>

                  <ActiveDonut
                    data={routineDonut}
                    activeIndex={activeRoutineIndex}
                    onActiveChange={setActiveRoutineIndex}
                    centerLabel="hrs / week"
                    centerValue={routineTotal.toFixed(0)}
                    ariaLabel="Donut chart of weekly routine mix with active sector"
                  />

                  <ul className="chart-legend chart-legend--grid">
                    {routineDonut.map((item, index) => (
                      <li key={item.name}>
                        <button
                          type="button"
                          className={`chart-legend-btn ${index === activeRoutineIndex ? "is-active" : ""}`}
                          onClick={() => setActiveRoutineIndex(index)}
                          aria-pressed={index === activeRoutineIndex}
                        >
                          <i className="chart-swatch" style={{ background: item.fill }} aria-hidden="true" />
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <footer className="chart-card-footer">
                    <strong>{activeRoutine.name}</strong>
                    <span>{activeRoutine.display}</span>
                    <p>{activeRoutine.detail}</p>
                  </footer>
                </article>

                <article className="chart-card">
                  <header className="chart-card-header">
                    <div>
                      <div className="overline">Waking day</div>
                      <h3>Focus, screen, open time</h3>
                      <p className="chart-hint">How a typical day splits after sleep.</p>
                    </div>
                    <div className="chart-card-trend">
                      <TrendingUp size={16} aria-hidden="true" />
                      {screenSaved.toFixed(0)} screen hrs saved / week
                    </div>
                  </header>

                  <ActiveDonut
                    data={balanceDonut}
                    activeIndex={activeBalanceIndex}
                    onActiveChange={setActiveBalanceIndex}
                    centerLabel="waking hrs"
                    centerValue={wakingHours.toFixed(0)}
                    ariaLabel="Donut chart of waking-day balance with active sector"
                  />

                  <ul className="chart-legend chart-legend--grid">
                    {balanceDonut.map((item, index) => (
                      <li key={item.name}>
                        <button
                          type="button"
                          className={`chart-legend-btn ${index === activeBalanceIndex ? "is-active" : ""}`}
                          onClick={() => setActiveBalanceIndex(index)}
                          aria-pressed={index === activeBalanceIndex}
                        >
                          <i className="chart-swatch" style={{ background: item.fill }} aria-hidden="true" />
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <footer className="chart-card-footer">
                    <strong>{activeBalance.label}</strong>
                    <span>{activeBalance.display}</span>
                    <p>{activeBalance.detail}</p>
                  </footer>
                </article>

                <div className="simulation-message simulation-message--span">
                  {scenario.study >= 2 && scenario.sleep >= 7 && scenario.screen <= 5
                    ? "Your proposed routine makes room for focus, rest and balance."
                    : "Try one realistic adjustment at a time. A routine should support your life, not overwhelm it."}
                </div>

                <small className="disclaimer disclaimer--span">
                  Illustrative arithmetic based on the comparison values shown. Not a health or life-outcome forecast.
                </small>
              </div>
            </div>
          </section>
        )}

        {page === "Future Letter" && (
          <section className="page-wrap letter-wrap" aria-labelledby="letter-heading">
            <div className="overline">A message to the person you're becoming</div>
            <h1
              id="letter-heading"
              className="page-title"
              ref={pageHeadingRef}
              tabIndex={-1}
            >
              {pageTitles["Future Letter"]}
            </h1>
            <p className="page-description">
              A letter shaped by your habits, goals and the progress you're making.
            </p>

            <article className="letter-card">
              <div className="letter-date">
                {today.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </div>

              <h2>Dear me,</h2>

              {futureLetter.map((paragraph, index) => (
                <p key={`${letterVersion}-${index}`}>{paragraph}</p>
              ))}

              <h3>Keep going.</h3>
              <div className="letter-signature">From the you of today.</div>
            </article>

            <button
              type="button"
              className="primary-btn"
              onClick={() => setLetterVersion(v => v + 1)}
            >
              <Sparkles size={16} aria-hidden="true" /> Write another version
            </button>

            {goals.length === 0 && (
              <p className="letter-hint">
                Add your goals and progress updates to make this letter more personal.
              </p>
            )}
          </section>
        )}

        <footer className="app-footer">Future You · Built one day at a time</footer>
      </main>
    </div>
  );
}

export default App;
