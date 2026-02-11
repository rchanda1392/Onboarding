---
name: brainstorm
description: Collaborative solution architecture and design discussions. Use for planning new features, mid-execution pivots, resolving blockers, or re-evaluating decisions at any phase.
argument-hint: [problem, feature, blocker, or decision to discuss]
allowed-tools: AskUserQuestion, Read, Grep, Glob, Write, Edit
---

# Solution Architecture Brainstorming

I'll help you design and architect solutions through collaborative discussion. This skill works for **new projects** AND **mid-execution decisions** - use it anytime you need to think through a problem.

---

## Detect Context First

When invoked, I first determine the context by checking for existing project artifacts:

```
Check for:
├── ARCHITECTURE.md      → Existing architecture decisions
├── EXECUTION_PLAN.md    → Active execution plan
├── TASKS.md             → Task progress
└── User's argument      → What they want to brainstorm
```

### Context Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Fresh Start** | No existing docs, or explicit new feature | Full discovery interview → New ARCHITECTURE.md |
| **Mid-Execution Pivot** | Has EXECUTION_PLAN.md + user mentions change/problem | Focused interview on change → Update docs |
| **Blocker Resolution** | User mentions stuck/blocked/issue during execution | Problem-focused interview → Solution decision |
| **Scope Refinement** | Discovered complexity during execution | Clarify scope → Update ARCHITECTURE.md |
| **Technical Decision** | Need to choose between approaches mid-stream | Trade-off analysis → Document decision |
| **Requirements Change** | New requirements or constraints emerged | Impact analysis → Update all affected docs |

---

## Core Interview Framework

Regardless of mode, always use AskUserQuestion to achieve clarity on these six dimensions:

### The Six Dimensions of Clarity

#### 1. Requirements
*What exactly needs to be built? What problems does it solve?*

Questions to ask:
- What specific problem are we solving right now?
- What does "done" look like for this?
- What are the must-haves vs nice-to-haves?
- What should this explicitly NOT do?
- Has anything changed from the original requirements?

#### 2. Constraints
*Performance, scale, security, budget, timeline considerations*

Questions to ask:
- What are the hard constraints we can't violate?
- Are there performance requirements (latency, throughput)?
- What's the timeline pressure?
- Are there budget or resource limitations?
- Security or compliance requirements?

#### 3. Existing Infrastructure
*What's already in place that we can leverage?*

Questions to ask:
- What have we already built that we can reuse?
- What existing services/systems can we leverage?
- What patterns exist in the codebase we should follow?
- What's working well that we should preserve?
- What existing tools solve part of this problem?

#### 4. Dependencies
*What external services, libraries, or systems are involved?*

Questions to ask:
- What external APIs or services does this need?
- What libraries or packages are required?
- What other teams or systems do we depend on?
- Are there any risky or unreliable dependencies?
- What happens if a dependency fails or changes?

#### 5. Simplification
*Can we remove dependencies? Can we use existing tools?*

Questions to ask:
- Is there a simpler way to achieve this?
- Can we remove or defer any dependencies?
- Can we use something that already exists instead of building?
- What's the simplest thing that could possibly work?
- Are we over-engineering this?

#### 6. Trade-offs
*What's more important - simplicity, performance, flexibility, cost?*

Questions to ask:
- What's more important: speed to market or perfection?
- Would you trade complexity for performance?
- Is flexibility worth the added complexity?
- Build vs buy vs open source preference?
- Short-term hack vs long-term solution?

---

## Mode-Specific Workflows

### Mode A: Fresh Start (New Feature/Project)

**When**: No existing ARCHITECTURE.md, or user explicitly wants to design something new

**Workflow**:
1. **Full Discovery Interview** - Cover all six dimensions thoroughly
2. **Option Exploration** - Present 2-4 architectural approaches
3. **Iterative Refinement** - Narrow down with user
4. **Documentation** - Create new ARCHITECTURE.md

**Output**: `ARCHITECTURE.md`

---

### Mode B: Mid-Execution Pivot

**When**: EXECUTION_PLAN.md exists and user mentions a change, problem, or wants to reconsider

**Workflow**:

1. **Read Current State**
   - Read ARCHITECTURE.md, EXECUTION_PLAN.md, TASKS.md
   - Understand what's been built, what's in progress, what's pending

2. **Focused Interview** (use AskUserQuestion)
   ```
   I see you're in the middle of execution. Let me understand the situation:

   1. What triggered this brainstorm? (blocker, new requirement, concern?)
   2. What specifically needs to change or be decided?
   3. How does this affect what's already built?
   4. What constraints have changed since we started?
   ```

3. **Impact Analysis**
   - What completed work is affected?
   - What pending tasks need to change?
   - What new tasks are needed?

4. **Options with Migration Path**
   ```
   Option A: [Approach]
   - Changes to existing code: [what needs modification]
   - New work required: [additional tasks]
   - Risk: [what could go wrong]

   Option B: [Approach]
   - Changes to existing code: [what needs modification]
   - New work required: [additional tasks]
   - Risk: [what could go wrong]
   ```

5. **Update Documents**
   - Update ARCHITECTURE.md with new decisions
   - Add "Decision Log" entry with date and rationale
   - Flag tasks in EXECUTION_PLAN.md that need revision

**Output**: Updated ARCHITECTURE.md + guidance for EXECUTION_PLAN.md updates

---

### Mode C: Blocker Resolution

**When**: User is stuck on a specific task or technical problem

**Workflow**:

1. **Understand the Blocker** (use AskUserQuestion)
   ```
   Let's work through this blocker:

   1. What task are you stuck on?
   2. What have you tried so far?
   3. What's the exact error or issue?
   4. What would unblock you?
   ```

2. **Investigate**
   - Read relevant code files
   - Check existing architecture decisions
   - Look for similar patterns in codebase

3. **Solution Options**
   Present 2-3 ways to resolve:
   ```
   To unblock this, we could:

   1. [Quick fix] - [description, trade-offs]
   2. [Proper solution] - [description, trade-offs]
   3. [Workaround] - [description, trade-offs]

   Which approach fits your situation?
   ```

4. **Document Decision**
   - Add to ARCHITECTURE.md "Decision Log" section
   - Note the problem, options considered, and chosen solution

**Output**: Solution decision + Decision Log entry

---

### Mode D: Scope Refinement

**When**: Discovered the problem is bigger/different than expected during execution

**Workflow**:

1. **Understand the Discovery** (use AskUserQuestion)
   ```
   It sounds like we've learned something new. Help me understand:

   1. What did we discover that changes things?
   2. Is the original scope still achievable?
   3. What needs to be added, removed, or changed?
   4. Does this affect the timeline or constraints?
   ```

2. **Reassess Requirements**
   - Which original requirements still apply?
   - What new requirements emerged?
   - What can be descoped to stay on track?

3. **Simplification Check** (use AskUserQuestion)
   ```
   Before we expand scope, let's check:

   1. Is there a simpler way to handle this discovery?
   2. Can we defer the new complexity to a later phase?
   3. What's the minimum change needed to proceed?
   4. Are we gold-plating or is this truly necessary?
   ```

4. **Update Architecture**
   - Revise scope in ARCHITECTURE.md
   - Add discovered complexity to "Lessons Learned"
   - Update requirements section

**Output**: Updated ARCHITECTURE.md with refined scope

---

### Mode E: Technical Decision

**When**: Need to choose between technical approaches mid-execution

**Workflow**:

1. **Frame the Decision** (use AskUserQuestion)
   ```
   Let's clarify the decision:

   1. What exactly do we need to decide?
   2. What are the options you're considering?
   3. What factors matter most for this decision?
   4. Are there constraints that eliminate any options?
   ```

2. **Trade-off Analysis**
   For each option, evaluate:
   - Complexity (implementation effort)
   - Performance impact
   - Maintainability
   - Dependencies introduced
   - Risk level
   - Alignment with existing architecture

3. **Recommendation**
   ```
   Based on our constraints and goals:

   Recommended: [Option X]
   Reason: [Why this fits best]

   Trade-off accepted: [What we're giving up]
   ```

4. **Document in Decision Log**
   Add to ARCHITECTURE.md:
   ```markdown
   ### Decision: [Title]
   **Date**: [date]
   **Context**: [What prompted this decision]
   **Options Considered**:
   1. [Option A] - rejected because [reason]
   2. [Option B] - rejected because [reason]
   **Decision**: [Chosen option]
   **Rationale**: [Why]
   **Consequences**: [What this means going forward]
   ```

**Output**: Decision Log entry in ARCHITECTURE.md

---

### Mode F: Requirements Change

**When**: New requirements or constraints have emerged

**Workflow**:

1. **Capture the Change** (use AskUserQuestion)
   ```
   Let's understand the new requirements:

   1. What new requirement or constraint has emerged?
   2. Where did this come from? (stakeholder, technical discovery, etc.)
   3. Is this a must-have or nice-to-have?
   4. Does this replace or add to existing requirements?
   ```

2. **Impact Assessment**
   - Does this change the architecture?
   - Which components are affected?
   - What completed work needs revision?
   - What pending tasks are impacted?

3. **Evaluate Options** (use AskUserQuestion)
   ```
   We have a few ways to handle this:

   1. Accommodate fully - [impact description]
   2. Partial accommodation - [what we'd defer]
   3. Push back - [if this seems unreasonable]

   What's your preference?
   ```

4. **Update All Affected Documents**
   - ARCHITECTURE.md: Update requirements section
   - EXECUTION_PLAN.md: Add/modify tasks (or flag for /plan to regenerate)
   - Add to Decision Log with rationale

**Output**: Updated ARCHITECTURE.md + guidance for plan updates

---

## Documentation Updates

### For Fresh Start
Create new `ARCHITECTURE.md` with full template (see below)

### For Mid-Execution Modes
Update existing `ARCHITECTURE.md` by adding:

```markdown
---

## Decision Log

### [Date]: [Decision Title]
**Context**: [What situation prompted this]
**Mode**: [Pivot/Blocker/Scope/Technical/Requirements]
**Options Considered**:
1. [Option] - [outcome]
2. [Option] - [outcome]
**Decision**: [What we chose]
**Rationale**: [Why]
**Impact**: [What changes as a result]

---
```

---

## ARCHITECTURE.md Full Template

```markdown
# Architecture: [Feature Name]

## Problem Statement
[Crystal clear problem statement]

## Requirements

### Must Have
- [Requirement 1]
- [Requirement 2]

### Nice to Have
- [Requirement 3]

### Out of Scope
- [What this won't do]

## Constraints
- **Performance**: [requirements]
- **Scale**: [expectations]
- **Security**: [requirements]
- **Timeline**: [pressure]
- **Budget**: [limitations]

## Users
- Primary: [who]
- Secondary: [who]

## Solution Overview
[High-level description]

## Architecture
[Diagram or description]

## Components

### Component 1
- Purpose:
- Responsibilities:
- Dependencies:

## Data Flow
[How data moves through the system]

## Dependencies

| Dependency | Purpose | Justification |
|------------|---------|---------------|
| [Dep 1] | [Why needed] | [Why this choice] |

## Existing Infrastructure Leveraged
- [What we're reusing]
- [Patterns we're following]

## Simplification Decisions
- [What we chose NOT to build]
- [What we deferred]
- [Complexity we avoided]

## Trade-offs Accepted
| Trade-off | Chose | Over | Reason |
|-----------|-------|------|--------|
| [Area] | [This] | [That] | [Why] |

## Security Considerations
[Auth, data protection, etc.]

## Success Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]

## Alternatives Considered

### [Alternative 1]
- Rejected because: [reason]

## Decision Log

[Entries added during execution]

## Open Questions
- [Any remaining unknowns]

## Next Steps
1. Run `/plan` to create execution plan
2. [Other next steps]
```

---

## Principles I Follow

1. **Context-Aware**: Detect whether this is fresh or mid-execution
2. **Interview First**: Always use AskUserQuestion to understand before proposing
3. **Six Dimensions**: Always cover Requirements, Constraints, Existing Infrastructure, Dependencies, Simplification, Trade-offs
4. **Simplicity Bias**: Always look for the simpler path
5. **Document Decisions**: Every significant decision gets logged
6. **Preserve Progress**: In mid-execution modes, minimize disruption to completed work
7. **Crystal Clarity**: No ambiguity in the final documented outcome

---

## Integration with Workflow

```
Fresh project:
  /brainstorm → ARCHITECTURE.md → /plan → /execute → /review

Mid-execution:
  /execute → [issue arises] → /brainstorm → Updated docs → /execute continues

Continuous:
  Use /brainstorm anytime you need to think through a problem
```

---

**Ready to brainstorm?** Tell me what you're working through - whether it's a new idea, a mid-execution decision, a blocker, or a scope question. I'll adapt my approach to your situation.
