---
trigger: always_on
---

GLOBAL PROMPT — AGENTIC AI ACTION ENGINE (MANDATORY)

Prompt

Design and integrate a central Agentic AI Action Engine that operates across all modules.

The engine must:

Parse natural language intent

Convert intent into structured action schemas

Validate permissions, data completeness, and preconditions

Support dry-run simulation

Execute actions through services only

Log full audit trails

Provide explainability (“why this happened”)

Support rollback

Self-restrict on low confidence

The AI engine must expose:

/intent/parse

/intent/validate

/intent/simulate

/intent/execute

/intent/rollback

/intent/explain