# Cloud Coach

Cloud Coach is a lightweight, client‑side study companion for AWS certification prep. It’s designed to help you:

- Track **domain mastery** (per exam blueprint) and see overall progress
- Follow a simple **daily checklist** (timed questions → review → rewatch)
- Use a **Rewatch Planner** that prioritizes what to revisit next (impact + recency + mastery + rewatch count)

All data is stored **locally in your browser** (LocalStorage). There is no backend and no account system.

## Where it lives

- **Landing page:** [`_pages/cloud-coach.md`](_pages/cloud-coach.md) → `/cloud-coach/`
- **App (single HTML):** [`cloud-coach-app.html`](cloud-coach-app.html) → `/cloud-coach-app.html`

## How it works (high level)

`cloud-coach-app.html` is a single static HTML page that:

- Loads React/ReactDOM from CDNs
- Bootstraps a React app into `#aws-coach-app`
- Initializes state using a default config (exam blueprints, rewatch sections, checklist defaults)
- Persists changes to LocalStorage so refreshes keep your progress

### Main concepts

- **Exam selection**: switch between SAA and DVA configurations.
- **Domain board**: sliders to adjust mastery per domain.
- **Rewatch Planner**: a ranked list of sections to rewatch next.
- **Watch Now vs Mark Rewatched**
  - **Watch Now** opens a relevant course link in a new tab and shows a small hint for searching the lecture title on Udemy.
  - **Mark Rewatched** increments rewatches and updates last watched time (so the ranking changes).

## Data model (simplified)

The app keeps a state object similar to:

- `currentExam`: `"saa-c03"` or `"dva-c02"`
- `domains`: blueprint domains with `{ name, weight, mastery }`
- `rewatch.sections`: array of `{ id, title, mins, impact, tags, rewatches, last, notes, ... }`
- `checklist.items`: daily checklist items
- `settings`: small toggles (e.g. biasSplit)

## Local development / preview

From the repo root:

```bash
bundle exec jekyll serve --livereload --host 127.0.0.1 --port 4000
```

Then open:

- `http://127.0.0.1:4000/cloud-coach/`
- `http://127.0.0.1:4000/cloud-coach-app.html`

## Notes / limitations

- Since Udemy is cross‑origin, the app **cannot** automatically trigger browser “Find in page” on Udemy after opening a tab. The UI provides a hint and (when allowed) copies the section title to clipboard.
- If you want true deep links per section, add a per‑section `url` field in the `rewatch.sections` data.

## TODO / Future roadmap (standalone product)

If Cloud Coach graduates from a single static HTML file into a standalone product, the long‑term direction could be:

- **Standalone app**: dedicated frontend + backend (instead of one HTML file).
- **User accounts**: login, profiles, saved progress across devices, privacy controls.
- **Multi‑cert support**: one system that supports any certification blueprint (AWS/GCP/Azure/K8s/etc).
- **Smart guidance**: personalized study plans based on goals, time budget, exam date, and performance.
- **AI learning loop**: interactive learning (quizzes, explanations, spaced repetition, adaptive rewatch suggestions).
- **Content curation (not hosting)**: the system references external courses/videos (paid or free), and guides users to what to watch/do next to reach a target cert.
- **Community/social**: share plans, progress, and curated paths; user‑improved mappings and suggestions.
- **Monetization options**: affiliate links (optional), subscriptions, discounts to partner platforms, team plans.

