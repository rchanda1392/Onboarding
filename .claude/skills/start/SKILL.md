---
name: start
description: Full project lifecycle orchestrator. Manages vision, roadmap, versioned building (brainstorm → plan → execute → review), retrospectives, and incremental delivery from MVP through successive versions. Picks up where you left off automatically.
argument-hint: [optional: feature idea, change request, or 'status' to see current state]
allowed-tools: Agent
---

# Start Skill (Thin Wrapper)

When invoked, immediately delegate to the **start agent** by using the Agent tool:

- Use subagent_type: "general-purpose"
- In the prompt, instruct it to read `.claude/agents/start/SKILL.md` and follow its instructions
- Pass through any user arguments verbatim

Do NOT do any work yourself. Your only job is to launch the start agent.
