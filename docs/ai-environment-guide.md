# AI-Assisted Engineering Environment Guide

## Overview
This document explains how to use the Trans-Track AI engineering environment: agents, skills, workflows, and standards.

---

## Quick Start: Which Agent for Common Tasks

| Task | Agent to Invoke |
|------|-----------------|
| Plan a new feature, architecture decision, or sprint | `trans-track-architect` |
| Build/modify REST API, auto-deduction engine, webhooks | `backend-api-dev` |
| Build/modify React UI (PublicTracker, GatePanel, OICDashboard, Executive) | `frontend-react-dev` |
| Database schema changes, migrations, indexes, Docker | `db-devops-engineer` |
| Security audit, RBAC, JWT, SQL injection review | `sec-auth-specialist` |
| UI/UX review against Figma, 3G performance, accessibility | `uiux-reviewer` |
| Debug crash, SQL error, React render loop, API timeout | `debug-troubleshooter` |
| Write tests, API integration, 3G throttling, gate rule validation | `qa-testing-engineer` |
| Generate feature documentation, update README | `feature-doc-reviewer` |

**Rule**: Always start with `trans-track-architect` for multi-domain tasks. It will delegate.

---

## Available Skills (OpenCode + Superpowers)

### Core Engineering Skills
| Skill | Purpose |
|-------|---------|
| `api-design` | REST resource naming, status codes, pagination, versioning |
| `backend-patterns` | Node/Express/Next.js API routes, data access |
| `database-migrations` | Safe, reversible PostgreSQL migrations |
| `postgres-patterns` | Query optimization, schema design, RLS, indexes |
| `frontend-patterns` | React/Next.js components, state, render performance |
| `react-patterns` | Hooks discipline, server/client boundaries, Suspense |
| `react-performance` | 70+ optimization rules (waterfalls, bundle, re-renders) |
| `vite-patterns` | Vite config, plugins, HMR, SSR, library mode |

### Quality & Process Skills
| Skill | Purpose |
|-------|---------|
| `code-review` | Quality, security, maintainability review |
| `security-review` | Auth, input handling, secrets, endpoints, payments |
| `systematic-debugging` | Root-cause analysis before fixes |
| `verification-loop` | 6-phase verification (build, typecheck, lint, test, security, diff) |
| `tdd-workflow` | Test-first: fail → green → refactor (80%+ coverage) |
| `e2e-testing` | Playwright Page Object Model, CI integration |
| `browser-qa` | Automated UI verification, Core Web Vitals, axe-core |

### Architecture & Planning Skills
| Skill | Purpose |
|-------|---------|
| `architecture-decision-records` | Numbered ADRs in `docs/adr/` |
| `change-impact` | Cross-module impact analysis before changes |
| `intent-driven-development` | Acceptance criteria before implementation |
| `writing-plans` | Implementation plans from specs |
| `codebase-onboarding` | Generate onboarding guide + CLAUDE.md |

### Specialized Skills
| Skill | Purpose |
|-------|---------|
| `design-system` | Extract tokens, score visual consistency |
| `make-interfaces-feel-better` | Polish spacing, typography, motion, hit areas |
| `accessibility` / `frontend-a11y` | WCAG 2.2 AA, ARIA, keyboard, screen readers |
| `docker-patterns` | Dockerfile, Compose, security, networking |
| `deployment-patterns` | CI/CD, health checks, rollback, production readiness |

### Design & UI Skills (Installed)
| Skill | Location | Purpose |
|-------|----------|---------|
| `design-taste-frontend` | `~/.agents/skills/design-taste-frontend` | **Production-grade frontend** (figma.com/x.ai level) — hero entrance, dealt moments, equal edges, real photos, hover micro-animations, gate checker |
| `design` | `~/.agents/skills/design` | **Unified design** — brand, tokens, UI styling (shadcn/ui+Tailwind), logo (55 styles, Gemini), CIP (50 deliverables), slides, banners, social photos, icons (15 styles, Gemini 3.1 Pro) |
| `ui-ux-pro-max` | `~/.agents/skills/design` | **Design intelligence** — critique, best practices, style/palette guidance, works text-only |

### Meta Skills
| Skill | Purpose |
|-------|---------|
| `brainstorming` | Clarify requirements before building |
| `subagent-driven-development` / `executing-plans` | Plan execution patterns |
| `ponytail` | Minimal viable implementation (lite/full/ultra) |

---

## How Agents Delegate Work

```
User Request
    ↓
trans-track-architect (Orchestrator)
    ├─ Analyzes task, identifies domains
    ├─ Creates/updates plan in docs/superpowers/plans/
    ├─ Delegates to specialist(s) with file scope
    │    ├─ backend-api-dev → server/routes/, server/services/
    │    ├─ frontend-react-dev → client/src/
    │    ├─ db-devops-engineer → schema/, docker/
    │    └─ (reviewers validate, don't implement)
    ├─ Collects reports: assumptions, files changed, blockers
    ├─ Routes to reviewers:
    │    ├─ sec-auth-specialist → auth/security changes
    │    ├─ uiux-reviewer → frontend changes
    │    └─ qa-testing-engineer → all changes (runs tests)
    └─ Confirms completion, updates documentation
```

**Key Files Referenced**:
- `docs/workflows/agent-coordination.md` — full rules
- `docs/architecture/engineering-standards.md` — code standards
- `docs/workflows/ui-reconstruction.md` — screenshot → React workflow

---

## UI Reconstruction Capability

### Purpose
Convert the 7 PNG screenshots in `Docs/` into React components matching the project's stack.

### Screenshots → Target Views
| Screenshot | Target Component |
|------------|-----------------|
| `Client Home.jpg` | `PublicTracker.jsx` (public waybill lookup) |
| `Login staff.jpg` | Auth pages / login form |
| `menu.jpg` | Navigation / layout structure |
| `OIC.jpg` | `OICDashboard.jsx` (dispatch, driver ETA) |
| `Executive report.jpg` | `Executive.jsx` (capacity board) |
| `SMS .jpg` | SMS fallback UI for driver tracking |
| `TTS_figma.jpg` | Design system reference |

### Workflow (see `docs/workflows/ui-reconstruction.md`)
1. **Analyze** — Human describes layout, spacing, colors, components
2. **Tokens** → `docs/ui-reconstruction/design-tokens.json`
3. **Hierarchy** → `docs/ui-reconstruction/component-hierarchy.md`
4. **Implement** — `frontend-react-dev` builds in `client/src/`
5. **Run & Capture** — Playwright screenshots at 3 breakpoints
6. **Compare** → `docs/ui-reconstruction/comparison-report.md`
7. **Iterate** until acceptable fidelity

### Constraints
- AI cannot see images — human must describe or provide tool access
- Never claim pixel-perfect without visual comparison evidence
- Respect existing stack (React + Vite + Tailwind)
- 3G-first: minimal bundle, lazy load, no heavy graphics

### To Invoke
```
"Use the UI Reconstruction workflow to build [view name] from [screenshot name]"
```
Orchestrator → `frontend-react-dev` (implements) → `uiux-reviewer` (validates) → `qa-testing-engineer` (tests 3G)

---

## Extending the System for Future Projects

### Adding a New Agent
1. Create `.opencode/agents/<name>.md` with:
   - `name`, `description`, `mode` (primary/subagent), `model`, `temperature`, `tools`
   - Clear responsibilities, file ownership, associated skills
2. Update `docs/workflows/agent-coordination.md` with new row in ownership table
3. Test delegation from `trans-track-architect`

### Adding a New Skill
1. Create skill directory or install from registry
2. Define: name, description, activation conditions, workflow, outputs, limitations
3. Reference in relevant agent's `Associated Installed Skills` list

### Adding a New Workflow
1. Create `docs/workflows/<name>.md` with purpose, steps, constraints, tools, outputs
2. Reference in relevant agent documentation
3. Add to this guide's "Available Skills" or "Workflows" sections

### Reusing in Another Project
Copy these directories:
- `.opencode/agents/` — agent definitions
- `.opencode/skills/` — custom skills (if any)
- `docs/workflows/` — coordination, UI reconstruction, any custom workflows
- `docs/architecture/engineering-standards.md` — adapt stack-specific sections

Then run `codebase-onboarding` skill in the new repo to generate project-specific `CLAUDE.md`.

---

## Verification Checklist

After any significant work, run:
- [ ] `npm run lint` (or equivalent)
- [ ] `npm run typecheck` (if TypeScript)
- [ ] `npm test` (backend + frontend)
- [ ] Security grep: no hardcoded secrets, SQL concatenation
- [ ] Diff review: no unintended changes
- [ ] Reviewer sign-off for domain (security, UI, QA)

See `verification-loop` skill for full 6-phase process.

---

## MCP Servers Configured
| MCP | Purpose | Status |
|-----|---------|--------|
| `playwright` | Browser automation, screenshots, visual testing | ✅ Configured |
| `context7` | Live documentation lookup | ✅ Configured |
| `memory` | Persistent memory across sessions | ✅ Configured |
| `sequential-thinking` | Chain-of-thought reasoning | ✅ Configured |
| `firecrawl` | Web scraping | ✅ Configured (needs API key) |
| `github` | GitHub operations | ✅ Configured (needs PAT) |

## Setup Required
```bash
# 1. Google AI Studio API key (FREE) for design skill logo/CIP/icon generation
#    Get at: https://aistudio.google.com/apikey
export GEMINI_API_KEY="your-key-from-aistudio.google.com"

# 2. Playwright MCP already configured in ~/.config/opencode/mcp-configs/
#    Verify: npx @playwright/mcp --help
#    Tools: browser_navigate, browser_screenshot, browser_click, browser_type, etc.

# 3. Design skill prerequisites (already installed)
pip install google-genai pillow --break-system-packages

# 4. Optional: MuAPI / UberLLM for alternative image generation
# export MUAPI_API_KEY="your-key"
# export UBERLLM_API_KEY="your-key"
```

## Support Files Reference

| File | Purpose |
|------|---------|
| `.opencode/agents/*.md` | 9 agent definitions |
| `docs/workflows/agent-coordination.md` | Delegation rules, file ownership |
| `docs/workflows/ui-reconstruction.md` | Screenshot → React workflow |
| `docs/architecture/engineering-standards.md` | Code, API, DB, security, testing standards |
| `docs/architecture/SECURITY_ARCHITECTURE.md` | RBAC, audit, ACID/BASE analysis |
| `docs/api/contracts.md` | API request/response examples (create if missing) |
| `schema/init.sql` | 11-table PostgreSQL schema (source of truth) |
| `schema/README.md` | Database documentation |
| `docs/superpowers/plans/` | Implementation plans (checkbox tracking) |
| `docs/features/` | Auto-generated feature documentation |
| `docs/ui-reconstruction/description-template.md` | Screenshot analysis template |