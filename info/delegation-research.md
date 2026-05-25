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

*(Each run logs findings here.)*

## Run 2 — 2026-05-25: Task Decomposition Strategies

**Pattern:** [LLM subagent task decomposition](https://www.ai21.com/glossary/foundational-llm/task-decomposition/)

Key finding: AOrchestra paper (arXiv 2602.03786) proposes sub-agents as ⟨Instruction, Context, Tools, Model⟩ tuples — dynamic specialization per-task instead of static role assignment.

**Insight applied:**
- AOrchestra's 4-tuple abstraction → I should ensure each delegated subtask gets: (1) precise instruction, (2) only relevant context (no noise), (3) pinned toolset, (4) appropriate model.
- Current config: `max_iterations: 100`, `child_timeout_seconds: 1200`, `max_concurrent_children: 3`, `max_spawn_depth: 1`
- The single spawn depth is good for now — prevents runaway sub-agent chains. Could increase `max_concurrent_children` to 4 for parallel subtasks, but 3 is safe for current task complexity.
- Key improvement: structure instructions with (a) primary goal, (b) subtask breakdown, (c) explicit output contract — matching the AOrchestra tuple approach.
