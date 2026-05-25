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
