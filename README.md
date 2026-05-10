# ImpactMatch

**A responsive front-end web platform for skill-based volunteer matching and NGO impact visualization.**

ImpactMatch connects students and professionals with verified NGOs using a smart skill-matching algorithm. Enter your skills, instantly see which organizations align with your expertise, and track collective impact — no backend required.

🔗 **[Live Demo](https://aptiwari1307.github.io/ImpactMatch)**

---

## Features

- **Skill-Based Matching** — Enter your skills (Teaching, Coding, Design, Medical, etc.) and get scored matches against NGOs. Match score is calculated as `(matched skills ÷ total required) × 100`.
- **Match Explanations** — Each result shows why you match, what skills you share, and what gaps remain.
- **Explore NGOs** — Browse all partner organizations, filter by cause or location, and see urgent volunteer openings.
- **Impact Dashboard** — Visualize collective progress across all NGOs using animated charts powered by Chart.js.
- **Quick Pick Skills** — Pre-defined skill chips for one-click input.
- **Responsive Design** — Mobile-first layout with a hamburger navigation menu and adaptive grids.
- **Animated Stats** — Counter animations on the homepage display live-feel aggregate numbers (lives impacted, projects done, active NGOs).

---

## Pages

| Page | File | Description |
|---|---|---|
| Home | `index.html` | Landing page with hero, stats strip, featured NGOs, and CTA |
| Explore NGOs | `explore.html` | Browsable NGO directory with filtering |
| Dashboard | `dashboard.html` | Skill input and matching results panel |
| Impact | `impact.html` | Aggregated impact visualization with Chart.js |

---

## Tech Stack

- **HTML5** — Semantic page structure
- **CSS3** — Custom properties (CSS variables), flexbox, grid, responsive breakpoints
- **JavaScript (Vanilla)** — Matching algorithm, DOM manipulation, tag input, counter animations
- **Chart.js 4.4.3** — Bar/doughnut/line charts on the Impact page
- **Font Awesome 6.5** — Icons throughout the UI
- **Google Fonts (Outfit)** — Typography
- **JSON** — `data.json` as a local data source for NGO records

---

## Project Structure

```
ImpactMatch/
├── index.html          # Home page
├── explore.html        # NGO directory
├── dashboard.html      # Skill matching dashboard
├── impact.html         # Impact visualization
├── script.js           # Root-level script (shared utilities)
├── style.css           # Root-level styles
├── data.json           # NGO data source
├── css/
│   └── global.css      # Global design tokens and component styles
├── js/
│   └── main.js         # Core JS: matching engine, charts, animations
└── data/               # Additional data assets
```

---

## Getting Started

No build tools or dependencies to install. Just clone and open.

```bash
git clone https://github.com/aptiwari1307/ImpactMatch.git
cd ImpactMatch
```

Then open `index.html` in your browser, or use a local server for best results:

```bash
# Using VS Code Live Server, or:
npx serve .
```

---

## How the Matching Works

1. The user types or selects skills in the Dashboard panel.
2. On clicking **Find My NGO Matches**, the JS engine fetches NGO data from `data.json`.
3. Each NGO's required skill set is compared against the user's input.
4. A match score is calculated: `(overlapping skills / total required) × 100`.
5. Results are ranked and displayed with match percentage, matching skills, and skill gap suggestions.
6. Great Match ≥ 70% | Good Match 40–69%

---

## Deployment

The project is deployed via **GitHub Pages** from the `main` branch with no build step.

To deploy your own fork:
1. Go to **Settings → Pages** in your GitHub repo.
2. Set source to `main` branch, `/ (root)`.
3. Save — your site will be live at `https://<your-username>.github.io/ImpactMatch`.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push and open a Pull Request.

Please keep changes scoped to front-end only (no frameworks, no build tools) to maintain the zero-dependency philosophy of the project.

---

## License

This project is open source. Feel free to use, adapt, and build on it.
