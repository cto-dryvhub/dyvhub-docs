---
title: AI workflow
sidebar_position: 16
description: "How Cursor and Codex rules, agents, skills, and commands (/feature-plan, /project-manager) are set up in each repo, and what contributors should know."
---

# AI workflow

**What this page covers:** the AI-assistant setup checked into each repo: where the rules live, which agents and commands exist, how the plan-code-review loop runs, and what human contributors should know when AI helps with a change.

:::tip[In plain English]
Each repo carries a small "rulebook" that AI coding assistants (Cursor, Codex) read automatically. The rulebook says how to plan, where code goes, and what is never allowed. You do not need an AI to contribute, but if you use one here it will follow these rules, and your changes are reviewed against the same rules either way.
:::

## Where things live

Each repo has twin folders with matching semantics; use the one for your assistant.

| Assistant | Folder | Contents |
| --------- | ------ | -------- |
| Cursor | `.cursor/` | `rules/` (`.mdc`), `agents/`, `commands/`, `skills/`, `hooks/`, `hooks.json`, `settings.json`, `README.md` |
| Codex | `.codex/` | `rules/`, `agents/`, `prompts/`, `skills/`, `README.md` |
| Claude | `.claude/docs/` (dealer and marketplace) | Design token and UX reference docs; `CLAUDE.md` points to `AGENTS.md` |

`AGENTS.md` at each repo root is the contract every assistant must follow. Keep the `.cursor` and `.codex` trees aligned when you change one.

## Rules (always applied)

| Rule | What it enforces |
| ---- | ---------------- |
| `token-policy` | Concise, no-filler communication; **refine the request, then hand off** a compact spec; search before reading whole files; batch tool calls; optional internal XML blueprint for complex work |
| `compounding-dev-cycle` | Plan, Code, Review/Test, then Plan again for rework; each phase writes artifacts; explicit mode switching (Ask, Plan, Agent) |
| `core-standards` | Type safety, error handling, function design, naming, no hard-coded secrets |
| Stack rules | API: `nestjs-backend`, `api-routes-nestjs`, `typescript`. Dealer: `nextjs-frontend`, `nextjs-route-handlers`, `typescript`, `e2e-playwright` |

Rules in the API repo that matter most to contributors: layer boundaries, tenant safety, and the **Prisma CLI-only** rule (never hand-write `src/generated/prisma/**` or migration SQL; always run `npx prisma generate` after a schema change).

## Agents

Agents are role definitions an assistant can adopt for a phase.

| Repo | Primary implementer | Primary reviewer | Others |
| ---- | ------------------- | ---------------- | ------ |
| `dryvhub-api` | `backend-architect` | `backend-reviewer` | `tech-stack-researcher`, `technical-writer`. Frontend agents exist in the folder but are **out of scope** here |
| `dryvhub-dealer` | `frontend-architect` | `frontend-reviewer` | `e2e-runner` (when AC needs Playwright), `tech-stack-researcher`, `technical-writer` |
| `dryvhub-marketplace` | `frontend-architect` | `frontend-reviewer` | `e2e-runner` (only when AC require it), `tech-stack-researcher`, `technical-writer` |

User-level agents (architecture strategist, security engineer, performance engineer, requirements analyst, and others) may also be available in your personal setup.

## Commands

Commands are reusable prompts you invoke by name.

| Command | Purpose |
| ------- | ------- |
| `/feature-plan <slug>` | **Plan mode only.** Author `docs/plans/<slug>.md` (scope, AC, approach, tasks, risks). No code |
| `/project-manager docs/plans/<slug>.md` | Run the loop: implementer, then reviewer, then rework plan if Critical items, repeated until none remain |
| `/new-task` | Lightweight task breakdown without a plan file |
| `/code-cleanup`, `/code-optimize` | Refactor per the rules; optimize only after measuring |
| `/linear/apply-ticket <KEY>` | Read a Linear ticket, plan, implement, review (API repo also posts API docs back to the ticket) |
| `/linear/create-ticket`, `/linear/refine-spec` | Create or improve Linear tickets |
| API repo: `/api/api-new`, `/api/api-test` | Scaffold a NestJS endpoint (use-case, controller, DTOs) and generate Jest tests |
| Dealer and marketplace: `/frontend/page-new`, `component-new`, `hook-new`; `/api/route-handler-new`; `/e2e/e2e-test` | Scaffold UI pieces, a thin Route Handler, or a Playwright flow |

Typical use:

```text
/feature-plan vehicle-test-drive-notes
# review and lock the plan, then:
/project-manager docs/plans/vehicle-test-drive-notes.md
```

Codex uses the same ideas under `.codex/prompts/` with its own mode names: plan-before-execute (planning only), implementation (code and tests), and read-only review.

## Hooks (Cursor)

- All three repos run a `sessionStart` hook (`.cursor/hooks/session-init.sh`) that injects a reminder of the workflow rules into the assistant's context.
- The dealer repo additionally runs an audit script around shell execution and session end (`.cursor/hooks/audit.sh`); the API repo has `audit.sh` and `format.sh` scripts in `.cursor/hooks/`.
- Hooks are behavior helpers, not security boundaries.

## What contributors should know

- **The plan is the contract.** For anything beyond a trivial fix, write or update `docs/plans/<feature>.md` first. See [Adding a feature](/docs/developers/adding-a-feature).
- **AI output is reviewed like any other code.** Zero Critical review findings is required regardless of who (or what) wrote it.
- **Hard rules assistants must obey**, and you should too:
  - Tenant identity comes from the authenticated user only.
  - Never commit `.env*` files or paste real secrets into prompts, plans, or docs.
  - Prisma Client and migrations come from the CLI, not hand-written files.
  - Respect layer boundaries; reject changes that violate them.
  - `dryvhub-marketplace` never shows private dealer fields or computes eligibility.
- **Keep prompts short and specific.** The `token-policy` rule favors one clear objective, scope, constraints, and acceptance criteria over long restatements.
- **E2E is on demand.** Playwright runs are triggered by acceptance criteria or by you, not automatically after every change.
- **Review is read-only by default.** Reviewers produce a rework list and do not edit code unless asked.
- **Design docs are duplicated per assistant** in the marketplace repo (`.cursor/docs`, `.codex/docs`, `.claude/docs`); keep them in sync.
- **Docs-only work** goes on a `document/*` branch. See [Git workflow](/docs/developers/git-workflow).

## Related pages

- [Adding a feature](/docs/developers/adding-a-feature)
- [Conventions](/docs/developers/conventions)
- [Git workflow](/docs/developers/git-workflow)
- [Contributing to docs](/docs/developers/contributing-to-docs)
