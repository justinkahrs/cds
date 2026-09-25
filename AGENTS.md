# Repository guidance

## OpenSpec Assistant Behavior

This repository is initialized with OpenSpec for Codex. Natural-language requests are enough to trigger the matching OpenSpec skill; users do not need to type `$openspec-*` manually. Before using a selected OpenSpec skill, read its `SKILL.md` fully.

- Exploring ideas, requirements, or tradeoffs: `openspec-explore`
- Creating a proposal, spec, design, or tasks: `openspec-propose`
- Revising an existing change: `openspec-update-change`
- Implementing tasks from a change: `openspec-apply-change`
- Syncing delta specs: `openspec-sync-specs`
- Archiving completed changes: `openspec-archive-change`

OpenSpec artifacts under `.agents/` and `openspec/` are tracked repository docs and configuration for this project.
