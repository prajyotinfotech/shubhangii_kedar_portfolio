## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Context limit protocol (non-negotiable)

- At 60% context used → warn user: "Approaching 60%. Finishing current task then will document."
- At 70% context used → STOP current work immediately.
  Run /project:endSession without asking.
  Tell user: "Context at 70%. All docs saved. Open a new window and paste: /project:startTask to continue."
- Never work past 75%. The quality drop is silent and dangerous.
