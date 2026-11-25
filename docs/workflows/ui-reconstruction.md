# UI Reconstruction Workflow

## Purpose
Guidelines for converting PNG screenshots (in `Docs/`) into React components using the project's actual frontend stack (React + Vite + Tailwind CSS) without violating low-bandwidth pier constraints.

## Source Assets
| Screenshot | Description | Target View |
|------------|-------------|-------------|
| `Docs/Client Home.jpg` | Public waybill lookup | `PublicTracker.jsx` |
| `Docs/Login staff.jpg` | Staff authentication | Auth flow |
| `Docs/menu.jpg` | Navigation structure | Layout/Nav |
| `Docs/OIC.jpg` | OIC dispatch dashboard | `OICDashboard.jsx` |
| `Docs/Executive report.jpg` | Executive capacity board | `Executive.jsx` |
| `Docs/SMS .jpg` | SMS fallback UI | Driver tracking fallback |
| `Docs/TTS_figma.jpg` | Figma design reference | All views |
| `Docs/Trans-Track ERD.png` | Database schema | Data mapping |

## Workflow Steps

### 1. Analyze Screenshot (Human + Design Skill)
**Use `design` skill + `ui-ux-pro-max` for structured analysis:**
- Extract layout grid, spacing, typography scale, color palette
- Identify reusable components (cards, tables, forms, buttons, dropdowns)
- Map visual elements to data models (waybills, voyages, trucks, users)
- **Output**: `docs/ui-reconstruction/analysis-<view>.md` with structured description

**Structured Description Template** (fill per screenshot):
```markdown
## Layout Grid
- Container width: ___px / fluid
- Column count: ___ (12-col? sidebar width?)
- Header height: ___px
- Section spacing: ___px between sections

## Color Palette
- Primary: #____
- Secondary: #____
- Background: #____
- Surface/Card: #____
- Text primary: #____
- Text muted: #____
- Border: #____
- Accent (CTA): #____
- Status colors: success #____, warning #____, error #____

## Typography
- Font family: ____ (system UI? Inter? Roboto?)
- Heading scale: H1 ___px, H2 ___px, H3 ___px
- Body: ___px / ___ line-height
- Font weights used: 400, 500, 600, 700?

## Components Identified
| Component | Type | Variants | Notes |
|-----------|------|----------|-------|
| WaybillCard | organism | default, loading, error | maps to waybill data |
| DataTable | molecule | sortable, paginated | columns: ___ |
| Button | atomic | primary, secondary, ghost, danger | 48px min height |
| Dropdown | molecule | searchable, multi-select | |
| StatCard | organism | icon + value + trend | |

## Spacing Scale
- Base unit: 4px / 8px?
- Scale: 4, 8, 12, 16, 24, 32, 48, 64?

## Responsive Breakpoints
- Mobile (< 768px): ____
- Tablet (768-1024px): ____
- Desktop (> 1024px): ____

## Interactions
- Hover states: ____
- Loading states: ____
- Click/press feedback: ____
- Form validation: ____
```

### 2. Create Design Tokens
- Document colors, spacing, fonts, shadows in `docs/ui-reconstruction/design-tokens.json`
- Generate CSS custom properties for Tailwind config
- **Use `design` skill → `design-system` sub-skill** for token generation

### 3. Build Component Hierarchy
- Atomic components → Molecules → Organisms → Pages
- Reuse existing components from `client/src/components/` if available
- Create new components only when no existing match
- **Use `design` skill → `ui-styling` sub-skill** for shadcn/ui + Tailwind patterns

### 4. Implement in React + Tailwind
- Follow `frontend-react-dev` agent patterns
- Optimize for 3G: minimal bundle, lazy loading, no heavy graphics
- Large touch targets (48px min) for gate clerk outdoor use
- High contrast ratios (WCAG AA)

### 5. Run & Capture (Playwright MCP)
- Start dev server: `npm run dev` (from client directory)
- **Use Playwright MCP** to capture browser screenshots at 3 breakpoints:
  ```bash
  # Via Playwright MCP tools:
  # 1. navigate to http://localhost:5173/<page>
  # 2. screenshot at 1440x900 (desktop)
  # 3. screenshot at 1024x768 (tablet)
  # 4. screenshot at 390x844 (mobile)
  ```
- Save to `docs/ui-reconstruction/screenshots/<view>/{desktop,tablet,mobile}.png`

### 6. Visual Comparison
- Compare reconstructed screenshots with original PNGs (side-by-side)
- Document differences: exact matches vs. estimates
- **Use `design` skill → `ui-ux-pro-max`** for design critique of implementation
- Iterate until acceptable fidelity

### 7. Design Review Gate
- `uiux-reviewer` agent validates against:
  - Original PNG analysis (Step 1)
  - Design tokens (Step 2)
  - 3G performance (bundle size, image weight)
  - Accessibility (WCAG AA)
  - `design-taste-frontend` checklist (hero entrance, dealt moments, equal edges)

## Constraints & Rules
- **Never pretend to have image vision** — the AI cannot see PNGs directly; human must describe or use tools
- **Never claim pixel-perfect accuracy** without visual comparison evidence
- **Respect existing stack** — no new UI libraries, no CSS-in-JS if Tailwind is used
- **Distinguish observed vs. estimated** — mark measurements that are inferred
- **Low-bandwidth first** — every component must load under 3G simulation

## Tools Available
- **Playwright MCP** (browser automation, screenshots, visual comparison) — configured in OpenCode
- **design skill** (tokens, UI styling, design system, brand, CIP) — installed at `~/.agents/skills/design`
- **ui-ux-pro-max skill** (design intelligence, critique) — installed at `~/.agents/skills/design`
- **design-taste-frontend skill** (production-grade frontend standards) — installed at `~/.agents/skills/design-taste-frontend`
- Tailwind CSS (utility-first styling)
- Vite (fast dev server, optimized builds)
- React Testing Library (component tests)

## Output Artifacts
- `docs/ui-reconstruction/design-tokens.json`
- `docs/ui-reconstruction/component-hierarchy.md`
- `docs/ui-reconstruction/analysis-<view>.md` (per screenshot)
- `docs/ui-reconstruction/screenshots/<view>/{desktop,tablet,mobile}.png`
- `docs/ui-reconstruction/comparison-report.md`
- React components under `client/src/components/` and pages under `client/src/pages/`

## Setup Required
```bash
# 1. Google AI Studio API key (free) for design skill logo/CIP generation
export GEMINI_API_KEY="your-key-from-aistudio.google.com"

# 2. Playwright MCP already configured in ~/.config/opencode/mcp-configs/
#    Verify: npx @playwright/mcp --help

# 3. Design skill prerequisites
pip install google-genai pillow --break-system-packages
```

## Agent Invocation Pattern
```
User: "Reconstruct OIC Dashboard from Docs/OIC.jpg"

Orchestrator (trans-track-architect):
  1. Creates plan in docs/superpowers/plans/
  2. Delegates to frontend-react-dev: "Implement OICDashboard per analysis-oic.md"
  3. Delegates to design skill: "Generate design-tokens.json from analysis-oic.md"
  4. Runs dev server, captures screenshots via Playwright MCP
  5. Delegates to uiux-reviewer: "Review against analysis-oic.md + design-taste-frontend checklist"
  6. Delegates to qa-testing-engineer: "Test 3G performance + accessibility"
  7. Updates comparison-report.md, marks plan complete
```