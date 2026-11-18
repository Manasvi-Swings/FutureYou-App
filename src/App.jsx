
import { useEffect, useState } from "react";
import {
  Home, Check, Plus, Trash2, Target, Clock, BookOpen,
  Moon, Dumbbell, Smartphone, ArrowRight, Sparkles,
  SlidersHorizontal, Mail, CalendarDays, TrendingUp,
  ChevronRight, Heart, Flag
} from "lucide-react";
import "./App.css";

const initialHabits = [
  { id: 1, name: "Study for 2 hours", category: "Learning", done: false },
  { id: 2, name: "Sleep before 11 PM", category: "Wellness", done: false },
  { id: 3, name: "Move your body", category: "Health", done: false },
  { id: 4, name: "Limit screen time", category: "Focus", done: false },
];

const dailyNotes = [
  "You don't need a perfect plan. You need a first step.",
  "The effort nobody sees is still building something meaningful.",
  "Your pace is allowed to be different. Keep moving.",
  "Don't underestimate what a little consistency can do.",
  "You are allowed to start again, as many times as you need.",
  "The person you want to become is shaped by what you do today.",
  "Progress isn't always loud. Sometimes it looks like showing up.",
  "Make today's choices a little kinder to tomorrow's you.",
  "You don't have to do everything today. Just do the next thing.",
  "A small promise kept is better than a big promise postponed."
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

function App() {
  const [page, setPage] = useState("Today");
  const [letterVersion, setLetterVersion] = useState(0);

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

  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const dayNumber = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000
  );

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

  const nav = [
    { name: "Today", icon: Home },
    { name: "My Habits", icon: CalendarDays },
    { name: "Future Goals", icon: Target },
    { name: "What If?", icon: SlidersHorizontal },
    { name: "Future Letter", icon: Mail }
  ];

  const goalSummary = goals.length
    ? goals.slice(0, 3).map(g => g.title).join(", ")
    : "the goals you are still discovering";

  const nextStepSummary = goals.find(g => !g.completed && g.nextStep)?.nextStep
    || "choosing one small action and following through";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>fy.</span> future you</div>
        <div className="nav-caption">YOUR WORKSPACE</div>

        <nav>
          {nav.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => setPage(item.name)}
                className={`nav-item ${page === item.name ? "active" : ""}`}
              >
                <Icon size={18} /> {item.name}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <Sparkles size={18} />
            <p>Build a life that feels like your own.</p>
          </div>

          <div className="profile-row">
            <div className="profile-avatar">Y</div>
            <div><strong>Your space</strong><small>One day at a time</small></div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="overline">PERSONAL GROWTH, YOUR WAY</div>
            <p>{today.toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric"
            })}</p>
          </div>

          <span className="topbar-tag">
            <Sparkles size={15} /> Your next chapter
          </span>
        </header>

        {page === "Today" && <>
          <section className="hero">
            <div>
              <span className="tag">A NEW DAY, A NEW CHANCE</span>
              <h1>Make today count.<br /><span>On your terms.</span></h1>
              <p>Small, intentional actions can move you closer to the life you want.</p>

              <button className="primary-btn" onClick={() => setPage("Future Goals")}>
                Work on my goals <ArrowRight size={16} />
              </button>
            </div>

            <div className="hero-shape">
              <div className="shape-circle"></div>
              <div className="shape-square"></div>
              <span>PLAN · ACT · GROW</span>
            </div>
          </section>

          <section className="section-heading">
            <div>
              <div className="overline">YOUR DAILY OVERVIEW</div>
              <h2>Today, so far</h2>
            </div>
            <span className="muted">{dateKey}</span>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon sage"><Check /></span>
              <div><strong>{completed}/{habits.length}</strong><small>Habits completed</small></div>
            </div>

            <div className="stat-card">
              <span className="stat-icon blue"><Target /></span>
              <div><strong>{goals.length}</strong><small>Goals created</small></div>
            </div>

            <div className="stat-card">
              <span className="stat-icon sand"><TrendingUp /></span>
              <div><strong>{goalProgress}%</strong><small>Goals completed</small></div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <div className="overline">YOUR DAILY HABITS</div>
                  <h3>Keep your promises</h3>
                </div>

                <button className="subtle-btn" onClick={() => setPage("My Habits")}>
                  View all <ChevronRight size={15}/>
                </button>
              </div>

              <div className="progress-track">
                <div style={{ width: `${habitProgress}%` }} />
              </div>

              <p className="helper-text">{habitProgress}% of today's habits completed</p>

              {habits.slice(0, 4).map(h => (
                <button
                  className={`habit-row ${h.done ? "is-done" : ""}`}
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                >
                  <span className="tick"><Check size={14}/></span>
                  <span>{h.name}</span>
                </button>
              ))}

              <button className="subtle-btn add-link" onClick={() => setPage("My Habits")}>
                <Plus size={15}/> Manage habits
              </button>
            </div>

            <div className="right-stack">
              <div className="note-panel">
                <div className="overline">A NOTE FOR TODAY</div>
                <div className="note-mark">“</div>
                <p>{note}</p>
                <span className="note-date">TODAY'S REMINDER · {dateKey}</span>
              </div>

              <div className="goal-preview">
                <div className="overline">YOUR BIGGER PICTURE</div>
                <h3>Keep your goals in sight.</h3>
                <p>{goals.length ? `${goals.length} goals are part of your journey.` : "Your future starts with deciding what matters to you."}</p>
                <button className="light-btn" onClick={() => setPage("Future Goals")}>
                  Open my goals <ArrowRight size={15}/>
                </button>
              </div>

              <div className="future-preview">
                <div className="overline">A NOTE FROM YOUR FUTURE SELF</div>
                <h3>A little reminder of who we're becoming.</h3>

                {shortLetter.map((paragraph, index) => (
                  <p key={`${letterVersion}-preview-${index}`}>{paragraph}</p>
                ))}

                <button className="light-btn" onClick={() => setPage("Future Letter")}>
                  Read my full letter <ArrowRight size={15}/>
                </button>
              </div>
            </div>
          </section>
        </>}

        {page === "My Habits" && <section className="page-wrap">
          <div className="overline">BUILD YOUR OWN ROUTINE</div>
          <h1 className="page-title">My habits</h1>
          <p className="page-description">Choose the habits that matter to your life. Add, complete or remove them whenever you need.</p>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <div className="overline">TODAY'S PROGRESS</div>
                <h3>{completed} of {habits.length} completed</h3>
              </div>
              <strong className="progress-number">{habitProgress}%</strong>
            </div>

            <div className="progress-track">
              <div style={{ width: `${habitProgress}%` }} />
            </div>

            {habits.map(h => (
              <div className={`habit-row habit-manage ${h.done ? "is-done" : ""}`} key={h.id}>
                <button className="habit-toggle" onClick={() => toggleHabit(h.id)}>
                  <span className="tick"><Check size={14}/></span>
                  <span>{h.name}<small>{h.category}</small></span>
                </button>

                <button className="icon-btn" title="Delete habit" onClick={() => deleteHabit(h.id)}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}

            <form className="inline-form" onSubmit={addHabit}>
              <div className="overline">CREATE A PERSONAL HABIT</div>

              <input
                value={newHabit}
                onChange={e => setNewHabit(e.target.value)}
                placeholder="e.g. Read 10 pages"
                required
              />

              <select value={habitCategory} onChange={e => setHabitCategory(e.target.value)}>
                <option>Personal</option>
                <option>Learning</option>
                <option>Health</option>
                <option>Wellness</option>
                <option>Focus</option>
                <option>Work</option>
              </select>

              <button className="primary-btn" type="submit">
                <Plus size={16}/> Add habit
              </button>
            </form>
          </div>
        </section>}

        {page === "Future Goals" && <section className="page-wrap">
          <div className="overline">TURN INTENTIONS INTO ACTION</div>
          <h1 className="page-title">Your future goals</h1>
          <p className="page-description">Big dreams become manageable when you give them a next step. Keep track of what you want and what you're doing today.</p>

          <div className="goal-summary-strip">
            <div><strong>{goals.length}</strong><span>Total goals</span></div>
            <div><strong>{goals.filter(g => g.type === "Short-term").length}</strong><span>Short-term</span></div>
            <div><strong>{goals.filter(g => g.type === "Long-term").length}</strong><span>Long-term</span></div>
            <div><strong>{completedGoals}</strong><span>Completed</span></div>
          </div>

          <div className="panel goal-form-panel">
            <div className="overline">ADD A NEW GOAL</div>
            <h3>What do you want to work towards?</h3>

            <form className="goal-form" onSubmit={addGoal}>
              <input
                value={goalTitle}
                onChange={e => setGoalTitle(e.target.value)}
                placeholder="e.g. Get better at programming"
                required
              />

              <select value={goalType} onChange={e => setGoalType(e.target.value)}>
                <option>Short-term</option>
                <option>Long-term</option>
              </select>

              <input
                value={goalNext}
                onChange={e => setGoalNext(e.target.value)}
                placeholder="What's your next step?"
              />

              <textarea
                value={goalToday}
                onChange={e => setGoalToday(e.target.value)}
                placeholder="What will you do today to move towards it?"
                rows={2}
              />

              <button className="primary-btn" type="submit">
                <Plus size={16}/> Save goal
              </button>
            </form>
          </div>

          <div className="goal-list-heading">
            <div className="overline">YOUR PERSONAL ROADMAP</div>
            <h2>One step at a time</h2>
          </div>

          {goals.length === 0 && (
            <div className="empty-state">
              <Target size={30}/>
              <h3>Your goals will live here.</h3>
              <p>Add your first short-term or long-term goal above.</p>
            </div>
          )}

          <div className="goals-list">
            {goals.map(g => (
              <article className={`goal-card ${g.completed ? "goal-complete" : ""}`} key={g.id}>
                <div className="goal-card-top">
                  <span className={`goal-type ${g.type === "Long-term" ? "long" : ""}`}>{g.type}</span>

                  <div className="goal-actions">
                    <button className="icon-btn" title="Delete goal" onClick={() => deleteGoal(g.id)}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>

                <h3>{g.title}</h3>

                {g.nextStep && (
                  <div className="goal-detail">
                    <span>NEXT STEP</span>
                    <p>{g.nextStep}</p>
                  </div>
                )}

                {g.todayAction && (
                  <div className="goal-detail today-action">
                    <span>TODAY'S ACTION</span>
                    <p>{g.todayAction}</p>
                  </div>
                )}

                <div className="update-area">
                  <label>What did you do today?</label>

                  <textarea
                    rows={2}
                    placeholder="Write a small action or progress update..."
                    value={updates[g.id] || ""}
                    onChange={e => setUpdates(current => ({
                      ...current,
                      [g.id]: e.target.value
                    }))}
                  />

                  <button className="subtle-btn" onClick={() => addGoalUpdate(g.id)}>
                    <Plus size={14}/> Add progress update
                  </button>
                </div>

                {g.updates?.length > 0 && (
                  <div className="updates-list">
                    <strong>Progress log</strong>
                    {g.updates.map((u, i) => (
                      <p key={i}><span>{u.date}</span>{u.text}</p>
                    ))}
                  </div>
                )}

                <button
                  className={`complete-goal-btn ${g.completed ? "completed" : ""}`}
                  onClick={() => toggleGoal(g.id)}
                >
                  {g.completed ? "✓ Goal completed" : "Mark goal as completed"}
                </button>
              </article>
            ))}
          </div>
        </section>}

        {page === "What If?" && <section className="page-wrap">
          <div className="overline">EXPLORE A DIFFERENT ROUTINE</div>
          <h1 className="page-title">What if you changed?</h1>
          <p className="page-description">Adjust your routine and see how the numbers change over a week. This is a simple planning tool, not a prediction of your future.</p>

          <div className="simulator-grid">
            <div className="panel">
              <div className="overline">YOUR PROPOSED ROUTINE</div>
              <h3>Adjust your daily habits</h3>

              {[
                { key: "study", label: "Study", unit: "hours / day", min: 0, max: 12 },
                { key: "sleep", label: "Sleep", unit: "hours / night", min: 3, max: 12 },
                { key: "exercise", label: "Exercise", unit: "days / week", min: 0, max: 7 },
                { key: "screen", label: "Screen time", unit: "hours / day", min: 0, max: 14 }
              ].map(item => (
                <div className="slider-item" key={item.key}>
                  <div className="slider-heading">
                    <label>{item.label}</label>
                    <strong>{scenario[item.key]} <small>{item.unit}</small></strong>
                  </div>

                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    value={scenario[item.key]}
                    onChange={e => changeScenario(item.key, e.target.value)}
                  />
                </div>
              ))}

              <button
                className="subtle-btn reset-sim"
                onClick={() => setScenario({ study: 2, sleep: 8, exercise: 3, screen: 4 })}
              >
                Reset example routine
              </button>
            </div>

            <div className="simulation-results">
              <div className="overline">YOUR WEEKLY COMPARISON</div>
              <h2>Small changes, visible differences.</h2>

              <div className="comparison-row">
                <span>Study time</span>
                <strong>{extraStudy >= 0 ? "+" : ""}{extraStudy.toFixed(1)} hrs / week</strong>
                <small>Compared with 1.5 hours per day</small>
              </div>

              <div className="comparison-row">
                <span>Screen time</span>
                <strong>{screenSaved.toFixed(1)} hrs saved / week</strong>
                <small>Compared with 6 hours per day</small>
              </div>

              <div className="comparison-row">
                <span>Sleep</span>
                <strong>{sleepDifference >= 0 ? "+" : ""}{sleepDifference} hrs / night</strong>
                <small>Compared with a 7-hour baseline</small>
              </div>

              <div className="comparison-row">
                <span>Exercise</span>
                <strong>{scenario.exercise} days / week</strong>
                <small>Your selected movement target</small>
              </div>

              <div className="simulation-message">
                {scenario.study >= 2 && scenario.sleep >= 7 && scenario.screen <= 5
                  ? "Your proposed routine makes room for focus, rest and balance."
                  : "Try one realistic adjustment at a time. A routine should support your life, not overwhelm it."}
              </div>

              <small className="disclaimer">
                Illustrative arithmetic based on the comparison values shown. Not a health or life-outcome forecast.
              </small>
            </div>
          </div>
        </section>}

        {page === "Future Letter" && <section className="page-wrap letter-wrap">
          <div className="overline">A MESSAGE TO THE PERSON YOU'RE BECOMING</div>
          <h1 className="page-title">Dear, future me.</h1>
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

          <button className="primary-btn" onClick={() => setLetterVersion(v => v + 1)}>
            <Sparkles size={16}/> Write another version
          </button>

          {goals.length === 0 && (
            <p className="letter-hint">
              Add your goals and progress updates to make this letter more personal.
            </p>
          )}
        </section>}

        <footer className="app-footer">FUTURE YOU · BUILT ONE DAY AT A TIME</footer>
      </main>
    </div>
  );
}

export default App;
