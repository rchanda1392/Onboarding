# Claude Code Instructions

For every project, write a detailed ForRajdeep.md file that explains the whole project in plain language. 

Explain the technical architecture, the structure of the codebase and how the various parts are connected, the technologies used, why we made these technical decisions, and lessons I can learn from it (this should include the bugs we ran into and how we fixed them, potential pitfalls and how to avoid them in the future, new technologies used, how good engineers think and work, best practices, etc). 

It should be very engaging to read; don't make it sound like boring technical documentation/textbook. Where appropriate, use analogies and anecdotes to make it more understandable and memorable.

## Agent & Skill Integration Paradigm

### Primary Workflow: `/start` (Agent)

The recommended way to work on this project is the `/start` orchestrator — a custom **agent** (`.claude/agents/start/`) that manages the full project lifecycle:

```
/start → detects project state → runs the right phase automatically
```

`/start` uses **documents as a state machine**. It checks which files exist (VISION.md, ROADMAP.md, ARCHITECTURE.md, etc.) to determine where the project is and what to do next. This means it resumes seamlessly across sessions.

**Lifecycle:**
```
VISION → ROADMAP → [for each version: BRAINSTORM → PLAN → EXECUTE → REVIEW → RETRO] → next version
```

**Version-scoped documents** live in subdirectories (`mvp/`, `v1/`, `v2/`):
```
VISION.md              ← global product vision
ROADMAP.md             ← versioned milestones
mvp/ARCHITECTURE.md    ← per-version architecture
mvp/EXECUTION_PLAN.md  ← per-version plan
mvp/TASKS.md           ← per-version task tracking
mvp/RETRO_mvp.md       ← per-version retrospective
```

**User checkpoints** (where `/start` pauses for approval):
- Vision approval
- Roadmap approval
- Architecture approval (per version)
- Review triage (which severity levels to fix)
- Version completion (proceed / modify roadmap / stop)

**Special commands:**
- `/start status` — print a dashboard of current project state
- `/start [change request]` — triage a mid-flight change to the right level (vision/roadmap/architecture/task)

### Granular Skills (available for direct use)

The individual skills are still available when you need fine-grained control:

```
/brainstorm → /plan → /execute → /review
```

| Skill | Input | Output | Purpose |
|-------|-------|--------|---------|
| `/brainstorm` | Problem or feature idea | `ARCHITECTURE.md` | Collaborative design discussions, explores 2-4 approaches, documents final architecture |
| `/plan` | `ARCHITECTURE.md` | `EXECUTION_PLAN.md` | Creates phased execution roadmap with tasks, dependencies, and success criteria |
| `/execute` | `EXECUTION_PLAN.md` | `TASKS.md` + Implementation | Extracts tasks, implements sequentially, lints/tests after each task, fixes until passing |
| `/review` | Implemented code | Updated `EXECUTION_PLAN.md` | Comprehensive code review, failure analysis, adds fix tasks back to plan |

### Execution Loop

The `/execute` skill (and the execute phase within `/start`) follows an iterative quality loop:

```
For each task:
  1. Implement the task
  2. Run lint & tests
  3. If issues found → fix and re-test (repeat until clean)
  4. Mark task complete in TASKS.md
  5. Move to next task
```

### Review Integration

After execution completes, review analyzes the code and can add a new "Code Review Fixes" phase to the execution plan, enabling another execute cycle to address any issues found.
