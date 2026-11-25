# Agent Coordination Rules

## Orchestration Model
**Centralized Orchestration** — The **`trans-track-architect`** (Primary Orchestrator) is the sole entry point for multi-agent tasks. All delegation flows through this agent. Specialists are stateless; they receive a task, execute, and report back. The orchestrator maintains project context and plan state.

## Agent Roles & File Ownership

| Agent | Mode | Primary Directories | Can Modify | Read-Only Review |
|-------|------|---------------------|------------|------------------|
| `trans-track-architect` | Primary | All (oversight) | `docs/`, plans | All |
| `backend-api-dev` | Subagent | `server/routes/`, `server/services/`, `server/middleware/` | Yes | `schema/`, `docs/api/` |
| `frontend-react-dev` | Subagent | `client/src/` | Yes | `docs/frontend/`, `docs/ui-reconstruction/` |
| `db-devops-engineer` | Subagent | `schema/`, `docker/`, CI configs | Yes | `server/db.js` |
| `sec-auth-specialist` | Subagent (Reviewer) | `server/middleware/authMiddleware.js`, RBAC | **No** | All auth/security files |
| `uiux-reviewer` | Subagent (Reviewer) | `client/src/` | **No** | All frontend files |
| `qa-testing-engineer` | Subagent (Reviewer) | `tests/`, `server/`, `client/` | **No** | All testable code |
| `debug-troubleshooter` | Subagent | Any (debugging) | Yes (fixes only) | N/A |
| `feature-doc-reviewer` | Subagent | `docs/features/`, `README.md` | Yes (docs only) | All implemented features |

## Workflow Mechanics

### 1. Plan Format (Ticket-Based)
All multi-step work is tracked in **`docs/superpowers/plans/YYYY-MM-DD-<slug>.md`** using checkbox syntax:
```markdown
## Task 1: Add health check endpoint
- [ ] Step 1.1: Create route in server/routes/health.js
- [ ] Step 1.2: Register route in server/server.js
- [ ] Step 1.3: Add test in tests/health.test.js
```
- Orchestrator creates/updates the plan
- Specialists claim tasks by checking boxes and adding their agent name
- Completion requires all checkboxes + reviewer sign-offs

### 2. Task Granularity
- **Architect breaks down** features into atomic, independently testable tasks
- **One specialist per task** — no parallel agents on same files
- **Tasks reference contracts** (`docs/api/contracts.md`, `schema/init.sql`) to avoid ambiguity

### 3. Communication Protocol (File-Based)
```
User Request → trans-track-architect
    → Creates/updates plan in docs/superpowers/plans/
    → Delegates to specialist with: task ID, file scope, acceptance criteria
    → Specialist works, updates plan with: assumptions, files changed, test evidence
    → Reviewer validates (adds sign-off to plan)
    → Orchestrator marks task complete, updates architecture docs if needed
```
- All handoffs via markdown plans (auditable, version-controlled)
- No direct agent-to-agent messages — everything in the plan

### 4. Review Gates (Mandatory)
| Change Type | Required Reviewers |
|-------------|-------------------|
| Auth, RBAC, JWT, crypto, secrets | `sec-auth-specialist` |
| Frontend components, pages, styles | `uiux-reviewer` |
| **All changes** | `qa-testing-engineer` (runs test suite) |
| Database schema, migrations | `db-devops-engineer` + `qa-testing-engineer` |

Reviewers **block completion** — they add `Reviewed by @agent: PASS/FAIL` to the plan task. No merge without all required PASS.

### 5. State Management
- **Orchestrator**: Persistent context (remembers project state, decisions, ADRs)
- **Specialists**: Stateless per task (fresh context, given only plan + relevant files)
- **Reviewers**: Stateless per review (given diff + plan task)

## Delegation Rules

1. **Orchestrator selects specialist** based on task domain
2. **One specialist per domain** per task — no parallel agents on same files
3. **Specialist reports** in the plan:
   - Assumptions made
   - Files modified (exact paths)
   - Dependencies/blockers
   - Test evidence (commands run, output)
4. **Orchestrator reviews** before marking complete
5. **Reviewers validate** before merge (see Review Gates)

## Conflict Prevention

- **File locking**: Specialist declares target files at task start (in plan)
- **No overlapping writes**: Orchestrator ensures disjoint file sets per task
- **Shared contracts**: API types in `docs/api/contracts.md`, DB schema in `schema/init.sql`
- **Integration points**: Defined in `docs/architecture/integration-points.md`

## Escalation

- Specialist encounters out-of-scope issue → reports to Orchestrator (updates plan)
- Reviewer finds critical issue → blocks completion (FAIL in plan), reports to Orchestrator
- Orchestrator cannot resolve → escalates to User (adds `BLOCKED: <reason>` to plan)

## Prohibited Patterns

- ❌ Multiple agents writing to same file simultaneously
- ❌ Specialist modifying another domain's files without delegation
- ❌ Reviewer making implementation changes
- ❌ Skipping reviewer validation for security/frontend/critical paths
- ❌ Orchestrator implementing details (delegate instead)
- ❌ Specialist skipping test evidence in report
- ❌ Plan updates without checkbox tracking

## Skill Usage Patterns

| Situation | Skill to Invoke |
|-----------|-----------------|
| Planning a feature/sprint | `writing-plans` + `brainstorming` |
| Implementing plan tasks | `executing-plans` or `subagent-driven-development` |
| Debugging a failure | `systematic-debugging` |
| Before claiming done | `verification-before-completion` |
| Writing tests first | `tdd-workflow` |
| Code review | `code-review` (or reviewer agents) |
| Security-sensitive change | `security-review` |
| Architecture decision | `architecture-decision-records` |