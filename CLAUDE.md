# Claude Code Instructions

For every project, write a detailed ForRajdeep.md file that explains the whole project in plain language. 

Explain the technical architecture, the structure of the codebase and how the various parts are connected, the technologies used, why we made these technical decisions, and lessons I can learn from it (this should include the bugs we ran into and how we fixed them, potential pitfalls and how to avoid them in the future, new technologies used, how good engineers think and work, best practices, etc). 

It should be very engaging to read; don't make it sound like boring technical documentation/textbook. Where appropriate, use analogies and anecdotes to make it more understandable and memorable.

## Skill Integration Paradigm

This project includes a suite of skills that work together in a structured workflow:

```
/brainstorm → /plan → /execute → /review
```

### Workflow

| Skill | Input | Output | Purpose |
|-------|-------|--------|---------|
| `/brainstorm` | Problem or feature idea | `ARCHITECTURE.md` | Collaborative design discussions, explores 2-4 approaches, documents final architecture |
| `/plan` | `ARCHITECTURE.md` | `EXECUTION_PLAN.md` | Creates phased execution roadmap with tasks, dependencies, and success criteria |
| `/execute` | `EXECUTION_PLAN.md` | `TASKS.md` + Implementation | Extracts tasks, implements sequentially, lints/tests after each task, fixes until passing |
| `/review` | Implemented code | Updated `EXECUTION_PLAN.md` | Comprehensive code review, failure analysis, adds fix tasks back to plan |

### Execution Loop

The `/execute` skill follows an iterative quality loop:

```
For each task:
  1. Implement the task
  2. Run lint & tests
  3. If issues found → fix and re-test (repeat until clean)
  4. Mark task complete in TASKS.md
  5. Move to next task
```

### Review Integration

After `/execute` completes, `/review` analyzes the code and can add a new "Code Review Fixes" phase to the execution plan, enabling another `/execute` cycle to address any issues found.
