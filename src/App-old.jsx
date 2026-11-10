
import { useEffect, useState } from "react";
import {
  Sparkles, Sun, Moon, BookOpen, Heart, Leaf,
  Check, Home, CalendarDays, SlidersHorizontal,
  Mail, ArrowRight, Clock, Dumbbell, GraduationCap,
  Wallet, Smartphone, RotateCcw
} from "lucide-react";
import "./App.css";

const initialHabits = [
  { id: 1, name: "Study for 2 hours", category: "Learning", icon: GraduationCap },
  { id: 2, name: "Sleep before 11 PM", category: "Wellness", icon: Moon },
  { id: 3, name: "Move your body", category: "Health", icon: Dumbbell },
  { id: 4, name: "Limit screen time", category: "Mindfulness", icon: Smartphone },
];

function App() {
  const [activePage, setActivePage] = useState("Today");

  const [habits, setHabits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("future-you-habits")) || initialHabits.map(h => ({ ...h, done: false }));
    } catch {
      return initialHabits.map(h => ({ ...h, done: false }));
    }
  });

  const [scenario, setScenario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("future-you-scenario")) || {
        study: 2, sleep: 7, exercise: 2, screen: 5
      };
    } catch {
      return { study: 2, sleep: 7, exercise: 2, screen: 5 };
    }
  });

  useEffect(() => {
    localStorage.setItem("future-you-habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("future-you-scenario", JSON.stringify(scenario));
  }, [scenario]);

  const completed = habits.filter(h => h.done).length;
  const progress = Math.round((completed / habits.length) * 100);

  const toggleHabit = (id) => {
    setHabits(current => current.map(h => h.id === id ? { ...h, done: !h.done } : h));
  };

  const updateScenario = (key, value) => {
    setScenario(current => ({ ...current, [key]: Number(value) }));
  };

  const resetHabits = () => {
    setHabits(current => current.map(h => ({ ...h, done: false })));
  };

  const navItems = [
    { name: "Today", icon: Home },
    { name: "My Habits", icon: CalendarDays },
    { name: "What If?", icon: SlidersHorizontal },
    { name: "Future Letter", icon: Mail },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✿</span>
          <span>future you</span>
        </div>

        <p className="nav-label">YOUR SPACE</p>
        <nav>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <span>🌱</span>
          <p>Small steps today, a beautiful story tomorrow.</p>
        </div>

        <div className="profile">
          <div className="avatar">Y</div>
          <div>
            <strong>Your journey</strong>
            <small>Growing every day</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">YOUR PERSONAL GROWTH JOURNAL</span>
            <p className="date-line">A little progress is still progress ♡</p>
          </div>
          <div className="top-sparkle"><Sparkles size={19} /> Your future starts here</div>
        </header>

        {activePage === "Today" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="pill">✿ A FRESH LITTLE START</span>
                <h1>Become someone<br />you <em>love</em> being.</h1>
                <p>You don't need to have it all figured out. Just make one little promise to yourself today.</p>
                <button className="primary-btn" onClick={() => setActivePage("My Habits")}>
                  Start today's rituals <ArrowRight size={17} />
                </button>
              </div>
              <div className="hero-art">
                <div className="sun-circle"><Sun size={37} /></div>
                <div className="flower">✿</div>
                <div className="art-caption">growing at<br />my own pace</div>
                <span className="tiny-star star-one">✧</span>
                <span className="tiny-star star-two">✦</span>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <span className="eyebrow">YOUR DAILY RITUALS</span>
                <h2>Little things, big changes.</h2>
              </div>
              <button className="text-btn" onClick={() => setActivePage("My Habits")}>View all <ArrowRight size={15} /></button>
            </section>

            <section className="dashboard-grid">
              <div className="card rituals-card">
                <div className="card-top">
                  <div>
                    <span className="eyebrow">TODAY'S CHECKLIST</span>
                    <h3>Your daily promises</h3>
                  </div>
                  <span className="soft-icon"><Heart size={19} /></span>
                </div>
                <div className="progress-line">
                  <div style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-text">{completed} of {habits.length} rituals completed · {progress}%</p>
                <div className="habit-list">
                  {habits.map(habit => {
                    const Icon = habit.icon === "none" ? Leaf : (initialHabits.find(h => h.id === habit.id)?.icon || Leaf);
                    return (
                      <button key={habit.id} className={`habit-row ${habit.done ? "done" : ""}`} onClick={() => toggleHabit(habit.id)}>
                        <span className="habit-icon"><Icon size={17} /></span>
                        <span className="habit-name">{habit.name}</span>
                        <span className="check-circle">{habit.done && <Check size={14} />}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="side-cards">
                <div className="card future-card">
                  <span className="eyebrow">A NOTE FROM FUTURE YOU</span>
                  <div className="quote-mark">“</div>
                  <p>I'm proud of you for showing up, even on the days it felt difficult.</p>
                  <button className="text-btn" onClick={() => setActivePage("Future Letter")}>Read your letter <ArrowRight size={15} /></button>
                  <span className="decor-flower">✿</span>
                </div>
                <div className="card whatif-card">
                  <div className="whatif-top"><span className="eyebrow">IMAGINE THE POSSIBILITIES</span><Sparkles size={19} /></div>
                  <h3>What if you started today?</h3>
                  <p>Explore the little changes that could shape your future.</p>
                  <button className="light-btn" onClick={() => setActivePage("What If?")}>Explore my future <ArrowRight size={16} /></button>
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === "My Habits" && (
          <section className="page-section">
            <span className="eyebrow">CONSISTENCY OVER PERFECTION</span>
            <h1 className="page-title">My little rituals <em>♡</em></h1>
            <p className="page-intro">Every small promise you keep is a vote for the person you're becoming.</p>
            <div className="card habits-page-card">
              <div className="card-top">
                <div><span className="eyebrow">DAILY CHECKLIST</span><h3>Today's promises</h3></div>
                <button className="reset-btn" onClick={resetHabits}><RotateCcw size={15} /> Reset day</button>
              </div>
              <div className="big-progress"><div style={{ width: `${progress}%` }} /></div>
              <p className="progress-text">{completed}/{habits.length} completed · You're doing great at your own pace.</p>
              {habits.map(habit => {
                const Icon = initialHabits.find(h => h.id === habit.id)?.icon || Leaf;
                return (
                  <button key={habit.id} className={`large-habit-row ${habit.done ? "done" : ""}`} onClick={() => toggleHabit(habit.id)}>
                    <span className="habit-icon"><Icon size={20} /></span>
                    <span className="large-habit-copy"><strong>{habit.name}</strong><small>{habit.category}</small></span>
                    <span className="check-circle">{habit.done && <Check size={14} />}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activePage === "What If?" && (
          <section className="page-section">
            <span className="eyebrow">A LITTLE EXPERIMENT WITH YOUR FUTURE</span>
            <h1 className="page-title">What if you <em>changed?</em></h1>
            <p className="page-intro">Play with your daily habits and explore an illustrative version of your future. These are possibilities, not predictions.</p>

            <div className="simulator-layout">
              <div className="card slider-card">
                <span className="eyebrow">DESIGN YOUR DAY</span>
                <h3>Choose your little changes</h3>
                {[
                  { key: "study", label: "Study time", unit: "hours / day", min: 0, max: 8, icon: BookOpen },
                  { key: "sleep", label: "Sleep", unit: "hours / night", min: 3, max: 12, icon: Moon },
                  { key: "exercise", label: "Exercise", unit: "days / week", min: 0, max: 7, icon: Dumbbell },
                  { key: "screen", label: "Screen time", unit: "hours / day", min: 0, max: 12, icon: Smartphone },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div className="slider-item" key={item.key}>
                      <div className="slider-label"><span><Icon size={17} /> {item.label}</span><strong>{scenario[item.key]} <small>{item.unit}</small></strong></div>
                      <input type="range" min={item.min} max={item.max} value={scenario[item.key]} onChange={e => updateScenario(item.key, e.target.value)} />
                    </div>
                  );
                })}
              </div>

              <div className="future-result">
                <div className="result-sun">☀</div>
                <span className="eyebrow">YOUR POSSIBLE FUTURE</span>
                <h2>A little more intentional. A little more <em>you.</em></h2>
                <div className="result-stat"><strong>{scenario.study} hrs</strong><span>for learning each day</span></div>
                <div className="result-stat"><strong>{scenario.sleep} hrs</strong><span>of nightly rest</span></div>
                <div className="result-stat"><strong>{scenario.exercise} days</strong><span>of movement each week</span></div>
                <div className="result-stat"><strong>{scenario.screen} hrs</strong><span>of screen time each day</span></div>
                <p className="result-note">
                  {scenario.sleep >= 7 && scenario.study >= 2 && scenario.screen <= 5
                    ? "Your routine is making room for rest, focus and balance. Keep nurturing it."
                    : "Every adjustment is a chance to learn what works for you. Try a small, realistic change first."}
                </p>
                <span className="result-disclaimer">A reflective scenario, not a guaranteed outcome.</span>
              </div>
            </div>
          </section>
        )}

        {activePage === "Future Letter" && (
          <section className="page-section letter-page">
            <span className="eyebrow">A LITTLE TIME TRAVEL</span>
            <h1 className="page-title">A letter from <em>future you.</em></h1>
            <p className="page-intro">A reminder from the person you're slowly becoming.</p>
            <div className="letter-card">
              <div className="letter-flower">✿</div>
              <span className="eyebrow">TO THE YOU OF TODAY</span>
              <h2>Dear me,</h2>
              <p>I know you're figuring things out. I remember the tiny steps, the uncertain beginnings, and the days when progress felt invisible.</p>
              <p>Thank you for choosing to try again. Thank you for taking care of your mind, your body, and your dreams, even in small ways.</p>
              <p>Keep learning. Keep resting. Keep making space for the things that make you feel alive. You don't have to become someone else. You're just growing into yourself.</p>
              <h3>With love,</h3>
              <p className="signature">Your future self ♡</p>
              <div className="letter-footer">one day at a time · one promise at a time</div>
            </div>
          </section>
        )}

        <footer className="footer">made with ♡ for the person you're becoming</footer>
      </main>
    </div>
  );
}

export default App;
