# Delegation Optimization Research

Tracking experiments and findings for optimizing Hermes subagent delegation.

## Current Config

- **Provider**: custom:9router-(localhost:20128)
- **Model**: kk/kilo-auto/free
- **Reasoning**: medium
- **Max children**: 3
- **Orchestrator**: enabled

## OpenCode Model Mapping (reference)

| Role | Model | Reasoning |
|------|-------|-----------|
| coder | kk/poolside/laguna-m.1:free | high |
| designer | kk/poolside/laguna-m.1:free | medium |
| planner | kk/nvidia/nemotron-3-super-120b-a12b:free | high |
| researcher | kk/nvidia/nemotron-3-super-120b-a12b:free | high |
| reviewer | kk/poolside/laguna-m.1:free | medium |
| tester | kk/kilo-auto/free | medium |
| explorer | kk/kilo-auto/free | low |

## Experiments

### Run 1 — 2026-05-25: Context Compression + Generalize-First

**Research sources**:
- Epsilla (2026): "3 Essential Sub-Agent Patterns" — context compression is the PRIMARY value of sub-agents (90%+ token reduction), NOT parallelism
- Microsoft Azure Architecture: fundamental orchestration patterns (sequential, concurrent, group chat, handoff)
- Hermes Agent delegation docs: subagents get zero parent context, everything must be in goal+context fields

**Findings**:
→ **Context over Concurrency**: The real win is lean parent context, not parallel execution. Sub-agents should return ~750 token summaries, not full execution traces.
→ **Generalize First, Specialize Later**: Start with a single strong model (kk/kilo-auto/free). Only create specialized sub-agents when evidence demands it (e.g., a task needs a different model's capabilities).
→ **Scheduled Pattern**: Cronjobs ARE the scheduled sub-agent pattern — perfectly aligned.

**Config changes applied**:
- `max_spawn_depth: 1→2` — enables orchestrator→worker nesting (one level)
- `child_timeout_seconds: 1200→1800` — more runway for complex builds
- `max_iterations: 100→150` — deeper subagent work per call

**Next research topic**: Task decomposition strategies — how to split complex builds into optimal subagent chunks.

## Run 2 — 2026-05-25: Task Decomposition Strategies

**Pattern:** [LLM subagent task decomposition](https://www.ai21.com/glossary/foundational-llm/task-decomposition/)

Key finding: AOrchestra paper (arXiv 2602.03786) proposes sub-agents as ⟨Instruction, Context, Tools, Model⟩ tuples — dynamic specialization per-task instead of static role assignment.

**Insight applied:**
- AOrchestra's 4-tuple abstraction → I should ensure each delegated subtask gets: (1) precise instruction, (2) only relevant context (no noise), (3) pinned toolset, (4) appropriate model.
- Current config: `max_iterations: 100`, `child_timeout_seconds: 1200`, `max_concurrent_children: 3`, `max_spawn_depth: 1`
- The single spawn depth is good for now — prevents runaway sub-agent chains. Could increase `max_concurrent_children` to 4 for parallel subtasks, but 3 is safe for current task complexity.
- Key improvement: structure instructions with (a) primary goal, (b) subtask breakdown, (c) explicit output contract — matching the AOrchestra tuple approach.

## Run 3 — 2026-05-26: Sub-Agent Pattern Synchronization

**Source:** Epsilla (March 2026) — [3 Essential Sub-Agent Patterns](https://www.epsilla.com/blogs/2026-03-14-ai-sub-agent-patterns)

**Key findings:**
→ **Three core patterns**: Sync (blocking, parent waits), Async (fire-and-forget, parallel), Scheduled (future execution with context rehydration)
→ **Tool design trick**: Use 2 separate tools (schedule A / schedule B) vs 1 tool with mode param — models better at selection (pick from list) than param optimization → cleaner logs, tracing, debugging
→ **Context rehydration**: Scheduled sub-agents should rehydrate from persistent store (DB / semantic graph) at execution time, not carry stale context forward
→ **Self-iterating agents**: Next frontier — agents that iterate on themselves, constrained only by cost/budget
→ **Context hydration pattern**: Cron jobs = scheduled sub-agents. This cronjob IS a scheduled sub-agent pattern — it rehydrates by reading files/DB at execution time, which matches best practice.

**Config changes applied:** None — current setup already follows best practices (scheduled execution with context rehydration from filesystem). The "2 tools vs 1 tool with mode" insight is noted for future skill design but not applicable to current config.

**Next topic:** Self-improvement loops — agent iterating on own workflow.
